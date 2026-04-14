import { Component, input, output } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-game-over',
  imports: [SharedModule, DialogModule],
  templateUrl: './game-over.html',
  styles: ``,
})
export class GameOver {
  visible = input.required<boolean>();
  nextTeam = input.required<string>();
  onNextTurn = output<void>();
}
