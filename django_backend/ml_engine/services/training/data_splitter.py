from sklearn.model_selection import train_test_split


class DataSplitter:
    """
    Split dataset into training and testing sets
    based on the selected problem type.
    """

    def split(
        self,
        dataframe,
        target_column=None,
        problem_type=None,
        test_size=0.2,
        random_state=42,
    ):
        """
        Split dataset according to problem type.
        """

        # -------------------------------------
        # Regression / Classification
        # -------------------------------------

        if problem_type in [
            "regression",
            "classification",
        ]:

            if target_column is None:
                raise ValueError("Target column is required.")

            if target_column not in dataframe.columns:
                raise ValueError("Target column not found.")

            X = dataframe.drop(columns=[target_column])

            y = dataframe[target_column]

            stratify = y if problem_type == "classification" else None

            (
                X_train,
                X_test,
                y_train,
                y_test,
            ) = train_test_split(
                X,
                y,
                test_size=test_size,
                random_state=random_state,
                stratify=stratify,
            )

            return {
                "X_train": X_train,
                "X_test": X_test,
                "y_train": y_train,
                "y_test": y_test,
            }

        # -------------------------------------
        # Clustering
        # -------------------------------------

        elif problem_type == "clustering":

            X_train, X_test = train_test_split(
                dataframe,
                test_size=test_size,
                random_state=random_state,
            )

            return {
                "X_train": X_train,
                "X_test": X_test,
            }

        # -------------------------------------
        # Time Series
        # -------------------------------------

        elif problem_type == "time_series":

            split_index = int(len(dataframe) * (1 - test_size))

            train = dataframe.iloc[:split_index]

            test = dataframe.iloc[split_index:]

            return {
                "train": train,
                "test": test,
            }

        # -------------------------------------
        # Anomaly Detection
        # -------------------------------------

        elif problem_type == "anomaly_detection":

            X_train, X_test = train_test_split(
                dataframe,
                test_size=test_size,
                random_state=random_state,
            )

            return {
                "X_train": X_train,
                "X_test": X_test,
            }

        # -------------------------------------
        # Invalid Problem Type
        # -------------------------------------

        raise ValueError("Unsupported problem type.")
