import jsSHA from "jssha";
import * as base32 from 'hi-base32';

class OTP {

    static ALGORITHMS = {
        'SHA1': 'SHA-1',
        'SHA256': 'SHA-256',
        'SHA512': 'SHA-512'
    };

    /**
     * 
     * @param {String} secret Secret key to hash with
     * @param {int} counter Counter for HOTP
     * @param {int} digits Number of digits the OTP should be (typically 6 or 8)
     * @param {String} algorithm Algorithm to use for hashing (default: SHA1)
     * @returns HOTP value
     */
    static generateHOTP(secret, counter, digits = 6, algorithm = 'SHA1') {
        digits = parseInt(digits);
        secret = this._base32tohex(secret);
        counter = this._leftpad(this._dec2hex(counter), 16, '0');

        // console.log(`Secret: ${secret}, Counter: ${counter}`)

        const digest = new jsSHA(this.ALGORITHMS[algorithm], 'HEX');
        digest.setHMACKey(secret, 'HEX');
        digest.update(counter);

        // console.log(digest.getHMAC('HEX'));

        const bytes = digest.getHMAC('UINT8ARRAY');
        const offset = bytes[bytes.length - 1] & 0xf;

        // console.log(`Offset ${offset}`);

        const code = ((bytes[offset] & 0x7f) << 24) |
        ((bytes[offset + 1] & 0xff) << 16) |
        ((bytes[offset + 2] & 0xff) << 8) |
            (bytes[offset + 3] & 0xff);
        
        // console.log(`Code: ${code}`);
        
        const otp = String(code % Math.pow(10, digits)).padStart(digits, '0');

        // console.log(`OTP: ${otp}`);
        return otp;
    }

    /**
     * 
     * @param {String} secret Secret key to hash with
     * @param {int} time Time in milliseconds since epoch (If null is passed then current time will be used)
     * @param {int} period Validity period for TOTP (default: 30)
     * @param {int} digits Number of digits the code should be (default: 6)
     * @param {String} algorithm Algorithm used for hashing (default: SHA1)
     * @returns TOTP value
     */
    static generateTOTP(secret, time = null, period=30, digits = 6, algorithm = 'SHA1') {
        if (time == null) time = + new Date();
        const c = Math.floor((Math.floor(time / 1000) / period));
        const r = period - Math.floor(Math.floor(time / 1000) % period);
        return [this.generateHOTP(secret, c, digits, algorithm), r]
    }

    // Following functions have been taken from https://github.com/bellstrand/totp-generator

    static _hex2dec(s) {
        return parseInt(s, 16)
    }
    
    static _dec2hex(s) {
        return (s < 15.5 ? "0" : "") + Math.round(s).toString(16)
    }
    
    static _base32tohex(b32) {
        let base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
            bits = "",
            hex = ""
    
        b32 = b32.replace(/=+$/, "")
    
        for (let i = 0; i < b32.length; i++) {
            let val = base32chars.indexOf(b32.charAt(i).toUpperCase())
            if (val === -1) throw new Error("Invalid base32 character in key")
            bits += this._leftpad(val.toString(2), 5, "0")
        }
    
        for (let i = 0; i + 8 <= bits.length; i += 8) {
            let chunk = bits.substr(i, 8)
            hex = hex + this._leftpad(parseInt(chunk, 2).toString(16), 2, "0")
        }
        return hex
    }

    static _leftpad(str, len, pad) {
        if (len + 1 >= str.length) {
            str = Array(len + 1 - str.length).join(pad) + str
        }
        return str
    }

    static generateRandomSecret(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       return base32.encode(result);
    }
}

export default OTP;