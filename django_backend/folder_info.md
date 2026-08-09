# ModelForge AI - Django Backend Folder Guide

This document explains the purpose of each folder in the Django Backend.

---

# Django Backend Structure

```text
django_backend/
│
├── config/
├── ml_engine/
├── report_engine/
├── ai_chat/
├── media/
│
├── requirements.txt
├── manage.py
├── .env
├── README.md
└── .gitignore
```

---

# 📁 config/

## Purpose

This is the **Django Project Configuration** folder.

It contains the global configuration required to run the Django project.

### Responsibilities

- Project Configuration
- Application Registration
- URL Configuration
- Middleware Configuration
- Database Configuration
- Static & Media Configuration
- Security Configuration
- Environment Configuration

### Does NOT Contain

- Machine Learning Logic
- Dataset Processing
- Report Generation
- Business Logic

---

# 📁 ml_engine/

## Purpose

This is the **core Machine Learning Engine** of ModelForge AI.

All AI/ML-related operations are implemented inside this Django application.

### Responsibilities

- Dataset Validation
- Dataset Profiling
- Data Cleaning
- Feature Engineering
- Exploratory Data Analysis (EDA)
- AI Dataset Analysis
- Machine Learning Model Training
- Hyperparameter Tuning
- Model Comparison
- Explainable AI (SHAP & LIME)
- Prediction
- Model Deployment
- Model Monitoring
- Load Trained Models
- Save Trained Models

### Operations Performed

- Read Dataset
- Analyze Dataset
- Validate Dataset
- Clean Dataset
- Transform Dataset
- Train Models
- Evaluate Models
- Compare Models
- Generate Predictions
- Explain Predictions
- Save Trained Models
- Load Existing Models

### Does NOT Contain

- Authentication
- User Management
- Workspace Management
- Project Management
- MongoDB CRUD Operations

---

# 📁 report_engine/

## Purpose

Responsible for generating reports and visualizations.

This application converts AI/ML results into professional reports.

### Responsibilities

- Generate PDF Reports
- Generate Charts
- Build Final Reports
- Report Templates
- Export Reports

### Operations Performed

- Generate Dataset Reports
- Generate Experiment Reports
- Generate Model Reports
- Generate Deployment Reports
- Generate Charts
- Generate Graphs
- Export Reports as PDF

### Does NOT Contain

- Model Training
- Dataset Validation
- Authentication
- Database Operations

---

# 📁 ai_chat/

## Purpose

Provides AI-powered interaction with datasets and trained models.

This application enables users to ask questions about their datasets using natural language.

### Responsibilities

- AI Chat
- Dataset Question Answering
- AI Insights
- Prompt Management
- Business Insights

### Operations Performed

- Chat with Dataset
- Explain Dataset
- Explain Model Performance
- Suggest Improvements
- Generate AI Insights
- Answer Dataset Questions

### Does NOT Contain

- Authentication
- User Management
- Database CRUD
- Model Training

---

# 📁 media/

## Purpose

Stores runtime-generated files.

These files are generated while processing datasets and training models.

### Responsibilities

- Store Uploaded Datasets
- Store Cleaned Datasets
- Store Trained Models
- Store Generated Reports
- Store Temporary Files

### Operations Performed

- Save Uploaded Files
- Save Cleaned Dataset
- Save Trained Model
- Save Generated Reports
- Temporary Processing Storage

---

# Summary

| Folder | Purpose | Main Operations |
|----------|----------|----------------|
| **config/** | Django project configuration | Project setup, database configuration, middleware, URL management |
| **ml_engine/** | AI & Machine Learning Engine | Validation, cleaning, EDA, feature engineering, AutoML, prediction, explainability |
| **report_engine/** | Report generation system | PDF generation, charts, graphs, report building |
| **ai_chat/** | AI conversational engine | Chat with dataset, AI insights, question answering |
| **media/** | Runtime file storage | Store datasets, cleaned files, trained models, reports and temporary files |

---

# Django Backend Workflow

```text
Node.js Backend
        │
        ▼
Django REST API
        │
        ▼
ML Engine
│
├── Dataset Validation
├── Dataset Profiling
├── Data Cleaning
├── Feature Engineering
├── Exploratory Data Analysis
├── AI Dataset Analysis
├── Model Training
├── Hyperparameter Tuning
├── Model Comparison
├── Explainable AI
├── Prediction
├── Model Monitoring
└── Deployment
        │
        ▼
Report Engine
        │
        ▼
AI Chat (Optional)
        │
        ▼
Response to Node.js
```

---

# Summary

The Django Backend serves as the **AI & Machine Learning Engine** of ModelForge AI.

Its primary responsibilities include:

- AI-powered Dataset Processing
- Data Validation & Cleaning
- Feature Engineering
- Exploratory Data Analysis
- Machine Learning Model Training
- Model Evaluation & Comparison
- Explainable AI
- Prediction APIs
- Report Generation
- AI-powered Dataset Chat

Unlike the Node.js Backend, the Django Backend **does not manage users, authentication, workspaces, projects, or database CRUD operations**. Its sole responsibility is to process datasets, build intelligent machine learning pipelines, and return results to the Node.js Backend.