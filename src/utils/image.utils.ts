import getColors from 'get-image-colors';

export const extractPaletteFromImage = async (imageUrl: string): Promise<string[]> => {
  try {
    const resizedImageUrl = imageUrl.replace('/upload/', '/upload/w_500,h_500,c_scale/');
    console.log("🔍 Usando imagem reduzida para extração:", resizedImageUrl);

    const colors = await getColors(resizedImageUrl);

    if (!colors || colors.length === 0) {
      console.log("⚠️ Nenhuma cor extraída!");
      return [];
    }

    let hexColors = colors.map((color: { hex: () => string }) => color.hex());

    if (hexColors.length > 5) {
      hexColors = hexColors.slice(0, 5);
    } else {
      while (hexColors.length < 5) {
        hexColors.push("#000000");
      }
    }

    console.log("🎨 Paleta extraída com sucesso:", hexColors);
    return hexColors;
  } catch (error) {
    console.error("❌ Erro ao extrair cores:", error);
    return [];
  }
};
