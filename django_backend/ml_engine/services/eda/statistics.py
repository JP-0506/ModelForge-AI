import pandas as pd
import numpy as np


class Statistics:

    def generate_statistics(self, dataframe: pd.DataFrame):
        """
        Generate complete descriptive statistics for numerical and categorical features.
        """
        rows = int(len(dataframe))
        cols = int(len(dataframe.columns))

        numeric_cols = dataframe.select_dtypes(include=["number"]).columns.tolist()
        categorical_cols = dataframe.select_dtypes(exclude=["number"]).columns.tolist()

        missing_counts = dataframe.isnull().sum().to_dict()
        total_missing = int(sum(missing_counts.values()))
        duplicate_rows = int(dataframe.duplicated().sum())

        memory_usage_bytes = int(dataframe.memory_usage(deep=True).sum())
        memory_usage_str = self._format_memory(memory_usage_bytes)

        # ----------------------------------
        # Numeric Statistics
        # ----------------------------------
        numeric_statistics = {}
        for col in numeric_cols:
            series = dataframe[col].dropna()
            if series.empty:
                continue

            q1 = float(series.quantile(0.25))
            median = float(series.median())
            q3 = float(series.quantile(0.75))
            iqr = float(q3 - q1)
            mean_val = float(series.mean())
            std_val = float(series.std()) if len(series) > 1 else 0.0
            var_val = float(series.var()) if len(series) > 1 else 0.0
            min_val = float(series.min())
            max_val = float(series.max())
            val_range = float(max_val - min_val)

            # Mode computation
            mode_series = series.mode()
            mode_val = float(mode_series.iloc[0]) if not mode_series.empty else min_val

            # Skewness & Kurtosis
            skew_val = float(series.skew()) if len(series) > 2 else 0.0
            kurt_val = float(series.kurt()) if len(series) > 3 else 0.0

            numeric_statistics[col] = {
                "count": int(series.count()),
                "mean": round(mean_val, 4),
                "median": round(median, 4),
                "mode": round(mode_val, 4),
                "std": round(std_val, 4),
                "variance": round(var_val, 4),
                "min": round(min_val, 4),
                "max": round(max_val, 4),
                "range": round(val_range, 4),
                "q1": round(q1, 4),
                "q3": round(q3, 4),
                "iqr": round(iqr, 4),
                "skewness": round(skew_val, 4),
                "kurtosis": round(kurt_val, 4),
            }

        # ----------------------------------
        # Categorical Statistics
        # ----------------------------------
        categorical_statistics = {}
        for col in categorical_cols:
            series = dataframe[col].dropna().astype(str)
            if series.empty:
                continue

            val_counts = series.value_counts()
            unique_count = int(series.nunique())
            most_frequent = str(val_counts.index[0]) if not val_counts.empty else ""
            most_frequent_count = int(val_counts.iloc[0]) if not val_counts.empty else 0

            # Top 10 categories breakdown
            top_categories = [
                {"category": str(cat), "count": int(cnt), "percentage": round((cnt / len(series)) * 100, 2)}
                for cat, cnt in val_counts.head(10).items()
            ]

            categorical_statistics[col] = {
                "unique_values": unique_count,
                "most_frequent_value": most_frequent,
                "frequency": most_frequent_count,
                "top_categories": top_categories,
                "value_counts": {str(k): int(v) for k, v in val_counts.head(20).items()},
            }

        return {
            "dataset_summary": {
                "total_rows": rows,
                "total_columns": cols,
                "numerical_features_count": len(numeric_cols),
                "categorical_features_count": len(categorical_cols),
                "total_missing_values": total_missing,
                "duplicate_rows": duplicate_rows,
                "memory_usage": memory_usage_str,
                "memory_usage_bytes": memory_usage_bytes,
            },
            "missing_values": missing_counts,
            "numeric_statistics": numeric_statistics,
            "categorical_statistics": categorical_statistics,
            "data_types": {col: str(dtype) for col, dtype in dataframe.dtypes.items()},
        }

    def _format_memory(self, num_bytes):
        for unit in ["B", "KB", "MB", "GB"]:
            if abs(num_bytes) < 1024.0:
                return f"{num_bytes:.2f} {unit}"
            num_bytes /= 1024.0
        return f"{num_bytes:.2f} TB"