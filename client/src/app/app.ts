import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: ``
})
export class App {
  constructor() {
    this.initLanguage();
  }

  private initLanguage() {
    if (!localStorage.getItem('taboo_lang')) {
      const systemLang = navigator.language.startsWith('it') ? 'it' : 'en';
      localStorage.setItem('taboo_lang', systemLang);
    }
  }
}
