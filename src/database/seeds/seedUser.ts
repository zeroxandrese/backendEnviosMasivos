// seedUser.ts
import { hash } from "bcryptjs";
import sequelize from "../../database";
import User from "../../models/User";

async function seedAdminUser() {
  try {
    await sequelize.authenticate();
    console.log("Conexión OK ✅");

    const passwordHash = await hash("123456", 8);

    const [user, created] = await User.findOrCreate({
      where: { email: "admin@admin.com" },
      defaults: {
        name: "Admin",
        profile: "admin",
        passwordHash,
        companyId: 1,
        super: true,
        online: false,
      },
    });

    if (created) {
      console.log("Usuario admin creado ✅", user.toJSON());
    } else {
      console.log("El usuario admin ya existe");
    }
  } catch (err) {
    console.error("Error al crear el usuario:", err);
  } finally {
    await sequelize.close();
  }
}

seedAdminUser();