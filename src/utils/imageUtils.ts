import axios from "axios";
import ColorThief from "colorthief";
import { JSDOM } from "jsdom";

export const extractPaletteFromImage = async (imageUrl: string): Promise<string[]> => {
  try {
    const resizedImageUrl = imageUrl.replace("/upload/", "/upload/w_500,h_500,c_scale/");
    console.log("🔍 Usando imagem reduzida para extração:", resizedImageUrl);

    const response = await axios.get(resizedImageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    const dom = new JSDOM(`<img src="${resizedImageUrl}" />`);
    const img = dom.window.document.querySelector("img");

    if (!img) {
      throw new Error("Imagem não encontrada para extração de cores");
    }

    const colorThief = new ColorThief();
    const palette = await colorThief.getPalette(img, 5);

    if (!palette || palette.length === 0) {
      console.log("⚠️ Nenhuma cor extraída!");
      return [];
    }

    const hexColors = palette.map(([r, g, b]) => `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`);

    console.log("🎨 Paleta extraída com sucesso:", hexColors);
    return hexColors;
  } catch (error) {
    console.error("❌ Erro ao extrair cores:", error);
    return [];
  }
};
