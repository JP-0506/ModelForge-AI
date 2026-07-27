from rest_framework import serializers


class ValidationSerializer(
    serializers.Serializer,
):
    """
    Serializer for dataset validation request.
    """

    dataset_id = serializers.CharField(
        required=True,
    )

    version = serializers.IntegerField(
        required=True,
        min_value=1,
    )

    dataset_type = serializers.ChoiceField(
        required=True,
        choices=[
            "original",
            "cleaned",
            "feature_engineered",
        ],
    )