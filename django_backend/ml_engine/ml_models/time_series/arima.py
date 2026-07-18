from statsmodels.tsa.arima.model import (
    ARIMA,
)


class ARIMAModel:
    """
    ARIMA Time Series Model Wrapper
    """

    def create_model(
        self,
        data,
        **parameters,
    ):
        """
        Create and return ARIMA model.

        Parameters
        ----------
        data : pandas.Series
            Time series data.

        Returns
        -------
        statsmodels.tsa.arima.model.ARIMA
        """

        return ARIMA(
            data,
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "ARIMA"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "arima"

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
            "trend": "n",
        }
