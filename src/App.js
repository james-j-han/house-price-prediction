import { useEffect, useState } from "react";
import "./App.css";

import FeatureImpactPlot from "./components/FeatureImpactPlot";
import PredictedVsActualPlot from "./components/PredictedVsActualPlot";
import CorrelationHeatmap from "./components/CorrelationHeatmap";

const API = "house-price-prediction-backend-production.up.railway.app";

const App = () => {
  const [models, setModels] = useState([]);
  const [model, setModel] = useState("");
  const [formData, setFormData] = useState({
    yearbuilt: "",
    livingarea: "",
    bathrooms: "",
    bedrooms: "",
    is_bankowned: false,
    is_forauction: false,
    parking: false,
    hasgarage: false,
    pool: false,
    spa: false,
    isnewconstruction: false,
    haspetsallowed: false,
  });
  const [prediction, setPrediction] = useState(null);
  const [featureWeights, setFeatureWeights] = useState([]);
  const [corrMatrix, setCorrMatrix] = useState(null);
  const [evaluationData, setEvaluationData] = useState(null);

  // Fetch available models on load
  useEffect(() => {
    fetch(`https://${API}/models`)
      .then((res) => res.json())
      .then((data) => {
        setModels(data.models);
        if (data.models.length > 0) {
          setModel(data.models[0]); // default to first
        }
      })
      .catch((err) => console.error("Failed to fetch models:", err));
  }, []);

  // whenever `model` changes, fetch its correlation matrix
  useEffect(() => {
    if (!model) return;

    fetch(
      `https://${API}/correlation?model=${encodeURIComponent(model)}`
    )
      .then((r) => {
        if (!r.ok) throw new Error("No correlation matrix");
        return r.json();
      })
      .then((data) => setCorrMatrix(data.matrix))
      .catch((err) => {
        console.error("Failed to fetch correlation:", err);
        setCorrMatrix(null);
      });
  }, [model]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async () => {
    // 1) build numeric payload
    const numericPayload = {};
    for (let key in formData) {
      numericPayload[key] =
        typeof formData[key] === "boolean"
          ? formData[key]
          : Number(formData[key]);
    }

    const payload = { model, features: numericPayload };

    try {
      // 2) predict endpoint
      const predRes = await fetch(`https://${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const predData = await predRes.json();
      if (!predRes.ok) throw new Error(predData.error || "Prediction failed");
      setPrediction(predData.prediction);

      try {
        const wtRes = await fetch(`https:??${API}/feature-weights`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model }),
        });
        const wtData = await wtRes.json();
        if (!wtRes.ok) throw new Error(wtData.error || "Weights fetch failed");
        setFeatureWeights(wtData.weights);
      } catch (wErr) {
        console.error("Weights fetch error:", wErr.message);
        setFeatureWeights([]);
      }

      // 3) correlation matrix
      const corrRes = await fetch(
        `https://${API}/correlation?model=${encodeURIComponent(model)}`
      );
      const corrData = await corrRes.json();
      if (!corrRes.ok)
        throw new Error(corrData.error || "Correlation fetch failed");
      setCorrMatrix(corrData.matrix);

      // 4) predicted vs actual
      const evalRes = await fetch(`https:??${API}/evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });
      const evalData = await evalRes.json();
      if (!evalRes.ok)
        throw new Error(evalData.error || "Evaluation fetch failed");
      setEvaluationData({
        actual: evalData.actual,
        predicted: evalData.predicted,
      });
    } catch (err) {
      console.error("Prediction/Analysis error:", err.message);
      // clear out any old charts if you like:
      setCorrMatrix(null);
      setEvaluationData(null);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">Home Price Predictor</nav>

      <main className="main">
        <div className="top-section">
          <div className="input-section">
            <h2 className="section-title">Predict Housing Price</h2>

            <div className="form-row">
              <label htmlFor="model">Model:</label>
              <select
                id="model"
                className="model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="yearbuilt">Year Built:</label>
              <input
                id="yearbuilt"
                type="number"
                name="yearbuilt"
                min="1900"
                max={new Date().getFullYear()}
                step="1"
                placeholder="e.g. 1990"
                value={formData.yearbuilt}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Living Area (sqft):</label>
              <input
                id="livingarea"
                type="number"
                name="livingarea"
                value={formData.livingarea}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Bathrooms:</label>
              <input
                id="bathrooms"
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Bedrooms:</label>
              <input
                id="bedrooms"
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Features:</label>
              <div className="checkbox-group">
                {[
                  "is_bankowned",
                  "is_forauction",
                  "parking",
                  "hasgarage",
                  "pool",
                  "spa",
                  "isnewconstruction",
                  "haspetsallowed",
                ].map((key) => (
                  <div key={key} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={key}
                      name={key}
                      checked={formData[key]}
                      onChange={handleChange}
                    />
                    <label htmlFor={key}>{key.replace(/_/g, " ")}</label>
                  </div>
                ))}
              </div>
            </div>

            <button className="predict-button" onClick={handleSubmit}>
              Predict
            </button>
          </div>

          <div className="prediction-output">
            <h3 className="prediction-title">Predicted Price</h3>
            {prediction ? (
              <div className="prediction-value">
                ${Math.round(prediction).toLocaleString()}
              </div>
            ) : (
              <div className="prediction-placeholder">
                Enter inputs and hit “Predict”
              </div>
            )}
          </div>
        </div>
        <div className="plot-container">
          {corrMatrix && <CorrelationHeatmap matrix={corrMatrix} />}

          <FeatureImpactPlot featureWeights={featureWeights} />

          {evaluationData?.actual?.length > 0 && (
            <PredictedVsActualPlot
              actual={evaluationData.actual}
              predicted={evaluationData.predicted}
              userPred={prediction}
            />
          )}
        </div>
      </main>

      <footer className="footer">&copy; 2025 Data Ozians</footer>
    </div>
  );
};

export default App;
