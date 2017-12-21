// addFile to dataSet
// removeFile from dataSet
// serverFiles
// clientFiles
import { Action } from '@ngrx/store';
import { Committee } from '../models/committee_models';
import { AppState } from '../models/appState';

export const ADD_COMMITTEE = 'ADD_COMMITTEE';
export const REMOVE_COMMITTEE = 'REMOVE_COMMITTEE';
export const UPDATE_COMMITTEE_MEMBERS = 'UPDATE_COMMITTEE_MEMBERS';
export const INITIAL_STATE = [];

export function committeesReducer (state = [] as Committee[], {type, payload}) {
  switch (type) {
    case 'ADD_COMMITTEE':
      return [...state, payload];
    case 'REMOVE_COMMITTEE':
      return state.filter (function (item) {
        return item.name !== payload.name
      }).slice();
    case 'UPDATE_COMMITTEE_MEMBERS':
      return state.map (function (committee) {
        if (committee.name == payload.name) {
          committee.membership = payload.membership;
        }
        return committee;
      }).slice();

    default:
      return state;
    }
}

export const committees = (state: AppState) => state.committees;
