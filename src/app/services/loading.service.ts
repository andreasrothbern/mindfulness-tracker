// src/app/services/loading.service.ts

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = signal(false);
  message = signal('Laden...');

  show(message: string = 'Laden...'): void {
    this.message.set(message);
    this.isLoading.set(true);
  }

  hide(): void {
    this.isLoading.set(false);
  }

  async wrap<T>(promise: Promise<T>, message?: string): Promise<T> {
    this.show(message);
    try {
      const result = await promise;
      return result;
    } finally {
      this.hide();
    }
  }
}
