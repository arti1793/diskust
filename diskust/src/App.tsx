import { useEffect, useState } from "react";
import { Intent, ProgressBar, Spinner } from "@blueprintjs/core";

import { FolderTree } from "./folder_tree";
import { Breadcrumbs } from "./breadcrumbs";
import { Action, State, useStore } from "./state/index";

import "./../node_modules/normalize.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "./App.css";
import { loadNodes } from "./state/api/load_nodes";

function App() {
  const [loaded, setIsLoaded] = useState(false);
  const [, dispatch] = useStore();
  useEffect(() => {
    loadNodes()
      .then((root) => {
        dispatch({
          payload: root,
          type: Action.ROOT_UPDATE,
        });
      })
      .finally(() => setIsLoaded(true));
  }, []);

  return (
    <div className="container bp4-dark">
      {!loaded && <Spinner className="spinner" intent={Intent.PRIMARY} />}
      <header className="header">
        <Breadcrumbs />
      </header>
      <div className="content">
        <aside className="tree">
          <FolderTree />
        </aside>
        <aside className="graph">graph</aside>
      </div>
    </div>
  );
}

export default App;
