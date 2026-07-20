class ModelRanker:
    """
    Rank trained models based on
    the selected evaluation metric.
    """

    def rank_models(
        self,
        models,
        metric,
        ascending=False,
    ):
        """
        Rank models according to the given metric.

        Parameters
        ----------
        models : list
            List of trained model results.

        metric : str
            Evaluation metric used for ranking.

        ascending : bool
            True  -> Lower value is better
            False -> Higher value is better

        Returns
        -------
        list
            Ranked models.
        """

        if not models:
            return []

        ranked_models = sorted(
            models,
            key=lambda model: model.get(
                "evaluation",
                {},
            ).get(
                metric,
                float("inf") if ascending else float("-inf"),
            ),
            reverse=not ascending,
        )

        for rank, model in enumerate(
            ranked_models,
            start=1,
        ):
            model["rank"] = rank

            model["is_best_model"] = rank == 1

        return ranked_models
