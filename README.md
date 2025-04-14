# Recession Prediction Dashboard

A dashboard for visualizing our recession probability forecasts across multiple economic models and time horizons.

## Features

- **Multi-model Comparison**: View and compare predictions from 11 different machine learning models
- **Multiple Visualization Options**:
  - Current predictions by forecast horizon
  - Historical model performance 
  - Forecast comparison across time horizons
- **Interactive Controls**: Filter models, change time horizons, and switch between different views

## Technologies Used

- React
- Recharts (for data visualization)
- Tailwind CSS (for styling)

## Data Sources

The dashboard uses simulated data for illustration, but in a real-world implementation, it would draw from the following economic indicators:

- NBER Recession Indicators (USREC)
- Unemployment Rate (UNRATE)
- Average Hourly Earnings (AHETPI)
- New Housing Units Authorized (PERMIT)
- Corporate Bond Yield Spread (AAA10Y)
- M2 Money Stock (M2REAL)
- Consumer Price Index (CPIAUCSL)
- Federal Funds Rate (DFF)
- Industrial Production (INDPRO)
- Treasury Yield Spread (T10Y2Y)
- Initial Claims (IC4WSA)
- WTI Crude Oil Price (WTISPLC)
- Federal Surplus/Deficit (MTSDS133FMS)
- S&P 500 Percentage Change (S&P500CHNG)

## Available Models

The dashboard includes predictions from the following models:

- Random Forest
- XGBoost
- Logistic Regression
- SVM (Support Vector Machine)
- Naive Bayes
- k-NN (k-Nearest Neighbors)
- AdaBoost
- MLP (Multi-Layer Perceptron)
- ARIMAX (Autoregressive Integrated Moving Average with Exogenous Variables)
- LSTM (Long Short-Term Memory neural network)
- Ensemble (Combined prediction from multiple models)
