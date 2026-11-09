# Cooperativa Inmigrar

Sitio institucional y catálogo de emprendimientos. Next.js 16 + Supabase Auth, PostgreSQL y Storage. Preparado para Netlify; ya no utiliza ChatGPT como acceso ni Cloudflare D1/R2 como persistencia.

## Vista previa sin Supabase

```sh
npm ci
npm run dev
```

Abre http://127.0.0.1:3000 . Se muestran seis fichas ficticias con fotografías locales. Las etiquetas aclaran que son una demostración; sus cotizaciones no envían mensajes reales. El panel /admin muestra la configuración pendiente y no simula una sesión.

## Conectar Supabase

1. Crea un proyecto en Supabase. Copia Project URL y Publishable Key. No hace falta ninguna clave secreta/service_role.
2. Copia `.env.example` a `.env.local` y completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (o `NEXT_PUBLIC_SUPABASE_ANON_KEY` para proyectos antiguos).
3. Ejecuta una vez `supabase/migrations/202611090001_catalog.sql` en SQL Editor. Crea tablas, vista pública, permisos RLS, funciones de administración y el bucket **privado** `catalog-images`.
4. En Authentication > Providers habilita Email. Deshabilita el registro público: las cuentas serán creadas por la administradora desde el dashboard de Supabase.
5. Crea la cuenta de la administradora en Authentication > Users. Edita el correo de `supabase/bootstrap-admin.sql`, ejecútalo y comprueba que afecte una fila.
6. La administradora ingresa en `/admin` con correo y contraseña. Para cada integrante, crea su cuenta en Supabase Authentication y luego habilita su correo en el panel del sitio. Habilitar un correo no crea una cuenta ni envía invitaciones.
7. Las integrantes pueden crear, publicar, editar y eliminar sus propias fichas. La administradora gestiona todas y asigna cada ficha a una cuenta habilitada.

Las contraseñas se gestionan en Supabase Authentication. El formulario no incluye registro público ni recuperación automática: la interfaz dirige a la cooperativa si una integrante necesita recuperar acceso. El correo vigente de una cuenta debe mantenerse sincronizado con `members.email` al cambiarlo desde Supabase.

Las imágenes admiten PNG, JPG y WebP de hasta **4 MB** para ajustarse a la petición multipart a través de funciones de Netlify. Se guardan en carpetas con el UUID del usuario. Solo las imágenes vinculadas a fichas publicadas son legibles anónimamente; los borradores quedan protegidos. Quitar una imagen o eliminar una ficha la desvincula del catálogo; los archivos huérfanos pueden depurarse posteriormente desde Supabase Storage.

## Publicar en Netlify

1. Sube este directorio a un repositorio Git y conéctalo en Netlify. Si el repositorio contiene la carpeta ONG completa, selecciona `cooperativa-inmigrar` como base directory.
2. Netlify toma `netlify.toml`: `npm run build`, directorio `.next`, Node 22. Su adaptador de Next.js se detecta automáticamente. No se utiliza exportación estática: el acceso y las API necesitan funciones del servidor.
3. Configura las dos variables de Supabase en Netlify con alcance de build y funciones. No incluyas secretos en el repositorio.
4. Durante la revisión usa `DEMO_CATALOG=true`. Antes del lanzamiento configura `DEMO_CATALOG=false` y vuelve a desplegar para mostrar solo fichas reales.
5. Configura Site URL en Supabase Authentication con el dominio definitivo de Netlify (y las redirect URLs necesarias si más adelante se habilitan invitaciones o recuperación por email).
6. Verifica acceso, cookies, permisos por integrante, subida y publicación contra el proyecto real antes de lanzar públicamente.

El enlace anterior de ChatGPT Sites conserva la versión previa: este cambio prepara la migración a Netlify y no actualiza aquel alojamiento. `.openai/hosting.json` conserva únicamente la identidad histórica del sitio. Los antiguos auxiliares de Sites en `scripts/` y `drizzle/` ya no forman parte del build de Next.js.

## Comprobaciones

```sh
npm run typecheck
npm test
npm run build
```

Las pruebas usan PostgreSQL local en WASM (PGlite) para verificar el SQL y las políticas RLS con usuarios anónimos, integrantes, administradoras y cuentas revocadas. No requieren credenciales ni modifican un proyecto real. Las pruebas del inicio de sesión y Storage HTTP reales quedan pendientes hasta conectar Supabase.

Documentación: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Storage RLS](https://supabase.com/docs/guides/storage/security/access-control), [Next.js en Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).

Fotografías de prueba: `public/demo/CREDITOS.md`. Reemplazar por imágenes aprobadas de las integrantes.
