const fs = require('fs');
let c = fs.readFileSync('src/screens/AdminScreen.js', 'utf8');
c = c.replace(
  "<TouchableOpacity onPress={exportCSV} style={styles.iconBtn}><Text style={styles.iconBtnText}>Export CSV</Text></TouchableOpacity>",
  "<TouchableOpacity onPress={exportCSV} style={styles.iconBtn}><Text style={styles.iconBtnText}>Export CSV</Text></TouchableOpacity>\n        <TouchableOpacity onPress={() => navigation.navigate('VoterImport')} style={styles.iconBtn}><Text style={styles.iconBtnText}>Import Voters</Text></TouchableOpacity>"
);
fs.writeFileSync('src/screens/AdminScreen.js', c, 'utf8');
console.log('done');
