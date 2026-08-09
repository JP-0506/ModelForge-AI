from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from ml_engine.services.cleaning.cleaner import Cleaner
from ml_engine.utils.response import success_response, error_response


class DatasetCleaningView(APIView):
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.cleaner = Cleaner()

    def post(self, request):
        try:
            dataset_id = request.data.get("dataset_id")
            version = request.data.get("version")
            cleaning_options = request.data.get(
                "cleaning_options",
                {},
            )

            if not dataset_id:
                raise ValueError("Dataset ID is required.")

            if not version:
                raise ValueError("Version is required.")

            result = self.cleaner.clean_dataset(
                dataset_id=dataset_id,
                version=version,
                cleaning_options=cleaning_options,
            )

            return success_response(
                message="Dataset cleaned successfully.",
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


class DatasetCleaningPreviewView(APIView):
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.cleaner = Cleaner()

    def post(self, request):
        try:
            dataset_id = request.data.get("dataset_id")
            version = request.data.get("version")
            cleaning_options = request.data.get(
                "cleaning_options",
                {},
            )

            if not dataset_id:
                raise ValueError("Dataset ID is required.")

            if not version:
                raise ValueError("Version is required.")

            result = self.cleaner.preview_dataset_cleaning(
                dataset_id=dataset_id,
                version=version,
                cleaning_options=cleaning_options,
            )

            return success_response(
                message="Dataset cleaning preview generated successfully.",
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