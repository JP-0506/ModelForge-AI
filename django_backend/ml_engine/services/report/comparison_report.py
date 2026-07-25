from ml_engine.services.report.pdf_generator import PDFGenerator


class ComparisonReport:
    """Generate Model Comparison Report."""

    def __init__(self):
        self.pdf_generator = PDFGenerator()

    def generate(self, report_data):
        """
        Generate comparison report.

        Parameters
        ----------
        report_data : dict

        Returns
        -------
        tuple
            (pdf_buffer, file_name)
        """
        # Comparison table
        comparison_table = [["Model", "Score"]]

        for model in report_data.get("models", []):
            comparison_table.append([model.get("model_name"), model.get("score")])

        # Report sections
        sections = [
            {
                "heading": "Project Information",
                "content": {
                    "Project Name": report_data.get("project_name"),
                    "Experiment Name": report_data.get("experiment_name"),
                    "Problem Type": report_data.get("problem_type"),
                },
            },
            {
                "heading": "Best Model",
                "content": {
                    "Model Name": report_data.get("best_model"),
                    "Best Score": report_data.get("best_score"),
                },
            },
            {
                "heading": "Model Comparison",
                "content": comparison_table,
            },
        ]

        # Generate PDF
        pdf_buffer = self.pdf_generator.generate(
            title="Comparison Report",
            sections=sections,
        )

        return pdf_buffer, "comparison_report.pdf"
