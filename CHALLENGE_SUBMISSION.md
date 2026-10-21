# Submission

> El código, los comentarios y los mensajes de commit están en inglés por coherencia
> con el repositorio original. Este documento va en castellano.

## What I Did

Lo he tratado como una refactorización, no como un reescritura: mismo stack y mismo
monorepo, pero el código reorganizado alrededor de un dominio que no sabe que el
framework existe.

### Arquitectura — hexagonal (puertos y adaptadores)

`libs/engine` contiene el dominio y la capa de aplicación con **cero dependencias de
runtime**:

```
libs/engine/src
├── domain/        ShortenedUrl (agregado) · DestinationUrl + ShortCode (value objects)
│                  ShortenedUrlRepository (puerto) · errores de dominio tipados
│                  internal-host (guard anti-SSRF)
├── application/   ShortenUrl · ResolveShortenedUrl · ListShortenedUrls (casos de uso)
└── test-support/  InMemoryShortenedUrlRepository (adaptador falso para los tests)
```

`applications/web` contiene los adaptadores: las rutas (driving), el
`PrismaShortenedUrlRepository` (driven), el rate limiter y la configuración.
`app/container.server.ts` es el único composition root. Los tipos de Prisma no salen
nunca de `app/infrastructure/prisma/`.

Por qué importa aquí, y no es un diagrama decorativo: los casos de uso se testean contra
un repositorio en memoria en milisegundos, sin base de datos ni contenedor. Y la prueba
de fuego la tuve a mitad del ejercicio: **empecé con SQLite y migré a Postgres**. El
cambio tocó el `provider` del schema, la cadena de conexión y el `docker-compose`. El
adaptador, los casos de uso y el dominio no se movieron ni una línea. Eso es el principio
de inversión de dependencias haciendo trabajo real.

### El generador de códigos

El original usaba 2 caracteres del alfabeto `"abc"` → **9 códigos posibles** (≈50 % de
probabilidad de colisión a partir de la 4ª URL), y una colisión **sobrescribía
silenciosamente el enlace de otro usuario**, porque `shortenedUrls.set()` nunca
comprobaba si el código ya existía.

Ahora: 7 caracteres de un alfabeto de 56 símbolos sin ambigüedades (sin `0/O/1/l/I`) →
**56⁷ ≈ 1,7 × 10¹²** combinaciones, generadas con un CSPRNG (`node:crypto`) en lugar de
`Math.random()`, que es predecible y permitiría enumerar los enlaces ajenos.

Las colisiones las resuelve **la base de datos, no una lectura previa**: `code` tiene un
índice único, `save()` traduce el error `P2002` de Prisma a un `ShortCodeCollisionError`
del dominio, y el caso de uso reintenta con un código nuevo. Un "comprueba y luego
escribe" seguiría siendo propenso a race conditions. Además es idempotente: acortar dos
veces la misma URL devuelve el mismo enlace corto en vez de duplicar filas.

### Persistencia

Prisma + **PostgreSQL**, con un modelo `ShortenedUrl` (`code @unique`, `destination`,
`clicks`, `createdAt`, `lastVisitedAt`).

Empecé con SQLite por presupuesto de tiempo (un volumen y ningún contenedor extra que
orquestar) y lo migré a Postgres al ver que tenía margen, porque SQLite no permite
escalado horizontal: con dos réplicas tendrías dos bases de datos distintas y un enlace
creado en una daría 404 en la otra. El `docker-compose` levanta ahora el servicio `db`
con `healthcheck`, y `web` espera a `condition: service_healthy` — que es lo que hace
seguro ejecutar `prisma migrate deploy` en cada arranque.

El contador de clicks es un único `UPDATE ... SET clicks = clicks + 1` atómico; un
read-modify-write perdería clicks siempre que dos visitas se solapasen.

### Seguridad / prevención de abuso

Aquí es donde el código original era peligroso de verdad, no solo desordenado:

