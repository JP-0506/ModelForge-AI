from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from ml_engine.services.eda.eda_service import EDAService
from ml_engine.utils.response import (
    success_response,
    error_response,
)


class EDAView(APIView):
    # permission_classes = [IsAuthenticated]
    permission_classes = []

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.eda_service = EDAService()

    def post(self, request):
        try:

            dataset_id = request.data.get("dataset_id")
            version = request.data.get("version")

            if not dataset_id:
                raise ValueError(
                    "Dataset ID is required."
                )

            if not version:
                raise ValueError(
                    "Version is required."
                )

            result = self.eda_service.generate_eda(
                dataset_id=dataset_id,
                version=version,
            )

            return success_response(
                message="EDA completed successfully.",
                data=result,
                status_code=200,
            )

        except ValueError as error:

            return error_response(
                message=str(error),
                status_code=400,
            )

        except Exception as error:

            return error_response(
                message=str(error),
                status_code=500,
            )