import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickmoveComponent } from './quickmove.component';

describe('QuickmoveComponent', () => {
  let component: QuickmoveComponent;
  let fixture: ComponentFixture<QuickmoveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickmoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickmoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
