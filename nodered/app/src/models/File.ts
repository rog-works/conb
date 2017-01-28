import DAO from '../lib/DAO';

export default class File {
	public static real(path: string): string {
		return `images/${path}`;
	}
	public static confirm(dir: string): string {
		return prompt('input save dir', dir) || '';
	}
	public static valid(path: string): boolean {
		return !/[\\:*?"<>|]+/.test(path);
	}
	public static normalize(dir: string): string {
		return `${dir.split('/').join('/')}/`;
	}
	public static save(url: string, dir: string): void {
		DAO.self.send('download', {
			url: url,
			dir: File.normalize(dir)
		});
	}
}
