-- Create table for storing calculation history
CREATE TABLE IF NOT EXISTS calcoli_termini (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titolo TEXT NOT NULL,
  data_inizio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_finale TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo_calcolo TEXT NOT NULL CHECK (tipo_calcolo IN ('giorni', 'mesi', 'anni')),
  valore_originale INTEGER NOT NULL,
  giorni_sospensione INTEGER DEFAULT 0,
  note JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calcoli_termini_user_id ON calcoli_termini(user_id);
CREATE INDEX IF NOT EXISTS idx_calcoli_termini_created_at ON calcoli_termini(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calcoli_termini_data_finale ON calcoli_termini(data_finale);

-- Enable Row Level Security
ALTER TABLE calcoli_termini ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own calculations" ON calcoli_termini
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculations" ON calcoli_termini
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations" ON calcoli_termini
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations" ON calcoli_termini
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_calcoli_termini_updated_at
  BEFORE UPDATE ON calcoli_termini
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
