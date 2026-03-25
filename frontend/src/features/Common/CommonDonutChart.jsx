import React, { useEffect, useState, useRef } from "react";
import ReactApexChart from "react-apexcharts";
import "./commonstyles.css";

export default function CommonDonutChart({
  labels,
  colors,
  series,
  labelsfontSize,
  style,
  timebased,
  height,
  clickedBar,
  enablePointer,
  showTotal,
  efficientValue,
  legendFontSize,
}) {
  const [mobileView, setMobileView] = useState(false);
  const chartId = useRef(`chart-${Math.random().toString(36).substring(2, 9)}`);
  const observerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setMobileView(window.outerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!enablePointer) return;

    const rootSelector = `#${chartId.current}`;
    const setPointerOnSlices = (root = document) => {
      // try several likely selectors used by ApexCharts
      const selectors = [
        `${rootSelector} .apexcharts-pie-series path`,
        `${rootSelector} .apexcharts-pie-area path`,
        `${rootSelector} .apexcharts-series path`,
        `${rootSelector} .apexcharts-pie-slice`,
        `${rootSelector} .apexcharts-markers .apexcharts-marker`,
      ];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          el.style.cursor = "pointer";
        });
      });
    };

    // initial attempt (in case chart already rendered)
    setPointerOnSlices(document);

    // observe for new nodes inside the chart container
    const chartContainer = document.querySelector(rootSelector);
    if (chartContainer) {
      const observer = new MutationObserver((mutations) => {
        // whenever children are added, try to set pointer on slices
        let added = false;
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length) {
            added = true;
            break;
          }
        }
        if (added) setPointerOnSlices(document);
      });
      observer.observe(chartContainer, { childList: true, subtree: true });
      observerRef.current = observer;
    }

    // As a safety, also append a style tag that targets the chart id (useful if selectors match)
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-apex-pointer", chartId.current);
    styleEl.innerHTML = `
      #${chartId.current} .apexcharts-pie-series path,
      #${chartId.current} .apexcharts-pie-area path,
      #${chartId.current} .apexcharts-series path,
      #${chartId.current} .apexcharts-pie-slice,
      #${chartId.current} .apexcharts-markers .apexcharts-marker {
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      // cleanup
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      const existing = document.querySelectorAll(
        `style[data-apex-pointer="${chartId.current}"]`
      );
      existing.forEach((s) => s.remove());
    };
  }, [enablePointer]);

  const formatTime = (value) => {
    if (isNaN(value) || value === null || value === undefined)
      return "0hr 0m 0s";
    const hours = Math.floor(value);
    const minutes = Math.floor((value % 1) * 60);
    const seconds = Math.floor(((value % 1) * 3600) % 60);
    return `${hours}hr ${minutes}m ${seconds}s`;
  };

  const applyLegendFontFix = () => {
    const root = document.getElementById(chartId.current);
    if (!root) return;

    setTimeout(() => {
      root.querySelectorAll(".apexcharts-legend-text").forEach((el) => {
        el.style.fontSize = legendFontSize || "11px";
        el.style.fontFamily = "Poppins, sans-serif";
      });
    }, 300);
  };

  const options = {
    chart: {
      type: "donut",
      // events: {
      //   // prefer native event: set pointer on the target element when hovering
      //   mouseMove: function (event, chartContext, config) {
      //     const label = labels?.[config.dataPointIndex]; // ✅ Get label by index dynamically

      //     const totalLabel = document.querySelector(
      //       `#${chartId.current} .apexcharts-datalabels-group text`
      //     );

      //     if (!totalLabel) return;

      //     // ✅ Only shrink when hovering FOLLOWUP UN-HANDLED (match by label text, not index)
      //     if (label == "Followup Un-Handled") {
      //       totalLabel.style.fontSize = "10px";
      //     } else if (label == "Total Followup" || label == "Followup Handled") {
      //       totalLabel.style.fontSize = "12px";
      //     } else {
      //       totalLabel.style.fontSize = labelsfontSize; // restore
      //     }
      //   },

      //   // when leaving, reset to default for safety
      //   mouseLeave: function (event, chartContext, config) {
      //     try {
      //       if (event && event.target) {
      //         event.target.style && (event.target.style.cursor = "default");
      //         if (event.target.parentNode && event.target.parentNode.style)
      //           event.target.parentNode.style.cursor = "default";
      //       }
      //     } catch (e) {}
      //   },
      //   // selection click handler (as you already use)
      //   dataPointSelection: function (event, chartContext, config) {
      //     const label = labels && labels[config.dataPointIndex];
      //     if (clickedBar) clickedBar(label);
      //   },
      // },
      // events: {
      //   dataPointMouseEnter: function (event, chartContext, config) {
      //     const index = config.dataPointIndex;

      //     // 🔹 Legend highlight sync
      //     const legends = document.querySelectorAll(
      //       `#${chartId.current} .apexcharts-legend-series`
      //     );

      //     legends.forEach((el, i) => {
      //       if (i === index) {
      //         el.classList.add("legend-active");
      //         el.classList.remove("legend-inactive");
      //       } else {
      //         el.classList.add("legend-inactive");
      //         el.classList.remove("legend-active");
      //       }
      //     });

      //     // 🔹 Your existing center-label resize logic
      //     const label = labels?.[index];
      //     const totalLabel = document.querySelector(
      //       `#${chartId.current} .apexcharts-datalabels-group text`
      //     );

      //     if (!totalLabel) return;

      //     if (label === "Followup Un-Handled") {
      //       totalLabel.style.fontSize = "10px";
      //     } else if (
      //       label === "Total Followup" ||
      //       label === "Followup Handled"
      //     ) {
      //       totalLabel.style.fontSize = "12px";
      //     } else {
      //       totalLabel.style.fontSize = labelsfontSize;
      //     }
      //   },

      //   dataPointMouseLeave: function () {
      //     // 🔹 Reset legend styles
      //     const legends = document.querySelectorAll(
      //       `#${chartId.current} .apexcharts-legend-series`
      //     );

      //     legends.forEach((el) => {
      //       el.classList.remove("legend-active", "legend-inactive");
      //     });
      //   },

      //   dataPointSelection: function (event, chartContext, config) {
      //     const label = labels && labels[config.dataPointIndex];
      //     if (clickedBar) clickedBar(label);
      //   },
      // },
      events: {
        dataPointMouseEnter: function (event, chartContext, config) {
          const index = config.dataPointIndex;

          const root = document.getElementById(chartId.current);
          const paths = root.querySelectorAll(".apexcharts-pie-series path");

          // remove existing ring
          root.querySelectorAll(".slice-ring").forEach((el) => el.remove());

          if (paths[index]) {
            const slice = paths[index];

            const ring = slice.cloneNode(true);
            const color = slice.getAttribute("fill");

            ring.classList.add("slice-ring");
            ring.removeAttribute("fill");
            ring.setAttribute("stroke", color);

            // place behind real slice
            slice.parentNode.insertBefore(ring, slice);
          }

          // legend sync
          const legends = root.querySelectorAll(".apexcharts-legend-series");
          legends.forEach((el, i) => {
            el.classList.toggle("legend-active", i === index);
            el.classList.toggle("legend-inactive", i !== index);
          });

          // 🔹 Your existing center-label resize logic
          const label = labels?.[index];
          const totalLabel = document.querySelector(
            `#${chartId.current} .apexcharts-datalabels-group text`
          );

          if (!totalLabel) return;

          if (label === "Followup Un-Handled") {
            totalLabel.style.fontSize = "10px";
          } else if (
            label === "Total Followup" ||
            label === "Followup Handled"
          ) {
            totalLabel.style.fontSize = "12px";
          } else {
            totalLabel.style.fontSize = labelsfontSize;
          }
        },

        dataPointMouseLeave: function () {
          const root = document.getElementById(chartId.current);

          root.querySelectorAll(".slice-ring").forEach((el) => el.remove());

          root
            .querySelectorAll(".apexcharts-legend-series")
            .forEach((el) =>
              el.classList.remove("legend-active", "legend-inactive")
            );
        },

        dataPointSelection: function (event, chartContext, config) {
          const label = labels && labels[config.dataPointIndex];
          if (clickedBar) clickedBar(label);
        },
      },
    },
    labels: labels,
    colors: colors,
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: showTotal ? showTotal : false,
            total: {
              showAlways: false,
              label: "Efficiency",
              show: true,
              color: "#2d2d2d",
              fontWeight: 600,
              fontSize: mobileView ? "12px" : labelsfontSize, // Dynamically adjust font size
              fontFamily: "Poppins, sans-serif", // Change font family of y-axis labels
              formatter: function (w) {
                return efficientValue ? efficientValue + "%" : "0%"; // ✅ show efficient prop value in center
              },
            },
            value: {
              show: true,
              fontSize: mobileView ? "12px" : "16px",
              color: "#2d2d2d",
              fontFamily: "Poppins, sans-serif", // Change font family of y-axis labels
              fontWeight: 700, // Increase font weight
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: mobileView ? "10px" : "13px",
        fontWeight: 600,
        colors: ["#fff"],
        fontFamily: "Poppins, sans-serif",
      },
      formatter: function (val, opts) {
        const value = opts.w.globals.series[opts.seriesIndex];

        // Reduce font size if large number
        if (value > 999) {
          opts.w.config.dataLabels.style.fontSize = "10px"; // <= Adjust here
        } else {
          opts.w.config.dataLabels.style.fontSize = "13px";
        }

        return value;
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          if (timebased === "true") return formatTime(val);
          return val;
        },
      },
    },
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Poppins, sans-serif",
      fontSize: legendFontSize ? legendFontSize : "11px",
      formatter: function (seriesName, opts) {
        const value = opts.w.globals.series[opts.seriesIndex];
        return `${seriesName}: <b>${value}</b>`;
      },
    },
  };

  return (
    <div
      id={chartId.current}
      style={{
        ...(style || {}),
        // safety: make the wrapper pointer when enablePointer, helps fallback
        cursor: enablePointer ? "default" : "auto",
      }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={height || 270}
      />
    </div>
  );
}
