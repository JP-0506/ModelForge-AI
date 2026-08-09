class MetadataGenerator:
    """
    Generate metadata for the feature engineered dataset.
    """

    def generate(
        self,
        original_columns,
        engineered_columns,
        target_column,
        feature_engineering_options,
        encoding_metadata,
    ):
        """
        Generate feature metadata.

        Parameters
        ----------
        original_columns : list
            Columns before feature engineering.

        engineered_columns : list
            Columns after feature engineering.

        target_column : str
            Target column used for training.

        feature_engineering_options : dict
            Feature engineering options selected by the user.

        Returns
        -------
        dict
            Feature metadata.
        """

        # ---------------------------------------
        # Feature Order
        # ---------------------------------------

        feature_order = [
            column for column in engineered_columns if column != target_column
        ]

        # ---------------------------------------
        # Metadata
        # ---------------------------------------

        metadata = {
            "original_features": original_columns,
            "engineered_features": engineered_columns,
            "target_column": target_column,
            "feature_order": feature_order,
            "transformations": {
                "encoding": feature_engineering_options.get(
                    "encoding",
                    "none",
                ),
                "feature_generation": feature_engineering_options.get(
                    "feature_generation",
                    [],
                ),
                "transformation": feature_engineering_options.get(
                    "transformation",
                    {},
                ),
                "feature_selection": feature_engineering_options.get(
                    "feature_selection",
                    {},
                ),
            },
            "encoding_metadata": encoding_metadata,
        }

        return metadata
