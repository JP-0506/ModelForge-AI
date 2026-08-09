from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from ml_engine.services.eda.eda_service import EDAService
from ml_engine.utils.response import (
    success_response,
    error_response,
)


class EDAView(APIView):
    permission_classes = []

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.eda_service = EDAService()

    def post(self, request):
        try:
            dataset_id = request.data.get("dataset_id")
            version = request.data.get("version", 1)

            if not dataset_id:
                raise ValueError("Dataset ID is required.")

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


class EDAGetView(APIView):
    permission_classes = []

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.eda_service = EDAService()

    def get(self, request):
        try:
            dataset_id = request.query_params.get("dataset_id")
            version = request.query_params.get("version", 1)

            if not dataset_id:
                raise ValueError("Dataset ID is required.")

            result = self.eda_service.get_eda(
                dataset_id=dataset_id,
                version=version,
            )

            if not result:
                return success_response(
                    message="No existing EDA report found.",
                    data=None,
                    status_code=200,
                )

            return success_response(
                message="EDA report fetched successfully.",
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