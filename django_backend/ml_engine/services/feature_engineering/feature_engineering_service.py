import pandas as pd

from ml_engine.utils.file_utils import FileUtils

from ml_engine.services.feature_engineering.encoder import Encoder
from ml_engine.services.feature_engineering.selector import Selector
from ml_engine.services.feature_engineering.feature_generator import (
    FeatureGenerator,
)
from ml_engine.services.feature_engineering.transformer import (
    Transformer,
)


class FeatureEngineeringService:

    def __init__(self):
        self.file_utils = FileUtils()

        self.encoder = Encoder()
        self.selector = Selector()
        self.feature_generator = FeatureGenerator()
        self.transformer = Transformer()

    def process(
        self,
        dataset_id,
        version,
        feature_engineering_options,
        target_column,
    ):
        """
        Execute Feature Engineering Pipeline.
        """

        # -------------------------
        # Load Cleaned Dataset
        # -------------------------

        cleaned_file_path = (
            self.file_utils.get_dataset_version_path(
                dataset_id,
                version,
            )
            / "cleaned.csv"
        )

        if not cleaned_file_path.exists():
            raise ValueError(
                "Cleaned dataset not found. Please clean the dataset first."
            )

        dataframe = self.read_dataset(cleaned_file_path)

        # -------------------------
        # Encoding
        # -------------------------

        encoding = feature_engineering_options.get(
            "encoding",
            "none",
        )

        dataframe = self.encoder.apply_encoding(
            dataframe,
            encoding,
        )

        # -------------------------
        # Feature Generation
        # -------------------------

        generation = feature_engineering_options.get(
            "feature_generation",
            [],
        )

        dataframe = self.feature_generator.generate_features(
            dataframe,
            generation,
        )

        # -------------------------
        # Transformation
        # -------------------------

        transformation = feature_engineering_options.get(
            "transformation",
            {},
        )

        dataframe = self.transformer.apply_transformation(
            dataframe,
            transformation_option=transformation.get(
                "type",
                "none",
            ),
            columns=transformation.get(
                "columns",
                [],
            ),
        )

        # -------------------------
        # Feature Selection
        # -------------------------

        selection = feature_engineering_options.get(
            "feature_selection",
            {},
        )

        if selection.get("method") != "none":
            dataframe = self.selector.apply_feature_selection(
                dataframe=dataframe,
                target_column=selection.get("target_column"),
                problem_type=selection.get("problem_type"),
                selection_option=selection.get("method"),
                k=selection.get(
                    "k",
                    5,
                ),
            )

        # --------------------------------
        # Save Feature Engineered Dataset
        # --------------------------------

        feature_engineered_file_path = (
            self.file_utils.get_dataset_version_path(
                dataset_id,
                version,
            )
            / "feature_engineered.csv"
        )

        dataframe.to_csv(
            feature_engineered_file_path,
            index=False,
        )

        # -------------------------
        # Return Metadata
        # -------------------------

        return {
            "feature_engineered_file_path": str(feature_engineered_file_path),
            "rows": len(dataframe),
            "columns": len(dataframe.columns),
            "processing_status": "feature_engineered",
        }

    def read_dataset(self, dataset_path):
        extension = str(dataset_path).split(".")[-1].lower()

        if extension == "csv":
            return pd.read_csv(dataset_path)

        elif extension in [
            "xlsx",
            "xls",
        ]:
            return pd.read_excel(dataset_path)

        elif extension == "json":
            return pd.read_json(dataset_path)

        raise ValueError("Unsupported dataset format.")
