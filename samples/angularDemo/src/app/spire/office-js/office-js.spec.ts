import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeJS } from './office-js';

describe('OfficeJS', () => {
  let component: OfficeJS;
  let fixture: ComponentFixture<OfficeJS>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficeJS]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeJS);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
