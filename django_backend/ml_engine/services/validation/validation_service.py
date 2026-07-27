import pandas as pd

from ml_engine.utils.file_utils import FileUtils
from ml_engine.services.validation.dataset_validation import DatasetValidation


class ValidationService:
    """
    Handles dataset validation.
    """

    def __init__(self):
        self.file_utils = FileUtils()

    def validate_dataset(self, dataset_id, version, dataset_type):
        """
        Validate a dataset.
        """

        # ==========================================
        # Get Dataset Path
        # ==========================================

        dataset_path = self.file_utils.get_dataset_file_path(
            dataset_id,
            version,
            dataset_type,
        )

        # ==========================================
        # Read Dataset
        # ==========================================

        dataframe = self.read_dataset(dataset_path)

        # ==========================================
        # Run Validation
        # ==========================================

        validator = DatasetValidation(dataframe)

        return validator.validate()

    def read_dataset(self, dataset_path):
        """
        Read dataset from disk.
        """
        extension = str(dataset_path).split(".")[-1].lower()

        if extension == "csv":
            return pd.read_csv(dataset_path)

        if extension in ["xlsx", "xls"]:
            return pd.read_excel(dataset_path)

        if extension == "json":
            return pd.read_json(dataset_path)

        raise ValueError("Unsupported dataset format.")
