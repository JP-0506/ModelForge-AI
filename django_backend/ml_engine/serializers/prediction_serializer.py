from rest_framework import serializers


class PredictionSerializer(
    serializers.Serializer,
):
    """
    Validate prediction request.
    """

    model_path = serializers.CharField(
        required=True,
        allow_blank=False,
    )

    features = serializers.DictField(
        required=True,
        allow_empty=False,
    )

    feature_metadata_path = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
        default=None,
    )