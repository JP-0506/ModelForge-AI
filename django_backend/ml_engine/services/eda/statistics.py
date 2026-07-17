import pandas as pd


class Statistics:

    def generate_statistics(
        self,
        dataframe: pd.DataFrame,
    ):
        """
        Generate dataset statistics.
        """

        # Numeric columns
        numeric_columns = dataframe.select_dtypes(
            include=["number"]
        ).columns

        # Categorical columns
        categorical_columns = dataframe.select_dtypes(
            exclude=["number"]
        ).columns

        return {

            # ----------------------------------
            # Dataset Information
            # ----------------------------------

            "rows": len(dataframe),

            "columns": len(
                dataframe.columns
            ),

            "memory_usage": int(
                dataframe.memory_usage(
                    deep=True
                ).sum()
            ),

            "column_names": list(
                dataframe.columns
            ),

            "data_types": {
                column: str(dtype)
                for column, dtype in dataframe.dtypes.items()
            },

            # ----------------------------------
            # Missing Values
            # ----------------------------------

            "missing_values": {
                column: int(value)
                for column, value in dataframe.isnull()
                .sum()
                .items()
            },

            # ----------------------------------
            # Duplicate Rows
            # ----------------------------------

            "duplicate_rows": int(
                dataframe.duplicated().sum()
            ),

            # ----------------------------------
            # Numeric Statistics
            # ----------------------------------

            "numeric_statistics": (
                dataframe[
                    numeric_columns
                ]
                .describe()
                .round(4)
                .to_dict()
            ),

            # ----------------------------------
            # Categorical Statistics
            # ----------------------------------

            "categorical_statistics": {
                column: dataframe[
                    column
                ]
                .value_counts()
                .to_dict()
                for column in categorical_columns
            },
        }