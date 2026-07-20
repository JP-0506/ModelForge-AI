class ComparisonMetrics:
    """
    Determines the comparison metric and sort order
    for each Machine Learning problem type.
    """

    def __init__(self):
        self.metric_mapping = {
            "regression": {
                "metric": "r2_score",
                "ascending": False,
            },
            "classification": {
                "metric": "accuracy",
                "ascending": False,
            },
            "clustering": {
                "metric": "silhouette_score",
                "ascending": False,
            },
            "time_series": {
                "metric": "mape",
                "ascending": True,
            },
            "anomaly_detection": {
                "metric": "f1_score",
                "ascending": False,
            },
        }

    def get_metric(
        self,
        problem_type,
    ):
        """
        Return comparison metric configuration
        for the given problem type.
        """

        if problem_type not in self.metric_mapping:
            raise ValueError(f"Unsupported problem type: {problem_type}")

        return self.metric_mapping[problem_type]
