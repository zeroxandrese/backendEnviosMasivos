// test-db.js
const { Sequelize } = require("sequelize");

// Usa exactamente la misma variable de entorno que tu config
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log, // así vemos si se conecta
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión exitosa a la DB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error conectando a la DB:", error);
    process.exit(1);
  }
}

testConnection();