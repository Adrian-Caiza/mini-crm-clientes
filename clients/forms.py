"""
Forms for the clients application.

Provides ModelForm with custom field-level validation.
"""
import re

from django import forms

from .models import Client


class ClientForm(forms.ModelForm):
    """
    Form for creating and updating Client records.

    Validates:
    - name: minimum 2 characters, required.
    - email: valid format and uniqueness (excluding current instance on update).
    - phone: optional, but must contain only digits, +, -, spaces and parentheses.
    """

    class Meta:
        model  = Client
        fields = ['name', 'email', 'status', 'company', 'phone']

    # --- Field-level validators ---

    def clean_name(self) -> str:
        """Validate that name is non-empty and at least 2 characters long."""
        name = self.cleaned_data.get('name', '').strip()
        if not name:
            raise forms.ValidationError('El nombre es obligatorio.')
        if len(name) < 2:
            raise forms.ValidationError(
                'El nombre debe tener al menos 2 caracteres.'
            )
        return name

    def clean_email(self) -> str:
        """Validate email uniqueness, excluding the current instance on updates."""
        email = self.cleaned_data.get('email', '').strip().lower()
        if not email:
            raise forms.ValidationError('El correo electrónico es obligatorio.')

        duplicate_qs = Client.objects.filter(email=email)
        if self.instance.pk:
            # Exclude the current record when editing
            duplicate_qs = duplicate_qs.exclude(pk=self.instance.pk)

        if duplicate_qs.exists():
            raise forms.ValidationError(
                'Ya existe un cliente con este correo electrónico.'
            )
        return email

    def clean_phone(self) -> str:
        """Validate phone format if provided (digits, +, -, spaces, parentheses)."""
        phone = self.cleaned_data.get('phone', '').strip()
        if phone:
            # Strip formatting characters and check remaining characters are digits
            stripped = re.sub(r'[\s\+\-\(\)]', '', phone)
            if not stripped.isdigit():
                raise forms.ValidationError(
                    'El teléfono solo puede contener números, +, -, espacios y paréntesis.'
                )
        return phone

    def clean_company(self) -> str:
        """Strip whitespace from company name."""
        return self.cleaned_data.get('company', '').strip()
