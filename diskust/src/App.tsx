import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { FolderTree } from "./folder_tree";
import "./../node_modules/normalize.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="container bp4-dark">
      <aside className="tree">
        <FolderTree />
      </aside>
      <aside className="graph">graph</aside>
    </div>
  );
}

export default App;
