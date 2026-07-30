import { memo, useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import StyledWidgetsContainer, {
  StyledWidget,
  StyledWidgetDetail,
  StyledWidgetGraph,
  StyledWidgetHeader,
  StyledWidgetProgressBar,
  StyledWidgetProgressFill,
  StyledWidgetRow,
  StyledWidgetTitle,
  StyledWidgetValue,
} from "components/system/Desktop/Widgets/StyledWidgets";
import useSystemStats, {
  formatBytes,
} from "components/system/Desktop/Widgets/useSystemStats";
import { useSession } from "contexts/session";

const drawGraph = (
  canvas: HTMLCanvasElement,
  data: number[],
  lineColor: string,
  fillColor: string
): void => {
  const ctx = canvas.getContext("2d", { alpha: true });

  if (!ctx || data.length < 2) return;

  const { width, height } = canvas;
  const stepX = width / (data.length - 1);

  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  ctx.moveTo(0, height - (data[0] / 100) * height);

  for (let i = 1; i < data.length; i += 1) {
    ctx.lineTo(i * stepX, height - (data[i] / 100) * height);
  }

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
};

const Widgets: FC = () => {
  const { sessionLoaded } = useSession();
  const stats = useSystemStats(sessionLoaded);
  const graphRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const canvas = graphRef.current;

    if (canvas && stats.cpuHistory.length > 1) {
      const { devicePixelRatio } = window;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;

      drawGraph(
        canvas,
        stats.cpuHistory,
        theme.colors.widget.graphLine,
        theme.colors.widget.graphFill
      );
    }
  }, [stats.cpuHistory, theme]);

  const memoryPercent =
    stats.memoryTotal > 0
      ? Math.round((stats.memoryUsage / stats.memoryTotal) * 100)
      : 0;

  return (
    <StyledWidgetsContainer aria-label="Desktop widgets">
      <StyledWidget $visible>
        <StyledWidgetHeader>
          <StyledWidgetTitle>CPU</StyledWidgetTitle>
        </StyledWidgetHeader>
        <StyledWidgetRow>
          <StyledWidgetValue>{stats.cpuUsage}%</StyledWidgetValue>
          <StyledWidgetDetail>Uptime: {stats.uptime}</StyledWidgetDetail>
        </StyledWidgetRow>
        <StyledWidgetGraph ref={graphRef} />
      </StyledWidget>

      <StyledWidget $visible={stats.memoryTotal > 0}>
        <StyledWidgetHeader>
          <StyledWidgetTitle>Memory</StyledWidgetTitle>
        </StyledWidgetHeader>
        <StyledWidgetRow>
          <StyledWidgetValue>{memoryPercent}%</StyledWidgetValue>
          <StyledWidgetDetail>
            {formatBytes(stats.memoryUsage)} / {formatBytes(stats.memoryTotal)}
          </StyledWidgetDetail>
        </StyledWidgetRow>
        <StyledWidgetProgressBar>
          <StyledWidgetProgressFill $percent={memoryPercent} />
        </StyledWidgetProgressBar>
      </StyledWidget>

      <StyledWidget $visible={stats.networkType !== "unknown"}>
        <StyledWidgetHeader>
          <StyledWidgetTitle>Network</StyledWidgetTitle>
        </StyledWidgetHeader>
        <StyledWidgetRow>
          <StyledWidgetValue>{stats.networkType}</StyledWidgetValue>
          {stats.networkDownlink > 0 && (
            <StyledWidgetDetail>
              {stats.networkDownlink} Mbps
            </StyledWidgetDetail>
          )}
        </StyledWidgetRow>
      </StyledWidget>
    </StyledWidgetsContainer>
  );
};

export default memo(Widgets);