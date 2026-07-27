import pandas as pd


class DatasetValidation:
    """
    Performs dataset quality validation.
    """

    def __init__(self, dataframe: pd.DataFrame):
        self.dataframe = dataframe
        self.issues = []
        self.summary = {
            "errors": 0,
            "warnings": 0,
            "passed": 0,
        }

    # ===================================================
    # Validate Dataset
    # ===================================================

    def validate(self):
        """
        Run all validation checks.
        """
        self.check_empty_dataset()
        self.check_missing_values()
        self.check_duplicate_rows()
        self.check_duplicate_columns()
        self.check_constant_columns()
        self.check_high_cardinality()
        self.check_small_dataset()
        self.check_data_types()
        self.check_outliers()

        return self.build_response()

    # ===================================================
    # Validation Checks
    # ===================================================

    def check_empty_dataset(self):
        """
        Validate empty dataset.
        """
        if self.dataframe.empty:
            self.summary["warnings"] += 1

            self.add_issue(
                issue_type="empty_dataset",
                severity="error",
                message="Dataset is empty.",
                recommendation="Upload a dataset containing at least one row and one column.",
            )
            return

        self.summary["passed"] += 1

    def check_missing_values(self):
        """
        Validate missing values.
        """
        missing_values = self.dataframe.isna().sum()
        has_missing_values = False

        for column, count in missing_values.items():
            if count > 0:
                has_missing_values = True

                self.add_issue(
                    issue_type="missing_values",
                    severity="warning",
                    message=f"Column '{column}' contains {count} missing values.",
                    recommendation=(
                        "Review the missing values and choose an appropriate "
                        "imputation or removal strategy."
                    ),
                    column=column,
                    count=int(count),
                )

        if has_missing_values:
            self.summary["warnings"] += 1
        else:
            self.summary["passed"] += 1

    def check_duplicate_rows(self):
        """
        Validate duplicate rows.
        """
        duplicate_rows = int(self.dataframe.duplicated().sum())

        if duplicate_rows > 0:
            self.summary["warnings"] += 1

            self.add_issue(
                issue_type="duplicate_rows",
                severity="warning",
                message=f"{duplicate_rows} duplicate rows found in the dataset.",
                recommendation="Review and remove duplicate rows to improve data quality.",
                count=duplicate_rows,
            )
            return

        self.summary["passed"] += 1

    def check_duplicate_columns(self):
        """
        Validate duplicate columns.
        """
        duplicate_columns = []

        # ==========================================
        # Check Duplicate Column Names
        # ==========================================
        duplicate_names = self.dataframe.columns[
            self.dataframe.columns.duplicated()
        ].tolist()

        duplicate_columns.extend(duplicate_names)

        # ==========================================
        # Check Duplicate Column Values
        # ==========================================
        columns = self.dataframe.columns

        for index in range(len(columns)):
            for compare_index in range(index + 1, len(columns)):
                if self.dataframe.iloc[:, index].equals(
                    self.dataframe.iloc[:, compare_index]
                ):
                    duplicate_columns.append(columns[compare_index])

        # ==========================================
        # Remove Duplicate Entries (Keep Order)
        # ==========================================
        duplicate_columns = list(dict.fromkeys(duplicate_columns))

        # ==========================================
        # Add Validation Issue
        # ==========================================
        if duplicate_columns:
            self.summary["warnings"] += 1

            self.add_issue(
                issue_type="duplicate_columns",
                severity="warning",
                message=(
                    f"Found {len(duplicate_columns)} duplicate "
                    f"column(s): {', '.join(duplicate_columns)}."
                ),
                recommendation="Review and remove duplicate columns to avoid redundant features.",
                count=len(duplicate_columns),
            )
            return

        self.summary["passed"] += 1

    def check_constant_columns(self):
        """
        Validate constant columns.
        """
        constant_columns = []

        for column in self.dataframe.columns:
            unique_values = self.dataframe[column].dropna().nunique()

            if unique_values <= 1:
                constant_columns.append(column)

        if constant_columns:
            self.summary["warnings"] += 1

            self.add_issue(
                issue_type="constant_columns",
                severity="warning",
                message=(
                    f"Found {len(constant_columns)} constant "
                    f"column(s): {', '.join(constant_columns)}."
                ),
                recommendation=(
                    "Review and remove constant columns as they "
                    "do not provide useful information for analysis "
                    "or machine learning."
                ),
                count=len(constant_columns),
            )
            return

        self.summary["passed"] += 1

    def check_high_cardinality(self):
        """
        Validate high-cardinality categorical columns.
        """
        HIGH_CARDINALITY_THRESHOLD = 0.90

        high_cardinality_columns = []

        categorical_columns = self.dataframe.select_dtypes(
            include=["object", "category"],
        ).columns

        total_rows = len(self.dataframe)

        # Skip check for empty datasets.
        if total_rows == 0:
            return

        for column in categorical_columns:
            unique_values = self.dataframe[column].dropna().nunique()
            unique_ratio = unique_values / total_rows

            if unique_ratio >= HIGH_CARDINALITY_THRESHOLD:
                high_cardinality_columns.append(column)

        if high_cardinality_columns:
            self.summary["warnings"] += 1

            self.add_issue(
                issue_type="high_cardinality",
                severity="warning",
                message=(
                    f"Found {len(high_cardinality_columns)} "
                    f"high-cardinality column(s): "
                    f"{', '.join(high_cardinality_columns)}."
                ),
                recommendation=(
                    "Review these columns before encoding, as "
                    "high-cardinality features may increase "
                    "model complexity, memory usage, and training time."
                ),
                count=len(high_cardinality_columns),
            )
            return

        self.summary["passed"] += 1

    def check_small_dataset(self):
        """
        Validate small dataset.
        """
        MINIMUM_ROWS = 100

        total_rows = len(self.dataframe)

        # Skip check for empty datasets.
        if total_rows == 0:
            return

        if total_rows < MINIMUM_ROWS:
            self.summary["warnings"] += 1

            self.add_issue(
                issue_type="small_dataset",
                severity="warning",
                message=(f"Dataset contains only {total_rows} rows."),
                recommendation=(
                    f"Small datasets may reduce the reliability of "
                    f"analysis and machine learning models. "
                    f"Consider using at least {MINIMUM_ROWS} rows "
                    f"when possible."
                ),
                count=total_rows,
            )
            return

        self.summary["passed"] += 1

    def check_data_types(self):
        """
        Validate inconsistent data types.
        """
        inconsistent_columns = []

        for column in self.dataframe.columns:
            non_null_values = self.dataframe[column].dropna()
            detected_types = {type(value).__name__ for value in non_null_values}

            if len(detected_types) > 1:
                inconsistent_columns.append(column)

        if inconsistent_columns:
            self.summary["warnings"] += 1

            self.add_issue(
                issue_type="data_types",
                severity="warning",
                message=(
                    f"Found inconsistent data types in "
                    f"{len(inconsistent_columns)} column(s): "
                    f"{', '.join(inconsistent_columns)}."
                ),
                recommendation=(
                    "Review these columns and ensure they contain "
                    "consistent data types before further processing."
                ),
                count=len(inconsistent_columns),
            )
            return

        self.summary["passed"] += 1

    def check_outliers(self):
        """
        Validate outliers in numeric columns.
        """
        outlier_columns = []

        numeric_columns = self.dataframe.select_dtypes(
            include=["number"],
        ).columns

        for column in numeric_columns:
            values = self.dataframe[column].dropna()

            # Skip columns that cannot have meaningful outliers.
            if len(values) < 2 or values.nunique() <= 1:
                continue

            q1 = values.quantile(0.25)
            q3 = values.quantile(0.75)
            iqr = q3 - q1

            # Skip columns with zero IQR.
            if iqr == 0:
                continue

            lower_bound = q1 - (1.5 * iqr)
            upper_bound = q3 + (1.5 * iqr)

            outlier_count = ((values < lower_bound) | (values > upper_bound)).sum()

            if outlier_count > 0:
                outlier_columns.append(column)

        if outlier_columns:
            self.summary["warnings"] += 1

            self.add_issue(
                issue_type="outliers",
                severity="warning",
                message=(
                    f"Found outliers in "
                    f"{len(outlier_columns)} column(s): "
                    f"{', '.join(outlier_columns)}."
                ),
                recommendation=(
                    "Review the detected outliers and determine "
                    "whether they should be retained, transformed, "
                    "or removed."
                ),
                count=len(outlier_columns),
            )
            return

        self.summary["passed"] += 1

    # ===================================================
    # Helper Methods
    # ===================================================

    def add_issue(
        self,
        issue_type,
        severity,
        message,
        recommendation,
        column=None,
        count=None,
    ):
        """
        Add validation issue.
        """

        issue = {
            "type": issue_type,
            "severity": severity,
            "message": message,
            "recommendation": recommendation,
        }

        if column is not None:
            issue["column"] = column

        if count is not None:
            issue["count"] = count

        self.issues.append(issue)

    def build_response(self):
        """
        Build validation response.
        """
        return {
            "status": self.get_status(),
            "summary": {
                "total_checks": (
                    self.summary["errors"]
                    + self.summary["warnings"]
                    + self.summary["passed"]
                ),
                **self.summary,
            },
            "issues": self.issues,
        }

    def get_status(self):
        """
        Determine validation status.
        """
        if self.summary["errors"] > 0:
            return "error"

        if self.summary["warnings"] > 0:
            return "warning"

        return "passed"
