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
  path_str: string;
  nodes?: Diskust[];

  is_open?: boolean;
};

let STATE = {};

export type State = {
  root?: Diskust;
};
export enum Action {
  ROOT_UPDATE,
  NODE_OPEN,
  NODE_CLOSE,
}
type ActionRootUpdate = { payload: Diskust; type: Action.ROOT_UPDATE };
type ActionNodeOpen = { payload: string; type: Action.NODE_OPEN };
type ActionNodeClose = { payload: string; type: Action.NODE_CLOSE };

type ActionType = ActionRootUpdate | ActionNodeOpen | ActionNodeClose;

export const reducer: Reducer<State, ActionType> = (state, action) => {
  if (action.type === Action.ROOT_UPDATE) {
    state.root = action.payload;
    return state;
  }
  if (action.type === Action.NODE_OPEN) {
    let newState: Diskust = cloneDeepWith(state.root, (node: Diskust) => {
      if (node?.path_str === action.payload) {
        return { ...node, is_open: true };
      }
    });
    return { root: newState };
  }
  if (action.type === Action.NODE_CLOSE) {
    let newState: Diskust = cloneDeepWith(state.root, (node: Diskust) => {
      if (node?.path_str === action.payload) {
        return { ...node, is_open: false };
      }
    });
    return { root: newState };
  }
  return state;
};

const StoreContext = createContext<[State, Dispatch<ActionType>]>([
  STATE,
  () => {},
]);

export const Store: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, STATE);
  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  return useContext(StoreContext);
};
