from rest_framework import serializers


class ComparisonSerializer(
    serializers.Serializer,
):
    """
    Validate Model Comparison Request.
    """

    problem_type = serializers.ChoiceField(
        choices=[
            "regression",
            "classification",
            "clustering",
            "time_series",
            "anomaly_detection",
        ],
        required=True,
    )

    models = serializers.ListField(
        child=serializers.DictField(),
        required=True,
        allow_empty=False,
    )

    def validate_models(
        self,
        value,
    ):
        """
        Validate each model.
        """

        required_fields = [
            "experiment_id",
            "algorithm",
            "model_name",
            "evaluation",
        ]

        for index, model in enumerate(value):

            for field in required_fields:

                if field not in model:
                    raise serializers.ValidationError(
                        f"Model at index {index} is missing '{field}'."
                    )

            if not isinstance(
                model["evaluation"],
                dict,
            ):
                raise serializers.ValidationError(
                    f"'evaluation' must be an object for model at index {index}."
                )

        return value
