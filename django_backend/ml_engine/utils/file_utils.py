from pathlib import Path

from django.conf import settings


class FileUtils:

    def get_dataset_version_path(
        self,
        dataset_id,
        version,
    ):
        """
        Returns:
        media/datasets/<dataset_id>/v<version>/
        """

        path = Path(settings.MEDIA_ROOT) / "datasets" / str(dataset_id) / f"v{version}"

        path.mkdir(
            parents=True,
            exist_ok=True,
        )

        return path

    # ==========================================
    # Original Dataset
    # ==========================================

    def get_original_file_path(
        self,
        dataset_id,
        version,
    ):
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

    # ==========================================
    # Dataset File Path
    # ==========================================

    def get_dataset_file_path(
        self,
        dataset_id,
        version,
        dataset_type,
    ):
        """
        Returns dataset file path based on dataset type.

        Supported dataset types:
        - original
        - cleaned
        - feature_engineered
        """

        dataset_files = {
            "original": "original.csv",
            "cleaned": "cleaned.csv",
            "feature_engineered": "feature_engineered.csv",
        }

        if dataset_type not in dataset_files:
            raise ValueError(f"Unsupported dataset type: {dataset_type}")

        return (
            self.get_dataset_version_path(
                dataset_id,
                version,
            )
            / dataset_files[dataset_type]
        )
