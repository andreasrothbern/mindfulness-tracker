// src/app/components/edit-entry/edit-entry.component.ts

import { Component, Input, Output, EventEmitter, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TriggerEntry, EMOTION_OPTIONS, COPING_STRATEGY_OPTIONS } from '../../models/trigger-entry.model';

@Component({
  selector: 'app-edit-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-entry.component.html',
  styleUrls: ['./edit-entry.component.scss']
})
export class EditEntryComponent {
  @Input() set entry(value: TriggerEntry | null) {
    if (value) {
      this.currentEntry.set(value);
      this.loadEntry(value);
      this.isOpen.set(true);
    }
  }

  @Output() save = new EventEmitter<TriggerEntry>();
  @Output() close = new EventEmitter<void>();

  isOpen = signal(false);
  currentEntry = signal<TriggerEntry | null>(null);
  showSuccess = signal(false);

  emotionOptions = EMOTION_OPTIONS;
  copingStrategyOptions = COPING_STRATEGY_OPTIONS;

  editForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      intensity: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      location: ['', Validators.required],
      activity: ['', Validators.required],
      withWhom: [''],
      emotions: [[], Validators.required],
      otherEmotion: [''],
      physicalSensations: ['', Validators.required],
      trigger: ['', Validators.required],
      copingStrategy: [[], Validators.required],
      copingDetails: [''],
      outcome: ['success', Validators.required],
      whatHelped: [''],
      whatDidntHelp: [''],
      duration: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  loadEntry(entry: TriggerEntry): void {
    this.editForm.patchValue({
      date: entry.date,
      time: entry.time,
      intensity: entry.intensity,
      location: entry.location,
      activity: entry.activity,
      withWhom: entry.withWhom,
      emotions: [...entry.emotions],
      physicalSensations: entry.physicalSensations,
      trigger: entry.trigger,
      copingStrategy: [...entry.copingStrategy],
      copingDetails: entry.copingDetails,
      outcome: entry.outcome,
      whatHelped: entry.whatHelped,
      whatDidntHelp: entry.whatDidntHelp,
      duration: entry.duration,
      notes: entry.notes
    });
  }

  isQuickEntry(): boolean {
    const entry = this.currentEntry();
    return entry ?
      (entry.location === 'Schnellerfassung' ||
        entry.activity === 'Schnellerfassung' ||
        entry.trigger === 'Noch zu ergänzen') : false;
  }

  onEmotionChange(emotion: string, checked: boolean): void {
    const emotions = this.editForm.get('emotions')?.value as string[];
    if (checked) {
      this.editForm.patchValue({
        emotions: [...emotions, emotion]
      });
    } else {
      this.editForm.patchValue({
        emotions: emotions.filter(e => e !== emotion)
      });
    }
  }

  onCopingStrategyChange(strategy: string, checked: boolean): void {
    const strategies = this.editForm.get('copingStrategy')?.value as string[];
    if (checked) {
      this.editForm.patchValue({
        copingStrategy: [...strategies, strategy]
      });
    } else {
      this.editForm.patchValue({
        copingStrategy: strategies.filter(s => s !== strategy)
      });
    }
  }

  onSave(): void {
    if (this.editForm.valid && this.currentEntry()) {
      const entry = this.currentEntry()!;
      const formValue = this.editForm.value;

      let emotions = [...formValue.emotions];
      if (formValue.otherEmotion) {
        emotions.push(formValue.otherEmotion);
      }

      const updatedEntry: TriggerEntry = {
        ...entry,
        ...formValue,
        emotions
      };

      this.save.emit(updatedEntry);

      this.showSuccess.set(true);
      setTimeout(() => {
        this.showSuccess.set(false);
        this.closeSheet();
      }, 1000);
    }
  }

  closeSheet(): void {
    this.isOpen.set(false);
    setTimeout(() => {
      this.close.emit();
    }, 300);
  }
}
