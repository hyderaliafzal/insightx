import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from 'src/app/Models/api-response';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) { }

  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${environment.baseUrl}/${endpoint}`);
  }

  getCore<T>(baseUrl: string, endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${baseUrl}/${endpoint}`);
  }

  // POST request
  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(
      `${environment.baseUrl}/${endpoint}`,
      body
    );
  }

  // POST request
  postBlob(endpoint: string, body: any): Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/${endpoint}`, body, {
      headers: new HttpHeaders({ Accept: 'application/octet-stream' }),
      responseType: 'blob' as 'json',
    });
  }

  // PUT request
  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(
      `${environment.baseUrl}/${endpoint}`,
      body
    );
  }

  // DELETE request
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(
      `${environment.baseUrl}/${endpoint}`
    );
  }
}