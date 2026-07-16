from sklearn.feature_selection import (
    VarianceThreshold,
    SelectKBest,
    f_classif,
    f_regression,
    RFE,
)
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor


class Selector:

    def apply_feature_selection(
        self,
        dataframe,
        target_column,
        problem_type,
        selection_option,
        k=5,
    ):
        """
        Apply feature selection based on user selection.
        """

        if selection_option == "none":
            return dataframe

        if target_column not in dataframe.columns:
            raise ValueError("Target column not found.")

        X = dataframe.drop(columns=[target_column])
        y = dataframe[target_column]

        # Keep only numeric features
        X = X.select_dtypes(include=["number"])

        if X.empty:
            raise ValueError(
                "No numeric features available for feature selection."
            )

        # ----------------------------
        # Variance Threshold
        # ----------------------------
        if selection_option == "variance_threshold":

            selector = VarianceThreshold()

            X_selected = selector.fit_transform(X)

            selected_columns = X.columns[
                selector.get_support()
            ]

        # ----------------------------
        # SelectKBest
        # ----------------------------
        elif selection_option == "select_k_best":

            score_function = (
                f_classif
                if problem_type == "classification"
                else f_regression
            )

            selector = SelectKBest(
                score_func=score_function,
                k=min(k, len(X.columns)),
            )

            X_selected = selector.fit_transform(X, y)

            selected_columns = X.columns[
                selector.get_support()
            ]

        # ----------------------------
        # Recursive Feature Elimination
        # ----------------------------
        elif selection_option == "rfe":

            estimator = (
                RandomForestClassifier(random_state=42)
                if problem_type == "classification"
                else RandomForestRegressor(random_state=42)
            )

            selector = RFE(
                estimator=estimator,
                n_features_to_select=min(k, len(X.columns)),
            )

            X_selected = selector.fit_transform(X, y)

            selected_columns = X.columns[
                selector.get_support()
            ]

        else:
            raise ValueError("Invalid feature selection option.")

        # Build new dataframe
        result = X[selected_columns].copy()

        result[target_column] = y.values

        return result