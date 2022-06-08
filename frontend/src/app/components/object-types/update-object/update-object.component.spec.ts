import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UpdateObjectComponent } from './update-object.component';

describe('UpdateObjectComponent', () => {
  let component: UpdateObjectComponent;
  let fixture: ComponentFixture<UpdateObjectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
