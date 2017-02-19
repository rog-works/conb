import {URIEntity} from './URIBuilder';

export default class SiteMigrate {
	public static create(): URIEntity[] {
		return [
		];
	}
	public static exec(): void {
		// for (var entity of this.create()) {
		// 	var doc = db.entry.fineOne({"attrs.site": {$exists: true}, "attrs.site.from", /entity.host/});
		// 	if (doc) {
		// 		entity.type = 'from';
		// 		db.entry.update({_id: doc._id}, {$set: {"attrs.site.from": entity}});
		// 	}
		// }
	}
}