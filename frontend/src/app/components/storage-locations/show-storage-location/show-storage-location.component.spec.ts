import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShowStorageLocationComponent } from './show-storage-location.component';

describe('ShowStorageLocationComponent', () => {
  let component: ShowStorageLocationComponent;
  let fixture: ComponentFixture<ShowStorageLocationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowStorageLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowStorageLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
