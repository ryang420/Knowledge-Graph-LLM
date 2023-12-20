import "@neo4j-ndl/base/lib/neo4j-ds-styles.css";
import { useState, useEffect } from "react";
import { runImport } from "./utils/fetch-utils";
import { Switch } from "../components/switch";
import { graphSchemaToModelSchema } from "./utils/graph-schema-utils";
import KeyModal from "../components/keymodal";
import { ImportResult } from "./types/respons-types";
import { NeoGraph2D } from "../components/neo-graph-2d";
import "./App.css";
import Modal from "react-modal";


const HAS_API_KEY_URI =
  import.meta.env.VITE_HAS_API_KEY_ENDPOINT ??
  "http://localhost:7860/hasapikey";

function loadKeyFromStorage() {
  return localStorage.getItem("api_key");
}

function App() {
  const [serverAvailable, setServerAvailable] = useState(true);
  const [needsApiKeyLoading, setNeedsApiKeyLoading] = useState(true);
  const [needsApiKey, setNeedsApiKey] = useState(true);
  const [useSchema, setUseSchema] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [schema, setSchema] = useState<string>("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(loadKeyFromStorage() || "");

  const initDone = serverAvailable && !needsApiKeyLoading;

  const [saveModalIsOpen, setSaveModalIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updateGraphInProgress, setUpdateGraphInProgress] = useState(false);


  useEffect(() => {
    fetch(HAS_API_KEY_URI).then(
      (response) => {
        response.json().then(
          (result) => {
            const needsKey = !result.output;
            setNeedsApiKey(needsKey);
            setNeedsApiKeyLoading(false);
            if (needsKey) {
              const api_key = loadKeyFromStorage();
              if (api_key) {
                setApiKey(api_key);
              } else {
                setModalIsOpen(true);
              }
            }
          },
          (error) => {
            setNeedsApiKeyLoading(false);
            setServerAvailable(false);
          },
        );
      },
      (error) => {
        setNeedsApiKeyLoading(false);
        setServerAvailable(false);
      },
    );
  }, []);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const onCloseModal = () => {
    setModalIsOpen(false);
  };

  const onApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem("api_key", newApiKey);
  };

  const handleImport = async () => {
    if (!serverAvailable || needsApiKeyLoading) {
      return;
    }
    setLoading(true);
    setResult(null);
    const file = document.querySelector(".file-input") as HTMLInputElement;
    const reader = new FileReader();
    reader.onload = async () => {
      console.log(reader.result);
      try {
        console.log("running import");
        console.log("raw schema", schema);
        const schemaJson = useSchema
          ? graphSchemaToModelSchema(schema)
          : undefined;
        console.log("schema json", schemaJson);
        const importResult = await runImport(
          reader.result as string,
          schemaJson,
          needsApiKey ? apiKey : undefined,
        );
        console.log("import result", importResult);

        if (importResult) {
          console.log(importResult);
          setResult(importResult);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file.files![0]);
  };

  const handleSaveToNeo4j = async () => {
    setIsSaving(true);
    // sleep to make sure the modal is shown
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const response = await fetch(
      `${import.meta.env.VITE_UNSTRUCTURED_IMPORT_BACKEND_ENDPOINT}/save_graph`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      },
    );

    const saveResult = await response.json();
    console.log("saved result: ", saveResult);
    // Show the modal when the save is done
    setSaveModalIsOpen(true);
    setIsSaving(false);
  };

  const handleChangeGraphCommand = async (e: any, apiKey?: string) => {
    const body = {
      user_input: e.target.value,
      graph_data: JSON.stringify(result),
    };
    if (apiKey) {
      // @ts-ignore
      body.api_key = apiKey;
    }
    if (e.key == "Enter") {
      setUpdateGraphInProgress(true);
      const response = await fetch(
        `${import.meta.env.VITE_UNSTRUCTURED_IMPORT_BACKEND_ENDPOINT}/update_graph`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      if (!response.ok) {
        setUpdateGraphInProgress(false);
        return Promise.reject(
          new Error(`Failed to update: ${response.statusText}`),
        );
      }

      const res = await response.json();

      if (res.status == "ok") {
        console.log("updated graph data from llm: ", res.data);
        setResult(res.data)
      } else {
        console.log("failed to update graph data from llm: ");
      }

      setUpdateGraphInProgress(false);
    }
  };

  if (serverAvailable) {
    return (
      <div className="min-h-screen n-bg-palette-neutral-bg-default">
        {needsApiKey && (
          <div className="flex justify-end mr-4">
            <button onClick={openModal}>API Key</button>
          </div>
        )}
        <KeyModal
          isOpen={initDone && needsApiKey && modalIsOpen}
          onCloseModal={onCloseModal}
          onApiKeyChanged={onApiKeyChange}
          apiKey={apiKey}
        />
        <main className="flex flex-col gap-10 p-2">
          <div className="flex flex-col w-2/3 max-w-2xl min-h-0 gap-2 mx-auto mt-10">
            <h1 className="text-4xl font-bold text-center">Import data</h1>
            <p>
              This tool is used to import unstructured data into Neo4j. It takes
              a file as input and optionally a schema in the form of{" "}
              <a href="https://neo4j.com/developer-blog/describing-property-graph-data-model/">
                <b>graph data model</b>
              </a>{" "}
              which is used to limit the data that is extracted from the file.
              It's important to give the schema descriptive tokens so the tool
              can identify the data that is imported.
            </p>

            <Switch
              label="Use schema"
              checked={useSchema}
              onChange={() => setUseSchema(!useSchema)}
            />
            {useSchema ? (
              <div className="flex flex-col gap-4">
                {"Please provide your schema in json format:"}
                <textarea
                  className="px-3 border rounded-sm body-medium border-palette-neutral-border-strong bg-palette-neutral-bg-weak"
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                />
              </div>
            ) : null}

            <input type="file" className={`w-full max-w-xs file-input`} />
            <button
              className={`ndl-btn ndl-large ndl-filled ndl-primary n-bg-palette-primary-bg-strong ${
                loading ? "ndl-loading" : ""
              }`}
              onClick={handleImport}
              disabled={!initDone}
            >
              {loading ? "Importing. This will take a while..." : "Import"}
            </button>
          </div>
          {result ? (
            <div>
              <div className="flex flex-col w-2/3 gap-2 mx-auto">
                <h1 className="text-4xl font-bold text-center">Result</h1>
                <p>
                  The import was successful. You can save the result into Neo4j DB.
                </p>
                <button
                  className={`ndl-btn ndl-large ndl-filled ndl-primary n-bg-palette-primary-bg-strong 
                    ${isSaving ? "ndl-loading" : ""}`}
                  onClick={handleSaveToNeo4j}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving to Neo4j..." : "Save to Neo4j"}
                </button>
                <Modal
                  isOpen={saveModalIsOpen}
                  onRequestClose={() => setSaveModalIsOpen(false)}
                  contentLabel="Save Result"
                  className="save-modal-content"
                >
                  <h2>Save Result</h2>
                  <p>The data has been successfully saved to Neo4j.</p>
                  <button onClick={() => setSaveModalIsOpen(false)} className="close-button">X</button>
                </Modal>
              </div>
              <div className="flex flex-col w-2/3 gap-2 mx-auto">
                <h1>Use natural language to operate graph data</h1>
                <input
                  id="graph_command"
                  type="text"
                  className="px-3 border rounded-sm body-medium border-palette-neutral-border-strong bg-palette-neutral-bg-weak text-height"
                  onKeyDown={handleChangeGraphCommand}
                  disabled={updateGraphInProgress}
                />
              </div>
              {updateGraphInProgress && (
                <div className="overlay">
                  <p>Loading...</p>
                </div>
              )}
              <div className="flex flex-col w-2/3 gap-2 mx-auto grey-background">
                <p>Graph Data Visualization</p>
                <NeoGraph2D graph_raw_data={result} />
              </div>
            </div>
          ) : null}
        </main>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen n-bg-palette-neutral-bg-default">
        <main className="flex flex-col gap-10 p-2">
          <div className="flex flex-col w-2/3 min-h-0 gap-2 mx-auto mt-10">
            <p></p>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
