import prisma from "../config/prismaClient";

export const saveColors = async (photoId: number, colors: string[]) => {
  if (!colors || colors.length !== 5) {
    console.log("⚠️ Paleta inválida. Esperado 5 cores, mas recebeu:", colors);
    return;
  }

  try {
    console.log("💾 Salvando cores no banco para photoId:", photoId, "Cores:", colors);

    const colorData = colors.map((hex) => ({ hex, photoId }));
    await prisma.color.createMany({ data: colorData });

    console.log("✅ Cores salvas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao salvar cores no banco:", error);
  }
};
