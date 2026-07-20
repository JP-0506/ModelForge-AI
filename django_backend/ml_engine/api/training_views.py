from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

import traceback

from ml_engine.serializers.training_serializer import TrainingSerializer
from ml_engine.services.training.training_service import TrainingService


class TrainingAPIView(APIView):
    """
    Train Machine Learning model.
    """

    permission_classes = [
        AllowAny,
    ]

    def __init__(
        self,
        **kwargs,
    ):
        super().__init__(**kwargs)

        self.training_service = TrainingService()

    def post(
        self,
        request,
    ):
        """
        Train a Machine Learning model.
        """

        try:

            # ==========================================
            # Validate Request
            # ==========================================

            serializer = TrainingSerializer(
                data=request.data,
            )

            serializer.is_valid(
                raise_exception=True,
            )

            validated_data = serializer.validated_data

            dataset_path = validated_data["dataset_path"]

            model_path = validated_data["model_path"]

            problem_type = validated_data["problem_type"]

            algorithm = validated_data["algorithm"]

            target_column = validated_data.get(
                "target_column",
            )

            parameters = validated_data.get(
                "parameters",
                {},
            )

            # ==========================================
            # Train Model
            # ==========================================

            result = self.training_service.train_model(
                dataset_path=dataset_path,
                problem_type=problem_type,
                algorithm=algorithm,
                target_column=target_column,
                model_path=model_path,
                parameters=parameters,
            )

            # ==========================================
            # Success Response
            # ==========================================

            return Response(
                {
                    "success": True,
                    "message": "Model trained successfully.",
                    "data": result,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as error:

            traceback.print_exc()

            return Response(
                {
                    "success": False,
                    "message": str(error),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
