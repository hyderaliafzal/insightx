import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { ApiResponse } from '../../Models/api-response';
import { Dashboard } from '../../Models/dashboard-list';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private sidebarnavItemsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public sidebarnavItems$: Observable<any[]> = this.sidebarnavItemsSubject.asObservable();

  constructor(private dashboardService: DashboardService) {
    this.loadSidebarData();
  }

  loadSidebarData() {
    this.dashboardService.get().subscribe(
      (response: ApiResponse<Array<Dashboard>>) => {
        const updatedItems: any[] = [];
        if (response.success) {
          response.data.forEach((m) => {
            updatedItems.push({
              path: m.id,
              title: m.name,
              icon: '',
              class: '',
              extralink: false,
              submenu: [],
            });
          });
          this.updateSidebarNavItems(updatedItems);
        }
      },
      (error) => {
        console.error('Error fetching dashboard data:', error);
      }
    );
  }

  public getSidebarNavItems(): Observable<any[]> {
    return this.sidebarnavItems$;
  }

  private updateSidebarNavItems(newItems: any[]) {
    this.sidebarnavItemsSubject.next(newItems);
  }
}