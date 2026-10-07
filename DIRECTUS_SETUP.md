# Configuración de Directus para Prensa Eldorado

La aplicación ya no usa un token estático compartido ni el acceso local `admin/admin`. El panel autentica a cada editor mediante `/auth/login` de Directus y usa su token temporal para las operaciones de escritura. Los permisos de las colecciones deben aplicarse en Directus; las comprobaciones de ruta del frontend solo controlan la navegación.

## 1. Crear el rol de edición

En Directus, crear un rol de edición sin **Admin Access**. Asignarlo a cada persona que vaya a usar `/admin` y crear una cuenta individual con correo y contraseña. Habilitar solo los permisos que necesita el panel:

- `noticias`: leer, crear, actualizar y eliminar.
- `categorias`: leer, crear, actualizar y eliminar.
- `eventos`: leer, crear, actualizar y eliminar.
- `directus_files`: leer, crear, actualizar y eliminar solo archivos de la carpeta pública descrita abajo.

No habilitar permisos para administrar usuarios, roles, permisos ni configuración del proyecto. La cuenta debe iniciar sesión con correo y contraseña de Directus.

## 2. Limitar la lectura pública

En el rol **Public**, habilitar solo lectura:

- `noticias`, con la regla de ítem `status` igual a `published`.
- `categorias`, con los campos públicos necesarios (`id`, `nombre`, `slug`, `color`, `sort`).
- `eventos`, con la regla de ítem `status` igual a `published`.
- `directus_files`, solo para archivos cuya carpeta sea la carpeta pública creada en el paso siguiente.

No habilitar creación, modificación ni eliminación para Public. La regla del rol es necesaria aunque el sitio también filtre por `status` en sus consultas.

## 3. Crear la carpeta pública de imágenes

Crear una carpeta en Files llamada, por ejemplo, `Prensa pública`. Copiar su ID y usarlo como `VITE_DIRECTUS_PUBLIC_FOLDER_ID`. La aplicación coloca en esa carpeta todas las imágenes nuevas; los permisos públicos de Files deben limitarse a esa carpeta, no a todos los archivos del proyecto.

Para imágenes ya existentes, moverlas a esa carpeta o definir una regla equivalente que permita leerlas. La web carga `/assets/<id>` sin credenciales, por lo que Directus debe permitir leer cada imagen publicada.

## 4. Crear la colección `eventos`

Crear una colección `eventos` con estos campos:

| Campo | Tipo | Configuración |
| --- | --- | --- |
| `id` | Entero autoincremental o clave primaria | Obligatorio |
| `status` | Estado de Directus | Permitir `published` y `draft`; valor inicial `published` |
| `titulo` | Texto | Obligatorio |
| `descripcion` | Texto largo | Opcional |
| `fecha` | Fecha | Obligatorio |
| `hora` | Hora | Opcional |
| `lugar` | Texto | Opcional |
| `categoria` | Relación muchos-a-uno | Relacionar con `categorias`; opcional |
| `imagen` | Archivo | Relación con `directus_files`; opcional |

Si el panel todavía no ofrece un selector para la imagen del evento, el campo `imagen` puede permanecer opcional. Los eventos se publican al guardarse; los borradores no aparecen en el sitio público.

## 5. Configurar el proyecto

Copiar `.env.example` a `.env` para desarrollo y completar el ID de la carpeta pública. Para Docker Compose, definir `VITE_DIRECTUS_PUBLIC_FOLDER_ID` en el entorno o en el archivo `.env` antes de construir la imagen. `VITE_DIRECTUS_URL` puede mantenerse como `/directus` en Docker, donde Nginx lo redirige al servicio Directus.

No agregar tokens estáticos a variables `VITE_*`: Vite las incorpora al JavaScript público.

## 6. Revocar el token anterior

El token estático anterior estuvo incluido en el código y en el historial Git. Después de crear y probar las cuentas y permisos nuevos, revocar o rotar ese token en Directus y revisar si se reutilizó en otros despliegues. Quitar el valor del archivo actual no lo elimina de commits anteriores ni de bundles ya publicados.
