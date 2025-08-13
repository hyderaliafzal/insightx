import { ChartType } from 'chart.js';

export interface GraphType {
  id: number;
  type: ChartType;
  label: string;
  icon: string;
  isActive:boolean
}