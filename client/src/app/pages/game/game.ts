import { Component, computed, effect, ElementRef, inject, OnDestroy, resource, signal, viewChild } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { DialogModule } from 'primeng/dialog';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Settings } from "../../dialogs/settings/settings";
import { GameOver } from "../../dialogs/game-over/game-over";

interface Card {
  word: string;
  forbidden: string[];
}

export type FeedbackMode = 'all' | 'vibration' | 'none';
export type Language = 'it' | 'en';

@Component({
  selector: 'app-game',
  imports: [SharedModule, DialogModule, Settings, GameOver],
  templateUrl: './game.html',
  styles: ``,
  host: { class: 'block h-dvh w-full overflow-hidden bg-amber-400 p-4 font-sans selection:bg-purple-200' }
})
export class Game implements OnDestroy {
  private http = inject(HttpClient);
  private timerInterval: any = null;
  private hasPlayedGameOver = false;

  private sounds = {
    success: new Audio('sounds/success.mp3'),
    error: new Audio('sounds/error.mp3'),
    timer: new Audio('sounds/timer-beep.mp3'),
    over: new Audio('sounds/game-over.mp3')
  };

  // --- STATI ---
  feedbackMode = signal<FeedbackMode>((localStorage.getItem('taboo_feedback') as FeedbackMode) ?? 'all');
  language = signal<Language>((localStorage.getItem('taboo_lang') as Language) ?? 'it');
  points = signal(JSON.parse(localStorage.getItem('taboo_score') ?? '{"A":0,"B":0}'));
  turn = signal<'A' | 'B'>('A');
  timeLeft = signal(60);
  currentIndex = signal(0);
  isOver = signal(false);
  showSettings = signal(false);
  shuffledCards = signal<Card[]>([]);
  skipsLeft = signal(3);

  // --- ANIMAZIONI ---
  isShowingError = signal(false);
  isShowingSuccess = signal(false);
  isAnimating = computed(() => this.isShowingError() || this.isShowingSuccess());
  cardElement = viewChild<ElementRef>('card');

  // --- DATA ---
  cardsResource = resource({
    loader: () => firstValueFrom(this.http.get<Card[]>('game-data.json'))
  });

  currentCard = computed(() => {
    const cards = this.shuffledCards();
    return cards.length > 0 ? cards[this.currentIndex() % cards.length] : null;
  });

  constructor() {
    effect(() => {
      const data = this.cardsResource.value();
      if (data?.length && !this.shuffledCards().length) {
        this.shuffledCards.set([...data].sort(() => Math.random() - 0.5));
      }
    });

    effect(() => localStorage.setItem('taboo_score', JSON.stringify(this.points())));
    effect(() => localStorage.setItem('taboo_feedback', this.feedbackMode()));
    effect(() => localStorage.setItem('taboo_lang', this.language()));
  }

  ngOnInit() {
    this.startTimer();
  }

  private startTimer() {
    this.stopTimer();
    this.hasPlayedGameOver = false;
    this.timerInterval = setInterval(() => {
      if (this.isOver() || this.showSettings()) return;
      this.timeLeft.update(t => {
        const next = t - 1;
        if (next <= 5 && next > 0) this.triggerFeedback('timer', 0);
        if (next <= 0) this.handleTimeout();
        return next;
      });
    }, 1000);
  }

  private handleTimeout() {
    this.stopTimer();
    if (!this.hasPlayedGameOver) {
      this.hasPlayedGameOver = true;
      this.isOver.set(true);
      this.triggerFeedback('over', [200, 100, 200]);
    }
  }

  private stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  private triggerFeedback(soundKey: keyof typeof this.sounds, vibrationPattern: number | number[]) {
    const mode = this.feedbackMode();
    if (mode === 'none') return;
    if ('vibrate' in navigator && vibrationPattern !== 0) navigator.vibrate(vibrationPattern);
    if (mode === 'all') {
      const s = this.sounds[soundKey];
      s.pause(); s.currentTime = 0;
      s.play().catch(() => { });
    }
  }

  handleWord(success: boolean) {
    if (this.isAnimating() || this.isOver()) return;
    this.points.update(p => {
      const score = p[this.turn()];
      return { ...p, [this.turn()]: success ? score + 1 : Math.max(0, score - 1) };
    });
    this.triggerFeedback(success ? 'success' : 'error', success ? 50 : [100, 50, 100]);
    this.triggerAnimation(success);
  }

  skipWord() {
    if (this.skipsLeft() > 0 && !this.isAnimating() && !this.isOver()) {
      this.skipsLeft.update(s => s - 1);
      if (this.feedbackMode() !== 'none' && 'vibrate' in navigator) navigator.vibrate(30);
      this.currentIndex.update(i => i + 1);
    }
  }

  private triggerAnimation(success: boolean) {
    if (success) this.isShowingSuccess.set(true);
    else this.isShowingError.set(true);
    setTimeout(() => {
      this.isShowingSuccess.set(false);
      this.isShowingError.set(false);
      this.currentIndex.update(i => i + 1);
    }, success ? 300 : 250);
  }

  nextTurn() {
    this.stopTimer();
    this.turn.update(t => t === 'A' ? 'B' : 'A');
    this.skipsLeft.set(3);
    this.timeLeft.set(60);
    this.isOver.set(false);
    this.currentIndex.update(i => i + 1);
    this.startTimer();
  }

  resetGame() {
    this.stopTimer();
    localStorage.removeItem('taboo_score');
    this.points.set({ A: 0, B: 0 });
    this.currentIndex.set(0);
    this.showSettings.set(false);
    this.nextTurn();
  }

  ngOnDestroy() { this.stopTimer(); }
}