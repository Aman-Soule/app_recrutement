import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorJobDetail } from './visitor-job-detail';

describe('VisitorJobDetail', () => {
  let component: VisitorJobDetail;
  let fixture: ComponentFixture<VisitorJobDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorJobDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitorJobDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
