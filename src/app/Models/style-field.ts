export interface FieldConfig {
  defaultValue: any;
  key: string;
  label: string;
  type: string;
  tooltip: string;
  placeholder?: string;
  options?: any[];
  property?: string;
  axis?: string;
}

export interface FieldConfigGroup {
  scales?: FieldConfig[];
  graph?: FieldConfig[];
  legend?: FieldConfig[];
  tooltip?: FieldConfig[];
  hover?: FieldConfig[];
  point?: FieldConfig[];
}