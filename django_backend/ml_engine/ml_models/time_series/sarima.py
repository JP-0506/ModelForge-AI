from statsmodels.tsa.statespace.sarimax import SARIMAX


class SARIMAModel:
    """
    SARIMA Time Series Model Wrapper
    """

    def create_model(
        self,
        data,
        **parameters,
    ):
        """
        Create and return SARIMA model.

        Parameters
        ----------
        data : pandas.Series
            Time series data.

        Returns
        -------
        statsmodels.tsa.statespace.sarimax.SARIMAX
        """

        return SARIMAX(
            data,
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "SARIMA"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "sarima"

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
            "order": (
                1,
                1,
                1,
            ),
            "seasonal_order": (
                1,
                1,
                1,
                12,
            ),
            "trend": "n",
            "enforce_stationarity": True,
            "enforce_invertibility": True,
        }
