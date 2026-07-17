class Insights:

    def generate_insights(
        self,
        statistics,
        correlation,
        distribution,
        outlier,
    ):
        """
        Generate dataset insights from EDA results.
        """

        insights = {

            "high_missing_columns": [],

            "constant_columns": [],

            "highly_correlated_features": [],

            "high_outlier_columns": [],

            "highly_skewed_columns": [],

            "recommendations": [],
        }

        # =====================================
        # Missing Values
        # =====================================

        total_rows = statistics["rows"]

        for column, missing in statistics[
            "missing_values"
        ].items():

            percentage = (
                (missing / total_rows) * 100
            )

            if percentage >= 30:

                insights[
                    "high_missing_columns"
                ].append(
                    {
                        "column": column,
                        "missing_percentage": round(
                            percentage,
                            2,
                        ),
                    }
                )

                insights[
                    "recommendations"
                ].append(
                    f"Column '{column}' has {percentage:.2f}% missing values."
                )

        # =====================================
        # Constant Columns
        # =====================================

        numeric_stats = statistics.get(
            "numeric_statistics",
            {},
        )

        for column, values in numeric_stats.items():

            minimum = values.get("min")
            maximum = values.get("max")

            if minimum == maximum:

                insights[
                    "constant_columns"
                ].append(column)

                insights[
                    "recommendations"
                ].append(
                    f"Column '{column}' contains constant values."
                )

        # =====================================
        # Highly Correlated Features
        # =====================================

        for pair in correlation.get(
            "high_correlation_pairs",
            [],
        ):

            insights[
                "highly_correlated_features"
            ].append(pair)

            insights[
                "recommendations"
            ].append(
                f"{pair['feature_1']} and {pair['feature_2']} are highly correlated ({pair['correlation']})."
            )

        # =====================================
        # Outliers
        # =====================================

        for column, values in outlier[
            "outliers"
        ].items():

            if values["percentage"] >= 5:

                insights[
                    "high_outlier_columns"
                ].append(
                    {
                        "column": column,
                        "percentage": values[
                            "percentage"
                        ],
                    }
                )

                insights[
                    "recommendations"
                ].append(
                    f"Column '{column}' contains {values['percentage']}% outliers."
                )

        # =====================================
        # Skewness
        # =====================================

        for column, values in distribution[
            "distribution_summary"
        ].items():

            skewness = abs(
                values["skewness"]
            )

            if skewness > 1:

                insights[
                    "highly_skewed_columns"
                ].append(
                    {
                        "column": column,
                        "skewness": round(
                            values[
                                "skewness"
                            ],
                            4,
                        ),
                    }
                )

                insights[
                    "recommendations"
                ].append(
                    f"Column '{column}' is highly skewed."
                )

        return insights