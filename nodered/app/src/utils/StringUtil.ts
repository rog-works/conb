export default class StringUtil {
	public static snakalize(str: string): string {
		let ret = '';
		for (const c of str) {
			ret += /[A-Z]/.test(c) ? `_${c.toLowerCase()}` : c;
		}
		return ret.replace(/^_/, '');
	}
	public static camerize(str: string): string {
		return str.split('_').map((word) => `${word[0].toUpperCase()}${word.substr(1).toLowerCase()}`).join('');
	}
}