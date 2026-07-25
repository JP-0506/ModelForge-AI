from ml_engine.services.report.pdf_generator import PDFGenerator


class TrainingReport:
    """
    Generate Training Report.
    """

    def __init__(self):
        self.pdf_generator = PDFGenerator()

    def generate(self, report_data):
        """
        Generate training report.

        Parameters
        ----------
        report_data : dict

        Returns
        -------
        tuple
            (pdf_buffer, file_name)
        """
        # Report sections
        sections = [
            {
                "heading": "Project Information",
                "content": {
                    "Project Name": report_data.get("project_name"),
                    "Experiment Name": report_data.get("experiment_name"),
                    "Problem Type": report_data.get("problem_type"),
                    "Target Column": report_data.get("target_column"),
                },
            },
            {
                "heading": "Model Information",
                "content": {
                    "Model Name": report_data.get("model_name"),
                    "Training Date": report_data.get("training_date"),
                },
            },
            {
                "heading": "Training Metrics",
                "content": report_data.get("metrics", {}),
            },
        ]

        # Generate PDF
        pdf_buffer = self.pdf_generator.generate(
            title="Training Report",
            sections=sections,
        )

        return pdf_buffer, "training_report.pdf"