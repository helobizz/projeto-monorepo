import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { userRoutes } from "./userRoutes";

const router = Router();

router.use('/auth', authRoutes);

// Registra as rotas de usuário sob prefixo / user
router.use('/users', userRoutes)

export { router as appRoutes};