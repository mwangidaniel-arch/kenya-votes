const fs = require('fs');
let c = fs.readFileSync('src/hooks/useElectionSettings.js', 'utf8');
c = c.replace(
  "const sub = supabase.channel('settings-channel')\n      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'election_settings' }, payload => {\n        setSettings(payload.new);\n      }).subscribe();",
  "const sub = supabase.channel('settings-channel');\n    sub.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'election_settings' }, payload => {\n      setSettings(payload.new);\n    }).subscribe();"
);
fs.writeFileSync('src/hooks/useElectionSettings.js', c, 'utf8');
console.log('done');
