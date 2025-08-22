# Instrucciones para Debuggear el Problema de Login

## Problema
Cuando el administrador se logea, no entra al espacio administrativo y se queda en la vista de usuario normal.

## Pasos para Debuggear

### 1. **Abrir las Herramientas de Desarrollo**
- Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux) o `Cmd+Option+I` (Mac)
- Ve a la pestaña "Console"

### 2. **Verificar el Estado de Autenticación**
- En la esquina superior derecha de la página, deberías ver un panel negro con información de debug
- Esto muestra el estado actual de autenticación

### 3. **Probar el Login**
1. Ve a `/login`
2. Ingresa las credenciales:
   - Usuario: `admin`
   - Contraseña: `admin123`
3. Haz clic en "Iniciar Sesión"
4. Observa los logs en la consola

### 4. **Logs que Deberías Ver**

#### Durante el Login:
```
Login attempt: {username: "admin", password: "admin123"}
Available users: [{username: "admin", password: "admin123", role: "admin"}]
Found admin user: {username: "admin", password: "admin123", role: "admin"}
User saved to localStorage: {id: "admin", username: "admin", role: "admin"}
Login successful, user set: {id: "admin", username: "admin", role: "admin"}
```

#### Después del Login:
```
Auth state changed: {user: {id: "admin", username: "admin", role: "admin"}, isAuthenticated: true}
Auth state: {user: {id: "admin", username: "admin", role: "admin"}, isAuthenticated: true}
```

### 5. **Verificar el Panel de Debug**
El panel negro en la esquina superior derecha debería mostrar:
- User: admin
- Authenticated: true
- Admin: true

### 6. **Si el Problema Persiste**

#### Verificar localStorage:
1. En las herramientas de desarrollo, ve a "Application" (Chrome) o "Storage" (Firefox)
2. Busca "Local Storage" en el panel izquierdo
3. Haz clic en tu dominio
4. Busca la clave `snack_system_auth`
5. Debería contener: `{"id":"admin","username":"admin","role":"admin"}`

#### Verificar Configuración:
1. Abre `src/lib/config.ts`
2. Verifica que las credenciales sean correctas:
```typescript
export const ADMIN_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin' as const
  }
];
```

### 7. **Posibles Soluciones**

#### Si los logs no aparecen:
- El problema está en el formulario de login
- Verifica que el LoginForm esté usando `useAuth()` correctamente

#### Si los logs aparecen pero el estado no cambia:
- El problema está en el hook useAuth
- Verifica que `setUser()` se esté llamando correctamente

#### Si el estado cambia pero la vista no:
- El problema está en la lógica condicional de la página principal
- Verifica que `isAuthenticated` sea `true`

### 8. **Comandos para Reiniciar**

Si necesitas reiniciar el servidor de desarrollo:
```bash
# Detener el servidor (Ctrl+C)
# Luego ejecutar:
npm run dev
```

### 9. **Limpiar localStorage**

Si necesitas limpiar la sesión:
1. En las herramientas de desarrollo, ve a "Application" > "Local Storage"
2. Elimina la clave `snack_system_auth`
3. Recarga la página

## Información de Contacto

Si el problema persiste después de seguir estos pasos, proporciona:
1. Los logs completos de la consola
2. Una captura de pantalla del panel de debug
3. El contenido del localStorage
