import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://yqypcshppfiblpcswwhi.supabase.co";

const supabaseKey =
  "sb_publishable_8cILc07oHdVZXrdtrHphvQ_6MbtefoL";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);