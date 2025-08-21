-- Activity Log migration
-- Creates a generic log table to record all movements (create/update/delete and domain events)

CREATE TABLE IF NOT EXISTS activity_log (
    id_log UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- e.g., 'snack', 'person', 'sale', 'debt', 'system'
    entity_id UUID NULL,       -- may be null for system-wide events
    action TEXT NOT NULL,      -- e.g., 'create', 'update', 'delete', 'sale_created', 'stock_decreased', 'debt_created', 'payment_added', 'debt_paid'
    description TEXT,
    details JSONB,             -- arbitrary structured metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);


