import os


class DeploymentValidator:
    """
    Validate a trained Machine Learning model
    before deployment.
    """

    def validate(
        self,
        model_path,
        model,
    ):
        """
        Validate the deployment requirements.

        Parameters
        ----------
        model_path : str
            Path to the trained model.

        model : object
            Loaded Machine Learning model.

        Returns
        -------
        bool
            True if validation succeeds.

        Raises
        ------
        FileNotFoundError
            If model file does not exist.

        ValueError
            If model is invalid.
        """

        # ----------------------------------
        # Validate Model Path
        # ----------------------------------

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")

        # ----------------------------------
        # Validate Loaded Model
        # ----------------------------------

        if model is None:
            raise ValueError("Loaded model is invalid.")

        # ----------------------------------
        # Validate Predict Method
        # ----------------------------------

        if not hasattr(model, "predict") or not callable(model.predict):
            raise ValueError("Model does not support prediction.")

        return True
