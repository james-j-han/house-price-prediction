import React from "react";
import Plot from "react-plotly.js";

const CorrelationHeatmap = ({ matrix }) => {
  if (
    !matrix ||
    typeof matrix !== "object" ||
    Object.keys(matrix).length === 0
  ) {
    return <div>Loading correlation…</div>;
  }

  const features = Object.keys(matrix);
  const z = features.map((r) => features.map((c) => matrix[r][c]));

  return (
    <Plot
      data={[
        {
          z,
          x: features,
          y: features,
          type: "heatmap",
          colorscale: "YlOrRd",
          reversescale: true,
          showscale: true,
        },
      ]}
      layout={{
        autosize: true,
        title: { text: "Correlation Matrix", font: { color: "#63CCCA" } },
        margin: { l: 80, r: 20, t: 60, b: 80 },
        paper_bgcolor: "#2B2E30",
        plot_bgcolor: "#2B2E30",
        font: { color: "#F0F0F0" },
        xaxis: { tickangle: -45 },
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
      config={{ responsive: true }}
    />
  );
};

export default CorrelationHeatmap;
