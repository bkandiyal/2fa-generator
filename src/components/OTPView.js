import React from 'react';
import OTP from '../lib/OTP.js';

class OTPView extends React.Component {
    
    constructor(props) {
        super(props);
        this.timer = null;
        this._hotpView = this._hotpView.bind(this);
        this._totpView = this._totpView.bind(this);
        this._updateOTP = this._updateOTP.bind(this);

        this.state = {
            otp: '',
            remaining: 0,
            counter: parseInt(props.params.counter),
        };
    }

    componentDidMount() {
        if (!this.props.params.validated) return;
        if (this.props.params.type === 'totp') {
            this.timer = setInterval(this._updateOTP, 1000);
        }
    }

    componentDidUpdate() {
        this.state.otp = '';
        this.state.remaining = 0;
        if (!this.props.params.validated) {
            if (this.timer != null) {
                clearInterval(this.timer);
                this.timer = null;
            }
            return;
        }
        if (this.props.params.type === 'totp') {
            if (this.timer == null) this.timer = setInterval(this._updateOTP, 1000);
        } else {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    render() {
        return (
            <div className={this.props.className}>
                {!this.props.params.validated && 
                    <h4>Please enter valid input</h4>
                }
                { this.props.params.type === 'totp' && this.props.params.validated && this._totpView() }
                {this.props.params.type === 'hotp' && this.props.params.validated && this._hotpView()}
            </div>
        );
    }

    _hotpView() {
        return (
            <div className="p-16">
                <div className="text-center text-2xl text-blue-500">OTP</div>
                <div className="text-4xl text-center bg-blue-100 rounded text-blue-500 p-2">{this.state.otp}</div>
                <div className="flex justify-center mt-1">
                    <button className="w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={this._updateOTP}>Refresh</button>
                </div>
                {/* <span className="bg-blue-400 rounded p-1 mb-1 mt-2 text-white">
                    Counter: {this.state.counter}
                </span> */}
            </div>
        );
    }

    _totpView() {
        return (
            <div className="p-16">
                <div className="text-center text-2xl text-blue-500">OTP</div>
                <div className="text-4xl text-center bg-blue-100 rounded text-blue-500 p-2">{this.state.otp}</div>
                <div className="">
                    <ProgressBar progress={`${(this.state.remaining / this.props.params.period) * 100}%`} remaining={this.state.remaining} />
                </div>
            </div>
        );
    }

    _updateOTP() {
        switch (this.props.params.type) {
            case 'totp':
                console.log(`_updateOTP got - ${this.props.params.secret}`);
                [this.state.otp, this.state.remaining] = OTP.generateTOTP(this.props.params.secret, null, this.props.params.period, this.props.params.digits, this.props.params.algorithm);
                // console.log(`Got OTP ${this.state.otp}`);
                this.setState(this.state);
                break;
            case 'hotp':
                const counter = this.state.counter + 1;
                this.state.otp = OTP.generateHOTP(this.props.params.secret, counter, this.props.params.digits, this.props.params.algorithm);
                this.setState({...this.state, counter: counter})
                break;
            default:
                console.log('Invalid OTP type ' + this.props.params.type);
        }
    }
}

function ProgressBar(props) {
    return (
        <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
                <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-blue-600 bg-blue-200">
                        Time Remaining: {props.remaining}s
                    </span>
                </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div style={{ width: props.progress }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500">
                </div>
            </div>
        </div>
    );
}

export default OTPView;