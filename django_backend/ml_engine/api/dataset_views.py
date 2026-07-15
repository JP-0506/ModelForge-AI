from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from ml_engine.services.dataset.dataset_service import DatasetService
from ml_engine.utils.response import success_response, error_response


# class DatasetUploadView(APIView):
#     permission_classes = [IsAuthenticated]
class DatasetUploadView(APIView):
    permission_classes = []

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.dataset_service = DatasetService()

    def post(self, request):
        try:
            uploaded_file = request.FILES.get("file")
            dataset_id = request.data.get("dataset_id")
            version = request.data.get("version")

            if not uploaded_file:
                raise ValueError("Dataset file is required.")

            if not dataset_id:
                raise ValueError("Dataset ID is required.")

            if not version:
                raise ValueError("Version is required.")

            metadata = self.dataset_service.upload_dataset(
                uploaded_file=uploaded_file,
                dataset_id=dataset_id,
                version=version,
            )

            return success_response(
                message="Dataset uploaded successfully.",
                data=metadata,
                status_code=201,
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