/**
 * A node or relationship as selected in the graph.
 */
export interface GraphEntity {
  properties: any;
  type: string;
}

export interface Node extends GraphEntity {
  id: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

export interface Link extends GraphEntity {
  source: Node;
  target: Node;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}