- **XSS almacenado + open redirect.** Se guardaba cualquier cadena y después se pintaba
  dentro de un `<a href>` y se pasaba a `redirect()`, así que `javascript:alert(1)` o
  `data:text/html,…` funcionaban. `DestinationUrl` aplica ahora una **allowlist** de
  `http`/`https` en el dominio, de modo que ningún punto de entrada futuro pueda
  saltársela, y la misma validación se repite al leer la fila de vuelta (defensa en
  profundidad).
- **SSRF.** Se bloquean los destinos internos: loopback, rangos privados (10/8, 172.16/12,
  192.168/16), CGNAT, multicast, IPv6 ULA y link-local, los TLD `.internal`/`.local`, y
  muy especialmente **169.254.169.254**, el endpoint de metadatos de AWS/GCP que entrega
  credenciales de instancia. Sin esto el servicio es un *confused deputy*: cualquiera
  podría acuñar en nuestro dominio un enlace hacia la red interna. Las ofuscaciones
  decimal y hexadecimal (`http://2130706433`) no cuelan porque el parser WHATWG las
  normaliza antes de llegar al guard.
- **Rate limiting**: ventana fija, 10 creaciones por minuto y cliente, con un `429` real y
  cabecera `Retry-After`.
- Límite de longitud (2048), comprobación de host, contenedor como usuario no root, y
  `Referrer-Policy: no-referrer` en la redirección para que el destino no sepa de qué
  enlace vienes.

### Estadísticas de clicks

`/s/:code` resuelve y cuenta en un mismo caso de uso, así que es imposible redirigir sin
registrar la visita. La redirección es **302 con `Cache-Control: no-store`** — un 301 se
cachea en navegadores y proxies, y cada visita cacheada sería un click que nunca veríamos.
`/urls` muestra totales (enlaces, clicks, media) más una tabla por enlace con clicks,
fecha de creación, última visita y copiado al portapapeles.

Los contadores se revalidan al volver a la pestaña (`useRevalidateOnFocus`): el número
sube al regresar de seguir un enlace, sin recargar. Es estado del servidor, así que un
incremento optimista en el cliente mentiría y, sobre todo, no vería las visitas de otras
personas.

### Frontend

- Rediseño minimalista en neutros: la jerarquía la dan el contraste y el espaciado, no el
  color. Modo claro y oscuro.
- Componentes reutilizables (`Button`, `Input`, `Card`, `Stat`, `Alert`, `CopyButton`)
  siguiendo las convenciones de shadcn/ui: variantes con `class-variance-authority`,
  `className` fusionado con `tailwind-merge` (para que al pasar una clase en conflicto gane
  la del llamante y no el orden del CSS) y `asChild` con el `Slot` de Radix, que permite
  renderizar un `<Link>` con estilo de botón sin duplicar la lista de clases.
  Escritos a mano en vez de generados con el CLI: esta interfaz no necesita ninguna
  primitiva de Radix más allá de `Slot`, así que los archivos generados habrían sido
  justo estos.
- **Estados de carga**: `useNavigation()` deshabilita el input y cambia el botón por un
  spinner mientras la action está en vuelo.
- **Errores**: mensajes de validación del servidor con el código HTTP correcto
  (`400`/`429`/`500`), dentro de una región `role="alert"`, con `aria-invalid` y
  `aria-describedby` conectados, y conservando lo que el usuario escribió para que pueda
  corregirlo. Página **404 real** para códigos inexistentes mediante un `ErrorBoundary` de
  ruta (un snackbar no es posible ahí: una redirección es una navegación completa de
  servidor, no queda estado de cliente donde pintarlo).
- Labels, focus rings, `prefers-reduced-motion`, y tablas que hacen scroll ellas mismas en
  móvil en lugar de desplazar la página.

### Tests

42 tests unitarios (Vitest) sobre las partes donde un fallo sale caro y el test sale
barato: validación de esquemas y formato, el guard anti-SSRF (incluidas las ofuscaciones),
generación de códigos (determinista gracias a inyectar la fuente de aleatoriedad),
reintento ante colisión, idempotencia, conteo de clicks y que un código desconocido y uno
malformado sean indistinguibles desde fuera.

