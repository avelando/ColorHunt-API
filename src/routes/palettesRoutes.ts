import express from "express";
import {
  createPalette,
  getUserPalettes,
  getPalette,
  updatePalette,
  deletePalette,
} from "../controllers/paletteController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Palettes
 *   description: Endpoints para gerenciamento de paletas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Palette:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         photoId:
 *           type: number
 *           example: 10
 *         userId:
 *           type: number
 *           example: 1
 *         title:
 *           type: string
 *           example: "Minha Paleta"
 *         isPublic:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         colors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               hex:
 *                 type: string
 *                 example: "#FF5733"
 *               originImageUrl:
 *                 type: string
 *                 example: "http://example.com/image.jpg"
 *
 *     CreatePaletteRequest:
 *       type: object
 *       required:
 *         - imageUrl
 *         - title
 *         - isPublic
 *       properties:
 *         imageUrl:
 *           type: string
 *           example: "http://example.com/image.jpg"
 *         title:
 *           type: string
 *           example: "Minha Paleta"
 *         isPublic:
 *           type: boolean
 *           example: true
 *
 *     UpdatePaletteRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Nova Paleta"
 *         isPublic:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * /palettes/upload:
 *   post:
 *     summary: Cria uma nova paleta a partir de uma foto
 *     tags: [Palettes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Dados para criação da paleta
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaletteRequest'
 *     responses:
 *       201:
 *         description: Paleta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Palette created successfully"
 *                 palette:
 *                   $ref: '#/components/schemas/Palette'
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/upload", authMiddleware as any, createPalette);

/**
 * @swagger
 * /palettes/user:
 *   get:
 *     summary: Retorna as paletas do usuário autenticado
 *     tags: [Palettes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de paletas do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 palettes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Palette'
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/user", authMiddleware as any, getUserPalettes);

/**
 * @swagger
 * /palettes/{paletteId}:
 *   get:
 *     summary: Retorna uma paleta específica do usuário autenticado
 *     tags: [Palettes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paletteId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID da paleta
 *     responses:
 *       200:
 *         description: Paleta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 palette:
 *                   $ref: '#/components/schemas/Palette'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Paleta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:paletteId", authMiddleware as any, getPalette);

/**
 * @swagger
 * /palettes/{paletteId}:
 *   patch:
 *     summary: Atualiza o título e a visibilidade de uma paleta
 *     tags: [Palettes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paletteId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID da paleta
 *     requestBody:
 *       description: Dados para atualização da paleta (somente título e visibilidade podem ser atualizados)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePaletteRequest'
 *     responses:
 *       200:
 *         description: Paleta atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Palette updated successfully"
 *                 palette:
 *                   $ref: '#/components/schemas/Palette'
 *       400:
 *         description: Erro de validação
 *       403:
 *         description: Não autorizado a atualizar a paleta
 *       404:
 *         description: Paleta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.patch("/:paletteId", authMiddleware as any, updatePalette);

/**
 * @swagger
 * /palettes/{paletteId}:
 *   delete:
 *     summary: Deleta uma paleta e suas cores associadas
 *     tags: [Palettes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paletteId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID da paleta
 *     responses:
 *       200:
 *         description: Paleta deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Palette deleted successfully"
 *       400:
 *         description: Erro de validação
 *       403:
 *         description: Não autorizado a deletar a paleta
 *       404:
 *         description: Paleta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/:paletteId", authMiddleware as any, deletePalette);

export default router;
