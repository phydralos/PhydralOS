import styled, { keyframes } from "styled-components";

const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const StyledShutdownScreen = styled.div`
  background: #0a0a0f;
  color: #e0e0e0;
  font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, monospace;
  font-size: 14px;
  inset: 0;
  line-height: 1.6;
  overflow: hidden;
  padding: 32px 40px;
  position: fixed;
  z-index: 2000000;

  .shutdown-content {
    height: 100%;
    overflow: hidden;
  }

  .shutdown-line {
    margin-bottom: 2px;
    white-space: pre-wrap;
  }

  .shutdown-line.dim {
    color: rgb(255 255 255 / 30%);
  }

  .shutdown-line.bright {
    color: #fff;
    font-weight: bold;
  }

  .cursor {
    animation: ${blink} 1s step-end infinite;
    display: inline-block;
    margin-left: 2px;
  }
`;

export default StyledShutdownScreen;
