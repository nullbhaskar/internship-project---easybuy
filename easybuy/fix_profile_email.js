const fs = require('fs');
let code = fs.readFileSync('app/profile.tsx', 'utf8');

// Replace in profile.tsx
code = code.replace(
  /userEmail=\{userEmail \|\| 'bhaskar@example\.com'\}/g,
  `userEmail={user?.email || userEmail || 'bhaskar@email.com'}`
);
code = code.replace(
  /userEmail=\{userEmail \|\| 'bhaskar@email\.com'\}/g,
  `userEmail={user?.email || userEmail || 'bhaskar@email.com'}`
);

// The userAvatar might be using auth.currentUser directly
code = code.replace(
  /userAvatar=\{auth\.currentUser\?\.photoURL \|\| undefined\}/g,
  `userAvatar={user?.photoURL || undefined}`
);

fs.writeFileSync('app/profile.tsx', code, 'utf8');
console.log('Fixed profile.tsx dynamic user details');
