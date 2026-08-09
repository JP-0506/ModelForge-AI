import pandas as pd
import numpy as np


class Distribution:

    def generate_distribution(self, dataframe: pd.DataFrame):
        """
        Generate distribution analysis for numerical and categorical features.
        """
        numeric_cols = dataframe.select_dtypes(include=["number"]).columns.tolist()
        categorical_cols = dataframe.select_dtypes(exclude=["number"]).columns.tolist()

        numerical_distributions = {}
        categorical_distributions = {}

        # ------------------------------------
        # Numerical Distributions
        # ------------------------------------
        for col in numeric_cols:
            series = dataframe[col].dropna()
            if series.empty:
                continue

            min_val = float(series.min())
            max_val = float(series.max())

            # Histogram Bins (10 bins default)
            counts, bin_edges = np.histogram(series, bins=10)
            histogram_bins = []
            for i in range(len(counts)):
                histogram_bins.append({
                    "bin": f"{bin_edges[i]:.2f} - {bin_edges[i+1]:.2f}",
                    "min": round(float(bin_edges[i]), 4),
                    "max": round(float(bin_edges[i+1]), 4),
                    "count": int(counts[i]),
                })

            # Density curve points (smooth KDE simulation with 15 sample points)
            density_points = []
            if max_val > min_val:
                step = (max_val - min_val) / 14
                x_vals = [min_val + i * step for i in range(15)]
                # Simple Gaussian KDE density estimation
                std_val = float(series.std()) or 1.0
                mean_val = float(series.mean())
                for x in x_vals:
                    # Normal pdf formula for smooth visual curve
                    pdf_y = (1 / (std_val * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mean_val) / std_val) ** 2)
                    density_points.append({
                        "x": round(float(x), 4),
                        "y": round(float(pdf_y), 6),
                    })

            # Boxplot statistics
            q1 = float(series.quantile(0.25))
            median = float(series.median())
            q3 = float(series.quantile(0.75))
            iqr = q3 - q1
            lower_bound = q1 - (1.5 * iqr)
            upper_bound = q3 + (1.5 * iqr)

            # Whiskers inside bounds
            valid_series = series[(series >= lower_bound) & (series <= upper_bound)]
            whisker_min = float(valid_series.min()) if not valid_series.empty else min_val
            whisker_max = float(valid_series.max()) if not valid_series.empty else max_val

            outlier_vals = series[(series < lower_bound) | (series > upper_bound)].tolist()

            numerical_distributions[col] = {
                "histogram": histogram_bins,
                "density": density_points,
                "boxplot": {
                    "min": round(min_val, 4),
                    "whisker_min": round(whisker_min, 4),
                    "q1": round(q1, 4),
                    "median": round(median, 4),
                    "q3": round(q3, 4),
                    "whisker_max": round(whisker_max, 4),
                    "max": round(max_val, 4),
                    "lower_bound": round(lower_bound, 4),
                    "upper_bound": round(upper_bound, 4),
                    "outliers": [round(float(v), 4) for v in outlier_vals[:50]],
                    "outlier_count": len(outlier_vals),
                },
                "summary": {
                    "mean": round(float(series.mean()), 4),
                    "std": round(float(series.std()) if len(series) > 1 else 0.0, 4),
                    "variance": round(float(series.var()) if len(series) > 1 else 0.0, 4),
                    "skewness": round(float(series.skew()) if len(series) > 2 else 0.0, 4),
                    "kurtosis": round(float(series.kurt()) if len(series) > 3 else 0.0, 4),
                },
            }

        # ------------------------------------
        # Categorical Distributions
        # ------------------------------------
        for col in categorical_cols:
            series = dataframe[col].dropna().astype(str)
            if series.empty:
                continue

            val_counts = series.value_counts()
            total_count = len(series)

            bar_chart = [
                {
                    "category": str(cat),
                    "count": int(cnt),
                    "percentage": round((cnt / total_count) * 100, 2),
                }
                for cat, cnt in val_counts.head(15).items()
            ]

            categorical_distributions[col] = {
                "bar_chart": bar_chart,
                "total_count": total_count,
                "unique_count": int(series.nunique()),
            }

        return {
            "numerical": numerical_distributions,
            "categorical": categorical_distributions,
        }