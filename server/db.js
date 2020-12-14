const { Pool } = require("pg");
require("dotenv").config();

let pool;
let config;

if (process.env.DATABASE_URL) {
	//it's set in Heroku
	const connectionString = process.env.DATABASE_URL;
	config = {
		connectionString: connectionString,
		sslmode: require,
		ssl: {
			rejectUnauthorized: false,
		},
	};
} else {
	//default local config
	config = {
		host: "localhost",
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: 5432,
	};
}
pool = new Pool(config);

// https://node-postgres.com/guides/project-structure
module.exports = {
	async query(text, params) {
		const start = Date.now();
		const res = await pool.query(text, params);
		const duration = Date.now() - start;
		console.log("executed query", { text, duration, rows: res.rowCount });
		return res;
	},
	async getClient() {
		const client = await pool.connect();
		const query = client.query;
		const release = client.release;
		// set a timeout of 5 seconds, after which we will log this client's last query
		const timeout = setTimeout(() => {
			console.error("A client has been checked out for more than 5 seconds!");
			console.error(
				`The last executed query on this client was: ${client.lastQuery}`
			);
		}, 5000);
		// monkey patch the query method to keep track of the last query executed
		client.query = (...args) => {
			client.lastQuery = args;
			return query.apply(client, args);
		};
		client.release = () => {
			// clear our timeout
			clearTimeout(timeout);
			// set the methods back to their old un-monkey-patched version
			client.query = query;
			client.release = release;
			return release.apply(client);
		};
		return client;
	},
};
