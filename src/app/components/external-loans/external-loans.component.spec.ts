import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalLoansComponent } from './external-loans.component';

describe('ExternalLoansComponent', () => {
  let component: ExternalLoansComponent;
  let fixture: ComponentFixture<ExternalLoansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalLoansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalLoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
