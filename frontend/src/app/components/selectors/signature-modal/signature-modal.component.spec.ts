import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SignatureModalComponent } from './signature-modal.component';

describe('SignatureModalComponent', () => {
  let component: SignatureModalComponent;
  let fixture: ComponentFixture<SignatureModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SignatureModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
