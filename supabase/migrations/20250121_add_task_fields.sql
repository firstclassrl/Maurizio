-- Add new fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS note TEXT,
ADD COLUMN IF NOT EXISTS parte TEXT,
ADD COLUMN IF NOT EXISTS controparte TEXT;

-- Add comments for documentation
COMMENT ON COLUMN tasks.note IS 'Additional notes for the task';
COMMENT ON COLUMN tasks.parte IS 'Client or party involved in the case';
COMMENT ON COLUMN tasks.controparte IS 'Opposing party in the case';
