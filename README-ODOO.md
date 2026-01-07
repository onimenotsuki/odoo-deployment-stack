# ODOO Local Server Setup

Este proyecto configura un servidor ODOO local usando Docker, conectado a una base de datos PostgreSQL existente.

## Requisitos Previos

- Docker y Docker Compose instalados
- PostgreSQL corriendo en el puerto 5432 (puede ser un contenedor o instalación local)

## Configuración de la Base de Datos PostgreSQL

Antes de iniciar ODOO, asegúrate de que tu PostgreSQL esté corriendo y tenga las credenciales correctas:

### Si usas el contenedor `petmate_postgres`:

```bash
# Iniciar el contenedor PostgreSQL existente
docker start petmate_postgres

# Crear un usuario para ODOO (si no existe)
docker exec -it petmate_postgres psql -U postgres -c "CREATE USER odoo WITH PASSWORD 'odoo' CREATEDB;"

# O conectarte directamente
docker exec -it petmate_postgres psql -U postgres
```

Dentro de PostgreSQL, ejecuta:
```sql
CREATE USER odoo WITH PASSWORD 'odoo' CREATEDB;
```

### Si quieres usar una nueva base de datos PostgreSQL:

Descomenta la sección `db` en el `docker-compose.yml` y cambia la variable de entorno `HOST=host.docker.internal` a `HOST=db`.

## Estructura del Proyecto

```
.
├── docker-compose.yml          # Configuración de Docker Compose
├── config/                     # Archivos de configuración de ODOO (opcional)
│   └── odoo.conf              # Configuración personalizada
└── addons/                     # Módulos/addons personalizados de ODOO (opcional)
```

## Uso

### 1. Iniciar ODOO

```bash
# Iniciar el servidor ODOO
docker-compose up -d

# Ver los logs
docker-compose logs -f odoo
```

### 2. Acceder a ODOO

Abre tu navegador y ve a:
```
http://localhost:8069
```

En la primera ejecución, ODOO te pedirá:
- **Master Password**: Crea una contraseña maestra (guárdala bien)
- **Database Name**: Nombre de tu base de datos (ej: `odoo_db`)
- **Email**: Tu correo electrónico
- **Password**: Contraseña de administrador de ODOO
- **Language**: Español
- **Country**: México (o el que prefieras)
- **Demo data**: Desmarca si no quieres datos de demostración

### 3. Comandos Útiles

```bash
# Detener ODOO
docker-compose down

# Reiniciar ODOO
docker-compose restart

# Ver logs en tiempo real
docker-compose logs -f odoo

# Eliminar volúmenes (¡CUIDADO! Esto borra los datos)
docker-compose down -v
```

## Configuración Personalizada

### Variables de Entorno

Puedes modificar las siguientes variables en el `docker-compose.yml`:

- `HOST`: Dirección del servidor PostgreSQL
  - `host.docker.internal` para PostgreSQL en el host (Windows/Mac)
  - `172.17.0.1` para PostgreSQL en el host (Linux)
  - `db` si usas el contenedor PostgreSQL incluido
- `PORT`: Puerto de PostgreSQL (por defecto: 5432)
- `USER`: Usuario de PostgreSQL (por defecto: odoo)
- `PASSWORD`: Contraseña de PostgreSQL (por defecto: odoo)

### Archivo de Configuración Personalizado

Crea un archivo `config/odoo.conf` para configuración avanzada:

```ini
[options]
addons_path = /mnt/extra-addons
data_dir = /var/lib/odoo
admin_passwd = tu_contraseña_maestra
db_host = host.docker.internal
db_port = 5432
db_user = odoo
db_password = odoo
```

### Añadir Módulos Personalizados

Coloca tus módulos personalizados en la carpeta `addons/` y ODOO los detectará automáticamente.

## Solución de Problemas

### Error de conexión a PostgreSQL

Si ODOO no puede conectarse a PostgreSQL:

1. **En Mac/Windows**: Usa `host.docker.internal` como HOST
2. **En Linux**: Usa `172.17.0.1` como HOST o configura tu network correctamente
3. Verifica que PostgreSQL esté corriendo: `docker ps | grep postgres`
4. Verifica que el usuario y contraseña sean correctos

### ODOO no inicia

```bash
# Ver los logs detallados
docker-compose logs -f odoo

# Reiniciar el contenedor
docker-compose restart odoo
```

### Conectarse desde ODOO a PostgreSQL en Linux

Si estás en Linux, modifica la variable `HOST` en `docker-compose.yml`:

```yaml
environment:
  - HOST=172.17.0.1  # IP del host Docker en Linux
```

O usa el modo `host` network:

```yaml
services:
  odoo:
    network_mode: "host"
    # ... resto de la configuración
```

## Actualizar ODOO

```bash
# Detener el contenedor actual
docker-compose down

# Actualizar la imagen
docker pull odoo:17.0

# Iniciar con la nueva imagen
docker-compose up -d
```

## Información Adicional

- [Documentación oficial de ODOO](https://www.odoo.com/documentation/17.0/)
- [ODOO en Docker Hub](https://hub.docker.com/_/odoo/)
- [Guía de desarrollo de módulos](https://www.odoo.com/documentation/17.0/developer.html)
