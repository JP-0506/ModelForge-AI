import time
import numpy as np
import pandas as pd

from ml_engine.utils.file_utils import FileUtils


class Cleaner:

    def __init__(self):
        self.file_utils = FileUtils()

    def clean_dataset(
        self,
        dataset_id,
        version,
        cleaning_options=None,
    ):
        """
        Clean dataset according to user-selected options.
        Always reads from the original dataset.
        Saves result to cleaned.csv.
        """
        if cleaning_options is None:
            cleaning_options = {}

        start_time = time.time()

        # Always load original dataset path
        original_file_path = self.file_utils.get_original_file_path(
            dataset_id,
            version,
        )

        dataframe = self.read_dataset(original_file_path)

        rows_before = int(len(dataframe))
        columns_before = int(len(dataframe.columns))
        missing_before = int(dataframe.isna().sum().sum())
        duplicates_before = int(dataframe.duplicated().sum())

        missing_values_removed = 0
        duplicate_rows_removed = 0
        outliers_removed = 0

        # -----------------------------
        # 1. Remove fully empty rows
        # -----------------------------
        if cleaning_options.get("remove_empty_rows", True):
            dataframe = dataframe.dropna(how="all")

        # -----------------------------
        # 2. Duplicate Handling
        # -----------------------------
        duplicate_option = (
            cleaning_options
            .get("duplicates", {})
            .get("method", "keep")
        )

        if duplicate_option == "remove":
            prev_rows = len(dataframe)
            dataframe = dataframe.drop_duplicates()
            duplicate_rows_removed = prev_rows - len(dataframe)

        # -----------------------------
        # 3. Missing Value Handling
        # -----------------------------
        missing_option = (
            cleaning_options
            .get("missing_values", {})
            .get("method", "none")
        )

        if missing_option == "remove_rows":
            prev_missing = dataframe.isna().sum().sum()
            dataframe = dataframe.dropna()
            missing_values_removed = int(prev_missing)

        elif missing_option == "remove_columns":
            prev_missing = dataframe.isna().sum().sum()
            dataframe = dataframe.dropna(axis=1)
            missing_values_removed = int(prev_missing)

        elif missing_option == "mean":
            numeric_columns = dataframe.select_dtypes(
                include=["number"]
            ).columns
            for column in numeric_columns:
                n_missing = dataframe[column].isna().sum()
                if n_missing > 0:
                    mean_val = dataframe[column].mean()
                    dataframe[column] = dataframe[column].fillna(mean_val)
                    missing_values_removed += int(n_missing)

        elif missing_option == "median":
            numeric_columns = dataframe.select_dtypes(
                include=["number"]
            ).columns
            for column in numeric_columns:
                n_missing = dataframe[column].isna().sum()
                if n_missing > 0:
                    median_val = dataframe[column].median()
                    dataframe[column] = dataframe[column].fillna(median_val)
                    missing_values_removed += int(n_missing)

        elif missing_option == "mode":
            for column in dataframe.columns:
                n_missing = dataframe[column].isna().sum()
                if n_missing > 0:
                    mode = dataframe[column].mode()
                    if not mode.empty:
                        dataframe[column] = dataframe[column].fillna(mode.iloc[0])
                        missing_values_removed += int(n_missing)

        elif missing_option == "forward_fill":
            n_missing = dataframe.isna().sum().sum()
            dataframe = dataframe.ffill()
            missing_values_removed += int(n_missing - dataframe.isna().sum().sum())

        elif missing_option == "backward_fill":
            n_missing = dataframe.isna().sum().sum()
            dataframe = dataframe.bfill()
            missing_values_removed += int(n_missing - dataframe.isna().sum().sum())

        elif missing_option == "custom":
            custom_values = (
                cleaning_options
                .get("missing_values", {})
                .get("values", {})
            )

            for column, value in custom_values.items():
                if column in dataframe.columns:
                    n_missing = dataframe[column].isna().sum()
                    if n_missing > 0:
                        dataframe[column] = dataframe[column].fillna(value)
                        missing_values_removed += int(n_missing)

        # -----------------------------
        # 4. Outlier Handling
        # -----------------------------
        outlier_option = (
            cleaning_options
            .get("outliers", {})
            .get("method", "none")
        )

        if outlier_option in ["remove", "remove_iqr"]:
            numeric_columns = dataframe.select_dtypes(include=["number"]).columns
            if len(numeric_columns) > 0:
                mask = pd.Series(True, index=dataframe.index)
                for col in numeric_columns:
                    q1 = dataframe[col].quantile(0.25)
                    q3 = dataframe[col].quantile(0.75)
                    iqr = q3 - q1
                    if iqr > 0:
                        lower_bound = q1 - 1.5 * iqr
                        upper_bound = q3 + 1.5 * iqr
                        col_mask = (dataframe[col] >= lower_bound) & (dataframe[col] <= upper_bound)
                        mask = mask & (col_mask | dataframe[col].isna())
                prev_rows = len(dataframe)
                dataframe = dataframe[mask]
                outliers_removed = prev_rows - len(dataframe)


        # -----------------------------
        # 5. Constant Columns Removal
        # -----------------------------
        if cleaning_options.get("remove_constant_columns", False):
            constant_cols = [
                col for col in dataframe.columns
                if dataframe[col].nunique(dropna=False) <= 1
            ]
            if constant_cols:
                dataframe = dataframe.drop(columns=constant_cols)

        # -----------------------------
        # Final Metrics & Save
        # -----------------------------
        rows_after = int(len(dataframe))
        columns_after = int(len(dataframe.columns))
        columns_removed = columns_before - columns_after
        duration = round(time.time() - start_time, 3)

        cleaned_file_path = (
            self.file_utils.get_dataset_version_path(
                dataset_id,
                version,
            )
            / "cleaned.csv"
        )

        dataframe.to_csv(
            cleaned_file_path,
            index=False,
        )

        return {
            "cleaned_file_path": str(cleaned_file_path),
            "rows": rows_after,
            "columns": columns_after,
            "rows_before": rows_before,
            "rows_after": rows_after,
            "columns_before": columns_before,
            "columns_after": columns_after,
            "missing_values_removed": int(missing_values_removed),
            "duplicate_rows_removed": int(duplicate_rows_removed),
            "outliers_removed": int(outliers_removed),
            "columns_removed": int(columns_removed),
            "cleaning_duration": f"{duration}s",
            "processing_status": "cleaned",
        }

    def preview_dataset_cleaning(
        self,
        dataset_id,
        version,
        cleaning_options=None,
    ):
        """
        Estimate changes before performing actual dataset cleaning.
        """
        if cleaning_options is None:
            cleaning_options = {}

        original_file_path = self.file_utils.get_original_file_path(
            dataset_id,
            version,
        )

        dataframe = self.read_dataset(original_file_path)

        total_rows = len(dataframe)
        total_cols = len(dataframe.columns)

        duplicate_rows = int(dataframe.duplicated().sum())

        constant_columns = int(sum(
            1 for col in dataframe.columns
            if dataframe[col].nunique(dropna=False) <= 1
        ))

        missing_total = int(dataframe.isna().sum().sum())
        missing_rows_count = int((dataframe.isna().any(axis=1)).sum())
        missing_cols_count = int((dataframe.isna().any(axis=0)).sum())

        # Estimated calculation based on options
        estimated_rows_to_remove = 0
        estimated_columns_to_remove = 0
        estimated_missing_to_fill = 0

        # Duplicates
        duplicate_option = cleaning_options.get("duplicates", {}).get("method", "keep")
        if duplicate_option == "remove":
            estimated_rows_to_remove += duplicate_rows

        # Missing values
        missing_option = cleaning_options.get("missing_values", {}).get("method", "none")
        if missing_option == "remove_rows":
            estimated_rows_to_remove += missing_rows_count
        elif missing_option == "remove_columns":
            estimated_columns_to_remove += missing_cols_count
        elif missing_option in ["mean", "median", "mode", "forward_fill", "backward_fill", "custom"]:
            estimated_missing_to_fill = missing_total


        # Constant columns
        if cleaning_options.get("remove_constant_columns", False):
            estimated_columns_to_remove += constant_columns

        # Outliers
        outlier_option = cleaning_options.get("outliers", {}).get("method", "none")
        if outlier_option in ["remove", "remove_iqr"]:
            numeric_columns = dataframe.select_dtypes(include=["number"]).columns
            if len(numeric_columns) > 0:
                mask = pd.Series(False, index=dataframe.index)
                for col in numeric_columns:
                    q1 = dataframe[col].quantile(0.25)
                    q3 = dataframe[col].quantile(0.75)
                    iqr = q3 - q1
                    if iqr > 0:
                        is_outlier = (dataframe[col] < (q1 - 1.5 * iqr)) | (dataframe[col] > (q3 + 1.5 * iqr))
                        mask = mask | is_outlier
                estimated_rows_to_remove += int(mask.sum())

        return {
            "total_rows": total_rows,
            "total_columns": total_cols,
            "estimated_rows_to_remove": estimated_rows_to_remove,
            "estimated_columns_to_remove": estimated_columns_to_remove,
            "estimated_missing_to_fill": estimated_missing_to_fill,
            "duplicate_rows": duplicate_rows,
            "constant_columns": constant_columns,
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
 