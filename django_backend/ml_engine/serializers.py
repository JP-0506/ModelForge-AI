from rest_framework import serializers


class TrainingSerializer(
    serializers.Serializer,
):
    """
    Serializer for model training requests.
    """

    dataset_path = serializers.CharField(
        required=True,
    )

    model_path = serializers.CharField(
        required=True,
    )

    problem_type = serializers.ChoiceField(
        choices=[
            "regression",
            "classification",
            "clustering",
            "anomaly_detection",
            "time_series",
        ],
    )

    algorithm = serializers.CharField(
        required=True,
    )

    target_column = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    parameters = serializers.DictField(
        required=False,
        default=dict,
    )

    def validate(
        self,
        attrs,
    ):
        """
        Custom validation.
        """

        problem_type = attrs.get(
            "problem_type",
        )

        target_column = attrs.get(
            "target_column",
        )

        # ----------------------------------
        # Target Column Validation
        # ----------------------------------

        if (
            problem_type
            in [
                "regression",
                "classification",
            ]
            and
            not target_column
        ):

            raise serializers.ValidationError(
                {
                    "target_column":
                    (
                        "Target column is required "
                        "for regression and "
                        "classification."
                    )
                }
            )

        return attrs