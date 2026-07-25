from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

import traceback

from ml_engine.serializers.prediction_serializer import (
    PredictionSerializer,
)
from ml_engine.services.prediction.prediction_service import (
    PredictionService,
)


class PredictionAPIView(APIView):
    """
    Generate predictions using a trained
    Machine Learning model.
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

        self.prediction_service = (
            PredictionService()
        )

    # ==================================================
    # Generate Prediction
    # ==================================================

    def post(
        self,
        request,
    ):
        """
        Generate prediction.
        """

        try:

            # ----------------------------------
            # Validate Request
            # ----------------------------------

            serializer = (
                PredictionSerializer(
                    data=request.data,
                )
            )

            serializer.is_valid(
                raise_exception=True,
            )

            # ----------------------------------
            # Extract Request Data
            # ----------------------------------

            model_path = (
                serializer.validated_data.get(
                    "model_path",
                )
            )

            features = (
                serializer.validated_data.get(
                    "features",
                )
            )

            # ----------------------------------
            # Generate Prediction
            # ----------------------------------

            result = (
                self.prediction_service.predict(
                    model_path=model_path,
                    features=features,
                )
            )

            # ----------------------------------
            # Success Response
            # ----------------------------------

            return Response(
                {
                    "success": True,
                    "message": (
                        "Prediction generated successfully."
                    ),
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