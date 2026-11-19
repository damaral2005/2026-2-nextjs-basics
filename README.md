# DashStudents Frontend

Frontend en Next.js (App Router) para la API de estudiantes hecha con NestJS + Postgres. Se construye por etapas en Computación en Internet 3 (2026-2). Este README documenta únicamente lo que existe hoy en el repo.

La [entrega en PDF](output/pdf/entrega-estudiantes.pdf) incluye el flujo de creación y las pruebas de protección. Las [capturas originales](docs/capturas) muestran el registro, el dashboard, el formulario, el estudiante creado y la redirección al login.

## Inicio rápido

```bash
pnpm install
# crear .env.local con API_URL (ver "Variables de entorno")
pnpm dev                     # http://localhost:3000
```

La API de NestJS debe estar corriendo, por ejemplo en `http://localhost:9000/api`. Para usar la versión del backend del curso que aún devuelve el usuario sin JWT, aplica [el parche de NestJS](docs/nestjs-auth.patch) desde la raíz de ese proyecto. El parche emite y valida el JWT, expone el perfil y exige sesión en `POST /api/student`.

```powershell
$frontend = 'C:/ruta/2026-2-nextjs-basics'
git apply --check "$frontend/docs/nestjs-auth.patch"
git apply "$frontend/docs/nestjs-auth.patch"
node -p "require('node:crypto').randomBytes(32).toString('hex')"
```

Guarda el valor generado como `JWT_SECRET` en el `.env` de NestJS junto con la configuración de PostgreSQL. Reinicia NestJS con `npm run start:dev` y deja `API_URL=http://localhost:9000/api` en el `.env.local` de Next.js.

## Stack

| Pieza | Versión / decisión |
|-------|--------------------|
| Next.js | 16.4.2 (App Router, Turbopack) |
| React | 19.3.0 |
| Estilos | Tailwind CSS 4 |
| Lenguaje | TypeScript, alias de importación `@/*` |
| Cliente HTTP | axios (solo servidor, ver `lib/api.ts`) |
| Gestor de paquetes | pnpm |

> `next.config.ts` tiene activados `cacheComponents` y `partialPrefetching`. No es el Next.js de los tutoriales antiguos: consulta `node_modules/next/dist/docs/` antes de fiarte de la memoria.

## Variables de entorno

| Variable | Alcance | Para qué sirve |
|----------|---------|----------------|
| `API_URL` | Solo servidor | URL base de la API NestJS, p. ej. `http://localhost:9000/api` (estudiantes y auth) |

## Rutas

| Ruta | Archivo | Contenido |
|------|---------|-----------|
| `/` | `app/(public)/page.tsx` | Home pública: hero con la marca, botón "Ir a estudiantes" y la sección "Que vamos a construir?" |
| `/login` | `app/(auth)/login/page.tsx` | Formulario de login (`LoginForm`). Acepta `?from=` |
| `/register` | `app/(auth)/register/page.tsx` | Registro de cuentas de acceso |
| `/students` | `app/(dashboard)/students/page.tsx` | Tabla de estudiantes con búsqueda y paginación (`GET {API_URL}/student`). Acepta `?q=texto&page=2` |
| `/students/new` | `app/(dashboard)/students/new/page.tsx` | Formulario protegido para crear un estudiante |
| `/students/[id]` | `app/(dashboard)/students/[id]/page.tsx` | Detalle de un estudiante (`GET {API_URL}/student/{id}`), con caché y sesión verificada en cada solicitud |
| `/about` | `app/(public)/about/page.tsx` | Sección "About this project" |
| `/counter` | `app/(dashboard)/counter/page.tsx` | Contador interactivo (Client Component) |

Regla de oro del App Router: **la carpeta define la URL, el archivo define el rol** (`page.tsx`, `layout.tsx`, `route.ts`).

### Route groups: `(public)`, `(auth)` y `(dashboard)`

Las carpetas entre paréntesis son *route groups*: **no aparecen en la URL**, solo sirven para agrupar rutas y darles un layout propio. Cada grupo tiene su layout, y el layout raíz (`app/layout.tsx`) solo define `<html>`, fuentes y metadata.

