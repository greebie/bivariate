import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import * as firebase from '@firebase/app';
import { Committee, Member, Present } from '../models/committee_models';
import { ReactiveFormsModule, FormsModule, FormGroup,FormControl,Validators,FormBuilder} from '@angular/forms';
import {ValidateGreaterThan } from './validation-controls';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-add-committee',
  templateUrl: './add-committee.component.html',
  styleUrls: ['./add-committee.component.css']
})
export class AddCommitteeComponent implements OnInit {
  user: Observable<firebase.User>;
  committeesInput: Committee;
  committeesRef: AngularFireList<Committee>
  members: Member[] = [];
  membersExist = false;
  memberForm: FormGroup;
  committeeForm: FormGroup;
  committeeCollapse: Boolean = true;
  committeeDateInvalid: Boolean = false;
  memberCollapse: Boolean = true;
  nameInvalid:Boolean = false;
  memberDateInvalid:Boolean = false;
  existsAlready: Boolean = false;
  endDate: any;
  userid: string;

  constructor(public afAuth: AuthService, public db: AngularFireDatabase) {
    if (!afAuth.authState) { this.userid = 'guest' }
    else { this.userid = this.afAuth.authState.uid }
    this.committeesRef = db.list<Committee>( '/' + this.userid + '/committees')
    // this.committees = this.committeesRef.valueChanges();
    this.user = this.afAuth.authState;

    this.memberForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      middleName: new FormControl('', Validators.required),
      party: new FormControl(),
      date: new FormControl('', Validators.required),
      enddate: new FormControl(),
      profession: new FormControl()
    })
    this.committeeForm = new FormGroup({
      session: new FormControl(),
      date: new FormControl(),
      enddate: new FormControl(),
      partyInPower: new FormControl(),
      name: new FormControl(),
      abbreviation: new FormControl(),
      country: new FormControl(),
      jurisdiction: new FormControl(),
      description: new FormControl(),
      notes: new FormControl()
    })

  }

  ngOnInit() {
  }

  Save(desc: Committee) {
    this.committeesRef.push(desc);
  }

  addMemberForm() {
    let firstName = this.memberForm.value.firstName;
    let lastName = this.memberForm.value.lastName;
    let middleName = this.memberForm.value.middleName;
    var member = new Member(this.memberForm.value.firstName, this.memberForm.value.lastName, this.memberForm.value.middleName,
      this.memberForm.value.party, this.memberForm.value.date, this.memberForm.value.enddate, this.memberForm.value.profession, null);
    var existsAlready = this.members.filter( x => x.firstName == firstName && x.lastName == lastName && x.middleName == middleName);
    if (this.memberForm.valid && existsAlready.length == 0) {
      this.memberDateInvalid, this.nameInvalid, this.existsAlready = false;
      this.members.push(member);
      this.memberForm.reset();
    } else {
      this.existsAlready = existsAlready.length > 0;
      this.memberDateInvalid = !(this.memberForm.value.enddate == null ||
        this.memberForm.value.enddate > this.memberForm.value.date);
      this.nameInvalid = [this.memberForm.get('firstName').errors,
        this.memberForm.get('lastName').errors,
        this.memberForm.get('middleName').errors].indexOf(null) == -1;
    }
  }

  addCommitteeForm() {
    if (this.committeeForm.valid && this.members.length > 0) {
      let committee = new Committee(this.committeeForm.value.session,
        this.committeeForm.value.date, this.committeeForm.value.enddate,
        this.committeeForm.value.name, this.committeeForm.value.abbreviation, this.members,
      this.committeeForm.value.partyInPower, this.committeeForm.value.country,
      this.committeeForm.value.jurisdiction, this.committeeForm.value.description,
      this.committeeForm.value.notes);
      Object.keys(committee).map(function(key, index) {
        if (typeof committee[key] == 'undefined') committee[key] = null;
      });
      this.Save(committee);
      this.members = [];
      this.memberForm.reset();
      this.committeeForm.reset();
    } else {
      this.membersExist = this.members.length > 0;
      this.committeeDateInvalid = !(this.committeeForm.value.enddate == null ||
        this.committeeForm.value.enddate > this.committeeForm.value.date);

    }

  }
}
