class Trainer:
    """
    Handles model training.
    """

    def train(
        self,
        model,
        X_train,
        y_train=None,
    ):
        """
        Train the selected model.

        Parameters
        ----------
        model : object
            Machine Learning model.

        X_train : pandas.DataFrame

        y_train : pandas.Series, optional

        Returns
        -------
        object
            Trained model.
        """

        # ======================================
        # Clustering    (Unsuoervised Learning)
        # ======================================

        if y_train is None:

            model.fit(
                X_train,
            )

            return model

        # ======================================
        # Regression            Supervised Lerning
        # Classification
        # ======================================

        model.fit(
            X_train,
            y_train,
        )

        return model
