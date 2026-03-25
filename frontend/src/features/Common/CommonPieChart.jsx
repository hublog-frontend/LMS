import React, { useEffect, useState, useRef } from "react";
import ReactApexChart from "react-apexcharts";

export default function CommonPieChart({
  labels,
  colors,
  series,
  labelsfontSize,
  style,
  timebased,
  height,
  clickedBar,
  enablePointer,
}) {
  const [mobileView, setMobileView] = useState(false);
  const chartId = useRef(`chart-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.outerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!enablePointer) return;

    // create style that targets most apexcharts series elements
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-apex-pointer", chartId.current);
    styleEl.innerHTML = `
      /* target any series path / slice / area inside this chart wrapper */
      #${chartId.current} .apexcharts-series path,
      #${chartId.current} .apexcharts-pie-area path,
      #${chartId.current} .apexcharts-pie-slice,
      #${chartId.current} .apexcharts-markers .apexcharts-marker {
        cursor: pointer !important;
      }
      /* fallback: if path not used, make the svg container pointer */
      #${chartId.current} svg {
        cursor: default;
      }
      #${chartId.current} .apexcharts-series:hover,
      #${chartId.current} .apexcharts-pie-area:hover {
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(styleEl);

    // small delay to let chart render DOM first (ensures selector finds nodes)
    const t = setTimeout(() => {}, 0);

    return () => {
      clearTimeout(t);
      const existing = document.querySelector(
        'style[data-apex-pointer="' + chartId.current + '"]'
      );
      if (existing) existing.remove();
    };
  }, [enablePointer]);

  // ... rest of your component (formatTime, options etc.)

  const options = {
    chart: {
      type: "pie",
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const label = labels[config.dataPointIndex];
          clickedBar ? clickedBar(label) : "";
        },
      },
    },
    labels: labels,
    colors: colors,
    dataLabels: {
      enabled: true,
      style: {
        fontSize: mobileView ? "11px" : labelsfontSize || "13px",
        fontFamily: "Poppins, sans-serif",
        fontWeight: 400,
        colors: ["#ffffff"],
      },
      formatter: function (val, opts) {
        const value = series[opts.seriesIndex];
        // ✅ Only show count (no label)
        if (timebased === "true") {
          return formatTime(value);
        }
        return value;
      },
    },
    tooltip: {
      enabled: true,
      style: {
        fontFamily: "Poppins, sans-serif", // ✅ Tooltip font family
        fontSize: "11px",
      },
      y: {
        formatter: function (val) {
          if (timebased === "true") {
            return formatTime(val);
          }
          return val;
        },
      },
    },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "11px",
      fontFamily: "Poppins, sans-serif",
      formatter: function (seriesName, opts) {
        const value = opts.w.globals.series[opts.seriesIndex];
        if (timebased === "true") {
          return `${seriesName}: ${formatTime(value)}`;
        }
        return `${seriesName}: ${value}`;
      },
    },
  };

  return (
    // IMPORTANT: set the id on this wrapper so the style can scope to this chart
    <div id={chartId.current} style={style}>
      <ReactApexChart
        options={options}
        series={series}
        type="pie"
        height={height ? height : 270}
      />
    </div>
  );
}
