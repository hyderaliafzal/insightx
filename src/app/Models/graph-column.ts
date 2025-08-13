export interface GraphColumn {
  id: number;
  graphId: number;
  name: string;
  isNumber: boolean;
}

export interface GraphColumnSaveRequest {
  id: number | null;
  graphId: number | null;
  name: string;
  isNumber: boolean;
}