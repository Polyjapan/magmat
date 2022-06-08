import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickItemCreateComponent } from './quick-item-create.component';

describe('QuickItemCreateComponent', () => {
  let component: QuickItemCreateComponent;
  let fixture: ComponentFixture<QuickItemCreateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickItemCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickItemCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
