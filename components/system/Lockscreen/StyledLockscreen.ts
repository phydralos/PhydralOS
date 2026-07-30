import styled, { keyframes } from "styled-components";

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-10px); }
  40%, 80% { transform: translateX(10px); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const StyledLockscreen = styled.div<{ $shaking?: boolean }>`
  align-items: center;
  backdrop-filter: blur(40px) saturate(1.2);
  background: linear-gradient(
    165deg,
    rgb(12 14 28 / 72%),
    rgb(8 10 20 / 85%)
  );
  color: #fff;
  display: flex;
  flex-direction: column;
  font-family: "Styrene B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  gap: 48px;
  inset: 0;
  justify-content: center;
  padding: 52px 24px 32px;
  position: fixed;
  user-select: none;
  z-index: 1000000;

  .clock-container {
    align-items: center;
    animation: ${slideUp} 0.4s ease-out;
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    text-shadow: 0 4px 24px rgb(0 0 0 / 50%);

    .time {
      font-size: 78px;
      font-weight: 100;
      letter-spacing: -2px;
      line-height: 1;
      margin-bottom: 6px;
    }

    .date {
      font-size: 17px;
      font-weight: 400;
      opacity: 80%;
    }
  }

  .login-card {
    align-items: center;
    animation: ${({ $shaking }) =>
      $shaking
        ? shake
        : slideUp} 0.4s ease-out;
    display: flex;
    flex-direction: column;
    max-width: 320px;
    width: 100%;

    .avatar-wrapper {
      border-radius: 50%;
      box-shadow: 0 4px 16px rgb(0 0 0 / 25%);
      height: 52px;
      margin-bottom: 12px;
      overflow: hidden;
      width: 52px;

      img {
        border-radius: 50%;
        height: 100%;
        object-fit: cover;
        width: 100%;
      }

      svg {
        height: 100%;
        width: 100%;
      }
    }

    .user-name {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.2px;
      margin-bottom: 4px;
      text-shadow: 0 2px 10px rgb(0 0 0 / 30%);
    }

    .user-subtitle {
      color: rgb(255 255 255 / 55%);
      font-size: 13px;
      font-weight: 400;
      margin-bottom: 20px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
    }

    .input-wrapper {
      align-items: center;
      background: rgb(255 255 255 / 18%);
      border: 1px solid rgb(255 255 255 / 28%);
      border-radius: 20px;
      box-shadow: inset 0 1px 2px rgb(0 0 0 / 20%), 0 4px 16px rgb(0 0 0 / 20%);
      display: flex;
      padding: 4px 6px 4px 14px;
      transition: all 0.2s ease;

      &:focus-within {
        background: rgb(255 255 255 / 25%);
        border-color: rgb(255 255 255 / 60%);
        box-shadow: 0 0 0 3px rgb(255 255 255 / 25%), 0 4px 16px rgb(0 0 0 / 30%);
      }

      input {
        background: transparent;
        border: none;
        color: #fff;
        flex: 1;
        font-size: 13px;
        outline: none;
        padding: 6px 0;

        &::placeholder {
          color: rgb(255 255 255 / 60%);
        }
      }

      button {
        align-items: center;
        background: rgb(255 255 255 / 25%);
        border: none;
        border-radius: 50%;
        color: #fff;
        cursor: pointer;
        display: flex;
        height: 26px;
        justify-content: center;
        transition: background 0.15s ease, transform 0.1s ease;
        width: 26px;

        &:hover {
          background: rgb(255 255 255 / 40%);
        }

        &:active {
          transform: scale(0.92);
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 50%;
        }

        svg {
          fill: #fff;
          height: 14px;
          width: 14px;
        }
      }
    }

    .error-message {
      color: #ff6b6b;
      font-size: 12px;
      font-weight: 500;
      margin-top: 8px;
      text-shadow: 0 1px 4px rgb(0 0 0 / 50%);
    }

    .loading-overlay {
      align-items: center;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
      width: 100%;
    }

    .spinner {
      animation: ${spin} 0.8s linear infinite;
      border: 3px solid rgb(255 255 255 / 20%);
      border-radius: 50%;
      border-top-color: #fff;
      height: 32px;
      width: 32px;
    }

    .loading-text {
      color: rgb(255 255 255 / 70%);
      font-size: 13px;
      font-weight: 400;
    }

    .auth-modes {
      align-items: center;
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-top: 12px;

      /* stylelint-disable-next-line no-descending-specificity */
      button {
        background: transparent;
        border: none;
        color: rgb(255 255 255 / 70%);
        cursor: pointer;
        font-size: 12px;
        padding: 4px 8px;
        text-decoration: underline;
        transition: color 0.15s ease;

        &:hover {
          color: #fff;
        }
      }
    }
  }

  @media (width <= 768px) {
    backdrop-filter: blur(20px) saturate(1.1);
    padding: 28px 16px 20px;

    .clock-container .time {
      font-size: 54px;
    }

    .clock-container .date {
      font-size: 15px;
    }

    .login-card .avatar-wrapper {
      height: 44px;
      width: 44px;
    }
  }
`;
