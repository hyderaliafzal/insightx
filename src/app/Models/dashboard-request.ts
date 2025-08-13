import { DashboardGraphSaveRequest } from './dashboard-graph-request';

export interface DashboardSaveRequest {
  id: number;
  name: string;
  dashboardGraphs: DashboardGraphSaveRequest[] | null;
}