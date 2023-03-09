import { useCallback, useEffect, useRef, useState } from "react";
import { Intent, PanelProps, Spinner } from "@blueprintjs/core";

import { FolderTree } from "../folder_tree";
import { Breadcrumbs } from "../breadcrumbs";
import { Action, useStore } from "../state/index";
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

  const treeRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [treeWidth, setTreeWidth] = useState(268);

  const startResizing = useCallback((e: any) => {
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback((e: any) => {
    e.stopPropagation();
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      mouseMoveEvent.stopPropagation();
      if (isResizing && !!treeRef.current) {
        setTreeWidth(
          mouseMoveEvent.clientX -
            treeRef.current.getBoundingClientRect().left ?? 0
        );
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="disk-panel">
      {!loaded && <Spinner className="spinner" intent={Intent.PRIMARY} />}
      {loaded && (
        <>
          <header className="header">
            <Breadcrumbs />
          </header>
          <div className="content">
            <aside
              ref={treeRef}
              className="tree"
              style={{ width: treeWidth }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <FolderTree disk={disk} />
            </aside>
            <div className="handler" onMouseDown={startResizing}></div>
            <aside className="graph">{!isResizing && <Graph />}</aside>
          </div>
        </>
      )}
    </div>
  );
};
