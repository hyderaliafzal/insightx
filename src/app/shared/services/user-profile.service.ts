import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProfile } from 'src/app/Models/user-profile';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  constructor() { }

  private subject: BehaviorSubject<UserProfile> =
    new BehaviorSubject<UserProfile>({
      userId: 0,
      firstName: '',
      lastName: '',
      email: '',
      photoURL: '',
    });

  public userProfile$: Observable<UserProfile> = this.subject.asObservable();

  update(userProfile: UserProfile) {
    this.subject.next(userProfile);
  }

  get(): Observable<UserProfile | null> {
    return this.userProfile$;
  }
}