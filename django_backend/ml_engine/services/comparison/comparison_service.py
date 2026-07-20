from ml_engine.services.comparison.comparison_metrics import (
    ComparisonMetrics,
)

from ml_engine.services.comparison.model_ranker import (
    ModelRanker,
)

from ml_engine.services.comparison.leaderboard import (
    Leaderboard,
)


class ComparisonService:
    """
    Compare trained machine learning models
    and generate a leaderboard.
    """

    def __init__(self):
        self.comparison_metrics = ComparisonMetrics()

        self.model_ranker = ModelRanker()

        self.leaderboard = Leaderboard()

    # ===================================================
    # Compare Models
    # ===================================================

    def compare_models(
        self,
        problem_type,
        models,
    ):
        """
        Compare trained models.

        Parameters
        ----------
        problem_type : str

        models : list

        Returns
        -------
        dict
        """

        try:

            # ==========================================
            # Get Comparison Metric
            # ==========================================

            metric_config = self.comparison_metrics.get_metric(
                problem_type,
            )

            metric = metric_config["metric"]

            ascending = metric_config["ascending"]

            # ==========================================
            # Rank Models
            # ==========================================

            ranked_models = self.model_ranker.rank_models(
                models=models,
                metric=metric,
                ascending=ascending,
            )

            # ==========================================
            # Generate Leaderboard
            # ==========================================

            leaderboard = self.leaderboard.build(
                ranked_models=ranked_models,
                metric=metric,
            )

            # ==========================================
            # Return Response
            # ==========================================

            return {
                "problem_type": problem_type,
                "comparison_metric": metric,
                "total_models": len(models),
                "leaderboard": leaderboard,
            }

        except Exception as error:

            raise Exception(f"Model comparison failed: {str(error)}")
