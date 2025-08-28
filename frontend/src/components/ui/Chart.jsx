// frontend/src/components/ui/Chart.jsx
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const Chart = ({
  title,
  subtext = "",
  legend = { orient: "vertical", left: "left" },
  series = [],
  tooltip = { trigger: "item" },
  style = { height: "100%", width: "100%" },
  xAxis,
  yAxis,
  geo,
}) => {
  const option = {
    title: {
      text: title,
      subtext: subtext,
      left: "center",
    },
    tooltip,
    legend,
    series,
    ...(xAxis && { xAxis }),
    ...(yAxis && { yAxis }),
    ...(geo && { geo }),
  };

  return <ReactECharts option={option} style={style} />;
};

export default Chart;
