// src/app/app.component.ts

import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { LoadingComponent } from './components/loading/loading.component';
import { PwaUpdateService } from './services/pwa-update.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, LoadingComponent],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
    <app-toast-container></app-toast-container>
    <app-loading></app-loading>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    :host {
      display: block;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(private pwaUpdate: PwaUpdateService) {}

  ngOnInit(): void {
    // PWA Update Service startet automatisch
  }
}
