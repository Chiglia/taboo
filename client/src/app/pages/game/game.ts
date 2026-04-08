import { Component, computed, effect, signal } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-game',
  imports: [SharedModule, DialogModule],
  templateUrl: './game.html',
  styles: ``,
  host: { class: 'block h-dvh w-full overflow-hidden bg-amber-400 p-4 font-sans selection:bg-purple-200' }
})
export class Game {
  private readonly WORDS = [
    { word: 'PIZZA', forbidden: ['Margherita', 'Forno', 'Italia', 'Impasto'] },
    { word: 'SMARTPHONE', forbidden: ['Telefono', 'App', 'Schermo', 'Chiamare'] }
  ];

  points = signal<{ A: number, B: number }>(JSON.parse(localStorage.getItem('taboo_score') ?? '{"A":0,"B":0}'));
  turn = signal<'A' | 'B'>('A');
  timeLeft = signal(60);
  currentIndex = signal(0);
  isOver = signal(false);

  currentCard = computed(() => this.WORDS[this.currentIndex() % this.WORDS.length]);

  constructor() {
    effect(() => localStorage.setItem('taboo_score', JSON.stringify(this.points())));
    this.startTimer();
  }

  private startTimer() {
    const interval = setInterval(() => {
      this.timeLeft.update(v => v - 1);
      if (this.timeLeft() <= 0) {
        clearInterval(interval);
        this.isOver.set(true);
      }
    }, 1000);
  }

  handleWord(success: boolean) {
    if (success) {
      this.points.update(p => ({ ...p, [this.turn()]: p[this.turn()] + 1 }));
    }
    this.currentIndex.update(i => i + 1);
  }

  nextTurn() {
    this.turn.update(t => t === 'A' ? 'B' : 'A');
    this.timeLeft.set(60);
    this.isOver.set(false);
    this.startTimer();
  }
}