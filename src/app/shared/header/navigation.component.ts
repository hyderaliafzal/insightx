import { Component, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { UserProfile } from 'src/app/Models/user-profile';
import { UserProfileService } from '../services/user-profile.service';
import { LocalStorageService } from '../services/localstorage.service';
import { UserService } from '../services/user.service.service';
import { environment } from '../../../environments/environment';

declare var $: any;

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [NgbDropdownModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements AfterViewInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    private userProfileService: UserProfileService,
    private localStorageService: LocalStorageService,
    private userService: UserService
  ) { }

  public showSearch = false;
  userProfile: UserProfile = {
    userId: 0,
    firstName: '',
    lastName: '',
    email: '',
    photoURL: '',
  };

  ngOnInit(): void {
    this.userProfileService.get().subscribe((userProfile) => {
      if (userProfile?.userId === 0) {
        let userProfile =
          this.localStorageService.getItem<UserProfile>('userProfile');
        if (userProfile === null) {
          userProfile = {
            userId: 0,
            firstName: '',
            lastName: '',
            email: '',
            photoURL: '',
          };
        }
        if (userProfile.userId !== this.userProfile?.userId) {
          this.userProfile = userProfile;
          this.userProfileService.update(this.userProfile);
        }
      } else {
        this.userProfile = userProfile as UserProfile;
      }
    });
  }

  logout() {
    this.userService
      .logoutThoughConnekta(this.userProfile.userId)
      .subscribe((response) => {
        if (response.success) {
          window.location.href = environment.connecktaApp;
          this.localStorageService.clear();
        }
      });
  }

  // This is for Notifications
  notifications: Object[] = [
    {
      btn: 'btn-danger',
      icon: 'ti-link',
      title: 'Luanch Admin',
      subject: 'Just see the my new admin!',
      time: '9:30 AM',
    },
    {
      btn: 'btn-success',
      icon: 'ti-calendar',
      title: 'Event today',
      subject: 'Just a reminder that you have event',
      time: '9:10 AM',
    },
    {
      btn: 'btn-info',
      icon: 'ti-settings',
      title: 'Settings',
      subject: 'You can customize this template as you want',
      time: '9:08 AM',
    },
    {
      btn: 'btn-warning',
      icon: 'ti-user',
      title: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:00 AM',
    },
  ];

  // This is for Mymessages
  mymessages: Object[] = [
    {
      useravatar: 'assets/images/users/user1.jpg',
      status: 'online',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:30 AM',
    },
    {
      useravatar: 'assets/images/users/user2.jpg',
      status: 'busy',
      from: 'Sonu Nigam',
      subject: 'I have sung a song! See you at',
      time: '9:10 AM',
    },
    {
      useravatar: 'assets/images/users/user2.jpg',
      status: 'away',
      from: 'Arijit Sinh',
      subject: 'I am a singer!',
      time: '9:08 AM',
    },
    {
      useravatar: 'assets/images/users/user4.jpg',
      status: 'offline',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:00 AM',
    },
  ];

  public selectedLanguage: any = {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: 'us',
  };

  public languages: any[] = [
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: 'us',
    },
    {
      language: 'Español',
      code: 'es',
      icon: 'es',
    },
    {
      language: 'Français',
      code: 'fr',
      icon: 'fr',
    },
    {
      language: 'German',
      code: 'de',
      icon: 'de',
    },
  ];

  ngAfterViewInit() { }
}