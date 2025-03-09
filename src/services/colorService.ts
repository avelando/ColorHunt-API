import prisma from "../config/prismaClient";

export const saveColors = async (
  paletteId: number,
  originImageUrl: string,
  colors: string[]
) => {
  if (!colors || colors.length !== 5) {
    console.log("⚠️ Paleta inválida. Esperado 5 cores, mas recebeu:", colors);
    return;
  }

  try {
    console.log("💾 Salvando cores no banco para paletteId:", paletteId, "Cores:", colors);

    const colorData = colors.map((hex: string) => ({
      hex,
      paletteId,
      originImageUrl,
    }));

    await prisma.color.createMany({ data: colorData });

    console.log("✅ Cores salvas com sucesso no banco!");
  } catch (error) {
    console.error("❌ Erro ao salvar cores no banco:", error);
  }
};
