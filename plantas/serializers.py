from rest_framework import serializers
from .models import TipoPlanta, Planta

class TipoPlantaSerializer(serializers.ModelSerializer):
    total_plantas = serializers.SerializerMethodField()

    class Meta:
        model = TipoPlanta
        fields = ['id', 'nombre', 'descripcion', 'codigo_categoria', 'activo', 'fecha_creacion', 'total_plantas']
        read_only_fields = ['fecha_creacion']

    def get_total_plantas(self, obj):
        return obj.plantas.count()

    def validate_nombre(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("El nombre debe tener al menos 3 caracteres.")
        return value.strip().title()

    def validate_codigo_categoria(self, value):
        if value:
            if not value.replace('-', '').replace('_', '').isalnum():
                raise serializers.ValidationError("El código solo puede contener letras, números, guiones y guiones bajos.")
            return value.upper()
        return value

class PlantaSerializer(serializers.ModelSerializer):
    tipo_planta_nombre = serializers.CharField(source='tipo_planta.nombre', read_only=True)
    tipo_planta_codigo = serializers.CharField(source='tipo_planta.codigo_categoria', read_only=True)
    tipo_planta_detalle = TipoPlantaSerializer(source='tipo_planta', read_only=True)

    class Meta:
        model = Planta
        fields = [
            'id', 'nombre_comun', 'especie_cientifica', 'cuidados', 
            'precio', 'imagen', 'tipo_planta', 
            'tipo_planta_nombre', 'tipo_planta_codigo', 'tipo_planta_detalle'
        ]

class PlantaCreateSerializer(serializers.ModelSerializer):
    tipo_planta = serializers.PrimaryKeyRelatedField(
        queryset=TipoPlanta.objects.filter(activo=True),
        help_text="ID del tipo de planta existente."
    )

    class Meta:
        model = Planta
        fields = ['nombre_comun', 'especie_cientifica', 'cuidados', 'precio', 'imagen', 'tipo_planta']

    def validate_precio(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return value

    def validate_nombre_comun(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("El nombre común debe tener al menos 2 caracteres.")
        return value.strip()

    def validate_especie_cientifica(self, value):
        if value:
            return value.strip()
        return value

class PlantaConTipoSerializer(serializers.ModelSerializer):
    tipo_planta = TipoPlantaSerializer()

    class Meta:
        model = Planta
        fields = ['id', 'nombre_comun', 'especie_cientifica', 'cuidados', 'precio', 'imagen', 'tipo_planta']

    def create(self, validated_data):
        tipo_planta_data = validated_data.pop('tipo_planta')
        
        tipo_planta, created = TipoPlanta.objects.get_or_create(
            nombre=tipo_planta_data['nombre'],
            defaults={
                'descripcion': tipo_planta_data.get('descripcion', ''),
                'codigo_categoria': tipo_planta_data.get('codigo_categoria', ''),
            }
        )
        
        planta = Planta.objects.create(tipo_planta=tipo_planta, **validated_data)
        return planta

    def update(self, instance, validated_data):
        tipo_planta_data = validated_data.pop('tipo_planta', None)
        
        if tipo_planta_data:
            tipo_planta = instance.tipo_planta
            for attr, value in tipo_planta_data.items():
                setattr(tipo_planta, attr, value)
            tipo_planta.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class PlantaImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Planta
        fields = ['id', 'imagen']

class PlantaListSerializer(serializers.ModelSerializer):
    tipo_planta_nombre = serializers.CharField(source='tipo_planta.nombre', read_only=True)

    class Meta:
        model = Planta
        fields = ['id', 'nombre_comun', 'precio', 'imagen', 'tipo_planta_nombre']