No necesitan base de datos: ese es el retorno del puerto, y la razón por la que los tests
no están enganchados al build de Docker.

### Docker

- Servicio `db` (postgres:16-alpine) con volumen y `healthcheck`; `web` arranca solo
  cuando la base está sana.
- `openssl` en la imagen base: el query engine de Prisma enlaza contra OpenSSL y
  `node:20-alpine` no lo trae. Sin esto el contenedor arranca y muere en la primera query.
- `prisma migrate deploy` en cada arranque, de modo que un contenedor o un volumen nuevos
  convergen al esquema correcto sin pasos manuales.
- `--ignore-scripts` al instalar dependencias (el schema aún no está en esa capa) con un
  `prisma generate` explícito en la capa de build, para no romper la caché de
  dependencias.
- Se ejecuta como usuario no root (`node`).
- El entrypoint invoca los binarios directamente en lugar de `pnpm start`: corepack cachea
  en el home de root, así que como `node` volvía a descargar pnpm en cada arranque, es
  decir, el contenedor necesitaba red solo para iniciarse.
- Verificado también construyendo para **linux/amd64** y ejecutándolo: crear enlace,
  redirigir, contar click y rechazar `javascript:` funcionan igual en x86 que en ARM.

### Limpieza

Eliminado un `package-lock.json` suelto (un `npm install` ejecutado por error en un repo
pnpm) y regenerado `pnpm-lock.yaml`, que el build de Docker necesita con
`--frozen-lockfile`.

## What I Would Do With More Time

Por orden de lo que cogería a continuación:

1. **DNS rebinding.** El guard anti-SSRF bloquea direcciones internas literales, pero no
   un dominio público cuyo registro DNS apunte a una IP privada. Cerrarlo requiere
   resolver el DNS al crear el enlace y volver a comprobarlo en la redirección.
2. **Rate limiting distribuido.** El actual vive en memoria del proceso: forma correcta,
   escala equivocada. Es, de hecho, lo único que queda impidiendo el escalado horizontal
   ahora que la base de datos es compartida. Debería moverse a Redis o al CDN/edge, y
   apoyarse en algo mejor que `x-forwarded-for`, que es falsificable salvo que lo
   sobrescriba un proxy de confianza.
3. **Tests de integración y E2E.** Hoy el adaptador de Prisma solo está cubierto a través
   de su interfaz; lo probaría contra un Postgres real (incluida la ruta `P2002`) y
   añadiría un Playwright para acortar → redirigir → contador.
4. **Pool de conexiones** (PgBouncer o el pool de Prisma afinado) antes de poner varias
   réplicas detrás de un balanceador.
5. **Estadísticas más ricas**: referrer, user agent, país y serie temporal, lo que implica
   una tabla de eventos `Click` en lugar de una columna contador.
6. **Producto**: alias personalizados, caducidad, códigos QR, borrado por enlace y
   paginación en `/urls` (ahora limitada a 50).
7. **Tooling**: ESLint/Biome + Prettier y un pipeline de GitHub Actions (typecheck, test,
   build de Docker), más un endpoint `/health` dedicado en vez de que el healthcheck pegue
   a `/`.
8. **Observabilidad**: logging estructurado y reporte de errores; `console.error` es un
   marcador de posición.

Y para producción de verdad, además: terminación TLS por delante y copias de seguridad del
volumen de Postgres.

## AI Usage

He usado **Claude Code (Opus)** como pair programmer durante toda la sesión, y lo he
dirigido con un flujo de análisis primero, no pidiendo código de entrada.

**1. Análisis en solo lectura antes de tocar nada.** Mi primer prompt fue deliberadamente
restrictivo:

> *"estoy haciendo una prueba para un posible trabajo, este proyecto es la prueba tecnica,
> analizalo en profundidad, no modifiques nada solo analiza el proyecto y explicamelo"*

