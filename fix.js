const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');
c = c.replace(
  "title=\"Verify ID & Vote\"",
  "title=\"Register as Voter\"\n        onPress={() => navigation.navigate('Register')}\n        style={{ marginBottom: 12 }}\n      />\n      <AppButton\n        title=\"Already Registered? Vote Now\""
);
fs.writeFileSync('src/screens/HomeScreen.js', c, 'utf8');
console.log('done');
