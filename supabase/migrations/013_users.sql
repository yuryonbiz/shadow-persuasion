-- Users table to track all registered users
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid text UNIQUE NOT NULL,
  email text,
  display_name text,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