- `(public)` agrupa `/` y `/about`. Su layout pinta el `Navbar` (links Home, Students, Counter, About) y un `<main>` centrado.
- `(auth)` agrupa `/login` y `/register`. Su layout muestra la marca y una tarjeta centrada para los formularios.
- `(dashboard)` agrupa `/students` y sus subrutas, junto con `/counter`. El layout verifica la sesión y muestra el nombre completo del usuario encima del contenido. `Sidebar` incluye **Cerrar sesión** en escritorio y móvil.

## Estructura del proyecto

```
app/
  layout.tsx            Layout raíz: <html>, fuentes y metadata
  (public)/
    layout.tsx          Navbar + <main>
    page.tsx            /
    about/page.tsx      /about
  (auth)/
    layout.tsx          Tarjeta centrada con la marca
    actions.ts          Server Actions: loginAction, registerAction, logoutAction
    login/page.tsx      /login
    register/page.tsx   /register
  (dashboard)/
    layout.tsx          Sesión, nombre y sidebar
    students/page.tsx   /students
    students/new/page.tsx  /students/new
    students/actions.ts    Acción para crear un estudiante
    students/[id]/page.tsx  /students/:id
    counter/page.tsx    /counter
components/
  Brand.tsx             Marca "Dash" + "Students"
  Navbar.tsx            Client Component (usePathname para resaltar el link activo)
  Section.tsx           Contenedor con id, título y children
  Paginator.tsx         Paginador por links (<, números con "...", >); conserva los params
  auth/
    LoginForm.tsx       Client Component: formulario ligado a loginAction con useActionState
    RegisterForm.tsx    Formulario para crear una cuenta
  form-ui/
    Input.tsx           Input con label
    SubmitButton.tsx    Botón de envío con estado pending
  sidebar/
    Sidebar.tsx         Menú del dashboard (barra superior en móvil, aside en md+)
    SidebarMenu.tsx     Client Component: marca el item activo con usePathname
    SidebarMenuItem.tsx Item individual del menú
  students/
    CreateStudentForm.tsx  Formulario protegido para crear un estudiante
    StudentTable.tsx    Tabla; recibe students por props
    StudentRow.tsx      Fila de un estudiante
    StudentBadge.tsx    Badge Active / Inactive
    StudentSearch.tsx   Client Component: input de búsqueda con debounce que escribe `?q=`
lib/
  api.ts                Instancia de axios con API_URL
  student-api.ts        Listado, consulta y creación de estudiantes
  auth-api.ts           Login, registro y perfil de la cuenta
  session.ts            Cookie de sesión y verificación del usuario en NestJS
  student-list.ts       Funciones puras: filterStudents, paginate, getPageNumbers
data/students.mock.ts   Mock tipado de estudiantes
interfaces/
  student.interface.ts  Tipo Student
  nav-links.interface.ts  Tipo NavLinks ({ href, title })
  menu-item.interface.ts  Tipo MenuItem ({ path, icon, title, subtitle })
proxy.ts                Redirección al login desde rutas protegidas
```

## Cómo está construido

### Componentes y props

- Los datos bajan por props: `Navbar` recibe `links`, `StudentTable` recibe `students`, y `Section` envuelve a sus hijos con `children`.
- `StudentTable` no sabe de dónde vienen los datos: antes recibía el mock de `data/students.mock.ts`, ahora recibe la respuesta de la API, sin cambiar la tabla, la fila ni el badge.
- Las listas usan `key={student.id}` en el elemento que devuelve el `.map`.

### Server vs Client Components

| Server Component (por defecto) | Client Component (`"use client"`) |
|--------------------------------|-----------------------------------|
| Puede ser `async`, lee datos y secretos | No puede ser `async` |
| Su JS no se envía al navegador | Su JS se envía y se hidrata |
| Sin `useState`, `useEffect` ni `onClick` | Hooks, eventos y APIs del navegador |

En este repo:

