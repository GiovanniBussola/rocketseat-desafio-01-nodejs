import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

const makeErrorMessage = (message) => {
  return JSON.stringify({error: message})
}

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;
      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.writeHead(400).end(makeErrorMessage('Body is invalid'))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        completed_at: null,
        updated_at: null,
      };

      database.insert("tasks", task);

      return res.writeHead(201).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select("tasks", {
        id,
      });

      if (!task) {
        return res.writeHead(400).end(makeErrorMessage('Task not exists'))
      }

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select("tasks", {
        id,
      });

      if (!task) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ error: "Task not exists" }));
      }

      const availableFieldsToUpdate = ['title', 'description']

      const fieldsToUpdate = {}

      availableFieldsToUpdate.forEach(field => {
        if (req.body[field]) {
          fieldsToUpdate[field] = req.body[field]
        }
      })

      if (!fieldsToUpdate) {
        return res.writeHead(400).end(makeErrorMessage('Invalid body'))
      }

      database.update("tasks", id, fieldsToUpdate);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select("tasks", {
        id,
      });

      if (!task) {
        return res.writeHead(400).end(makeErrorMessage('Task not exists'))
      }

      database.update("tasks", id, { completed_at: task.completed_at ? null : new Date() });

      return res.writeHead(204).end();
    },
  },
];
