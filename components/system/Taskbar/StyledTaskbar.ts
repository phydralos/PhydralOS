import styled from "styled-components";
import { TASKBAR_HEIGHT } from "utils/constants";

const TASKBAR_Z_INDEX = 100000;

const StyledTaskbar = styled.nav`
  --tray-width: 86px;

    background-color: ${({ theme }) => theme.colors.taskbar.background};
  border-top: 1px solid hsla(0, 0%, 100%, 6%);
  bottom: 0;
  contain: size layout;
  height: ${TASKBAR_HEIGHT}px;
  left: 0;
  position: absolute;
  right: 0;
  width: 100vw;
  z-index: ${TASKBAR_Z_INDEX};

  &::after {
    backdrop-filter: ${({ theme }) => `blur(${theme.sizes.taskbar.blur})`};
    content: "";
    display: block;
    height: 100%;
    position: relative;
    width: 100%;
    z-index: -${TASKBAR_Z_INDEX};
  }

  @media (pointer: coarse) {
    height: 56px;
  }
`;

export default StyledTaskbar;
