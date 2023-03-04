import * as React from "react";
import { filesize } from "filesize";
import { Classes, Icon, Intent, Tree, TreeNodeInfo } from "@blueprintjs/core";
import { Action, Diskust, useStore } from "../state";
import { isEmpty } from "lodash";
import "./index.css";

const mapNode = (node: Diskust): TreeNodeInfo => {
  return {
    id: node?.path_str,
    label: " " + node?.path_str,
    hasCaret: node?.is_dir && !isEmpty(node.nodes),
    secondaryLabel: (
      <span className="size">{filesize(node?.size).toString()}</span>
    ),
    icon: node.is_file ? null : (
      <Icon icon={node.is_open ? "folder-open" : "folder-close"} />
    ),
    isExpanded: node?.is_open,
    childNodes: (node.nodes ?? []).map((n) => mapNode(n)),
  };
};

export const FolderTree: React.FC<{}> = () => {
  const [{ root }, dispatch] = useStore();
  let contents = React.useMemo(() => {
    let current = root;
    if (!root) return [];
    return [mapNode(root)];
  }, [root]);
  console.log({ contents, root });
  return (
    <Tree
      contents={contents}
      onNodeExpand={({ id }) =>
        dispatch({ payload: id as string, type: Action.NODE_OPEN })
      }
      onNodeCollapse={({ id }) =>
        dispatch({ payload: id as string, type: Action.NODE_CLOSE })
      }
      className={Classes.ELEVATION_0}
    />
  );
};
