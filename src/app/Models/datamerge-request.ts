import { DataMergeRequest } from './merge-query-request';

export interface DataMergeSaveRequest {
  id: number;
  name: string;
  mergeQueryDetails: DataMergeRequest[] | null;
}