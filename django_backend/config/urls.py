from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "message": "ModelForge AI Django Backend Running"
    })

urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),

    path("api/ml/", include("ml_engine.urls")),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )