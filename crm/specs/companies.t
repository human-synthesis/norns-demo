{
  "module": "companies",
  "depends": ["core"],
  "entities": {
    "Company": {
      "owner": "owner",
      "fields": {
        "name": { "type": "text" },
        "owner": { "type": "ref", "ref": "core.Entity.User" },
        "domain": { "type": "url", "optional": true },
        "industry": { "type": "text", "optional": true }
      }
    },
    "Tag": { "fields": { "label": { "type": "text", "unique": true } } }
  },
  "queries": {
    "all": { "from": "Company", "limit": 100, "sort": "name" },
    "tags": { "from": "Tag", "limit": 200, "sort": "label" }
  },
  "policies": {
    "Company": { "read": "owner or role:admin", "write": "owner" },
    "Tag": { "read": "role:member or role:admin", "write": "role:admin" }
  },
  "pages": { "index": { "route": "/companies", "components": [{ "table": "companies.Query.all" }] } }
}
