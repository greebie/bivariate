import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaGraphComponent } from './ca-graph.component';

describe('CaGraphComponent', () => {
  let component: CaGraphComponent;
  let fixture: ComponentFixture<CaGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
