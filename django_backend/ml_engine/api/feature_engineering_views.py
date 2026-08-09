from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from ml_engine.services.feature_engineering.feature_engineering_service import (
    FeatureEngineeringService,
)
from ml_engine.utils.response import (
    success_response,
    error_response,
)


class FeatureEngineeringView(APIView):
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.feature_engineering_service = (
            FeatureEngineeringService()
        )

    def post(self, request):
        try:
            dataset_id = request.data.get("dataset_id")
            version = request.data.get("version")
            target_column = request.data.get("target_column")

            feature_engineering_options = request.data.get(
                "feature_engineering_options",
                {},
            )

            if not dataset_id:
                raise ValueError("Dataset ID is required.")

            if not version:
                raise ValueError("Version is required.")

            result = self.feature_engineering_service.process(
                dataset_id=dataset_id,
                version=version,
                feature_engineering_options=feature_engineering_options,
                target_column=target_column,
            )

            return success_response(
                message="Feature engineering completed successfully.",
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


class FeatureEngineeringPreviewView(APIView):
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.feature_engineering_service = (
            FeatureEngineeringService()
        )

    def post(self, request):
        try:
            dataset_id = request.data.get("dataset_id")
            version = request.data.get("version")
            target_column = request.data.get("target_column")

            feature_engineering_options = request.data.get(
                "feature_engineering_options",
                {},
            )

            if not dataset_id:
                raise ValueError("Dataset ID is required.")

            if not version:
                raise ValueError("Version is required.")

            result = self.feature_engineering_service.preview_feature_engineering(
                dataset_id=dataset_id,
                version=version,
                feature_engineering_options=feature_engineering_options,
                target_column=target_column,
            )

            return success_response(
                message="Feature engineering preview generated successfully.",
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