import React, { useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";

export default function CommonHorizontalBarChart({
  height = 280,
  xaxis,
  series,
  colors,
  isRupees,
  clickedBar,
  fontSize,
  enablePointer = false,
}) {
  const chartId = useRef(`chart-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    if (enablePointer) {
      const style = document.createElement("style");
      style.innerHTML = `
        #${chartId.current} .apexcharts-bar-series path:hover {
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, [enablePointer]);

  const options = {
    series: [
      {
        name: "Funnel Series",
        data: series,
      },
    ],
    options: {
      chart: {
        id: chartId.current,
        type: "bar",
        height: 400,
        toolbar: { show: false },
        events: {
          dataPointSelection: (event, chartContext, config) => {
            const seriesIndex = config.seriesIndex;
            const dataPointIndex = config.dataPointIndex;
            const label = config.w.config.xaxis.categories[dataPointIndex];
            const value =
              config.w.config.series[seriesIndex].data[dataPointIndex];
            console.log("Clicked bar:", label);
            clickedBar && clickedBar(label);
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "60%",
          borderRadius: 3,
          borderRadiusApplication: "end",
          distributed: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) =>
          isRupees
            ? "₹" +
              Number(val).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : val,
        style: {
          fontSize: "12px",
          fontWeight: 500,
          fontFamily: "Poppins, sans-serif",
        },
      },
      xaxis: {
        categories: xaxis,
        labels: {
          style: {
            fontSize: fontSize || "12px",
            fontFamily: "Poppins, sans-serif",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: fontSize || "12px",
            fontFamily: "Poppins, sans-serif",
          },
        },
      },
      colors,
      grid: {
        xaxis: { lines: { show: false } },
      },
      tooltip: {
        shared: false,
        x: { show: false },
        y: {
          formatter: (val, { dataPointIndex, w }) => {
            const category = w.config.xaxis.categories[dataPointIndex];
            return `<span style="font-weight:400">${category}:</span> 
                    <span style="font-weight:600">${
                      isRupees
                        ? "₹" +
                          Number(val).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : val
                    }</span>`;
          },
          title: { formatter: () => "" },
        },
        style: { fontFamily: "Poppins, sans-serif" },
      },
      legend: { show: false },
    },
  };

  return (
    <div id={chartId.current}>
      <ReactApexChart
        options={options.options}
        series={options.series}
        type="bar"
        height={height}
      />
    </div>
  );
}
