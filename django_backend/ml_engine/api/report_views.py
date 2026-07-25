# from django.http import HttpResponse

# from rest_framework import status
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework.permissions import AllowAny

# import traceback

# from ml_engine.serializers.report_serializer import (
#     ReportSerializer,
# )
# from ml_engine.services.report.report_service import (
#     ReportService,
# )


# class ReportAPIView(APIView):
#     """
#     Generate Machine Learning reports.
#     """

#     permission_classes = [
#         AllowAny,
#     ]

#     def __init__(
#         self,
#         **kwargs,
#     ):
#         super().__init__(
#             **kwargs,
#         )

#         self.report_service = (
#             ReportService()
#         )

#     # ==================================================
#     # Generate Report
#     # ==================================================

#     def post(
#         self,
#         request,
#     ):
#         """
#         Generate report.
#         """

#         try:

#             # ------------------------------------------
#             # Validate Request
#             # ------------------------------------------

#             serializer = ReportSerializer(
#                 data=request.data,
#             )

#             serializer.is_valid(
#                 raise_exception=True,
#             )

#             # ------------------------------------------
#             # Generate Report
#             # ------------------------------------------

#             pdf_buffer, file_name = (
#                 self.report_service.generate_report(
#                     serializer.validated_data,
#                 )
#             )

#             # ------------------------------------------
#             # Return PDF
#             # ------------------------------------------

#             response = HttpResponse(
#                 pdf_buffer.getvalue(),
#                 content_type="application/pdf",
#             )

#             response[
#                 "Content-Disposition"
#             ] = (
#                 f'attachment; filename="{file_name}"'
#             )

#             return response

#         except Exception as error:

#             traceback.print_exc()

#             return Response(
#                 {
#                     "success": False,
#                     "message": str(
#                         error,
#                     ),
#                 },
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

from django.http import HttpResponse

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

import traceback

from ml_engine.serializers.report_serializer import (
    ReportSerializer,
)

from ml_engine.services.report.report_service import (
    ReportService,
)


class ReportAPIView(APIView):
    """
    Generate Machine Learning reports.
    """

    permission_classes = [
        AllowAny,
    ]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.report_service = ReportService()

    # ==================================================
    # Generate Report
    # ==================================================

    def post(
        self,
        request,
    ):
        """
        Generate report.
        """

        try:

            # ------------------------------------------
            # Validate Request
            # ------------------------------------------

            serializer = ReportSerializer(
                data=request.data,
            )

            serializer.is_valid(
                raise_exception=True,
            )

            # ------------------------------------------
            # Extract Request Data
            # ------------------------------------------

            report_type = serializer.validated_data.get(
                "report_type",
            )

            report_data = serializer.validated_data.get(
                "report_data",
            )

            # ------------------------------------------
            # Generate Report
            # ------------------------------------------

            pdf_buffer, file_name = self.report_service.generate_report(
                report_type=report_type,
                report_data=report_data,
            )

            # ------------------------------------------
            # Return PDF Response
            # ------------------------------------------

            response = HttpResponse(
                pdf_buffer.getvalue(),
                content_type="application/pdf",
            )

            response["Content-Disposition"] = f'attachment; filename="{file_name}"'

            return response

        except Exception as error:

            traceback.print_exc()

            return Response(
                {
                    "success": False,
                    "message": str(
                        error,
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
