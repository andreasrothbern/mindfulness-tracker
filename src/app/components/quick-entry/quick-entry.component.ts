// src/app/components/quick-entry/quick-entry.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TriggerService } from '../../services/trigger.service';

@Component({
  selector: 'app-quick-entry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-entry.component.html',
  styleUrls: ['./quick-entry.component.scss']
})
export class QuickEntryComponent {
  private triggerService = inject(TriggerService);
  private router = inject(Router);

  isOpen = signal(false);
  intensity = signal(5);
  showSuccess = signal(false);

  toggleSheet(): void {
    this.isOpen.set(!this.isOpen());
  }

  closeSheet(): void {
    this.isOpen.set(false);
  }

  setIntensity(value: number): void {
    this.intensity.set(value);
  }

  quickSave(): void {
    const now = new Date();
    const entry = {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      intensity: this.intensity(),
      location: 'Schnellerfassung',
      activity: 'Schnellerfassung',
      withWhom: '',
      emotions: ['Schnellerfassung'],
      physicalSensations: 'Noch zu ergänzen',
      trigger: 'Noch zu ergänzen',
      copingStrategy: ['Schnellerfassung'],
      copingDetails: '',
      outcome: 'success' as const,
      whatHelped: '',
      whatDidntHelp: '',
      duration: 0,
      notes: 'Quick Entry - Bitte später ergänzen'
    };

    this.triggerService.addEntry(entry);
    this.showSuccess.set(true);

    setTimeout(() => {
      this.showSuccess.set(false);
      this.closeSheet();
      this.intensity.set(5); // Reset
    }, 1500);
  }

  fullEntry(): void {
    this.closeSheet();
    this.router.navigate(['/wizard']);
  }

  goToSimpleForm(): void {
    this.closeSheet();
    this.router.navigate(['/form']);
  }

  startUrgeSurfing(): void {
    // Erst speichern
    this.quickSave();

    // Dann zu Urge Surfing Guide (optional später zu implementieren)
    setTimeout(() => {
      alert('🌊 Urge Surfing Timer startet...\n\nAtme ruhig.\nBeobachte das Craving.\nEs wird vorübergehen.');
      // Hier könnte später eine Timer-Komponente kommen
    }, 500);
  }
}
