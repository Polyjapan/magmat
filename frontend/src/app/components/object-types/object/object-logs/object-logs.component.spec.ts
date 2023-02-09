import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectLogsComponent } from './object-logs.component';

describe('ObjectLogsComponent', () => {
  let component: ObjectLogsComponent;
  let fixture: ComponentFixture<ObjectLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
