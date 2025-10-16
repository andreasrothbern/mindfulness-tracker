// src/app/components/install-prompt/install-prompt.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  `
})
export class InstallPromptComponent implements OnInit {
  showInstallPrompt = false;
  showIosPrompt = false;
  private deferredPrompt: any;

  ngOnInit(): void {
    this.setupInstallPrompt();
    this.detectiOS();
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;

      // Warte 3 Sekunden, dann zeige Prompt
      setTimeout(() => {
        this.showInstallPrompt = true;
      }, 3000);
    });

    // App wurde installiert
    window.addEventListener('appinstalled', () => {
      this.showInstallPrompt = false;
      console.log('PWA wurde installiert! 🎉');
    });
  }

  private detectiOS(): void {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone;

    if (isIOS && !isStandalone) {
      setTimeout(() => {
        this.showIosPrompt = true;
      }, 5000);
    }
  }

  installApp(): void {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();

      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User installierte die App');
        }
        this.deferredPrompt = null;
        this.showInstallPrompt = false;
      });
    }
  }

  dismissPrompt(): void {
    this.showInstallPrompt = false;
    // Zeige 24h lang nicht mehr
    localStorage.setItem('installPromptDismissed',
      (Date.now() + 24 * 60 * 60 * 1000).toString());
  }

  dismissIosPrompt(): void {
    this.showIosPrompt = false;
  }
}
