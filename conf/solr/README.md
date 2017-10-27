## RCloud search

RCloud can optionally index all notebooks and provide a search
capability. It currently requires Apache Solr.

The script `solrsetup.sh` can be used to help with the setup
of a Solr instance. Example use:

    sh solrsetup.sh /data/rcloud/services/solr

Remove any previous solr simlink in the directory first!

It will fetch and install Solr and configure it to contain the
schema suitable for RCloud use. It is enabled in rcloud by using
the `solr.url` directive that points to the Solr API - see the
output of the above script.

This also requires the extension package [rcloud.solr](https://github.com/att/rcloud.solr) to be installed.

### Search Capability

Notebooks are stored as nested documents with the following `doc_type`s:

* `notebook` parent level notebook
* `cell` and code cell
* `asset` something like `scratch.R`
* `comment` comments are stored as a document as well

This means that you can apply filtering in your searches:

```
# search comments only
<searchstring> AND doc_type: comment
```

Other, cell level, info can also be used. For example, search only in `Markdown` cells with

```
# search for Markdown
<searchstring> AND language: Markdown
```

Available fields include:

- `created_at`
- `updated_at`
- `user`
- `commited_at`
- `description` (title of the notebook)
- `notebook_id`
- `filename`
- `language`
- `size`
- `content`
- `code` (different tokenizer)

