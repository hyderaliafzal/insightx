export interface DataMergeRequest {
  id: number,
  mergeQueryId: number,
  leftTable: "string",
  leftTableAlias: "string",
  rightTable: "string",
  rightTableAlias: "string",
  primaryKey: "string",
  operator: "string",
  foreignKey: "string"
}