import axios from 'axios';
import getColors from 'get-image-colors';
import * as fs from 'fs';
import * as path from 'path';

export const extractPaletteFromImage = async (imageUrl: string): Promise<string[]> => {
  const tempFilePath = path.join(__dirname, 'temp_image.jpg');

  try {
    console.log("📥 Baixando imagem para extração de cores:", imageUrl);

    const response = await axios({
      url: imageUrl,
      responseType: 'arraybuffer',
      validateStatus: (status) => status >= 200 && status < 300,
    });    

    await fs.promises.writeFile(tempFilePath, Buffer.from(response.data));

    console.log("📂 Imagem salva temporariamente em:", tempFilePath);

    const colors = await getColors(tempFilePath);

    await fs.promises.unlink(tempFilePath);

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

    try {
      if (fs.existsSync(tempFilePath)) {
        await fs.promises.unlink(tempFilePath);
      }
    } catch (unlinkError) {
      console.error("⚠️ Falha ao excluir arquivo temporário:", unlinkError);
    }

    throw error;
  }
};
