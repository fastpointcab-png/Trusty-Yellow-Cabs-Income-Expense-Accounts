import { createClient } from '@supabase/supabase-js';

// NOTE: These should be provided via environment variables in a real build.
// For this environment, we rely on the system injecting process.env.
// We safeguard access to process to avoid ReferenceError in browser environments.
const env = typeof process !== 'undefined' ? process.env : {};

// Provide fallback values to prevent "supabaseUrl is required" error during initialization.
// The operations will fail gracefully at runtime if these placeholders are used.
const supabaseUrl = env.SUPABASE_URL || 'https://svpnubbxlyijsluhjwco.supabase.co';
const supabaseKey = env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cG51YmJ4bHlpanNsdWhqd2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTAxNjEsImV4cCI6MjA4MDM4NjE2MX0.9SHxhlnMpQL8O5It6wXKADP88qhNALZqx3nSJmQWiBU';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const TABLE_NAME = 'taxi_entries';

export const SQL_SCHEMA_INSTRUCTION = `
-- Run this SQL in your Supabase SQL Editor to create the table
create table if not exists taxi_entries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  vehicle_number text not null,
  driver_name text not null,
  trip_from text,
  trip_to text,
  total_km numeric default 0,
  income_amount numeric default 0,
  fuel_expense numeric default 0,
  maintenance_expense numeric default 0,
  other_expense numeric default 0,
  driver_salary numeric default 0,
  notes text
);
`;