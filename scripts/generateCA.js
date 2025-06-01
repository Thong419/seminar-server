import forge from "node-forge";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

// Đường dẫn để tìm file .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", "config.env") });

const secretsDir = path.join(__dirname, "..", "secrets/ca");

console.log("🔍 Đang kiểm tra thư mục secrets:", secretsDir);

if (fs.existsSync(path.join(secretsDir, "ca.crt"))) {
  console.log("⚠️ CA certificate đã tồn tại. Không tạo lại.");
  process.exit(0);
}

// Đọc mật khẩu từ biến môi trường
const password = process.env.CA_KEY_PASSWORD;
if (!password) {
  console.error("❌ Thiếu biến môi trường CA_KEY_PASSWORD trong config.env");
  process.exit(1);
}

// Tạo key pair
const keys = forge.pki.rsa.generateKeyPair(2048);

// Tạo CA certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = "01";
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

const attrs = [
  { name: "commonName", value: "CertifyPro" },
  { name: "countryName", value: "VN" },
  { name: "organizationName", value: "CertifyPro Org" },
  { name: "organizationalUnitName", value: "CertifyPro Unit" },
];

cert.setSubject(attrs);
cert.setIssuer(attrs);
// cert.setExtensions([
//   { name: "basicConstraints", cA: true },
//   {
//     name: "keyUsage",
//     keyCertSign: true,
//     digitalSignature: true,
//     cRLSign: true,
//   },
//   { name: "subjectKeyIdentifier" },
// ]);

cert.setExtensions([
  { name: "basicConstraints", cA: true },
  {
    name: "keyUsage",
    keyCertSign: true,
    digitalSignature: true,
    cRLSign: true,
  },
  { name: "subjectKeyIdentifier" },
  {
    name: "extKeyUsage",
    serverAuth: true,
  },
  {
    name: "subjectAltName",
    altNames: [
      {
        type: 2, // DNS
        value: "localhost",
      },
    ],
  },
]);

// cert.sign(keys.privateKey);

const md = forge.md.sha256.create();
cert.sign(keys.privateKey, md);

// Chuyển sang PEM
const certPem = forge.pki.certificateToPem(cert);

// 🔐 Mã hóa khóa riêng bằng mật khẩu từ .env
const keyPemEncrypted = forge.pki.encryptRsaPrivateKey(
  keys.privateKey,
  password,
  {
    algorithm: "aes256",
  }
);

// Lưu file
fs.mkdirSync(secretsDir, { recursive: true });
fs.writeFileSync(path.join(secretsDir, "ca.crt"), certPem);

// Lưu khóa riêng đã mã hóa vào secrets/ca.key
fs.writeFileSync(path.join(secretsDir, "caEncrypted.key"), keyPemEncrypted);
fs.writeFileSync(
  path.join(secretsDir, "ca.key"),
  forge.pki.privateKeyToPem(keys.privateKey)
);

console.log("✅ Đã tạo file CA tại:", secretsDir);
console.log("🔒 ca.key đã được mã hóa bằng mật khẩu.");
