# Certificate and bundle-signing inputs

No corporate CA certificate, signing key, or signature is included. Add only organization-approved public trust roots where the consuming runtime needs them; never commit private keys.

Bundle signing is not implemented in this plugin package. Use your organization's protected release pipeline to sign and verify archives with externally managed Ed25519 keys. Keep private keys outside Git and plugin archives, and distribute public trust material through a separately trusted channel. A signature inside an archive cannot authenticate that same archive.

The HMAC audit key is separate from bundle-signing keys. HMAC verification requires access to the shared secret and does not provide public non-repudiation.
