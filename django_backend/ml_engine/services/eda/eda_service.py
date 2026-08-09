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

    def generate_eda(self, dataset_id, version):
        """
        Generate complete EDA report reading cleaned.csv ONLY.
        """
        version_dir = self.file_utils.get_dataset_version_path(dataset_id, version)

        cleaned_path = version_dir / "cleaned.csv"

        if not cleaned_path.exists():
            raise ValueError(
                "Cleaned dataset (cleaned.csv) not found. "
                "Exploratory Data Analysis (EDA) can only be generated for cleaned datasets. "
                "Please run Dataset Cleaning first."
            )

        dataset_file_path = cleaned_path
        dataframe = self.read_dataset(dataset_file_path)

        # 1. Statistics
        stats_result = self.statistics.generate_statistics(dataframe)

        # 2. Correlation
        corr_result = self.correlation.generate_correlation(dataframe)

        # 3. Distribution
        dist_result = self.distribution.generate_distribution(dataframe)

        # 4. Outliers
        outlier_result = self.outlier.detect_outliers(dataframe)

        # 5. Insights
        insights_result = self.insights.generate_insights(
            statistics=stats_result,
            correlation=corr_result,
            distribution=dist_result,
            outlier=outlier_result,
        )

        eda_report = {
            "dataset_id": dataset_id,
            "version": version,
            "file_used": "cleaned.csv",
            "statistics": stats_result,
            "correlation": corr_result,
            "distribution": dist_result,
            "outliers": outlier_result,
            "insights": insights_result,
        }

        # Save eda.json
        eda_path = version_dir / "eda.json"
        with open(eda_path, "w", encoding="utf-8") as f:
            json.dump(eda_report, f, indent=4)

        return {
            "eda_path": str(eda_path),
            "rows": len(dataframe),
            "columns": len(dataframe.columns),
            "file_used": "cleaned.csv",
            "processing_status": "eda_completed",
            "eda_report": eda_report,
        }

    def get_eda(self, dataset_id, version):
        """
        Fetch existing eda.json report if available.
        """
        version_dir = self.file_utils.get_dataset_version_path(dataset_id, version)
        eda_path = version_dir / "eda.json"

        if not eda_path.exists():
            return None

        with open(eda_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def read_dataset(self, dataset_path):
        extension = str(dataset_path).split(".")[-1].lower()

        if extension == "csv":
            return pd.read_csv(dataset_path)
        elif extension in ["xlsx", "xls"]:
            return pd.read_excel(dataset_path)
        elif extension == "json":
            return pd.read_json(dataset_path)

        raise ValueError("Unsupported dataset format.")