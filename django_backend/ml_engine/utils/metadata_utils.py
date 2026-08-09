import json


class MetadataUtils:
    """
    Utility class for saving feature metadata.
    """

    def save(
        self,
        metadata,
        metadata_path,
    ):
        """
        Save feature metadata to JSON.
        """

        with open(
            metadata_path,
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                metadata,
                file,
                indent=4,
            )