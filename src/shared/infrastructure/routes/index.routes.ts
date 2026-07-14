import { Router } from "express";
import { authRoutes } from "@features/auth/infrastructure/routes/auth.routes";
import { etapasRoutes } from "@features/etapas/infrastructure/routes/etapas.routes";
import { fincasRoutes } from "@features/fincas/infrastructure/routes/fincas.routes";
import { parcelasRoutes } from "@features/parcelas/infrastructure/routes/parcelas.routes";
import { publicParcelasRoutes } from "@features/parcelas/infrastructure/routes/public-parcelas.routes";
import { propietariosRoutes } from "@features/propietarios/infrastructure/routes/propietarios.routes";
import { publicPropietariosRoutes } from "@features/propietarios/infrastructure/routes/public-propietarios.routes";
import { registroCaficultoresRoutes } from "@features/registro-caficultores/infrastructure/routes/registro-caficultores.routes";
import { publicRegistroCaficultoresRoutes } from "@features/registro-caficultores/infrastructure/routes/public-registro-caficultores.routes";
import { reportesRoutes } from "@features/reportes/infrastructure/routes/reportes.routes";
import { tarifasMetrajeRoutes } from "@features/tarifas-metraje/infrastructure/routes/tarifas-metraje.routes";
import { ubicacionesRoutes } from "@features/ubicaciones/infrastructure/routes/ubicaciones.routes";
import { ventasRoutes } from "@features/ventas/infrastructure/routes/ventas.routes";

/**
 * Ruta principal de la API. Aquí se monta el router de cada feature
 * bajo su prefijo correspondiente.
 */
export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/etapas", etapasRoutes);
apiRoutes.use("/fincas", fincasRoutes);
apiRoutes.use("/parcelas", parcelasRoutes);
apiRoutes.use("/propietarios", propietariosRoutes);
apiRoutes.use("/registro-caficultores", registroCaficultoresRoutes);
apiRoutes.use("/reportes", reportesRoutes);
apiRoutes.use("/tarifas-metraje", tarifasMetrajeRoutes);
apiRoutes.use("/ubicaciones", ubicacionesRoutes);
apiRoutes.use("/ventas", ventasRoutes);

// Catálogo público sin autenticación (el visitante navega antes de registrarse).
apiRoutes.use("/public/parcelas", publicParcelasRoutes);
// Registro público de caficultores desde la landing.
apiRoutes.use("/public/registro-caficultores", publicRegistroCaficultoresRoutes);
// Registro y activación pública de propietarios desde la landing.
apiRoutes.use("/public/propietarios", publicPropietariosRoutes);
