export type NodeType = {
  label: string;
  name: string;
  id: string;
  properties: Record<string, string>;
};

export type RelationshipType = {
  type: string;
  start: string;
  end: string;
  properties: Record<string, string>;
};

export type ImportResult = {
  nodes: Array<NodeType>;
  relationships: Array<RelationshipType>;
  source?: Map<string, string>;
};
