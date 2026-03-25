"use client";

import { useEffect, useMemo, useState } from "react";

type TrendPoint = {
  month: string;
  value: number;
};

type TrendChartProps = {
  data?: TrendPoint[];
};

const DEFAULT_DATA: TrendPoint[] = [
  { month: "1월", value: 0 },
  { month: "2월", value: 0 },
  { month: "3월", value: 0 },
  { month: "4월", value: 0 },
  { month: "5월", value: 0 },
  { month: "6월", value: 0 },
  { month: "7월", value: 0 },
  { month: "8월", value: 0 },
  { month: "9월", value: 0 },
  { month: "10월", value: 0 },
  { month: "11월", value: 0 },
  { month: "12월", value: 0 },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export default function TrendChart({ data }: TrendChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const source = data && data.length > 0 ? data : DEFAULT_DATA;

    return source.map((item) => ({
      month: item.month,
      value: Number(item.value) || 0,
    }));
  }, [data]);

  const width = 760;
  const height = 320;
  const paddingLeft = 40;
  const paddingRight = 18;
  const paddingTop = 20;
  const paddingBottom = 34;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const rawMax = Math.max(...chartData.map((item) => item.value), 0);
  const maxValue = rawMax <= 0 ? 5 : rawMax;

  const points = useMemo(() => {
    return chartData.map((item, index) => {
      const x =
        chartData.length === 1
          ? paddingLeft + innerWidth / 2
          : paddingLeft + (innerWidth / (chartData.length - 1)) * index;

      const y = paddingTop + innerHeight - (item.value / maxValue) * innerHeight;

      return {
        ...item,
        x,
        y,
      };
    });
  }, [chartData, innerWidth, innerHeight, maxValue]);

  const linePath = useMemo(() => {
    if (points.length === 0) return "";

    return points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
  }, [points]);

  const baseY = paddingTop + innerHeight;

  const areaPath = useMemo(() => {
    if (points.length === 0 || !linePath) return "";
    return `${linePath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
  }, [points, linePath, baseY]);

  const yTicks = useMemo(() => {
    return Array.from({ length: 6 }).map((_, index) => {
      const value = maxValue - (maxValue / 5) * index;
      const y = paddingTop + (innerHeight / 5) * index;

      return {
        value: Math.round(value),
        y,
      };
    });
  }, [maxValue, innerHeight]);

  if (!mounted) {
    return (
      <div className="trend-chart">
        <div className="trend-chart__svg-wrap">
          <div
            style={{
              width: "100%",
              aspectRatio: "760 / 320",
              borderRadius: 20,
              background: "linear-gradient(180deg, rgba(255,255,255,0.65), rgba(242,233,219,0.75))",
              border: "1px solid #eadfcf",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 14,
          }}
        >
          {chartData.map((item) => (
            <div
              key={item.month}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                minHeight: 34,
                padding: "0 12px",
                borderRadius: 999,
                background: "#f7f1e7",
                border: "1px solid #eadfcf",
                color: "#6f6254",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span>{item.month}</span>
              <strong style={{ color: "#23180f" }}>{formatNumber(item.value)}건</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="trend-chart">
      <div className="trend-chart__svg-wrap">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="trend-chart__svg"
          role="img"
          aria-label="월별 등록 추이 차트"
        >
          <defs>
            <linearGradient id="trend-chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(47, 111, 255, 0.28)" />
              <stop offset="100%" stopColor="rgba(47, 111, 255, 0.03)" />
            </linearGradient>
          </defs>

          {yTicks.map((tick, index) => (
            <g key={`grid-${index}`}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="rgba(47, 36, 23, 0.10)"
                strokeDasharray="4 6"
              />
              <text
                x={paddingLeft - 10}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#8a7d70"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {points.map((point, index) => (
            <text
              key={`month-${index}`}
              x={point.x}
              y={height - 12}
              textAnchor="middle"
              fontSize="11"
              fill="#8a7d70"
            >
              {point.month}
            </text>
          ))}

          {areaPath ? <path d={areaPath} fill="url(#trend-chart-fill)" /> : null}

          {linePath ? (
            <path
              d={linePath}
              fill="none"
              stroke="#2f6fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r={4}
              fill="#2f6fff"
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 14,
        }}
      >
        {chartData.map((item) => (
          <div
            key={item.month}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              minHeight: 34,
              padding: "0 12px",
              borderRadius: 999,
              background: "#f7f1e7",
              border: "1px solid #eadfcf",
              color: "#6f6254",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <span>{item.month}</span>
            <strong style={{ color: "#23180f" }}>{formatNumber(item.value)}건</strong>
          </div>
        ))}
      </div>
    </div>
  );
}