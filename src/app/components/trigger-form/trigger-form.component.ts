// src/app/components/trigger-form/trigger-form.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TriggerService } from '../../services/trigger.service';
import { EMOTION_OPTIONS, COPING_STRATEGY_OPTIONS } from '../../models/trigger-entry.model';

@Component({
  selector: 'app-trigger-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trigger-form.component.html',
  styleUrls: ['./trigger-form.component.scss']
})
export class TriggerFormComponent {
  private fb = inject(FormBuilder);
  private triggerService = inject(TriggerService);
  private router = inject(Router);

  emotionOptions = EMOTION_OPTIONS;
  copingStrategyOptions = COPING_STRATEGY_OPTIONS;

  triggerForm: FormGroup;
  showSuccess = false;

  constructor() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    this.triggerForm = this.fb.group({
      date: [today, Validators.required],
      time: [currentTime, Validators.required],
      intensity: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      location: ['', Validators.required],
      activity: ['', Validators.required],
      withWhom: [''],  // Optional
      emotions: [[], Validators.required],
      otherEmotion: [''],  // Optional
      physicalSensations: ['', Validators.required],
      trigger: ['', Validators.required],
      copingStrategy: [[], Validators.required],
      copingDetails: [''],  // Optional
      outcome: ['success', Validators.required],
      whatHelped: [''],  // Optional
      whatDidntHelp: [''],  // Optional
      duration: [0, [Validators.required, Validators.min(0)]],
      notes: ['']  // Optional
    });
  }

  setNow(): void {
    const now = new Date();
    this.triggerForm.patchValue({
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5)
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

      // Füge "Anderes" Emotion hinzu falls ausgefüllt
      let emotions = [...formValue.emotions];
      if (formValue.otherEmotion) {
        emotions.push(formValue.otherEmotion);
      }

      const entry = {
        ...formValue,
        emotions
      };

      this.triggerService.addEntry(entry);

      // Success-Message zeigen
      this.showSuccess = true;
      console.log('✓ Eintrag gespeichert, Success-Message angezeigt');

      // Nach 1.2 Sekunden zum Dashboard
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1200);
    } else {
      this.markFormGroupTouched(this.triggerForm);
      console.log('⚠️ Formular ungültig - bitte alle Pflichtfelder ausfüllen');
    }
  }

  resetForm(): void {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    this.triggerForm.reset({
      date: today,
      time: currentTime,
      intensity: 5,
      emotions: [],
      copingStrategy: [],
      outcome: 'success',
      duration: 0
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
