import pandas as pd


class FeatureGenerator:

    def generate_features(
        self,
        dataframe,
        generation_options,
    ):
        """
        Generate new features based on user selection.
        """

        if not generation_options:
            return dataframe

        for option in generation_options:

            operation = option.get("operation")
            new_column = option.get("new_column")
            columns = option.get("columns", [])

            if operation == "sum":

                dataframe[new_column] = (
                    dataframe[columns[0]]
                    + dataframe[columns[1]]
                )

            elif operation == "subtract":

                dataframe[new_column] = (
                    dataframe[columns[0]]
                    - dataframe[columns[1]]
                )

            elif operation == "multiply":

                dataframe[new_column] = (
                    dataframe[columns[0]]
                    * dataframe[columns[1]]
                )

            elif operation == "divide":

                dataframe[new_column] = (
                    dataframe[columns[0]]
                    / dataframe[columns[1]]
                )

            elif operation == "average":

                dataframe[new_column] = (
                    dataframe[columns].mean(axis=1)
                )

            elif operation == "ratio":

                dataframe[new_column] = (
                    dataframe[columns[0]]
                    / dataframe[columns[1]]
                )

            else:
                raise ValueError(
                    f"Unsupported operation: {operation}"
                )

        return dataframe