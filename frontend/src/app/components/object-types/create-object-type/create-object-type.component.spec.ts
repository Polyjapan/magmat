import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateObjectTypeComponent } from './create-object-type.component';

describe('CreateObjectTypeComponent', () => {
  let component: CreateObjectTypeComponent;
  let fixture: ComponentFixture<CreateObjectTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateObjectTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateObjectTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
