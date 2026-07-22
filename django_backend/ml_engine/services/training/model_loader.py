import os

import joblib


class ModelLoader:
    """
    Load trained Machine Learning models.
    """

    def load_model(
        self,
        model_path,
    ):
        """
        Load a trained Machine Learning model.

        Parameters
        ----------
        model_path : str
            Path to the trained model.

        Returns
        -------
        object
            Loaded trained model.
        """

        if not os.path.exists(
            model_path,
        ):
            raise FileNotFoundError(f"Model file not found: {model_path}")

        try:
            return joblib.load(
                model_path,
            )

        except Exception as error:
            raise RuntimeError(f"Failed to load model: {error}") from error
