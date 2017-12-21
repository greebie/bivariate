import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth} from 'angularfire2/auth';
import { Observable } from 'rxjs/Rx';
import * as firebase from '@firebase/app';
import { Committee, Member, Present } from '../models/committee_models';
import { ReactiveFormsModule, FormsModule, FormGroup,FormControl,Validators,FormBuilder} from '@angular/forms';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concat';
import * as D3 from 'd3';
import {CalcService} from '../services/calc.service';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-visualise',
  templateUrl: './visualise.component.html',
  styleUrls: ['./visualise.component.css']
})
export class VisualiseComponent implements OnInit {
  showPublicGroups: boolean = false;
  public: Observable<Committee[]>;
  private;
  userid;
  sets:Observable<string[]>;
  psets: Observable<string[]>;
  committees:Observable<Committee[]>;
  pcommittees:Observable<Committee[]>;;
  members: string[];
  groupForm: FormGroup;
  @Input()
  session: Set<string> = new Set();
  psession: Set<string> = new Set();
  selectedSession;
  CA;
  rownames;
  colnames;
  matrix;
  authState;

  constructor(public auth: AngularFireAuth,
    public db: AngularFireDatabase,
    public calc: CalcService) {
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

  setUpSelects() {
    this.public = this.db.list<Committee>('/guest/committees').valueChanges()
    this.private = this.db.list<Committee>(this.currentUserId + '/committees').valueChanges();
    console.log(this.private);
    this.psets = this.public
      .map(x => x.map(c => c.session)
      .filter((m, n, o) => o.indexOf(m) === n));
    this.sets = this.private
      .map(x => x.map(c => c.session)
      .filter((m, n, o) => o.indexOf(m) === n));
    console.log(this.sets);
  }

  ngOnChanges(changes) {

  }

  get authenticated(): boolean {
    return this.auth.authState !== null;
  }

  get currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }

  addGroup() {
    this.psession.add (this.groupForm.value.psession);
    this.session.add(this.groupForm.value.session);
    // check for authenticated user first
    // create two different lists - one for public, one for private.
    // use ngIf to hide non-public stuff.

    this.pcommittees = this.public
      .map(x => x.filter(z => this.session.has(z.session)));
    this.committees =  this.private
      .map(x => x.filter(z => this.session.has(z.session)));
    }

  createMatrix() {
  var matrix = []
    this.rownames.map(x => {
      var z = [];
      for (var i=0; i < this.members.length; i++){
        let num = 0;
        if (this.members[i].indexOf(x) != -1){
          num = 1;
        }
        z.push(num);
      }
      matrix.push(z);
    });
    this.matrix = [...matrix];
  }

}
