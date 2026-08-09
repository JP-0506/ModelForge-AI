import pandas as pd
import numpy as np


class Correlation:

    def generate_correlation(self, dataframe: pd.DataFrame, default_threshold: float = 0.70):
        """
        Generate correlation matrix and strong positive / negative correlation pairs.
        """
        numeric_dataframe = dataframe.select_dtypes(include=["number"])

        if numeric_dataframe.empty or len(numeric_dataframe.columns) < 2:
            return {
                "columns": [],
                "correlation_matrix": {},
                "matrix_list": [],
                "strong_positive_correlations": [],
                "strong_negative_correlations": [],
                "total_correlation_pairs": 0,
            }

        # Calculate Pearson correlation matrix
        corr_df = numeric_dataframe.corr().round(4).fillna(0)
        columns = corr_df.columns.tolist()

        strong_positive = []
        strong_negative = []
        matrix_list = []

        for i, col1 in enumerate(columns):
            row_dict = {"feature": col1}
            for j, col2 in enumerate(columns):
                val = float(corr_df.iloc[i, j])
                row_dict[col2] = val

                if i < j:
                    if val >= default_threshold:
                        strong_positive.append({
                            "feature_1": col1,
                            "feature_2": col2,
                            "correlation": val,
                        })
                    elif val <= -default_threshold:
                        strong_negative.append({
                            "feature_1": col1,
                            "feature_2": col2,
                            "correlation": val,
                        })
            matrix_list.append(row_dict)

        # Sort strong pairs by absolute magnitude
        strong_positive.sort(key=lambda x: abs(x["correlation"]), reverse=True)
        strong_negative.sort(key=lambda x: abs(x["correlation"]), reverse=True)

        total_pairs = (len(columns) * (len(columns) - 1)) // 2

        return {
            "columns": columns,
            "correlation_matrix": corr_df.to_dict(),
            "matrix_list": matrix_list,
            "strong_positive_correlations": strong_positive,
            "strong_negative_correlations": strong_negative,
            "total_correlation_pairs": total_pairs,
            "default_threshold": default_threshold,
        }
