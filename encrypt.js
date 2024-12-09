const crypto = require('crypto');
const fs = require('fs');
const password = "";

const algorithm = 'aes-192-ctr';
const passwordAES = '';

const passwordFront = "";

exports.createKeys = function(){
    const { generateKeyPair } = require('crypto');
    generateKeyPair('rsa', {
      modulusLength: 1024,
      namedCurve: 'secp256k1', 
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: password
      }
    }, (err, publicKey, privateKey) => {
        if(err){console.log(err);}
        fs.writeFileSync("./keys/privateKey.pem",privateKey,(err1)=>{
            if(err1){console.log(err1);}
        });
        fs.writeFileSync("./keys/publicKey.pem",publicKey,(err1)=>{
            if(err1){console.log(err1);}
        });
    });
};

exports.createKeysInfoUser = function(){
    const { generateKeyPair } = require('crypto');
    generateKeyPair('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: passwordFront
      }
    }, (err, publicKey, privateKey) => {
        if(err){console.log(err);}
        fs.writeFileSync("./keys/privateKeysInfoU.pem",privateKey+"\n"+publicKey,(err1)=>{
            if(err1){console.log(err1);}
        });
    });
};

exports.createKeysInfoServer = function(){
    const { generateKeyPair } = require('crypto');
    generateKeyPair('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem'
        }
    }, (err, publicKey, privateKey) => {
        if(err){console.log(err);}
        fs.writeFileSync("./keys/privateKeysInfoS.pem",privateKey+"\n"+publicKey,(err1)=>{
            if(err1){console.log(err1);}
        });
    });
};

exports.encrypt = function(text){
    var buffer = Buffer.from(text);
    var publicKey = fs.readFileSync("./keys/publicKey.pem", "utf8");
    var encrypt = crypto.publicEncrypt(publicKey,buffer);
    return encrypt.toString("hex");
};

exports.decrypt = function(text){
    var buffer = Buffer.from(text,"hex");
    var privateKey = fs.readFileSync("./keys/privateKey.pem", "utf8");
    var decrypt = crypto.privateDecrypt({key:privateKey.toString(),passphrase: password},buffer);
    return decrypt.toString("utf8");
};

exports.sign = function(data){
    return new Promise(function(resolve,reject){
        let private_key = fs.readFileSync('./keys/privateKey.pem', 'utf-8');
        let public_key = fs.readFileSync('./keys/publicKey.pem', 'utf-8');
        let message = data;
    
        let signer = crypto.createSign('RSA-SHA256');
        signer.update(message);
        signer.end();
    
        let signature = signer.sign({key:private_key.toString(),passphrase:password});
        let signature_hex = signature.toString('hex');

        let verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(message);
        verifier.end();
    
        let verified = verifier.verify(public_key, signature);

        resolve(signature_hex);

    });
};

exports.encryptAES = function(text){
    var cipher = crypto.createCipher(algorithm,passwordAES);
    var crypted = cipher.update(text,'utf8','base64');
    crypted += cipher.final('base64');
    return crypted;
};

exports.decryptAES = function(text){
    var decipher = crypto.createDecipher(algorithm,passwordAES)
    var dec = decipher.update(text,'base64','utf8')
    dec += decipher.final('utf8');
    return dec;
};

exports.decryptInfo = function(text){

    global.navigator = {appName: 'nodejs'};
    global.window = {};
    const JSEncrypt = require ('./JSEncrypt').default;

    const cipher = new JSEncrypt ();
    cipher.setPrivateKey(privateKeyServer);

    return cipher.decrypt(text).toString("utf8");
}

exports.decryptInfoUser = function(text){

    global.navigator = {appName: 'nodejs'};
    global.window = {};
    const JSEncrypt = require ('./JSEncrypt').default;

    const cipher = new JSEncrypt ();
    cipher.setPrivateKey(privateKeyUser);

    return cipher.decrypt(text).toString("utf8");
}

exports.encryptInfo = function(text){
    global.navigator = {appName: 'nodejs'};
    global.window = {};
    const JSEncrypt = require ('./JSEncrypt').default;

    const cipher = new JSEncrypt ();
    cipher.setPublicKey(publicKeyServer);
    return cipher.encrypt(text);
}

function getAlgorithm(keyBase64) {

    var key = Buffer.from(keyBase64, 'base64');
    switch (key.length) {
        case 16:
            return 'aes-128-cbc';
        case 32:
            return 'aes-256-cbc';

    }

    throw new Error('Invalid key length: ' + key.length);
}

exports.encryptA = function (plainText) {

    var key = Buffer.from(keyBase64, 'base64');
    var iv = Buffer.from(ivBase64, 'base64');

    var cipher = crypto.createCipheriv(getAlgorithm(keyBase64), key, iv);
    var x = cipher.update(plainText, 'utf8', 'base64');
    x += cipher.final('base64');
    return x;
}

exports.decryptA = function (messagebase64) {

    var key = Buffer.from(keyBase64, 'base64');
    var iv = Buffer.from(ivBase64, 'base64');

    var decipher = crypto.createDecipheriv(getAlgorithm(keyBase64), key, iv);
    var x = decipher.update(messagebase64, 'base64');
    x += decipher.final().toString("utf8");
    return x;
}

const keyBase64 = "";
const ivBase64 = '';

const publicKeyServer = `-----BEGIN PUBLIC KEY-----
-----END PUBLIC KEY-----`;

const privateKeyServer = `-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----`;

const privateKeyUser = `-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----`;

const publicKeyuser = `-----BEGIN PUBLIC KEY-----
-----END PUBLIC KEY-----`;