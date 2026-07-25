from ml_engine.services.training.model_loader import ModelLoader
from ml_engine.services.deployment.deployment_validator import DeploymentValidator
# from ml_engine.services.deployment.deployment_manager import DeploymentManager


class DeploymentService:
    """
    Service for deploying trained Machine Learning models.
    """

    def __init__(self):

        self.model_loader = ModelLoader()
        self.deployment_validator = DeploymentValidator()
        # self.deployment_manager = DeploymentManager()

    # ==================================================
    # Deploy Model
    # ==================================================

    def deploy_model(self, model_path):
        """
        Deploy a trained Machine Learning model.

        Parameters
        ----------
        model_path : str

        Returns
        -------
        dict
            Deployment result.
        """

        try:

            # ------------------------------------------
            # Load Model
            # ------------------------------------------

            model = self.model_loader.load_model(
                model_path=model_path,
            )

            # ------------------------------------------
            # Validate Deployment
            # ------------------------------------------

            self.deployment_validator.validate(
                model_path=model_path,
                model=model,
            )

            # ------------------------------------------
            # Prepare Deployment
            # ------------------------------------------

            return {
                "validation_status": "success",
                "ready_for_prediction": True,
            }

        except Exception as error:
            raise Exception(f"Deployment failed: {str(error)}") from error
