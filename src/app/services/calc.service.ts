import { Injectable } from '@angular/core';
import * as num from 'numericjs';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class CalcService {
  /** Provides calculations of basic algorithms for analysis
  Currently alters a matrix and return Correspondence analysis
  Coordinates, but may do other things later. */

  /** singular value decomposition of normalized matrix **/
  cvg: Boolean = false;
  svd: number [][]=[];
  // standard coordinates for rows and columns
  row_coords: number[]=[];
  col_coords: number[]=[];
  /** updated rownames (after REMOVESINGLES)**/
  matrix: number [][];
  rownames: string[];
  colnames: string[];
  /** eigenvalues for calculating dimensions **/
  dimensions: number[]=[];
  /** whether to remove items with only one link **/
  REMOVESINGLES: boolean = true;

  constructor() {
  }
  /** Conduct a correspondence analysis of matrix
  with rownames and column names **/
  ca (matrix:Observable<number[][]>, rownames:Observable<Set<string>>, colnames:Observable<Set<string>>) {
    var response = true;
    if (!matrix) {
      response = false;
    }
    matrix.subscribe (sub =>
      this.matrix = sub.map( x=> x)
    );
    rownames.subscribe (sub =>
      this.rownames = Array.from(sub).map( x => x)
    );
    colnames.subscribe (sub =>
      this.colnames = Array.from(sub).map(x => x)
    )
    if (this.REMOVESINGLES) {
      this.rownames = this.rownames
          .filter((y, i) =>{
        if (this.matrix[i].reduce((a,b) => a + b, 0) > 1) {
        return y;
      }
    });
      this.matrix.filter(x =>
        {return x.reduce((a, b) => a + b, 0) > 1});
    }
    if (this.matrix.length < this.matrix[0].length) {
      this.matrix = num.transpose(this.matrix);
    }
    let P = num.div(this.matrix, num.sum(this.matrix));
    let mass_columns = num.add.apply(this, P);
    let mass_rows = num.add.apply(this, num.transpose(P));
    let E = mass_rows.map(x => {
      var mass_columns_copy = [];
      for (var y=0; y<mass_columns.length; y++) {
        mass_columns_copy[y] = mass_columns[y]*x;
      }
      return mass_columns_copy;
    })
    let R = num.sub(P,E);
    let I = num.div(R,E);
    let Z = num.mul(I, num.sqrt(E));
    let SVD = num.svd(Z);
    this.svd = SVD;
    this.cvg = true;
    this.row_coords = SVD['U'].map( x=> {
        return num.div(x, num.sqrt(mass_rows));
      });
    this.col_coords = SVD['V'].map( x=> {
        return num.div(x, num.sqrt(mass_columns));
      });
    this.dimensions = num.div(SVD['S'], num.sum(SVD['S']));
      return response;
  }
}
