import ForceGraph2D from "react-force-graph-2d";
import { useRef, useState } from "react";
import "./neo-graph-2d.css";
import { GraphModal } from "./graph-data-modal";
import { GraphData, Node, Link } from "./neo-graph";
import { ImportResult } from "../unstructured-import/types/respons-types";

// define a function to transform raw data into GraphData format
const transform_raw_graph_data = (raw_data: any) => {
  const links = raw_data["relationships"]
    ? raw_data["relationships"].map((link: any) => {
        return {
          source: link["source"]["id"],
          target: link["target"]["id"],
          type: link["type"],
          properties: link["properties"],
        };
      })
    : [];

  return {
    nodes: raw_data["nodes"],
    links: links,
  };
};

export const NeoGraph2D = ({ graph_raw_data }: { graph_raw_data: ImportResult }) => {
  const fgRef = useRef();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [selectedType, setSelectedType] = useState<"node" | "link" | null>(null);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setSelectedType("node");
  };

  const handleLinkClick = (link: Link) => {
    setSelectedLink(link);
    setSelectedType("link");
  };

  return (
    <>
      <ForceGraph2D
        ref={fgRef}
        width={1000}
        graphData={transform_raw_graph_data(graph_raw_data)}
        nodeAutoColorBy="id"
        linkAutoColorBy="source"
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={1}
        nodeRelSize={8}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node: Node, ctx: any, globalScale) => {
          const label = node.id;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.fillStyle = "black";
          ctx.fillText(label, node.x ? node.x : 0, node.y ? node.y + 1 : 0);
        }}
        linkCanvasObjectMode={() => "after"}
        linkCanvasObject={(link: Link, ctx: any, globalScale) => {
          const label = link.type;
          const fontSize = 10 / globalScale;

          // Calculate the middle point of the link
          if (link.source.x !== undefined
            && link.target.x !== undefined
            && link.source.y !== undefined
            && link.target.y !== undefined) {
            const middleX = (link.source.x + link.target.x) / 2;
            const middleY = (link.source.y + link.target.y) / 2;

            // Draw link label
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = "black";
            ctx.fillText(label, middleX, middleY);
          }
        }}
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
        }}
        onNodeClick={handleNodeClick}
        onLinkClick={handleLinkClick}
      />

      <GraphModal
        selectedItem={selectedNode || selectedLink}
        setSelectedItem={item => {
          setSelectedNode(null);
          setSelectedLink(null);
        }}
        type={selectedType}
      />
    </>
  );
};