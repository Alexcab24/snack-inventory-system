# Instrucciones de Migración - Múltiples Items por Venta

## Descripción
Esta migración actualiza la estructura de la base de datos para permitir que una venta contenga múltiples snacks (items) en lugar de solo uno.

## Cambios Realizados

### 1. Nueva Estructura de Base de Datos
- **Nueva tabla `sale_item`**: Almacena los items individuales de cada venta
- **Tabla `sale` actualizada**: Ahora solo contiene información general de la venta (persona, total, estado de pago)
- **Nueva columna `sale_date`**: Permite especificar la fecha de venta por separado de la fecha de creación

### 2. Nuevas Funcionalidades
- **Carrito de compras**: Interfaz para agregar múltiples snacks a una venta
- **Gestión de stock**: Validación de stock para cada item individual
- **Cálculo automático**: Total calculado automáticamente basado en todos los items
- **Fecha de venta personalizable**: Campo para especificar la fecha de la venta

## Pasos para Aplicar la Migración

### 1. Ejecutar la Migración SQL Principal
```bash
# Conectar a tu base de datos PostgreSQL/Supabase
psql -h your-host -U your-user -d your-database -f sales-migration.sql
```

O ejecutar el contenido del archivo `sales-migration.sql` en tu cliente SQL.

### 2. Ejecutar la Migración de Fecha de Venta
```bash
# Ejecutar la migración para agregar sale_date
psql -h your-host -U your-user -d your-database -f add-sale-date-migration.sql
```

O ejecutar el contenido del archivo `add-sale-date-migration.sql` en tu cliente SQL.

### 3. Verificar la Migración
Después de ejecutar la migración, verifica que:
- La tabla `sale_item` se creó correctamente
- Los datos existentes se migraron (cada venta existente tendrá un item correspondiente)
- La columna `sale_date` se agregó a la tabla `sale`
- Las nuevas ventas se pueden crear con múltiples items y fecha personalizable

### 4. Probar la Nueva Funcionalidad
1. Ve a la página de Ventas
2. Haz clic en "Nueva Venta"
3. Selecciona una persona
4. Verifica que la fecha actual aparezca por defecto
5. Agrega múltiples snacks al carrito
6. Verifica que el total se calcule correctamente
7. Completa la venta

## Estructura de Datos

### Antes (Estructura Anterior)
```sql
sale {
  id_sale
  snack_id      -- Solo un snack por venta
  person_id
  quantity      -- Cantidad del snack
  total
  paid
  created_at
}
```

### Después (Nueva Estructura)
```sql
sale {
  id_sale
  person_id
  sale_date     -- Fecha de la venta (nueva)
  total         -- Total de todos los items
  paid
  created_at
}

sale_item {
  id_sale_item
  sale_id       -- Referencia a la venta
  snack_id      -- Referencia al snack
  quantity      -- Cantidad de este snack
  unit_price    -- Precio unitario
  subtotal      -- Subtotal para este item
  created_at
}
```

## Beneficios de la Nueva Estructura

1. **Flexibilidad**: Una venta puede contener cualquier número de snacks
2. **Mejor UX**: Interfaz de carrito de compras más intuitiva
3. **Precisión**: Cada item tiene su propio precio unitario y subtotal
4. **Escalabilidad**: Fácil agregar funcionalidades como descuentos por item
5. **Control de fechas**: Permite registrar ventas con fechas específicas

## Notas Importantes

- **Datos existentes**: La migración preserva todas las ventas existentes
- **Compatibilidad**: El sistema sigue funcionando con la estructura anterior durante la migración
- **Rollback**: Si necesitas revertir, puedes eliminar la tabla `sale_item` y restaurar las columnas originales
- **Fecha por defecto**: Las nuevas ventas tendrán la fecha actual por defecto

## Solución de Problemas

### Error: "relation 'sale_item' already exists"
- La tabla ya existe, puedes omitir este error

### Error: "duplicate key value violates unique constraint"
- Los datos ya fueron migrados, puedes omitir este error

### Error: "column 'snack_id' does not exist"
- La migración se ejecutó parcialmente, verifica el estado de la base de datos

### Error: "column 'sale_date' already exists"
- La columna ya existe, puedes omitir este error

## Soporte
Si encuentras problemas durante la migración, verifica:
1. Los logs de la base de datos
2. El estado de las tablas existentes
3. Los permisos del usuario de base de datos
