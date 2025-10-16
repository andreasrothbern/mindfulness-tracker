// src/app/services/pwa.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: any;
  private isIOS = false;

  constructor() {
    this.initializePWA();
  }

  private initializePWA(): void {
    // Service Worker registrieren
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);

          // Update-Check alle 60 Sekunden
          setInterval(() => {
            registration.update();
          }, 60000);
        })
        .catch((error) => {
          console.log('❌ Service Worker registration failed:', error);
        });
    }

    // Install-Prompt vorbereiten
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('💾 Install prompt ready');
    });

    // iOS Detection
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  // PWA installieren
  async installPWA(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const result = await this.deferredPrompt.userChoice;

    if (result.outcome === 'accepted') {
      console.log('🎉 PWA installed successfully');
      this.deferredPrompt = null;
      return true;
    }

    return false;
  }

  // Prüfen ob installierbar
  canInstall(): boolean {
    return !!this.deferredPrompt || this.isIOS;
  }

  // iOS-Installation prüfen
  isIOSDevice(): boolean {
    return this.isIOS;
  }

  // Standalone-Modus prüfen
  isStandalone(): boolean {
    return (window.navigator as any).standalone ||
      window.matchMedia('(display-mode: standalone)').matches;
  }

  // Update verfügbar prüfen
  checkForUpdate(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  }

  // Offline-Status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Push-Notifications aktivieren (für später)
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}
