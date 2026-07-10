# PUMI PAGE — Etapa 1

Esta es la estructura base definitiva del proyecto PUMI para GitHub Pages.

## Archivos incluidos

```text
PUMI-PAGE/
├── index.html
├── README.md
├── css/
│   └── app.css
├── js/
│   └── app.js
├── config/
│   └── config.js
├── services/
│   └── arcgis-service.js
├── modules/
└── assets/
    ├── icons/
    └── img/
```

## Cómo subirlo

Suba **el contenido de esta carpeta directamente a la raíz del repositorio**.

En la página principal del repositorio debe verse:

```text
index.html
README.md
css/
js/
config/
services/
modules/
assets/
```

No debe quedar una carpeta adicional envolviendo estos archivos.

## GitHub Pages

En el repositorio:

1. Abra `Settings`.
2. Entre en `Pages`.
3. Seleccione `Deploy from a branch`.
4. Branch: `main`.
5. Folder: `/ (root)`.
6. Guarde.

## URL esperada

Para un repositorio llamado `PUMI-PAGE`:

```text
https://cb230494.github.io/PUMI-PAGE/
```

Use exactamente esa misma URL como Redirect URI al crear las credenciales OAuth en ArcGIS.

## Configuración de OAuth

Abra:

```text
config/config.js
```

Cambie:

```js
oauthClientId: "COLOQUE_AQUI_EL_CLIENT_ID"
```

por el Client ID real.

No coloque Client Secret en GitHub.

## Qué funciona en esta primera etapa

- Diseño institucional nuevo.
- Pantalla de inicio de sesión.
- Login OAuth preparado.
- Modo demostración.
- Menú por roles.
- Panel principal.
- Indicadores.
- Resumen por programa.
- Resumen por estados.
- Mapa de ArcGIS.
- Bandeja de notificaciones.
- Diseño adaptable para teléfono.

## Próxima etapa

Se agregará el módulo completo de Delegación:

- Registro de actividades.
- Catálogos encadenados.
- Geolocalización.
- Consulta y edición de registros.
- Envío a revisión regional.
