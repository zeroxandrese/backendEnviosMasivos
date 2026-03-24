const { hash } = require("bcryptjs");
const sequelize = require("../config/database"); // tu instancia Sequelize
const User = require("../models/User");
const Plan = require("../models/Plan");
const Company = require("../models/Company");

async function runSeed() {
  try {
    await sequelize.authenticate();

    // Crear Plan
    const plan = await Plan.create({
      name: "Plan Basico2",
      users: 5,
      connections: 1,
      queues: 3,
      amount: "10.00",
    });

    // Crear Company
    const company = await Company.create({
      name: "allmark2",
      email: "empresa@test.com",
      phone: "999999999",
      planId: plan.id,
      status: true,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Crear Admin
    const passwordHash = await hash("admin123", 8);
    const user = await User.create({
      name: "Administrador",
      email: "admin@crm.com",
      passwordHash,
      profile: "admin",
      super: true,
      online: false,
      companyId: company.id,
    });

    console.log("Seed ejecutada con éxito ✅", { plan, company, user: user.toJSON() });
  } catch (err) {
    console.error("Error en seed:", err);
  } finally {
    await sequelize.close();
  }
}

runSeed();  