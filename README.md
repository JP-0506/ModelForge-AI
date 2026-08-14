# ModelForge AI

**ModelForge AI** is an end-to-end, full-stack Machine Learning platform that simplifies the complete ML workflow—from dataset upload and preprocessing to model training, evaluation, explainability, reporting, and deployment.

It is designed to provide a structured, user-friendly environment where users can perform Machine Learning operations without having to build every workflow manually.

---

## 📌 Overview

Machine Learning projects often require developers and data scientists to work with multiple tools for:

* Dataset management
* Data validation and cleaning
* Exploratory Data Analysis (EDA)
* Feature engineering
* Model training
* Model comparison
* Model evaluation
* Explainable AI
* Report generation
* Model deployment
* Prediction APIs
* Monitoring

**ModelForge AI brings these capabilities together into a single platform.**

### Core Workflow

```text
Register / Login
      ↓
Create Workspace
      ↓
Create Project
      ↓
Upload Dataset
      ↓
Dataset Validation
      ↓
Data Cleaning
      ↓
Exploratory Data Analysis
      ↓
Feature Engineering
      ↓
Model Training
      ↓
Model Comparison
      ↓
Model Explainability
      ↓
Experiment & Report
      ↓
Model Deployment
      ↓
Prediction API
      ↓
Monitoring
```

---

## ✨ Features

### 🔐 Authentication

* User registration and login
* Password hashing
* JWT-based authentication
* Protected API routes
* Email-based functionality

### 📁 Workspace & Project Management

* Create workspaces
* Create and manage ML projects
* Organize datasets and experiments by project
* Project-level ML workflow

### 📊 Dataset Management

Supported dataset formats:

```text
.csv
.xlsx
.xls
.json
```

Features include:

* Dataset upload
* Dataset validation
* Dataset profiling
* Dataset versioning
* Dataset metadata
* Original, cleaned, and feature-engineered datasets
* Soft deletion
* Duplicate dataset-name validation

### 🧹 Data Cleaning

ModelForge AI provides preprocessing capabilities for:

* Missing-value handling
* Duplicate detection
* Data validation
* Data-type analysis
* Cleaning previews
* Cleaned dataset generation

### 📈 Exploratory Data Analysis

The EDA module provides:

* Dataset statistics
* Column information
* Missing-value analysis
* Correlation analysis
* Distribution analysis
* Categorical analysis
* Visualization-ready results
* Automated dataset insights

### ⚙️ Feature Engineering

Feature engineering capabilities include:

* One-Hot Encoding
* Label Encoding
* Ordinal Encoding
  
### 🤖 Machine Learning

ModelForge AI supports multiple Machine Learning problem types:

* Classification
* Regression
* Clustering
* Time Series
* Anomaly Detection

The training pipeline includes:

```text
Training Validation
       ↓
Target Leakage Detection
       ↓
Dataset Splitting
       ↓
Model Creation
       ↓
Model Training
       ↓
Cross Validation
       ↓
Prediction
       ↓
Evaluation
       ↓
Model Saving
```

### 🔬 Model Evaluation

Models can be evaluated using appropriate metrics based on the problem type.

The platform also supports:

* Train/test splitting
* Cross-validation
* Predictions
* Evaluation results
* Experiment tracking

### 📑 Reports

The platform provides report-generation capabilities for ML workflows, including:

* Dataset information
* Trained Model information
* Evaluation metrics
* Visualizations
* Training results

### 🚀 Model Deployment

Trained models can be prepared for deployment through REST APIs.

The deployment workflow is designed to provide:

```text
Trained Model
     ↓
Model Saving
     ↓
Model Deployment
     ↓
Prediction API
     ↓
Client/Application
```
---

# 🏗️ System Architecture

ModelForge AI uses a three-layer backend architecture.

```text
                    ┌───────────────────┐
                    │   React Frontend  │
                    │      :5173        │
                    └─────────┬─────────┘
                              │
                              │ REST API
                              ▼
                    ┌───────────────────┐
                    │   Node.js API     │
                    │   Express :5000   │
                    │                   │
                    │ CRUD + Business   │
                    │ Logic + Auth      │
                    └───────┬───────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
       ┌──────────────────┐   ┌──────────────────┐
       │     MongoDB      │   │ Django ML Engine │
       │                  │   │      :8000       │
       │ Users            │   │                  │
       │ Projects         │   │ Data Processing  │
       │ Datasets         │   │ EDA              │
       │ Experiments      │   │ Feature Engineer │
       │ Deployments      │   │ Training         │
       └──────────────────┘   │ Explainability   │
                              │ Reporting        │
                              └──────────────────┘
```

### Backend Responsibilities

| Component         | Responsibility                                    |
| ----------------- | ------------------------------------------------- |
| React             | User interface and interaction                    |
| Node.js + Express | Authentication, CRUD, API orchestration           |
| Django            | Machine Learning and data-processing engine       |
| MongoDB           | Application data and metadata                     |
| Django Media      | Dataset, model, report and temporary file storage |

### Important Architecture Rule

The frontend communicates with the **Node.js backend**.

The frontend does not directly communicate with the Django ML engine for the main application workflow.

```text
React → Node.js → Django
```

---

