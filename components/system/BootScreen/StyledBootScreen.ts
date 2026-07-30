import styled, { keyframes } from "styled-components";

const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const scanline = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
`;

const StyledBootScreen = styled.div`
  background: #0a0a0f;
  color: #e0e0e0;
  font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, "Courier New", monospace;
  font-size: 14px;
  inset: 0;
  line-height: 1.6;
  overflow: hidden;
  padding: 32px 40px;
  position: fixed;
  z-index: 2000000;

  .scanline {
    animation: ${scanline} 8s linear infinite;
    background: linear-gradient(
      to bottom,
      transparent,
      rgb(255 255 255 / 3%),
      transparent
    );
    height: 100vh;
    left: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .boot-content {
    height: 100%;
    overflow: hidden;
  }

  .boot-line {
    margin-bottom: 2px;
    white-space: pre-wrap;
  }

  .boot-line.dim {
    color: rgb(255 255 255 / 30%);
  }

  .boot-line.bright {
    color: #fff;
    font-weight: bold;
  }

  .cursor {
    animation: ${blink} 1s step-end infinite;
    display: inline-block;
    margin-left: 2px;
  }
`;

export default StyledBootScreen;
