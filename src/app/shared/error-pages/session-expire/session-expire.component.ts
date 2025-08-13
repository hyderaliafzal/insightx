import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sessionexpire',
  standalone: true,
  imports: [NzButtonModule, NzResultModule],
  templateUrl: './session-expire.component.html',
  styleUrl: './session-expire.component.scss',
})
export class SessionExpireComponent {
  constructor() { }
  redirectToLogin() {
    window.location.href = environment.conneckta.tenantLogin;
  }
}