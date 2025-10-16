// src/app/components/install-prompt/install-prompt.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Debug Info -->
    <div *ngIf="showDebugInfo"
         class="fixed top-4 left-4 right-4 bg-yellow-500 text-black p-3 rounded-lg shadow-lg z-50 text-xs">
      <div><strong>Debug Info:</strong></div>
      <div>iOS: {{isIOS}}</div>
      <div>Standalone: {{isStandalone}}</div>
      <div>Can Install: {{canInstall}}</div>
      <div>User Agent: {{userAgent.substring(0, 50)}}...</div>
      <button (click)="showDebugInfo = false" class="mt-2 bg-black text-yellow-500 px-2 py-1 rounded text-xs">Schließen</button>
    </div>

    <!-- Android Install Prompt -->
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

    <!-- iOS Safari Hinweis - Verbessertes Design -->
    <div *ngIf="showIosPrompt"
         class="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg shadow-lg z-50">

      <div class="flex items-start space-x-3">
        <div class="text-3xl">🍎</div>
        <div class="flex-1">
          <div class="font-bold text-lg mb-2">📱 Als App installieren</div>
          <div class="text-sm space-y-2 bg-white/10 p-3 rounded">
            <div class="flex items-center space-x-2">
              <span class="bg-white text-blue-600 rounded px-1 text-xs font-bold">1</span>
              <span>Tippe auf das <strong>Teilen-Symbol</strong> ⬆️ (unten in Safari)</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="bg-white text-blue-600 rounded px-1 text-xs font-bold">2</span>
              <span>Scrolle und wähle <strong>"Zum Home-Bildschirm"</strong> 📲</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="bg-white text-blue-600 rounded px-1 text-xs font-bold">3</span>
              <span>Tippe <strong>"Hinzufügen"</strong> ✅</span>
            </div>
          </div>
          <div class="mt-3 text-xs opacity-80">
            Dann findest du die App auf deinem Homescreen! 🎉
          </div>
        </div>
        <button
          (click)="dismissIosPrompt()"
          class="text-white/80 hover:text-white text-lg px-2">
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

    <!-- Debug Button -->
    <button
      (click)="toggleDebug()"
      class="fixed top-4 right-4 bg-red-500 text-white p-2 rounded text-xs z-50">
      Debug
    </button>
  `
})
export class InstallPromptComponent implements OnInit {
  private pwaService = inject(PwaService);

  showInstallPrompt = false;
  showIosPrompt = false;
  showDebugInfo = false;
  isOnline = true;
  isIOS = false;
  isStandalone = false;
  canInstall = false;
  userAgent = '';

  ngOnInit(): void {
    this.detectPlatform();
    this.checkInstallability();
    this.checkNetworkStatus();
  }

  private detectPlatform(): void {
    this.isIOS = this.pwaService.isIOSDevice();
    this.isStandalone = this.pwaService.isStandalone();
    this.canInstall = this.pwaService.canInstall();
    this.userAgent = navigator.userAgent;

    console.log('PWA Debug:', {
      isIOS: this.isIOS,
      isStandalone: this.isStandalone,
      canInstall: this.canInstall,
      userAgent: this.userAgent
    });
  }

  private checkInstallability(): void {
    // Warte 3 Sekunden, dann prüfe ob installierbar
    setTimeout(() => {
      if (!this.isStandalone) { // Nicht im App-Modus
        if (this.isIOS) {
          this.showIosPrompt = true;
          console.log('Showing iOS install prompt');
        } else if (this.canInstall) {
          this.showInstallPrompt = true;
          console.log('Showing Android install prompt');
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
    localStorage.setItem('iosInstallPromptDismissed', Date.now().toString());
  }

  toggleDebug(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }
}
