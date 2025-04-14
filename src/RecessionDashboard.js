import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

// Dummy data - this would be replaced with actual API data
const getDummyData = () => {
  const currentDate = new Date();
  const lastDataDate = new Date(currentDate);
  lastDataDate.setMonth(lastDataDate.getMonth() - 1);

  const horizons = ["1M", "3M", "6M", "12M"];
  const models = [
    { id: "rf", name: "Random Forest", color: "#8884d8" },
    { id: "xgb", name: "XGBoost", color: "#82ca9d" },
    { id: "lr", name: "Logistic Regression", color: "#ffc658" },
    { id: "svm", name: "SVM", color: "#ff8042" },
    { id: "nb", name: "Naive Bayes", color: "#0088FE" },
    { id: "knn", name: "k-NN", color: "#00C49F" },
    { id: "ada", name: "AdaBoost", color: "#FFBB28" },
    { id: "mlp", name: "MLP", color: "#FF8042" },
    { id: "arimax", name: "ARIMAX", color: "#8dd1e1" },
    { id: "lstm", name: "LSTM", color: "#a4de6c" },
    { id: "ensemble", name: "Ensemble", color: "#d0ed57" },
  ];

  const predictions = {};

  horizons.forEach((horizon) => {
    const targetDate = new Date(currentDate);
    const months = parseInt(horizon.replace("M", ""));
    targetDate.setMonth(targetDate.getMonth() + months);

    predictions[horizon] = {
      targetDate: targetDate.toISOString().split("T")[0],
      models: {},
    };

    models.forEach((model) => {
      // Generate semi-realistic predictions
      let baseProbability = 0.4 + Math.random() * 0.2; // 0.4-0.6

      // Longer horizons have more uncertainty
      const uncertaintyFactor = 1 + parseInt(horizon.replace("M", "")) / 12;
      const finalProb = Math.min(0.95, baseProbability * uncertaintyFactor);

      predictions[horizon].models[model.id] = parseFloat(finalProb.toFixed(2));
    });
  });

  // Historical data (12 months back)
  const historicalData = [];
  for (let i = 12; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);

    const entry = {
      date: date.toISOString().split("T")[0],
      actual: i <= 1 ? 0 : i >= 9 ? 1 : 0, // Simulate a recent recession ending
    };

    // Add historical predictions (with some error)
    models.forEach((model) => {
      if (i >= 3) {
        // Only have predictions for dates with sufficient history
        const actualValue = i >= 9 ? 1 : 0;
        const errorMargin = Math.random() * 0.3 - 0.15; // Random error between -0.15 and 0.15
        entry[`${model.id}_pred`] = Math.max(
          0,
          Math.min(1, actualValue + errorMargin)
        );
      }
    });

    historicalData.push(entry);
  }

  return {
    lastUpdated: lastDataDate.toISOString().split("T")[0],
    predictions,
    historicalData,
    models,
  };
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
        <p className="font-bold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {(entry.value * 100).toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Main dashboard component
