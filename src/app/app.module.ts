
// Fundamental Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HttpModule} from '@angular/http';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { CollapseModule } from 'ngx-bootstrap/collapse';

// Services
import { CalcService } from './services/calc.service';
import { AuthService } from './services/auth.service';

 // Environment
import { environment } from '../environments/environment';


// Components
import { AppComponent } from './app.component';
import { IntroComponent } from './intro/intro.component';
import { AddCommitteeComponent } from './add-committee/add-committee.component';
import { VisualiseComponent } from './visualise/visualise.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CaGraphComponent } from './ca-graph/ca-graph.component';



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
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    AddCommitteeComponent,
    VisualiseComponent,
    PageNotFoundComponent,
    IntroComponent,
    CaGraphComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    CollapseModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AngularFireModule.initializeApp(environment.firebase, 'Bivariate'),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [CalcService, AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
