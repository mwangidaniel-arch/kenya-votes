import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://gzafpkqmfvxkkbcmicyj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6YWZwa3FtZnZ4a2tiY21pY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4Mzc5MTMsImV4cCI6MjA5NjQxMzkxM30.Xsh3XA83vnWTx0p8OTRwLL0x2gW6IRgQRoC-zocUF1E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
