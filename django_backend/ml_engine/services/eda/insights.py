class Insights:

    def generate_insights(self, statistics, correlation, distribution, outlier):
        """
        Generate rule-based automated insights from EDA analysis.
        """
        insights_list = []
        recommendations = []

        summary = statistics.get("dataset_summary", {})
        total_rows = summary.get("total_rows", 0)

        # -------------------------------------
        # 1. Missing Values Insight
        # -------------------------------------
        missing_dict = statistics.get("missing_values", {})
        max_missing_col = None
        max_missing_pct = 0.0

        for col, count in missing_dict.items():
            if total_rows > 0:
                pct = (count / total_rows) * 100
                if pct > max_missing_pct:
                    max_missing_pct = pct
                    max_missing_col = col

        if max_missing_col and max_missing_pct > 0:
            insights_list.append({
                "type": "missing_values",
                "title": "Highest Missing Values",
                "description": f"Feature '{max_missing_col}' has the highest missing values ({max_missing_pct:.2f}%).",
                "severity": "warning" if max_missing_pct > 20 else "info",
            })
            if max_missing_pct > 30:
                recommendations.append(f"Consider dropping or imputing feature '{max_missing_col}' ({max_missing_pct:.1f}% missing).")

        # -------------------------------------
        # 2. Skewness Insight
        # -------------------------------------
        num_dists = distribution.get("numerical", {})
        max_skew_col = None
        max_skew_val = 0.0

        for col, data in num_dists.items():
            skew = abs(data.get("summary", {}).get("skewness", 0.0))
            if skew > max_skew_val:
                max_skew_val = skew
                max_skew_col = col

        if max_skew_col and max_skew_val > 1.0:
            insights_list.append({
                "type": "skewness",
                "title": "Most Skewed Feature",
                "description": f"Feature '{max_skew_col}' is highly skewed with a skewness coefficient of {max_skew_val:.2f}.",
                "severity": "warning",
            })
            recommendations.append(f"Feature '{max_skew_col}' is highly skewed. Consider log or power transformation.")

        # -------------------------------------
        # 3. Variance Insight
        # -------------------------------------
        max_var_col = None
        max_var_val = 0.0

        for col, data in num_dists.items():
            variance = data.get("summary", {}).get("variance", 0.0)
            if variance > max_var_val:
                max_var_val = variance
                max_var_col = col

        if max_var_col:
            insights_list.append({
                "type": "variance",
                "title": "Largest Variance",
                "description": f"Feature '{max_var_col}' has the largest variance ({max_var_val:.2f}).",
                "severity": "info",
            })

        # -------------------------------------
        # 4. Correlation Insight
        # -------------------------------------
        high_corr_pairs = correlation.get("strong_positive_correlations", []) + correlation.get("strong_negative_correlations", [])
        if high_corr_pairs:
            top_pair = high_corr_pairs[0]
            insights_list.append({
                "type": "correlation",
                "title": "Highest Correlation Pair",
                "description": f"Features '{top_pair['feature_1']}' and '{top_pair['feature_2']}' are strongly correlated ({top_pair['correlation']:.2f}).",
                "severity": "info",
            })
            recommendations.append(f"High collinearity between '{top_pair['feature_1']}' and '{top_pair['feature_2']}'. Consider dropping one before model training.")

        # -------------------------------------
        # 5. Outliers Insight
        # -------------------------------------
        outlier_sum = outlier.get("outlier_summary", {})
        max_outlier_col = None
        max_outlier_cnt = 0
        max_outlier_pct = 0.0

        for col, data in outlier_sum.items():
            if data["count"] > max_outlier_cnt:
                max_outlier_cnt = data["count"]
                max_outlier_pct = data["percentage"]
                max_outlier_col = col

        if max_outlier_col and max_outlier_cnt > 0:
            insights_list.append({
                "type": "outliers",
                "title": "Highest Outliers Count",
                "description": f"Feature '{max_outlier_col}' contains {max_outlier_cnt} outliers ({max_outlier_pct:.2f}% of rows).",
                "severity": "warning" if max_outlier_pct > 5 else "info",
            })

        # -------------------------------------
        # 6. Cardinality Insight
        # -------------------------------------
        cat_stats = statistics.get("categorical_statistics", {})
        max_card_col = None
        max_card_val = 0

        for col, data in cat_stats.items():
            unique_cnt = data.get("unique_values", 0)
            if unique_cnt > max_card_val:
                max_card_val = unique_cnt
                max_card_col = col

        if max_card_col:
            insights_list.append({
                "type": "cardinality",
                "title": "Highest Cardinality Feature",
                "description": f"Categorical feature '{max_card_col}' has {max_card_val} unique categories.",
                "severity": "info",
            })

        # Quality observation default if dataset is clean
        if not recommendations:
            recommendations.append("Dataset features show balanced distribution and healthy metrics for model training.")

        return {
            "insights": insights_list,
            "recommendations": recommendations,
        }