import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectLoanComponent } from './select-loan.component';

describe('SelectLoanComponent', () => {
  let component: SelectLoanComponent;
  let fixture: ComponentFixture<SelectLoanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectLoanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
