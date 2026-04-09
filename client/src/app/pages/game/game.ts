import { Component, computed, effect, ElementRef, inject, resource, signal, viewChild } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { DialogModule } from 'primeng/dialog';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface Card {
  word: string;
  forbidden: string[];
}

@Component({
  selector: 'app-game',
  imports: [SharedModule, DialogModule],
  templateUrl: './game.html',
  styles: ``,
  host: { class: 'block h-dvh w-full overflow-hidden bg-amber-400 p-4 font-sans selection:bg-purple-200' }
})
export class Game {
  private http = inject(HttpClient);

  cardsResource = resource({
    loader: () => firstValueFrom(this.http.get<Card[]>('game-data.json'))
  });

  points = signal<{ A: number, B: number }>(JSON.parse(localStorage.getItem('taboo_score') ?? '{"A":0,"B":0}'));
  turn = signal<'A' | 'B'>('A');
  timeLeft = signal(60);
  currentIndex = signal(0);
  isOver = signal(false);
  shuffledCards = signal<Card[]>([]);
  cardElement = viewChild<ElementRef>('card');

  currentCard = computed(() => {
    const cards = this.shuffledCards();
    return cards.length > 0 ? cards[this.currentIndex() % cards.length] : null;
  });

  constructor() {
    // 1. Popola shuffledCards quando arrivano i dati
    effect(() => {
      const data = this.cardsResource.value();
      if (data && this.shuffledCards().length === 0) {
        // Rimescoliamo i dati
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        this.shuffledCards.set(shuffled);
      }
    });

    // 2. Gestione animazione al cambio indice
    effect(() => {
      this.currentIndex(); // Dipendenza
      const el = this.cardElement()?.nativeElement;
      if (el) {
        el.classList.remove('card-animate');
        void el.offsetWidth;
        el.classList.add('card-animate');
      }
    });

    // 3. Persistenza punti
    effect(() => localStorage.setItem('taboo_score', JSON.stringify(this.points())));

    this.startTimer();
  }

  private startTimer() {
    const interval = setInterval(() => {
      if (this.isOver()) { clearInterval(interval); return; }
      this.timeLeft.update(v => v - 1);
      if (this.timeLeft() <= 0) {
        clearInterval(interval);
        this.isOver.set(true);
      }
    }, 1000);
  }

  handleWord(success: boolean) {
    if (success) this.points.update(p => ({ ...p, [this.turn()]: p[this.turn()] + 1 }));
    this.currentIndex.update(i => i + 1);

    // Se finiscono le carte, rimescola
    if (this.currentIndex() >= this.shuffledCards().length) {
      this.shuffledCards.set([...this.shuffledCards()].sort(() => Math.random() - 0.5));
      this.currentIndex.set(0);
    }
  }

  nextTurn() {
    this.turn.update(t => t === 'A' ? 'B' : 'A');
    this.timeLeft.set(60);
    this.isOver.set(false);
    this.startTimer();
  }
}