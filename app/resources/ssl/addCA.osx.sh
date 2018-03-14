
# Add certificate to system key chain

certPath=./root.pem
certificateName="CryptoARM Local CA"

echo -e "certificateName: ${certificateName}"
echo -e "certPath: ${certPath}"

# Firefox
firefoxProfileDir=${userDir}/Library/Application\ Support/Firefox/Profiles
firefoxProfiles=$( find "$firefoxProfileDir" -name "*.default*" )
firefoxDefaultProfile="${firefoxProfiles[0]}"

if [ ! -z "${firefoxDefaultProfile}" ]
then
    echo "Firfox was found"
    CUR_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    echo -e "Delete old cert"
    # Delete old cert
    # /usr/local/Cellar/nss/3.31/bin/certutil -D -n "${certificateName}" -d "${firefoxDefaultProfile}"
    until ! ${CUR_DIR}/certutil/osx/certutil -D -n "CryptoARM Local CA" -d sql:"${firefoxDefaultProfile}"
    do
        echo "CryptoARM certificate was removed from sql:cert.db"
    done
    until ! ${CUR_DIR}/certutil/osx/certutil -D -n "CryptoARM Local CA" -d dbm:"${firefoxDefaultProfile}"
    do
        echo "CryptoARM certificate was removed from dbm:cert.db"
    done
    ${CUR_DIR}/certutil/osx/certutil -A -i "${certPath}" -n "${certificateName}" -t "C,c,c" -d sql:"${firefoxDefaultProfile}"
    ${CUR_DIR}/certutil/osx/certutil -A -i "${certPath}" -n "${certificateName}" -t "C,c,c" -d dbm:"${firefoxDefaultProfile}"
    ${CUR_DIR}/certutil/osx/certutil -L -d sql:"${firefoxDefaultProfile}"
    ${CUR_DIR}/certutil/osx/certutil -L -d dbm:"${firefoxDefaultProfile}"

    sudo -u ${USER} bash ${CUR_DIR}/osx_firefox.sh
fi

# keychain
sudo security delete-certificate -c ${certificateName} /Library/Keychains/System.keychain
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}
