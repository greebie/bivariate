import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Committee, Member} from '../models/committee_models';

import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {AppState} from '../models/appState';
import { committeesReducer } from '../_reducers/reducer';


@Injectable()
export class GenerateAutDataService {
  private filePath;
  public collectionsState: any;
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
  checkCollectionInState(archive:Committee): Boolean {
    var tested: Boolean = false;
    let test = this.getCommitteeState().subscribe( (x) => {
      if (x.length > 0 ){
      for (var i=0; i < x.length; i++ ) {
        if (x[i].name === archive.name) {
          tested = true;
        }
      }
      }
      else {
      }
    });
    return tested;
  }

  addCommittee (archive:Committee): void {
    return this.store.dispatch({type: "ADD_COLLECTION", payload: archive});
  }

  removeCommittee (archive: Committee): void {
    return this.store.dispatch({type: "REMOVE_COLLECTION", payload: archive});
  }

  updateCommitteeMemberss ({filename, links}): void {
    return this.store.dispatch({type: "UPDATE_COLLECTION_LINKS", payload: {filename, links}});
  }

  getJSONurl () {
    //this.http.get(this.filePath)
      //.map(res => res.json())
      //.subscribe(files => this.collectionList = files);
  }
}
