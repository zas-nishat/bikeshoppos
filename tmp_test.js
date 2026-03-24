import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'bike-pos-secret-99';

const test = (passInDB, passInput) => {
  let decryptedPass = '';
  try {
    const bytes = CryptoJS.AES.decrypt(passInDB, ENCRYPTION_KEY);
    decryptedPass = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedPass) decryptedPass = passInDB;
  } catch {
    decryptedPass = passInDB;
  }
  console.log(`DB: ${passInDB}, Input: ${passInput}, Decrypted: ${decryptedPass}, Match: ${decryptedPass === passInput}`);
};

test('admin123', 'admin123'); // Plain text case
const encrypted = CryptoJS.AES.encrypt('admin123', ENCRYPTION_KEY).toString();
test(encrypted, 'admin123'); // Encrypted case
