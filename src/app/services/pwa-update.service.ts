// src/app/services/pwa-update.service.ts

import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PwaUpdateService {

  constructor(private swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {
      this.checkForUpdates();
    }
  }

  private checkForUpdates(): void {
    // Check for updates every 6 hours
    setInterval(() => {
      this.swUpdate.checkForUpdate();
    }, 6 * 60 * 60 * 1000);

    // Listen for version updates
    this.swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
    ).subscribe(() => {
      this.showUpdateNotification();
    });
  }

  private showUpdateNotification(): void {
    const updateConfirm = confirm(
      'Eine neue Version der App ist verfügbar! Jetzt aktualisieren?'
    );

    if (updateConfirm) {
      this.updateApp();
    }
  }

  private updateApp(): void {
    this.swUpdate.activateUpdate().then(() => {
      document.location.reload();
    });
  }

  // Manual update check (für Settings-Button)
  checkForUpdate(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then((hasUpdate) => {
        if (!hasUpdate) {
          alert('Du hast bereits die neueste Version! 🎉');
        }
      });
    }
  }
}
