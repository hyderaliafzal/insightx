import { TableFilter } from './table-filter';

export interface ExportRequest {
  DataSource: string;
  Filters: TableFilter[];
}