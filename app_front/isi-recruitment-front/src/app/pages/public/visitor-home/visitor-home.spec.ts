import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorHome } from './visitor-home';

describe('VisitorHome', () => {
  let component: VisitorHome;
  let fixture: ComponentFixture<VisitorHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorHome],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitorHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
