# WriteLens — AI Writing Style Analyzer

WriteLens is a self-assessment tool that analyzes your writing style using stylometric features and a trained Gradient Boosting ML model. It helps non-native English writers understand which features in their writing might trigger AI detectors.

## Dataset used for model training

| Dataset | Source | Size | Description |
|---|---|---|---|
| DAIGT v2 | [Kaggle](https://www.kaggle.com/datasets/thedrcat/daigt-v2-train-dataset) | ~44,800 essays | Student essays, 0=human 1=AI. Used as primary training data |
| MAGE | [HuggingFace](https://huggingface.co/datasets/yaful/MAGE) | ~447,000 texts | Multi-source (Reddit, Yelp, QA) human + LLM-generated texts. Used for augmentation (sampled 15k/class) |

Final model trained on DAIGT v2 only — domain matches target users (essay/article writers) better than combined dataset.

**Reference:**
Li, Y., et al. (2024). *MAGE: Machine-generated Text Detection in the Wild.* arXiv:2305.13242

## Quick Start (Local)

### Prerequisites
- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### 1. Clone the repository
```bash
git clone https://github.com/Kristantowinata/WriteLens---MachineLearningProject.git
cd WriteLens---MachineLearningProject
```

### 2. Setup backend
```bash
cd backend
pip install -r requirements.txt
```

> ⚠️ **Model files** (`model.pkl`, `scaler.pkl`) are not tracked in Git because they're large binaries.  
> You need to generate them by running the training notebook:
> ```bash
> cd ../notebooks
> jupyter notebook 03_model_training.ipynb
> # Run all cells — this will save model.pkl and scaler.pkl to backend/ml/
> ```
> Or ask the team for the model files and place them in `backend/ml/`.

### 3. Build frontend
```bash
cd ../frontend
npm install
npm run build
```

### 4. Start the server
```bash
cd ../backend
python -m uvicorn main:app --port 8000
```

### 5. Open the app
Open your browser and go to: **http://localhost:8000**

That's it! 🎉

---

## Development Mode (Frontend Hot Reload)

If you're actively developing the frontend, you can run the Vite dev server separately:

**Terminal 1 — Backend:**
```bash
cd backend
python -m uvicorn main:app --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** (Vite dev server).  
API calls will automatically proxy to `localhost:8000`.

---

## Project Structure
```
WriteLens/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── requirements.txt         # Python dependencies
│   ├── ml/
│   │   ├── model.pkl            # Trained model (gitignored)
│   │   ├── scaler.pkl           # Feature scaler (gitignored)
│   │   ├── feature_order.json   # Feature ordering for model
│   │   └── feature_ranges.json  # Human/AI ranges per feature
│   ├── routers/
│   │   └── analyze.py           # POST /api/analyze endpoint
│   └── services/
│       ├── feature_extractor.py # 12-feature extraction
│       ├── predictor.py         # ML prediction + fallback
│       └── insight_generator.py # Human-readable insights
├── frontend/
│   ├── src/
│   │   ├── pages/               # React pages
│   │   ├── components/          # UI components
│   │   └── utils/
│   │       └── analyzeLocal.js  # Offline fallback (rule-based)
│   └── package.json
├── notebooks/
│   ├── 01_EDA.ipynb             # Exploratory Data Analysis
│   ├── 02_feature_engineering.ipynb  # Feature extraction
│   └── 03_model_training.ipynb  # Model training
└── data/                        # Training data (gitignored)
```

## Tech Stack
- **Backend:** FastAPI + scikit-learn (Gradient Boosting)
- **Frontend:** React + Vite
- **ML Pipeline:** 20 features extracted → 12 selected (Cohen's d ≥ 0.15) → 8 displayed in UI
- **Model:** F1 = 0.93, AUC = 0.99 on DAIGT v2 dataset (~44,800 essays)
