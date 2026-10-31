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
- **Container**: Docker 24+ · Docker Compose
- **CI/CD**: GitHub Actions

---

## 📋 Requisitos

### Local
- Python **3.12+**
- pip

### Docker
- Docker **24+**
- Docker Compose (incluido en Docker Desktop)

---

## 🚀 Instalación local (paso a paso)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Adrian-Caiza/mini-crm-clientes.git
cd mini-crm-clientes
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

### 4. Configurar variables de entorno (.env)

Copia el archivo `.env.example` para habilitar el modo depuración (`DEBUG=True`) en desarrollo:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

### 5. Aplicar migraciones de base de datos

```bash
python manage.py migrate
```

### 6. (Opcional) Poblar clientes de demostración

```bash
python manage.py seed_clients
```

### 7. (Opcional) Crear superusuario para el panel de administración

```bash
python manage.py createsuperuser
```

### 8. Ejecutar el servidor de desarrollo

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
├── .env.example
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

## 🔒 Variables de entorno

El proyecto lee su configuración desde variables de entorno o desde el archivo `.env` mediante `python-dotenv`. Por seguridad, `DEBUG` tiene como valor por defecto `False` y `SECRET_KEY` es obligatoria cuando `DEBUG=False`.

Para desarrollo, utiliza `.env.example` como plantilla:

| Variable | Descripción | Valor por defecto | Configuración Desarrollo (.env / Docker) |
|---|---|---|---|
| `SECRET_KEY` | Clave secreta criptográfica (obligatoria si `DEBUG=False`) | Ninguno (falla si `DEBUG=False`) | `cambia-esta-clave` |
| `DEBUG` | Modo depuración (por defecto `False` por seguridad) | `False` | `True` |
| `ALLOWED_HOSTS` | Hosts/dominios permitidos (separados por coma) | `localhost,127.0.0.1,[::1]` | `localhost,127.0.0.1,[::1],web` |
| `DJANGO_DB_DIR` | Carpeta donde se almacena `db.sqlite3` | Raíz del proyecto (`BASE_DIR`) | `/app/data` (Docker volume) |

---

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea tu rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit de tus cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

MIT © 2026 Adrián Caiza
