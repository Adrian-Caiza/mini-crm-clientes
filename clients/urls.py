"""URL patterns for the clients application."""
from django.urls import path

from . import views

app_name = 'clients'

urlpatterns = [
    # -----------------------------------------------------------------------
    # Server-rendered views
    # -----------------------------------------------------------------------
    path('', views.dashboard, name='dashboard'),

    # -----------------------------------------------------------------------
    # JSON API endpoints — consumed by Vanilla JS via Fetch API
    # -----------------------------------------------------------------------
    path('api/clients/',               views.client_list_api,  name='api_client_list'),
    path('api/clients/create/',        views.client_create,    name='api_client_create'),
    path('api/clients/<int:pk>/',      views.client_detail_api, name='api_client_detail'),
    path('api/clients/<int:pk>/update/', views.client_update,  name='api_client_update'),
    path('api/clients/<int:pk>/delete/', views.client_delete,  name='api_client_delete'),
]
