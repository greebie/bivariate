// Angular Staples
import { Component, OnInit, OnChanges, OnDestroy, Input,
  ElementRef, AfterViewInit, ChangeDetectorRef,
  NgZone } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup,
  FormControl,Validators,FormBuilder} from '@angular/forms';

//  Database / Firebase imports
import { AngularFireDatabase,
  AngularFireList } from 'angularfire2/database';
import { AngularFireAuth} from 'angularfire2/auth';
import * as firebase from '@firebase/app';

// ReactJS
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concat';

//Visualization libraries
import * as D3 from 'D3';
import { VennDiagram } from 'venn.js';

//Custom
import { Committee, Member,
  Present } from '../models/committee_models';
import {CalcService} from '../services/calc.service';
import {AuthService} from '../services/auth.service';
import {HandleState} from '../services/handle-state.service';


@Component({
  selector: 'app-visualise',
  templateUrl: './visualise.component.html',
  styleUrls: ['./visualise.component.css'],
})

export class VisualiseComponent implements OnInit, AfterViewInit {
  @Input() showPublicGroups: boolean = false;
  @Input() mbs: Member[];

  // Public and Private Committee Objects from db.
  public: Observable<Committee[]>;
  private: Observable<Committee[]>;
  userid: string;
  // Groupings.  Could be tags in future.
  sets: Observable<string[]>;
  psets: Observable<string[]>;
  // Groups selected from sets & psets
  @Input() session: Set<string> = new Set();
  @Input() psession: Set<string> = new Set();
  // Committees available to the the graph
  // (After groups are selected)
  state;
  committees: Observable<Committee[]>;
  members: Observable<Set<Member>>;
  // Total number of committees (columns)
  // and members (rows)
  totalCols: number;
  totalRows: number;
  // Data from the form produced by sets
  groupForm: FormGroup;

  rownames: Observable<Set<string>>;
  colnames: Observable<Set<string>>;
  matrix: Observable<number[][]>;
  authState: firebase.User;
  summary: string;
  memberList;
  dimensions;
  col_coordinates;
  row_coordinates;
  row_coords;
  col_coords;

