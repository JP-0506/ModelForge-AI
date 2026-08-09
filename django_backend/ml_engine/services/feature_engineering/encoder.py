import pandas as pd


class Encoder:
    """
    Apply categorical feature encoding.
    Supported options: none, one_hot, label, ordinal
    """

    # def apply_encoding(
    #     self,
    #     dataframe,
    #     encoding_option,
    #     columns=None,
    # ):
    def apply_encoding(
        self,
        dataframe,
        encoding_option,
        columns=None,
        target_column=None,
    ):
        """
        Apply encoding based on user selection.
        """
        encoding_metadata = {
            "method": encoding_option,
            "columns": {},
        }

        if not encoding_option or encoding_option == "none":
            return {
                "dataframe": dataframe,
                "encoding_metadata": encoding_metadata,
            }

        # Select target categorical columns
        if columns and isinstance(columns, list) and len(columns) > 0:
            categorical_columns = [
                col for col in columns if col in dataframe.columns
            ]
        else:
            categorical_columns = dataframe.select_dtypes(
                include=["object", "category"]
            ).columns.tolist()

        # ----------------------------------
        # Do not encode target column
        # ----------------------------------
        if target_column in categorical_columns:
            categorical_columns.remove(target_column)

        if len(categorical_columns) == 0:
            return {
                "dataframe": dataframe,
                "encoding_metadata": encoding_metadata,
            }

        # =====================================
        # One-Hot Encoding
        # =====================================
        if encoding_option == "one_hot":
            for column in categorical_columns:
                encoding_metadata["columns"][column] = sorted(
                    [str(x) for x in dataframe[column].dropna().unique().tolist()]
                )

            dataframe = pd.get_dummies(
                dataframe,
                columns=categorical_columns,
                dtype=int,
            )

            return {
                "dataframe": dataframe,
                "encoding_metadata": encoding_metadata,
            }

        # =====================================
        # Label Encoding
        # =====================================
        elif encoding_option == "label":
            for column in categorical_columns:
                categories = sorted([str(x) for x in dataframe[column].dropna().unique().tolist()])
                encoding_metadata["columns"][column] = categories
                dataframe[column] = dataframe[column].astype("category").cat.codes

            return {
                "dataframe": dataframe,
                "encoding_metadata": encoding_metadata,
            }

        # =====================================
        # Ordinal Encoding
        # =====================================
        elif encoding_option == "ordinal":
            for column in categorical_columns:
                categories = sorted([str(x) for x in dataframe[column].dropna().unique().tolist()])
                encoding_metadata["columns"][column] = categories
                dataframe[column] = dataframe[column].astype("category").cat.codes

            return {
                "dataframe": dataframe,
                "encoding_metadata": encoding_metadata,
            }

        raise ValueError("Invalid encoding option.")

