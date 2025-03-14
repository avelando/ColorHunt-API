// src/services/color.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class ColorService {
  constructor(private readonly prisma: PrismaService) {}

  async saveColors(paletteId: number, photoId: number, colors: string[]): Promise<void> {
    if (!colors || colors.length !== 5) {
      console.log("⚠️ Paleta inválida. Esperado 5 cores, mas recebeu:", colors);
      return;
    }

    try {
      console.log("💾 Salvando cores no banco para paletteId:", paletteId, "Cores:", colors);

      const colorData = colors.map((hex: string) => ({
        hex,
        paletteId: paletteId.toString(),
        photoId: photoId.toString(),
      }));

      await this.prisma.color.createMany({ data: colorData });
      console.log("✅ Cores salvas com sucesso no banco!");
    } catch (error) {
      console.error("❌ Erro ao salvar cores no banco:", error);
    }
  }
}
