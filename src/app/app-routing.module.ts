import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { DataMergeComponent } from './data-merge/data-merge.component';
import { ListComponent } from './list/list.component';
import { AccessDeniedComponent } from './shared/error-pages/access-denied/accessdenied.component';
import { authGuard } from './auth-guard/auth-guard';
import { LoginComponent } from './login/login.component';
import { SessionExpireComponent } from './shared/error-pages/session-expire/session-expire.component';
import { EmbedGraphComponent } from './embed-graph/embed-graph.component';

export const Approutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        data: { title: 'Dashboard' },
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [authGuard]
      },
      {
        path: 'dashboard/:id',
        data: { title: 'Dashboard' },
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [authGuard]
      },
      {
        path: 'graph/:id',
        data: { title: 'Graph' },
        loadComponent: () =>
          import('./new-chart/new-chart.component').then(
            (m) => m.NewChartComponent
          ),
        canActivate: [authGuard]
      },
      {
        path: 'graph',
        data: { title: 'Graph' },
        loadComponent: () =>
          import('./new-chart/new-chart.component').then(
            (m) => m.NewChartComponent
          ),
        canActivate: [authGuard]
      },
      {
        path: 'saved-graphs',
        data: { title: 'Saved Graphs' },
        loadComponent: () =>
          import('./saved-graph/saved-graph.component').then(
            (m) => m.SavedGraphComponent
          ),
        canActivate: [authGuard]
      },
      {
        path: 'data-merge',
        data: { title: 'Data Merge' },
        children: [
          { path: '', component: DataMergeComponent, canActivate: [authGuard] },
          {
            path: 'edit/:id',
            component: DataMergeComponent,
            canActivate: [authGuard]
          },
          { path: 'list', component: ListComponent, canActivate: [authGuard] },
        ],
        canActivate: [authGuard]
      },
    ],
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'accessdenied',
    component: AccessDeniedComponent,
    pathMatch: 'full',
  },
  {
    path: 'sessionexpired',
    component: SessionExpireComponent,
    pathMatch: 'full',
  },
  {
    path: 'embed/:id',
    component: EmbedGraphComponent,
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard/',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(Approutes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }