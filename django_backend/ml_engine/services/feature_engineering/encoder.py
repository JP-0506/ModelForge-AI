import pandas as pd


class Encoder:

    def apply_encoding(
        self,
        dataframe,
        encoding_option,
    ):
        """
        Apply encoding based on user selection.
        """

        if encoding_option == "none":
            return dataframe

        categorical_columns = dataframe.select_dtypes(
            include=["object", "category"]
        ).columns

        if len(categorical_columns) == 0:
            return dataframe

        if encoding_option == "one_hot":
            return pd.get_dummies(
                dataframe,
                columns=categorical_columns,
                dtype=int,
            )

        elif encoding_option == "label":
            for column in categorical_columns:
                dataframe[column] = (
                    dataframe[column]
                    .astype("category")
                    .cat.codes
                )

            return dataframe

        elif encoding_option == "ordinal":
            for column in categorical_columns:
                dataframe[column] = (
                    dataframe[column]
                    .astype("category")
                    .cat.codes
                )

            return dataframe

        raise ValueError("Invalid encoding option.")