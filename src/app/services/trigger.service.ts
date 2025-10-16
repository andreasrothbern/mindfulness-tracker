// src/app/services/trigger.service.ts

import { Injectable, signal } from '@angular/core';
import { TriggerEntry, WeeklyStats } from '../models/trigger-entry.model';

@Injectable({
  providedIn: 'root'
})
export class TriggerService {
  private readonly STORAGE_KEY = 'trigger-entries';

  // Signal für reaktive Updates
  entries = signal<TriggerEntry[]>(this.loadEntries());

  constructor() {
    // Cross-Tab-Synchronisation: Höre auf LocalStorage-Änderungen von anderen Tabs
    this.setupStorageListener();
  }

  private setupStorageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        // Nur reagieren, wenn unser Storage-Key betroffen ist
        if (event.key === this.STORAGE_KEY && event.newValue) {
          // Daten neu laden und Signal aktualisieren
          const updatedEntries = JSON.parse(event.newValue) as TriggerEntry[];
          this.entries.set(updatedEntries);
          console.log('📡 Cross-Tab-Sync: Daten von anderem Tab aktualisiert!');
        }
      });
    }
  }

  private loadEntries(): TriggerEntry[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveEntries(entries: TriggerEntry[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    this.entries.set(entries);
  }

  addEntry(entry: Omit<TriggerEntry, 'id'>): void {
    const newEntry: TriggerEntry = {
      ...entry,
      id: this.generateId()
    };
    const entries = [...this.entries(), newEntry];
    this.saveEntries(entries);
  }

  updateEntry(id: string, entry: Partial<TriggerEntry>): void {
    const entries = this.entries().map(e =>
      e.id === id ? { ...e, ...entry } : e
    );
    this.saveEntries(entries);
  }

  deleteEntry(id: string): void {
    const entries = this.entries().filter(e => e.id !== id);
    this.saveEntries(entries);
  }

  getEntriesByDateRange(startDate: string, endDate: string): TriggerEntry[] {
    return this.entries().filter(e =>
      e.date >= startDate && e.date <= endDate
    );
  }

  getWeeklyStats(startDate: string, endDate: string): WeeklyStats {
    const entries = this.getEntriesByDateRange(startDate, endDate);

    const totalCravings = entries.length;
    const successfullyManaged = entries.filter(e =>
      e.outcome === 'success'
    ).length;
    const successRate = totalCravings > 0
      ? Math.round((successfullyManaged / totalCravings) * 100)
      : 0;

    // Trigger-Häufigkeit
    const triggerCounts = new Map<string, number>();
    entries.forEach(e => {
      if (e.trigger) {
        triggerCounts.set(e.trigger, (triggerCounts.get(e.trigger) || 0) + 1);
      }
    });
    const mostCommonTriggers = Array.from(triggerCounts.entries())
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Emotions-Häufigkeit
    const emotionCounts = new Map<string, number>();
    entries.forEach(e => {
      e.emotions.forEach(emotion => {
        emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
      });
    });
    const mostCommonEmotions = Array.from(emotionCounts.entries())
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Zeit-Slots
    const timeSlotCounts = new Map<string, number>();
    entries.forEach(e => {
      const hour = parseInt(e.time.split(':')[0]);
      let slot = '';
      if (hour >= 6 && hour < 12) slot = 'Morgens (6-12)';
      else if (hour >= 12 && hour < 18) slot = 'Mittags (12-18)';
      else if (hour >= 18 && hour < 24) slot = 'Abends (18-24)';
      else slot = 'Nachts (0-6)';

      timeSlotCounts.set(slot, (timeSlotCounts.get(slot) || 0) + 1);
    });
    const mostCommonTimes = Array.from(timeSlotCounts.entries())
      .map(([timeSlot, count]) => ({ timeSlot, count }))
      .sort((a, b) => b.count - a.count);

    // Durchschnittswerte
    const averageIntensity = entries.length > 0
      ? Math.round(entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length)
      : 0;

    const averageDuration = entries.length > 0
      ? Math.round(entries.reduce((sum, e) => sum + e.duration, 0) / entries.length)
      : 0;

    // Beste Coping-Strategien
    const strategyCounts = new Map<string, { total: number; success: number }>();
    entries.forEach(e => {
      e.copingStrategy.forEach(strategy => {
        const current = strategyCounts.get(strategy) || { total: 0, success: 0 };
        current.total++;
        if (e.outcome === 'success') current.success++;
        strategyCounts.set(strategy, current);
      });
    });
    const bestCopingStrategies = Array.from(strategyCounts.entries())
      .map(([strategy, stats]) => ({
        strategy,
        successRate: stats.total > 0
          ? Math.round((stats.success / stats.total) * 100)
          : 0
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);

    return {
      totalCravings,
      successfullyManaged,
      successRate,
      mostCommonTriggers,
      mostCommonEmotions,
      mostCommonTimes,
      averageIntensity,
      averageDuration,
      bestCopingStrategies
    };
  }

  exportData(): string {
    return JSON.stringify(this.entries(), null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const entries = JSON.parse(jsonString) as TriggerEntry[];
      this.saveEntries(entries);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  // Autocomplete Suggestions
  getLocationSuggestions(): string[] {
    const locations = this.entries().map(e => e.location);
    return this.getTopFrequent(locations, 5);
  }

  getActivitySuggestions(): string[] {
    const activities = this.entries().map(e => e.activity);
    return this.getTopFrequent(activities, 5);
  }

  getLastLocation(): string {
    const entries = this.entries();
    return entries.length > 0 ? entries[0].location : '';
  }

  getLastActivity(): string {
    const entries = this.entries();
    return entries.length > 0 ? entries[0].activity : '';
  }

  private getTopFrequent(items: string[], limit: number): string[] {
    const counts = new Map<string, number>();
    items.forEach(item => {
      if (item && item !== 'Schnellerfassung') {
        counts.set(item, (counts.get(item) || 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item);
  }

  // Streak Calculation
  getCurrentStreak(): number {
    const sortedEntries = [...this.entries()].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    if (sortedEntries.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === streak) {
        if (entry.outcome === 'success') {
          streak++;
          currentDate = entryDate;
        } else {
          break;
        }
      } else if (dayDiff > streak) {
        break;
      }
    }

    return streak;
  }

  getLongestStreak(): number {
    const sortedEntries = [...this.entries()].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const entry of sortedEntries) {
      if (entry.outcome !== 'success') {
        currentStreak = 0;
        lastDate = null;
        continue;
      }

      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        currentStreak = 1;
      } else {
        const dayDiff = Math.floor((entryDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }

      maxStreak = Math.max(maxStreak, currentStreak);
      lastDate = entryDate;
    }

    return maxStreak;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
