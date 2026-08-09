from rest_framework import serializers


class ValidationSerializer(serializers.Serializer):
    """
    Serializer for dataset validation request.
    """

    dataset_id = serializers.CharField(
        required=True,
    )

    version = serializers.IntegerField(
        required=False,
        default=1,
        min_value=1,
    )

    dataset_type = serializers.ChoiceField(
        required=False,
        default="original",
        choices=[
            "original",
            "cleaned",
            "feature_engineered",
        ],
    )