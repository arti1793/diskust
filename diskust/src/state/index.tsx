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

export type Diskust = {
  is_file: boolean;
  is_dir: boolean;
  size: number;
  whole_path_str: string;
  nodes?: Diskust[];
  name: string;
  files_count: number;

  is_open?: boolean;
};

let STATE: State = {
  root: undefined,
  stack: [],
};

export type State = {
  root?: Diskust;
  stack: Omit<Diskust, "nodes">[];
};
export enum Action {
  ROOT_UPDATE,
  NODE_OPEN,
  NODE_CLOSE,
  NODE_SELECT,
  NODE_TOGGLE,
  BREADCRUMB_SELECT,
}
type ActionRootUpdate = { payload: Diskust; type: Action.ROOT_UPDATE };
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

export type ActionType =
  | ActionRootUpdate
  | ActionNodeOpen
  | ActionNodeClose
  | ActionNodeSelect
  | ActionNodeBreadcrumbSelect;

export const reducer: Reducer<State, ActionType> = (state, action) => {
  if (action.type === Action.ROOT_UPDATE) {
    state.root = action.payload;
    return state;
  }
  if (action.type === Action.NODE_OPEN) {
    let foundNode: Diskust | null = null;
    let root: Diskust = cloneDeepWith(state.root, (node: Diskust) => {
      if (node?.whole_path_str === action.payload.whole_path_str) {
        foundNode = { ...node, is_open: true };
        return foundNode;
      }
    });
    return {
      ...state,
      root,
      stack: getNewStack(
        state.stack,
        action.payload.depth,
        omit(foundNode, "nodes") as State["stack"][number]
      ),
    };
  }
  if (action.type === Action.NODE_CLOSE) {
    let foundNode: Diskust | null = null;
    let root: Diskust = cloneDeepWith(state.root, (node: Diskust) => {
      if (node?.whole_path_str === action.payload.whole_path_str) {
        foundNode = { ...node, is_open: false };
        return foundNode;
      }
    });

    return {
      ...state,
      root,
      stack: getNewStack(state.stack, action.payload.depth),
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
