import React from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useStore, Node } from "./../state";
import { map } from "lodash";

const data = [
  {
    name: "18-24",
    uv: 31.47,
    pv: 2400,
    fill: "#8884d8",
  },
  {
    name: "25-29",
    uv: 26.69,
    pv: 4567,
    fill: "#83a6ed",
  },
  {
    name: "30-34",
    uv: 15.69,
    pv: 1398,
    fill: "#8dd1e1",
  },
  {
    name: "35-39",
    uv: 8.22,
    pv: 9800,
    fill: "#82ca9d",
  },
  {
    name: "40-49",
    uv: 8.63,
    pv: 3908,
    fill: "#a4de6c",
  },
  {
    name: "50+",
    uv: 2.63,
    pv: 4800,
    fill: "#d0ed57",
  },
  {
    name: "unknow",
    uv: 6.67,
    pv: 4800,
    fill: "#ffc658",
  },
];

const style = {
  top: "50%",
  right: 0,
  transform: "translate(0, -50%)",
  lineHeight: "24px",
};

const mapper = (
  nodes: Node[]
): { name: string; uv: number; pv: number; fill: string }[] => {
  return map(nodes, ({ name }) => ({
    name,
    pv: 0,
    uv: 0,
    fill: "red",
  }));
};
const findNodeList = (toFind: Omit<Node, "nodes">, node: Node): Node[] => {
  let stack = [node];
  let found: Node | null = null;
  while (stack.length > 0) {
    let curr = stack.pop();

    if (curr?.whole_path_str === toFind.whole_path_str) {
      found = curr;
      break;
    }

    if (curr?.nodes?.length) {
      stack.push(...curr.nodes);
    }
  }

  return mapper(found?.nodes ?? []);
};
export const Graph: React.FC = () => {
  const [{ stack, selected_disk_nodes }] = useStore();
  const top = stack[stack.length - 1];
  if (!selected_disk_nodes) return null;
  const data = findNodeList(top, selected_disk_nodes);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="10%"
        outerRadius="70%"
        barSize={40}
        data={data}
      >
        <RadialBar
          label={{ position: "insideStart", fill: "#000" }}
          dataKey="uv"
        />
        <Legend
          iconSize={10}
          layout="vertical"
          verticalAlign="middle"
          wrapperStyle={style}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};
