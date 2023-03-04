import { cloneDeepWith } from "lodash";
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

  is_open?: boolean;
  is_selected?: boolean;
};

let STATE = {};

export type State = {
  root?: Diskust;
  selected_node?: Diskust;
};
export enum Action {
  ROOT_UPDATE,
  NODE_OPEN,
  NODE_CLOSE,
  NODE_SELECT,
  NODE_TOGGLE,
}
type ActionRootUpdate = { payload: Diskust; type: Action.ROOT_UPDATE };
type ActionNodeOpen = { payload: string; type: Action.NODE_OPEN };
type ActionNodeClose = { payload: string; type: Action.NODE_CLOSE };
type ActionNodeSelect = { payload: string; type: Action.NODE_SELECT };
type ActionNodeToggle = { payload: string; type: Action.NODE_TOGGLE };

type ActionType =
  | ActionRootUpdate
  | ActionNodeOpen
  | ActionNodeClose
  | ActionNodeSelect
  | ActionNodeToggle;

export const reducer: Reducer<State, ActionType> = (state, action) => {
  console.log(action.type);
  if (action.type === Action.ROOT_UPDATE) {
    state.root = action.payload;
    return state;
  }
  if (action.type === Action.NODE_OPEN) {
    let root: Diskust = cloneDeepWith(state.root, (node: Diskust) => {
      if (node?.whole_path_str === action.payload) {
        return { ...node, is_open: true };
      }
    });
    return { ...state, root };
  }
  if (action.type === Action.NODE_CLOSE) {
    let root: Diskust = cloneDeepWith(state.root, (node: Diskust) => {
      if (node?.whole_path_str === action.payload) {
        return { ...node, is_open: false };
      }
    });
    return { ...state, root };
  }
  if (action.type === Action.NODE_SELECT) {
    let foundNode;
    let root: Diskust = cloneDeepWith(state.root, (node: Diskust) => {
      if (node?.is_selected) {
        return { ...node, is_selected: !node.is_selected };
      }
      if (node?.whole_path_str === action.payload) {
        foundNode = { ...node, is_selected: true };
        return foundNode;
      }
    });
    return { ...state, root, selected_node: foundNode };
  }
  if (action.type === Action.NODE_TOGGLE) {
    let foundNode;
    let root: Diskust = cloneDeepWith(state.root, (node: Diskust) => {
      if (node?.is_selected) {
        return { ...node, is_selected: false };
      }
      if (node?.whole_path_str === action.payload) {
        foundNode = { ...node, is_selected: true, is_open: !node.is_open };
        return foundNode;
      }
    });
    return { ...state, root, selected_node: foundNode };
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
