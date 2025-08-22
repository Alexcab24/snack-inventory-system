# Sistema de Autenticación - Snack Management System

## Resumen

Se ha implementado un sistema de autenticación completo con dos niveles de acceso:

### 🔓 **Acceso Público (Sin Login)**
- **URL**: `/public`
- **Funcionalidad**: Solo ver snacks disponibles con stock y precio de venta
- **Características**:
  - Lista de snacks con stock > 0
  - Muestra nombre, stock disponible y precio por unidad
  - Búsqueda de snacks
  - Diseño atractivo y responsive
  - Enlace para acceso administrativo

### 🔐 **Acceso Administrativo (Con Login)**
- **URL**: `/` (página principal)
- **Funcionalidad**: Acceso completo al sistema
- **Características**:
  - Gestión completa de snacks (crear, editar, eliminar)
  - Gestión de personas
  - Gestión de ventas
  - Gestión de deudas
  - Reportes y análisis
  - Movimientos del sistema

## Credenciales de Administrador

### Credenciales por Defecto
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Cambiar Credenciales

Para cambiar las credenciales, edita el archivo `src/lib/config.ts`:

```typescript
export const ADMIN_CREDENTIALS = {
  username: 'tu_usuario',    // Cambia aquí
  password: 'tu_password'    // Cambia aquí
};

export const ADMIN_USERS = [
  {
    username: 'tu_usuario',    // Cambia aquí
    password: 'tu_password',   // Cambia aquí
    role: 'admin' as const
  },
  // Puedes agregar más usuarios aquí
];
```

## Estructura de Archivos

```
src/
├── components/
│   └── auth/
│       ├── AuthProvider.tsx    # Provider de autenticación
│       └── LoginForm.tsx       # Formulario de login
├── lib/
│   ├── auth.ts                 # Lógica de autenticación
│   └── config.ts               # Configuración de credenciales
└── app/
    ├── login/
    │   ├── layout.tsx          # Layout para página de login
    │   └── page.tsx            # Página de login
    ├── public/
    │   ├── layout.tsx          # Layout para vista pública
    │   └── page.tsx            # Vista pública de snacks
    └── layout.tsx              # Layout principal con AuthProvider
```

## Flujo de Autenticación

1. **Usuario no autenticado**:
   - Se muestra el formulario de login
   - Puede acceder a `/public` para ver snacks sin login

2. **Login exitoso**:
   - Se almacena la sesión en localStorage
   - Se redirige a la página principal (`/`)
   - Se muestra la navegación completa con botón de logout

3. **Usuario autenticado**:
   - Acceso completo a todas las funcionalidades
   - Información del usuario visible en la navegación
   - Botón de logout disponible

4. **Logout**:
   - Se elimina la sesión del localStorage
   - Se redirige al formulario de login

## Características de Seguridad

- **Autenticación simple**: Usando localStorage (para desarrollo)
- **Protección de rutas**: Solo usuarios autenticados acceden al sistema completo
- **Vista pública**: Acceso limitado solo a información básica de snacks
- **Configuración centralizada**: Credenciales en archivo de configuración

## Personalización

### Agregar Más Usuarios

Edita `src/lib/config.ts` para agregar más usuarios:

```typescript
export const ADMIN_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin' as const
  },
  {
    username: 'manager',
    password: 'manager123',
    role: 'admin' as const
  },
  {
    username: 'supervisor',
    password: 'super123',
    role: 'admin' as const
  }
];
```

### Cambiar Diseño del Login

Modifica `src/components/auth/LoginForm.tsx` para personalizar:
- Colores y estilos
- Mensajes y textos
- Validaciones adicionales

### Implementar Autenticación Real

Para producción, reemplaza la autenticación simple con:
- Supabase Auth
- NextAuth.js
- Firebase Auth
- O cualquier otro proveedor de autenticación

## Uso del Sistema

### Para Clientes/Visitantes
1. Acceder a `/public`
2. Ver snacks disponibles
3. Ver precios y stock
4. Usar búsqueda para encontrar productos

### Para Administradores
1. Acceder a `/login`
2. Ingresar credenciales
3. Acceder al sistema completo
4. Gestionar inventario, ventas, etc.
5. Usar logout cuando termine

## Notas Importantes

- Las credenciales están en texto plano en el código (solo para desarrollo)
- En producción, usar variables de entorno para las credenciales
- El sistema usa localStorage para persistir la sesión
- La vista pública no requiere autenticación
- Todos los cambios de credenciales requieren reiniciar la aplicación
