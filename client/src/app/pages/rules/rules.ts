import { Component, inject } from '@angular/core';
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

  navigateToGame() {
    this.router.navigate(['/game']);
  }
}
