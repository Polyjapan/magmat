import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExternalLoanComponent } from './view-external-loan.component';

describe('ViewExternalLoanComponent', () => {
  let component: ViewExternalLoanComponent;
  let fixture: ComponentFixture<ViewExternalLoanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewExternalLoanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewExternalLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
