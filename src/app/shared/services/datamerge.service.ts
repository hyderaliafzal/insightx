import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { endpoints } from '../endpoints/endpoints';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/Models/api-response';
import { DataMergeSaveRequest } from 'src/app/Models/datamerge-request';
import { DashboardResponse } from 'src/app/Models/dashboard-response';
@Injectable({
  providedIn: 'root',
})
export class DataMergeService {

  constructor(private apiService: ApiService) { }

  getById(id: number): Observable<ApiResponse<DashboardResponse>> {
    return this.apiService.get<DashboardResponse>(`${endpoints.GetDashboardById}/${id}`);
  }

  getAllDataMerge(pageNumber: number, pageSize: number, search?: string): Observable<any> {
    let url = search ? `${endpoints.getAllDataMerge}?Search=${search}&PageSize=${pageSize}&PageNumber=${pageNumber}` : `${endpoints.getAllDataMerge}?PageSize=${pageSize}&PageNumber=${pageNumber}`;
    return this.apiService.get(url);
  }
  getDataMergeById(id?: number): Observable<any> {
    const url = id ? `${endpoints.getAllDataMerge}?Id=${id}` : `${endpoints.getAllDataMerge}`;
    return this.apiService.get(url);
  }

  saveDataMerge(dataMerge: DataMergeSaveRequest): Observable<ApiResponse<null>> {
    return this.apiService.post<null>(endpoints.saveDataMerge, dataMerge);
  }

  deleteDataMerge(id: number): Observable<ApiResponse<null>> {
    return this.apiService.delete<null>(`${endpoints.deleteDataMerge}/${id}`);
  }
}