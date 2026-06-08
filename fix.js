const fs = require('fs');
let c = fs.readFileSync('src/screens/AdminScreen.js', 'utf8');
c = c.replace(
  "onPress={() => navigation.navigate('Home')}",
  "onPress={async () => { await supabase.auth.signOut(); navigation.navigate('Home'); }}"
);
// Add supabase import if not present
if (!c.includes("import { supabase }")) {
  c = c.replace(
    "import { supabase } from '../lib/supabase';",
    "import { supabase } from '../lib/supabase';"
  );
}
fs.writeFileSync('src/screens/AdminScreen.js', c, 'utf8');
console.log('done');
