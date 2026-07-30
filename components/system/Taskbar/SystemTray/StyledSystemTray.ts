import styled from "styled-components";
import { TASKBAR_HEIGHT } from "utils/constants";

const StyledSystemTray = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  position: absolute;
  right: ${({ theme }) => theme.sizes.clock.padding}px;
  top: 0;
`;

export const StyledTrayButton = styled.button`
  align-items: center;
  background: none;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.systemTray.icon};
  display: flex;
  height: ${TASKBAR_HEIGHT - 6}px;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.sizes.systemTray.itemPadding}px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.systemTray.backgroundHover};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.systemTray.backgroundActive};
  }
`;

export const StyledTrayFlyout = styled.div`
  backdrop-filter: blur(20px);
  background-color: ${({ theme }) => theme.colors.systemTray.flyoutBackground};
  border: 1px solid ${({ theme }) => theme.colors.systemTray.flyoutBorder};
  border-radius: 8px;
  bottom: ${TASKBAR_HEIGHT + 8}px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: ${({ theme }) => theme.sizes.systemTray.flyoutMinWidth}px;
  padding: 6px;
  position: absolute;
  right: 0;
`;

export const StyledFlyoutItem = styled.div`
  align-items: center;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.systemTray.text};
  display: flex;
  font-size: 12px;
  gap: 10px;
  padding: 8px 10px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.systemTray.backgroundHover};
  }
`;

export const StyledFlyoutLabel = styled.span`
  flex: 1;
`;

export const StyledFlyoutValue = styled.span`
  color: ${({ theme }) => theme.colors.systemTray.textDim};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
`;

export const StyledFlyoutSeparator = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.systemTray.separator};
  margin: 4px 0;
`;

export const StyledTrayGroup = styled.div`
  align-items: center;
  display: flex;
  gap: 2px;
`;

export default StyledSystemTray;