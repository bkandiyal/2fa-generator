import React from 'react';
import QRCode from 'qrcode';
import OTPView from './OTPView.js';
import OTP from '../lib/OTP.js';

class OTPForm extends React.Component {
    supportedDigits = [6, 8];
    supportedAlgorithms = ['SHA1', 'SHA256', 'SHA512'];
    defaultPeriod = 30;
    defaultCounter = 0;

    constructor(props) {
        super(props);
        this.state = {
            type: 'totp',
            digits: '6',
            period: '30',
            secret: '',
            counter: '0',
            algorithm: 'SHA1',
            issuer: '',
            label: '',
            uri: '',
            validated: false
        };

        this._handleChange = this._handleChange.bind(this);
        this._validateForm = this._validateForm.bind(this);

        this.qr = React.createRef();
        this.form = React.createRef();
    }

    componentDidMount() {
        this._formUri();
    }

    _formUri() {
        var uri = `otpauth://${this.state.type}/${this.state.label}?secret=${this.state.secret}&digits=${this.state.digits}&algorithm=${this.state.algorithm}`;
        if (this.state.issuer.length > 0) uri = uri + '&issuer=' + this.state.issuer;
        if (this.state.type === 'totp') uri = uri + '&period=' + this.state.period;
        if (this.state.type === 'hotp') uri = uri + '&counter=' + this.state.counter;
        uri = encodeURI(uri);
        // Null-check needed because function is called before ref is initialized
        // To solve this we call this function from componentDidMount() as well
        if (this.qr.current != null) QRCode.toDataURL(this.qr.current, uri);
        return uri;
    }

    render() {
        return (
            <div className="w-6/12 mx-auto bg-white drop-shadow rounded px-8 pt-6 pb-8 mb-4 mt-4">
                <div>
                    <h1 className="font-bold text-4xl text-center">Two-Factor QR Code Generator</h1>
                    <h4 className="text-sm text-center">Developed By: <a className="text-blue-500 hover:underline" href="https://kbhaskar.in/">Bhaskar Kandiyal</a></h4>
                    <hr className="mt-1"/>
                </div>
                <div className="flex-wrap md:flex md:items-center md:justify-between">
                    <div className="w-auto lg:w-1/2 flex justify-center"><canvas className="" ref={this.qr}></canvas></div>
                    <OTPView className="w-auto lg:w-1/2" params={this.state}/>
                </div>
                <form ref={this.form} className="" onSubmit={(e) => e.preventDefault()}>
                    {this._type()}
                    {this._account()}
                    {this._issuer()}
                    {this._secret()}
                    <div className="flex mb-4">
                        {this._digits()}
                        {(this.state.type === 'totp')?this._period():this._counter()}
                        {this._algorithm()}
                    </div>
                </form>
                <div className="mb-4 w-auto">
                    <label className="block text-gray-700 text-sm font-bold mb-2">URI:</label>
                    <input type="text" name="uri" value={this._formUri()} className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" readOnly/>
                </div>

                <hr className="mt-5 mb-5"/>
                
                <div id="info">
                    <h4 className="text-2xl font-bold mt-2 mb-5">About</h4>
                    <p>This small web-app generates Two-Factor QR codes that can be used with applications like Google Authenticator</p>
                    <p>The URI scheme used in the QR code is documented <a className="text-blue-500" href="https://github.com/google/google-authenticator/wiki/Key-Uri-Format">here</a></p>
                    <p className="mt-2">The following two types of two-factor codes can be generated:</p>
                    <ul className="list-disc ml-5 mt-2">
                        <li className="list-item">Time-based One-Time Password (TOTP) (<a className="text-blue-500" href="https://datatracker.ietf.org/doc/html/rfc6238">RFC 6238</a>)</li>
                        <li className="list-item">Hmac-based One-Time Password (HOTP) (<a className="text-blue-500" href="https://datatracker.ietf.org/doc/html/rfc4226">RFC 4226</a>)</li>
                    </ul>
                    <h4 class="text-2xl font-bold mt-5 mb-5">Technologies Used</h4>
                    <p>The following technologies / packages were used for building this app:</p>
                    <ul className="list-disc ml-5 mt-2">
                        <li>ReactJS - For putting it all together</li>
                        <li>Tailwind CSS - For CSS</li>
                        <li>JsSHA - To generate HMAC</li>
                        <li>hi-base32 - For base32 encoding</li>
                    </ul>
                </div>
            </div>
        );
    }

    _handleChange(evt) {
        const value = evt.target.value;
        this.state[evt.target.name] = value;

        if (this._validateForm())
            this.setState({ ...this.state, validated: true });
        else
            this.setState({ ...this.state, validated: false });
    }

    _validateForm() {
        if (this.state.secret.length <= 0) return false;
        else if (this.state.label.length <= 0) return false;
        else return true;
    }

    _type() {
        return (
            <div className="mb-4">
                <span className="mr-4">
                    <input type="radio"
                        value="totp"
                        className="mr-2"
                        name="type"
                        checked={this.state.type === "totp"}
                        onChange={this._handleChange} />
                    <label>Time-based (TOTP)</label>
                </span>
                <span>
                    <input type="radio"
                        value="hotp"
                        className="mr-2"
                        name="type"
                        checked={this.state.type === "hotp"}
                        onChange={this._handleChange} />
                    <label>Counter-based (HOTP)</label>
                </span>
            </div>
        );
    }

    _issuer() {
        return (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Issuer (Optional):</label>
                <input name="issuer" type="text" placeholder="Issuer" value={this.state.issuer} onChange={this._handleChange} className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
        );
    }

    _account() {
        return (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Label:</label>
                <input required value={this.state.label} onChange={this._handleChange} name="label" type="text" placeholder="Account" className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
        );
    }

    _secret() {
        return (
            <div className="mb-4">
                <label className="w-1/3 block text-gray-700 text-sm font-bold mb-2">Secret:</label>
                <div className="flex">
                    <input required value={this.state.secret} onChange={this._handleChange} name="secret" type="text" placeholder="Secret" className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    <button className="ml-4 w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => this.setState({...this.state, secret: OTP.generateRandomSecret(32)})}>Generate</button>
                </div>
            </div>
        );
    }

    _digits() {
        var digits = [];
        this.supportedDigits.forEach((val) => digits.push((<option key={val} value={val}>{val}</option>)));

        return (
            <div className="w-1/3 mr-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Digits:</label>
                <select name="digits" value={this.state.digits} onChange={this._handleChange} className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    {digits}
                </select>
            </div>
        );
    }

    _period() {
        return (
            <div className="w-1/3 mr-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Period:</label>
                <input name="period" type="number" value={this.state.period} onChange={this._handleChange} placeholder="Period" className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
        );
    }

    _counter() {
        return (
            <div className="w-1/3 mr-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Counter:</label>
                <input name="counter" type="number" value={this.state.counter} onChange={this._handleChange} placeholder="Counter" className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
        );
    }

    _algorithm() {
        var algorithms = [];
        this.supportedAlgorithms.forEach((val) => algorithms.push((<option key={val} value={val}>{val}</option>)));

        return (
            <div className="w-1/3">
                <label className="block text-gray-700 text-sm font-bold mb-2">Algorithm:</label>
                <select name="algorithm" value={this.state.algorithm} onChange={this._handleChange} className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    {algorithms}
                </select>
            </div>
        );
    }
}

export default OTPForm;