import json
import pandas as pd

from ml_engine.utils.file_utils import FileUtils

from ml_engine.services.eda.statistics import Statistics
from ml_engine.services.eda.correlation import Correlation
from ml_engine.services.eda.distribution import Distribution
from ml_engine.services.eda.outlier import Outlier
from ml_engine.services.eda.insights import Insights


class EDAService:

    def __init__(self):
        self.file_utils = FileUtils()

        self.statistics = Statistics()
        self.correlation = Correlation()
        self.distribution = Distribution()
        self.outlier = Outlier()
        self.insights = Insights()

    def generate_eda(
        self,
        dataset_id,
        version,
    ):
        """
        Generate complete EDA report.
        """

        # ------------------------------------
        # Feature Engineered Dataset Path
        # ------------------------------------

        feature_engineered_file_path = (
            self.file_utils.get_dataset_version_path(
                dataset_id,
                version,
            )
            / "feature_engineered.csv"
        )

        # ------------------------------------
        # Read Dataset
        # ------------------------------------

        dataframe = self.read_dataset(
            feature_engineered_file_path
        )

        # ------------------------------------
        # Generate Statistics
        # ------------------------------------

        statistics = (
            self.statistics.generate_statistics(
                dataframe
            )
        )

        # ------------------------------------
        # Generate Correlation
        # ------------------------------------

        correlation = (
            self.correlation.generate_correlation(
                dataframe
            )
        )

        # ------------------------------------
        # Generate Distribution
        # ------------------------------------

        distribution = (
            self.distribution.generate_distribution(
                dataframe
            )
        )

        # ------------------------------------
        # Generate Outliers
        # ------------------------------------

        outliers = (
            self.outlier.detect_outliers(
                dataframe
            )
        )

        # ------------------------------------
        # Generate Insights
        # ------------------------------------

        insights = (
            self.insights.generate_insights(
                statistics=statistics,
                correlation=correlation,
                distribution=distribution,
                outlier=outliers,
            )
        )

        # ------------------------------------
        # Final EDA Report
        # ------------------------------------

        eda_report = {

            "statistics": statistics,

            "correlation": correlation,

            "distribution": distribution,

            "outliers": outliers,

            "insights": insights,
        }

        # ------------------------------------
        # Save JSON
        # ------------------------------------

        eda_path = (
            self.file_utils.get_dataset_version_path(
                dataset_id,
                version,
            )
            / "eda.json"
        )

        with open(
            eda_path,
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                eda_report,
                file,
                indent=4,
            )

        # ------------------------------------
        # Return Metadata
        # ------------------------------------

        return {

            "eda_path": str(
                eda_path
            ),

            "rows": len(
                dataframe
            ),

            "columns": len(
                dataframe.columns
            ),

            "processing_status": "eda_completed",
        }

    def read_dataset(
        self,
        dataset_path,
    ):
        """
        Read dataset.
        """

        extension = str(dataset_path).split(".")[-1].lower()

        if extension == "csv":
            return pd.read_csv(dataset_path)

        elif extension in [
            "xlsx",
            "xls",
        ]:
            return pd.read_excel(
                dataset_path
            )

        elif extension == "json":
            return pd.read_json(
                dataset_path
            )

        raise ValueError(
            "Unsupported dataset format."
        )