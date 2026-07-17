import pandas as pd


class Outlier:

    def detect_outliers(self, dataframe: pd.DataFrame ):
        """
        Detect outliers using the IQR method.
        """

        numeric_dataframe = dataframe.select_dtypes(include=["number"])

        outlier_summary = {}

        for column in numeric_dataframe.columns:

            series = numeric_dataframe[column].dropna()

            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)

            iqr = q3 - q1

            lower_bound = q1 - (1.5 * iqr)
            upper_bound = q3 + (1.5 * iqr)

            outliers = series[(series < lower_bound) | (series > upper_bound)]

            outlier_summary[column] = {
                # Number of outliers
                "count": int(len(outliers)),
                # Percentage
                "percentage": round(
                    (len(outliers) / len(series)) * 100,
                    2,
                ),
                # Bounds
                "lower_bound": float(lower_bound),
                "upper_bound": float(upper_bound),
                # Values
                "values": outliers.tolist(),
                # Row indices
                "indices": outliers.index.tolist(),
            }

        return {"outliers": outlier_summary}
