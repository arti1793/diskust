import { State } from "..";

export const getNewStack = (
  stack: State["stack"],
  depth: number,
  add?: State["stack"][number]
) => stack.slice(0, depth).concat(add ? [add] : []);