- **Server Components:** `StudentTable`, `StudentRow`, `StudentBadge`, `Section`, `Brand`, `Paginator` y el layout. `app/(dashboard)/students/page.tsx` también lo es: llama a `getStudents()` y usa `connection()`, por eso no lleva `"use client"`.
- **Client Components:** `Navbar` y `SidebarMenu` (necesitan `usePathname`), `LoginForm` (necesita `useActionState`), `StudentSearch` (necesita `useRouter`, `useSearchParams` y `onChange`) y `app/(dashboard)/counter/page.tsx` (necesita `useState` y `onClick`).

`"use client"` no significa "solo se renderiza en el cliente": significa "desde aquí hacia abajo el código también viaja al navegador". Por eso solo se marca lo que lo necesita, y no el layout completo.

### Búsqueda y paginación en `/students`

El estado vive en la URL (`/students?q=ana&page=2`), no en `useState`: así se puede compartir el link y funciona el botón "atrás".

1. `StudentSearch` (cliente) espera 300 ms tras teclear, arma `?q=` con `router.replace`, y borra `page` para volver a la primera página.
2. `StudentResults` (async, dentro de `Suspense`) lee `searchParams`, pide los estudiantes con `getStudents()` (`GET {API_URL}/student?limit=1000`, en caché) y aplica `filterStudents` (por id, nombre o nickname, sin distinguir mayúsculas) y luego `paginate` (6 por página, `PAGE_SIZE`; la página se ajusta al rango válido).
3. `Paginator` genera los links con `Link` y conserva `q` en cada uno.

Hay dos `Suspense`: uno para el buscador (usa `useSearchParams`) y otro con el fallback "Cargando estudiantes..." para los resultados. El filtrado y la paginación ocurren en memoria sobre lo que devuelva la API, no en la API.

## Autenticación y creación de estudiantes

1. `RegisterForm` reutiliza `Input` y `SubmitButton`. Al enviar el formulario, `registerAction` valida los datos y llama a `POST /user/signup`. Si la API crea la cuenta, vuelve a `/login` con una confirmación.
2. `LoginForm` envía las credenciales a `loginAction`, que llama a `POST /user/auth`. Next.js guarda el JWT en una cookie `HttpOnly` durante una hora. El login exitoso abre `/students` o el destino interno válido de `from`.
3. `proxy.ts` intercepta `/students` y sus subrutas y `/counter`. Si falta la cookie, envía la visita a `/login` con la ruta original en `from`. `requireSession` consulta `GET /user/me` y NestJS valida la firma, la vigencia y que la cuenta siga activa. El layout usa `fullName` de ese perfil.
4. `CreateStudentForm` vive en `/students/new` y usa `useActionState` para mostrar errores y el estado de guardado. `createStudentAction` verifica la sesión antes de validar los campos y enviar `POST /student` con el JWT. El guard de NestJS vuelve a verificar el JWT antes de insertar. Al guardar, Next.js invalida el listado y abre el detalle del estudiante.
5. **Cerrar sesión** ejecuta `logoutAction`, borra la cookie y redirige a `/login`.

### Cómo probar la protección

1. Arranca NestJS y Next.js. En incógnito abre `http://localhost:3000/students/new`. Debe aparecer el login con `from=/students/new` en la URL. Repite con `/students` y con el detalle de un estudiante.
2. En `/register`, crea una cuenta de prueba. Debes volver a `/login`. Inicia sesión y verifica que aparezca tu nombre completo encima de **Estudiantes**.
3. Selecciona **Crear estudiante**. Usa un correo diferente al de tu cuenta, completa los campos y pulsa **Guardar estudiante**. Comprueba el nombre y el correo en la ficha y vuelve al listado para confirmar que aparece el registro.
4. Pulsa **Cerrar sesión** y vuelve a abrir `/students/new`. Debe aparecer de nuevo el login. Si inicias sesión desde esa pantalla, debes volver al formulario.
5. Para probar la API de forma directa, ejecuta `curl.exe -i -X POST http://localhost:9000/api/student -H "Content-Type: application/json" -d "{}"`. La respuesta esperada sin token es `401 Unauthorized`.

## Capa de acceso a la API: `lib/api.ts` y `lib/student-api.ts`

Las páginas ya no llaman a `fetch` directamente: pasan por esta capa.

### `lib/api.ts`

