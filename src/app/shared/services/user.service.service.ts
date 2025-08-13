import { Injectable } from '@angular/core';
import { endpoints } from '../endpoints/endpoints';
import { ApiResponse } from 'src/app/Models/api-response';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserProfile } from 'src/app/Models/user-profile';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private apiService: ApiService) { }

  validate(): Observable<ApiResponse<UserProfile>> {
    return this.apiService.get<UserProfile>(endpoints.validateUser);
  }

  logoutThoughConnekta(userId: number): Observable<ApiResponse<any>> {
    return this.apiService.getCore<any>(
      environment.conneckta.apiBaseUrl,
      `${endpoints.logout}?userId=${userId}`
    );
  }
}