import { TableFilter } from "./table-filter";

export interface DashboardGraphRenderDetails {
  uid: number;
  id: number;
  graphId: number;
  graphTitle: string;
  graphTypeName: string;
  dataSource: any;
  XColumnName: string;
  YColumnName: string | null;
  graphTableFilters: TableFilter[]
  graphStyling: any;
  x: number;
  y: number;
  matricFunction: string | null
  height: number;
  width: number;
}