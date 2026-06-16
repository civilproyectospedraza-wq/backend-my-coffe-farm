import { z } from "zod";

export const buscarMunicipiosSchema = z.object({
  search: z.string().trim().min(1).optional(),
  departamentoId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
