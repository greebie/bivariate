import { ChangeDetectorRef, NgZone, Component, Input, OnInit, Output, AfterViewInit, AfterContentChecked } from '@angular/core';
import * as d3 from 'd3';
import { HandleState } from '../services/handle-state.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { VennDiagram } from 'venn.js';
import { CalcService } from '../services/calc.service';

@Component({
  selector: 'app-ca-graph',
  templateUrl: './ca-graph.component.html',
  styleUrls: ['./ca-graph.component.css']
})

export class CaGraphComponent implements OnInit, AfterViewInit, AfterContentChecked{

  collectionPath: string = '../../assets/data/LINKS/';
  filename: string;
  response: any;
  rownames: any;
  colnames: string[];
  matrix: number[][]=[];
  matrixR: any;
  matrixT: any;
  matrix_total: number;
  row_totals: number[];
  row_coordinates;
  col_coordinates;
  col_totals: number[];
  result: number[][];
  column_results: number[];
  row_results: number[];
  dimensions: number[];
  hello: string;
  fileNames: string[]=[];
  links: string[][];
  linksList: string[];
  note: string;
  linksSet: Set<{}>;
  calc:CalcService;
  summary:string;

  @Input() fileCount: number = 0;

  constructor (
    private _autDataService:HandleState,
    private _cdRef:ChangeDetectorRef,
    private _ngZone: NgZone,
    calc: CalcService,
  ) // todo: create default col_names
      {
    this.calc = calc;
  }

  ngOnInit() {
    //this.response = this.getCollection(this.collectionPath, this.filename);
    this.extractFileNamesFromState ();
  }

  ngAfterViewChecked () {

  }

  ngAfterContentChecked () {
    this.linksSet = this.createSet()
    if (!this.matrix){
    } else {
      this.createMatrix();
    }
    switch(this.fileNames.length) {
      case 0:
        d3.selectAll("svg").remove();
        this.linksList = null;
        this.summary = "This demo produces either a Venn Diagram or a Correspondence \
                       Analysis based on the collections (on the left) and the urls they contain. \
                       Click on any of the filenames on the left to begin."
      break;

      case 1:
        this.linksList = this.links[0];
        d3.selectAll("svg").remove();
        this.summary = "The file you selected is " + this.fileNames[0] + ". It has "
          + this.linksList.length + " urls extracted (most used shown below).  Click one or two more collections \
           to see a Venn Diagram. Click three more to see a Correspondence Analysis.";
        //this.linksList.map(x=> this.summary.concat("<li>"+ x + "</li>"));
      break;

      case 2:
        this.summary = null;
        this.linksList = null;
        d3.selectAll("svg").remove();
        var A = new Set(this.links[0]);
        var B = new Set(this.links[1]);
        let AB = new Set([...this.links[0]].filter(x => B.has(x)));
        var sets = [ {sets: [this.colnames[0]], size: A.size-AB.size},
           {sets: [this.colnames[1]], size: B.size-AB.size},
           {sets: [this.colnames[0], this.colnames[1]], size: AB.size}];
        var chart = VennDiagram()
          .width(700)
          .height(700);
        var venn2 = d3.select("#graph").datum(sets).call(chart);
        setTimeout(3000);
      break;

      case 3:
        this.summary = null;
        this.linksList = null;
        this._ngZone.runOutsideAngular(() => {

        d3.selectAll("svg").remove();
        var A = new Set(this.links[0]);
        var B = new Set(this.links[1]);
        var C = new Set(this.links[2]);
        let A_B_C = new Set([...this.links[0]]
          .filter(x=> B.has(x))
          .filter(y => C.has(y)))
        let A_B = new Set([...this.links[0]]
          .filter(x => B.has(x)));
        //  .filter(y => A_B_C.has(y)));
        let A_C = new Set([...this.links[0]]
          .filter( x=> C.has(x))
          .filter( y => !A_B_C.has(y)));
        let B_C = new Set([...this.links[1]]
          .filter( x=> C.has(x))
          .filter( y => !A_B_C.has(y)));
        let NOTASIZE = A_B.size + A_C.size - A_B_C.size;
        let NOTBSIZE = A_B.size + B_C.size - A_B_C.size;
        let NOTCSIZE = A_C.size + B_C.size - A_B_C.size;

        var sets = [ {sets: [this.colnames[0]], size: A.size},
         {sets: [this.colnames[1]], size: B.size},
         {sets: [this.colnames[2]], size: C.size},
         {sets: [this.colnames[0], this.colnames[1]], size: A_B.size},
         {sets: [this.colnames[1], this.colnames[2]], size: B_C.size},
         {sets: [this.colnames[0], this.colnames[2]], size: A_C.size},
         {sets: [this.colnames[0], this.colnames[1], this.colnames[2]], size: A_B_C.size}
        ].map(function(set) {
          set.size = Math.sqrt(set.size);
          return set;
        });
        var chart = VennDiagram()
          .width(600)
          .height(600);
        var venn3 = d3.select("#graph").datum(sets).call(chart);
        setTimeout(3000);});
      break;

      default:
        this.summary = null;
        this.linksList = null;
        //console.log(this.matrix);
        //TO DO: USE A PROMISE TO GET RESULTS, to avoid error.
        this.calc.ca(this.matrix, this.rownames, this.colnames);

        var row_coords = this.calc.row_coords;
        var col_coords = this.calc.col_coords;
        var dimensions = this.calc.dimensions;

        this.row_coordinates = row_coords.map((x,i) => {
          return [x[0], x[1], this.calc.rownames[i]] //Todo - rownames must correspond to MatrixR;
        });

        this.col_coordinates = col_coords.map((x, i) => {
          return [x[0], x[1], this.colnames[i]];
        });

        this.dimensions = dimensions.map(x => {
          return this.roundTo(x*100, 2);
        });

        if (this.row_coordinates && this.col_coordinates) {
          this.createGraph();
        }
   }}

