// src/app/components/report/report.component.ts

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TriggerService } from '../../services/trigger.service';
import { WeeklyStats } from '../../models/trigger-entry.model';

interface ReportData {
  period: string;
  stats: WeeklyStats;
  insights: string[];
  recommendations: string[];
  highlights: {
    bestDay: string;
    worstDay: string;
    mostCommonTime: string;
    avgIntensity: number;
  };
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent {
  private triggerService = inject(TriggerService);
  private router = inject(Router);

  reportType = signal<'week' | 'month'>('week');

  reportData = computed(() => {
    const type = this.reportType();
    const now = new Date();
    let startDate: Date;
    let period: string;

    if (type === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      period = `${startDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - ${now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    } else {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      period = now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    }

    const stats = this.triggerService.getWeeklyStats(
      startDate.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    );

    const entries = this.triggerService.getEntriesByDateRange(
      startDate.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    );

    // Calculate highlights
    const dayCount = new Map<string, { success: number; total: number }>();
    entries.forEach(e => {
      const current = dayCount.get(e.date) || { success: 0, total: 0 };
      current.total++;
      if (e.outcome === 'success') current.success++;
      dayCount.set(e.date, current);
    });

    const daySuccessRates = Array.from(dayCount.entries()).map(([date, data]) => ({
      date,
      rate: data.total > 0 ? (data.success / data.total) * 100 : 0
    }));

    const bestDay = daySuccessRates.length > 0
      ? daySuccessRates.reduce((a, b) => a.rate > b.rate ? a : b).date
      : '-';
    const worstDay = daySuccessRates.length > 0
      ? daySuccessRates.reduce((a, b) => a.rate < b.rate ? a : b).date
      : '-';

    const insights = this.generateInsights(stats, entries.length);
    const recommendations = this.generateRecommendations(stats);

    return {
      period,
      stats,
      insights,
      recommendations,
      highlights: {
        bestDay: bestDay !== '-' ? new Date(bestDay).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' }) : '-',
        worstDay: worstDay !== '-' ? new Date(worstDay).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' }) : '-',
        mostCommonTime: stats.mostCommonTimes.length > 0 ? stats.mostCommonTimes[0].timeSlot : '-',
        avgIntensity: stats.averageIntensity
      }
    };
  });

  private generateInsights(stats: WeeklyStats, totalEntries: number): string[] {
    const insights: string[] = [];

    if (stats.successRate >= 80) {
      insights.push('🌟 Hervorragend! Du hast eine sehr hohe Erfolgsquote.');
    } else if (stats.successRate >= 60) {
      insights.push('💪 Gut gemacht! Du bist auf einem guten Weg.');
    } else if (stats.successRate >= 40) {
      insights.push('📈 Du machst Fortschritte. Bleib dran!');
    } else {
      insights.push('🤗 Jeder Tag ist eine neue Chance. Du schaffst das!');
    }

    if (stats.averageIntensity <= 4) {
      insights.push('✨ Die durchschnittliche Intensität deiner Cravings ist niedrig - das ist ein gutes Zeichen!');
    } else if (stats.averageIntensity >= 7) {
      insights.push('⚠️ Die Cravings sind im Durchschnitt stark. Überlege dir zusätzliche Unterstützung.');
    }

    if (stats.averageDuration <= 15) {
      insights.push('⏱️ Die Cravings dauern durchschnittlich kurz - deine Bewältigungsstrategien wirken schnell!');
    } else if (stats.averageDuration >= 30) {
      insights.push('⏳ Cravings dauern länger. Vielleicht können andere Strategien schneller helfen?');
    }

    if (stats.mostCommonTriggers.length > 0) {
      const topTrigger = stats.mostCommonTriggers[0];
      insights.push(`🎯 Dein häufigster Trigger: "${topTrigger.trigger}". Kannst du diesen vermeiden oder besser vorbereitet sein?`);
    }

    if (stats.bestCopingStrategies.length > 0 && stats.bestCopingStrategies[0].successRate >= 80) {
      insights.push(`💡 "${stats.bestCopingStrategies[0].strategy}" funktioniert besonders gut für dich (${stats.bestCopingStrategies[0].successRate}% Erfolg)!`);
    }

    return insights;
  }

  private generateRecommendations(stats: WeeklyStats): string[] {
    const recommendations: string[] = [];

    if (stats.successRate < 60) {
      recommendations.push('Versuche täglich 10 Minuten Achtsamkeitsmeditation - das stärkt deine Bewältigungsfähigkeit.');
    }

    if (stats.mostCommonEmotions.some(e => e.emotion === 'Gestresst')) {
      recommendations.push('Stress ist oft ein Trigger. Baue regelmäßige Entspannungspausen in deinen Tag ein.');
    }

    if (stats.mostCommonTimes.length > 0 && stats.mostCommonTimes[0].count >= 3) {
      const time = stats.mostCommonTimes[0].timeSlot;
      recommendations.push(`Die meisten Cravings treten ${time} auf. Plane für diese Zeit bewusst Aktivitäten ein.`);
    }

    if (stats.averageIntensity >= 7) {
      recommendations.push('Bei hoher Intensität: Nutze sofort Urge Surfing oder Bewegung, bevor das Craving stärker wird.');
    }

    if (stats.bestCopingStrategies.length > 1) {
      const best = stats.bestCopingStrategies[0].strategy;
      const second = stats.bestCopingStrategies[1].strategy;
      recommendations.push(`Kombiniere "${best}" mit "${second}" für noch bessere Ergebnisse.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Du machst das großartig! Bleib bei deinen bewährten Strategien.');
    }

    return recommendations;
  }

  setReportType(type: 'week' | 'month'): void {
    this.reportType.set(type);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  printReport(): void {
    window.print();
  }

  exportReport(): void {
    const data = this.reportData();
    const content = this.generateTextReport(data);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bericht-${data.period.replace(/\s+/g, '-')}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generateTextReport(data: ReportData): string {
    return `
TRIGGER-TAGEBUCH BERICHT
========================
Zeitraum: ${data.period}

STATISTIKEN
-----------
Gesamte Cravings: ${data.stats.totalCravings}
Erfolgreich bewältigt: ${data.stats.successfullyManaged}
Erfolgsquote: ${data.stats.successRate}%
Durchschnittliche Intensität: ${data.stats.averageIntensity}/10
Durchschnittliche Dauer: ${data.stats.averageDuration} Minuten

HIGHLIGHTS
----------
Bester Tag: ${data.highlights.bestDay}
Schwierigster Tag: ${data.highlights.worstDay}
Häufigste Zeit: ${data.highlights.mostCommonTime}

HÄUFIGSTE TRIGGER
-----------------
${data.stats.mostCommonTriggers.map((t, i) => `${i + 1}. ${t.trigger} (${t.count}x)`).join('\n')}

HÄUFIGSTE EMOTIONEN
-------------------
${data.stats.mostCommonEmotions.map((e, i) => `${i + 1}. ${e.emotion} (${e.count}x)`).join('\n')}

WIRKSAMSTE STRATEGIEN
---------------------
${data.stats.bestCopingStrategies.map((s, i) => `${i + 1}. ${s.strategy} (${s.successRate}% Erfolg)`).join('\n')}

ERKENNTNISSE
------------
${data.insights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

EMPFEHLUNGEN
------------
${data.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
Erstellt am: ${new Date().toLocaleString('de-DE')}
    `.trim();
  }
}
