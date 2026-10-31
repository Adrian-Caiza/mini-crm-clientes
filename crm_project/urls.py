"""URL configuration for crm_project."""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Mount the clients app at the root
    path('', include('clients.urls')),
]
