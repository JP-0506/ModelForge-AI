from rest_framework import serializers

class DeploymentSerializer(
    serializers.Serializer,
):
    """
    Serializer for model deployment requests.
    """

    model_path = serializers.CharField(
        required=True,
    )

    def validate(
        self,
        attrs,
    ):
        """
        Custom validation.
        """

        model_path = attrs.get(
            "model_path",
        )

        # ----------------------------------
        # Model Path Validation
        # ----------------------------------

        if (
            not model_path
            or
            not model_path.strip()
        ):
            raise serializers.ValidationError(
                {
                    "model_path":
                    (
                        "Model path is required."
                    )
                }
            )

        # ----------------------------------
        # Model File Validation
        # ----------------------------------

        if (
            not model_path.endswith(
                ".pkl",
            )
        ):
            raise serializers.ValidationError(
                {
                    "model_path":
                    (
                        "Only .pkl model files are supported."
                    )
                }
            )

        return attrs