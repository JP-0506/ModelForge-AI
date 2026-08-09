from ml_engine.services.report.pdf_generator import PDFGenerator


class ValidationReport:
    """Generate Dataset Validation Report."""

    def __init__(self):
        self.pdf_generator = PDFGenerator()

    def generate(self, report_data):
        """
        Generate validation report PDF.

        Parameters
        ----------
        report_data : dict

        Returns
        -------
        tuple
            (pdf_buffer, file_name)
        """
        sections = [
            {
                "heading": "Dataset Overview",
                "content": {
                    "Dataset Name": str(report_data.get("dataset_name", "N/A")),
                    "Total Rows": str(report_data.get("total_rows", "N/A")),
                    "Total Columns": str(report_data.get("total_columns", "N/A")),
                    "Validation Status": str(report_data.get("status", "Completed")),
                },
            },
            {
                "heading": "Health Check Overview",
                "content": {
                    "Passed Checks": str(report_data.get("passed_checks", 0)),
                    "Warnings": str(report_data.get("warning_checks", 0)),
                    "Critical Errors": str(report_data.get("error_checks", 0)),
                },
            },
        ]

        # Extract detected issues as formatted sentences
        issues = report_data.get("issues", [])
        if issues and isinstance(issues, list) and len(issues) > 0:
            issue_sentences = []
            for issue in issues:
                if isinstance(issue, dict):
                    sev = str(issue.get("severity", "Warning")).upper()
                    itype = str(issue.get("type", "Quality Issue")).replace("_", " ").title()
                    msg = str(issue.get("message", "N/A"))
                    rec = str(issue.get("recommendation", "N/A"))
                    
                    sentence = f"<b>[{sev}] {itype}:</b> {msg} <i>Recommendation:</i> {rec}"
                    issue_sentences.append(sentence)

            sections.append({
                "heading": "Detected Quality Issues",
                "content": issue_sentences,
            })
        else:
            sections.append({
                "heading": "Detected Quality Issues",
                "content": "No critical quality issues or structural errors were detected in this dataset.",
            })

        pdf_buffer = self.pdf_generator.generate(
            title=f"Validation Report - {report_data.get('dataset_name', 'Dataset')}",
            sections=sections,
        )

        return pdf_buffer, "validation_report.pdf"
