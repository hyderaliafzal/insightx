import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { endpoints } from '../endpoints/endpoints';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/Models/api-response';
import { DashboardSaveRequest } from 'src/app/Models/dashboard-request';
import { Dashboard } from 'src/app/Models/dashboard-list';
import { DashboardResponse } from 'src/app/Models/dashboard-response';
@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  constructor(private apiService: ApiService) { }

  getById(id: number): Observable<ApiResponse<DashboardResponse>> {
    return this.apiService.get<DashboardResponse>(`${endpoints.GetDashboardById}/${id}`);
  }

  get(): Observable<ApiResponse<Array<Dashboard>>> {
    return this.apiService.get<Array<Dashboard>>(`${endpoints.GetDashboard}`);
  }

  saveDashboard(dashboard: DashboardSaveRequest): Observable<ApiResponse<null>> {
    return this.apiService.post<null>(endpoints.dashboardSave, dashboard);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.apiService.delete<null>(`${endpoints.deleteDashboard}/${id}`);
  }

  updateSortOrder(dashboards: DashboardSaveRequest[]) {
    return this.apiService.post<null>(endpoints.dashboardUpdateSortOrder, dashboards);
  }
}