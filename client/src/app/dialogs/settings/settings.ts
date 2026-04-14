import { Component, input, output } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { DialogModule } from 'primeng/dialog';
import { FeedbackMode, Language } from '../../pages/game/game';

@Component({
  selector: 'app-settings',
  imports: [SharedModule, DialogModule],
  templateUrl: './settings.html',
  styles: ``,
})
export class Settings {
  visible = input.required<boolean>();
  mode = input.required<FeedbackMode>();
  lang = input.required<Language>();

  onClose = output<void>();
  onReset = output<void>();
  onFeedbackChange = output<FeedbackMode>();
  onLangChange = output<Language>();
}
