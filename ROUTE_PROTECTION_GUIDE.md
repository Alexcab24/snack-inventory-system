# Guía de Protección de Rutas - Sistema de Autenticación

## 🛡️ **Protección de Rutas Implementada**

### **Objetivo**
Privatizar todas las rutas administrativas para que solo usuarios autenticados puedan acceder a ellas. Los usuarios no autenticados solo pueden acceder a la página principal (vista pública).

## 📁 **Estructura de Protección**

### **Rutas Públicas (Sin Login)**
- ✅ **`/`** - Página principal con vista pública de snacks
- ✅ **`/login`** - Página de login para administradores

### **Rutas Protegidas (Requieren Login)**
- 🔒 **`/snacks`** - Gestión de snacks
- 🔒 **`/people`** - Gestión de personas
- 🔒 **`/sales`** - Gestión de ventas
- 🔒 **`/debts`** - Gestión de deudas
- 🔒 **`/reports`** - Reportes y análisis
- 🔒 **`/movements`** - Historial de movimientos

## 🔧 **Componentes Implementados**

### **1. ProtectedRoute Component**
**Archivo**: `src/components/auth/ProtectedRoute.tsx`

```typescript
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, mounted } = useAuth();
  const router = useRouter();
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      setShowAccessDenied(true); // Muestra mensaje de acceso denegado
    }
  }, [isAuthenticated, loading, mounted]);

  // Muestra loading mientras verifica autenticación
  if (loading || !mounted) {
    return <LoadingSpinner />;
  }

  // Si no está autenticado, muestra mensaje de acceso denegado
  if (!isAuthenticated && showAccessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-slate-900">Acceso Denegado</h1>
            <p className="text-slate-600 leading-relaxed">
              No tienes permisos para acceder a esta sección. 
              Esta área es exclusiva para administradores del sistema.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg">
            <Lock className="h-4 w-4" />
            <span>Área Administrativa Protegida</span>
          </div>

          <div className="space-y-3">
            <Button onClick={() => router.push('/')} className="w-full bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
            
            <Button onClick={() => router.push('/login')} variant="secondary" className="w-full">
              Iniciar Sesión como Administrador
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Si está autenticado, muestra el contenido protegido
  return <>{children}</>;
}
```

### **2. Layouts de Protección**
Cada ruta administrativa tiene su propio layout que envuelve el contenido con `ProtectedRoute`:

#### **Snacks Layout** (`src/app/snacks/layout.tsx`)
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SnacksLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
```

#### **People Layout** (`src/app/people/layout.tsx`)
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function PeopleLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
```

#### **Sales Layout** (`src/app/sales/layout.tsx`)
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
```

#### **Debts Layout** (`src/app/debts/layout.tsx`)
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DebtsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
```

#### **Reports Layout** (`src/app/reports/layout.tsx`)
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
```

#### **Movements Layout** (`src/app/movements/layout.tsx`)
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MovementsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
```

## 🔄 **Flujo de Protección**

### **Usuario No Autenticado**
1. **Intenta acceder** a `/snacks`, `/people`, `/sales`, etc.
2. **ProtectedRoute detecta** que no está autenticado
3. **Muestra mensaje de "Acceso Denegado"** con opciones claras
4. **Puede elegir** entre volver al inicio o ir al login

### **Usuario Autenticado**
1. **Accede** a cualquier ruta administrativa
2. **ProtectedRoute verifica** autenticación
3. **Permite acceso** al contenido protegido
4. **Muestra AdminLayout** con navegación completa

## 🎯 **Características de Seguridad**

### ✅ **Protección Automática**
- Todas las rutas administrativas están protegidas automáticamente
- No es posible acceder directamente a URLs protegidas sin autenticación

### ✅ **Mensaje de Acceso Denegado**
- Usuarios no autenticados ven un mensaje claro y profesional
- Opciones claras para volver al inicio o ir al login
- No se muestran errores 404 o páginas en blanco

## 🚫 **Mensaje de Acceso Denegado**

### **Diseño del Mensaje**
- **Icono de escudo** en rojo para indicar restricción
- **Título claro**: "Acceso Denegado"
- **Explicación detallada** del motivo
- **Indicador visual** de "Área Administrativa Protegida"

### **Opciones de Navegación**
- **"Volver al Inicio"**: Regresa a la vista pública de snacks
- **"Iniciar Sesión como Administrador"**: Va directamente al login

### **Características Visuales**
- **Diseño centrado** y profesional
- **Colores consistentes** con el sistema
- **Iconos intuitivos** para mejor UX
- **Responsive** para móvil y desktop

### ✅ **Experiencia de Usuario**
- Loading spinner mientras se verifica la autenticación
- Transiciones suaves entre estados
- No hay saltos visuales o contenido flash

### ✅ **Persistencia de Sesión**
- La autenticación persiste en `localStorage`
- No es necesario volver a hacer login en cada navegación

## 📋 **Casos de Uso**

### **🔓 Cliente Normal (Sin Login)**
- **Puede acceder**: `/` (vista pública de snacks)
- **No puede acceder**: Cualquier ruta administrativa
- **Experiencia**: Ve snacks disponibles con precios

### **🔐 Administrador (Con Login)**
- **Puede acceder**: Todas las rutas del sistema
- **Experiencia completa**: Gestión de snacks, personas, ventas, etc.
- **Navegación**: Header completo con todas las opciones

## 🚀 **Beneficios Implementados**

### **Seguridad**
- ✅ Acceso controlado a funcionalidades administrativas
- ✅ Protección contra acceso no autorizado
- ✅ Redirección automática para usuarios no válidos

### **Experiencia de Usuario**
- ✅ Interfaz clara para diferentes tipos de usuarios
- ✅ Navegación intuitiva y consistente
- ✅ Transiciones suaves entre estados

### **Mantenibilidad**
- ✅ Código modular y reutilizable
- ✅ Fácil agregar nuevas rutas protegidas
- ✅ Separación clara de responsabilidades

## 🔧 **Para Agregar Nuevas Rutas Protegidas**

1. **Crear la página** en `src/app/nueva-ruta/page.tsx`
2. **Crear el layout** en `src/app/nueva-ruta/layout.tsx`:
   ```typescript
   import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
   
   export default function NuevaRutaLayout({ children }: { children: React.ReactNode }) {
     return <ProtectedRoute>{children}</ProtectedRoute>;
   }
   ```
3. **Usar AdminLayout** en la página para mantener consistencia

## 📝 **Notas Importantes**

- **Rutas públicas**: Solo `/` y `/login` son accesibles sin autenticación
- **Rutas protegidas**: Todas las demás requieren login de administrador
- **Acceso denegado**: Usuarios no autenticados ven mensaje claro con opciones
- **Persistencia**: La sesión se mantiene hasta hacer logout
- **Performance**: Verificación rápida de autenticación en cada ruta
- **UX mejorada**: Mensaje profesional en lugar de redirección automática
