from datetime import datetime


class DeploymentManager:
    """
    Manage successful model deployment.
    """

    def create_deployment(
        self,
        model_path,
        model,
    ):
        """
        Prepare deployment information.

        Parameters
        ----------
        model_path : str
            Path to the trained model.

        model : object
            Loaded Machine Learning model.

        Returns
        -------
        dict
            Deployment details.
        """

        return {
            "deployment_status": "deployed",
            "model_path": model_path,
            "model_type": type(model).__name__,
            "ready_for_prediction": True,
            "deployed_at": datetime.utcnow().isoformat(),
        }
