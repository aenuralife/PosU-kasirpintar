import { createClient } from '@supabase/supabase-js'

// Ganti nilai di bawah ini dengan URL dan Key dari Supabase kamu
const SUPABASE_URL = 'https://zdabxhwasthgxmygbalv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYWJ4aHdhc3RoZ3hteWdiYWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MTMwMDksImV4cCI6MjEwNjM4OTAwOX0.vwjjFJzgYpjR-0dBd9KcrOPY_mgo3TQ0Z2W8A6cfQao'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)