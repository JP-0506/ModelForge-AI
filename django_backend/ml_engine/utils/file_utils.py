from pathlib import Path
from django.conf import settings


class FileUtils:

    def get_dataset_version_path(self, dataset_id, version):
        """
        Returns:
        media/datasets/<dataset_id>/v<version>/
        """

        path = (
            Path(settings.MEDIA_ROOT)
            / "datasets"
            / str(dataset_id)
            / f"v{version}"
        )

        path.mkdir(parents=True, exist_ok=True)

        return path

    def get_original_file_path(self, dataset_id, version):
        """
        Returns:
        media/datasets/<dataset_id>/v<version>/original.csv
        """

        return (
            self.get_dataset_version_path(
                dataset_id,
                version,
            )
            / "original.csv"
        )