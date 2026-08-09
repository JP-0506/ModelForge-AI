import pandas as pd
import numpy as np


class DatasetValidation:
    """
    Performs comprehensive, read-only dataset quality validation.
    """

    def __init__(self, dataframe: pd.DataFrame):
        self.dataframe = dataframe
        self.issues = []
        self.summary_counts = {
            "errors": 0,
            "warnings": 0,
            "passed": 0,
        }
        self.report = {
            "missing_values": [],
            "duplicate_rows": {
                "total_duplicate_rows": 0,
                "duplicate_percentage": 0.0,
            },
            "duplicate_columns": [],
            "data_types": [],
            "invalid_values": {
                "empty_strings_count": 0,
                "null_values_count": 0,
                "infinite_values_count": 0,
                "nan_values_count": 0,
                "details_by_column": [],
            },
            "constant_columns": [],
            "high_cardinality_columns": [],
            "mixed_data_types": [],
            "column_statistics": [],
        }

    # ===================================================
    # Main Entry Point: Validate Dataset
    # ===================================================

    def validate(self):
        """
        Run all read-only validation checks and generate validation results.
        """
        if self.dataframe is None:
            self.dataframe = pd.DataFrame()

        self.check_empty_dataset()
        if not self.dataframe.empty:
            self.check_missing_values()
            self.check_duplicate_rows()
            self.check_duplicate_columns()
            self.check_constant_columns()
            self.check_high_cardinality()
            self.check_small_dataset()
            self.check_data_types()
            self.check_invalid_values()
            self.check_mixed_data_types()
            self.check_outliers()
            self.generate_column_statistics()

        return self.build_response()

    # ===================================================
    # Individual Validation Checks
    # ===================================================

    def check_empty_dataset(self):
        """Validate if the dataset is empty."""
        if self.dataframe.empty:
            self.summary_counts["errors"] += 1
            self.add_issue(
                issue_type="empty_dataset",
                severity="error",
                message="Dataset is empty.",
                recommendation="Upload a dataset containing at least one row and one column.",
            )
        else:
            self.summary_counts["passed"] += 1

    def check_missing_values(self):
        """Validate missing values per column."""
        total_rows = len(self.dataframe)
        missing_series = self.dataframe.isna().sum()
        has_missing = False

        missing_list = []
        total_nulls = 0

        for col, count in missing_series.items():
            count = int(count)
            total_nulls += count
            if count > 0:
                has_missing = True
                pct = round((count / total_rows) * 100, 2) if total_rows > 0 else 0.0
                missing_list.append({
                    "column": str(col),
                    "missing_count": count,
                    "missing_percentage": pct,
                })
                self.add_issue(
                    issue_type="missing_values",
                    severity="warning",
                    message=f"Column '{col}' contains {count} missing values ({pct}%).",
                    recommendation="Review missing values and apply imputation or removal strategies.",
                    column=str(col),
                    count=count,
                )

        self.report["missing_values"] = missing_list
        self.report["invalid_values"]["null_values_count"] = total_nulls
        self.report["invalid_values"]["nan_values_count"] = total_nulls

        if has_missing:
            self.summary_counts["warnings"] += 1
        else:
            self.summary_counts["passed"] += 1

    def check_duplicate_rows(self):
        """Validate duplicate rows in dataset."""
        total_rows = len(self.dataframe)
        duplicate_rows = int(self.dataframe.duplicated().sum())
        dup_pct = round((duplicate_rows / total_rows) * 100, 2) if total_rows > 0 else 0.0

        self.report["duplicate_rows"] = {
            "total_duplicate_rows": duplicate_rows,
            "duplicate_percentage": dup_pct,
        }

        if duplicate_rows > 0:
            self.summary_counts["warnings"] += 1
            self.add_issue(
                issue_type="duplicate_rows",
                severity="warning",
                message=f"{duplicate_rows} duplicate rows found in dataset ({dup_pct}%).",
                recommendation="Review and remove duplicate rows to ensure clean dataset records.",
                count=duplicate_rows,
            )
        else:
            self.summary_counts["passed"] += 1

    def check_duplicate_columns(self):
        """Validate duplicate columns by name and by content."""
        duplicate_columns = []

        # Duplicate Column Names
        duplicate_names = [
            str(col) for col in self.dataframe.columns[self.dataframe.columns.duplicated()]
        ]
        duplicate_columns.extend(duplicate_names)

        # Duplicate Column Values
        cols = list(self.dataframe.columns)
        for i in range(len(cols)):
            for j in range(i + 1, len(cols)):
                try:
                    if self.dataframe.iloc[:, i].equals(self.dataframe.iloc[:, j]):
                        duplicate_columns.append(str(cols[j]))
                except Exception:
                    pass

        duplicate_columns = list(dict.fromkeys(duplicate_columns))
        self.report["duplicate_columns"] = duplicate_columns

        if duplicate_columns:
            self.summary_counts["warnings"] += 1
            self.add_issue(
                issue_type="duplicate_columns",
                severity="warning",
                message=f"Found {len(duplicate_columns)} duplicate column(s): {', '.join(duplicate_columns)}.",
                recommendation="Review and remove duplicate columns to eliminate redundant data.",
                count=len(duplicate_columns),
            )
        else:
            self.summary_counts["passed"] += 1

    def check_constant_columns(self):
        """Validate columns containing only one unique value."""
        constant_columns = []
        for col in self.dataframe.columns:
            if self.dataframe[col].dropna().nunique() <= 1:
                constant_columns.append(str(col))

        self.report["constant_columns"] = constant_columns

        if constant_columns:
            self.summary_counts["warnings"] += 1
            self.add_issue(
                issue_type="constant_columns",
                severity="warning",
                message=f"Found {len(constant_columns)} constant column(s): {', '.join(constant_columns)}.",
                recommendation="Remove constant columns as they provide zero variance for machine learning.",
                count=len(constant_columns),
            )
        else:
            self.summary_counts["passed"] += 1

    def check_high_cardinality(self):
        """Validate high cardinality in categorical columns."""
        HIGH_CARDINALITY_THRESHOLD = 0.90
        total_rows = len(self.dataframe)
        if total_rows == 0:
            return

        high_cardinality_columns = []
        categorical_cols = self.dataframe.select_dtypes(include=["object", "category"]).columns

        for col in categorical_cols:
            unique_cnt = self.dataframe[col].dropna().nunique()
            ratio = unique_cnt / total_rows
            if ratio >= HIGH_CARDINALITY_THRESHOLD and unique_cnt > 10:
                high_cardinality_columns.append(str(col))

        self.report["high_cardinality_columns"] = high_cardinality_columns

        if high_cardinality_columns:
            self.summary_counts["warnings"] += 1
            self.add_issue(
                issue_type="high_cardinality",
                severity="warning",
                message=f"Found {len(high_cardinality_columns)} high-cardinality column(s): {', '.join(high_cardinality_columns)}.",
                recommendation="Consider target encoding, frequency encoding, or dropping identifier-like high-cardinality columns.",
                count=len(high_cardinality_columns),
            )
        else:
            self.summary_counts["passed"] += 1

    def check_small_dataset(self):
        """Validate small dataset row count."""
        MINIMUM_ROWS = 100
        total_rows = len(self.dataframe)
        if total_rows == 0:
            return

        if total_rows < MINIMUM_ROWS:
            self.summary_counts["warnings"] += 1
            self.add_issue(
                issue_type="small_dataset",
                severity="warning",
                message=f"Dataset contains only {total_rows} rows (minimum recommended: {MINIMUM_ROWS}).",
                recommendation="Upload a larger dataset when possible to improve model generalization.",
                count=total_rows,
            )
        else:
            self.summary_counts["passed"] += 1

    def check_data_types(self):
        """Validate column data types and expected data types."""
        data_types_report = []

        for col in self.dataframe.columns:
            series = self.dataframe[col]
            detected_type = self._get_column_type(series)
            expected_type = self._infer_expected_type(series, detected_type)
            is_mixed = self._is_mixed_type(series)

            status = "Inconsistent" if is_mixed else "Valid"

            data_types_report.append({
                "column": str(col),
                "detected_type": detected_type,
                "expected_type": expected_type,
                "status": status,
            })

        self.report["data_types"] = data_types_report
        self.summary_counts["passed"] += 1

    def check_invalid_values(self):
        """Validate empty strings, null values, infinite values, and NaN values."""
        empty_strings_total = 0
        infinite_values_total = 0
        column_details = []

        for col in self.dataframe.columns:
            series = self.dataframe[col]
            empty_count = 0
            inf_count = 0
            null_count = int(series.isna().sum())

            # Check Empty Strings for object/string columns
            if pd.api.types.is_object_dtype(series) or pd.api.types.is_string_dtype(series):
                empty_count = int((series.astype(str).str.strip() == "").sum())

            # Check Infinite values for numeric columns
            if pd.api.types.is_numeric_dtype(series):
                try:
                    inf_count = int(np.isinf(series.dropna()).sum())
                except Exception:
                    inf_count = 0

            empty_strings_total += empty_count
            infinite_values_total += inf_count

            if empty_count > 0 or inf_count > 0 or null_count > 0:
                column_details.append({
                    "column": str(col),
                    "empty_strings": empty_count,
                    "null_values": null_count,
                    "infinite_values": inf_count,
                    "nan_values": null_count,
                })

        self.report["invalid_values"]["empty_strings_count"] = empty_strings_total
        self.report["invalid_values"]["infinite_values_count"] = infinite_values_total
        self.report["invalid_values"]["details_by_column"] = column_details

        if empty_strings_total > 0 or infinite_values_total > 0:
            self.summary_counts["warnings"] += 1
            self.add_issue(
                issue_type="invalid_values",
                severity="warning",
                message=f"Found {empty_strings_total} empty strings and {infinite_values_total} infinite values across dataset columns.",
                recommendation="Clean empty strings and replace infinite values before modeling.",
            )

    def check_mixed_data_types(self):
        """Validate columns containing inconsistent mixed data types."""
        mixed_columns = []

        for col in self.dataframe.columns:
            if self._is_mixed_type(self.dataframe[col]):
                mixed_columns.append(str(col))

        self.report["mixed_data_types"] = mixed_columns

        if mixed_columns:
            self.summary_counts["warnings"] += 1
            self.add_issue(
                issue_type="mixed_data_types",
                severity="warning",
                message=f"Found mixed data types in {len(mixed_columns)} column(s): {', '.join(mixed_columns)}.",
                recommendation="Convert mixed type columns to a single uniform data type (e.g. numeric or string).",
                count=len(mixed_columns),
            )
        else:
            self.summary_counts["passed"] += 1

    def check_outliers(self):
        """Validate outliers in numeric columns."""
        outlier_columns = []
        numeric_cols = self.dataframe.select_dtypes(include=["number"]).columns

        for col in numeric_cols:
            values = self.dataframe[col].dropna()
            if len(values) < 4 or values.nunique() <= 1:
                continue

            q1 = values.quantile(0.25)
            q3 = values.quantile(0.75)
            iqr = q3 - q1

            if iqr == 0:
                continue

            lower_bound = q1 - (1.5 * iqr)
            upper_bound = q3 + (1.5 * iqr)
            outlier_count = int(((values < lower_bound) | (values > upper_bound)).sum())

            if outlier_count > 0:
                outlier_columns.append(str(col))

        if outlier_columns:
            self.summary_counts["warnings"] += 1
            self.add_issue(
                issue_type="outliers",
                severity="warning",
                message=f"Found potential outliers in {len(outlier_columns)} column(s): {', '.join(outlier_columns)}.",
                recommendation="Inspect extreme values and determine whether capping or removal is appropriate.",
                count=len(outlier_columns),
            )
        else:
            self.summary_counts["passed"] += 1

    # ===================================================
    # Column Statistics (For EVERY Column)
    # ===================================================

    def generate_column_statistics(self):
        """
        Generate detailed statistics for EVERY column in the dataset.
        Required fields:
        - Data Type
        - Unique Values
        - Missing Values
        - Missing Percentage
        (Additional stats for numeric columns: Min, Max, Mean, Median, Std Dev)
        """
        total_rows = len(self.dataframe)
        stats_list = []

        for col in self.dataframe.columns:
            series = self.dataframe[col]
            dtype_str = self._get_column_type(series)
            unique_vals = int(series.nunique(dropna=True))
            null_count = int(series.isna().sum())
            null_pct = round((null_count / total_rows) * 100, 2) if total_rows > 0 else 0.0

            col_stat = {
                "column": str(col),
                "data_type": dtype_str,
                "unique_values": unique_vals,
                "missing_values": null_count,
                "missing_percentage": null_pct,
                "min": None,
                "max": None,
                "mean": None,
                "median": None,
                "std_dev": None,
            }

            if pd.api.types.is_numeric_dtype(series) and not pd.api.types.is_bool_dtype(series):
                valid_num = series.dropna()
                if not valid_num.empty:
                    try:
                        col_stat["min"] = float(valid_num.min()) if not np.isinf(valid_num.min()) else None
                        col_stat["max"] = float(valid_num.max()) if not np.isinf(valid_num.max()) else None
                        col_stat["mean"] = round(float(valid_num.mean()), 4)
                        col_stat["median"] = round(float(valid_num.median()), 4)
                        std = valid_num.std()
                        col_stat["std_dev"] = round(float(std), 4) if pd.notna(std) else 0.0
                    except Exception:
                        pass

            stats_list.append(col_stat)

        self.report["column_statistics"] = stats_list

    # ===================================================
    # Helper Utilities
    # ===================================================

    def _get_column_type(self, series: pd.Series) -> str:
        """Infer clean human-readable data type for a pandas Series."""
        if pd.api.types.is_bool_dtype(series):
            return "Boolean"
        elif pd.api.types.is_datetime64_any_dtype(series):
            return "Date"
        elif pd.api.types.is_integer_dtype(series):
            return "Integer"
        elif pd.api.types.is_float_dtype(series):
            return "Float"
        elif pd.api.types.is_categorical_dtype(series):
            return "Categorical"
        elif pd.api.types.is_object_dtype(series):
            # Check if all non-null values can be parsed as datetimes
            non_null = series.dropna()
            if not non_null.empty and len(non_null) <= 1000:
                try:
                    pd.to_datetime(non_null, errors="raise")
                    return "Date"
                except Exception:
                    pass
            return "Categorical"
        return "Object"

    def _infer_expected_type(self, series: pd.Series, detected_type: str) -> str:
        """Infer expected column type if mismatch exists."""
        if detected_type == "Categorical":
            non_null = series.dropna()
            if not non_null.empty:
                # Check if strings look like numbers
                try:
                    pd.to_numeric(non_null, errors="raise")
                    return "Numeric"
                except Exception:
                    pass
                try:
                    pd.to_datetime(non_null, errors="raise")
                    return "Date"
                except Exception:
                    pass
        return detected_type

    def _is_mixed_type(self, series: pd.Series) -> bool:
        """Check if non-null values in a series contain multiple primitive python types."""
        non_null = series.dropna()
        if len(non_null) == 0:
            return False
        types_set = {type(val).__name__ for val in non_null}
        # Allow int and float to mix if numeric
        if types_set.issubset({"int", "float", "int64", "float64"}):
            return False
        return len(types_set) > 1

    def add_issue(self, issue_type, severity, message, recommendation, column=None, count=None):
        """Add issue record."""
        issue = {
            "type": issue_type,
            "severity": severity,
            "message": message,
            "recommendation": recommendation,
        }
        if column is not None:
            issue["column"] = str(column)
        if count is not None:
            issue["count"] = int(count)
        self.issues.append(issue)

    def calculate_validation_score(self):
        """
        Calculate an overall Validation Score out of 100 and Quality Badge.
        Rules:
        - Start with 100.
        - Deduct points for missing values ratio.
        - Deduct points for duplicate rows ratio.
        - Deduct points for duplicate columns.
        - Deduct points for constant columns.
        - Deduct points for mixed data types.
        - Deduct points for invalid values.
        """
        total_rows = len(self.dataframe)
        total_cols = len(self.dataframe.columns)
        if total_rows == 0 or total_cols == 0:
            return 0, "Poor"

        score = 100.0

        # Missing values penalty (max -25)
        total_cells = total_rows * total_cols
        total_missing = sum(item["missing_count"] for item in self.report["missing_values"])
        missing_ratio = (total_missing / total_cells) if total_cells > 0 else 0
        score -= min(25.0, missing_ratio * 100.0 * 0.5)

        # Duplicate rows penalty (max -15)
        dup_rows = self.report["duplicate_rows"]["total_duplicate_rows"]
        dup_ratio = (dup_rows / total_rows) if total_rows > 0 else 0
        score -= min(15.0, dup_ratio * 100.0 * 0.4)

        # Duplicate columns penalty (max -15)
        dup_cols = len(self.report["duplicate_columns"])
        score -= min(15.0, dup_cols * 5.0)

        # Constant columns penalty (max -15)
        const_cols = len(self.report["constant_columns"])
        score -= min(15.0, const_cols * 5.0)

        # Mixed data types penalty (max -15)
        mixed_cols = len(self.report["mixed_data_types"])
        score -= min(15.0, mixed_cols * 5.0)

        # Invalid values penalty (max -15)
        inv_strings = self.report["invalid_values"]["empty_strings_count"]
        inv_infs = self.report["invalid_values"]["infinite_values_count"]
        if inv_strings > 0 or inv_infs > 0:
            score -= min(15.0, (inv_strings + inv_infs) * 0.5)

        score = max(0, min(100, round(score)))

        if score >= 90:
            quality_badge = "Excellent"
        elif score >= 75:
            quality_badge = "Good"
        elif score >= 50:
            quality_badge = "Needs Improvement"
        else:
            quality_badge = "Poor"

        return int(score), quality_badge

    def build_response(self):
        """Build structured validation JSON response."""
        total_rows = len(self.dataframe)
        total_cols = len(self.dataframe.columns)

        # Count column types
        num_count = 0
        cat_count = 0
        date_count = 0
        bool_count = 0

        for col_stat in self.report["column_statistics"]:
            dtype = col_stat["data_type"]
            if dtype in ["Integer", "Float", "Numeric"]:
                num_count += 1
            elif dtype == "Categorical":
                cat_count += 1
            elif dtype == "Date":
                date_count += 1
            elif dtype == "Boolean":
                bool_count += 1

        val_score, quality_badge = self.calculate_validation_score()
        total_missing = sum(item["missing_count"] for item in self.report["missing_values"])

        summary = {
            "total_rows": total_rows,
            "total_columns": total_cols,
            "missing_values": total_missing,
            "duplicate_rows": self.report["duplicate_rows"]["total_duplicate_rows"],
            "duplicate_columns": len(self.report["duplicate_columns"]),
            "numeric_columns": num_count,
            "categorical_columns": cat_count,
            "date_columns": date_count,
            "boolean_columns": bool_count,
            "validation_score": val_score,
            "quality_badge": quality_badge,
            "total_checks": (
                self.summary_counts["errors"]
                + self.summary_counts["warnings"]
                + self.summary_counts["passed"]
            ),
            "passed_checks": self.summary_counts["passed"],
            "warning_checks": self.summary_counts["warnings"],
            "error_checks": self.summary_counts["errors"],
        }

        return {
            "status": "completed",
            "validation_score": val_score,
            "quality_badge": quality_badge,
            "summary": summary,
            "report": self.report,
            "issues": self.issues,
        }

