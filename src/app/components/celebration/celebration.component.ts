// src/app/components/celebration/celebration.component.ts

import { Component, Input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-celebration',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="celebration-container" *ngIf="show()">
      <div class="confetti" *ngFor="let confetto of confetti"
           [style.left.%]="confetto.x"
           [style.animation-delay.s]="confetto.delay"
           [style.background-color]="confetto.color">
      </div>
      <div class="success-message">
        <div class="emoji">🎉</div>
        <div class="message">{{ message() }}</div>
        <div class="streak" *ngIf="streak() > 0">
          🔥 {{ streak() }} Tage Streak!
        </div>
      </div>
    </div>
  `,
  styles: [`
    .celebration-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 10000;
      overflow: hidden;
    }

    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      top: -10px;
      animation: confetti-fall 3s ease-out forwards;
    }

    @keyframes confetti-fall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }

    .success-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 40px 60px;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      animation: messageAppear 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: auto;
    }

    @keyframes messageAppear {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }

    .emoji {
      font-size: 80px;
      margin-bottom: 20px;
      animation: bounce 0.6s ease-in-out infinite alternate;
    }

    @keyframes bounce {
      0% { transform: translateY(0); }
      100% { transform: translateY(-20px); }
    }

    .message {
      font-size: 24px;
      font-weight: bold;
      color: #2ecc71;
      margin-bottom: 10px;
    }

    .streak {
      font-size: 20px;
      color: #e74c3c;
      font-weight: 600;
      margin-top: 15px;
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `]
})
export class CelebrationComponent {
  @Input() set trigger(value: boolean) {
    if (value) {
      this.celebrate();
    }
  }

  @Input() set streakValue(value: number) {
    this.streak.set(value);
  }

  @Input() customMessage?: string;

  show = signal(false);
  message = signal('Erfolgreich gespeichert!');
  streak = signal(0);
  confetti: Array<{ x: number; delay: number; color: string }> = [];

  private readonly colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#00bcd4', '#009688',
    '#4caf50', '#ffeb3b', '#ff9800', '#ff5722'
  ];

  celebrate(): void {
    this.show.set(true);

    if (this.customMessage) {
      this.message.set(this.customMessage);
    }

    // Generate confetti
    this.confetti = Array.from({ length: 100 }, () => ({
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    }));

    // Hide after 3 seconds
    setTimeout(() => {
      this.show.set(false);
      this.confetti = [];
    }, 3000);
  }
}
