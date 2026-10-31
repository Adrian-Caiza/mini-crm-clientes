# Mini CRM de Clientes 🚀

> Sistema de gestión de clientes moderno, responsivo y listo para producción.  
> Construido con **Django 5** en el backend y **HTML + CSS + Vanilla JS** en el frontend — sin dependencias de frameworks externos.

---

## ✨ Características

| Funcionalidad | Detalle |
|---|---|
| 📋 Dashboard | Resumen con tarjetas animadas: Total, Prospectos, Activos, Inactivos |
| ➕ Crear cliente | Modal con validación en frontend y backend |
| ✏️ Editar cliente | Formulario pre-relleno mediante petición AJAX |
| 🗑️ Eliminar cliente | Diálogo de confirmación antes de eliminar |
| 🔍 Búsqueda en tiempo real | Filtra por nombre o empresa sin recargar la página |
| 🏷️ Filtro por estado | Prospecto / Cliente / Inactivo |
| 🔔 Notificaciones toast | Mensajes de éxito y error animados |
| 📱 Responsive | Adaptado para desktop, tablet y móvil |
| 🐳 Docker ready | Levanta en un solo comando |
| ⚙️ CI/CD | GitHub Actions valida cada push |

---

## 🛠️ Stack tecnológico

- **Backend**: Django 5.1 · SQLite
- **Frontend**: HTML5 semántico · CSS Custom Properties · Grid/Flexbox · Vanilla JS (ES2020+)
- **Container**: Docker 24+ · docker-compose v3.9
- **CI/CD**: GitHub Actions

---

## 📋 Requisitos

### Local
- Python **3.12+**
- pip

### Docker
- Docker **24+**
- docker-compose (incluido en Docker Desktop)

---

## 🚀 Instalación local (paso a paso)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/mini-crm.git
cd mini-crm
```

### 2. Crear y activar un entorno virtual

```bash
# Windows (PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1

# macOS / Linux
python -m venv .venv
source .venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Aplicar migraciones de base de datos

```bash
python manage.py migrate
```

### 5. (Opcional) Crear superusuario para el panel de administración

```bash
python manage.py createsuperuser
```

### 6. Ejecutar el servidor de desarrollo

```bash
python manage.py runserver
```

Abre **http://localhost:8000** en tu navegador. 🎉

---

## 🐳 Instalación con Docker

### 1. Construir e iniciar la aplicación

```bash
docker-compose up --build
```

> La primera vez descarga la imagen base de Python y construye el contenedor.  
> Las siguientes ejecuciones son más rápidas gracias al caché de capas.

### 2. Acceder a la aplicación

Abre **http://localhost:8000**

### 3. Detener la aplicación

```bash
docker-compose down
```

> La base de datos SQLite se persiste en el volumen `sqlite_data` y sobrevive entre reinicios.

---

## 🗂️ Estructura del proyecto

```
mini-crm/
├── crm_project/               # Paquete de configuración de Django
│   ├── settings.py            # Configuración global (BD, apps, static)
│   ├── urls.py                # URL raíz (admin + clients)
│   └── wsgi.py                # Entrypoint WSGI
│
├── clients/                   # App principal
│   ├── migrations/            # Migraciones de la BD
│   ├── templates/
│   │   └── clients/
│   │       ├── base.html      # Layout base con sidebar y nav
│   │       └── dashboard.html # Vista principal con tabla y modales
│   ├── static/
│   │   └── clients/
│   │       ├── css/styles.css # Sistema de diseño completo (CSS custom props)
│   │       └── js/app.js      # Lógica de interfaz (Vanilla JS)
│   ├── admin.py               # Configuración del panel de administración
│   ├── apps.py                # AppConfig
│   ├── forms.py               # ClientForm con validaciones
│   ├── models.py              # Modelo Client
│   ├── urls.py                # URLs de la app + API endpoints
│   └── views.py               # Dashboard + JSON API (CRUD)
│
├── .github/
│   └── workflows/ci.yml       # GitHub Actions pipeline
│
├── manage.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

| Método | URL | Descripción |
|---|---|---|
| `GET` | `/` | Dashboard (HTML) |
| `GET` | `/api/clients/` | Lista de clientes (JSON) |
| `GET` | `/api/clients/<id>/` | Detalle de un cliente (JSON) |
| `POST` | `/api/clients/create/` | Crear cliente |
| `POST` | `/api/clients/<id>/update/` | Actualizar cliente |
| `POST` | `/api/clients/<id>/delete/` | Eliminar cliente |

---

## ⚙️ Django Admin

Accede al panel de administración en **http://localhost:8000/admin**  
(requiere haber creado un superusuario con `createsuperuser`)

---

## 🔒 Variables de entorno (producción)

Para despliegues en producción, configura estas variables de entorno:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `SECRET_KEY` | Clave secreta de Django | `django-prod-secret-...` |
| `DEBUG` | Modo debug | `False` |
| `ALLOWED_HOSTS` | Hosts permitidos | `midominio.com` |

---

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea tu rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit de tus cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

MIT © 2024
