DROP TABLE IF EXISTS entry;
CREATE TABLE entry (
	id INT(10) unsigned NOT NULL AUTO_INCREMENT,
	signature VARCHAR(64) NOT NULL DEFAULT '',
	uri VARCHAR(256) NOT NULL DEFAULT '',
	created DATETIME NOT NULL DEFAULT 0,
	updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	UNIQUE unique_1 (signature)
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARSET=utf8;

DROP TABLE IF EXISTS info;
CREATE TABLE info (
	id INT(10) unsigned NOT NULL AUTO_INCREMENT,
	entry_id INT(10) unsigned NOT NULL DEFAULT 0,
	title VARCHAR(64) NOT NULL DEFAULT '',
	description VARCHAR(128) NOT NULL DEFAULT '',
	entried DATETIME NOT NULL DEFAULT 0,
	created DATETIME NOT NULL DEFAULT 0,
	updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	UNIQUE unique_1 (entry_id)
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARSET=utf8;

DROP TABLE IF EXISTS retention;
CREATE TABLE retention (
	id INT(10) unsigned NOT NULL AUTO_INCREMENT,
	signature VARCHAR(64) NOT NULL DEFAULT '',
	visited tinyINT(1) unsigned NOT NULL DEFAULT 0,
	stored tinyINT(1) unsigned NOT NULL DEFAULT 0,
	bookmarked tinyINT(1) unsigned NOT NULL DEFAULT 0,
	created DATETIME NOT NULL DEFAULT 0,
	updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	UNIQUE unique_1 (signature)
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARSET=utf8;

DROP TABLE IF EXISTS author;
CREATE TABLE author (
	id INT(10) unsigned NOT NULL AUTO_INCREMENT,
	name VARCHAR(32) NOT NULL DEFAULT '',
	created DATETIME NOT NULL DEFAULT 0,
	updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARSET=utf8;
