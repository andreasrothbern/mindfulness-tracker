// src/app/components/install-prompt/install-prompt.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showInstallPrompt"
         class="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce">

      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="text-2xl">📱</div>
          <div>
            <div class="font-semibold">App installieren</div>
            <div class="text-sm opacity-90">Schneller Zugriff vom Homescreen</div>
          </div>
        </div>

        <div class="flex space-x-2">
          <button
            (click)="installApp()"
            class="bg-white text-emerald-600 px-4 py-2 rounded font-semibold text-sm hover:bg-gray-100">
            Installieren
          </button>
          <button
            (click)="dismissPrompt()"
            class="text-white/80 hover:text-white text-sm px-2">
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- iOS Safari Hinweis -->
    <div *ngIf="showIosPrompt"
         class="fixed bottom-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">

      <div class="flex items-start space-x-3">
        <div class="text-2xl">🍎</div>
        <div class="flex-1">
          <div class="font-semibold mb-2">App auf iPhone installieren</div>
          <div class="text-sm space-y-1">
            <div>1. Tippe auf das <strong>Teilen-Symbol</strong> ⬆️</div>
            <div>2. Wähle <strong>"Zum Home-Bildschirm"</strong></div>
            <div>3. Tippe <strong>"Hinzufügen"</strong></div>
          </div>
        </div>
        <button
          (click)="dismissIosPrompt()"
          class="text-white/80 hover:text-white text-sm px-2">
          ✕
        </button>
      </div>
    </div>

    <!-- Offline-Indicator -->
    <div *ngIf="!isOnline"
         class="fixed top-4 left-4 right-4 bg-gray-800 text-white p-3 rounded-lg shadow-lg z-50">
      <div class="flex items-center space-x-2">
        <div class="text-lg">📶</div>
        <div class="text-sm">Offline-Modus aktiv - Daten werden lokal gespeichert</div>
      </div>
    </div>
  `
})
export class InstallPromptComponent implements OnInit {
  private pwaService = inject(PwaService);

  showInstallPrompt = false;
  showIosPrompt = false;
  isOnline = true;

  ngOnInit(): void {
    this.checkInstallability();
    this.checkNetworkStatus();
  }

  private checkInstallability(): void {
    // Warte 3 Sekunden, dann prüfe ob installierbar
    setTimeout(() => {
      if (this.pwaService.canInstall() && !this.pwaService.isStandalone()) {
        if (this.pwaService.isIOSDevice()) {
          this.showIosPrompt = true;
        } else {
          this.showInstallPrompt = true;
        }
      }
    }, 3000);
  }

  private checkNetworkStatus(): void {
    this.isOnline = this.pwaService.isOnline();

    // Online/Offline Events
    window.addEventListener('online', () => {
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async installApp(): Promise<void> {
    const success = await this.pwaService.installPWA();
    if (success) {
      this.showInstallPrompt = false;
    }
  }

  dismissPrompt(): void {
    this.showInstallPrompt = false;
  }

  dismissIosPrompt(): void {
    this.showIosPrompt = false;
  }
}
