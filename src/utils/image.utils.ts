import axios from 'axios';
import getColors from 'get-image-colors';
import * as fs from 'fs';
import * as path from 'path';

export const extractPaletteFromImage = async (imageUrl: string): Promise<string[]> => {
  if (!imageUrl) {
    console.error("❌ Erro: URL da imagem não fornecida.");
    throw new Error("A URL da imagem é obrigatória para extrair a paleta.");
  }

  const tempFilePath = path.join(__dirname, 'temp_image.jpg');

  try {
    console.log("📥 Baixando imagem para extração de cores:", imageUrl);

    const response = await axios({
      url: imageUrl,
      responseType: 'arraybuffer',
      validateStatus: (status) => status >= 200 && status < 300,
    }).catch((err) => {
      console.error("❌ Erro ao baixar imagem:", err.response?.status, err.response?.statusText);
      throw new Error("Falha ao baixar a imagem do servidor.");
    });

    if (!response || !response.data) {
      console.error("❌ Erro: Resposta inválida da requisição de imagem.");
      throw new Error("Não foi possível baixar a imagem.");
    }

    await fs.promises.writeFile(tempFilePath, Buffer.from(response.data));
    console.log("📂 Imagem salva temporariamente em:", tempFilePath);

    let colors;
    try {
      colors = await getColors(tempFilePath);
    } catch (colorError) {
      console.error("❌ Erro ao extrair cores:", colorError);
      throw new Error("Falha ao processar a imagem para extração de cores.");
    }

    await fs.promises.unlink(tempFilePath).catch((err) => {
      console.warn("⚠️ Falha ao excluir o arquivo temporário:", err.message);
    });

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
    console.error("❌ Erro crítico ao extrair cores:", error.message);

    try {
      if (fs.existsSync(tempFilePath)) {
        await fs.promises.unlink(tempFilePath);
      }
    } catch (unlinkError) {
      console.error("⚠️ Falha ao excluir arquivo temporário após erro:", unlinkError);
    }

    throw error;
  }
};
