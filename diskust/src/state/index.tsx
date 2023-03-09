import { cloneDeepWith, omit } from "lodash";
import { getNewStack } from "./api/utils";
import {
  Reducer,
  useContext,
  createContext,
  useReducer,
  Dispatch,
  ReactNode,
} from "react";

export type Node = {
  is_file: boolean;
  is_dir: boolean;
  size: number;
  whole_path_str: string;
  nodes?: Node[];
  name: string;
  files_count: number;

  is_open?: boolean;
};

export type DiskInfo = {
  name: string;
  path: string;
  total: number;
  free_space: number;
  filled: number;
  is_removable: boolean;
  file_system: string;
  type_: string;
};

let STATE: State = {
  selected_disk_nodes: undefined,
  stack: [],
  disks: [],
};

export type State = {
  selected_disk_nodes?: Node;
  stack: Omit<Node, "nodes">[];
  disks: DiskInfo[];
};

export enum Action {
  ROOT_UPDATE,
  NODE_OPEN,
  NODE_CLOSE,
  NODE_SELECT,
  NODE_TOGGLE,
  BREADCRUMB_SELECT,
  DISK_LIST_INFO_UPDATE,
}

type ActionRootUpdate = {
  payload: { selected_disk_nodes: Node; disk_name: string };
  type: Action.ROOT_UPDATE;
};

type ActionNodeOpen = {
  payload: { whole_path_str: string; depth: number };
  type: Action.NODE_OPEN;
};

type ActionNodeClose = {
  payload: { whole_path_str: string; depth: number };
  type: Action.NODE_CLOSE;
};

type ActionNodeSelect = {
  payload: { whole_path_str: string; depth: number };
  type: Action.NODE_SELECT;
};

type ActionNodeBreadcrumbSelect = {
  payload: string;
  type: Action.BREADCRUMB_SELECT;
};

type ActionDiskListInfoUpdate = {
  payload: DiskInfo[];
  type: Action.DISK_LIST_INFO_UPDATE;
};

export type ActionType =
  | ActionRootUpdate
  | ActionNodeOpen
  | ActionNodeClose
  | ActionNodeSelect
  | ActionNodeBreadcrumbSelect
  | ActionDiskListInfoUpdate;

export const reducer: Reducer<State, ActionType> = (state, action) => {
  if (action.type === Action.ROOT_UPDATE) {
    const { disk_name, selected_disk_nodes } = action.payload;
    state.selected_disk_nodes = selected_disk_nodes;
    state.selected_disk_nodes.name = disk_name;
    return state;
  }
  if (action.type === Action.NODE_OPEN) {
    let foundNode: Node | null = null;
    let selected_disk_nodes: Node = cloneDeepWith(
      state.selected_disk_nodes,
      (node: Node) => {
        if (node?.whole_path_str === action.payload.whole_path_str) {
          foundNode = { ...node, is_open: true };
          return foundNode;
        }
      }
    );
    return {
      ...state,
      selected_disk_nodes,
      stack: getNewStack(
        state.stack,
        action.payload.depth,
        omit(foundNode, "nodes") as State["stack"][number]
      ),
    };
  }
  if (action.type === Action.NODE_CLOSE) {
    let foundNode: Node | null = null;
    let selected_disk_nodes: Node = cloneDeepWith(
      state.selected_disk_nodes,
      (node: Node) => {
        if (node?.whole_path_str === action.payload.whole_path_str) {
          foundNode = { ...node, is_open: false };
          return foundNode;
        } else {
        }
      }
    );

    return {
      ...state,
      selected_disk_nodes,
      stack: getNewStack(state.stack, action.payload.depth),
    };
  }

  if (action.type === Action.DISK_LIST_INFO_UPDATE) {
    return {
      ...state,
      disks: action.payload,
    };
  }

  return state;
};

const StoreContext = createContext<[State, Dispatch<ActionType>]>([
  STATE,
  () => {},
]);

export const Store: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, STATE);
  (window as unknown as any).state = state;
  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  return useContext(StoreContext);
};
