import { memo } from "react";

type TrayIconProps = {
  size?: number;
};

export const NetworkIcon = memo<TrayIconProps>(({ size = 14 }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    viewBox="0 0 16 16"
    width={size}
  >
    <path
      d="M8 12.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM4.75 10.25c.9-.9 2.05-1.4 3.25-1.4s2.35.5 3.25 1.4l-1.05 1.05A3.28 3.28 0 0 0 8 10.35c-.85 0-1.65.33-2.2.95L4.75 10.25ZM2.2 7.7A8.03 8.03 0 0 1 8 5.25c2.2 0 4.2.88 5.8 2.45l-1.05 1.05A6.53 6.53 0 0 0 8 6.75c-1.8 0-3.45.73-4.75 2l-1.05-1.05Z"
      fill="currentColor"
    />
  </svg>
));

NetworkIcon.displayName = "NetworkIcon";

export const VolumeIcon = memo<TrayIconProps>(({ size = 14 }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    viewBox="0 0 16 16"
    width={size}
  >
    <path
      d="M9 2.5 5.5 6H2v4h3.5L9 13.5v-11Z"
      fill="currentColor"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="0.5"
    />
    <path
      d="M11 5.5c1.5 1.5 1.5 3.5 0 5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.2"
    />
    <path
      d="M12.5 3.5c2.5 2.5 2.5 6.5 0 9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.2"
    />
  </svg>
));

VolumeIcon.displayName = "VolumeIcon";

type BatteryIconProps = TrayIconProps & {
  charging?: boolean;
  level?: number;
};

export const BatteryIcon = memo<BatteryIconProps>(
  ({ charging = false, level = 100, size = 14 }) => {
    const fillWidth = Math.max(1, Math.round((level / 100) * 10));

    return (
      <svg
        aria-hidden="true"
        fill="none"
        height={size}
        viewBox="0 0 16 16"
        width={size}
      >
        <rect
          height="8"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1"
          width="12"
          x="1"
          y="4"
        />
        <rect
          fill="currentColor"
          height="4"
          rx="0.5"
          width={fillWidth}
          x="2"
          y="6"
        />
        <path d="M14 6.5v3" stroke="currentColor" strokeWidth="1.5" />
        {charging && (
          <path
            d="M7.5 5.5 5.5 8.5h2L6.5 11l3.5-4h-2l1.5-1.5Z"
            fill="currentColor"
          />
        )}
      </svg>
    );
  }
);

BatteryIcon.displayName = "BatteryIcon";

export const ChevronUpIcon = memo<TrayIconProps>(({ size = 10 }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    viewBox="0 0 10 10"
    width={size}
  >
    <path
      d="M2 6.5 5 3.5l3 3"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
    />
  </svg>
));

ChevronUpIcon.displayName = "ChevronUpIcon";