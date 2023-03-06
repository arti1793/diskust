import { Node } from "..";
import { invoke } from "@tauri-apps/api/tauri";

export const loadNodes = async (pathstr: string) => {
  const res: string = await invoke("get_nodes", {
    pathstr,
  });

  return JSON.parse(res) as Node;
};
