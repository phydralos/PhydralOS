import styled from "styled-components";
import StyledButton from "components/system/Dialogs/StyledButton";

const StyledSystemPrompt = styled.div`
  background: rgb(0 0 0 / 40%);
  inset: 0;
  position: fixed;
  z-index: 2500000;

  .prompt-window {
    background-color: #fff;
    border: 1px solid rgb(173 173 173);
    box-shadow: 0 16px 48px rgb(0 0 0 / 40%);
    font-family: ${({ theme }) => theme.formats.systemFont};
    font-size: 12px;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 380px;
  }

  .prompt-titlebar {
    align-items: center;
    background-color: #fff;
    border-bottom: 1px solid rgb(240 240 240);
    display: flex;
    font-size: 12px;
    font-weight: 600;
    height: 30px;
    padding: 0 8px;
  }

  .prompt-body {
    padding: 16px 16px 12px;

    .prompt-field {
      display: flex;
      flex-direction: row;
      margin-bottom: 12px;

      .prompt-icon {
        margin-right: 14px;
        margin-top: 2px;

        svg {
          height: 32px;
          width: 32px;
        }
      }

      .prompt-content {
        flex: 1;

        .prompt-label {
          color: #000;
          line-height: 18px;
          margin-bottom: 8px;
        }

        .prompt-select-wrapper {
          display: flex;
          flex-direction: row;

          .prompt-select-label {
            line-height: 21px;
            margin-right: 8px;
          }

          select {
            border: 1px solid rgb(122 122 122);
            font-family: ${({ theme }) => theme.formats.systemFont};
            font-size: 12px;
            height: 23px;
            padding-left: 4px;
            width: 100%;
          }
        }
      }
    }

    .prompt-warning {
      background-color: rgb(255 248 230);
      border: 1px solid rgb(255 213 128);
      color: rgb(120 80 0);
      font-size: 11px;
      line-height: 16px;
      margin-bottom: 12px;
      padding: 8px 10px;
    }
  }

  .prompt-nav {
    background-color: rgb(240 240 240);
    display: flex;
    flex-direction: row;
    height: 50px;
    justify-content: flex-end;
    padding: 12px 12px 0;

    ${StyledButton} {
      height: 24px;
      margin-left: 8px;
      width: 86px;
    }
  }
`;

export default StyledSystemPrompt;
