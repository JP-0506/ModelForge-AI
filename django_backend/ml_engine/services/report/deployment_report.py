from ml_engine.services.report.pdf_generator import PDFGenerator


class DeploymentReport:
    """Generate Deployment Report."""

    def __init__(self):
        self.pdf_generator = PDFGenerator()

    def generate(self, report_data):
        """
        Generate deployment report.

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
                    "Model Name": report_data.get("model_name"),
                },
            },
            {
                "heading": "Deployment Information",
                "content": {
                    "Endpoint Name": report_data.get("endpoint_name"),
                    "Endpoint URL": report_data.get("endpoint_url"),
                    "Deployment Status": report_data.get("deployment_status"),
                    "Deployment Date": report_data.get("deployment_date"),
                },
            },
        ]

        # Generate PDF
        pdf_buffer = self.pdf_generator.generate(
            title="Deployment Report",
            sections=sections,
        )

        return pdf_buffer, "deployment_report.pdf"
