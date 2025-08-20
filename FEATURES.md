# 🚀 Nuevas Características del Sistema de Snacks

## 📦 Sistema de Compra por Contenedores y Venta por Unidades

### **Características Principales:**

#### **1. Tipo de Compra Flexible**
- ✅ **Compra por Caja**: Para productos que vienen en cajas
- ✅ **Compra por Funda**: Para productos que vienen en fundas/bolsas
- ✅ **Selector visual** con iconos diferenciados

#### **2. Cálculos Automáticos**
- ✅ **Costo por unidad** = `container_cost / units_per_container`
- ✅ **Ganancia por unidad** = `unit_sale_price - unit_cost`
- ✅ **Triggers automáticos** en la base de datos
- ✅ **Cálculos en tiempo real** en el formulario

#### **3. Select Personalizado Mejorado**
- ✅ **Búsqueda integrada** en dropdowns
- ✅ **Iconos descriptivos** para cada opción
- ✅ **Descripciones adicionales** para mejor contexto
- ✅ **Animaciones suaves** y transiciones
- ✅ **Responsive design** para móviles

### **Estructura de Datos Actualizada:**

```typescript
interface Snack {
    id_snack: string;
    name: string;
    // Purchase information
    purchase_type: 'box' | 'bag';           // Tipo de contenedor
    units_per_container: number;            // Unidades por contenedor
    container_cost: number;                 // Costo del contenedor
    containers_purchased: number;           // Cantidad de contenedores comprados
    // Unit pricing
    unit_cost: number;                      // Costo por unidad (calculado)
    unit_sale_price: number;                // Precio de venta por unidad
    profit_margin_per_unit: number;         // Ganancia por unidad (calculada)
    // Stock tracking
    stock: number;                          // Stock en unidades (calculado: containers_purchased × units_per_container)
}
```

### **Flujo de Trabajo:**

#### **1. Crear Snack:**
1. **Seleccionar tipo de compra** (Caja/Funda)
2. **Ingresar unidades por contenedor**
3. **Ingresar costo del contenedor**
4. **Ingresar cantidad de contenedores comprados**
5. **Ingresar precio de venta por unidad**
6. **Sistema calcula automáticamente:**
   - Stock disponible (contenedores × unidades)
   - Costo por unidad
   - Ganancia por unidad
   - Ganancia total estimada

#### **2. Realizar Venta:**
1. **Seleccionar snack** (con información de stock)
2. **Seleccionar persona**
3. **Ingresar cantidad** (en unidades)
4. **Sistema valida stock** disponible
5. **Sistema calcula total** basado en precio por unidad

### **Mejoras en la UI/UX:**

#### **Selector Personalizado:**
```typescript
// Ejemplo de uso
<Select
    label="Tipo de Compra"
    value={purchaseType}
    onChange={handleChange}
    options={[
        {
            value: 'box',
            label: 'Caja',
            icon: <Package2 className="h-4 w-4" />,
            description: 'Compra por caja'
        },
        {
            value: 'bag',
            label: 'Funda',
            icon: <ShoppingBag className="h-4 w-4" />,
            description: 'Compra por funda'
        }
    ]}
    placeholder="Seleccionar tipo"
    required
/>
```

#### **Características del Select:**
- 🔍 **Búsqueda en tiempo real**
- 🎨 **Iconos y descripciones**
- ⌨️ **Navegación con teclado**
- 📱 **Responsive design**
- 🎯 **Selección con click fuera**
- 🔄 **Animaciones suaves**

#### **Mejoras en Inputs Numéricos:**
- 🎯 **Borrado fácil** - Los usuarios pueden borrar el 0 para escribir nuevos números
- ⚡ **Validación automática** - Respeta los valores mínimos y máximos
- 🎨 **UX mejorada** - No hay problemas con el cursor al editar
- 🔄 **Cálculos en tiempo real** - Los valores se actualizan inmediatamente

### **Base de Datos:**

#### **Nuevas Columnas:**
```sql
ALTER TABLE snack ADD COLUMN purchase_type VARCHAR(10) DEFAULT 'box';
ALTER TABLE snack ADD COLUMN units_per_container INTEGER DEFAULT 1;
ALTER TABLE snack ADD COLUMN container_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE snack ADD COLUMN containers_purchased INTEGER DEFAULT 1;
ALTER TABLE snack ADD COLUMN unit_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE snack ADD COLUMN unit_sale_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE snack ADD COLUMN profit_margin_per_unit DECIMAL(10,2) DEFAULT 0;
```

#### **Triggers Automáticos:**
```sql
CREATE TRIGGER trigger_calculate_snack_metrics
    BEFORE INSERT OR UPDATE ON snack
    FOR EACH ROW
    EXECUTE FUNCTION calculate_snack_metrics();

-- Función que calcula automáticamente:
-- - unit_cost = container_cost / units_per_container
-- - profit_margin_per_unit = unit_sale_price - unit_cost
-- - stock = containers_purchased * units_per_container
```

### **Beneficios del Sistema:**

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Compra** | Solo por unidad | Por contenedor (caja/funda) |
| **Venta** | Por unidad | Por unidad (flexible) |
| **Cálculos** | Manuales | Automáticos |
| **Selectores** | Básicos | Personalizados con búsqueda |
| **UX** | Estática | Dinámica con feedback |

### **Próximos Pasos:**

1. **Ejecutar migración** de base de datos
2. **Probar creación** de snacks con nuevos campos
3. **Verificar cálculos** automáticos
4. **Probar ventas** con nuevo sistema
5. **Validar reportes** con nuevos cálculos

### **Archivos Modificados:**

- ✅ `src/types/index.ts` - Tipos actualizados
- ✅ `src/lib/supabase.ts` - Esquema actualizado
- ✅ `src/lib/api.ts` - Lógica de cálculos
- ✅ `src/components/ui/Select.tsx` - Componente mejorado
- ✅ `src/components/ui/Input.tsx` - Manejo mejorado de inputs numéricos
- ✅ `src/lib/utils.ts` - Funciones utilitarias
- ✅ `src/app/snacks/page.tsx` - Formulario actualizado
- ✅ `src/app/sales/page.tsx` - Selectores mejorados
- ✅ `src/app/debts/page.tsx` - Input de pago mejorado
- ✅ `database-migration.sql` - Script de migración

**¡El sistema ahora es más flexible, intuitivo y eficiente!** 🎉
