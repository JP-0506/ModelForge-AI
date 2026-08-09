import json
import os
import pandas as pd

from ml_engine.services.training.model_loader import ModelLoader
from ml_engine.services.prediction.prediction_validator import PredictionValidator
from ml_engine.services.prediction.prediction_preprocessor import (
    PredictionPreprocessor,
)


class PredictionService:
    """
    Service for generating predictions
    using a trained Machine Learning model.
    """

    def __init__(self):

        self.model_loader = ModelLoader()
        self.prediction_validator = PredictionValidator()
        self.prediction_preprocessor = PredictionPreprocessor()

    # ==================================================
    # Generate Prediction
    # ==================================================

    def predict(
        self,
        model_path,
        feature_metadata_path,
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
            print("===== MODEL PATH =====")
            print(model_path)

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

            input_data = self.prediction_preprocessor.prepare(
                features=features,
                metadata_path=feature_metadata_path,
            )
            print("\n===== PREPROCESSED INPUT =====")
            print(input_data)
            print(input_data.columns.tolist())

            print("\n===== PREDICTION COLUMNS =====")
            print(input_data.columns.tolist())

            print("\n===== PREDICTION DATA =====")
            print(input_data)

            # ------------------------------------------
            # Align Features to Model's Fit Feature Names
            # ------------------------------------------
            if hasattr(model, "feature_names_in_"):
                expected_features = list(model.feature_names_in_)
                for col in expected_features:
                    if col not in input_data.columns:
                        input_data[col] = 0
                input_data = input_data[expected_features]

            print("===== FINAL INPUT DATA FOR FIT MATCHING =====")
            print(input_data)

            import time
            start_time = time.time()

            prediction = model.predict(input_data)
            duration_ms = round((time.time() - start_time) * 1000, 2)

            predicted_value = prediction[0] if hasattr(prediction, "__getitem__") and len(prediction) > 0 else prediction
            if hasattr(predicted_value, "item"):
                predicted_value = predicted_value.item()

            result = {
                "prediction": predicted_value,
                "prediction_time_ms": duration_ms,
                "timestamp": pd.Timestamp.now().isoformat(),
            }

            # If target column label mapping exists in feature_metadata, decode numeric prediction back to original class label
            if feature_metadata_path and os.path.exists(feature_metadata_path):
                try:
                    with open(feature_metadata_path, "r", encoding="utf-8") as f:
                        meta = json.load(f)
                    target_col = meta.get("target_column")
                    enc_meta = meta.get("encoding_metadata", {})
                    enc_cols = enc_meta.get("columns", {})

                    # If target_col is not set or not in enc_cols, infer target_col as an encoded column missing from input features
                    if not target_col or target_col not in enc_cols:
                        input_keys = set(features.keys()) if isinstance(features, dict) else set()
                        missing_encoded_cols = [c for c in enc_cols.keys() if c not in input_keys]
                        if len(missing_encoded_cols) == 1:
                            target_col = missing_encoded_cols[0]
                        elif len(missing_encoded_cols) > 1:
                            for c in missing_encoded_cols:
                                try:
                                    if 0 <= int(predicted_value) < len(enc_cols[c]):
                                        target_col = c
                                        break
                                except Exception:
                                    pass

                    if target_col and target_col in enc_cols:
                        categories = enc_cols[target_col]
                        try:
                            int_val = int(predicted_value)
                            if 0 <= int_val < len(categories):
                                result["raw_prediction"] = predicted_value
                                result["prediction"] = categories[int_val]
                        except (ValueError, TypeError):
                            pass
                except Exception as e:
                    print("Error decoding target label:", e)

            if hasattr(model, "predict_proba"):
                try:
                    proba = model.predict_proba(input_data)
                    if hasattr(proba, "tolist"):
                        proba_list = proba.tolist()[0]
                    else:
                        proba_list = list(proba[0])
                    result["probabilities"] = proba_list
                    if hasattr(model, "classes_"):
                        classes = model.classes_
                        raw_classes = classes.tolist() if hasattr(classes, "tolist") else list(classes)
                        if target_col and target_col in enc_cols:
                            categories = enc_cols[target_col]
                            decoded_classes = []
                            for cls in raw_classes:
                                try:
                                    cls_int = int(cls)
                                    if 0 <= cls_int < len(categories):
                                        decoded_classes.append(categories[cls_int])
                                    else:
                                        decoded_classes.append(cls)
                                except Exception:
                                    decoded_classes.append(cls)
                            result["classes"] = decoded_classes
                        else:
                            result["classes"] = raw_classes
                except Exception:
                    pass

            return result

        except Exception as error:
            raise Exception(f"Prediction failed: {str(error)}") from error
