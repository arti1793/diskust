import * as React from "react";
import { filesize } from "filesize";
import {
  Classes,
  Divider,
  ITreeNodeProps,
  Icon,
  Intent,
  ProgressBar,
  TreeNode,
} from "@blueprintjs/core";
import { Action, Diskust, useStore } from "../state";
import { isEmpty, map } from "lodash";
import "./index.css";

const mapNode = (node: Diskust): Omit<ITreeNodeProps, "depth" | "path"> => ({
  id: node?.whole_path_str,
  label: <span className="label"> {node?.name}</span>,
  hasCaret: node?.is_dir && !isEmpty(node.nodes),
  secondaryLabel: (
    <span className="size">
      {filesize(node?.size).toString()}
      {node.is_dir && (
        <>
          <Divider />
          {node.files_count} файлов
        </>
      )}
    </span>
  ),

  isExpanded: node?.is_open,
});

const ProgressIcon: React.FC<{
  percent: number;
  is_file: boolean;
  is_open: boolean;
}> = ({ percent, is_file, is_open }) => (
  <>
    <div className="progress">
      <ProgressBar
        intent={
          percent > 80
            ? Intent.DANGER
            : percent > 50
            ? Intent.WARNING
              ? percent > 30
                ? Intent.PRIMARY
                : Intent.NONE
              : Intent.NONE
            : Intent.NONE
        }
        animate={false}
        value={percent}
      />
      <div className="progress-percent">{percent}%</div>
    </div>
    {!is_file && (
      <Icon className="icon" icon={is_open ? "folder-open" : "folder-close"} />
    )}
  </>
);
const Node: React.FC<{
  parent: Diskust;
  depth: number;
  path: number[];
  free_space: number;
  actions: Pick<ITreeNodeProps, "onClick" | "onCollapse" | "onExpand">;
}> = ({ actions, depth, parent, path, free_space }) => (
  <TreeNode
    key={parent.whole_path_str}
    depth={depth}
    path={path}
    icon={
      <ProgressIcon
        is_file={parent.is_file}
        is_open={!!parent.is_open}
        percent={parseInt(((parent.size / free_space) * 100).toFixed(0))}
      />
    }
    {...mapNode(parent)}
    {...actions}
  >
    {map(parent.nodes, (node, i) => (
      <Node
        key={node.whole_path_str}
        depth={depth + 1}
        path={[i, ...path]}
        actions={actions}
        parent={node}
        free_space={free_space}
      />
    ))}
  </TreeNode>
);
let FREE_SPACE = 1.4 * 1024 * 1024 * 1024; // TODO!
export const FolderTree: React.FC<{}> = () => {
  const [{ root }, dispatch] = useStore();

  const actions: Pick<ITreeNodeProps, "onClick" | "onCollapse" | "onExpand"> = {
    onExpand: ({ props: { id, depth } }: TreeNode) => {
      console.log(id, "NODE_OPEN");
      dispatch({
        payload: { whole_path_str: id as string, depth },
        type: Action.NODE_OPEN,
      });
    },

    onClick: ({ props: { id, isExpanded, depth } }: TreeNode, e) => {
      console.log(id, "NODE_TOGGLE");
      e.preventDefault();
      e.stopPropagation();
      dispatch({
        payload: { whole_path_str: id as string, depth },
        type: isExpanded ? Action.NODE_CLOSE : Action.NODE_OPEN,
      });
    },

    onCollapse: ({ props: { id, depth } }: TreeNode) => {
      console.log(id, "NODE_CLOSE");
      dispatch({
        payload: { whole_path_str: id as string, depth },
        type: Action.NODE_CLOSE,
      });
    },
  };
  if (!root) return null;
  return (
    <Node
      parent={root}
      actions={actions}
      depth={0}
      path={[0]}
      free_space={FREE_SPACE}
    />
  );
};
