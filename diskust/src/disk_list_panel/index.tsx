import { useEffect, useState } from "react";
import {
  Card,
  Classes,
  Elevation,
  Intent,
  Panel,
  PanelProps,
  ProgressBar,
  Spinner,
  Tag,
} from "@blueprintjs/core";
import { map } from "lodash";
import { filesize } from "filesize";

import { Action, useStore } from "../state/index";
import { loadDisks } from "../state/api/load_disks";
import "./index.css";
import { DiskPanelProps, DisksPanel } from "../disk_panel";
import { DiskInfo } from "../state";

export type DiskListPanelProps = {};

const diskPanel: (disk: DiskInfo) => Panel<DiskPanelProps> = (
  disk: DiskInfo
) => ({
  renderPanel: DisksPanel,
  title: disk.name,
  props: { disk },
});

export const DisksListPanel: React.FC<PanelProps<DiskListPanelProps>> = ({
  openPanel,
}) => {
  const [loaded, setIsLoaded] = useState(false);
  const [{ disks }, dispatch] = useStore();
  useEffect(() => {
    loadDisks()
      .then((disks) => {
        dispatch({
          payload: disks,
          type: Action.DISK_LIST_INFO_UPDATE,
        });
      })
      .finally(() => setIsLoaded(true));
  }, []);

  return (
    <div className="disk-list-panel">
      {!loaded && <Spinner className="spinner" intent={Intent.PRIMARY} />}
      {loaded &&
        map(disks, (disk, i) => {
          const { filled, name, path, total, free_space, type_ } = disk;
          const percentFilled = parseInt(((filled / total) * 100).toFixed(2));
          const intent =
            percentFilled > 85
              ? Intent.DANGER
              : percentFilled > 70
              ? Intent.WARNING
                ? percentFilled > 20
                  ? Intent.PRIMARY
                  : Intent.SUCCESS
                : Intent.SUCCESS
              : Intent.SUCCESS;

          return (
            <Card
              className="disk"
              key={name + i}
              interactive
              onClick={() => openPanel(diskPanel(disk))}
            >
              <h1 className="card-title">
                <a className="title-link">
                  {name}
                  <Tag className="type-tag" intent={Intent.PRIMARY}>
                    {type_}
                  </Tag>
                </a>
                <span
                  className={
                    Classes.TEXT_MUTED + " " + Classes.MONOSPACE_TEXT + " mount"
                  }
                >
                  <pre>{path}</pre>
                </span>
              </h1>
              <ProgressBar
                animate={false}
                intent={intent}
                value={percentFilled / 100}
              />
              <div className="usage">
                <div>{filesize(free_space).toString()} available</div>
                <div>{filesize(total).toString()} Total</div>
              </div>
            </Card>
          );
        })}
    </div>
  );
};
