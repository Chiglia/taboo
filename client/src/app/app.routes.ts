import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/rules/rules').then(m => m.Rules) },
    { path: 'play', loadComponent: () => import('./pages/game/game').then(m => m.Game) },
    {
        path: '**',
        redirectTo: ''
    }
];
