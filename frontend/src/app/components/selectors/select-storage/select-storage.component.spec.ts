import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectStorageComponent } from './select-storage.component';

describe('SelectStorageComponent', () => {
  let component: SelectStorageComponent;
  let fixture: ComponentFixture<SelectStorageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectStorageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
