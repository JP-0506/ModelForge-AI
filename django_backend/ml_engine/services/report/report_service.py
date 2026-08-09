# from ml_engine.services.report.training_report import TrainingReport
# from ml_engine.services.report.comparison_report import ComparisonReport
# from ml_engine.services.report.deployment_report import DeploymentReport


# class ReportService:
#     """
#     Service for generating Machine Learning reports.
#     """

#     def __init__(self):

#         self.training_report = TrainingReport()
#         self.comparison_report = ComparisonReport()
#         self.deployment_report = DeploymentReport()

#     # ==================================================
#     # Generate Report
#     # ==================================================

#     def generate_report(
#         self,
#         report_data,
#     ):
#         """
#         Generate report based on report type.
#         """

#         report_type = report_data.get(
#             "report_type",
#         )

#         # ------------------------------------------
#         # Training Report
#         # ------------------------------------------

#         if report_type == "training":

#             return self.training_report.generate(
#                 report_data,
#             )

#         # ------------------------------------------
#         # Comparison Report
#         # ------------------------------------------

#         if report_type == "comparison":

#             return self.comparison_report.generate(
#                 report_data,
#             )

#         # ------------------------------------------
#         # Deployment Report
#         # ------------------------------------------

#         if report_type == "deployment":

#             return self.deployment_report.generate(
#                 report_data,
#             )

#         # ------------------------------------------
#         # Invalid Report Type
#         # ------------------------------------------

#         raise ValueError(
#             "Invalid report type.",
#         )

from ml_engine.services.report.training_report import (
    TrainingReport,
)

from ml_engine.services.report.comparison_report import (
    ComparisonReport,
)

from ml_engine.services.report.deployment_report import (
    DeploymentReport,
)
from ml_engine.services.report.validation_report import ValidationReport


class ReportService:
    """
    Service for generating Machine Learning reports.
    """

    def __init__(self):

        self.training_report = TrainingReport()

        self.comparison_report = ComparisonReport()

        self.deployment_report = DeploymentReport()

        self.validation_report = ValidationReport()

    # ==================================================
    # Generate Report
    # ==================================================

    def generate_report(
        self,
        report_type,
        report_data,
    ):
        """
        Generate report based on report type.

        Parameters
        ----------
        report_type : str

        report_data : dict

        Returns
        -------
        tuple
            (pdf_buffer, file_name)
        """

        # ------------------------------------------
        # Training Report
        # ------------------------------------------

        if report_type == "training":

            return self.training_report.generate(
                report_data,
            )

        # ------------------------------------------
        # Comparison Report
        # ------------------------------------------

        if report_type == "comparison":

            return self.comparison_report.generate(
                report_data,
            )

        # ------------------------------------------
        # Deployment Report
        # ------------------------------------------

        if report_type == "deployment":

            return self.deployment_report.generate(
                report_data,
            )

        # ------------------------------------------
        # Validation Report
        # ------------------------------------------

        if report_type == "validation":

            return self.validation_report.generate(
                report_data,
            )

        # ------------------------------------------
        # Invalid Report Type
        # ------------------------------------------

        raise ValueError(
            "Invalid report type.",
        )
