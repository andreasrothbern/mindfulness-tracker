// src/app/components/trigger-wizard/trigger-wizard.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TriggerService } from '../../services/trigger.service';
import { TemplateService } from '../../services/template.service';
import { CelebrationComponent } from '../celebration/celebration.component';
import { EMOTION_OPTIONS, COPING_STRATEGY_OPTIONS } from '../../models/trigger-entry.model';

@Component({
  selector: 'app-trigger-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CelebrationComponent],
  templateUrl: './trigger-wizard.component.html',
  styleUrls: ['./trigger-wizard.component.scss']
})
export class TriggerWizardComponent {
  private fb = inject(FormBuilder);
  private triggerService = inject(TriggerService);
  private templateService = inject(TemplateService);
  private router = inject(Router);

  emotionOptions = EMOTION_OPTIONS;
  copingStrategyOptions = COPING_STRATEGY_OPTIONS;

  currentStep = signal(1);
  totalSteps = 5;
  showSuccess = signal(false);
  celebrate = signal(false);
  currentStreak = signal(0);

  // Autocomplete suggestions
  locationSuggestions = signal<string[]>([]);
  activitySuggestions = signal<string[]>([]);

  // Templates
  templates = this.templateService.templates;
  showTemplates = signal(true);

  triggerForm: FormGroup;

  constructor() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    this.triggerForm = this.fb.group({
      // Step 1: Basics
      date: [today, Validators.required],
      time: [currentTime, Validators.required],
      intensity: [5, [Validators.required, Validators.min(1), Validators.max(10)]],

      // Step 2: Situation
      location: ['', Validators.required],
      activity: ['', Validators.required],
      withWhom: [''],

      // Step 3: Emotions
      emotions: [[], Validators.required],
      otherEmotion: [''],
      physicalSensations: ['', Validators.required],

      // Step 4: Trigger & Coping
      trigger: ['', Validators.required],
      copingStrategy: [[], Validators.required],
      copingDetails: [''],

      // Step 5: Reflection
      outcome: ['success', Validators.required],
      whatHelped: [''],
      whatDidntHelp: [''],
      duration: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });

    // Load autocomplete suggestions
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.locationSuggestions.set(this.triggerService.getLocationSuggestions());
    this.activitySuggestions.set(this.triggerService.getActivitySuggestions());
  }

  useTemplate(templateId: string): void {
    const template = this.templateService.getTemplate(templateId);
    if (template) {
      this.triggerForm.patchValue({
        location: template.location,
        activity: template.activity,
        emotions: [...template.emotions],
        trigger: template.trigger,
        copingStrategy: [...template.copingStrategy]
      });
      this.showTemplates.set(false);
      this.currentStep.set(2); // Start at step 2 since basics are already filled
    }
  }

  useSuggestion(field: 'location' | 'activity', value: string): void {
    this.triggerForm.patchValue({ [field]: value });
  }

  setNow(): void {
    const now = new Date();
    this.triggerForm.patchValue({
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5)
    });
  }

  nextStep(): void {
    if (this.isCurrentStepValid()) {
      if (this.currentStep() < this.totalSteps) {
        this.currentStep.update(v => v + 1);
        this.scrollToTop();
      }
    } else {
      this.markCurrentStepTouched();
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => v - 1);
      this.scrollToTop();
    }
  }

  goToStep(step: number): void {
    // Nur zu vorherigen oder aktuellen Steps navigieren
    if (step <= this.currentStep()) {
      this.currentStep.set(step);
      this.scrollToTop();
    }
  }

  isCurrentStepValid(): boolean {
    const step = this.currentStep();

    switch (step) {
      case 1:
        return !!(this.triggerForm.get('date')?.valid &&
          this.triggerForm.get('time')?.valid &&
          this.triggerForm.get('intensity')?.valid);
      case 2:
        return !!(this.triggerForm.get('location')?.valid &&
          this.triggerForm.get('activity')?.valid);
      case 3:
        return !!(this.triggerForm.get('emotions')?.valid &&
          this.triggerForm.get('physicalSensations')?.valid);
      case 4:
        return !!(this.triggerForm.get('trigger')?.valid &&
          this.triggerForm.get('copingStrategy')?.valid);
      case 5:
        return !!(this.triggerForm.get('outcome')?.valid &&
          this.triggerForm.get('duration')?.valid);
      default:
        return true;
    }
  }

  markCurrentStepTouched(): void {
    const step = this.currentStep();
    const fieldsToMark: string[][] = [
      [],
      ['date', 'time', 'intensity'],
      ['location', 'activity'],
      ['emotions', 'physicalSensations'],
      ['trigger', 'copingStrategy'],
      ['outcome', 'duration']
    ];

    fieldsToMark[step]?.forEach(field => {
      this.triggerForm.get(field)?.markAsTouched();
    });
  }

  onEmotionChange(emotion: string, checked: boolean): void {
    const emotions = this.triggerForm.get('emotions')?.value as string[];
    if (checked) {
      this.triggerForm.patchValue({
        emotions: [...emotions, emotion]
      });
    } else {
      this.triggerForm.patchValue({
        emotions: emotions.filter(e => e !== emotion)
      });
    }
  }

  onCopingStrategyChange(strategy: string, checked: boolean): void {
    const strategies = this.triggerForm.get('copingStrategy')?.value as string[];
    if (checked) {
      this.triggerForm.patchValue({
        copingStrategy: [...strategies, strategy]
      });
    } else {
      this.triggerForm.patchValue({
        copingStrategy: strategies.filter(s => s !== strategy)
      });
    }
  }

  onSubmit(): void {
    if (this.triggerForm.valid) {
      const formValue = this.triggerForm.value;

      let emotions = [...formValue.emotions];
      if (formValue.otherEmotion) {
        emotions.push(formValue.otherEmotion);
      }

      const entry = {
        ...formValue,
        emotions
      };

      this.triggerService.addEntry(entry);

      // Get current streak for celebration
      this.currentStreak.set(this.triggerService.getCurrentStreak());

      // Trigger celebration animation
      this.celebrate.set(true);
      console.log('✓ Wizard: Eintrag gespeichert, Streak:', this.currentStreak());

      setTimeout(() => {
        this.celebrate.set(false);
        this.router.navigate(['/dashboard']);
      }, 3000);
    } else {
      console.log('⚠️ Formular noch nicht vollständig');
      this.markCurrentStepTouched();
    }
  }

  skipToEnd(): void {
    // Für optionale letzte Steps - speichert mit aktuellen Werten
    if (this.isFormMinimallyValid()) {
      this.currentStep.set(this.totalSteps);
    }
  }

  isFormMinimallyValid(): boolean {
    // Mindestanforderungen für Quick-Save
    return !!(this.triggerForm.get('date')?.valid &&
      this.triggerForm.get('time')?.valid &&
      this.triggerForm.get('intensity')?.valid &&
      this.triggerForm.get('location')?.valid &&
      this.triggerForm.get('activity')?.valid &&
      this.triggerForm.get('emotions')?.valid &&
      this.triggerForm.get('physicalSensations')?.valid &&
      this.triggerForm.get('trigger')?.valid &&
      this.triggerForm.get('copingStrategy')?.valid);
  }

  getProgress(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancel(): void {
    if (confirm('Möchtest du wirklich abbrechen? Alle Eingaben gehen verloren.')) {
      this.router.navigate(['/dashboard']);
    }
  }
}
