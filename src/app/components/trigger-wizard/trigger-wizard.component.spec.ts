import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriggerWizardComponent } from './trigger-wizard.component';

describe('TriggerWizardComponent', () => {
  let component: TriggerWizardComponent;
  let fixture: ComponentFixture<TriggerWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriggerWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TriggerWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
