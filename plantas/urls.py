from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlantaViewSet, TipoPlantaViewSet

router = DefaultRouter()
router.register(r'plantas', PlantaViewSet, basename='planta')
router.register(r'tipos-planta', TipoPlantaViewSet, basename='tipoplanta')

urlpatterns = [
    path('', include(router.urls)),
]