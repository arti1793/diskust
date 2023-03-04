import { Diskust } from "..";
import { invoke } from "@tauri-apps/api/tauri";

export const loadNodes = async () => {
  const res: string = await invoke("get_nodes", {
    pathstr: "/home/arti1793/Downloads",
  });

  return JSON.parse(res) as Diskust;
};
