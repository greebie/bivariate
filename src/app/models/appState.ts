import { Committee } from './committee_models';

export interface AppState {
  readonly committees: Committee[];
}
