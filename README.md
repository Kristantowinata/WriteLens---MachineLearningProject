# WriteLens — AI Writing Style Analyzer

WriteLens is a self-assessment tool that analyzes your writing style using stylometric features and a trained Gradient Boosting machine learning model. It helps writers (especially non-native English speakers) understand which features in their writing might trigger AI detectors.

---

## Tech Stack & Features
- **Backend:** FastAPI + scikit-learn (Gradient Boosting Classifier)
- **Frontend:** React + Vite (Vanilla CSS design system)
- **ML Pipeline:** 20 features extracted → 12 selected (Cohen's d ≥ 0.15) → 8 core features displayed in UI
- **Model Performance:** F1 = 0.93, AUC = 0.99 on the DAIGT v2 dataset (~44,800 essays)
- **Zero-Friction Fallback:** Automatically falls back to a rule-based stylometric analyzer if ML model files are absent.

---

## Quick Start (Local)

### Prerequisites
Make sure you have the following installed on your machine:
- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

---

### Step-by-Step Installation

#### 1. Clone the repository
```bash
git clone https://github.com/Kristantowinata/WriteLens---MachineLearningProject.git
cd WriteLens---MachineLearningProject
```

#### 2. Set up the Backend
It is highly recommended to use a Python virtual environment to avoid package conflicts:
```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows (Command Prompt):
venv\Scripts\activate
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

> [!NOTE]  
> The pre-trained model files (`model.pkl`, `scaler.pkl`) are already tracked and included in the repository under `backend/ml/`. You **do not** need to re-train the model to run the app. If they are ever missing, the server will automatically fallback to the rule-based analyzer.

#### 3. Build the Frontend
Compile the React application:
```bash
cd ../frontend
npm install
npm run build
```

#### 4. Start the Application Server
Run the FastAPI production server (which serves the compiled React app):
```bash
cd ../backend

# Ensure your virtual environment is active
python -m uvicorn main:app --port 8000
```

#### 5. Open the Web App
Open your browser and navigate to: **[http://localhost:8000](http://localhost:8000)** 🎉

---

## Development Mode (Frontend Hot Reload)

If you are actively making changes to the frontend, you should run the backend and frontend development servers separately to enable Hot Module Replacement (HMR):

**Terminal 1 — Backend API:**
```bash
cd backend
# Activate your venv first
python -m uvicorn main:app --port 8000 --reload
```

**Terminal 2 — Frontend Dev Server:**
```bash
cd frontend
npm run dev
```

Open your browser to **[http://localhost:5173](http://localhost:5173)**. API requests will automatically proxy to the backend at `localhost:8000`.

---

## Dataset & Model Training

| Dataset | Source | Size | Description |
|---|---|---|---|
| DAIGT v2 | [Kaggle](https://www.kaggle.com/datasets/thedrcat/daigt-v2-train-dataset) | ~44,800 essays | Student essays (0 = human, 1 = AI). Primary training data. |
| MAGE | [HuggingFace](https://huggingface.co/datasets/yaful/MAGE) | ~447,000 texts | Multi-source (Reddit, Yelp, Q&A) human + LLM-generated texts. Used for augmentation (sampled 15k/class). |

The final model is trained on **DAIGT v2** to ensure the training domain matches our target users (essays and articles). 

### Re-training the Model (Optional)
If you wish to re-train the model or explore the training notebooks:
1. Download the training datasets from the sources listed above.
2. Place the raw files in a `data/` directory at the root level of the project.
3. Run the Jupyter notebooks in the `notebooks/` directory sequentially:
   - `01_EDA.ipynb` (Exploratory Data Analysis)
   - `02_feature_engineering.ipynb` (Feature extraction and dataset preparation)
   - `03_model_training.ipynb` (Model training and exports `model.pkl` & `scaler.pkl` to `backend/ml/`)

**Reference:**
Li, Y., et al. (2024). *MAGE: Machine-generated Text Detection in the Wild.* arXiv:2305.13242

---

## Project Structure
```
WriteLens/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── requirements.txt         # Python dependencies
│   ├── ml/
│   │   ├── model.pkl            # Pre-trained ML model (tracked)
│   │   ├── scaler.pkl           # Feature scaler (tracked)
│   │   ├── feature_order.json   # Feature ordering for model
│   │   └── feature_ranges.json  # Human/AI ranges per feature
│   ├── routers/
│   │   └── analyze.py           # POST /api/analyze endpoint
│   └── services/
│       ├── feature_extractor.py # 12-feature extraction
│       ├── predictor.py         # ML prediction + fallback logic
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
