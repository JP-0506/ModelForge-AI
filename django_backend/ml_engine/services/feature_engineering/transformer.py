import numpy as np


class Transformer:

    def apply_transformation(
        self,
        dataframe,
        transformation_option,
        columns,
    ):
        """
        Apply transformation based on user selection.
        """

        if transformation_option == "none":
            return dataframe

        # Keep only valid numeric columns
        numeric_columns = [
            column
            for column in columns
            if column in dataframe.columns
            and np.issubdtype(dataframe[column].dtype, np.number)
        ]

        if not numeric_columns:
            return dataframe

        # ----------------------------
        # Log Transformation
        # ----------------------------
        if transformation_option == "log":

            for column in numeric_columns:
                dataframe[column] = np.log1p(
                    dataframe[column]
                )

        # ----------------------------
        # Square Root Transformation
        # ----------------------------
        elif transformation_option == "sqrt":

            for column in numeric_columns:
                dataframe[column] = np.sqrt(
                    dataframe[column]
                )

        # ----------------------------
        # Square Transformation
        # ----------------------------
        elif transformation_option == "square":

            for column in numeric_columns:
                dataframe[column] = np.square(
                    dataframe[column]
                )

        # ----------------------------
        # Cube Transformation
        # ----------------------------
        elif transformation_option == "cube":

            for column in numeric_columns:
                dataframe[column] = np.power(
                    dataframe[column],
                    3,
                )

        # ----------------------------
        # Power Transformation
        # ----------------------------
        elif transformation_option == "power":

            exponent = 2

            for column in numeric_columns:
                dataframe[column] = np.power(
                    dataframe[column],
                    exponent,
                )

        else:
            raise ValueError(
                "Invalid transformation option."
            )

        return dataframe