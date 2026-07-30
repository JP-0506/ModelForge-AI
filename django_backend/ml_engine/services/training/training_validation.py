import pandas as pd


class TrainingValidation:
    """
    Performs training-specific validation before model training.
    """

    def __init__(
        self,
        dataframe: pd.DataFrame,
        target_column: str,
        algorithm: str,
    ):
        self.dataframe = dataframe
        self.target_column = target_column
        self.algorithm = algorithm

        self.issues = []

        self.summary = {
            "errors": 0,
            "warnings": 0,
            "passed": 0,
        }

    # ==========================================
    # Validate
    # ==========================================

    def validate(
        self,
    ):
        """
        Run all training validation checks.
        """
    
        self.check_target_column()
    
        if self.summary["errors"] > 0:
            return self.build_response()
    
        self.check_empty_features()
    
        if self.summary["errors"] > 0:
            return self.build_response()
    
        self.check_missing_values()
    
        if self.summary["errors"] > 0:
            return self.build_response()
    
        self.check_categorical_features()
    
        return self.build_response()

    # ==========================================
    # Validation Checks
    # ==========================================

    def check_target_column(
        self,
    ):
        """
        Validate target column.
        """

        # ==========================================
        # Target Column Exists
        # ==========================================

        if self.target_column not in self.dataframe.columns:

            self.summary["errors"] += 1

            self.add_issue(
                issue_type="target_column",
                severity="error",
                message=(
                    f"Target column '{self.target_column}' does not exist in the dataset."
                ),
                recommendation=(
                    "Select a valid target column before training the model."
                ),
                column=self.target_column,
            )

            return

        # ==========================================
        # Target Column Is Empty
        # ==========================================

        if self.dataframe[self.target_column].dropna().empty:

            self.summary["errors"] += 1

            self.add_issue(
                issue_type="target_column",
                severity="error",
                message=(
                    f"Target column '{self.target_column}' contains no valid values."
                ),
                recommendation=("Choose a target column containing valid data."),
                column=self.target_column,
            )

            return

        # ==========================================
        # Target Column Contains Only One Value
        # ==========================================

        unique_values = self.dataframe[self.target_column].dropna().nunique()

        if unique_values <= 1:

            self.summary["errors"] += 1

            self.add_issue(
                issue_type="target_column",
                severity="error",
                message=(
                    f"Target column '{self.target_column}' contains only one unique value."
                ),
                recommendation=(
                    "Choose a target column with at least two unique values."
                ),
                column=self.target_column,
            )

            return

        self.summary["passed"] += 1

    def check_empty_features(
        self,
    ):
        """
        Validate feature columns.
        """

        feature_columns = self.dataframe.drop(
            columns=[
                self.target_column,
            ],
        )

        # ==========================================
        # No Feature Columns
        # ==========================================

        if feature_columns.shape[1] == 0:

            self.summary["errors"] += 1

            self.add_issue(
                issue_type="empty_features",
                severity="error",
                message=("No feature columns are available for training."),
                recommendation=(
                    "Add one or more feature columns before " "training the model."
                ),
            )

            return

        self.summary["passed"] += 1

    def check_missing_values(
        self,
    ):
        """
        Validate missing values before training.
        """

        missing_columns = []

        missing_values = self.dataframe.isna().sum()

        for column, count in missing_values.items():

            if count > 0:

                missing_columns.append(
                    {
                        "column": column,
                        "count": int(count),
                    },
                )

        # ==========================================
        # Missing Values Found
        # ==========================================

        if missing_columns:

            self.summary["errors"] += 1

            self.add_issue(
                issue_type="missing_values",
                severity="error",
                message=(
                    f"Found missing values in " f"{len(missing_columns)} column(s)."
                ),
                recommendation=(
                    "Handle all missing values before " "training the model."
                ),
                count=len(
                    missing_columns,
                ),
            )

            return

        self.summary["passed"] += 1

    def check_categorical_features(
        self,
    ):
        """
        Validate categorical feature columns.
        """
        print("hi JP")

        feature_dataframe = self.dataframe.drop(
            columns=[
                self.target_column,
            ],
        )

        categorical_columns = feature_dataframe.select_dtypes(
            include=[
                "object",
                "category",
                "string",
            ],
        ).columns.tolist()

        # ==========================================
        # Categorical Features Found
        # ==========================================

        if categorical_columns:

            self.summary["errors"] += 1

            self.add_issue(
                issue_type="categorical_features",
                severity="error",
                message=(
                    f"Dataset contains {len(categorical_columns)} "
                    f"categorical feature column(s): "
                    f"{', '.join(categorical_columns)}."
                ),
                recommendation=(
                    "Apply a suitable encoding technique "
                    "such as One-Hot Encoding, Label Encoding, "
                    "or Target Encoding before training."
                ),
                count=len(
                    categorical_columns,
                ),
            )

            return

        self.summary["passed"] += 1

    def check_algorithm_compatibility(
        self,
    ):
        """
        Validate algorithm compatibility with the dataset.
        """
        pass

    # ==========================================
    # Helper Methods
    # ==========================================

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

        self.issues.append(
            issue,
        )

    def build_response(
        self,
    ):
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

    def get_status(
        self,
    ):
        """
        Get overall validation status.
        """

        if self.summary["errors"] > 0:
            return "error"

        if self.summary["warnings"] > 0:
            return "warning"

        return "passed"
