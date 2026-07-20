class Leaderboard:
    """
    Build the final leaderboard response
    from ranked machine learning models.
    """

    def build(
        self,
        ranked_models,
        metric,
    ):
        """
        Build leaderboard.

        Parameters
        ----------
        ranked_models : list
            Ranked models.

        metric : str
            Metric used for ranking.

        Returns
        -------
        list
            Leaderboard response.
        """

        leaderboard = []

        for model in ranked_models:

            leaderboard.append(
                {
                    "rank": model["rank"],
                    "experiment_id": model.get(
                        "experiment_id",
                    ),
                    "algorithm": model.get(
                        "algorithm",
                    ),
                    "model_name": model.get(
                        "model_name",
                    ),
                    "score": model.get(
                        "evaluation",
                        {},
                    ).get(
                        metric,
                    ),
                    "metric": metric,
                    "is_best_model": model.get(
                        "is_best_model",
                        False,
                    ),
                }
            )

        return leaderboard
