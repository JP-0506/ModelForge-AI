import json
import math
import numpy as np
import pandas as pd

from ml_engine.utils.file_utils import FileUtils


def sanitize_val(v):
    if pd.isna(v) or v is None:
        return None
    if isinstance(v, (np.integer, int)):
        return int(v)
    if isinstance(v, (np.floating, float)):
        if math.isnan(v) or math.isinf(v):
            return None
        return float(round(v, 4))
    if isinstance(v, (pd.Timestamp, np.datetime64)):
        return str(v)
    return str(v)


def is_boolean_series(series):
    if pd.api.types.is_bool_dtype(series):
        return True

    clean_vals = series.dropna().unique()
    if len(clean_vals) == 0 or len(clean_vals) > 2:
        return False

    str_vals = {str(v).strip().lower() for v in clean_vals}
    bool_pairs = [
        {"true", "false"},
        {"yes", "no"},
        {"y", "n"},
        {"t", "f"},
        {"0", "1"},
        {"0.0", "1.0"},
        {"male", "female"},
        {"m", "f"},
        {"active", "inactive"},
        {"positive", "negative"},
    ]
    for pair in bool_pairs:
        if str_vals.issubset(pair):
            return True

    if len(clean_vals) == 2 and not pd.api.types.is_numeric_dtype(series):
        return True

    return False


def is_date_series(series):
    if pd.api.types.is_datetime64_any_dtype(series):
        return True
    if pd.api.types.is_object_dtype(series) or pd.api.types.is_string_dtype(series):
        clean = series.dropna()
        if clean.empty:
            return False
        sample = clean.head(50)
        try:
            parsed = pd.to_datetime(sample, errors="coerce")
            if parsed.notnull().sum() / len(sample) >= 0.8:
                return True
        except Exception:
            pass
    return False


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

        total_rows = int(len(dataframe))
        total_cols = int(len(dataframe.columns))
        total_cells = total_rows * total_cols

        # Missing values
        null_counts = dataframe.isnull().sum()
        empty_cells = int(null_counts.sum())
        empty_cell_pct = round((empty_cells / total_cells * 100), 2) if total_cells > 0 else 0.0

        # Duplicates
        duplicate_rows = int(dataframe.duplicated().sum())
        duplicate_pct = round((duplicate_rows / total_rows * 100), 2) if total_rows > 0 else 0.0

        # Quality Score Calculation
        penalty = (empty_cell_pct * 0.5) + (duplicate_pct * 0.5)
        quality_score = max(0, min(100, int(round(100 - penalty))))

        if quality_score >= 90:
            quality_badge = "Excellent"
        elif quality_score >= 75:
            quality_badge = "Good"
        elif quality_score >= 50:
            quality_badge = "Fair"
        else:
            quality_badge = "Poor"

        # Column Types & Missing Values by Column
        type_counts = {
            "numeric": 0,
            "categorical": 0,
            "boolean": 0,
            "date": 0,
            "text": 0,
        }

        missing_by_column = []

        for col in dataframe.columns:
            series = dataframe[col]
            missing_cnt = int(series.isnull().sum())
            missing_pct = round((missing_cnt / total_rows * 100), 2) if total_rows > 0 else 0.0

            missing_by_column.append({
                "column": col,
                "missing_count": missing_cnt,
                "missing_percentage": missing_pct,
            })

            unique_cnt = int(series.nunique(dropna=True))

            # Determine Column Type accurately
            if is_boolean_series(series):
                col_type = "boolean"
            elif is_date_series(series):
                col_type = "date"
            elif pd.api.types.is_numeric_dtype(series):
                col_type = "numeric"
            elif unique_cnt < 50 or (total_rows > 0 and unique_cnt / total_rows < 0.2):
                col_type = "categorical"
            else:
                col_type = "text"

            type_counts[col_type] = type_counts.get(col_type, 0) + 1

        # Missing Value Analysis object
        missing_analysis = {
            "total_missing_values": empty_cells,
            "missing_percentage": empty_cell_pct,
            "missing_by_column": sorted(missing_by_column, key=lambda x: x["missing_count"], reverse=True),
        }

        # Sample Preview (Top 10 rows)
        sample_preview = []
        for _, row in dataframe.head(10).iterrows():
            sample_preview.append({
                col: sanitize_val(row[col]) for col in dataframe.columns
            })

        # Assemble clean profile dictionary
        profile = {
            "dataset_summary": {
                "total_rows": total_rows,
                "total_columns": total_cols,
                "numerical_columns": type_counts["numeric"],
                "categorical_columns": type_counts["categorical"],
                "boolean_columns": type_counts["boolean"],
                "date_columns": type_counts["date"],
                "text_columns": type_counts["text"],
                "missing_values": empty_cells,
                "duplicate_rows": duplicate_rows,
            },
            "dataset_statistics": {
                "total_cells": total_cells,
                "empty_cells": empty_cells,
                "empty_cell_percentage": empty_cell_pct,
                "duplicate_rows": duplicate_rows,
                "duplicate_percentage": duplicate_pct,
                "avg_missing_percentage": empty_cell_pct,
            },
            "dataset_quality": {
                "quality_score": quality_score,
                "quality_badge": quality_badge,
                "factors": {
                    "missing_cell_pct": empty_cell_pct,
                    "duplicate_row_pct": duplicate_pct,
                    "empty_cells_count": empty_cells,
                },
            },
            "data_type_distribution": type_counts,
            "missing_value_analysis": missing_analysis,
            "sample_data_preview": sample_preview,
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
