-- Function to generate next practice number
CREATE OR REPLACE FUNCTION get_next_practice_number(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    current_year INTEGER;
    next_number INTEGER;
    practice_number TEXT;
BEGIN
    -- Get current year
    current_year := EXTRACT(YEAR FROM NOW());
    
    -- Get the highest practice number for this user in current year
    SELECT COALESCE(MAX(
        CASE 
            WHEN numero ~ ('^' || current_year || '/[0-9]+$') THEN
                CAST(SUBSTRING(numero FROM ('^' || current_year || '/([0-9]+)$')) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO next_number
    FROM practices
    WHERE practices.user_id = user_id_param;
    
    -- Format the practice number
    practice_number := current_year || '/' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN practice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
