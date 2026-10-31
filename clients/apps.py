"""App configuration for the clients application."""
from django.apps import AppConfig


class ClientsConfig(AppConfig):
    """Configuration class for the clients Django app."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'clients'
    verbose_name = 'Gestión de Clientes'
