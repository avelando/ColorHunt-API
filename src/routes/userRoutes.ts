import express from "express";
import { getUser, updateUser, deleteUser } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints para gerenciamento de usuários (perfil)
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: "Retorna os dados do usuário autenticado"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Dados do usuário retornados com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 email:
 *                   type: string
 *                   example: "john@example.com"
 *       400:
 *         description: "User ID is missing"
 *       404:
 *         description: "User not found"
 *       500:
 *         description: "Erro interno do servidor"
 */
router.get("/me", authMiddleware as any, getUser);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: "Atualiza os dados do usuário autenticado"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: "Dados a serem atualizados do usuário. Apenas nome, username, email e senha podem ser alterados."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe Updated"
 *               username:
 *                 type: string
 *                 example: "johnnyupdated"
 *               email:
 *                 type: string
 *                 example: "john.updated@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "newsecret123"
 *     responses:
 *       200:
 *         description: "Usuário atualizado com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *                 updatedUser:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "John Doe Updated"
 *                     username:
 *                       type: string
 *                       example: "johnnyupdated"
 *                     email:
 *                       type: string
 *                       example: "john.updated@example.com"
 *       400:
 *         description: "User ID is missing"
 *       500:
 *         description: "Erro interno do servidor"
 */
router.put("/me", authMiddleware as any, updateUser);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: "Deleta o usuário autenticado"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Usuário deletado com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       400:
 *         description: "User ID is missing"
 *       404:
 *         description: "User not found"
 *       500:
 *         description: "Erro interno do servidor"
 */
router.delete("/me", authMiddleware as any, deleteUser);

export default router;
