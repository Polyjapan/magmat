import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateExternalLoanComponent } from './create-external-loan.component';

describe('CreateExternalLoanComponent', () => {
  let component: CreateExternalLoanComponent;
  let fixture: ComponentFixture<CreateExternalLoanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateExternalLoanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateExternalLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
