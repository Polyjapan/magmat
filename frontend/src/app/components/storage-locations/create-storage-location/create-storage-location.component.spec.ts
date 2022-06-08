import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateStorageLocationComponent } from './create-storage-location.component';

describe('CreateStorageLocationComponent', () => {
  let component: CreateStorageLocationComponent;
  let fixture: ComponentFixture<CreateStorageLocationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateStorageLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStorageLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
