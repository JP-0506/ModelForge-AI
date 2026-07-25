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