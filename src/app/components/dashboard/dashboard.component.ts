// src/app/components/dashboard/dashboard.component.ts

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TriggerService } from '../../services/trigger.service';
import { ToastService } from '../../services/toast.service';
import { TriggerEntry, WeeklyStats, EMOTION_OPTIONS } from '../../models/trigger-entry.model';
import { QuickEntryComponent } from '../quick-entry/quick-entry.component';
import { EditEntryComponent } from '../edit-entry/edit-entry.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, QuickEntryComponent, EditEntryComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private triggerService = inject(TriggerService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  timeRange = signal<'week' | 'month' | 'all'>('week');

  // Filter & Search
  searchQuery = signal('');
  filterEmotion = signal<string>('all');
  filterOutcome = signal<string>('all');
  sortBy = signal<'date' | 'intensity' | 'duration'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');

  // Expandable cards
  expandedEntryId = signal<string | null>(null);

  // Edit
  entryToEdit = signal<TriggerEntry | null>(null);

  entries = this.triggerService.entries;

  currentStreak = computed(() => this.triggerService.getCurrentStreak());
  longestStreak = computed(() => this.triggerService.getLongestStreak());

  emotionOptions = ['all', ...EMOTION_OPTIONS];
  outcomeOptions = [
    { value: 'all', label: 'Alle' },
    { value: 'success', label: 'Erfolgreich' },
    { value: 'partial', label: 'Teilweise' },
    { value: 'relapse', label: 'Nachgegeben' }
  ];

  stats = computed(() => {
    const range = this.timeRange();
    const now = new Date();
    let startDate = '';

    if (range === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
    } else if (range === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
    } else {
      startDate = '2000-01-01'; // All time
    }

    const endDate = now.toISOString().split('T')[0];
    return this.triggerService.getWeeklyStats(startDate, endDate);
  });

  filteredEntries = computed(() => {
    const range = this.timeRange();
    const now = new Date();
    let startDate = '';

    if (range === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
    } else if (range === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
    } else {
      startDate = '2000-01-01';
    }

    const endDate = now.toISOString().split('T')[0];
    let entries = this.triggerService.getEntriesByDateRange(startDate, endDate);

    // Apply search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      entries = entries.filter(e =>
        e.location.toLowerCase().includes(query) ||
        e.activity.toLowerCase().includes(query) ||
        e.trigger.toLowerCase().includes(query) ||
        e.emotions.some(emotion => emotion.toLowerCase().includes(query)) ||
        e.notes.toLowerCase().includes(query)
      );
    }

    // Apply emotion filter
    const emotion = this.filterEmotion();
    if (emotion !== 'all') {
      entries = entries.filter(e => e.emotions.includes(emotion));
    }

    // Apply outcome filter
    const outcome = this.filterOutcome();
    if (outcome !== 'all') {
      entries = entries.filter(e => e.outcome === outcome);
    }

    // Apply sorting
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();

    entries.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        comparison = dateB.getTime() - dateA.getTime();
      } else if (sortBy === 'intensity') {
        comparison = b.intensity - a.intensity;
      } else if (sortBy === 'duration') {
        comparison = b.duration - a.duration;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return entries;
  });

  setTimeRange(range: 'week' | 'month' | 'all'): void {
    this.timeRange.set(range);
  }

  goToForm(): void {
    this.router.navigate(['/form']);
  }

  goToWizard(): void {
    this.router.navigate(['/wizard']);
  }

  deleteEntry(id: string): void {
    if (confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
      this.triggerService.deleteEntry(id);
      this.toastService.success('Eintrag gelöscht');
    }
  }

  exportData(): void {
    const data = this.triggerService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trigger-tagebuch-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.toastService.success('Daten exportiert!');
  }

  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = this.triggerService.importData(content);
        if (success) {
          this.toastService.success('Daten erfolgreich importiert!');
        } else {
          this.toastService.error('Fehler beim Import. Bitte überprüfe die Datei.');
        }
      };
      reader.readAsText(file);
    }
  }

  goToReport(): void {
    this.router.navigate(['/report']);
  }

  getOutcomeClass(outcome: string): string {
    switch (outcome) {
      case 'success': return 'outcome-success';
      case 'partial': return 'outcome-partial';
      case 'relapse': return 'outcome-relapse';
      default: return '';
    }
  }

  getOutcomeText(outcome: string): string {
    switch (outcome) {
      case 'success': return '✓ Erfolgreich';
      case 'partial': return '~ Teilweise';
      case 'relapse': return '✗ Nachgegeben';
      default: return outcome;
    }
  }

  toggleExpand(id: string): void {
    if (this.expandedEntryId() === id) {
      this.expandedEntryId.set(null);
    } else {
      this.expandedEntryId.set(id);
    }
  }

  isExpanded(id: string): boolean {
    return this.expandedEntryId() === id;
  }

  isQuickEntry(entry: TriggerEntry): boolean {
    return entry.location === 'Schnellerfassung' ||
      entry.activity === 'Schnellerfassung' ||
      entry.trigger === 'Noch zu ergänzen';
  }

  editEntry(entry: TriggerEntry): void {
    this.entryToEdit.set(entry);
  }

  onEntrySaved(updatedEntry: TriggerEntry): void {
    this.triggerService.updateEntry(updatedEntry.id, updatedEntry);
    this.entryToEdit.set(null);
  }

  onEditClosed(): void {
    this.entryToEdit.set(null);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.filterEmotion.set('all');
    this.filterOutcome.set('all');
  }

  hasActiveFilters(): boolean {
    return this.searchQuery() !== '' ||
      this.filterEmotion() !== 'all' ||
      this.filterOutcome() !== 'all';
  }
}
