import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SigningAreaComponent } from './signing-area.component';

describe('SigningAreaComponent', () => {
  let component: SigningAreaComponent;
  let fixture: ComponentFixture<SigningAreaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SigningAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigningAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
