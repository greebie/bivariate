
// Fundamental Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { StoreModule } from '@ngrx/store';

// Services
import { CalcService } from './services/calc.service';
import { AuthService } from './services/auth.service';
import { HandleState } from './services/handle-state.service';

// _reducers

import {committeesReducer} from './_reducers/reducer';

 // Environment
import { environment } from '../environments/environment';


// Components
import { AppComponent } from './app.component';
import { IntroComponent } from './intro/intro.component';
import { AddCommitteeComponent } from './add-committee/add-committee.component';
import { VisualiseComponent } from './visualise/visualise.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ExplanationComponent } from './explanation/explanation.component';

//Material

//bootstrap
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

// Angular Fire (Database etc.)
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

const appRoutes: Routes = [
  { path: '', redirectTo: '/intro',
    pathMatch: 'full'},
  { path: 'intro', component: IntroComponent},
  { path: 'add', component: AddCommitteeComponent },
  { path: 'visualise', component: VisualiseComponent },
  { path: 'about', component: ExplanationComponent},
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    AddCommitteeComponent,
    VisualiseComponent,
    PageNotFoundComponent,
    IntroComponent,
    ExplanationComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    NgbModule.forRoot(),
    StoreModule.forRoot({committees: committeesReducer} ),
    CollapseModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AngularFireModule.initializeApp(environment.firebase, 'Bivariate'),
    AngularFireDatabaseModule,
    AngularFireAuthModule,

  ],
  providers: [CalcService, AuthService, HandleState],
  bootstrap: [AppComponent]
})
export class AppModule { }
