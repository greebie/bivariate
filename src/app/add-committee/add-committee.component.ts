import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import * as firebase from '@firebase/app';
import { Committee, Member, Present } from '../models/committee_models';
import { ReactiveFormsModule, FormsModule, FormGroup,FormControl,Validators,FormBuilder} from '@angular/forms';
import {ValidateGreaterThan } from './validation-controls';
import {AuthService} from '../services/auth.service';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-add-committee',
  templateUrl: './add-committee.component.html',
  styleUrls: ['./add-committee.component.css']
})

export class AddCommitteeComponent implements OnInit {
  user: Observable<firebase.User>;
  committeesInput: Committee;
  committeesRef: AngularFireList<Committee>;
  committees: Observable<Committee[]>;
  @Input() members: Member[] = [];
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
  @Input() currMember: Member;
  currCommittee: Committee;
  currCommitteeKey: string;

  constructor(public afAuth: AuthService, public db: AngularFireDatabase, public modal: NgbModal) {
    if (!afAuth.authState) { this.userid = 'guest' }
    else { this.userid = this.afAuth.authState.uid }
    this.committeesRef = db.list<Committee>( '/' + this.userid + '/committees')
    this.committees = this.committeesRef.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
    this.user = this.afAuth.authState;
    this.currMember = new Member("", "");
    this.currCommittee = new Committee("", "", new Date(), new Date(), "",
      "", [], "", "", "", "", "", [])

    this.memberForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      middleName: new FormControl(),
      party: new FormControl(),
      elected: new FormControl('', Validators.required),
      finished: new FormControl(),
      profession: new FormControl(),
      weight: new FormControl()
    })
    this.committeeForm = new FormGroup({
      key: new FormControl(),
      session: new FormControl(),
      date: new FormControl(),
      enddate: new FormControl(),
      partyInPower: new FormControl(),
      name: new FormControl(),
      abbreviation: new FormControl(),
      country: new FormControl(),
      jurisdiction: new FormControl(),
      description: new FormControl(),
      notes: new FormControl(),
      tags: new FormControl()
    })

  }

  ngOnInit() {
  }

  showModal(committeesModal) {
    this.modal.open(committeesModal).result.then((result) => {
      this.committeeForm.patchValue(this.currCommittee);
      this.members = this.currCommittee.membership;
    })
  }

  Save(desc: Committee) {
    this.currCommitteeKey ? this.Set(desc) : this.committeesRef.push(desc);
  }

  Set(desc: Committee) {
    let key = this.currCommitteeKey;
    this.committeesRef.set(key, desc);
  }

  addMemberForm() {
    let newMember = this.currMember === undefined || (this.currMember.firstName == "" && this.currMember.lastName == "");
    let firstName = this.memberForm.value.firstName;
    let lastName = this.memberForm.value.lastName;
    let middleName = this.memberForm.value.middleName;
    var member = new Member(this.memberForm.value.firstName, this.memberForm.value.lastName, this.memberForm.value.middleName,
      this.memberForm.value.party, this.memberForm.value.elected, this.memberForm.value.finished, this.memberForm.value.profession, null, this.memberForm.value.weight);

    var existsAlready = this.members.filter( x => x.firstName == firstName && x.lastName == lastName && x.middleName == middleName);
    if (this.memberForm.valid && !newMember) {
      this.memberDateInvalid, this.nameInvalid, this.existsAlready = false;
      this.removeMember(this.currMember);
      this.members.push(member);
      this.memberForm.reset();
      this.currMember = new Member("", "");
    }
    else if (this.memberForm.valid && newMember && existsAlready.length == 0) {
      this.memberDateInvalid, this.nameInvalid, this.existsAlready = false;
      this.members.push(member);
      this.memberForm.reset();
    } else {
      this.existsAlready = existsAlready.length > 0;
      this.memberDateInvalid = !(this.memberForm.value.enddate == null ||
        this.memberForm.value.finished > this.memberForm.value.elected);
      this.nameInvalid = [this.memberForm.get('firstName').errors,
        this.memberForm.get('lastName').errors,
        this.memberForm.get('middleName').errors].indexOf(null) == -1;
    }
  }

  isPresent(date: (Date | Present)) {
    return (<Present>date) ? (<Present>date).display : date;
  }

  addCommitteeForm() {
    let newCommittee = true;
    this.committees.subscribe( sub =>
      newCommittee = sub.filter (x => {
       return this.committeeForm.value.key == x.key }).length > 0
     );

    if (!newCommittee) {
      console.log(newCommittee);
    }
    else if (this.committeeForm.valid && this.members.length > 0) {
      let committee = new Committee(this.committeeForm.value.key, this.committeeForm.value.session,
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

  fillMemberForm(member:Member) {
    this.currMember = member;
    this.memberForm.reset();
    this.memberForm.patchValue(member);
  }

  removeMember (member:Member) {
    this.members = this.members.filter( x => {
      return !(x.displayName == member.displayName
        && x.firstName == member.firstName
        && x.lastName == member.lastName
        && x.middleName == member.middleName);
    }
    )
    console.log(this.members);
  }
}
