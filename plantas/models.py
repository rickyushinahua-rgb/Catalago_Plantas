from django.db import models

class TipoPlanta(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    codigo_categoria = models.CharField(max_length=50, blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nombre']  # Ordenar alfabéticamente
        verbose_name = 'Tipo de Planta'
        verbose_name_plural = 'Tipos de Plantas'

    def __str__(self):
        return self.nombre

class Planta(models.Model):
    nombre_comun = models.CharField(max_length=200)
    especie_cientifica = models.CharField(max_length=200, blank=True, null=True)
    cuidados = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    imagen = models.ImageField(upload_to='plantas_fotos/', blank=True, null=True)
    
    tipo_planta = models.ForeignKey(
        TipoPlanta, 
        on_delete=models.PROTECT, 
        related_name='plantas'
    )

    class Meta:
        ordering = ['nombre_comun']
        verbose_name = 'Planta'
        verbose_name_plural = 'Plantas' 

    def __str__(self):
        return self.nombre_comun