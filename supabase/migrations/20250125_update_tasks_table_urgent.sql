-- Migration to update tasks and activities tables: replace priorita with urgent column
-- This migration adds the urgent column and removes the priorita column from both tables

-- Update tasks table
-- First, add the new urgent column
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS urgent BOOLEAN DEFAULT false;

-- Update existing records: convert priorita >= 8 to urgent = true
UPDATE tasks 
SET urgent = (priorita >= 8)
WHERE priorita IS NOT NULL;

-- Remove the old priorita column
ALTER TABLE tasks 
DROP COLUMN IF EXISTS priorita;

-- Add a comment to document the change
COMMENT ON COLUMN tasks.urgent IS 'Boolean flag indicating if the task is urgent (true) or normal (false). Replaces the old priorita numeric system.';

-- Update activities table (if it exists)
-- First, add the new urgent column
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS urgent BOOLEAN DEFAULT false;

-- Update existing records: convert priorita >= 8 to urgent = true
UPDATE activities 
SET urgent = (priorita >= 8)
WHERE priorita IS NOT NULL;

-- Remove the old priorita column
ALTER TABLE activities 
DROP COLUMN IF EXISTS priorita;

-- Add a comment to document the change
COMMENT ON COLUMN activities.urgent IS 'Boolean flag indicating if the activity is urgent (true) or normal (false). Replaces the old priorita numeric system.';
