import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../shared/services/localstorage.service';
import { UserService } from '../shared/services/user.service.service';
import { ApiResponse } from '../Models/api-response';
import { UserProfileService } from '../shared/services/user-profile.service';
import { UserProfile } from '../Models/user-profile';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  token: string = '';

  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private localStorageService: LocalStorageService,
    private userService: UserService,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.activateRoute.queryParams.subscribe((param) => {
      this.token += param['token'];
    });
    if (this.token) {
      this.localStorageService.clear();
      this.localStorageService.setItem('token', this.token);
      this.userService.validate().subscribe(
        (response: ApiResponse<UserProfile>) => {
          if (response.success === true) {
            this.userProfileService.update(response.data);
            this.localStorageService.setItem('userProfile', response.data);
            this.router.navigate(['/dashboard']);
          } 
          else if (response.message === 'User not found') {
            this.localStorageService.removeItem('token');
            this.router.navigate(['/accessdenied']);
          } 
          else if (response.message === 'User session is expired.') {
            this.localStorageService.removeItem('token');
            this.router.navigate(['/sessionexpired']);
          }
        },
        (error: Error) => {
          console.log(error);
        }
      );
    }
  }
}