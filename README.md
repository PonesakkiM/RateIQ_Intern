# RateIQ: Predict Before You Download

RateIQ is an AI-powered app rating prediction and diagnostic platform that analyzes Play Store metadata and predicts user satisfaction scores before installation.

---

## 1. Project Overview
* **Predictive Intelligence**: RateIQ is a machine learning-based system engineered to forecast Google Play Store app ratings on a precise 1.0 to 5.0 scale.
* **Smart App Evaluation**: Built to help publishers, product managers, and developers evaluate and optimize app quality and storefront presentation before launch.
* **Explainable AI (XAI)**: Utilizes game-theoretic SHAP (SHapley Additive exPlanations) attributions to decode "black-box" model outputs, explaining exact driver contributions.

---

## 2. Key Features
* **Rating Prediction**: Forecast app rating indexes using category, installs, sizing, pricing, update pattern, and ad configurations.
* **Competitor Analysis**: Compare candidate application profiles against category benchmarks and industry standards.
* **Trend Analysis**: Analyze category-wide rating distributions and baseline metrics across different Play Store fields.
* **AI Advisor**: Generate personalized, actionable optimization advice based on feature impacts.
* **SHAP Explainability**: Visualize positive and negative contributions of each app parameter.
* **Prediction History**: Keep a persistent historical log of calculated predictions to perform longitudinal audits.
* **EDA Dashboard**: Explore historical distributions, trends, and correlation indexes.
* **What-if Analysis**: Dynamically play with hypothetical storefront configurations in an interactive sandbox.

---

## 3. Dataset Info
* **Source**: Google Play Store dataset.
* **Features Used**:
  * `Category`: Primary app field (e.g., GAME, FAMILY, TOOLS, PRODUCTIVITY).
  * `Installs`: Total downloads baseline.
  * `Reviews`: Volume of submitted reviews.
  * `Size`: Application file footprint (MB).
  * `Price`: Financial purchase cost ($).
  * `Content Rating`: Targeted suitability demographic (e.g., Everyone, Teen).
  * `Last Updated Days`: Time duration (days) since last storefront release.
  * `Contains Ads`: Boolean indicating advertising content presence.
* **Target Variable**:
  * `App Rating` (continuous numeric value on a 1.0 to 5.0 scale).

---

## 4. Data Preprocessing
* **Missing Value Handling**: Imputed empty entries using category medians for numerical attributes and mode categories for discrete properties.
* **Encoding Categorical Features**: Integrated robust label encoding and target frequency maps to represent high-cardinality fields.
* **Feature Scaling**: Scaled highly skewed metrics (such as reviews and installs) using logarithmic transformation and standard scaling.
* **Feature Engineering**: Extracted interaction variables such as engagement ratios (reviews to installs ratio), cost metrics, and release frequency indicators.

---

## 5. Model Development
* **Regressor Exploration**: Developed multiple regressors to find optimal mapping boundaries.
* **Models Evaluated**: Linear Regression, Random Forest Regressor, XGBoost, and LightGBM.
* **Evaluation Metrics**: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Coefficient of Determination (R² Score).

---

## 6. Model Comparison

| Model | MAE | RMSE | R² |
| :--- | :---: | :---: | :---: |
| Linear Regression | - | - | - |
| Random Forest | - | - | - |
| XGBoost | - | - | - |
| LightGBM | - | - | - |

---

## 7. Final Model
* **Optimized LightGBM & Random Forest**: Selected for outstanding generalization, speed, and capability to capture multi-modal categorical boundaries.
* **SHAP Interpretability**: Fully unified with SHAP explainability kernels to compute explicit additive feature weights for every single inference.

---

## 8. Technical Architecture
* **Frontend UI**: Streamlit
* **Backend API**: FastAPI
* **Machine Learning**: Scikit-learn / LightGBM
* **Explainability Engine**: SHAP
* **Visualization Layer**: Plotly
* **Containerization**: Docker & Docker Compose

---

## 9. Workflow / Architecture Pipeline
```
User Input ──> Feature Extraction ──> API Gateway (FastAPI) ──> ML Regressor Model ──> SHAP Explainer ──> Output Dashboard (Streamlit)
```

---

## 10. Local Installation & Development

### 1. Requirements Setup
```bash
pip install -r requirements.txt
```

### 2. Launch FastAPI Backend
```bash
uvicorn backend.main:app --reload
```

### 3. Launch Streamlit Frontend
```bash
streamlit run frontend/app.py
```

---

## 11. Containerized Run (Docker)
Containerize the entire ecosystem using Docker Compose:

```bash
docker compose up --build
```

* **Frontend Dashboard**: http://localhost:8501
* **Backend API Server**: http://localhost:8000

---

## 12. Future Work
* **Real-time Play Store API Integration**: Enable instant scraper hooks to automatically fetch active competitors' metadata using package IDs.
* **Mobile App Version**: Build a lightweight companion app using responsive Native wrappers.
* **Advanced Recommendation System**: Integrate collaborative filtering to identify precise storefront design benchmarks.
* **LLM-Based Advisor**: Hook up Gemini AI models to explain recommendations in highly context-specific conversational formats.

---

## 13. Developer
* **Name**: Ponesakki.M
* **GitHub**: [PonesakkiM](https://github.com/PonesakkiM)
* **LinkedIn**: [ponesakki-m](https://www.linkedin.com/in/ponesakki-m)

---

## 14. Legal Disclaimer
RateIQ predictions are based on machine learning models trained on historical data. They are intended for educational and analytical purposes only and may not reflect real-world commercial outcomes.
