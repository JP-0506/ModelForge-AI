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
        Load a trained model from disk.

        Parameters
        ----------
        model_path : str

        Returns
        -------
        object
            Loaded trained model.
        """

        if not os.path.exists(
            model_path,
        ):
            raise FileNotFoundError(f"Model not found: {model_path}")

        return joblib.load(
            model_path,
        )
