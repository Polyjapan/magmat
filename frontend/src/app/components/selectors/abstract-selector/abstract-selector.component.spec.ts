import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AbstractSelectorComponent } from './abstract-selector.component';

describe('SelectStorageComponent', () => {
  let component: AbstractSelectorComponent;
  let fixture: ComponentFixture<AbstractSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AbstractSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
