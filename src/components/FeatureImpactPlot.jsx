import React from "react";
import Plot from "react-plotly.js";

const FeatureImpactPlot = ({ featureWeights }) => {
  if (!featureWeights || featureWeights.length === 0) return null;

  const sorted = [...featureWeights].sort(
    (a, b) => Math.abs(b.weight) - Math.abs(a.weight)
  );

  return (
    <Plot
      data={[
        {
          type: "bar",
          x: sorted.map((f) => f.weight),
          y: sorted.map((f) => f.feature),
          orientation: "h",
          marker: {
            color: "#5DA399",
          },
        },
      ]}
      layout={{
        autosize: true,
        title: { text: "Feature Impact", font: { color: "#63CCCA" } },
        margin: { l: 100, r: 20, t: 60, b: 40 },
        paper_bgcolor: "#2B2E30",
        plot_bgcolor: "#2B2E30",
        font: { color: "#F0F0F0" },
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
      config={{ responsive: true }}
    />
  );
};

export default FeatureImpactPlot;
