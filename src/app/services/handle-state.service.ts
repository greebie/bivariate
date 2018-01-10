import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Committee, Member} from '../models/committee_models';

import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Rx';
import {AppState} from '../models/appState';
import { committeesReducer } from '../_reducers/reducer';


@Injectable()
export class HandleState {
  public committeesState: any;
  State: Observable<Committee[]>;
  public status: any;
  value: any;


  constructor(private http: Http, private store: Store<AppState>) {
  }

  getCommitteeState (): Observable<Committee[]> {
    return this.store.select('committees');
  }

  // checks for a filename in the current state and returns false
  // if it is not.
  checkCommitteeInState(committee:Committee): Boolean {
    var tested: Boolean = false;
    this.getCommitteeState().subscribe( (x) => {
      tested = x.filter( y => y.name === committee.name).length > 0;
    });
    return tested;
  }

  addCommittee (committee:Committee): void {
    return this.store.dispatch({type: "ADD_COMMITTEE", payload: committee});
  }

  removeCommittee (committee: Committee): void {
    return this.store.dispatch({type: "REMOVE_COMMITTEE", payload: committee});
  }

  updateCommitteeMembers ({committeename, members}): void {
    return this.store.dispatch({type: "UPDATE_COMMITTEE_MEMBERS", payload: {committeename, members}});
  }

  getJSONurl () {
    //this.http.get(this.filePath)
      //.map(res => res.json())
      //.subscribe(files => this.collectionList = files);
  }
}
