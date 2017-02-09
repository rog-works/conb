export default class Path {
	public static confirm(dir: string): string { // XXX not pure js
		dir = prompt('input save dir', dir) || '';
		return Path.valid(dir) ? dir : '';
	}
	public static real(path: string): string {
		return `images/${path}`; // XXX
	}
	public static valid(path: string): boolean {
		return !/[\\:*?"<>|]+/.test(path);
	}
	public static normalize(dir: string): string {
		return `${dir.split('/').join('/')}`;
	}
	public static filename(path: string) {
		return path.split('/').pop() || ''; // XXX returned nullable
	}
	public static dirname(path: string) {
		const route = path.split('/');
		route.pop();
		return `${route.join('/')}/`;
	}
}
