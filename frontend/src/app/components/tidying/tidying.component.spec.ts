import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TidyingComponent } from './tidying.component';

describe('TidyingComponent', () => {
  let component: TidyingComponent;
  let fixture: ComponentFixture<TidyingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TidyingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TidyingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
