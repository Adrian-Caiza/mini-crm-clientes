"""
Data models for the clients application.

Defines the Client model with all required and optional fields,
plus automatic timestamp fields.
"""
from django.db import models


class Client(models.Model):
    """
    Represents a CRM client record.

    Required fields: name, email, status.
    Optional fields: company, phone.
    Automatic timestamps: created_at, updated_at.
    """

    # Status choices as class-level constants for reuse
    STATUS_PROSPECTO = 'Prospecto'
    STATUS_CLIENTE   = 'Cliente'
    STATUS_INACTIVO  = 'Inactivo'

    STATUS_CHOICES = [
        (STATUS_PROSPECTO, 'Prospecto'),
        (STATUS_CLIENTE,   'Cliente'),
        (STATUS_INACTIVO,  'Inactivo'),
    ]

    # --- Required fields ---
    name   = models.CharField(max_length=150, verbose_name='Nombre completo')
    email  = models.EmailField(unique=True, verbose_name='Correo electrónico')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PROSPECTO,
        verbose_name='Estado',
    )

    # --- Optional fields ---
    company = models.CharField(
        max_length=150,
        blank=True,
        default='',
        verbose_name='Empresa',
    )
    phone = models.CharField(
        max_length=30,
        blank=True,
        default='',
        verbose_name='Teléfono',
    )

    # --- Automatic timestamps ---
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Última actualización')

    class Meta:
        verbose_name        = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering            = ['-created_at']

    def __str__(self) -> str:
        company_info = f' — {self.company}' if self.company else ''
        return f'{self.name}{company_info} ({self.status})'
