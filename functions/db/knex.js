const knex = require("knex");
const sqlite3 = require("sqlite3");
const connectedKnex = knex({
  client: "sqlite3",
  connection: {
    filename: "subscriptions.sqlite3",
  },
});

module.exports = connectedKnex;
