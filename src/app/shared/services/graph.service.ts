import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { endpoints } from '../endpoints/endpoints';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/Models/api-response';
import { GraphType } from 'src/app/Models/graph-type';
import { Graph, GraphSaveRequest } from 'src/app/Models/graph';
@Injectable({
  providedIn: 'root',
})
export class GraphService {
  constructor(private apiService: ApiService) { }

  getAllGraphs(): Observable<ApiResponse<Graph[]>> {
    return this.apiService.get<Graph[]>(endpoints.Graph);
  }

  // Get a single Graph by ID
  getGraphById(id: number): Observable<ApiResponse<Graph>> {
    return this.apiService.get<Graph>(`${endpoints.graphById}/${id}`);
  }

  // Create a new Graph
  saveGraph(graph: GraphSaveRequest): Observable<ApiResponse<Graph>> {
    return this.apiService.post<Graph>(endpoints.GraphSave, graph);
  }

  // Delete a Graph
  deleteGraph(id: number): Observable<ApiResponse<any>> {
    return this.apiService.delete<any>(`${endpoints.GraphDelete}/${id}`);
  }

  getChartTypes(): Observable<ApiResponse<GraphType[]>> {
    return this.apiService.get<GraphType[]>(endpoints.GraphType);
  }
}