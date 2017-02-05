Cheet sheet
===========

## Export
```
d exec nodered-db mongoexport -d nodered -c entry | gzip > nodered.entry-20170204.json.gz
```

## Find

* Regular expression
```
> db.entry.find({uri: /google/})
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
