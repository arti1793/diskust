import React, { useEffect, useState } from "react";
import { MainPanel } from "./main_panel";

import "./../node_modules/normalize.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "./App.css";

function App() {
  return (
    <div className="container bp4-dark">
      <MainPanel />
    </div>
  );
}

export default App;
