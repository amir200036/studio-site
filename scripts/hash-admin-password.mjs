import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("שימוש: npm run admin:hash-password -- 'הסיסמה-שלך'");
  process.exit(1);
}

console.log(bcrypt.hashSync(password, 10));
