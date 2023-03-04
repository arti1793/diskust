import * as React from "react";
import { filesize } from "filesize";
import { Classes, Icon, Intent, Tree, TreeNodeInfo } from "@blueprintjs/core";
import { Action, Diskust, useStore } from "../state";
import { isEmpty } from "lodash";
import "./index.css";

const mapNode = (node: Diskust): TreeNodeInfo => {
  return {
    id: node?.whole_path_str,
    label: <span className="label"> {node?.name}</span>,
    hasCaret: node?.is_dir && !isEmpty(node.nodes),
    secondaryLabel: (
      <span className="size">{filesize(node?.size).toString()}</span>
    ),
    icon: node.is_file ? null : (
      <Icon icon={node.is_open ? "folder-open" : "folder-close"} />
    ),
    isExpanded: node?.is_open,
    isSelected: node?.is_selected,
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
  return (
    <Tree
      contents={contents}
      onNodeExpand={({ id }) =>
        dispatch({ payload: id as string, type: Action.NODE_OPEN })
      }
      onNodeClick={({ id }) =>
        dispatch({ payload: id as string, type: Action.NODE_TOGGLE })
      }
      onNodeCollapse={({ id }) =>
        dispatch({ payload: id as string, type: Action.NODE_CLOSE })
      }
      className={Classes.ELEVATION_0}
    />
  );
};
