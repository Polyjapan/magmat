import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectTypeTreeComponent } from './object-type-tree.component';

describe('ObjectTypeTreeComponent', () => {
  let component: ObjectTypeTreeComponent;
  let fixture: ComponentFixture<ObjectTypeTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectTypeTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectTypeTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
