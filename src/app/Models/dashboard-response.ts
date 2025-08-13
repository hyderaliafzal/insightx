import { DashboardGraphResponse } from './dashboard-graph-response';

export interface DashboardResponse {
  id: number;
  name: string;
  dashboardGraphs: DashboardGraphResponse[];
}