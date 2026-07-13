import json
import pandas as pd

from ml_engine.utils.file_utils import FileUtils


class Profiler:

    def __init__(self):
        self.file_utils = FileUtils()

    def generate_profile(self, dataset_id, version):
        """
        Generate dataset profiling report.
        """

        # Get original dataset path
        dataset_path = self.file_utils.get_original_file_path(dataset_id, version)

        # Read dataset
        dataframe = self.read_dataset(dataset_path)

        # Generate profile
        profile = {
            "rows": len(dataframe),
            "columns": len(dataframe.columns),
            "column_names": dataframe.columns.tolist(),
            "data_types": dataframe.dtypes.astype(str).to_dict(),
            "missing_values": dataframe.isnull().sum().to_dict(),
            "duplicate_rows": int(dataframe.duplicated().sum()),
            "memory_usage": int(dataframe.memory_usage(deep=True).sum()),
            "categorical_summary": (
                dataframe.describe(include=["object"]).to_dict()
                if len(dataframe.select_dtypes(include=["object"]).columns) > 0
                else {}
            ),
        }

        # Save profiling report
        profile_path = (
            self.file_utils.get_dataset_version_path(dataset_id, version)
            / "profiling.json"
        )

        with open(profile_path, "w") as file:
            json.dump(profile, file, indent=4)

        return {
            "profiling_path": str(profile_path),
            "processing_status": "profiled",
            "profile": profile,
        }

    def read_dataset(self, dataset_path):

        extension = str(dataset_path).split(".")[-1].lower()

        if extension == "csv":
            return pd.read_csv(dataset_path)

        elif extension in ["xlsx", "xls"]:
            return pd.read_excel(dataset_path)

        elif extension == "json":
            return pd.read_json(dataset_path)

        raise ValueError("Unsupported dataset format.")
