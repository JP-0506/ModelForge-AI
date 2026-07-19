import pandas as pd

from ml_engine.services.training.target_leakage import (
    TargetLeakageDetector,
)

from ml_engine.services.training.data_splitter import (
    DataSplitter,
)

from ml_engine.services.training.cross_validator import (
    CrossValidator,
)

from ml_engine.services.training.model_factory import (
    ModelFactory,
)

from ml_engine.services.training.trainer import (
    Trainer,
)

from ml_engine.services.training.evaluator import (
    Evaluator,
)

from ml_engine.services.training.model_saver import (
    ModelSaver,
)


class TrainingService:
    """
    Main training pipeline for ModelForge AI.
    """

    def __init__(
        self,
    ):
        """
        Initialize all training services.
        """

        self.target_leakage_detector = TargetLeakageDetector()

        self.data_splitter = DataSplitter()

        self.cross_validator = CrossValidator()

        self.model_factory = ModelFactory()

        self.trainer = Trainer()

        self.evaluator = Evaluator()

        self.model_saver = ModelSaver()

    # =====================================
    # Load Dataset
    # =====================================

    def _load_dataset(
        self,
        dataset_path,
    ):
        """
        Load feature engineered dataset.

        Parameters
        ----------
        dataset_path : str

        Returns
        -------
        pandas.DataFrame
        """

        return pd.read_csv(
            dataset_path,
        )

    # =====================================
    # Target Leakage Detection
    # =====================================

    def _detect_target_leakage(
        self,
        dataframe,
        target_column,
        problem_type,
    ):
        """
        Detect target leakage before training.
        """

        return self.target_leakage_detector.detect(
            dataframe=dataframe,
            target_column=target_column,
            problem_type=problem_type,
        )

    # =====================================
    # Split Dataset
    # =====================================

    def _split_dataset(
        self,
        dataframe,
        target_column,
        problem_type,
        test_size=0.2,
        random_state=42,
    ):
        """
        Split dataset into training and testing sets.
        """

        return self.data_splitter.split(
            dataframe=dataframe,
            target_column=target_column,
            problem_type=problem_type,
            test_size=test_size,
            random_state=random_state,
        )

    # =====================================
    # Create Model
    # =====================================

    def _create_model(
        self,
        problem_type,
        algorithm,
        parameters=None,
    ):
        """
        Create Machine Learning model.
        """

        if parameters is None:
            parameters = {}

        # wrapper = self.model_factory.create_model(
        wrapper = self.model_factory.create(
            problem_type=problem_type,
            algorithm=algorithm,
        )

        model = wrapper.create_model(
            **parameters,
        )

        return wrapper, model

    # =====================================
    # Train Model
    # =====================================

    def _train_model(
        self,
        model,
        X_train,
        y_train=None,
    ):
        """
        Train Machine Learning model.
        """

        return self.trainer.train(
            model=model,
            X_train=X_train,
            y_train=y_train,
        )

    # =====================================
    # Cross Validation
    # =====================================

    def _cross_validate(
        self,
        trained_model,
        X_train,
        y_train,
        problem_type,
        scoring=None,
        cv=5,
    ):
        """
        Perform cross validation.
        """

        return self.cross_validator.validate(
            model=trained_model,
            X=X_train,
            y=y_train,
            problem_type=problem_type,
            scoring=scoring,
            folds=cv,
        )

    # =====================================
    # Make Predictions
    # =====================================

    def _make_predictions(
        self,
        trained_model,
        X_test,
    ):
        """
        Generate predictions.
        """

        return trained_model.predict(
            X_test,
        )

    # =====================================
    # Evaluate Model
    # =====================================

    def _evaluate_model(
        self,
        problem_type,
        y_test,
        predictions,
        X_test=None,
    ):
        """
        Evaluate trained model.
        """

        return self.evaluator.evaluate(
            problem_type=problem_type,
            y_true=y_test,
            predictions=predictions,
            X_test=X_test,
        )

    # =====================================
    # Save Trained Model
    # =====================================

    def _save_trained_model(
        self,
        trained_model,
        model_path,
    ):
        """
        Save trained model.
        """

        return self.model_saver.save_model(
            trained_model=trained_model,
            model_path=model_path,
        )

    # =====================================
    # Train Model Pipeline
    # =====================================

    def train_model(
        self,
        dataset_path,
        problem_type,
        algorithm,
        target_column,
        model_path,
        parameters=None,
    ):
        """
        Complete model training pipeline.
        """

        # -----------------------------
        # Load Dataset
        # -----------------------------

        dataframe = self._load_dataset(
            dataset_path,
        )

        # -----------------------------
        # Target Leakage
        # -----------------------------

        leakage_report = self._detect_target_leakage(
            dataframe=dataframe,
            target_column=target_column,
            problem_type=problem_type,
        )

        # -----------------------------
        # Dataset Split
        # -----------------------------
        split_data = self._split_dataset(
            dataframe=dataframe,
            target_column=target_column,
            problem_type=problem_type,
        )

        X_train = split_data["X_train"]

        X_test = split_data["X_test"]

        y_train = split_data["y_train"]

        y_test = split_data["y_test"]

        # -----------------------------
        # Create Model
        # -----------------------------

        wrapper, model = self._create_model(
            problem_type=problem_type,
            algorithm=algorithm,
            parameters=parameters,
        )
        

        # -----------------------------
        # Train Model
        # -----------------------------

        trained_model = self._train_model(
            model=model,
            X_train=X_train,
            y_train=y_train,
        )
        print(type(model))
        print(type(trained_model))
        # -----------------------------
        # Cross Validation
        # -----------------------------

        cross_validation = self._cross_validate(
            trained_model=trained_model,
            X_train=X_train,
            y_train=y_train,
            problem_type=problem_type,
        )

        # -----------------------------
        # Prediction
        # -----------------------------

        predictions = self._make_predictions(
            trained_model=trained_model,
            X_test=X_test,
        )

        # -----------------------------
        # Evaluation
        # -----------------------------

        evaluation = self._evaluate_model(
            problem_type=problem_type,
            y_test=y_test,
            predictions=predictions,
            X_test=X_test,
        )

        # -----------------------------
        # Save Model
        # -----------------------------

        saved_model_path = self._save_trained_model(
            trained_model=trained_model,
            model_path=model_path,
        )

        # -----------------------------
        # Return Result
        # -----------------------------

        return {
            "status": "completed",
            "problem_type": problem_type,
            "algorithm": algorithm,
            "model_name": wrapper.get_name(),
            "target_column": target_column,
            "target_leakage": leakage_report,
            "cross_validation": cross_validation,
            "evaluation": evaluation,
            "model_path": saved_model_path,
        }
