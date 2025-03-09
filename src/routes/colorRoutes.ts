import express from "express";
import { updateColor } from "../controllers/colorController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Colors
 *   description: Endpoints para atualização de cores associadas às paletas
 */

/**
 * @swagger
 * /colors/{colorId}:
 *   patch:
 *     summary: Atualiza o código hex de uma cor
 *     tags: [Colors]
 *     parameters:
 *       - in: path
 *         name: colorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da cor que será atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hex:
 *                 type: string
 *                 description: Novo código hexadecimal da cor
 *                 example: "#FF5733"
 *             required:
 *               - hex
 *     responses:
 *       200:
 *         description: Cor atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cor atualizada com sucesso."
 *                 color:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     hex:
 *                       type: string
 *                       example: "#FF5733"
 *       400:
 *         description: O novo valor hex é obrigatório ou parâmetros inválidos.
 *       403:
 *         description: Não autorizado a atualizar essa cor.
 *       404:
 *         description: Cor não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
router.patch("/:colorId", authMiddleware as any, updateColor);

export default router;
