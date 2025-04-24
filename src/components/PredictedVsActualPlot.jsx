import React from "react";
import Plot from "react-plotly.js";

const PredictedVsActualPlot = ({ actual, predicted, userPred }) => {
  // if we don’t have test‐set points, don’t render anything
  if (!actual?.length || !predicted?.length) return null;

  // build our traces
  const traces = [
    {
      x: actual,
      y: predicted,
      mode: "markers",
      name: "Test Set",
      marker: {
        color: predicted,
        colorscale: "Viridis",
        showscale: true,
        opacity: 0.5,
        size: 5,
      },
    },
    // overlay the user’s own prediction (if they’ve just hit “Predict”)
    ...(userPred != null
      ? [
          {
            x: [userPred],
            y: [userPred],
            mode: "markers+text",
            name: "Your Prediction",
            marker: { color: "#F28E2C", size: 12, symbol: "diamond" },
            text: ["You"],
            textposition: "top center",
          },
        ]
      : []),
  ];

  return (
    <Plot
      data={traces}
      layout={{
        // autosize: true,
        title: { text: "Predicted vs Actual", font: { color: "#63CCCA" } },
        xaxis: { type: "linear", autorange: true, title: "Actual Price", tickformat: ",.0f" },
        yaxis: { type: "linear", autorange: true, title: "Predicted Price", tickformat: ",.0f" },
        paper_bgcolor: "#2B2E30",
        plot_bgcolor: "#2B2E30",
        font: { color: "#F0F0F0" },
        showlegend: false,
        margin: { l: 120, t: 60, r: 20, b: 40 },
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
      config={{ responsive: true }}
    />
  );
};

export default PredictedVsActualPlot;