  ngAfterViewInit () {

  }

  roundTo(n, digits) {
     if (digits === undefined) {
       digits = 0;
     }

     var multiplicator = Math.pow(10, digits);
     n = parseFloat((n * multiplicator).toFixed(11));
     var test =(Math.round(n) / multiplicator);
     return +(test.toFixed(digits));
   }

  createGraph() {
    d3.selectAll("svg").remove();
    var rowcol = this.row_coordinates.concat(this.col_coordinates);
    var w = 700;
    var h = 700;
    var svg = d3.select("#graph")
        .append("svg")
        .attr("width", w)
        .attr("height", h);
    var paddingy =  (d3.max(rowcol, function(d) { return d[1]; }) - d3.min(rowcol, function(d) { return d[1]; })) * 0.1;
    var paddingx =  (d3.max(rowcol, function(d) { return d[0]; }) - d3.min(rowcol, function(d) { return d[0]; })) * 0.1;

    var xScale = d3.scaleLinear()
          .domain([d3.min(rowcol, function(d) { return d[0]; }) - paddingx, d3.max(rowcol, function(d) { return d[0]; }) + paddingx])
          .range([0, w]);

    var yScale = d3.scaleLinear()
          .domain([d3.min(rowcol, function(d) { return d[1]; }) - paddingy, d3.max(rowcol, function(d) { return d[1]; }) + paddingy])
          .range([0, h]);

    var nodecol = svg.selectAll("circle")
      .attr("class", "row")
      .data(this.col_coordinates)
      .enter()
      .append("circle")
      .attr("class", "column")
      .attr("cx", function(d) { return xScale(d[0]); })
      .attr("cy", function(d) { return yScale(d[1]); })
      .attr("r", 5)
      .style("fill", "rgb(255, 1, 1)")
      .style("opacity", 0.9);

    var xline = svg.append("line")
      .attr('x1', xScale(d3.min(rowcol, function(d) { return d[0]; })))
      .attr('x2', xScale(d3.max(rowcol, function(d) { return d[0]; })))
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("stroke-dasharray", "5,5");

    var yline = svg.append("line")
      .attr('y1', yScale(d3.min(rowcol, function(d) { return d[1]; })))
      .attr('y2', yScale(d3.max(rowcol, function(d) { return d[1]; })))
      .attr('x1', xScale(0))
      .attr('x2', xScale(0))
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("stroke-dasharray", "5,5");

    var yAxisLabel = svg.append("g")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 25)
      .attr("x", 0 - (h / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Dimension 2 (" + this.dimensions[1] + "%)");

    var xAxisLabel = svg.append("g")
      .append("text")
      .attr("x", 0+ (w / 2))
      .attr("y", 25)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Dimension 1 (" + this.dimensions[0] + "%)");


    var coltext = svg.append("g")
          .selectAll("text")
          .append("text")
          .data(this.col_coordinates)
          .enter()
          .append("text")
          .attr("x", function(d) { return xScale(d[0]) - paddingx/2; })
          .attr("y", function(d) { return yScale(d[1]- paddingy/2); })
          .style("stroke-width", 0)
          .style("fill", "rgb(255, 1, 1)")
          .style("opacity", 0.8)
          .text(function (d) { return d[2];});

    var tooltip = d3.select("body")
          .append("div")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "hidden")
          .text("a simple tooltip");

    var noderow = svg.selectAll("circle")
      .data(this.row_coordinates)
      .enter()
      .append("circle")
      .attr("class", "row")
      .attr("cx", function (q) { return xScale(q[0]); })
      .attr("cy", function (q) {return yScale(q[1]); })
      .attr("r", 4)
      .attr("id", function (q,i) {return i})
      .style("fill", "rgb(1, 1, 255)")
      .style("opacity", 0.1)
      .on("mouseover", function(datum) {
        d3.select(this)
          .attr("r", 10)
          .style("fill", "rgb(1, 1, 255)")
          .style("opacity", 0.7);
        return tooltip.style("visibility", "visible")
          .text(datum[2])
      })
      .on("mousemove", function(){
        return tooltip.style("top",
           (d3.event.pageY-15)+"px").style("left",(d3.event.pageX+15)+"px");
         })
      .on("mouseout", function(datum) {
        d3.select(this)
          .attr("r", 4)
          .style("fill", "rgb(1, 1, 255)")
          .style("opacity", 0.1);
        return tooltip.style("visibility", "hidden");
      });


    var xAxis = d3.axisBottom()
      .scale(xScale);

    var yAxis = d3.axisRight()
      .scale(yScale);

    var xAxisGroup = svg.append("g")
      .attr("class", "axis")
      .call(xAxis);

    var yAxisGroup = svg.append("g")
        .attr("class", "axis")
        .call(yAxis);
}


  @Input()
  extractFileNamesFromState () {
    let state = this._autDataService.getCommitteeState();
    let size: number;
    state.subscribe ( x => {
      this.fileNames = x.map( y =>
        {return y.name});
      this.fileCount = size;
      this.colnames = x.map( r => {
        return r.session;
      });
      let members = x.map ( r => {
        return r.membership;
      });
    });
  }

  createSet () {
    let linksArray = [].concat.apply([], this.links)
      .filter(function(n){ return n != undefined });
    const linksSet = new Set(linksArray);
    this.rownames = Array.from(linksSet)
    return linksSet;
  }

  createMatrix() {
  var matrix = []
    this.rownames.map(x => {
      var z = [];
      for (var i=0; i < this.links.length; i++){
        let num = 0;
        if (this.links[i].indexOf(x) != -1){
          num = 1;
        }
        z.push(num);
      }
      matrix.push(z);
    });
    this.matrix = [...matrix];
  }


  clearText (text:any) {
    text.replace(/(\( | \))/g, '');
  }

}
