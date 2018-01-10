import { Injectable } from '@angular/core';
import * as num from 'numericjs';
import * as jStat from 'jstat';
import {Observable} from 'rxjs/Rx';
import * as chi from 'chi-squared-test';

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
  normalized: number [][];
  rownames: string[];
  colnames: string[];
  // filtered to remove singles.
  filt_rownames: string[];
  filt_matrix: number[][];
  /** eigenvalues for calculating dimensions **/
  dimensions: number[]=[];
  /** expected values matrix for Pearson chi-square test **/
  observed: number[][];
  expected: number [][];
  residualSS: number [][];
  chisquaredVal: number;
  /** whether to remove items with only one link **/
  REMOVESINGLES: boolean = true;

  constructor() {
    this.REMOVESINGLES = true;
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
      this.rownames = this.rownames.filter((x, i) =>{
        if (this.matrix[i].reduce((a,b) => a + b, 0) > 1) {
        return x;
      }
      })
      this.matrix = this.matrix.filter(x =>
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
    let Res = num.sub(this.matrix, E)
    this.residualSS = num.div(num.exp(Res, 2), E);
    this.chisquaredVal = num.sum(this.residualSS);
    let Z = num.mul(I, num.sqrt(E));
    let EXP = num.div(E, num.sum(this.matrix));
    let SVD = num.svd(Z);
    this.observed = Z;
    this.expected = EXP;
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

  chisquared() {
    var dof = ((this.matrix.length-1) * (this.matrix[0].length-1));
    return {chiSquared: this.chisquaredVal, probability: jStat.jStat.chisquare.pdf(this.chisquaredVal, dof), dof: dof};
  }
}
