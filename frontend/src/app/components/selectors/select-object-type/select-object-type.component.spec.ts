import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectObjectTypeComponent } from './select-object-type.component';

describe('SelectObjectTypeComponent', () => {
  let component: SelectObjectTypeComponent;
  let fixture: ComponentFixture<SelectObjectTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectObjectTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectObjectTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
