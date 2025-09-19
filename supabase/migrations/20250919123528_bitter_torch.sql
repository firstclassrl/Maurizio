/*
  # Sample Data for Legal Planner

  This file contains sample data to test the application.
  Replace 'your-user-id-here' with an actual user ID from auth.users table.
  
  To get a user ID:
  1. Sign up through the application
  2. Go to Supabase Dashboard > Authentication > Users
  3. Copy the user ID and replace it below
  4. Run this script in the SQL Editor
*/

-- Sample tasks for testing (replace with actual user ID)
INSERT INTO tasks (user_id, pratica, attivita, scadenza, stato, priorita) VALUES
  ('your-user-id-here', 'Rossi vs Bianchi', 'Deposito ricorso presso il tribunale', '2024-02-15', 'todo', 8),
  ('your-user-id-here', 'Società ABC', 'Revisione contratto di locazione', '2024-02-20', 'todo', 5),
  ('your-user-id-here', 'Eredità Verdi', 'Presentazione dichiarazione di successione', '2024-02-25', 'done', 7),
  ('your-user-id-here', 'Divorzio Neri', 'Udienza di comparizione', '2024-03-01', 'todo', 9),
  ('your-user-id-here', 'Condominio XYZ', 'Assemblea straordinaria', '2024-03-05', 'todo', 3),
  ('your-user-id-here', 'Incidente Strada', 'Perizia medico-legale', '2024-03-10', 'todo', 6),
  ('your-user-id-here', 'Contratto Lavoro', 'Negoziazione clausole', '2024-03-15', 'done', 4),
  ('your-user-id-here', 'Causa Civile 123', 'Deposito documenti', '2024-03-20', 'todo', 7);

-- You can also add more sample data as needed