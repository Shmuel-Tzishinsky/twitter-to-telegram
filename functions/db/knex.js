const knex = require("knex");
const sqlite3 = require("sqlite3");
const connectedKnex = knex({
  client: "sqlite3",
  connection: {
    filename: "functions/subscriptions.sqlite3",
  },
  useNullAsDefault: true,
});

module.exports = connectedKnex;
