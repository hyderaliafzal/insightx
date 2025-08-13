import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { endpoints } from '../endpoints/endpoints';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/Models/api-response';
import { DataSource } from 'src/app/Models/data-source';
import { Header } from 'src/app/Models/header';
import { KeyValueData } from 'src/app/Models/key-value';
import { ExportRequest } from 'src/app/Models/export-request';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private apiService: ApiService) { }

  getCsv(payload: ExportRequest): Observable<any> {
    return this.apiService.postBlob(endpoints.dataAsCsv, payload);
  }

  getAllDataSources(): Observable<ApiResponse<Array<DataSource>>> {
    return this.apiService.get<Array<DataSource>>(endpoints.getAllDataSource);
  }

  getColumns(dataSource: string): Observable<ApiResponse<Array<Header>>> {
    return this.apiService.get<Array<Header>>(
      `${endpoints.getColumns}?dataSource=${dataSource}`
    );
  }

  getDataForGraph(
    dataSource: string,
    xColumn: string,
    yColumn: string | null = null,
    matricFunction: string | null = null,
    filters: any[] = [],
  ): Observable<ApiResponse<Array<KeyValueData>>> {
    let payload = {
      dataSource: dataSource,
      xColumn: xColumn,
      yColumn: yColumn,
      matricFunction: matricFunction,
      filters: filters
    };
    return this.apiService.post<Array<KeyValueData>>(
      endpoints.getGraphData,
      payload
    );
  }

  getDataForTable(payload: any): Observable<ApiResponse<Array<any>>> {
    return this.apiService.post<Array<any>>(endpoints.all, payload);
  }

  getMatricOperationValue(payload: any): Observable<ApiResponse<Array<any>>> {
    return this.apiService.post<Array<any>>(endpoints.GetMatricOperationValue, payload);
  }
}