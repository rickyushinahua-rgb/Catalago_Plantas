"""
Django settings for backend project.
"""

import os
import dj_database_url
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent


# ==========================
# SEGURIDAD
# ==========================

SECRET_KEY = config(
    'SECRET_KEY',
    default='django-insecure-clave-local-desarrollo'
)

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = [
    'catalogo-plantas-backend.onrender.com',
    '127.0.0.1',
    'localhost',
    '.onrender.com',
]


# ==========================
# APLICACIONES
# ==========================

INSTALLED_APPS = [
    # Cloudinary
    'cloudinary_storage',
    'cloudinary',

    # Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Librerías externas
    'rest_framework',
    'corsheaders',

    # App propia
    'plantas',
]


# ==========================
# MIDDLEWARE
# ==========================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',

    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# ==========================
# CORS
# ==========================

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://catalogo-plantas-frontend.onrender.com',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://catalogo-plantas-frontend.onrender.com',
    'https://catalogo-plantas-backend.onrender.com',
    'https://*.onrender.com',
]


# ==========================
# BASE DE DATOS
# ==========================

DATABASES = {
    'default': dj_database_url.config(
        default='postgresql://postgres:postgres@localhost:5432/catalago_plantas',
        conn_max_age=600
    )
}


# ==========================
# VALIDACIÓN DE CONTRASEÑAS
# ==========================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ==========================
# IDIOMA Y ZONA HORARIA
# ==========================

LANGUAGE_CODE = 'es-pe'

TIME_ZONE = 'America/Lima'

USE_I18N = True

USE_TZ = True


# ==========================
# ARCHIVOS ESTÁTICOS
# ==========================

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Necesario para que django-cloudinary-storage no falle en collectstatic
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'


# ==========================
# CLOUDINARY PARA IMÁGENES
# ==========================

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': config('CLOUDINARY_CLOUD_NAME', default=''),
    'API_KEY': config('CLOUDINARY_API_KEY', default=''),
    'API_SECRET': config('CLOUDINARY_API_SECRET', default=''),
}

STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

MEDIA_URL = '/media/'


# ==========================
# DEFAULT AUTO FIELD
# ==========================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'