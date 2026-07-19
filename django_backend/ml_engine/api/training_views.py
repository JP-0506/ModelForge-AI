from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
import traceback
from ml_engine.services.training.training_service import (
    TrainingService,
)


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

            dataset_path = request.data.get(
                "dataset_path",
            )

            model_path = request.data.get(
                "model_path",
            )

            problem_type = request.data.get(
                "problem_type",
            )

            algorithm = request.data.get(
                "algorithm",
            )

            target_column = request.data.get(
                "target_column",
            )

            parameters = request.data.get(
                "parameters",
                {},
            )

            result = self.training_service.train_model(
                dataset_path=dataset_path,
                problem_type=problem_type,
                algorithm=algorithm,
                target_column=target_column,
                model_path=model_path,
                parameters=parameters,
            )

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
