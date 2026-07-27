from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from ml_engine.serializers.validation_serializer import ValidationSerializer
from ml_engine.services.validation.validation_service import ValidationService


class ValidationAPIView(APIView):
    """
    Validate a dataset.
    """
    permission_classes = [AllowAny]

    def __init__(
        self,
        **kwargs,
    ):
        super().__init__(
            **kwargs,
        )

        self.validation_service = ValidationService()

    def post(
        self,
        request,
    ):

        # ==========================================
        # Validate Request
        # ==========================================

        serializer = ValidationSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        # ==========================================
        # Validate Dataset
        # ==========================================

        validation_result = self.validation_service.validate_dataset(
            dataset_id=serializer.validated_data["dataset_id"],
            version=serializer.validated_data["version"],
            dataset_type=serializer.validated_data["dataset_type"],
        )

        # ==========================================
        # Return Response
        # ==========================================

        return Response(
            validation_result,
            status=status.HTTP_200_OK
        )
