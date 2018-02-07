# Trusted eSign

Trusted eSign is a desktop app for easy signing any type of files. Also you can encrypt or decrypt files using strong cryptographic algorithms 

You can download the app [here](https://trustedplus.github.io/)




## Features


* Easy to sign - Drag & drop your file and click the Sign button
* Cross-platform App - Supported on Windows, MacOS and Linux
* You can manage imported certificates and keep private keys in one place
* Select file and encrypt it immediately with strong algorithms - such as SHA-256 and DES 


## Install dependencies

```
> npm install -g typescript
> npm install

```

## Build for dev
⚠️ Before run dev it needs to add manualy trusted-crypto in /app/node_modules/ Will be fixed in future
```bash
git clone https://github.com/TrustedPlus/esign.git
cd esign && npm install
cd app && npm install
cd ..
npm run dev

# Run tslint
yarn lint
```
## Screenshot


<p align="center">
  <img alt="Trusted eSign in action" src="https://user-images.githubusercontent.com/16474118/32882951-f8d799fc-cac6-11e7-83f0-24fc70953963.png">
</p>

**NOTE:**
* for Windows you need to have openssl [prebuild binaries](https://wiki.openssl.org/index.php/Binaries) or use build from [sources](https://github.com/openssl/openssl/tree/OpenSSL_1_0_2k) for the first time (for [trusted-crypto](https://github.com/TrustedPlus/crypto/blob/master/binding.gyp#L57))
* for Linux install openssl devel package
