import prisma from "../config/prismaClient";

export const saveColors = async (photoId: number, colors: string[]) => {
  const colorData = colors.map((hex) => ({ hex, photoId }));
  return await prisma.color.createMany({ data: colorData });
};

export const extractPaletteFromColors = (colors: { hex: string }[]) => {
  return colors.map((color) => color.hex);
};
