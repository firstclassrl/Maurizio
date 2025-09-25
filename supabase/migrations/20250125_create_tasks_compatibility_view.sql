-- Create a compatibility view for tasks table
-- This view maps the old tasks table structure to the new activities table structure

CREATE OR REPLACE VIEW public.tasks AS
SELECT 
    a.id,
    a.user_id,
    p.numero as pratica,
    a.attivita,
    a.data as scadenza,
    a.ora,
    a.stato,
    CASE 
        WHEN a.priorita >= 8 THEN true 
        ELSE false 
    END as urgent,
    a.note,
    c.nome as cliente,
    c2.nome as controparte,
    a.categoria,
    false as evaso, -- Default value for compatibility
    a.created_at,
    a.updated_at
FROM public.activities a
JOIN public.practices p ON a.pratica_id = p.id
JOIN public.clients c ON p.cliente_id = c.id
LEFT JOIN public.clients c2 ON c2.id = ANY(
    SELECT jsonb_array_elements_text(p.controparti_ids)::uuid
    LIMIT 1
);

-- Create RLS policies for the view
CREATE POLICY "Users can view their own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

-- Note: INSERT, UPDATE, DELETE operations on this view will not work
-- The application should be updated to use the activities table directly
-- This view is only for backward compatibility with existing queries

-- Add comment to document the view
COMMENT ON VIEW public.tasks IS 'Compatibility view for tasks table. Maps to activities table structure. Read-only.';
