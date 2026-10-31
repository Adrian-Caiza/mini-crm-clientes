"""
Views for the clients application.

All mutation endpoints (create, update, delete) return JSON responses
so the frontend can handle them via the Fetch API without full page reloads.
"""
import json

from django.db import models as db_models
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_GET, require_POST

from .forms import ClientForm
from .models import Client


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _client_to_dict(client: Client) -> dict:
    """Serialize a Client instance to a JSON-serializable dictionary."""
    return {
        'id':         client.pk,
        'name':       client.name,
        'email':      client.email,
        'status':     client.status,
        'company':    client.company,
        'phone':      client.phone,
        'created_at': client.created_at.strftime('%d/%m/%Y'),
    }


# ---------------------------------------------------------------------------
# Dashboard (server-rendered)
# ---------------------------------------------------------------------------

def dashboard(request):
    """
    Main dashboard view.

    Renders the full client list and summary statistics.
    """
    all_clients = Client.objects.all().order_by('-created_at')

    context = {
        'clients':    all_clients,
        'total':      all_clients.count(),
        'prospectos': all_clients.filter(status=Client.STATUS_PROSPECTO).count(),
        'activos':    all_clients.filter(status=Client.STATUS_CLIENTE).count(),
        'inactivos':  all_clients.filter(status=Client.STATUS_INACTIVO).count(),
    }
    return render(request, 'clients/dashboard.html', context)


# ---------------------------------------------------------------------------
# API — Client detail (GET → JSON, used to pre-fill the edit modal)
# ---------------------------------------------------------------------------

@require_GET
def client_detail_api(request, pk: int):
    """Return a single client's data as JSON for the edit modal."""
    client = get_object_or_404(Client, pk=pk)
    return JsonResponse(_client_to_dict(client))


# ---------------------------------------------------------------------------
# API — Client list (GET → JSON, used for dynamic search/filter)
# ---------------------------------------------------------------------------

@require_GET
def client_list_api(request):
    """
    Return a filtered list of clients as JSON.

    Query params:
        search (str): Filter by name or company (case-insensitive).
        status (str): Filter by status value.
    """
    search        = request.GET.get('search', '').strip()
    status_filter = request.GET.get('status', '').strip()

    clients = Client.objects.all().order_by('-created_at')

    if search:
        clients = clients.filter(
            db_models.Q(name__icontains=search) |
            db_models.Q(company__icontains=search)
        )

    if status_filter:
        clients = clients.filter(status=status_filter)

    return JsonResponse({'clients': [_client_to_dict(c) for c in clients]})


# ---------------------------------------------------------------------------
# API — Create client
# ---------------------------------------------------------------------------

@require_POST
def client_create(request):
    """
    Create a new client from a JSON POST body.

    Returns:
        201 JSON with the created client on success.
        400 JSON with form errors on validation failure.
    """
    try:
        payload = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse(
            {'success': False, 'errors': {'__all__': ['Cuerpo de la solicitud inválido.']}},
            status=400,
        )

    form = ClientForm(payload)
    if form.is_valid():
        client = form.save()
        return JsonResponse(
            {'success': True, 'message': 'Cliente creado exitosamente.', 'client': _client_to_dict(client)},
            status=201,
        )

    return JsonResponse({'success': False, 'errors': form.errors}, status=400)


# ---------------------------------------------------------------------------
# API — Update client
# ---------------------------------------------------------------------------

@require_POST
def client_update(request, pk: int):
    """
    Update an existing client from a JSON POST body.

    Returns:
        200 JSON with the updated client on success.
        400 JSON with form errors on validation failure.
    """
    client = get_object_or_404(Client, pk=pk)

    try:
        payload = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse(
            {'success': False, 'errors': {'__all__': ['Cuerpo de la solicitud inválido.']}},
            status=400,
        )

    form = ClientForm(payload, instance=client)
    if form.is_valid():
        updated_client = form.save()
        return JsonResponse(
            {
                'success': True,
                'message': f'Cliente "{updated_client.name}" actualizado exitosamente.',
                'client':  _client_to_dict(updated_client),
            }
        )

    return JsonResponse({'success': False, 'errors': form.errors}, status=400)


# ---------------------------------------------------------------------------
# API — Delete client
# ---------------------------------------------------------------------------

@require_POST
def client_delete(request, pk: int):
    """
    Permanently delete a client by primary key.

    Returns:
        200 JSON with a success message.
    """
    client = get_object_or_404(Client, pk=pk)
    client_name = client.name
    client.delete()
    return JsonResponse(
        {'success': True, 'message': f'Cliente "{client_name}" eliminado exitosamente.'}
    )
