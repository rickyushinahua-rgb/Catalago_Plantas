from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Planta, TipoPlanta
from .serializers import (
    PlantaSerializer,
    PlantaCreateSerializer,
    PlantaListSerializer,
    PlantaImagenSerializer,
    TipoPlantaSerializer,
)

class TipoPlantaViewSet(viewsets.ModelViewSet):
    queryset = TipoPlanta.objects.filter(activo=True)
    serializer_class = TipoPlantaSerializer

class PlantaViewSet(viewsets.ModelViewSet):
    queryset = Planta.objects.select_related('tipo_planta').all()
    parser_classes = [MultiPartParser, FormParser]
    filterset_fields = ['tipo_planta', 'nombre_comun']

    def get_serializer_class(self):
        if self.action == 'list':
            return PlantaListSerializer
        if self.action in ['create', 'update']:
            return PlantaCreateSerializer
        if self.action == 'partial_update':
            return PlantaImagenSerializer
        return PlantaSerializer

    @action(detail=True, methods=['patch'], url_path='update-imagen')
    def update_imagen(self, request, pk=None):
        planta = self.get_object()
        serializer = PlantaImagenSerializer(planta, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)