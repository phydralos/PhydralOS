import { memo, type FC } from "react";
import StyledSystemPrompt from "components/system/StartMenu/Sidebar/StyledSystemPrompt";
import StyledButton from "components/system/Dialogs/StyledButton";

type SystemPromptProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

const PowerIcon = (): React.JSX.Element => (
  <svg fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" stroke="rgb(0 0 0 / 60%)" strokeWidth="2" />
    <path
      d="M16 6v10"
      stroke="rgb(0 0 0 / 80%)"
      strokeLinecap="round"
      strokeWidth="3"
    />
    <path
      d="M10 10a8 8 0 1 0 12 0"
      fill="none"
      stroke="rgb(0 0 0 / 80%)"
      strokeLinecap="round"
      strokeWidth="3"
    />
  </svg>
);

const SystemPrompt: FC<SystemPromptProps> = ({ onCancel, onConfirm }) => (
  <StyledSystemPrompt
    onClick={(e) => {
      if (e.target === e.currentTarget) onCancel();
    }}
  >
    <div className="prompt-window" onPointerDown={(e) => e.stopPropagation()}>
      <div className="prompt-titlebar">Shut Down Pyhdral OS</div>
      <div className="prompt-body">
        <div className="prompt-field">
          <div className="prompt-icon">
            <PowerIcon />
          </div>
          <div className="prompt-content">
            <div className="prompt-label">
              Are you sure you want to shut down?
            </div>
          </div>
        </div>
        <div className="prompt-warning">
          Warning: All session data, files, and settings will be permanently
          cleared from this browser. This action cannot be undone.
        </div>
      </div>
      <div className="prompt-nav">
        <StyledButton
          className="focus"
          onClick={onConfirm}
          onMouseDown={(e) => e.preventDefault()}
        >
          Continue
        </StyledButton>
        <StyledButton
          onClick={onCancel}
          onMouseDown={(e) => e.preventDefault()}
        >
          Cancel
        </StyledButton>
      </div>
    </div>
  </StyledSystemPrompt>
);

export default memo(SystemPrompt);
