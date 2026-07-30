import { memo, type FC } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { IFRAME_CONFIG } from "utils/constants";

const DPaint: FC<ComponentProcessProps> = ({ id }) => (
  <iframe
    id={`dpaint-${id}`}
    src="/Program Files/DPaint/index.html"
    style={{
      backgroundColor: "#000",
      border: "none",
      height: "100%",
      width: "100%",
    }}
    title="DPaint"
    {...IFRAME_CONFIG}
  />
);

export default memo(DPaint);
