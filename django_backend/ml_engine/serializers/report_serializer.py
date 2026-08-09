from rest_framework import serializers


class ReportSerializer(
    serializers.Serializer,
):
    """
    Validate report generation request.
    """

    REPORT_TYPES = [
        "training",
        "comparison",
        "deployment",
        "validation",
    ]

    report_type = serializers.ChoiceField(
        choices=REPORT_TYPES,
    )

    report_data = serializers.DictField()

    # ==================================================
    # Validate Report Request
    # ==================================================

    def validate(
        self,
        attrs,
    ):
        report_data = attrs.get(
            "report_data",
        )

        if not report_data:
            raise serializers.ValidationError(
                {
                    "report_data":
                        "Report data is required.",
                }
            )

        return attrs