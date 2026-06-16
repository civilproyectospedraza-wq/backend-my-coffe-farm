import { PrismaClient } from "@prisma/client";
import colombia from "./data/colombia.json";

const prisma = new PrismaClient();

async function main() {
  const { departamentos, municipios } = colombia;

  // Departamentos primero (los municipios dependen de ellos).
  const dep = await prisma.departamento.createMany({
    data: departamentos,
    skipDuplicates: true,
  });

  const mun = await prisma.municipio.createMany({
    data: municipios,
    skipDuplicates: true,
  });

  console.log(
    `Seed Colombia listo -> departamentos: ${dep.count}/${departamentos.length}, municipios: ${mun.count}/${municipios.length}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
