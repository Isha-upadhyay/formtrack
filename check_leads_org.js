const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkLeadsOrg() {
  const { data: leads } = await supabase.from('leads').select('id, form_id, org_id');
  const { data: forms } = await supabase.from('forms').select('id, org_id, name');
  
  console.log("Leads:", leads);
  console.log("Forms:", forms.map(f => ({ name: f.name, id: f.id, org_id: f.org_id })));
}

checkLeadsOrg();
