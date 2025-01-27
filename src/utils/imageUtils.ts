import getColors from "get-image-colors";

export const extractPaletteFromImage = async (imageUrl: string): Promise<string[]> => {
  const colors = await getColors(imageUrl);
  return colors.map((color: { hex: () => any; }) => color.hex());
};
