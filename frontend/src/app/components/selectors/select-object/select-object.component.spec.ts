import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectObjectComponent } from './select-object.component';

describe('SelectObjectComponent', () => {
  let component: SelectObjectComponent;
  let fixture: ComponentFixture<SelectObjectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