# 🛠️ Technology Stack

## Frontend

* React
* Vite
* JavaScript
* React Router
* Axios
* React Hook Form
* Recharts
* Framer Motion
* Lucide React
* TanStack React Table

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Nodemailer
* Multer
* Express Validator
* Axios

## Machine Learning Engine

* Python
* Django
* Django REST Framework
* NumPy
* Pandas
* SciPy
* Scikit-learn
* XGBoost
* LightGBM
* CatBoost
* Joblib
* Cloudpickle

## Data Visualization & Reporting

* Matplotlib
* Seaborn
* Plotly
* ReportLab

## Infrastructure

* Docker
* Docker Compose
* MongoDB
* Git
* GitHub

---

# 📂 Project Structure

```text
ModelForge-AI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── node_backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   └── models/
│   │
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── django_backend/
│   ├── config/
│   ├── ml_engine/
│   ├── report_engine/
│   ├── ai_chat/
│   ├── api/
│   ├── media/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml
└── README.md
```

---

# 🗄️ Data Storage

ModelForge AI uses **MongoDB** for application data.

Major collections include:

```text
users
auth
projects
datasets
dataset_versions
experiments
reports
deployments
notifications
comments
```

Dataset files and generated ML artifacts are stored separately from MongoDB.

For example:

```text
django_backend/
└── media/
    ├── datasets/
    │   └── <dataset_id>/
    │       └── v1/
    │           ├── original.csv
    │           ├── cleaned.csv
    │           ├── feature_engineered.csv
    │           └── feature_metadata.json
    │
    ├── models/
    ├── reports/
    └── temp/
```

MongoDB stores the metadata and file paths rather than storing the complete dataset files directly.

---

# 🐳 Docker Setup

ModelForge AI can be run using Docker Compose.

The Docker environment contains:

```text
┌───────────────────────────────┐
│          Docker               │
│                               │
│  ┌───────────┐                │
│  │ Frontend  │ :5173          │
│  └───────────┘                │
│                               │
│  ┌───────────┐                │
│  │ Node.js   │ :5000          │
│  └───────────┘                │
│                               │
│  ┌───────────┐                │
│  │ Django    │ :8000          │
│  └───────────┘                │
└───────────────────────────────┘

        MongoDB
     localhost:27017
       (Host Machine)
```

This allows the application services to be started together instead of manually running separate terminals.

---

# ⚙️ Local Development Setup

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Python
* MongoDB
* Docker Desktop
* Git

---

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ModelForge-AI
```

---

## 2. Configure Environment Variables

Create the required `.env` files using the provided examples:

```text
node_backend/.env.example
frontend/.env.example
django_backend/.env.example
```

Rename/copy them to:

```text
node_backend/.env
frontend/.env
django_backend/.env
```

Update the values according to your local environment.

> Never commit `.env` files containing passwords, API keys, JWT secrets, SMTP credentials, or other sensitive information.

---

# ▶️ Running with Docker

Make sure Docker Desktop is running.

From the project root:

```bash
docker compose up --build
```

After the containers start:

### Frontend

```text
http://localhost:5173
```

### Node.js API

```text
http://localhost:5000
```

### Django ML Engine

```text
http://localhost:8000
```

To run the containers in the background:

```bash
docker compose up -d --build
```

To stop them:

```bash
docker compose down
```

To check running services:

```bash
docker compose ps
```

To view logs:

```bash
docker compose logs -f
```

For a specific service:

```bash
docker compose logs -f node
docker compose logs -f django
docker compose logs -f frontend
```
---

# 🔒 Security

ModelForge AI includes several security-oriented practices:

* Password hashing with bcrypt
* JWT authentication
* Protected API routes
* Request validation
* File-type validation
* File-size validation
* Environment-based secrets
* CORS configuration
* Soft deletion for application records

For production deployment, additional infrastructure and security hardening should be configured before exposing the application publicly.

---

# 📊 Supported ML Workflow

| Stage               | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| Validation          | Check dataset quality and training requirements |
| Cleaning            | Handle data-quality problems                    |
| EDA                 | Understand dataset patterns                     |
| Feature Engineering | Transform and generate useful features          |
| Training            | Train Machine Learning algorithms               |
| Cross Validation    | Estimate model generalization                   |
| Evaluation          | Measure model performance                       |
| Comparison          | Compare different experiments/models            |
| Reporting           | Generate ML reports                             |
| Deployment          | Expose trained models                           |
| Monitoring          | Track deployed model performance                |

---

# 🧪 Development Status

ModelForge AI is being developed as a modular end-to-end Machine Learning platform.

### Current development areas

* Authentication
* Project management
* Dataset management
* Dataset validation
* Data cleaning
* EDA
* Feature engineering
* Model training
* Model evaluation
* Experiment management
* Model comparison
* Report generation
* Model deployment
* Dataset AI assistant

Some advanced capabilities may still be under active development.
---

# ⭐ Support

If you find **ModelForge AI** useful, consider giving the repository a ⭐ on GitHub.

For bugs, feature requests, or improvements, open an issue or submit a pull request.

---

## 🚀 ModelForge AI

> **Build. Train. Explain. Deploy.**

A unified platform for turning datasets into deployable Machine Learning models.