const RecessionDashboard = () => {
  const [data, setData] = useState(null);
  const [selectedHorizon, setSelectedHorizon] = useState("6M");
  const [selectedModels, setSelectedModels] = useState([]);
  const [view, setView] = useState("current");

  useEffect(() => {
    // This would be an API call in a real application
    const fetchedData = getDummyData();
    setData(fetchedData);

    // Initialize with all models selected
    setSelectedModels(fetchedData.models.map((m) => m.id));
  }, []);

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  // Filter models based on selection
  const filteredModels = data.models.filter((model) =>
    selectedModels.includes(model.id)
  );

  // Prepare data for the current prediction chart
  const currentPredictionData = filteredModels
    .map((model) => ({
      name: model.name,
      value: data.predictions[selectedHorizon].models[model.id],
      color: model.color,
      id: model.id,
    }))
    .sort((a, b) => a.value - b.value);

  // Prepare data for the historical performance chart
  const historicalData = data.historicalData;

  // Prepare data for the comparison chart (across horizons)
  const comparisonData = [];
  Object.keys(data.predictions).forEach((horizon) => {
    const entry = { horizon };
    filteredModels.forEach((model) => {
      entry[model.id] = data.predictions[horizon].models[model.id];
    });
    comparisonData.push(entry);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Recession Prediction Dashboard</h1>
          <p className="mt-2 text-blue-100">
            Using data up to:{" "}
            <span className="font-semibold">{data.lastUpdated}</span>
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Control panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Forecast Controls
              </h2>
            </div>

            {/* View selector */}
            <div className="flex">
              <button
                onClick={() => setView("current")}
                className={`px-4 py-2 rounded-l-md ${
                  view === "current"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Current Predictions
              </button>
              <button
                onClick={() => setView("historical")}
                className={`px-4 py-2 ${
                  view === "historical"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Historical Performance
              </button>
              <button
                onClick={() => setView("comparison")}
                className={`px-4 py-2 rounded-r-md ${
                  view === "comparison"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Horizon Comparison
              </button>
            </div>

            {/* Horizon selector (only for current view) */}
            <div
              className={`flex items-center ${
                view === "current" ? "" : "invisible"
              }`}
            >
              <label className="mr-2 font-medium">Forecast Horizon:</label>
              <select
                value={selectedHorizon}
                onChange={(e) => setSelectedHorizon(e.target.value)}
                className="border rounded-md px-3 py-1.5"
                disabled={view !== "current"}
              >
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="12M">12 Months</option>
              </select>
            </div>
          </div>

          {/* Model selection */}
          <div className="mt-6">
            <label className="font-medium mb-2 block">Select Models:</label>
            <div className="flex flex-wrap gap-2">
              {data.models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    if (selectedModels.includes(model.id)) {
                      setSelectedModels(
                        selectedModels.filter((id) => id !== model.id)
                      );
                    } else {
                      setSelectedModels([...selectedModels, model.id]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    selectedModels.includes(model.id)
                      ? `bg-${model.color.replace("#", "")} text-white`
                      : "bg-gray-200 text-gray-700"
                  }`}
                  style={{
                    backgroundColor: selectedModels.includes(model.id)
                      ? model.color
                      : undefined,
                  }}
                >
                  {model.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart panels */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {view === "current" && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedHorizon} Recession Probability Forecast
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  (Target date: {data.predictions[selectedHorizon].targetDate})
                </span>
              </h2>

              {/* Current prediction chart */}
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={currentPredictionData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 120, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 1]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip
                      formatter={(value) => `${(value * 100).toFixed(1)}%`}
                      labelFormatter={() => "Recession Probability"}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Probability"
                      fill="#8884d8"
                      radius={[0, 4, 4, 0]}
                    >
                      {currentPredictionData.map((entry, index) => (
                        <cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Risk Assessment</h3>
                <p className="text-gray-700">
                  {currentPredictionData.length === 0
                    ? "Please select at least one model to view the risk assessment."
                    : currentPredictionData.some((item) => item.value > 0.7)
                    ? "High Risk: Multiple models indicate significant recession probability. Consider defensive economic positioning."
                    : currentPredictionData.some((item) => item.value > 0.4)
                    ? "Moderate Risk: Some models show elevated recession chances. Monitor economic indicators closely."
                    : "Low Risk: Most models indicate low probability of recession in the selected time horizon."}
                </p>
              </div>
            </>
          )}

          {view === "historical" && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Historical Model Performance (Last 12 Months)
              </h2>

              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historicalData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      domain={[0, 1]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="stepAfter"
                      dataKey="actual"
                      name="Actual Recession"
                      stroke="#ff0000"
                      strokeWidth={3}
                    />
                    {filteredModels.map((model) => (
                      <Line
                        key={model.id}
                        type="monotone"
                        dataKey={`${model.id}_pred`}
                        name={model.name}
                        stroke={model.color}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  Performance Analysis
                </h3>
                <p className="text-gray-700">
                  The chart above shows how each model's predictions compared to
                  actual recession periods (in red). Models with lines closely
                  tracking the actual recession line performed better. Note that
                  predictions are shown with a 3-month minimum lag to reflect
                  real-world data availability.
                </p>
              </div>
            </>
          )}

          {view === "comparison" && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Forecast Comparison Across Time Horizons
              </h2>

              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={comparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="horizon" />
                    <YAxis
                      domain={[0, 1]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip
                      formatter={(value) => `${(value * 100).toFixed(1)}%`}
                    />
                    <Legend />
                    {filteredModels.map((model) => (
                      <Line
                        key={model.id}
                        type="monotone"
                        dataKey={model.id}
                        name={model.name}
                        stroke={model.color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Horizon Insights</h3>
                <p className="text-gray-700">
                  This chart compares how recession probabilities change across
                  different forecast horizons. Rising lines indicate increasing
                  recession risk as the time horizon extends, while falling
                  lines suggest reduced risk over time.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Info panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            About This Dashboard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-lg mb-2">Data Sources</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>NBER Recession Indicators (USREC)</li>
                <li>Unemployment Rate (UNRATE)</li>
                <li>Average Hourly Earnings (AHETPI)</li>
                <li>New Housing Units Authorized (PERMIT)</li>
                <li>Corporate Bond Yield Spread (AAA10Y)</li>
                <li>M2 Money Stock (M2REAL)</li>
                <li>Consumer Price Index (CPIAUCSL)</li>
                <li>Federal Funds Rate (DFF)</li>
                <li>Industrial Production (INDPRO)</li>
                <li>Treasury Yield Spread (T10Y2Y)</li>
                <li>Initial Claims (IC4WSA)</li>
                <li>WTI Crude Oil Price (WTISPLC)</li>
                <li>Federal Surplus/Deficit (MTSDS133FMS)</li>
                <li>S&P 500 Percentage Change (S&P500CHNG)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">Model Information</h3>
              <p className="text-gray-700 mb-2">
                This dashboard compares multiple machine learning models trained
                to predict the probability of a recession in the US economy
                across different time horizons.
              </p>
              <p className="text-gray-700 mb-2">
                Each model uses different underlying algorithms and techniques
                to generate predictions based on the same input data. By
                comparing multiple models, users can gain a more comprehensive
                view of potential economic outcomes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <p className="text-center">
            © 2025 Economic Prediction Team | Last Data Update:{" "}
            {data.lastUpdated}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RecessionDashboard;