De ahí salió un inventario de defectos (el generador de 9 códigos, el XSS almacenado vía
`javascript:`, el `Map` a nivel de módulo, `process.env.PUBLIC_URL` sin validar) y un mapa
de cada requisito del enunciado contra el estado real del código.

**2. Escribí mi propia lista de prioridades y pedí que la rebatiera.** Le pasé mi orden de
ataque y pedí comparación con su plan, con presupuesto de tiempo explícito. Cambié de
criterio en cuatro puntos:

- Yo tenía "arreglar Docker" como paso 1. Me hizo ver que Docker ya funcionaba y que
  añadir Prisma lo rompería igualmente, así que pasó al final con un smoke test temprano.
- Iba a levantar Postgres desde el principio; con el tiempo inicial, SQLite + volumen era
  la decisión correcta. Cuando vi que me sobraba margen, hicimos la migración a Postgres —
  y sirvió para demostrar la arquitectura.
- Pregunté si merecía la pena montar los tests; la respuesta (solo unitarios de dominio,
  nunca enganchados al build de Docker) es lo que acabó entregándose.
- Me señaló dos huecos en mi lista: la prevención de abuso y este propio documento.

**3. Implementación revisada por bloques.** Le hice implementar por fases (dominio →
adaptador → rutas → UI → tests → Docker) para revisar cada una. Detectó cosas que yo
habría depurado a ciegas: que Prisma en Alpine necesita `openssl`, que importar
`node:path` desde un fichero sin sufijo `.server` arriesga filtrarlo al bundle de cliente
(de ahí `config.server.ts`), y que el contenedor descargaba pnpm en cada arranque.

También le corregí cuando hizo falta: propuse resolver el contador en tiempo real con un
setter funcional de React y me explicó por qué no servía —ese contador es estado del
servidor, cambia por visitas de otras pestañas o de otras personas— y acabamos revalidando
el loader al recuperar el foco.

Ejemplos de prompts:

> *"priorities: 1. Primero conseguir reparar el docker … 2. Organizar el codigo siguiendo
> hexagonal … ¿Vale la pena montar todo el sistema de test? ¿Consumirá mucho tiempo la
> implementación? ¿Complica el despliegue con docker?"*

> *"ahora q tenemos tiempo podemos implementar postgres? para q soporte escalado
> horizontal?"*

Lo que me reservé: las decisiones de prioridad, el trade-off SQLite/Postgres, los recortes
de alcance y la revisión de cada diff. Lo que delegué: el boilerplate, el barrido
exhaustivo de defectos y acordarse de las trampas de infraestructura.

## Feedback

El enunciado es claro y el marco del "código de becario deliberadamente malo" funciona muy
bien: los bugs están plantados a distintas profundidades (la UI fea se ve sola, el
generador de 9 códigos cuesta un minuto, y que el esquema `javascript:` llegue a
`redirect()` solo aparece si piensas en seguridad), lo que lo convierte en una buena señal
de hasta dónde mira cada candidato.

Dos apuntes:

- **Dos horas se quedan cortas para los requisitos enunciados.** Base de datos + patrón
  repositorio + SOLID + tests + rediseño de UI + seguridad + Docker es media jornada
  haciéndolo bien. La instrucción de priorizar lo compensa, pero convendría decir
  explícitamente que no se espera marcar todas las casillas; si no, es fácil repartirse y
  hacerlo todo superficial.
- **Se da por supuesto `pnpm` pero no se comprueba.** `corepack` viene con Node, pero
  `pnpm` no está en el PATH, y eso cuesta cinco minutos y provoca justo el error que yo
  cometí: un `npm install` accidental que deja un `package-lock.json` en un repo pnpm. Una
  línea en el README (`corepack enable`) quitaría esa fricción.

Un acierto: que `CHALLENGE_SUBMISSION.md` pregunte por el uso de IA. Dice bastante más de
cómo trabaja alguien que fingir que estas herramientas no existen.
