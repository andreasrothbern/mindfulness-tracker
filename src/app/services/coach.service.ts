// src/app/services/coach.service.ts
// Service für KI-Motivations-Coach

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TriggerService } from './trigger.service';
import { WeeklyStats } from '../models/trigger-entry.model';

interface CoachResponse {
  success: boolean;
  response?: string;
  error?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private http = inject(HttpClient);
  private triggerService = inject(TriggerService);

  // Netlify Function URL (automatisch richtig in Production)
  private readonly API_URL = '/.netlify/functions/motivational-coach';

  /**
   * Frage den KI-Coach um Rat
   */
  askCoach(userMessage: string): Observable<CoachResponse> {
    // Context aus Trigger-Daten erstellen
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const stats = this.triggerService.getWeeklyStats(
      weekAgo.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    );

    const context = {
      recentStats: stats,
      totalEntries: this.triggerService.entries().length,
      latestEntry: this.triggerService.entries()[0] || null,
    };

    return this.http.post<CoachResponse>(this.API_URL, {
      userMessage,
      context
    });
  }

  /**
   * Tägliche Motivation holen
   */
  getDailyMotivation(): Observable<CoachResponse> {
    const stats = this.getWeekStats();

    let message = 'Gib mir eine motivierende Nachricht für heute.';

    if (stats.successRate > 80) {
      message = `Meine Erfolgsquote liegt bei ${stats.successRate}%. Feiere meinen Erfolg und gib mir Motivation weiterzumachen!`;
    } else if (stats.successRate < 50) {
      message = `Ich habe aktuell eine Erfolgsquote von ${stats.successRate}%. Motiviere mich und erinnere mich daran, dass jeder Tag eine neue Chance ist.`;
    }

    return this.askCoach(message);
  }

  /**
   * Analyse der Trigger-Muster
   */
  analyzePatterns(): Observable<CoachResponse> {
    const stats = this.getWeekStats();

    const message = `Analysiere meine Trigger-Muster der letzten Woche:
    - Häufigste Trigger: ${stats.mostCommonTriggers.map(t => t.trigger).join(', ')}
    - Häufigste Emotionen: ${stats.mostCommonEmotions.map(e => e.emotion).join(', ')}
    - Erfolgsquote: ${stats.successRate}%

    Gib mir konkrete Tipps, wie ich besser mit diesen Triggern umgehen kann.`;

    return this.askCoach(message);
  }

  /**
   * Hilfe bei aktuellem Craving
   */
  helpWithCraving(intensity: number, trigger: string, emotion: string): Observable<CoachResponse> {
    const message = `Ich habe gerade ein Craving mit Intensität ${intensity}/10.
    Trigger: ${trigger}
    Emotion: ${emotion}

    Hilf mir JETZT mit konkreten Sofort-Strategien!`;

    return this.askCoach(message);
  }

  private getWeekStats(): WeeklyStats {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    return this.triggerService.getWeeklyStats(
      weekAgo.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    );
  }
}
