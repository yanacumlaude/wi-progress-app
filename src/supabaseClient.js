import { createClient } from "@supabase/supabase-js";

// Mengambil variabel dari file .env (Vite mode)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Pengecekan Keamanan: Memastikan variabel .env terbaca
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ WADUH PUH! URL atau API Key Supabase tidak ditemukan. " +
    "Pastikan file .env mase sudah ada di folder utama dan isinya benar."
  );
}

// Inisialisasi Client Supabase
export const supabase = createClient(
  supabaseUrl || "", 
  supabaseAnonKey || ""
);