import Modal from "react-modal";
import "./neo-graph-2d.css";
import { Node, Link } from "./neo-graph";
import { NodeType } from "../unstructured-import/types/respons-types";

interface GraphModalProps {
  selectedItem: Node | Link | null;
  setSelectedItem: (item: Node | Link | null) => void;
  type: "node" | "link" | null;
}

export const GraphModal: React.FC<GraphModalProps> = ({ selectedItem, setSelectedItem, type }) => {
  const closeModal = () => {
    setSelectedItem(null);
  };

  const renderProperties = (properties: { [key: string]: any }) => {
  return Object.entries(properties).map(([key, value]) => (
    <p key={key}>
      {key}: {value}
    </p>
  ));
};

  return (
    <Modal
      isOpen={!!selectedItem}
      onRequestClose={closeModal}
      contentLabel="Graph Data Details"
      className="custom-modal"
      overlayClassName="custom-overlay"
      shouldCloseOnOverlayClick={true}
    >
      {selectedItem && (
        <div>
          <div className="close-button" onClick={closeModal} role="button">
            X
          </div>
          {type == "node" ? (
            <div>
              <h2>Node Details</h2>
              <p>Id: {(selectedItem as Node).id}</p>
              {renderProperties(selectedItem.properties)}
            </div>
          ) : type == "link" ? (
            <div>
              <h2>Link Details</h2>
              <p>Source: {(selectedItem as Link).source.id}</p>
              <p>Target: {(selectedItem as Link).target.id}</p>
              {renderProperties(selectedItem.properties)}
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
};