  constructor(public auth: AngularFireAuth,
    public db: AngularFireDatabase,
    public calc: CalcService,
   private _hs: HandleState, private _ngZone: NgZone,
   private _cdRef: ChangeDetectorRef
 ) {
    this.db = db;
    this.groupForm = new FormGroup({
      session: new FormControl(),
      psession: new FormControl()
    })

    this.auth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  compareSession (a, b) {
    return a && b ? a === b : a === b;
  }

  ngOnInit() {
    this.userid = this.currentUserId;
    this.setUpSelects();
  }
  ngAfterViewInit () {

  }

  ngOnDestroy() {
  }

  setUpSelects() {
    this.public = this.db.list<Committee>('/guest/committees').valueChanges()
    this.private = this.db.list<Committee>(this.currentUserId + '/committees').valueChanges();
    this.psets = this.public
      .map(x => x.map(c => c.session)
      .filter((m, n, o) => o.indexOf(m) === n));
    this.sets = this.private
      .map(x => x.map(c => c.session)
      .filter((m, n, o) => o.indexOf(m) === n));
  }

  initGraph() {
    D3.selectAll("svg").remove();
    var w = 700;
    var h = 700;
    var svg = D3.select("#graph")
        .append("svg")
        .attr("width", w)
        .attr("height", h);
  }

  ngOnChanges(changes) {

  }

  get authenticated(): boolean {
    return this.authState !== null;
  }

  get currentUserId(): string {
    this.authenticated ? this.showPublicGroups = false : this.showPublicGroups = true;
    return this.authenticated ? this.authState.uid : '/guest';
  }

  addGroup() {
    if (this.groupForm.value.session) this.session.add (this.groupForm.value.session);
    if (this.groupForm.value.psession) this.psession.add (this.groupForm.value.psession);
    var committees = [];
    var pcommittees = [];
    this.private.subscribe( x => {
        committees = x.filter(z =>
          (this.session.has(z.session))
        )});
    this.public
          .subscribe( n => {
            pcommittees = n.filter(p =>
              (this.psession.has(p.session)));
        // TODO  Change this.committees to var committees
        // and make this.committees an Observable.
              this.committees = Observable.of(committees.concat(pcommittees));
          });
      this.initGraph();
    }

  addCommitteeToGraph(committee:Committee) {
    // probably get rid of this.
    /*committee.membership.forEach(x =>
      this.rownames.add(x.displayName)
    );
    this.colnames.add(committee.abbreviation)
    this.totalCols = this.colnames.count()
    this.totalRows = this.rownames.count() */
    // until here.
    try {
      var eventExists = this._hs.checkCommitteeInState(committee);
    }
    catch (e){
      console.log(e);
    }
  if (eventExists == false) {
    this._hs.addCommittee(committee);
    }
    else {
      this._hs.removeCommittee(committee);
    }
    this.state = this._hs.getCommitteeState();
    this.state.subscribe(x => {
      let setcols = new Set();
      x.map (y => setcols.add(y.abbreviation));
      this.colnames = Observable.of(setcols);
    });
    this.members = this.getCommitteeMemberNames();
    this.members.subscribe( x => {
      let setnames = new Set();
      x.forEach (y => {setnames.add( <string>y.displayName)});
      this.rownames = Observable.of(setnames);
    }
  );
  this.createMatrix();
  this.show_graph();
  }

  getCommitteeMemberNames (): Observable<Set<Member>> {
    var members: Set<Member> = new Set();
    this.state.subscribe(sub => {
      sub.map( y => {
        y.membership.map( z =>
      {members.add (z)})})});
    return Observable.of(members);
  }

  createMatrix() {
    var matrix = []
      this.rownames.subscribe( sub => sub.forEach((x) => {
        var z = [];
        this.state.subscribe(sub => sub
          .map(col => {
            var present = col.membership.map( member => member.displayName)
              .filter(y => y.indexOf(x) > -1);
            console.log(present)
            var isPresent = present.length == 0 ? 0 : 1;
            z.push(isPresent);
          }));
      matrix.push(z);})
    );
    console.log(matrix);
    this.matrix = Observable.of([...matrix]);
    try {
      this.calc.REMOVESINGLES = false;
      this.calc.ca(this.matrix, this.rownames, this.colnames);
    console.log(this.calc.REMOVESINGLES) }
    catch (Error) {
      this.calc.ca(this.matrix, this.rownames, this.colnames);
    }
  }

  createSet () {
    let membersArray = [].concat(this.members)
      .filter(function(n){ return n != undefined })
      .map(x => x.displayName);
    const membersSet = Observable.of(new Set(membersArray));
    //this.rownames = membersSet;
    return membersSet;
  }

  show_graph() {
    this.initGraph();

    var members = [];
    var colnames = [];
    this.colnames.subscribe(sub =>
      colnames = Array.from(sub)
    )
    this.state.subscribe (sub =>
      sub.forEach(comm => {
        var memberset = [];
        comm.membership.map( member =>
          memberset.push(member.displayName)
        )
        members.push(memberset);
      }
    ));
    if (!this.matrix){
    } else {
      this.createMatrix();
    }
    var s: number = this.calc.matrix != undefined ? this.calc.matrix[0].length : 0;
    switch(s) {
      case 0:
        D3.selectAll("svg").remove();
      var memberList = null;
      this.summary = `This demo produces either a Venn Diagram
        or a Correspondence Analysis based on the collections
        (on the left) and the urls they contain.
        Click on any of the filenames on the left to begin.`
    break;

    case 1:
      var memberList = members[0];
      D3.selectAll("svg").remove();
      this.summary = `The file you selected is ` + memberList[0] +
        `. It has ` + memberList.length + ` urls extracted (most used
          shown below).  Click one or two more collections to see a Venn
          Diagram. Click three more to see a Correspondence Analysis.`;
      //this.membersList.map(x=> this.summary.concat("<li>"+ x + "</li>"));
    break;

    case 2:
      this.summary = null;
      var memberList = null;
      D3.selectAll("svg").remove();
      var A = new Set(members[0]);
      var B = new Set(members[1]);
      let AB = new Set([...members[0]].filter(x => B.has(x)));
      var sets = [ {sets: [colnames[0]], size: A.size-AB.size},
         {sets: [colnames[1]], size: B.size-AB.size},
         {sets: [colnames[0], colnames[1]], size: AB.size}];
      var chart = VennDiagram()
        .width(700)
        .height(700);
      var venn2 = D3.select("#graph").datum(sets).call(chart);
      setTimeout(3000);
    break;

    case 3:
      this.summary = null;
      this.memberList = null;
      this._ngZone.runOutsideAngular(() => {

      D3.selectAll("svg").remove();
      var A = new Set(members[0]);
      var B = new Set(members[1]);
      var C = new Set(members[2]);
      let A_B_C = new Set([...members[0]]
        .filter(x=> B.has(x))
        .filter(y => C.has(y)))
      let A_B = new Set([...members[0]]
        .filter(x => B.has(x)));
      //  .filter(y => A_B_C.has(y)));
      let A_C = new Set([...members[0]]
        .filter( x=> C.has(x))
        .filter( y => !A_B_C.has(y)));
      let B_C = new Set([...members[1]]
        .filter( x=> C.has(x))
        .filter( y => !A_B_C.has(y)));
      let NOTASIZE = A_B.size + A_C.size - A_B_C.size;
      let NOTBSIZE = A_B.size + B_C.size - A_B_C.size;
      let NOTCSIZE = A_C.size + B_C.size - A_B_C.size;

      var sets = [ {sets: [colnames[0]], size: A.size},
       {sets: [colnames[1]], size: B.size},
       {sets: [colnames[2]], size: C.size},
       {sets: [colnames[0], colnames[1]], size: A_B.size},
       {sets: [colnames[1], colnames[2]], size: B_C.size},
       {sets: [colnames[0], colnames[2]], size: A_C.size},
       {sets: [colnames[0], colnames[1], colnames[2]], size: A_B_C.size}
      ].map(function(set) {
        set.size = Math.sqrt(set.size);
        return set;
      });
      var chart = VennDiagram()
        .width(600)
        .height(600);
      var venn3 = D3.select("#graph").datum(sets).call(chart);
      setTimeout(3000);});
    break;

    default:
      this.summary = null;
      this.memberList = null;
      //console.log(this.matrix);
      //TO DO: USE A PROMISE TO GET RESULTS, to avoid error.

      var row_coords = this.calc.row_coords;
      var col_coords = this.calc.col_coords;
      var dimensions = this.calc.dimensions;

      this.row_coordinates = row_coords.map((x,i) => {
        return [x[0], x[1], this.calc.rownames[i]] //Todo - rownames must correspond to MatrixR;
      });

      this.col_coordinates = col_coords.map((x, i) => {
        return [x[0], x[1], this.calc.colnames[i]];
      });

      this.dimensions = dimensions.map(x => {
        return this.roundTo(x*100, 2);
      });

      if (this.row_coordinates && this.col_coordinates) {
        this.createGraph();
      }
 }}

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
    D3.selectAll("svg").remove();
    var rowcol = this.row_coordinates.concat(this.col_coordinates);
    var w = 700;
    var h = 700;
    var svg = D3.select("#graph")
        .append("svg")
        .attr("width", w)
        .attr("height", h);
    var paddingy =  (D3.max(rowcol, function(d) { return d[1]; }) - D3.min(rowcol, function(d) { return d[1]; })) * 0.1;
    var paddingx =  (D3.max(rowcol, function(d) { return d[0]; }) - D3.min(rowcol, function(d) { return d[0]; })) * 0.1;

    var xScale = D3.scaleLinear()
          .domain([D3.min(rowcol, function(d) { return d[0]; }) - paddingx, D3.max(rowcol, function(d) { return d[0]; }) + paddingx])
          .range([0, w]);

    var yScale = D3.scaleLinear()
          .domain([D3.min(rowcol, function(d) { return d[1]; }) - paddingy, D3.max(rowcol, function(d) { return d[1]; }) + paddingy])
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
      .attr('x1', xScale(D3.min(rowcol, function(d) { return d[0]; })))
      .attr('x2', xScale(D3.max(rowcol, function(d) { return d[0]; })))
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("stroke-dasharray", "5,5");

    var yline = svg.append("line")
      .attr('y1', yScale(D3.min(rowcol, function(d) { return d[1]; })))
      .attr('y2', yScale(D3.max(rowcol, function(d) { return d[1]; })))
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

    var tooltip = D3.select("body")
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
        D3.select(this)
          .attr("r", 10)
          .style("fill", "rgb(1, 1, 255)")
          .style("opacity", 0.7);
        return tooltip.style("visibility", "visible")
          .text(datum[2])
      })
      .on("mousemove", function(){
        return tooltip.style("top",
           (D3.event.pageY-15)+"px").style("left",(D3.event.pageX+15)+"px");
         })
      .on("mouseout", function(datum) {
        D3.select(this)
          .attr("r", 4)
          .style("fill", "rgb(1, 1, 255)")
          .style("opacity", 0.1);
        return tooltip.style("visibility", "hidden");
      });


    var xAxis = D3.axisBottom()
      .scale(xScale);

    var yAxis = D3.axisRight()
      .scale(yScale);

    var xAxisGroup = svg.append("g")
      .attr("class", "axis")
      .call(xAxis);

    var yAxisGroup = svg.append("g")
        .attr("class", "axis")
        .call(yAxis);
}

}
