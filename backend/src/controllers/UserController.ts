import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export class UserController {
  // GET /api/users - Lista todos os usuários
  public static async index(req: Request, res: Response): Promise<Response> {
    try {
      const users = await User.findAll({
        attributes: ['id', 'nome', 'email', 'createdAt', 'updatedAt'],
      });

      return res.status(200).json(users);
    } catch (error: any) {
      return res
        .status(500)
        .json({ erro: 'Erro ao listar usuários', detalhe: error.message });
    }
  }

  // GET /api/users/:id - Busca 1 usuário por id
  public static async show(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id) || id <= 0) {
        return res
          .status(400)
          .json({ erro: 'O ID informado deve ser um numero valido.' });
      }

      const user = await User.findByPk(id, {
        attributes: ['id', 'nome', 'email', 'createdAt'],
      });

      if (!user) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      return res.status(200).json(user);
    } catch (error: any) {
      return res
        .status(500)
        .json({ erro: 'Erro ao buscar usuário', detalhe: error.message });
    }
  }

  // POST /api/users - Cadastrar um novo usuário
  public static async create(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, email, password } = req.body;

      if (nome === undefined || nome === null) {
        return res.status(400).json({
          erro: 'O campo nome é obrigatório.',
        });
      }

      if (typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({ erro: 'O campo nome é obrigatório.' });
      }

      // email (regex -> código que testa várias coisas ao mesmo tempo)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({ erro: 'Informe um e-mail valido.' });
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        return res
          .status(400)
          .json({ erro: 'A senha deve conter no minimo 6 caracteres.' });
      }

      const userExistente = await User.findOne({
        where: { email: email.trim() },
      });
      if (userExistente) {
        return res
          .status(400)
          .json({ erro: 'Já existe um usuário cadastrado com este e-mail.' });
      }

      const senha_hash = await bcrypt.hash(password, 10);

      const novoUser = await User.create({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha_hash,
      });

      return res.status(201).json({
        // basta apenas criar o status created
        id: novoUser.id,
        nome: novoUser.nome,
        email: novoUser.email,
        createdAt: novoUser.createdAt,
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ erro: 'Erro ao cadastrar usuário', detalhe: error.message });
    }
  }

  // PUT /api/users/:id - Atualiza um usuário existente
  public static async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nome, email } = req.body;

      if (
        isNaN(Number(id)) ||
        Number(id) <= 0 ||
        !Number.isInteger(Number(id))
      ) {
        return res
          .status(400)
          .json({ erro: 'O ID informado deve ser um numero valido.' });
      }

      const user = await User.findByPk(Number(id));

      if (!user) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      if (
        nome !== undefined &&
        (typeof nome !== 'string' || nome.trim() === '')
      ) {
        return res.status(404).json({
          erro: 'O campo nome deve ser um texto valido.',
        });
      }

      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
          return res.status(400).json({ erro: 'Informe um e-mail valido.' });
        }

        const emailNormalizado = email.trim().toLowerCase();
        const userExistente = await User.findOne({
          where: { email: emailNormalizado },
        });

        if (userExistente && userExistente.id !== user.id) {
          return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
        }

        user.email = emailNormalizado;
      }

      if (nome) user.nome = nome;

      await user.save();

      return res.status(200).json({
        id: user.id,
        nome: user.nome,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ erro: 'Erro ao atualizar usuário', detalhe: error.message });
    }
  }

  // DELETE /api/users/:id - DELETA UM USUÁRIO
  public static async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (
        isNaN(Number(id)) ||
        Number(id) <= 0 ||
        !Number.isInteger(Number(id))
      ) {
        return res
          .status(400)
          .json({ erro: 'O ID informado deve ser um numero valido.' });
      }

      const user = await User.findByPk(Number(id));

      if (!user) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      await user.destroy();

      // 204 No content
      return res.status(204).send();
    } catch (error: any) {
      return res
        .status(500)
        .json({ erro: 'Erro ao excluir usuário', detalhe: error.message });
    }
  }
}
