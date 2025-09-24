-- Migration to create practices and activities tables for the new activity system

-- Create practices table
CREATE TABLE IF NOT EXISTS practices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    numero TEXT NOT NULL,
    cliente_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    controparti_ids JSONB DEFAULT '[]'::jsonb,
    tipo_procedura TEXT NOT NULL CHECK (tipo_procedura IN ('STRAGIUDIZIALE', 'GIUDIZIALE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pratica_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL,
    attivita TEXT NOT NULL,
    data DATE NOT NULL,
    ora TIME,
    autorita_giudiziaria TEXT,
    rg TEXT,
    giudice TEXT,
    note TEXT,
    stato TEXT DEFAULT 'todo' CHECK (stato IN ('todo', 'done')),
    priorita INTEGER DEFAULT 5 CHECK (priorita >= 1 AND priorita <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_practices_user_id ON practices(user_id);
CREATE INDEX IF NOT EXISTS idx_practices_numero ON practices(numero);
CREATE INDEX IF NOT EXISTS idx_practices_cliente_id ON practices(cliente_id);
CREATE INDEX IF NOT EXISTS idx_practices_tipo_procedura ON practices(tipo_procedura);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_pratica_id ON activities(pratica_id);
CREATE INDEX IF NOT EXISTS idx_activities_data ON activities(data);
CREATE INDEX IF NOT EXISTS idx_activities_categoria ON activities(categoria);
CREATE INDEX IF NOT EXISTS idx_activities_stato ON activities(stato);
CREATE INDEX IF NOT EXISTS idx_activities_priorita ON activities(priorita);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_practices_updated_at
    BEFORE UPDATE ON practices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for practices
CREATE POLICY "Users can view their own practices" ON practices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practices" ON practices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practices" ON practices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own practices" ON practices
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for activities
CREATE POLICY "Users can view their own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON activities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" ON activities
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments to document the tables
COMMENT ON TABLE practices IS 'Table for storing legal practices with clients and counterparties';
COMMENT ON TABLE activities IS 'Table for storing activities related to practices';

COMMENT ON COLUMN practices.numero IS 'Practice number (e.g., 2024/001)';
COMMENT ON COLUMN practices.cliente_id IS 'Reference to the client';
COMMENT ON COLUMN practices.controparti_ids IS 'Array of counterparty client IDs';
COMMENT ON COLUMN practices.tipo_procedura IS 'Type of procedure: STRAGIUDIZIALE or GIUDIZIALE';

COMMENT ON COLUMN activities.pratica_id IS 'Reference to the practice';
COMMENT ON COLUMN activities.categoria IS 'Activity category based on procedure type';
COMMENT ON COLUMN activities.attivita IS 'Description of the activity to perform';
COMMENT ON COLUMN activities.data IS 'Date of the activity';
COMMENT ON COLUMN activities.ora IS 'Time of the activity';
COMMENT ON COLUMN activities.autorita_giudiziaria IS 'Judicial authority (only for GIUDIZIALE)';
COMMENT ON COLUMN activities.rg IS 'RG number (only for GIUDIZIALE)';
COMMENT ON COLUMN activities.giudice IS 'Judge name (only for GIUDIZIALE)';

-- Verify the changes
SELECT 
    'Migration completed' as status,
    table_name as tabella,
    column_name as campo,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns 
WHERE table_name IN ('practices', 'activities')
ORDER BY table_name, ordinal_position;
