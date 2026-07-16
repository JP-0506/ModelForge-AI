from sklearn.preprocessing import (
    StandardScaler,
    MinMaxScaler,
    RobustScaler,
)


class Scaler:

    def apply_scaling(
        self,
        dataframe,
        scaling_option,
    ):
        """
        Apply scaling based on user selection.
        """

        if scaling_option == "none":
            return dataframe

        numeric_columns = dataframe.select_dtypes(
            include=["number"]
        ).columns

        if len(numeric_columns) == 0:
            return dataframe

        scaler = None

        if scaling_option == "standard":
            scaler = StandardScaler()

        elif scaling_option == "minmax":
            scaler = MinMaxScaler()

        elif scaling_option == "robust":
            scaler = RobustScaler()

        else:
            raise ValueError("Invalid scaling option.")

        dataframe[numeric_columns] = scaler.fit_transform(
            dataframe[numeric_columns]
        )

        return dataframe