import * as CryptoJS from 'crypto-js';

export default class Sign {
	public static digest(...args: Array<any>): string {
		return CryptoJS.HmacSHA1(JSON.stringify(args), 'hogehoge').toString();
	}
}
