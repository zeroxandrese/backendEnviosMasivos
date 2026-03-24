import "../bootstrap";

/* module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
  },
  dialect: process.env.DB_DIALECT || "postgres",
  timezone: process.env. DB_TIMEZONE || "-03:00",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: process.env.DB_DEBUG === "true"
}; */

module.exports = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
  },
  logging: process.env.DB_DEBUG === "true",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};