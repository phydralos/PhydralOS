import styled from "styled-components";

type StyledWidgetProps = {
  $visible: boolean;
};

export const StyledWidgetsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.sizes.widget.gap}px;
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 0;
`;

export const StyledWidget = styled.section<StyledWidgetProps>`
  backdrop-filter: blur(16px);
  background-color: ${({ theme }) => theme.colors.widget.background};
  border: 1px solid ${({ theme }) => theme.colors.widget.border};
  border-radius: ${({ theme }) => theme.sizes.widget.borderRadius}px;
  box-shadow: ${({ theme }) => theme.colors.widget.shadow};
  color: ${({ theme }) => theme.colors.widget.text};
  content-visibility: auto;
  contain: layout style;
  display: ${({ $visible }) => ($visible ? "flex" : "none")};
  flex-direction: column;
  gap: 6px;
  padding: ${({ theme }) => theme.sizes.widget.padding}px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
  width: ${({ theme }) => theme.sizes.widget.width}px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.widget.backgroundHover};
    border-color: ${({ theme }) => theme.colors.widget.borderHover};
  }
`;

export const StyledWidgetHeader = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export const StyledWidgetTitle = styled.h3`
  color: ${({ theme }) => theme.colors.widget.label};
  font-size: ${({ theme }) => theme.sizes.widget.labelSize};
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const StyledWidgetValue = styled.span`
  color: ${({ theme }) => theme.colors.widget.value};
  font-size: ${({ theme }) => theme.sizes.widget.valueSize};
  font-variant-numeric: tabular-nums;
  font-weight: 300;
  line-height: 1.1;
`;

export const StyledWidgetDetail = styled.span`
  color: ${({ theme }) => theme.colors.widget.label};
  font-size: ${({ theme }) => theme.sizes.widget.fontSize};
  font-variant-numeric: tabular-nums;
`;

export const StyledWidgetGraph = styled.canvas`
  border-radius: 4px;
  height: ${({ theme }) => theme.sizes.widget.graphHeight}px;
  width: 100%;
`;

export const StyledWidgetRow = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
`;

export const StyledWidgetProgressBar = styled.div`
  background-color: ${({ theme }) => theme.colors.widget.border};
  border-radius: 2px;
  height: 3px;
  overflow: hidden;
  width: 100%;
`;

export const StyledWidgetProgressFill = styled.div<{ $percent: number }>`
  background-color: ${({ theme }) => theme.colors.widget.value};
  border-radius: 2px;
  height: 100%;
  transition: width 0.5s ease;
  width: ${({ $percent }) => $percent}%;
`;

export default StyledWidgetsContainer;