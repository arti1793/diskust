import { DiskInfo, Node } from "..";
import { invoke } from "@tauri-apps/api/tauri";

export const loadDisks = async () => {
  const res: string = await invoke("get_disks");

  return JSON.parse(res) as DiskInfo[];
};
