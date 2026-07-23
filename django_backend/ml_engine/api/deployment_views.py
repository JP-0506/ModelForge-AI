from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

import traceback

from ml_engine.serializers.deployment_serializer import DeploymentSerializer
from ml_engine.services.deployment.deployment_service import DeploymentService


class DeploymentAPIView(APIView):
    """
    Deploy a trained Machine Learning model.
    """

    permission_classes = [
        AllowAny,
    ]

    def __init__(
        self,
        **kwargs,
    ):
        super().__init__(
            **kwargs,
        )

        self.deployment_service = DeploymentService()

    def post(
        self,
        request,
    ):
        """
        Deploy a trained Machine Learning model.
        """

        try:

            # ----------------------------------
            # Validate Request
            # ----------------------------------

            serializer = DeploymentSerializer(
                data=request.data,
            )

            serializer.is_valid(
                raise_exception=True,
            )

            # ----------------------------------
            # Extract Request Data
            # ----------------------------------

            model_path = serializer.validated_data.get(
                "model_path",
            )

            # ----------------------------------
            # Deploy Model
            # ----------------------------------

            result = self.deployment_service.deploy_model(
                model_path=model_path,
            )

            # ----------------------------------
            # Success Response
            # ----------------------------------

            return Response(
                {
                    "success": True,
                    "message": "Model deployed successfully.",
                    "data": result,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as error:

            traceback.print_exc()

            return Response(
                {
                    "success": False,
                    "message": str(
                        error,
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
