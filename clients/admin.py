"""
Admin configuration for the clients application.

Registers the Client model with a rich admin interface including
search, filter, and display customizations.
"""
from django.contrib import admin

from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    """
    Django Admin configuration for the Client model.

    Features:
    - List display with the most relevant fields.
    - Search by name, email, and company.
    - Filter sidebar by status.
    - Read-only timestamp fields.
    - Organized fieldsets for the edit view.
    """

    # --- List view ---
    list_display   = ('name', 'company', 'email', 'phone', 'status', 'created_at')
    list_filter    = ('status', 'created_at')
    search_fields  = ('name', 'email', 'company')
    ordering       = ('-created_at',)
    list_per_page  = 25

    # --- Detail / Edit view ---
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Información principal', {
            'fields': ('name', 'email', 'status'),
        }),
        ('Información adicional', {
            'fields': ('company', 'phone'),
            'classes': ('collapse',),
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