- `import "server-only"`: si un Client Component lo importa, el build falla. Así `API_URL` no viaja al navegador.
- `api`: instancia de axios con `baseURL: process.env.API_URL`, header `Content-Type: application/json` y `timeout` de 10 s.
- Las acciones usan el estado HTTP de los errores de axios para mostrar mensajes al usuario.

### `lib/student-api.ts`

Las consultas usan `"use cache"` y `cacheLife("minutes")`.

| Función | Request | Tag de caché |
|---------|---------|--------------|
| `getStudents(limit = 1000)` | `GET /student?limit={limit}` | `students` |
| `getStudent(term)` | `GET /student/{term}` (con `encodeURIComponent`) | `student` |
| `createStudent(student, token)` | `POST /student` con `Authorization: Bearer …` | — |

También reexporta los tipos `Student` y `Grade`.

## Qué hace `lib/student-list.ts`

Tres funciones puras (sin estado, sin efectos, sin dependencias de React) que usa `app/(dashboard)/students/page.tsx` para buscar y paginar en memoria. Al ser puras son fáciles de probar y funcionan igual en servidor y cliente.

### Tipo `Searchable`

```ts
type Searchable = { name: string; nickname: string; id: string }
```

Contrato mínimo de lo que se puede buscar. Las funciones no dependen de `Student` completo, solo de estos tres campos.

### `filterStudents(students, term = "")`

```ts
export function filterStudents<T extends Searchable>(students: T[], term = ""): T[]
```

1. **Genérico `T extends Searchable`:** acepta cualquier objeto que tenga `id`, `name` y `nickname`, y devuelve el mismo tipo `T` (no pierde los demás campos del estudiante).
2. **Normalización:** `term.trim().toLowerCase()` quita espacios y pasa a minúsculas.
3. **Atajo:** si el término queda vacío, devuelve la lista original sin filtrar.
4. **Filtro:** conserva al estudiante si **alguno** de `[id, name, nickname]` incluye el término (`.some` + `.includes`), también en minúsculas, así que no distingue mayúsculas.

### `paginate(students, page, pageSize)`

```ts
export function paginate<T>(students: T[], page: number, pageSize: number)
```

1. **`totalPages`:** `Math.ceil(total / pageSize)`, con mínimo 1 (`Math.max`) para que una lista vacía siga teniendo "página 1".
2. **`current`:** ajusta la página pedida al rango válido `[1, totalPages]`, por eso `?page=999` o `?page=-3` no rompen nada.
3. **`start`:** índice inicial `(current - 1) * pageSize`.
4. **Resultado:** `{ students, current, totalPages, total }`, donde `students` es el `slice(start, start + pageSize)` y `total` es la cantidad antes de paginar.

### `getPageNumbers(current, total)`

```ts
export function getPageNumbers(current: number, total: number): (number | "...")[]
```

Genera lo que pinta `Paginator`: números y, entre ellos, `"..."`.

1. **Pocas páginas:** si `total <= 5`, devuelve todas (`[1, 2, 3, ...]`).
2. **Páginas a mostrar:** arma `[1, current - 1, current, current + 1, total]` (primera, vecinas, actual y última). El `Set` elimina duplicados, el `filter` descarta lo fuera de `1..total` y el `sort` las ordena.
3. **Puntos suspensivos:** con `flatMap` recorre las páginas y, cuando corresponde, antepone `"..."` a la página.

Ejemplo (verificado): `getPageNumbers(1, 10)` devuelve `[1, 2, "...", 10]`.

> **Bug conocido en el paso 3:** la condición es `pages[i - 1] > 1` (la página anterior es mayor que 1), cuando debería ser `page - pages[i - 1] > 1` (hay un hueco real entre ambas). Resultado actual de `getPageNumbers(3, 10)`: `[1, 2, "...", 3, "...", 4, "...", 10]`, con `"..."` entre páginas consecutivas. Lo correcto sería `[1, 2, 3, 4, "...", 10]`.


## Qué hace `app/(dashboard)/students/page.tsx`

Página de listado `/students`. Es un Server Component que lee la URL (`?q=` y `?page=`), pide los estudiantes a la API y muestra tabla, contador y paginador.

