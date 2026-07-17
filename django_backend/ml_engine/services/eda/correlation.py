import pandas as pd


class Correlation:

    def generate_correlation(self, dataframe: pd.DataFrame):
        """
        Generate correlation matrix for numeric columns.
        """

        # Select only numeric columns
        numeric_dataframe = dataframe.select_dtypes(include=["number"])

        # If no numeric columns exist
        if numeric_dataframe.empty:
            return {
                "correlation_matrix": {},
                "high_correlation_pairs": [],
            }

        # Correlation matrix
        correlation_matrix = numeric_dataframe.corr().round(4).fillna(0)

        # Highly correlated feature pairs
        high_correlation_pairs = []

        columns = correlation_matrix.columns

        for i in range(len(columns)):
            for j in range(i + 1, len(columns)):

                correlation = correlation_matrix.iloc[
                    i,
                    j,
                ]

                if abs(correlation) >= 0.80:
                    high_correlation_pairs.append(
                        {
                            "feature_1": columns[i],
                            "feature_2": columns[j],
                            "correlation": float(correlation),
                        }
                    )

        return {
            # Complete matrix
            "correlation_matrix": correlation_matrix.to_dict(),
            # Strong correlations
            "high_correlation_pairs": high_correlation_pairs,
        }
