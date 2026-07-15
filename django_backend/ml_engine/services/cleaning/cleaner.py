import pandas as pd

from ml_engine.utils.file_utils import FileUtils


class Cleaner:

    def __init__(self):
        self.file_utils = FileUtils()

    def clean_dataset(
        self,
        dataset_id,
        version,
        cleaning_options,
    ):
        """
        Clean dataset according to user-selected options.
        """

        # Original dataset path
        original_file_path = self.file_utils.get_original_file_path(
            dataset_id,
            version,
        )

        # Read dataset
        dataframe = self.read_dataset(original_file_path)

        # -----------------------------
        # Remove fully empty rows
        # -----------------------------
        dataframe = dataframe.dropna(how="all")

        # -----------------------------
        # Duplicate Handling
        # -----------------------------
        duplicate_option = (
            cleaning_options
            .get("duplicates", {})
            .get("method", "keep")
        )

        if duplicate_option == "remove":
            dataframe = dataframe.drop_duplicates()

        # -----------------------------
        # Missing Value Handling
        # -----------------------------
        missing_option = (
            cleaning_options
            .get("missing_values", {})
            .get("method", "none")
        )
        print("Before:", len(dataframe))

        if missing_option == "remove_rows":
            dataframe = dataframe.dropna()
            print("After:", len(dataframe))

        elif missing_option == "remove_columns":
            dataframe = dataframe.dropna(axis=1)

        elif missing_option == "mean":
            numeric_columns = dataframe.select_dtypes(
                include=["number"]
            ).columns

            for column in numeric_columns:
                dataframe[column] = dataframe[column].fillna(
                    dataframe[column].mean()
                )

        elif missing_option == "median":
            numeric_columns = dataframe.select_dtypes(
                include=["number"]
            ).columns

            for column in numeric_columns:
                dataframe[column] = dataframe[column].fillna(
                    dataframe[column].median()
                )

        elif missing_option == "mode":
            for column in dataframe.columns:
                mode = dataframe[column].mode()

                if not mode.empty:
                    dataframe[column] = dataframe[column].fillna(
                        mode.iloc[0]
                    )

        elif missing_option == "forward_fill":
            dataframe = dataframe.ffill()

        elif missing_option == "backward_fill":
            dataframe = dataframe.bfill()

        elif missing_option == "constant":
            constant_value = (
                cleaning_options
                .get("missing_values", {})
                .get("value", 0)
            )

            dataframe = dataframe.fillna(constant_value)

        elif missing_option == "custom":
            custom_values = (
                cleaning_options
                .get("missing_values", {})
                .get("values", {})
            )

            for column, value in custom_values.items():
                if column in dataframe.columns:
                    dataframe[column] = dataframe[column].fillna(
                        value
                    )

        # -----------------------------
        # Outlier Handling
        # (Will implement in next update)
        # -----------------------------

        # Save cleaned dataset
        cleaned_file_path = (
            self.file_utils.get_dataset_version_path(
                dataset_id,
                version,
            )
            / "cleaned.csv"
        )

        dataframe.to_csv(
            cleaned_file_path,
            index=False,
        )

        return {
            "cleaned_file_path": str(cleaned_file_path),
            "rows": len(dataframe),
            "columns": len(dataframe.columns),
            "processing_status": "cleaned",
        }

    def read_dataset(self, dataset_path):

        extension = str(dataset_path).split(".")[-1].lower()

        if extension == "csv":
            return pd.read_csv(dataset_path)

        elif extension in ["xlsx", "xls"]:
            return pd.read_excel(dataset_path)

        elif extension == "json":
            return pd.read_json(dataset_path)

        raise ValueError("Unsupported dataset format.") 