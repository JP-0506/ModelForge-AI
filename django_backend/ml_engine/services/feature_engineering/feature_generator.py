import pandas as pd
import numpy as np


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

        if isinstance(generation_options, dict):
            operations = generation_options.get("custom_operations", [])
        else:
            operations = generation_options

        # Custom/Pairwise Operations
        if isinstance(operations, list):
            for option in operations:
                operation = option.get("operation")
                new_column = option.get("new_column")
                columns = option.get("columns", [])

                if not new_column or len(columns) < 1:
                    continue

                if operation == "sum" and len(columns) >= 2:
                    dataframe[new_column] = dataframe[columns[0]] + dataframe[columns[1]]
                elif operation == "subtract" and len(columns) >= 2:
                    dataframe[new_column] = dataframe[columns[0]] - dataframe[columns[1]]
                elif operation == "multiply" and len(columns) >= 2:
                    dataframe[new_column] = dataframe[columns[0]] * dataframe[columns[1]]
                elif operation == "divide" and len(columns) >= 2:
                    dataframe[new_column] = dataframe[columns[0]] / dataframe[columns[1]].replace(0, np.nan)
                elif operation == "average":
                    dataframe[new_column] = dataframe[columns].mean(axis=1)
                elif operation == "ratio" and len(columns) >= 2:
                    dataframe[new_column] = dataframe[columns[0]] / dataframe[columns[1]].replace(0, np.nan)

        return dataframe
