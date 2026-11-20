import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://ggfososkxgadtzomitxb.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_A2TdypNSQJC7ZZOLJBO3ag_sI9katME';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
