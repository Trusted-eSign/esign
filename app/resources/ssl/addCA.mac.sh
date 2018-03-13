
# Add certificate to system key chain

certPath=./root.pem
certificateName="CryptoARM Local CA" 

echo -e "certificateName: ${certificateName}"
echo -e "certPath: ${certPath}"

# keychain
sudo security delete-certificate -c ${certificateName} /Library/Keychains/System.keychain
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}