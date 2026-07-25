class PredictionValidator:
    """
    Validate a prediction request before
    generating predictions.
    """

    # ==================================================
    # Validate Prediction
    # ==================================================

    def validate(
        self,
        model,
        features,
    ):
        """
        Validate prediction requirements.

        Parameters
        ----------
        model : object
            Loaded Machine Learning model.

        features : dict
            Prediction input features.

        Returns
        -------
        bool
            True if validation succeeds.

        Raises
        ------
        ValueError
            If validation fails.
        """

        # ------------------------------------------
        # Validate Loaded Model
        # ------------------------------------------

        if model is None:
            raise ValueError(
                "Loaded model is invalid.",
            )

        # ------------------------------------------
        # Validate Predict Method
        # ------------------------------------------

        if (
            not hasattr(
                model,
                "predict",
            )
            or
            not callable(
                model.predict,
            )
        ):
            raise ValueError(
                "Model does not support prediction.",
            )

        # ------------------------------------------
        # Validate Features
        # ------------------------------------------

        if not isinstance(
            features,
            dict,
        ):
            raise ValueError(
                "Features must be a dictionary.",
            )

        if not features:
            raise ValueError(
                "Features cannot be empty.",
            )

        # ------------------------------------------
        # Validate Feature Data Types
        # ------------------------------------------

        for (
            feature_name,
            feature_value,
        ) in features.items():

            if not isinstance(
                feature_value,
                (
                    int,
                    float,
                    str,
                    bool,
                ),
            ):
                raise ValueError(
                    f"Unsupported data type for feature '{feature_name}'."
                )

        return True