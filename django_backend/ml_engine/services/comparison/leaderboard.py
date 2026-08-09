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
                    "experiment_id": model.get("experiment_id"),
                    "experiment_name": model.get("experiment_name", f"Experiment #{model['rank']}"),
                    "algorithm": model.get("algorithm"),
                    "model_name": model.get("model_name"),
                    "score": model.get("evaluation", {}).get(metric),
                    "metric": metric,
                    "evaluation": model.get("evaluation", {}),
                    "cross_validation": model.get("cross_validation", {}),
                    "training_time": model.get("training_time", 0.0),
                    "prediction_time": model.get("prediction_time", 0.01),
                    "model_size": model.get("model_size", 0),
                    "parameters": model.get("parameters", {}),
                    "target_column": model.get("target_column"),
                    "dataset_version": model.get("dataset_version"),
                    "status": model.get("status", "completed"),
                    "is_best_model": model.get("is_best_model", False),
                }
            )


        return leaderboard
