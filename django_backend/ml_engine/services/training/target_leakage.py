import pandas as pd

class TargetLeakageDetector:
    """
    Detect possible target leakage before model training.
    """

    ID_COLUMN_KEYWORDS = [
        "id",
        "uuid",
        "email",
        "phone",
        "mobile",
        "username",
        "user_id",
        "customer_id",
        "employee_id",
        "order_id",
        "invoice_id",
    ]

    FUTURE_COLUMN_KEYWORDS = [
        "updated_at",
        "completed_at",
        "closed_at",
        "delivered_at",
        "resolved_at",
        "finished_at",
        "end_date",
        "future",
    ]

    def detect(
        self,
        dataframe: pd.DataFrame,
        target_column: str = None,
        problem_type: str = None,
    ):
        """
        Detect potential target leakage.
        """

        report = {
            "leakage_detected": False,
            "warnings": [],
        }

        # ------------------------------------
        # Target Validation
        # ------------------------------------

        if problem_type in ["classification", "regression"] and not target_column:
            raise ValueError("Target column is required.")

        # ------------------------------------
        # ID Columns
        # ------------------------------------

        for column in dataframe.columns:

            column_lower = column.lower()

            if any(keyword in column_lower for keyword in self.ID_COLUMN_KEYWORDS):
                report["warnings"].append(
                    {
                        "column": column,
                        "reason": "Possible ID column.",
                    }
                )

        # ------------------------------------
        # Constant Columns
        # ------------------------------------

        for column in dataframe.columns:

            if dataframe[column].nunique(dropna=False) <= 1:

                report["warnings"].append(
                    {
                        "column": column,
                        "reason": "Constant column.",
                    }
                )

        # ------------------------------------
        # High Cardinality Columns
        # ------------------------------------

        total_rows = len(dataframe)

        for column in dataframe.columns:

            unique_count = dataframe[column].nunique()

            if total_rows > 0 and unique_count / total_rows >= 0.95:

                report["warnings"].append(
                    {
                        "column": column,
                        "reason": "High cardinality column.",
                    }
                )

        # ------------------------------------
        # Future Information
        # ------------------------------------

        for column in dataframe.columns:

            column_lower = column.lower()

            if any(keyword in column_lower for keyword in self.FUTURE_COLUMN_KEYWORDS):

                report["warnings"].append(
                    {
                        "column": column,
                        "reason": "Possible future information.",
                    }
                )

        # ------------------------------------
        # Target Correlation
        # ------------------------------------

        if (
            problem_type in ["classification", "regression"]
            and target_column in dataframe.columns
        ):

            numeric_dataframe = dataframe.select_dtypes(include="number")

            if target_column in numeric_dataframe.columns:

                correlations = numeric_dataframe.corr()[target_column].abs()

                for column, correlation in correlations.items():

                    if column != target_column and correlation >= 0.99:

                        report["warnings"].append(
                            {
                                "column": column,
                                "reason": (
                                    "Highly correlated with target "
                                    f"({correlation:.3f})."
                                ),
                            }
                        )

        # ------------------------------------
        # Final Status
        # ------------------------------------

        report["leakage_detected"] = len(report["warnings"]) > 0

        return report
