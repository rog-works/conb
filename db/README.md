Cheet sheet
===========

## Export
```
$ docker exec nodered-db mongoexport -d nodered -c entry | gzip > .backup/nodered.entry-`date +%y%m%d`.json.gz
```

## Import
```
$ mongoimport -d nodered -c entry --file=/data/db/nodered.entry-170314_2.json
```

## Find

* Regular expression
```
> db.entry.find({uri: /google/})
> db.entry.find({uri: {$regex: "google", $options: "i"}})
```

* Exists
```
> db.entry.find({"attrs.files": {$exists: true}})
```

## Alter table

### Add field

* array in object
  * before
  ```
  > db.entry.findOne("588e090ce1b4fe000f42f427");
  {
    "_id" : ObjectId("588e090ce1b4fe000f42f427"),
    "type" : "entry",
    "signature" : "22b65a646f337c6effbedb9a6d6d64d6e644281e",
    "uri" : "https://google.co.jp/0",
    "attrs" : [
        {
            "type" : "post",
            "href" : "https://google.co.jp/0",
            "src" : "",
            "text" : "hogehoge, 0",
            "date" : "none",
            "visit" : false,
            "store" : false,
            "bookmark" : true
        }
    ]
  }
  ```

  * update
  ```
  > db.entry.update({}, {$set: {"attrs.0.favorite": false}}, {multi: true});
  ```

  * after
  ```
  > db.entry.findOne("588e090ce1b4fe000f42f427");
  {
    "_id" : ObjectId("588e090ce1b4fe000f42f427"),
    "type" : "entry",
    "signature" : "22b65a646f337c6effbedb9a6d6d64d6e644281e",
    "uri" : "https://google.co.jp/0",
    "attrs" : [
        {
            "type" : "post",
            "href" : "https://google.co.jp/0",
            "src" : "",
            "text" : "hogehoge, 0",
            "date" : "none",
            "visit" : false,
            "store" : false,
            "bookmark" : true,
            "favotite": false
        }
    ]
  }
  ```

### Migrate field

* update
```
> db.entry.find().forEach((d) => { const obj = {}; for (let attr of d.attrs) { print(attr.type); obj[attr.type] = attr; } print(obj); db.entry.update({_id: d._id}, {$set: {attr: obj}}); });
> db.entry.find().forEach((d) => { db.entry.update({_id: d._id}, {$unset: {attrs: ''}}); });
> db.entry.find().forEach((d) => { db.entry.update({_id: d._id}, {$rename: {attr: 'attrs'}}); });
```

* after
```
> db.entry.findOne();
{
    "_id" : ObjectId("588d9f4e4c71c80010c1fa09"),
    "type" : "entry",
    "signature" : "22b65a646f337c6effbedb9a6d6d64d6e644281e",
    "uri" : "https://google.co.jp/0",
    "attrs" : {
        "post" : {
            "type" : "post",
            "href" : "https://google.co.jp/0",
            "src" : "",
            "text" : "hogehoge, 0",
            "date" : "none",
            "visit" : true,
            "store" : false,
            "bookmark" : true,
            "favorite" : true
        }
    }
}
```
