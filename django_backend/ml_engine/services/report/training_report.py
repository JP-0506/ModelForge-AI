from datetime import datetime
from ml_engine.services.report.pdf_generator import PDFGenerator


class TrainingReport:
    """
    Generate Comprehensive Model Training PDF Report.
    """

    def __init__(self):
        self.pdf_generator = PDFGenerator()

    def generate(self, report_data):
        """
        Generate model training PDF report.

        Parameters
        ----------
        report_data : dict

        Returns
        -------
        tuple
            (pdf_buffer, file_name)
        """
        metrics = report_data.get("metrics", {})
        cv = report_data.get("cross_validation", {})
        leakage = report_data.get("target_leakage", {})
        params = report_data.get("parameters", {})

        sections = [
            {
                "heading": "Project & Experiment Information",
                "content": {
                    "Project Name": report_data.get("project_name", "N/A"),
                    "Experiment Name": report_data.get("experiment_name", "N/A"),
                    "Problem Type": report_data.get("problem_type", "N/A"),
                    "Target Column": report_data.get("target_column", "N/A"),
                    "Selected Algorithm": report_data.get("algorithm", report_data.get("model_name", "N/A")),
                    "Report Generated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                },
            },
            {
                "heading": "Training Configuration",
                "content": {
                    "Train/Test Split": report_data.get("train_test_split", "80% Train / 20% Test"),
                    "Cross Validation Folds": cv.get("folds", 5),
                    "Hyperparameters": str(params) if params else "Default Parameters",
                },
            },
            {
                "heading": "Cross Validation Results",
                "content": {
                    "Average CV Score": round(cv.get("mean_score", 0), 4) if cv.get("mean_score") is not None else "N/A",
                    "Standard Deviation": round(cv.get("std_score", 0), 4) if cv.get("std_score") is not None else "N/A",
                    "Fold Scores": str([round(s, 4) for s in cv.get("scores", [])]) if cv.get("scores") else "N/A",
                },
            },
            {
                "heading": "Model Evaluation Metrics",
                "content": {
                    k: (round(v, 4) if isinstance(v, (int, float)) else str(v))
                    for k, v in metrics.items()
                    if k not in ["confusion_matrix", "classification_report", "residual_sample"]
                },
            },
            {
                "heading": "Target Leakage Detection",
                "content": {
                    "Status": leakage.get("status", "Passed / No Leakage Detected"),
                    "Risk Score": leakage.get("risk_score", 0),
                    "High Risk Features": ", ".join(leakage.get("high_risk_features", [])) or "None",
                },
            },
            {
                "heading": "Model Storage Information",
                "content": {
                    "Model Name": report_data.get("model_name", "Trained Model"),
                    "Training Duration": f"{report_data.get('training_time', 'N/A')} seconds",
                    "Model Size": f"{report_data.get('model_size', 'N/A')} bytes",
                    "Training Date": report_data.get("training_date", datetime.now().strftime("%Y-%m-%d")),
                },
            },
        ]

        if "confusion_matrix" in metrics:
            sections.append({
                "heading": "Confusion Matrix",
                "content": str(metrics["confusion_matrix"]),
            })

        pdf_buffer = self.pdf_generator.generate(
            title="Model Training & Evaluation Report",
            sections=sections,
        )

        filename = f"training_report_{report_data.get('experiment_name', 'model')}.pdf"
        return pdf_buffer, filename