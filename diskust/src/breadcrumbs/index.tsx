import { Boundary, Breadcrumb, BreadcrumbProps, Text } from "@blueprintjs/core";
import { Breadcrumbs2 } from "@blueprintjs/popover2";
import { useStore, Action } from "../state";

export const Breadcrumbs: React.FC = () => {
  const [{ stack }, dispatch] = useStore();
  const items: BreadcrumbProps[] =
    stack?.map(({ name, whole_path_str }, depth) => ({
      href: `#${whole_path_str}`,
      text: <Text ellipsize>{name}</Text>,
      onClick: () =>
        dispatch({
          type: Action.NODE_CLOSE,
          payload: { whole_path_str, depth },
        }),
    })) ?? [];
  return (
    <Breadcrumbs2
      collapseFrom={Boundary.START}
      minVisibleItems={2}
      items={items}
      currentBreadcrumbRenderer={({ text, ...rest }) => (
        <Breadcrumb {...rest}>{text}</Breadcrumb>
      )}
    ></Breadcrumbs2>
  );
};
