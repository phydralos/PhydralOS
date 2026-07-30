import { memo } from "react";

const StartButtonIcon = memo(() => (
  <img
    alt="Start"
    draggable={false}
    src="/os-logo.png"
    style={{ height: "70%", objectFit: "contain", width: "auto" }}
  />
));

export default StartButtonIcon;
