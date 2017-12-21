import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService} from './services/auth.service';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import { Committee } from './models/committee_models';
import { Router } from "@angular/router";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Bivariate Analysis';
  user: Observable<firebase.User>;
  items: AngularFireList<any[]>;
  msgVal: string = '';
  authState: any = null;

  constructor(private afAuth: AngularFireAuth,
              private auth: AuthService,
              private db: AngularFireDatabase){
      this.user = afAuth.authState;
      this.auth.storeUser(this.user);

  }

  login() {
  this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

}
logout() {
  this.afAuth.auth.signOut();
}
}
