import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zjcxrporlkrcxziwdjbs.supabase.co' 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqY3hycG9ybGtyY3h6aXdkamJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNzUxMjAsImV4cCI6MjA4Njc1MTEyMH0.vIz9TZRTunYrrnyzsOk5pRtUG8-OgvF1h9I5dEov4CE' 

export const supabase = createClient(supabaseUrl, supabaseKey)