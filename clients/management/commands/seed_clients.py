from django.core.management.base import BaseCommand
from clients.models import Client

SAMPLE_CLIENTS = [
    {
        "name": "Carlos Mendoza",
        "email": "carlos.mendoza@innovatech.com",
        "company": "InnovaTech Solutions",
        "phone": "+34 612 345 678",
        "status": Client.STATUS_PROSPECTO,
    },
    {
        "name": "Valeria Silva",
        "email": "valeria.silva@nexuscloud.io",
        "company": "Nexus Cloud Services",
        "phone": "+52 55 1234 5678",
        "status": Client.STATUS_CLIENTE,
    },
    {
        "name": "Alejandro Gómez",
        "email": "alejandro.g@fintechgroup.org",
        "company": "Fintech Global",
        "phone": "+57 300 987 6543",
        "status": Client.STATUS_CLIENTE,
    },
    {
        "name": "Lucía Morales",
        "email": "lucia.m@andesdesign.co",
        "company": "Andes Design Lab",
        "phone": "+54 11 4567 8901",
        "status": Client.STATUS_INACTIVO,
    },
    {
        "name": "Roberto Torres",
        "email": "rtorres@logisticsplus.com",
        "company": "Logistics Plus",
        "phone": "+56 9 8765 4321",
        "status": Client.STATUS_PROSPECTO,
    },
]

class Command(BaseCommand):
    help = "Puebla la base de datos con clientes de prueba para demostración."

    def handle(self, *args, **options):
        created_count = 0
        for client_data in SAMPLE_CLIENTS:
            obj, created = Client.objects.get_or_create(
                email=client_data["email"],
                defaults=client_data,
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Cliente creado: {obj.name} ({obj.company})")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Cliente ya existía: {obj.name}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"Finalizado. Se crearon {created_count} clientes de prueba.")
        )
