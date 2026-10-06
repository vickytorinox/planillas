# Planillas de ingresos y egresos — planillas.sgseguridad.com

## Qué hay en cada carpeta

```
apps-script/        Backend (Google Apps Script): login, catálogo, subida a Drive, admin
  Code.gs
  appsscript.json
web/                Sitios estáticos para GitHub Pages
  index.html        Portal            → planillas.sgseguridad.com/
  app/index.html    App de carga      → planillas.sgseguridad.com/app/
  admin/index.html  Administración    → planillas.sgseguridad.com/admin/
  assets/           Estilos, config (URL del backend) y helpers
  CNAME             Dominio propio
```

Estructura que se arma sola en Drive:

```
Planillas Ingresos y Egresos/
  └─ <Objetivo>/
       └─ <Puesto>/
            └─ <Objetivo> - <Puesto> - 2026-10-06.pdf
```

Si se sube dos veces la misma planilla, la segunda queda como `... - 2026-10-06 (2).pdf` (no se pisa nada).

La base de datos es una Google Sheet con 4 hojas: **Usuarios**, **Objetivos**, **Puestos** y **Cargas** (registro de cada subida con quién, cuándo y link al PDF).

---

## 1. Backend en Apps Script

1. Entrá a https://script.google.com con la cuenta de Google donde querés que queden los archivos → **Nuevo proyecto**. Nombralo "Planillas API".
2. Pegá el contenido de `apps-script/Code.gs` en `Código.gs`.
3. Configuración del proyecto (engranaje) → tildá **Mostrar el archivo de manifiesto "appsscript.json"** → volvé al editor y reemplazá ese archivo con `apps-script/appsscript.json` (deja la zona horaria en Buenos Aires).
4. Elegí la función `setup` en el menú desplegable y tocá **Ejecutar**. Aceptá los permisos. Crea la planilla y la carpeta raíz, y en el registro te muestra los links.
5. Configuración del proyecto → **Propiedades de la secuencia de comandos** → cambiá `ADMIN_PASSWORD` por una clave propia.
6. **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
7. Copiá la URL que termina en `/exec`.

> Cada vez que modifiques `Code.gs`, usá **Implementar → Administrar implementaciones → Editar → Nueva versión** para que la URL siga siendo la misma.

## 2. Sitio en GitHub Pages

1. Pegá la URL `/exec` en `web/assets/config.js`.
2. Creá un repositorio (por ejemplo `planillas`) y subí **el contenido de la carpeta `web/`** a la raíz del repo.
3. En el repo: **Settings → Pages** → Source: *Deploy from a branch* → rama `main`, carpeta `/ (root)`.
4. En **Custom domain** poné `planillas.sgseguridad.com` (el archivo `CNAME` ya está incluido).
5. En el DNS de `sgseguridad.com` creá un registro:
   `CNAME  planillas  →  <tu-usuario-de-github>.github.io`
6. Cuando el certificado esté listo, tildá **Enforce HTTPS**. Es obligatorio: sin HTTPS el navegador no deja usar la cámara.

## 3. Primer uso

1. Entrá a `/admin/` con la contraseña.
2. **Objetivos y puestos**: creá los objetivos y a cada uno agregale sus puestos. Un objetivo sin puestos no aparece en la app.
3. **Usuarios habilitados**: cargá los CUIL de los supervisores. Para habilitar a todos más adelante, solo hay que cargarlos acá (podés pegarlos de a muchos directamente en la hoja **Usuarios**: CUIL, Nombre, Rol, Activo=TRUE).
4. Desde el celular del supervisor: `/app/` → CUIL → objetivo, puesto y fecha → **Escanear planilla**.

## Cómo funciona el escaneo

- Abre la cámara trasera en vivo y detecta los bordes de la hoja (marco amarillo).
- Con **Auto** activado, captura sola cuando la hoja queda quieta ~1 segundo; si no, se usa el botón amarillo.
- Después se pueden ajustar las 4 esquinas a mano, se corrige la perspectiva y se aplica un filtro:
  **Escáner** (quita sombras, fondo blanco — recomendado), **Blanco y negro** o **Original**.
- Se pueden escanear varias hojas; todas se juntan en un único PDF.
- **Galería** queda como alternativa si la cámara falla; esa imagen pasa por el mismo recorte y filtro.

El motor de escaneo (OpenCV.js, ~9 MB) se descarga la primera vez y después queda en caché del navegador. Se precarga apenas el supervisor ingresa con su CUIL.

## Seguridad: lo que conviene saber

- Ingresar solo con CUIL es cómodo pero débil: cualquiera que conozca un CUIL habilitado podría subir planillas. El impacto es acotado (solo puede **subir**, no ver ni borrar), y todo queda registrado con su CUIL. Si más adelante se habilita a todo el personal, conviene sumar un PIN de 4 dígitos por usuario.
- Las sesiones duran 6 horas (app y admin).
- Los PDFs quedan privados en el Drive de la cuenta que implementó el script; el link "Ver en Drive" solo abre para quien tenga acceso a esa carpeta.
