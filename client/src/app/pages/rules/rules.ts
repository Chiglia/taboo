import { Component, inject, signal } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rules',
  imports: [SharedModule],
  templateUrl: './rules.html',
  styles: ``,
})
export class Rules {
  private router = inject(Router);

  countdown = signal<number | null>(null);

  startCountdown() {
    this.countdown.set(3);

    const interval = setInterval(() => {
      const current = this.countdown();
      if (current !== null && current > 1) {
        this.countdown.set(current - 1);
      } else if (current === 1) {
        this.countdown.set(0);
      } else {
        clearInterval(interval);
        this.router.navigate(['/game']);
      }
    }, 1000);
  }
}
