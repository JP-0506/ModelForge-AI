import json
import os
import pandas as pd


class PredictionPreprocessor:
    """
    Preprocess prediction input using the
    feature metadata generated during
    feature engineering.
    """

    # ==========================================
    # Prepare Prediction Input
    # ==========================================

    def prepare(
        self,
        features,
        metadata_path=None,
    ):
        """
        Convert user input into the same feature
        format used during model training.
        """
        dataframe = pd.DataFrame([features])

        if not metadata_path or not os.path.exists(metadata_path):
            return dataframe

        try:
            with open(metadata_path, "r", encoding="utf-8") as file:
                metadata = json.load(file)
        except Exception:
            return dataframe

        encoding_metadata = metadata.get("encoding_metadata", {})
        method = encoding_metadata.get("method", "none")
        columns = encoding_metadata.get("columns", {})
        target_column = metadata.get("target_column")
        feature_order = metadata.get("feature_order", [])

        # Drop target column if present in input
        if target_column and target_column in dataframe.columns:
            dataframe = dataframe.drop(columns=[target_column])

        # Clean target column from feature_order
        if target_column and feature_order:
            feature_order = [f for f in feature_order if f != target_column]

        # ==========================================
        # One-Hot Encoding
        # ==========================================
        if method == "one_hot" and columns:
            for column, categories in columns.items():
                if column in dataframe.columns:
                    value = dataframe.at[0, column]
                    dataframe = dataframe.drop(columns=[column])
                    for category in categories:
                        dataframe[f"{column}_{category}"] = int(str(value).strip().lower() == str(category).strip().lower())

        # ==========================================
        # Label / Ordinal Encoding
        # ==========================================
        elif method in ["label", "ordinal"] and columns:
            for column, categories in columns.items():
                if column in dataframe.columns:
                    value = dataframe.at[0, column]
                    cat_strs = [str(c).strip().lower() for c in categories]
                    val_str = str(value).strip().lower()
                    if val_str in cat_strs:
                        dataframe[column] = cat_strs.index(val_str)
                    else:
                        dataframe[column] = 0

        # ==========================================
        # Automatic Pattern-Based One-Hot Encoding
        # (For original categorical inputs matching feature_order prefixes)
        # ==========================================
        if feature_order:
            current_cols = list(dataframe.columns)
            for col in current_cols:
                if col not in feature_order:
                    val = str(dataframe.at[0, col]).strip().lower()
                    prefix = f"{col}_"
                    matching_enc = [f for f in feature_order if f.startswith(prefix)]
                    if matching_enc:
                        dataframe = dataframe.drop(columns=[col])
                        for enc_col in matching_enc:
                            cat_val = enc_col[len(prefix):].lower()
                            dataframe[enc_col] = int(val == cat_val)

        # ==========================================
        # Arrange Feature Order
        # ==========================================
        if feature_order:
            for column in feature_order:
                if column not in dataframe.columns:
                    dataframe[column] = 0
            dataframe = dataframe[feature_order]

        return dataframe


