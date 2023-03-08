import { useEffect, useState } from "react";
import { Intent, PanelProps, ProgressBar, Spinner } from "@blueprintjs/core";

import { FolderTree } from "../folder_tree";
import { Breadcrumbs } from "../breadcrumbs";
import { Action, State, useStore } from "../state/index";
import { loadNodes } from "../state/api/load_nodes";
import { Graph } from "../graph";
import { DiskInfo } from "../state";

import "./index.css";

export type DiskPanelProps = { disk: DiskInfo };
export const DisksPanel: React.FC<PanelProps<DiskPanelProps>> = ({ disk }) => {
  const [loaded, setIsLoaded] = useState(false);
  const [, dispatch] = useStore();
  useEffect(() => {
    loadNodes(disk.path)
      .then((root) => {
        dispatch({
          payload: root,
          type: Action.ROOT_UPDATE,
        });
      })
      .finally(() => setIsLoaded(true));
  }, []);

  return (
    <div className="">
      {!loaded && <Spinner className="spinner" intent={Intent.PRIMARY} />}
      {loaded && (
        <>
          <header className="header">
            <Breadcrumbs />
          </header>
          <div className="content">
            <aside className="tree">
              <FolderTree disk={disk} />
            </aside>
            <aside className="graph">
              <Graph />
            </aside>
          </div>
        </>
      )}
    </div>
  );
};
