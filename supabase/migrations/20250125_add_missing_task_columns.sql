-- Add missing columns to tasks table for new activity system
-- This migration adds the columns needed for the new practice-based activity system

-- Add new columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS categoria TEXT,
ADD COLUMN IF NOT EXISTS ora TIME,
ADD COLUMN IF NOT EXISTS autorita_giudiziaria TEXT,
ADD COLUMN IF NOT EXISTS rg TEXT,
ADD COLUMN IF NOT EXISTS giudice TEXT;

-- Add comments for documentation
COMMENT ON COLUMN tasks.categoria IS 'Activity category (Appuntamento, Scadenza, etc.)';
COMMENT ON COLUMN tasks.ora IS 'Time for the activity';
COMMENT ON COLUMN tasks.autorita_giudiziaria IS 'Judicial authority for judicial procedures';
COMMENT ON COLUMN tasks.rg IS 'RG number for judicial procedures';
COMMENT ON COLUMN tasks.giudice IS 'Judge name for judicial procedures';

-- Update existing tasks to have default values
UPDATE tasks 
SET categoria = 'Attività da Svolgere'
WHERE categoria IS NULL;

-- Add constraint for categoria values
ALTER TABLE tasks 
ADD CONSTRAINT check_categoria 
CHECK (categoria IN (
  'Appuntamento', 
  'Scadenza', 
  'Attività da Svolgere',
  'Udienza',
  'Scadenza Processuale',
  'Attività Processuale'
));

-- Create index for better performance on categoria
CREATE INDEX IF NOT EXISTS idx_tasks_categoria ON tasks(categoria);
