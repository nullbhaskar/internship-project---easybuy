const fs = require('fs');
let code = fs.readFileSync('app/home.tsx', 'utf8');

// Replace the hardcoded auth.currentUser usage with the dynamic `user` from AuthContext
code = code.replace(
  /userEmail=\{auth\.currentUser\?\.email \|\| 'bhaskar@email\.com'\}/g,
  `userEmail={user?.email || 'bhaskar@email.com'}`
);

code = code.replace(
  /userAvatar=\{auth\.currentUser\?\.photoURL \|\| undefined\}/g,
  `userAvatar={user?.photoURL || undefined}`
);

// We can also fix userName just in case they used the state which is fine, but direct is better.
// Actually, `userName` state updates via useEffect so it works, we'll leave it. 
// Or better, let's just make sure userName is dynamic.
code = code.replace(
  /userName=\{userName \|\| 'Bhaskar'\}/g,
  `userName={user?.fullName || userName || 'Bhaskar'}`
);

fs.writeFileSync('app/home.tsx', code, 'utf8');
console.log('Fixed dynamic email in home.tsx Drawer');
