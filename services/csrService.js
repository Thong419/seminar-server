import forge from "node-forge";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), "config.env") });

export const generateCSRAndCert = (data) => {
  const {
    commonName,
    organization,
    organizationalUnit,
    country,
    state,
    locality,
    email,
  } = data;

  const keys = forge.pki.rsa.generateKeyPair(2048);

  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  const subjectAttrs = [
    { name: "commonName", value: commonName },
    { name: "organizationName", value: organization },
  ];

  if (organizationalUnit)
    subjectAttrs.push({
      name: "organizationalUnitName",
      value: organizationalUnit,
    });
  if (locality) subjectAttrs.push({ name: "localityName", value: locality });
  if (state) subjectAttrs.push({ name: "stateOrProvinceName", value: state });
  if (country) subjectAttrs.push({ name: "countryName", value: country });
  if (email) subjectAttrs.push({ name: "emailAddress", value: email });

  csr.setSubject(subjectAttrs);

  // csr.sign(keys.privateKey);
  csr.sign(keys.privateKey, forge.md.sha256.create());
  // Đọc và giải mã CA private key bằng mật khẩu trong .env
  const caKeyPem = fs.readFileSync(
    path.join("secrets", "ca", "ca.key"),
    "utf8"
  );
  const caPassword = process.env.CA_KEY_PASSWORD;
  if (!caPassword) {
    throw new Error("Thiếu biến môi trường CA_KEY_PASSWORD trong config.env");
  }

  console.log("caKeyPem", caKeyPem);

  // let caPrivateKey;
  // try {
  //   caPrivateKey = forge.pki.decryptRsaPrivateKey(
  //     caKeyPemEncrypted,
  //     caPassword
  //   );
  //   console.log("caPrivateKey", caPrivateKey);
  //   if (!caPrivateKey)
  //     throw new Error("Sai mật khẩu hoặc định dạng không hợp lệ");
  // } catch (error) {
  //   console.error("❌ Không thể giải mã CA private key:", error.message);
  //   throw error;
  // }

  const caPrivateKey = forge.pki.privateKeyFromPem(caKeyPem);

  const caCertPem = fs.readFileSync(
    path.join("secrets", "ca", "ca.crt"),
    "utf8"
  );
  const caCert = forge.pki.certificateFromPem(caCertPem);

  const cert = forge.pki.createCertificate();
  cert.serialNumber = new Date().getTime().toString();
  cert.publicKey = csr.publicKey;
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  cert.setSubject(csr.subject.attributes);
  cert.setIssuer(caCert.subject.attributes);
  cert.setExtensions([
    { name: "basicConstraints", cA: false },
    {
      name: "keyUsage",
      digitalSignature: true,
      keyEncipherment: true,
    },
    {
      name: "extKeyUsage",
      serverAuth: true,
    },
    {
      name: "subjectAltName",
      altNames: [
        {
          type: 2, // DNS
          value: commonName,
        },
        { type: 7, ip: "127.0.0.1" },
      ],
    },
  ]);

  cert.sign(caPrivateKey, forge.md.sha256.create());

  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  const certPem = forge.pki.certificateToPem(cert);
  const csrPem = forge.pki.certificationRequestToPem(csr);

  const folderId = uuidv4();
  const folderPath = path.join("secrets", "downloads", folderId);
  fs.mkdirSync(folderPath, { recursive: true });

  const files = [
    { name: "private.key", content: privateKeyPem },
    { name: "certificate.crt", content: certPem },
    // { name: 'request.csr', content: csrPem }
  ];

  files.forEach((file) => {
    fs.writeFileSync(path.join(folderPath, file.name), file.content);
  });

  return {
    folderId,
    urls: {
      privateKeyUrl: `/downloads/${folderId}/private.key`,
      certUrl: `/downloads/${folderId}/certificate.crt`,
      // csrUrl: `/downloads/${folderId}/request.csr`
    },
  };
};
