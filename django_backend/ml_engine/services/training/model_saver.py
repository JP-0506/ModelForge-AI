import os

import joblib


class ModelSaver:
    """
    Save trained Machine Learning models.
    """

    def save_model(
        self,
        trained_model,
        model_path,
    ):
        """
        Save trained model to disk.

        Parameters
        ----------
        trained_model : object

        model_path : str

        Returns
        -------
        str
            Saved model path.
        """

        directory = os.path.dirname(
            model_path,
        )

        if directory:

            os.makedirs(
                directory,
                exist_ok=True,
            )

        joblib.dump(
            trained_model,
            model_path,
        )

        return model_path