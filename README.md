## Install dependencies

```
> npm install -g typescript
> npm install

```

## Build app
**NOTE:**
* on Windows need have openssl [prebuild binaries](https://wiki.openssl.org/index.php/Binaries) or build from [sources](https://github.com/openssl/openssl/tree/OpenSSL_1_0_2k) in first time (for [trusted-crypto](https://github.com/TrustedPlus/crypto/blob/master/binding.gyp#L57))
* on Linux install openssl devel package

Run build script (x64 by default):
```
> gulp
```
