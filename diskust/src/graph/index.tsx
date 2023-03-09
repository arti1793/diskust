import React from "react";
import { ResponsiveContainer, PieChart, Pie } from "recharts";
import Gradient from "javascript-color-gradient";
import { Colors } from "@blueprintjs/core";

import { useStore, Node } from "./../state";
import { map, sortBy } from "lodash";
import { filesize } from "filesize";

const mapper = (
  parent: Node
): {
  name: string;
  size: number;
  pv: number;
  fill: string;
  size_string: string;
  percent: number;
}[] => {
  const total = parent.size;
  let sorted = sortBy(parent.nodes ?? [], "size");

  const gradient = new Gradient();
  gradient.setColorGradient(Colors.GREEN3, Colors.RED3).setMidpoint(101);
  const colors = gradient.getColors();
  console.log(colors);

  return map(sorted, ({ name, size }) => {
    const percent = parseInt(((size / total) * 100).toFixed(0));
    console.log(percent, colors[percent]);
    return {
      name,
      pv: 1000,
      size,
      size_string: `${name} (${filesize(size).toString()})`,
      fill: colors[percent],
      percent,
    };
  });
};
const findNodeList = (
  toFind: Omit<Node, "nodes">,
  node: Node
): { name: string; size: number; size_string: string; fill: string }[] => {
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

  if (!found) return [];
  return mapper(found);
};
export const Graph: React.FC = () => {
  const [{ stack, selected_disk_nodes }] = useStore();
  const top = stack[stack.length - 1];
  if (!selected_disk_nodes || !top) return null;
  const data = findNodeList(top, selected_disk_nodes);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          dataKey="size"
          startAngle={360}
          endAngle={0}
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          // label={({ payload: { size_string, percent } }) => {
          //   if (percent < 2) return null;
          //   return size_string;
          // }}
          label={({
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            value,
            index,
            fill,
            size_string,
            percent,
          }) => {
            console.log("handling label?");
            const RADIAN = Math.PI / 180;
            // eslint-disable-next-line
            const radius = 25 + innerRadius + (outerRadius - innerRadius);
            // eslint-disable-next-line
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            // eslint-disable-next-line
            const y = cy + radius * Math.sin(-midAngle * RADIAN);

            if (percent < 3) return null;
            return (
              <text
                x={x}
                y={y}
                fill={fill}
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
              >
                {size_string}
              </text>
            );
          }}
          tooltipType="none"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
