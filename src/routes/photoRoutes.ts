import express from "express";
import { uploadPhoto, getPalette, getUserPhotos } from "../controllers/photoController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Photos
 *   description: "Endpoints para upload de fotos e visualização de paletas geradas"
 */

/**
 * @swagger
 * /photos/upload:
 *   post:
 *     summary: "Faz o upload de uma foto e gera uma paleta de cores"
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: "Dados para o upload da foto e criação da paleta"
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *               - title
 *               - isPublic
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: "URL da imagem a ser enviada"
 *                 example: "http://example.com/photo.jpg"
 *               title:
 *                 type: string
 *                 description: "Título da foto ou paleta"
 *                 example: "Minha Foto"
 *               isPublic:
 *                 type: boolean
 *                 description: "Define se a paleta gerada será pública"
 *                 example: true
 *     responses:
 *       201:
 *         description: "Foto enviada e paleta gerada com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Photo uploaded and palette generated successfully"
 *                 photo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     imageUrl:
 *                       type: string
 *                       example: "http://example.com/photo.jpg"
 *                 palette:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["#FF5733", "#33FF57", "#3357FF", "#FFFF33", "#FF33FF"]
 *       400:
 *         description: "Erro de validação (ex: imageUrl não fornecida)"
 *       500:
 *         description: "Erro interno do servidor"
 */
router.post("/upload", authMiddleware as any, uploadPhoto);

/**
 * @swagger
 * /photos/{photoId}/palette:
 *   get:
 *     summary: "Retorna a paleta de cores gerada para uma foto específica"
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: number
 *         description: "ID da foto para a qual a paleta foi gerada"
 *     responses:
 *       200:
 *         description: "Paleta retornada com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 palette:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["#FF5733", "#33FF57", "#3357FF", "#FFFF33", "#FF33FF"]
 *       400:
 *         description: "Erro de validação (ex: photoId inválido)"
 *       403:
 *         description: "Acesso não autorizado ou foto não encontrada"
 *       500:
 *         description: "Erro interno do servidor"
 */
router.get("/:photoId/palette", authMiddleware as any, getPalette);

/**
 * @swagger
 * /photos/user:
 *   get:
 *     summary: "Retorna todas as fotos do usuário autenticado"
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Lista de fotos do usuário retornada com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 photos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       imageUrl:
 *                         type: string
 *                         example: "http://example.com/photo.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T12:00:00Z"
 *                       colors:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["#FF5733", "#33FF57", "#3357FF", "#FFFF33", "#FF33FF"]
 *       400:
 *         description: "Erro de validação (ex: token não fornecido)"
 *       500:
 *         description: "Erro interno do servidor"
 */
router.get("/user", authMiddleware as any, getUserPhotos);

export default router;
