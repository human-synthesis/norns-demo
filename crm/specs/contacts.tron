{
  "module": "contacts",
  "depends": ["core", "companies"],
  "entities": {
    "Contact": {
      "owner": "owner",
      "fields": {
        "name": { "type": "text" },
        "owner": { "type": "ref", "ref": "core.Entity.User" },
        "company": { "type": "ref", "ref": "companies.Entity.Company", "optional": true },
        "email": { "type": "email" },
        "phone": { "type": "text", "optional": true }
      }
    },
    "Note": {
      "owner": "author",
      "fields": {
        "body": { "type": "text" },
        "author": { "type": "ref", "ref": "core.Entity.User" },
        "contact": { "type": "ref", "ref": "Contact" }
      }
    }
  },
  "queries": {
    "all": { "from": "Contact", "limit": 100, "sort": "name" },
    "notes": { "from": "Note", "limit": 200 }
  },
  "policies": {
    "Contact": { "read": "owner or role:admin", "write": "owner" },
    "Note": { "read": "owner or role:admin", "write": "owner" }
  },
  "pages": { "index": { "route": "/contacts", "components": [{ "table": "contacts.Query.all" }] } }
}
