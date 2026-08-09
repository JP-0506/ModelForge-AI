import time
import pandas as pd
import numpy as np

from ml_engine.utils.file_utils import FileUtils
from ml_engine.utils.metadata_utils import MetadataUtils

from ml_engine.services.feature_engineering.encoder import Encoder
from ml_engine.services.feature_engineering.selector import Selector
from ml_engine.services.feature_engineering.feature_generator import FeatureGenerator
from ml_engine.services.feature_engineering.transformer import Transformer
from ml_engine.services.feature_engineering.metadata_generator import MetadataGenerator


class FeatureEngineeringService:

    def __init__(self):
        self.file_utils = FileUtils()
        self.encoder = Encoder()
        self.selector = Selector()
        self.feature_generator = FeatureGenerator()
        self.transformer = Transformer()
        self.metadata_generator = MetadataGenerator()
        self.metadata_utils = MetadataUtils()

    def process(
        self,
        dataset_id,
        version,
        feature_engineering_options=None,
        target_column=None,
    ):
        """
        Execute Feature Engineering Pipeline.
        """
        if feature_engineering_options is None:
            feature_engineering_options = {}

        start_time = time.time()

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
                "Cleaned dataset not found. Complete Dataset Validation, Profiling, and Cleaning before performing Feature Engineering."
            )

        dataframe = self.read_dataset(cleaned_file_path)
        rows_before = int(len(dataframe))
        columns_before = int(len(dataframe.columns))
        original_columns = dataframe.columns.tolist()

        # Track transformation counters
        encoded_columns_count = 0
        transformed_columns_count = 0

        # -------------------------
        # 1. Encoding
        # -------------------------
        encoding_config = feature_engineering_options.get("encoding", {})
        if isinstance(encoding_config, str):
            encoding_method = encoding_config
            encoding_cols = None
        else:
            encoding_method = encoding_config.get("method", "none")
            encoding_cols = encoding_config.get("columns", None)

        # encoding_result = self.encoder.apply_encoding(
        #     dataframe,
        #     encoding_method,
        #     columns=encoding_cols,
        # )
        encoding_result = self.encoder.apply_encoding(
            dataframe,
            encoding_method,
            columns=encoding_cols,
            target_column=target_column,
        )
        dataframe = encoding_result["dataframe"]
        encoding_metadata = encoding_result["encoding_metadata"]
        encoded_columns_count = len(encoding_metadata.get("columns", {}))

        cols_after_encoding = len(dataframe.columns)

        # -------------------------
        # 2. Feature Generation
        # -------------------------
        generation_options = feature_engineering_options.get(
            "feature_generation",
            {},
        )
        dataframe = self.feature_generator.generate_features(
            dataframe,
            generation_options,
        )
        cols_after_generation = len(dataframe.columns)
        features_generated = cols_after_generation - cols_after_encoding

        # -------------------------
        # 3. Transformation
        # -------------------------
        cols_after_transformation = len(dataframe.columns)


        engineered_columns = dataframe.columns.tolist()
        rows_after = int(len(dataframe))
        columns_after = int(len(engineered_columns))
        features_removed = 0
        duration = round(time.time() - start_time, 3)

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

        # --------------------------------
        # Save Feature Metadata
        # --------------------------------
        metadata = self.metadata_generator.generate(
            original_columns=original_columns,
            engineered_columns=engineered_columns,
            target_column=target_column,
            feature_engineering_options=feature_engineering_options,
            encoding_metadata=encoding_metadata,
        )

        feature_metadata_path = (
            self.file_utils.get_dataset_version_path(
                dataset_id,
                version,
            )
            / "feature_metadata.json"
        )
        self.metadata_utils.save(
            metadata,
            feature_metadata_path,
        )

        return {
            "feature_engineered_file_path": str(feature_engineered_file_path),
            "feature_metadata_path": str(feature_metadata_path),
            "rows": rows_after,
            "columns": columns_after,
            "rows_before": rows_before,
            "rows_after": rows_after,
            "columns_before": columns_before,
            "columns_after": columns_after,
            "features_generated": features_generated,
            "features_removed": 0,
            "encoded_columns": encoded_columns_count,
            "execution_duration": f"{duration}s",
            "processing_status": "feature_engineered",
        }

    def preview_feature_engineering(
        self,
        dataset_id,
        version,
        feature_engineering_options=None,
        target_column=None,
    ):
        """
        Estimate changes before executing feature engineering.
        """
        if feature_engineering_options is None:
            feature_engineering_options = {}

        target_dir = self.file_utils.get_dataset_version_path(dataset_id, version)
        file_path = target_dir / "feature_engineered.csv"
        if not file_path.exists():
            file_path = target_dir / "cleaned.csv"
        if not file_path.exists():
            file_path = self.file_utils.get_original_file_path(dataset_id, version)

        if not file_path or not file_path.exists():
            return {
                "columns_before": 0,
                "columns_after": 0,
                "features_to_generate": 0,
                "features_to_remove": 0,
                "encoding_method": "none",
                "available_columns": [],
            }

        dataframe = self.read_dataset(file_path)

        columns_before = len(dataframe.columns)
        available_columns = dataframe.columns.tolist()

        # Encoding preview
        encoding_config = feature_engineering_options.get("encoding", {})
        encoding_method = encoding_config if isinstance(encoding_config, str) else encoding_config.get("method", "none")

        # Feature Generation preview
        gen_config = feature_engineering_options.get("feature_generation", {})
        estimated_generated = 0
        if isinstance(gen_config, dict):
            if isinstance(gen_config.get("custom_operations"), list):
                estimated_generated += len(gen_config.get("custom_operations"))
        elif isinstance(gen_config, list):
            estimated_generated += len(gen_config)

        estimated_after = columns_before + estimated_generated

        return {
            "columns_before": columns_before,
            "columns_after": estimated_after,
            "features_to_generate": estimated_generated,
            "features_to_remove": 0,
            "encoding_method": encoding_method,
            "available_columns": available_columns,
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

