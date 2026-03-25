import React from "react";
import Chart from "react-apexcharts";

const CommonRadialBarChart = ({
  series = [76, 67, 61, 90],
  labels = ["Vimeo", "Messenger", "Facebook", "LinkedIn"],
  colors = ["#1ab7ea", "#0084ff", "#39539E", "#0077B5"],
  height = 280,
}) => {
  const options = {
    chart: {
      height,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 15,
          size: "30%",
          background: "transparent",
        },
        track: {
          show: true,
          strokeWidth: "100%",
          margin: 8,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          },
        },
        barLabels: {
          enabled: true,
          useSeriesColors: true,
          offsetX: -8,
          fontSize: "11px",
          fontFamily: "Poppins, sans-serif", // Change font family of y-axis labels
          formatter: function (seriesName, opts) {
            return `${seriesName}: ${opts.w.globals.series[opts.seriesIndex]}`;
          },
        },
      },
    },
    colors,
    labels,
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            show: false,
          },
        },
      },
    ],
  };

  return (
    <Chart options={options} series={series} type="radialBar" height={height} />
  );
};

export default CommonRadialBarChart;