### Imports y constante

- Usa `filterStudents` y `paginate` de `lib/student-list.ts`, los componentes de UI (`Section`, `StudentTable`, `StudentSearch`, `Paginator`) y el tipo `Student`.
- `PAGE_SIZE = 6` define cuántos estudiantes se muestran por página.

### `StudentResults` (componente async)

```tsx
async function StudentResults({ searchParams }: Pick<PageProps<"/students">, "searchParams">)
```

1. **Lee la URL:** `await searchParams` (en esta versión de Next es una Promise) y extrae `q` y `page`. `term` es `q` solo si es un `string` (también podría llegar como arreglo); si no, `""`.
2. **Pide los datos:** `getStudents()` de `lib/student-api.ts` (axios, con caché de minutos). Si la API falla, axios lanza el error.
3. **`await connection()`:** marca el render como dinámico (por request), así que la lista no se congela en el build.
4. **Filtra y pagina:** `filterStudents(studentList, term)` y luego `paginate(refinedList, Number(page) || 1, PAGE_SIZE)`. Si `page` no es un número válido cae a la página 1.
5. **Pinta:**
   - Un `<p>` con la fecha de generación (`new Date().toISOString()`).
   - `StudentTable` si hay resultados; si no, el mensaje "No se encontraron estudiantes con {term}".
   - Un `<footer>` con el total y el `Paginator`, que recibe `basePath="/students"`, la página actual, el total de páginas y `params={{ q: term }}` (solo si hay término) para conservar la búsqueda al cambiar de página.

### `StudentPage` (export por defecto)

Es síncrona y no hace `await`: solo arma la estructura y le pasa a `StudentResults` la Promise de `searchParams`. Tiene dos `Suspense`:

- Uno para `StudentSearch`, que usa `useSearchParams`.
- Otro para `StudentResults`, con el fallback "Cargando estudiantes...". Mientras llegan los datos se ve el buscador y el título, no una pantalla en blanco.

## Qué hace `app/(dashboard)/students/[id]/page.tsx`

Página de detalle `/students/:id`. El segmento `[id]` es dinámico: el valor de la URL llega en `params.id`.

### `getStudentById(id)` (con caché)

```ts
async function getStudentById(id: string) {
  "use cache"
  cacheLife("minutes");
  cacheTag("students", `student-${id}`)
  const student = await getStudent(id)   // lib/student-api.ts
  return { student, generatedAt: new Date().toISOString() }
}
```

1. **`"use cache"`:** el resultado de la función se guarda en caché (requiere `cacheComponents`, activo en `next.config.ts`). El `id` forma parte de la clave, así que cada estudiante tiene su propia entrada.
2. **`cacheLife("minutes")`:** perfil de duración corto; pasado ese tiempo se vuelve a pedir a la API.
3. **`cacheTag("students", "student-<id>")`:** etiquetas para invalidar a demanda con `revalidateTag`: todas las del listado (`students`) o solo un estudiante (`student-<id>`).
4. **Fetch:** delega en `getStudent(id)` de `lib/student-api.ts` (`GET {API_URL}/student/{id}`). Hay dos capas de caché: la de `getStudent` y la de `getStudentById`.
5. **Retorno:** `{ student, generatedAt }`. Como `generatedAt` se calcula dentro de la función cacheada, la fecha mostrada es la de cuando se generó el caché, no la del request.

### `StudentDetail` y `StudentDetailPage`

- `StudentDetail` verifica la sesión, lee `params` y llama a `getStudentById`. Muestra el nombre, email, `@nickname`, las notas si existen y la fecha de generación del caché.
- `StudentDetailPage` (export por defecto, síncrona) envuelve a `StudentDetail` en un `Suspense` con el fallback "Cargando estudiante...", y le pasa la Promise de `params` sin esperarla.

## Scripts

| Comando | Para qué sirve |
|---------|----------------|
| `pnpm dev` | Servidor de desarrollo (Turbopack) |
| `pnpm build` | Build de producción, imprime la tabla de rutas |
| `pnpm start` | Sirve el build de producción |
| `pnpm lint` | ESLint |
