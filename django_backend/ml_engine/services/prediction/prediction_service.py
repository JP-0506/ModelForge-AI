import pandas as pd

from ml_engine.services.training.model_loader import ModelLoader
from ml_engine.services.prediction.prediction_validator import PredictionValidator


class PredictionService:
    """
    Service for generating predictions
    using a trained Machine Learning model.
    """

    def __init__(self):

        self.model_loader = ModelLoader()
        self.prediction_validator = PredictionValidator()

    # ==================================================
    # Generate Prediction
    # ==================================================

    def predict(
        self,
        model_path,
        features,
    ):
        """
        Generate prediction using a trained model.

        Parameters
        ----------
        model_path : str
            Path to the trained model.

        features : dict
            Prediction input features.

        Returns
        -------
        dict
            Prediction result.
        """

        try:

            # ------------------------------------------
            # Load Model
            # ------------------------------------------

            model = self.model_loader.load_model(
                model_path=model_path,
            )

            # ------------------------------------------
            # Validate Prediction Request
            # ------------------------------------------

            self.prediction_validator.validate(
                model=model,
                features=features,
            )

            # ------------------------------------------
            # Prepare Prediction Input
            # ------------------------------------------

            input_data = pd.DataFrame(
                [features],
            )

            # ------------------------------------------
            # Generate Prediction
            # ------------------------------------------

            prediction = model.predict(
                input_data,
            )

            # ------------------------------------------
            # Return Prediction
            # ------------------------------------------

            return {
                "prediction": prediction.tolist(),
            }

        except Exception as error:

            raise Exception(
                f"Prediction failed: {str(error)}",
            ) from error
