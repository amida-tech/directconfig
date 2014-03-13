

# Direct Configuration

This provides an HTTP (REST) API to configure Direct server.


## Usage

    node app.js <cert_dir> <passout>

## API

```GET /file/<filename>```
Returns a previously created certificate file from the certificate directory.

```POST /file/<filename>```
Puts a certificate file to the certificate directory.

```POST /cert```
Loads a certificate from the certificate directory.

JSON
filename: certificate file name

```POST /anchor```
Loads a certificate from the certificate directory as an anchor for the owner domain.

JSON
filename: certificate file name
owner: owner domain for the anchor

```POST /trustbundle```
Loads a trust bundle.

JSON
trustName: name of the trust bundle.
trutURI: url for the trust bundle.

```DEL /reset```
Clears anchors, certificates and trust bundles.

```POST /pkcs10```
Creates a pkcs10 certificate request for a server domain.

JSON
country
city
organization
domain

```POST /x509```
Creates x509 certificates (DER and PEM) for server domain.

JSON
request: pkcs10 certificate request file name
x509: certificate base file name

```POST /pkcs12```
Creates pkcs12 certificate for server domain.

JSON
x509: x509 certificate base file name
pkcs12: pkcs12 certificate file name

