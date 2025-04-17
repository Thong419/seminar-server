import forge from 'node-forge';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Đường dẫn để tìm file .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

const secretsDir = path.join(__dirname, '..', 'secrets');

if (fs.existsSync(path.join(secretsDir, 'ca.crt'))) {
  console.log('⚠️ CA certificate đã tồn tại. Không tạo lại.');
  process.exit(0);
}

// Đọc mật khẩu từ biến môi trường
const password = process.env.CA_KEY_PASSWORD;
if (!password) {
  console.error('❌ Thiếu biến môi trường CA_KEY_PASSWORD trong config.env');
  process.exit(1);
}

// Tạo key pair
const keys = forge.pki.rsa.generateKeyPair(2048);

// Tạo CA certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

const attrs = [
  { name: 'commonName', value: 'My Custom CA' },
  { name: 'countryName', value: 'VN' },
  { name: 'organizationName', value: 'MyOrg' },
  { name: 'organizationalUnitName', value: 'CA Unit' }
];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
  { name: 'basicConstraints', cA: true },
  { name: 'keyUsage', keyCertSign: true, digitalSignature: true, cRLSign: true },
  { name: 'subjectKeyIdentifier' }
]);

cert.sign(keys.privateKey);

// Chuyển sang PEM
const certPem = forge.pki.certificateToPem(cert);

// 🔐 Mã hóa khóa riêng bằng mật khẩu từ .env
const keyPemEncrypted = forge.pki.encryptRsaPrivateKey(keys.privateKey, password, {
  algorithm: 'aes256',
});

// Lưu file
fs.mkdirSync(secretsDir, { recursive: true });
fs.writeFileSync(path.join(secretsDir, 'ca.crt'), certPem);

// Lưu khóa riêng đã mã hóa vào secrets/ca.key
fs.writeFileSync(path.join(secretsDir, 'ca.key'), keyPemEncrypted);

console.log('✅ Đã tạo file CA tại:', secretsDir);
console.log('🔒 ca.key đã được mã hóa bằng mật khẩu.');
