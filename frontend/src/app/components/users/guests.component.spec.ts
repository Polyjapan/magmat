import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GuestsComponent } from './guests.component';

describe('ExternalLoansComponent', () => {
  let component: GuestsComponent;
  let fixture: ComponentFixture<GuestsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GuestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
