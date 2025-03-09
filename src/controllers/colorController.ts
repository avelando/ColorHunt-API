import { Request, Response } from "express";
import prisma from "../config/prismaClient";

export const updateColor = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { colorId } = req.params;
  const { hex } = req.body;

  if (!hex) {
    res.status(400).json({ error: "O novo valor hex é obrigatório." });
    return;
  }

  try {
    const color = await prisma.color.findUnique({
      where: { id: parseInt(colorId, 10) },
      include: { palette: true },
    });

    if (!color) {
      res.status(404).json({ error: "Cor não encontrada." });
      return;
    }

    if (color.palette.userId !== userId) {
      res.status(403).json({ error: "Não autorizado a atualizar essa cor." });
      return;
    }

    const updatedColor = await prisma.color.update({
      where: { id: parseInt(colorId, 10) },
      data: { hex },
    });

    res.status(200).json({
      message: "Cor atualizada com sucesso.",
      color: updatedColor,
    });
  } catch (error) {
    console.error("Erro ao atualizar cor:", error);
    res.status(500).json({ error: "Erro ao atualizar cor", details: error });
  }
};
