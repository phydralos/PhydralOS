import { memo, type FC } from "react";
import styled from "styled-components";

const StyledComponentError = styled.div`
  background-color: #1a1a2e;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  font-family: "Cascadia Code", "Fira Code", Consolas, monospace;
  font-size: 13px;
  gap: 12px;
  height: 100%;
  overflow: auto;
  padding: 24px;
  place-content: center;
  place-items: center;
  width: 100%;
`;

const ErrorTitle = styled.div`
  color: #f38ba8;
  font-size: 16px;
  font-weight: 600;
`;

const ErrorDetail = styled.div`
  color: #a6adc8;
  max-width: 400px;
  text-align: center;
  word-break: break-word;
`;

const RetryButton = styled.button`
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  cursor: pointer;
  font-size: 13px;
  padding: 8px 20px;

  &:hover {
    background: #45475a;
  }
`;

type ComponentErrorProps = {
  error?: Error;
  onRetry?: () => void;
};

const ComponentError: FC<ComponentErrorProps> = ({ error, onRetry }) => (
  <StyledComponentError>
    <ErrorTitle>App crashed</ErrorTitle>
    {error?.message && <ErrorDetail>{error.message}</ErrorDetail>}
    {onRetry && <RetryButton onClick={onRetry}>Retry</RetryButton>}
  </StyledComponentError>
);

export default memo(ComponentError);
