const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { sub: 1, email: 'admin@shopew.com', role: 'SELLER' },
  process.env.JWT_SECRET || 'super-secret-key-for-shopee-clone-2024'
);

console.log(token);
