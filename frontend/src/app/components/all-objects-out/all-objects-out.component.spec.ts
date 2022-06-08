import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AllObjectsOutComponent } from './all-objects-out.component';

describe('AllObjectsOutComponent', () => {
  let component: AllObjectsOutComponent;
  let fixture: ComponentFixture<AllObjectsOutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AllObjectsOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllObjectsOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
