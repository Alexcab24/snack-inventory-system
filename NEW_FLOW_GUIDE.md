# Nuevo Flujo del Sistema - Snack Management System

## Resumen del Cambio

El sistema ahora funciona de manera más intuitiva:

### 🔓 **Vista Pública (Por Defecto)**
- **Acceso**: Cualquier usuario que visite `/`
- **Funcionalidad**: Ver snacks disponibles con precios y stock
- **Navegación**: Solo botón de "Acceso Administrativo"

### 🔐 **Vista Administrativa (Con Login)**
- **Acceso**: Solo después de login exitoso
- **Funcionalidad**: Acceso completo al sistema de gestión
- **Navegación**: Menú completo con todas las opciones

## Flujo de Usuario

### 1. **Usuario Normal (Sin Login)**
```
1. Usuario visita el sitio
2. Ve automáticamente la página de snacks disponibles
3. Puede buscar y ver precios
4. Ve botón "Acceso Administrativo" en la esquina superior derecha
5. Si hace clic, va a la página de login
```

### 2. **Administrador (Con Login)**
```
1. Usuario hace clic en "Acceso Administrativo"
2. Va a página de login (/login)
3. Ingresa credenciales
4. Es redirigido al dashboard administrativo
5. Ve menú completo con todas las opciones
6. Puede gestionar snacks, ventas, reportes, etc.
```

## Estructura de Archivos

### Nuevos Componentes:
- `src/components/public/PublicSnacksView.tsx` - Vista pública principal
- `src/components/layout/PublicNavigation.tsx` - Navegación para vista pública

### Archivos Modificados:
- `src/app/page.tsx` - Lógica condicional para mostrar vista pública o administrativa
- `src/app/layout.tsx` - Simplificado para permitir diferentes layouts
- `src/components/auth/AuthProvider.tsx` - No fuerza login automático

## Características de la Vista Pública

### ✅ **Lo que SÍ ve el usuario normal:**
- Lista de snacks disponibles (stock > 0)
- Precios por unidad
- Stock disponible
- Tipo de empaque (caja/funda)
- Búsqueda de snacks
- Botón de acceso administrativo

### ❌ **Lo que NO ve el usuario normal:**
- Información de costos
- Margen de ganancia
- Opciones de gestión
- Menú administrativo
- Reportes

## Características de la Vista Administrativa

### ✅ **Lo que ve el administrador:**
- Dashboard completo
- Gestión de snacks (crear, editar, eliminar)
- Gestión de personas
- Gestión de ventas
- Gestión de deudas
- Reportes y análisis
- Movimientos del sistema
- Información completa de costos y ganancias

## URLs del Sistema

- **`/`** - Vista pública (snacks disponibles) o dashboard administrativo
- **`/login`** - Página de login para administradores
- **`/snacks`** - Gestión de snacks (solo administradores)
- **`/people`** - Gestión de personas (solo administradores)
- **`/sales`** - Gestión de ventas (solo administradores)
- **`/debts`** - Gestión de deudas (solo administradores)
- **`/reports`** - Reportes (solo administradores)
- **`/movements`** - Movimientos (solo administradores)

## Credenciales de Administrador

- **Usuario**: `admin`
- **Contraseña**: `admin123`

*Cambiar en `src/lib/config.ts`*

## Beneficios del Nuevo Flujo

### 🎯 **Para Usuarios Normales:**
- Acceso inmediato a información de snacks
- No necesita crear cuenta
- Interfaz simple y clara
- Fácil acceso al botón de login si es administrador

### 🎯 **Para Administradores:**
- Acceso seguro con credenciales
- Dashboard completo y funcional
- Todas las herramientas de gestión disponibles
- Experiencia administrativa completa

### 🎯 **Para el Sistema:**
- Mejor UX para diferentes tipos de usuarios
- Separación clara entre vista pública y administrativa
- Sistema más intuitivo y fácil de usar
- Mantiene la seguridad para funciones administrativas

## Implementación Técnica

### Lógica Condicional en Página Principal:
```typescript
export default function Home() {
  const { user, isAuthenticated } = useAuth();

  // Si está autenticado, mostrar dashboard administrativo
  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  // Si no está autenticado, mostrar vista pública
  return <PublicSnacksView />;
}
```

### Componentes Específicos:
- `PublicSnacksView` - Maneja la vista pública
- `PublicNavigation` - Navegación específica para vista pública
- `Navigation` - Navegación completa para administradores

## Uso del Sistema

### Para Clientes/Visitantes:
1. Visitar el sitio web
2. Ver snacks disponibles y precios
3. Usar búsqueda si es necesario
4. Contactar administrador si necesita acceso especial

### Para Administradores:
1. Hacer clic en "Acceso Administrativo"
2. Ingresar credenciales
3. Acceder al dashboard completo
4. Gestionar el sistema según sea necesario
5. Usar logout cuando termine

## Notas Importantes

- La vista pública es la página por defecto
- Solo los administradores ven el menú completo
- El sistema mantiene la seguridad para funciones administrativas
- La experiencia es más intuitiva para ambos tipos de usuarios
- El botón de login es prominente pero no intrusivo
