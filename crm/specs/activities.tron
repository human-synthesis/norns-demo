{
  "module": "activities",
  "depends": ["core", "contacts", "deals"],
  "entities": {
    "Activity": {
      "owner": "owner",
      "fields": {
        "owner": { "type": "ref", "ref": "core.Entity.User" },
        "contact": { "type": "ref", "ref": "contacts.Entity.Contact" },
        "deal": { "type": "ref", "ref": "deals.Entity.Deal", "optional": true },
        "due": { "type": "datetime", "optional": true },
        "kind": { "type": "text" },
        "subject": { "type": "text" }
      },
      "status": { "cancelled": [], "done": [], "planned": ["done", "cancelled"] }
    },
    "Task": {
      "owner": "owner",
      "fields": {
        "owner": { "type": "ref", "ref": "core.Entity.User" },
        "done": { "type": "bool", "default": false },
        "due": { "type": "date", "optional": true },
        "title": { "type": "text" }
      }
    }
  },
  "queries": {
    "agenda": { "from": "Activity", "live": true, "groupBy": "status" },
    "tasks": { "from": "Task", "limit": 100, "sort": "due" }
  },
  "actions": {
    "cancel": {
      "input": { "id": "Activity.id" },
      "requires": "status == planned",
      "steps": [{ "set": { "status": "cancelled", "entity": "Activity" } }],
      "refresh": ["activities.Query.agenda"],
      "examples": [{ "input": { "id": "$planned" }, "expect": { "status": "cancelled" } }]
    },
    "complete": {
      "input": { "id": "Activity.id" },
      "requires": "status == planned",
      "steps": [{ "set": { "status": "done", "entity": "Activity" } }, { "emit": "activity.completed" }],
      "refresh": ["activities.Query.agenda"],
      "examples": [{ "input": { "id": "$planned" }, "expect": { "status": "done" } }]
    },
    "detachContact": { "input": { "id": "Activity.id" } }
  },
  "policies": {
    "Activity": { "read": "owner or role:admin", "write": "owner" },
    "Task": { "read": "owner or role:admin", "write": "owner" }
  },
  "pages": {
    "agenda": {
      "route": "/activities",
      "state": { "selected": "Activity.id?" },
      "components": [{ "kanban": "activities.Query.agenda", "onMove": "activities.Action.complete" }]
    },
    "tasks": { "route": "/tasks", "components": [{ "table": "activities.Query.tasks" }] }
  },
  "triggers": { "contacts.Contact.deleted": "activities.Action.detachContact" }
}
