import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-accessdenied',
  standalone: true,
  imports: [NzButtonModule, NzResultModule],
  templateUrl: './accessdenied.component.html',
  styleUrl: './accessdenied.component.scss',
})
export class AccessDeniedComponent {
  constructor() { }
  redirectToLogin() {
    window.location.href = environment.conneckta.tenantLogin;
  }
}