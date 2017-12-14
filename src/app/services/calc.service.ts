import { Injectable } from '@angular/core';
import * as num from 'numericjs';

@Injectable()
export class CalcService {
  /** Provides calculations of basic algorithms for analysis
  Currently alters a matrix and return Correspondence analysis
  Coordinates, but may do other things later. */

  /** singular value decomposition of normalized matrix **/
  svd: number [][]=[];
  // standard coordinates for rows and columns
  row_coords: number[]=[];
  col_coords: number[]=[];
  /** updated rownames (after REMOVESINGLES)**/
  rownames: string[];
  colnames: string[];
  /** eigenvalues for calculating dimensions **/
  dimensions: number[]=[];
  /** whether to remove items with only one link **/
  REMOVESINGLES: boolean = true;

  constructor() {
    this.REMOVESINGLES = true;
  }
  /** Conduct a correspondence analysis of matrix
  with rownames and column names **/
  ca (matrix:number[][], rownames:string[], colnames:string[]) {
    var response = true;
    if (!matrix) {
      response = false;
    }
    if (this.REMOVESINGLES) {
      this.rownames = rownames.filter((x, i) =>{
        if (matrix[i].reduce((a,b) => a + b, 0) > 1) {
        return x;
      }
      })
      matrix = matrix.filter(x =>
        {return x.reduce((a, b) => a + b, 0) > 1});
    }
    if (matrix.length < matrix[0].length) {
      matrix = num.transpose(matrix);
    }
    let P = num.div(matrix, num.sum(matrix));
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
