-- Add evaso column to tasks table
ALTER TABLE tasks 
ADD COLUMN evaso BOOLEAN DEFAULT FALSE;

-- Create index for better performance when filtering by evaso
CREATE INDEX idx_tasks_evaso ON tasks(evaso);

-- Update existing tasks to have evaso = false by default
UPDATE tasks SET evaso = FALSE WHERE evaso IS NULL;
