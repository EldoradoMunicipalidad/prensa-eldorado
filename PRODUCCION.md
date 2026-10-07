# Despliegue de Prensa Eldorado en Dokploy

## Destino indicado

`http://2.25.132.129:3000/` responde actualmente con la página de Dokploy. El puerto `3000` es el panel de administración del servidor, no el puerto de esta web. No publiques Prensa Eldorado en ese puerto ni ingreses credenciales del CMS usando HTTP.

Para producción, sirve la web mediante un dominio propio con HTTPS administrado por Dokploy. El contenedor de esta aplicación escucha en el puerto interno `80`; el dominio de Dokploy debe enrutar a ese puerto. El Compose de producción usa `expose`, sin publicar un puerto del host.

## Preparación en Dokploy

1. Asegurá que el dominio de la web tenga un registro DNS `A` apuntando a `2.25.132.129`.
2. En Dokploy, creá una aplicación Docker Compose para este repositorio y configurá el archivo `docker-compose.prod.yml` desde la raíz del repo.
3. Definí `VITE_DIRECTUS_PUBLIC_FOLDER_ID` como variable de build con el ID de la carpeta pública creada en Directus. Es un identificador, no un secreto.
4. Configurá el dominio de la web en Dokploy para el servicio `prensa-eldorado`, puerto de contenedor `80`, ruta `/`, HTTPS habilitado y certificado Let's Encrypt.
5. Antes de permitir el acceso de editores, terminá la configuración del servidor descrita en [DIRECTUS_SETUP.md](DIRECTUS_SETUP.md): rol de edición, permisos públicos, carpeta de archivos y colección `eventos`.
6. Revocá o rotá el token estático anterior en Directus antes de desplegar esta versión. Ese token sigue presente en el historial Git y puede seguir en bundles publicados anteriormente.
7. Desplegá desde una revisión que incluya estos cambios y verificá la lista de comprobación siguiente.

## Verificación posterior al despliegue

- La página carga por HTTPS y el certificado es válido.
- Las rutas `/`, `/eventos`, `/categoria/<slug>` y `/articulo/<slug>` responden al recargar directamente la página.
- Noticias, categorías, eventos e imágenes públicas cargan desde el proxy `/directus`.
- Un usuario sin sesión puede leer lo publicado, pero las operaciones de escritura fallan.
- Una cuenta con rol de edición puede iniciar sesión, publicar un artículo, cargar una imagen en la carpeta pública y crear/editar/eliminar un evento.
- Un borrador no aparece en las vistas públicas.
- Al cerrar sesión, las operaciones de escritura requieren volver a iniciar sesión.

## Configuración de desarrollo local

Copiá `.env.example` a `.env` y completá `VITE_DIRECTUS_PUBLIC_FOLDER_ID`. Para producción, Dokploy toma el ID como argumento de build desde `docker-compose.prod.yml`; no cargues tokens estáticos en variables `VITE_*`.
