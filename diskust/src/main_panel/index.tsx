import React from "react";
import { PanelStack2 } from "@blueprintjs/core";
import { DisksListPanel } from "../disk_list_panel";
import "./index.css";
const disk_list_panel = {
  props: {},
  renderPanel: DisksListPanel,
  title: `Select disk`,
};

export const MainPanel: React.FC<{}> = (props) => {
  return (
    <PanelStack2
      className="main-panel"
      initialPanel={disk_list_panel}
      showPanelHeader
    />
  );
};
