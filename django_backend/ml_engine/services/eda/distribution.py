import pandas as pd


class Distribution:

    def generate_distribution(
        self,
        dataframe: pd.DataFrame,
    ):
        """
        Generate distribution data for numeric columns.
        """

        numeric_dataframe = dataframe.select_dtypes(
            include=["number"]
        )

        histogram_data = {}
        boxplot_data = {}
        distribution_summary = {}

        for column in numeric_dataframe.columns:

            series = numeric_dataframe[column].dropna()

            # -------------------------
            # Histogram Data
            # -------------------------

            histogram_data[column] = (
                series.tolist()
            )

            # -------------------------
            # Box Plot Data
            # -------------------------

            q1 = float(series.quantile(0.25))
            median = float(series.median())
            q3 = float(series.quantile(0.75))

            iqr = q3 - q1

            lower_bound = q1 - (1.5 * iqr)
            upper_bound = q3 + (1.5 * iqr)

            boxplot_data[column] = {
                "min": float(series.min()),
                "q1": q1,
                "median": median,
                "q3": q3,
                "max": float(series.max()),
                "lower_bound": lower_bound,
                "upper_bound": upper_bound,
            }

            # -------------------------
            # Distribution Summary
            # -------------------------

            distribution_summary[column] = {

                "mean": float(series.mean()),

                "std": float(series.std()),

                "variance": float(series.var()),

                "skewness": float(series.skew()),

                "kurtosis": float(series.kurt()),

                "min": float(series.min()),

                "max": float(series.max()),
            }

        return {

            "histogram_data": histogram_data,

            "boxplot_data": boxplot_data,

            "distribution_summary":
                distribution_summary,
        }