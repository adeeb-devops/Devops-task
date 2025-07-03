import ReactApexChart from "react-apexcharts";
import { ApexOptions } from 'apexcharts';

const UserAccountChart = () => {
  const data = [
    { value: 10, label: "Total Players" },
    { value: 10, label: "InActive Players" },
    { value: 10, label: "Active Players" },
  ];

  const colors = ["#008ffb", "#ed3939", "#32a85c"];

  const seriesData = data.map((item) => item.value);
  const labels = data.map((item) => item.label);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      height: 500,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        colors: ["#ffffff"],
      },
    },

    plotOptions: {
      pie: {
        // customScale: 1.0,
        donut: {
          labels: {
            show: true,
            // showAlways: true,
            total: {
              show: true,
            },
          },
        },

        dataLabels: {
          // offset: 33,
        },
      },
    },
    tooltip: {
      theme: "light",
    },
    colors: colors,

    labels: labels,
    legend: {
      show: true,
      position: "bottom",
      labels: {
        colors: "black",
      },
    },
  };

  return (
    <div id="chart">
      <ReactApexChart
        options={options}
        series={seriesData}
        type="donut"
        height={400}
      />
    </div>
  );
};

export default UserAccountChart;
