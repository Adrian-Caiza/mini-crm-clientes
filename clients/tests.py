import json
from django.test import TestCase, Client as TestClient, RequestFactory
from django.urls import reverse
from clients.models import Client
from clients.views import dashboard


class ClientModelAndApiTests(TestCase):
    def setUp(self):
        self.client = TestClient()
        self.sample_client = Client.objects.create(
            name="Elena Rostova",
            email="elena.rostova@example.com",
            company="Rostova Dynamics",
            phone="+1 555 0199",
            status=Client.STATUS_CLIENTE,
        )

    def test_client_str_representation(self):
        self.assertEqual(
            str(self.sample_client),
            f"Elena Rostova — Rostova Dynamics ({Client.STATUS_CLIENTE})"
        )

    def test_dashboard_view_status_code(self):
        factory = RequestFactory()
        request = factory.get(reverse("clients:dashboard"))
        response = dashboard(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Elena Rostova", response.content.decode("utf-8"))
        self.assertIn("Rostova Dynamics", response.content.decode("utf-8"))

    def test_api_client_list(self):
        response = self.client.get(reverse("clients:api_client_list"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("clients", data)
        self.assertTrue(isinstance(data["clients"], list))
        self.assertEqual(len(data["clients"]), 1)
        self.assertEqual(data["clients"][0]["email"], "elena.rostova@example.com")

    def test_api_client_detail(self):
        response = self.client.get(
            reverse("clients:api_client_detail", kwargs={"pk": self.sample_client.id})
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Elena Rostova")
        self.assertEqual(data["status"], Client.STATUS_CLIENTE)

    def test_api_client_create_success(self):
        payload = {
            "name": "Marcos Díaz",
            "email": "marcos.diaz@acme.inc",
            "company": "Acme Corp",
            "phone": "+1 555 1234",
            "status": Client.STATUS_PROSPECTO,
        }
        response = self.client.post(
            reverse("clients:api_client_create"),
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(Client.objects.filter(email="marcos.diaz@acme.inc").count(), 1)

    def test_api_client_create_validation_error(self):
        # Email duplicado o inválido
        payload = {
            "name": "Otro Nombre",
            "email": "elena.rostova@example.com",  # Repetido
            "status": Client.STATUS_PROSPECTO,
        }
        response = self.client.post(
            reverse("clients:api_client_create"),
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data["success"])
        self.assertIn("email", data["errors"])

    def test_api_client_update_success(self):
        payload = {
            "name": "Elena Rostova Actualizada",
            "email": "elena.rostova@example.com",
            "company": "Rostova New Group",
            "phone": "+1 555 9999",
            "status": Client.STATUS_INACTIVO,
        }
        response = self.client.post(
            reverse("clients:api_client_update", kwargs={"pk": self.sample_client.id}),
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.sample_client.refresh_from_db()
        self.assertEqual(self.sample_client.name, "Elena Rostova Actualizada")
        self.assertEqual(self.sample_client.status, Client.STATUS_INACTIVO)

    def test_api_client_delete_success(self):
        response = self.client.post(
            reverse("clients:api_client_delete", kwargs={"pk": self.sample_client.id})
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(Client.objects.filter(id=self.sample_client.id).count(), 0)
