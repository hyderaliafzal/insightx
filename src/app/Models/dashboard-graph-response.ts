import { Graph } from "./graph";

export interface DashboardGraphResponse {
  id: number;
  x: number;
  y: number;
  height: number;
  width: number;
  graphId: number;
  graph: Graph;
  graphStyling: [];
}