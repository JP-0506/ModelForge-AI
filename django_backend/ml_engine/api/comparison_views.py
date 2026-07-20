from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from ml_engine.serializers.comparison_serializer import (
    ComparisonSerializer,
)

from ml_engine.services.comparison.comparison_service import (
    ComparisonService,
)


class ComparisonAPIView(APIView):
    """
    Compare trained Machine Learning models.
    """

    permission_classes = [
        AllowAny,
    ]

    def __init__(
        self,
        **kwargs,
    ):
        super().__init__(**kwargs)

        self.comparison_service = ComparisonService()

    def post(
        self,
        request,
    ):
        """
        Compare trained models and generate leaderboard.
        """

        try:

            # ==========================================
            # Validate Request
            # ==========================================

            serializer = ComparisonSerializer(
                data=request.data,
            )

            serializer.is_valid(
                raise_exception=True,
            )

            problem_type = serializer.validated_data["problem_type"]

            models = serializer.validated_data["models"]

            # ==========================================
            # Compare Models
            # ==========================================

            comparison_result = self.comparison_service.compare_models(
                problem_type=problem_type,
                models=models,
            )

            # ==========================================
            # Success Response
            # ==========================================

            return Response(
                {
                    "success": True,
                    "message": "Models compared successfully.",
                    "data": comparison_result,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as error:

            return Response(
                {
                    "success": False,
                    "message": str(error),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
