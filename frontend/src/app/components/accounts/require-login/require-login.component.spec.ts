import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RequireLoginComponent } from './require-login.component';

describe('RequireLoginComponent', () => {
  let component: RequireLoginComponent;
  let fixture: ComponentFixture<RequireLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RequireLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequireLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
