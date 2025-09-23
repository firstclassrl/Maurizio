-- Rename 'parte' column to 'cliente' in tasks table
-- This migration renames the 'parte' field to 'cliente' to better reflect its purpose

-- Add the new 'cliente' column
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS cliente TEXT;

-- Copy data from 'parte' to 'cliente' if 'parte' exists
UPDATE tasks 
SET cliente = parte 
WHERE parte IS NOT NULL AND cliente IS NULL;

-- Add comment for the new column
COMMENT ON COLUMN tasks.cliente IS 'Client involved in the case';

-- Note: We keep the 'parte' column for now to ensure data integrity
-- It can be dropped in a future migration after verifying the change is successful
