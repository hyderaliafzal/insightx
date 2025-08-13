import { GraphColumn, GraphColumnSaveRequest } from '../Models/graph-column';
import { GraphType } from './graph-type';
import { TableFilter } from './table-filter';

export interface Graph {
  id: number;
  name: string;
  typeId: number;
  dataSource: string;
  matricFunction: string,
  graphType: GraphType | null;
  graphColumns: GraphColumn[];
  graphTableFilters: TableFilter[];
  selectedTableColumns: SelectedTableColumns[];
  graphStyling: SelectedTableColumns[];
}

export interface GraphSaveRequest {
  id: number;
  name: string;
  typeId: number;
  dataSource: string;
  matricFunction: string,
  graphColumns: GraphColumnSaveRequest[];
  graphTableFilters: TableFilter[];
  selectedTableColumns: SelectedTableColumns[];
  graphStyling: SelectedTableColumns[];
}

export interface SelectedTableColumns {
  id: number,
  name: string
}

export interface GraphStyling {
  name: string,
  type: string,
  scriptable: string,
  indexable: string,
  default: string,
  backgroundColor: string,
  base: string,
  barPercentage: 0,
  barThickness: string,
  borderColor: string,
  borderSkipped: string,
  borderWidth: 0,
  borderRadius: 0,
  categoryPercentage: 0,
  clip: string,
  data: string,
  required: string,
  grouped: string,
  hoverBackgroundColor: string,
  hoverBorderColor: string,
  hoverBorderWidth: 0,
  hoverBorderRadius: 0,
  indexAxis: string,
  inflateAmount: string,
  maxBarThickness: string,
  minBarLength: string,
  label: string,
  order: 0,
  pointStyle: string,
  skipNull: string,
  stack: string,
  xAxisID: string,
  yAxisID: string,
  borderDash: string,
  borderAlign: string,
  borderDashOffset: string,
  borderJoinStyle: string,
  offset: string,
  rotation: string,
  spacing: string,
  weight: string,
  borderCapStyle: string,
  legendFontSize: string,
  legendFontStyle: string,
  legendFontWeight: string,
  legendFontFamily: string,
  tooltipFontSize: string,
  tooltipFontStyle: string,
  tooltipFontWeight: string,
  tooltipFontFamily: string,
  hoverBorderDash: string,
  hoverBorderDashOffset: string,
  hoverBorderJoinStyle: string,
  hoverOffset: string,
  hoverBorderCapStyle: string,
  pointBackgroundColor: string,
  pointBorderColor: string,
  pointBorderWidth: 0,
  pointRadius: 0,
  pointHitRadius: 0,
  pointHoverBackgroundColor: string,
  pointHoverBorderColor: string,
  pointHoverBorderWidth: 0,
  pointHoverRadius: 0,
  pointRotation: string
}