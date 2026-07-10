import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lwmlcgcjktqcoqfssvnd.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3bWxjZ2Nqa3RxY29xZnNzdm5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NjQwNzcsImV4cCI6MjA5ODU0MDA3N30.6_NGXnkAtT3LbdZMq-Do2ZaXsg46bd94XhVacXGFjbY";

export const supabase = createClient(supabaseUrl, supabaseKey);
