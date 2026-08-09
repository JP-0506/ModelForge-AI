import pandas as pd
import numpy as np


class Outlier:

    def detect_outliers(self, dataframe: pd.DataFrame):
        """
        Detect outliers using the IQR method without modifying the dataset.
        """
        numeric_cols = dataframe.select_dtypes(include=["number"]).columns.tolist()

        outlier_summary = {}
        total_dataset_rows = len(dataframe)
        total_outliers_count = 0
        affected_columns = []
        outlier_table = []
        scatter_data = {}

        for col in numeric_cols:
            series = dataframe[col].dropna()
            if series.empty:
                continue

            q1 = float(series.quantile(0.25))
            q3 = float(series.quantile(0.75))
            iqr = q3 - q1

            lower_bound = q1 - (1.5 * iqr)
            upper_bound = q3 + (1.5 * iqr)

            outlier_series = series[(series < lower_bound) | (series > upper_bound)]
            outlier_cnt = int(len(outlier_series))
            outlier_percentage = round((outlier_cnt / total_dataset_rows) * 100, 2) if total_dataset_rows > 0 else 0.0

            if outlier_cnt > 0:
                affected_columns.append(col)
                total_outliers_count += outlier_cnt

                for idx, val in outlier_series.head(10).items():
                    outlier_table.append({
                        "row_index": int(idx),
                        "column": col,
                        "value": round(float(val), 4),
                        "lower_bound": round(lower_bound, 4),
                        "upper_bound": round(upper_bound, 4),
                        "bound_type": "Lower" if val < lower_bound else "Upper",
                    })

            # Generate sample scatter points for visual plot (up to 100 sample points)
            sample_step = max(1, len(series) // 100)
            sample_series = series.iloc[::sample_step].head(100)
            col_scatter_points = []
            for idx, val in sample_series.items():
                is_out = bool(val < lower_bound or val > upper_bound)
                col_scatter_points.append({
                    "index": int(idx),
                    "value": round(float(val), 4),
                    "is_outlier": is_out,
                })
            scatter_data[col] = col_scatter_points

            outlier_summary[col] = {
                "column": col,
                "count": outlier_cnt,
                "percentage": outlier_percentage,
                "lower_bound": round(lower_bound, 4),
                "upper_bound": round(upper_bound, 4),
                "q1": round(q1, 4),
                "median": round(float(series.median()), 4),
                "q3": round(q3, 4),
                "iqr": round(iqr, 4),
                "min": round(float(series.min()), 4),
                "max": round(float(series.max()), 4),
                "sample_values": [round(float(v), 4) for v in outlier_series.head(20).tolist()],
            }

        total_possible_values = total_dataset_rows * len(numeric_cols) if len(numeric_cols) > 0 else 1
        overall_percentage = round((total_outliers_count / total_possible_values) * 100, 2)

        return {
            "total_outliers": total_outliers_count,
            "overall_percentage": overall_percentage,
            "affected_columns_count": len(affected_columns),
            "affected_columns": affected_columns,
            "outlier_summary": outlier_summary,
            "outlier_table": outlier_table,
            "scatter_data": scatter_data,
        }
