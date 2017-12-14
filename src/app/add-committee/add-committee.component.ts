import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth} from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from '@firebase/app';
import { Committee, Member } from '../models/committee_models';
import { ReactiveFormsModule, FormsModule, FormGroup,FormControl,Validators,FormBuilder
} from '@angular/forms';

@Component({
  selector: 'app-add-committee',
  templateUrl: './add-committee.component.html',
  styleUrls: ['./add-committee.component.css']
})
export class AddCommitteeComponent implements OnInit {
  user: Observable<firebase.User>;
  committees: Observable<Committee[]>;
  committeesRef: AngularFireList<Committee>
  members: Member[] = [];
  memberForm: FormGroup;
  committeeForm: FormGroup;

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase) {
    this.committeesRef = db.list<Committee>('/committees')
    this.committees = this.committeesRef.valueChanges();
    this.user = this.afAuth.authState;
    this.memberForm = new FormGroup({
      firstName: new FormControl(),
      lastName: new FormControl(),
      middleName: new FormControl(),
      party: new FormControl(),
      date: new FormControl(),
      enddate: new FormControl(),
    })
    this.committeeForm = new FormGroup({
      date: new FormControl(),
      partyInPower: new FormControl(),
      name: new FormControl(),
      abbreviation: new FormControl(),
      country: new FormControl(),
      description: new FormControl(),
      notes: new FormControl()
    })
  }

  ngOnInit() {
  }

  login() {
    this.afAuth.auth.signInAnonymously();
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  Save(desc: Committee) {
    this.committeesRef.push(desc);
  }

  addMemberForm(first, last, middle?, party?, date?) {
    this.members.push(new Member(first, last, middle, party, date));
    this.memberForm.reset()
    // check if current memberform entry is valid
    // insert current member into memberlist
    // clear the membership form
    // append membernote above form
  }

}
