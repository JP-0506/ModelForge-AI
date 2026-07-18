from prophet import Prophet

class ProphetModel:
    """
    Prophet Time Series Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Prophet model.
        """

        return Prophet(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Prophet"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "prophet"

    def get_problem_type(
        self,
    ):
        """
        Return supported problem type.
        """

        return "time_series"

    def get_default_parameters(
        self,
    ):
        """
        Return default model parameters.
        """

        return {
            "growth": "linear",
            "changepoint_prior_scale": 0.05,
            "seasonality_prior_scale": 10.0,
            "holidays_prior_scale": 10.0,
            "seasonality_mode": "additive",
            "yearly_seasonality": "auto",
            "weekly_seasonality": "auto",
            "daily_seasonality": "auto",
            "interval_width": 0.80,
            "uncertainty_samples": 1000,
        }
