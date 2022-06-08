import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShowObjectTypeComponent } from './show-object-type.component';

describe('ShowObjectTypeComponent', () => {
  let component: ShowObjectTypeComponent;
  let fixture: ComponentFixture<ShowObjectTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowObjectTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowObjectTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
