## Install dependencies

```
> npm install -g typescript
> npm install

```

## Build for dev
⚠️ Before run dev need manualy add trusted-crypto in /app/node_modules/ Will fixed in future
```bash
git clone https://github.com/TrustedPlus/esign.git
cd esign && npm install
cd app && npm install
cd ..
npm run dev

# Run tslint
yarn lint
```

**NOTE:**
* on Windows need have openssl [prebuild binaries](https://wiki.openssl.org/index.php/Binaries) or build from [sources](https://github.com/openssl/openssl/tree/OpenSSL_1_0_2k) in first time (for [trusted-crypto](https://github.com/TrustedPlus/crypto/blob/master/binding.gyp#L57))
* on Linux install openssl devel package
