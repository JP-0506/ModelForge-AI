from pathlib import Path
from django.conf import settings


class FileValidation:
    """
    Handles file-level validation for uploaded datasets.
    """

    def validate_extension(self, file):
        extension = Path(file.name).suffix.lower().replace(".", "")

        if extension not in settings.ALLOWED_DATASET_EXTENSIONS:
            raise ValueError(
                f"Unsupported file type '{extension}'. "
                f"Allowed file types: {', '.join(settings.ALLOWED_DATASET_EXTENSIONS)}"
            )

        return extension

    def validate_file_size(self, file):
        if file.size > settings.MAX_UPLOAD_SIZE:
            max_size_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)

            raise ValueError(
                f"Maximum allowed file size is {max_size_mb:.0f} MB."
            )

        return file.size

    def validate_empty_file(self, file):
        if file.size == 0:
            raise ValueError("Uploaded file is empty.")

        return True