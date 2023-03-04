import { Breadcrumb, BreadcrumbProps } from "@blueprintjs/core";
import { Breadcrumbs2 } from "@blueprintjs/popover2";
import { useStore } from "../state";

export const Breadcrumbs: React.FC = () => {
  const [{ selected_node }] = useStore();
  const items: BreadcrumbProps[] =
    selected_node?.whole_path_str?.split("/").map((part) => ({
      text: part,
      onClick: () => {},
    })) ?? [];
  return (
    <Breadcrumbs2
      items={items}
      currentBreadcrumbRenderer={({ text, ...rest }) => (
        <Breadcrumb {...rest}>{text}</Breadcrumb>
      )}
    ></Breadcrumbs2>
  );
};
