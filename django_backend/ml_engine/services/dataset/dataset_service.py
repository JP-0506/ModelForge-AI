import shutil
import pandas as pd

from ml_engine.services.validation.dataset_validator import DatasetValidator
from ml_engine.utils.file_utils import FileUtils


class DatasetService:

    def __init__(self):
        self.dataset_validator = DatasetValidator()
        self.file_utils = FileUtils()

    def upload_dataset(
        self,
        uploaded_file,
        dataset_id,
        version,
    ):
        """
        Upload and save dataset.
        """

        # Validate uploaded dataset
        self.dataset_validator.validate(uploaded_file)

        # Create version folder
        self.file_utils.get_dataset_version_path(
            dataset_id,
            version,
        )

        # Get original file path
        original_file_path = (
            self.file_utils.get_original_file_path(
                dataset_id,
                version,
            )
        )

        # Save uploaded file
        with open(
            original_file_path,
            "wb+",
        ) as destination:

            shutil.copyfileobj(
                uploaded_file,
                destination,
            )

        # Read dataset
        dataframe = self.read_dataset(
            original_file_path
        )

        # Return metadata
        return {
            "original_file_path": str(
                original_file_path
            ),
            "file_type": uploaded_file.name.split(".")[-1].lower(),
            "file_size": uploaded_file.size,
            "rows": dataframe.shape[0],
            "columns": dataframe.shape[1],
            "processing_status": "uploaded",
        }

    def read_dataset(
        self,
        file_path,
    ):
        """
        Read dataset using Pandas.
        """

        extension = str(file_path).split(".")[-1].lower()

        if extension == "csv":
            return pd.read_csv(file_path)

        elif extension in [
            "xlsx",
            "xls",
        ]:
            return pd.read_excel(file_path)

        elif extension == "json":
            return pd.read_json(file_path)

        raise ValueError(
            "Unsupported dataset format."
        )