const knex = require("knex");
const sqlite3 = require("sqlite3");
const path = require("path");

const connectedKnex = knex({
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, "functions/subscriptions.sqlite3"),
  },
  useNullAsDefault: true,
});

module.exports = connectedKnex;
