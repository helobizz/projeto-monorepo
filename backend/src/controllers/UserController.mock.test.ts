import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

// Intercepta o módulo do Model User para todos os testes deste arquivo
vi.mock('../models/User', () => ({
  User: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

describe('UserController - Casos faltantes de cobertura', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // GET /api/users/:id - show
  // ──────────────────────────────────────────────
  describe('GET /api/users/:id (show)', () => {
    it('deve retornar 200 e o usuário quando o ID for válido e existir', async () => {
      // Arrange
      const usuarioFalso = {
        id: 5,
        nome: 'Ana Paula',
        email: 'ana@fatec.sp.gov.br',
        createdAt: '2026-01-01',
      };
      vi.mocked(User.findByPk).mockResolvedValue(usuarioFalso as any);

      // Act
      const response = await request(app).get('/api/users/5');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(usuarioFalso);
      expect(User.findByPk).toHaveBeenCalledWith(5, {
        attributes: ['id', 'nome', 'email', 'createdAt'],
      });
    });

    it('deve retornar 500 quando ocorrer um erro inesperado ao buscar por ID', async () => {
      // Arrange
      vi.mocked(User.findByPk).mockRejectedValue(new Error('Erro de banco'));

      // Act
      const response = await request(app).get('/api/users/1');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('erro', 'Erro ao buscar usuários.');
    });
  });

  // ──────────────────────────────────────────────
  // GET /api/users - index
  // ──────────────────────────────────────────────
  describe('GET /api/users (index)', () => {
    it('deve retornar 500 quando findAll lançar exceção', async () => {
      // Arrange
      vi.mocked(User.findAll).mockRejectedValue(new Error('Falha na query'));

      // Act
      const response = await request(app).get('/api/users');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('erro', 'Erro ao listar usuários.');
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/users - create (branches faltantes)
  // ──────────────────────────────────────────────
  describe('POST /api/users (create)', () => {
    it('deve retornar 400 quando o campo email estiver ausente', async () => {
      // Arrange
      const payload = { nome: 'Carlos Silva', password: 'senha123' };

      // Act
      const response = await request(app).post('/api/users').send(payload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('erro', 'Os campos nome, email e senha são obrigatórios.');
    });

    it('deve retornar 400 quando o campo password estiver ausente', async () => {
      // Arrange
      const payload = { nome: 'Carlos Silva', email: 'carlos@fatec.sp.gov.br' };

      // Act
      const response = await request(app).post('/api/users').send(payload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('erro', 'Os campos nome, email e senha são obrigatórios.');
    });

    it('deve retornar 400 quando a senha tiver menos de 6 caracteres', async () => {
      // Arrange
      const payload = { nome: 'Carlos Silva', email: 'carlos@fatec.sp.gov.br', password: '123' };

      // Act
      const response = await request(app).post('/api/users').send(payload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('erro');
    });

    it('deve retornar 201 ao criar um usuário com sucesso via mock', async () => {
      // Arrange
      vi.mocked(User.findOne).mockResolvedValue(null); // email não existe
      vi.mocked(bcrypt.hash).mockResolvedValue('$2a$10$hashFalso' as never);
      const usuarioCriado = {
        id: 99,
        nome: 'Novo Usuario',
        email: 'novo@fatec.sp.gov.br',
        createdAt: '2026-01-01',
      };
      vi.mocked(User.create).mockResolvedValue(usuarioCriado as any);

      // Act
      const response = await request(app).post('/api/users').send({
        nome: 'Novo Usuario',
        email: 'novo@fatec.sp.gov.br',
        password: 'senha123',
      });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 99);
      expect(response.body).toHaveProperty('nome', 'Novo Usuario');
    });

    it('deve retornar 500 quando create lançar exceção inesperada', async () => {
      // Arrange
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('$2a$10$hashFalso' as never);
      vi.mocked(User.create).mockRejectedValue(new Error('Erro de constraint'));

      // Act
      const response = await request(app).post('/api/users').send({
        nome: 'Usuario Teste',
        email: 'teste@fatec.sp.gov.br',
        password: 'senha123',
      });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('erro', 'Erro ao cadastrar usuários.');
    });
  });

  // ──────────────────────────────────────────────
  // PUT /api/users/:id - update (0% cobertura nos branches)
  // ──────────────────────────────────────────────
  describe('PUT /api/users/:id (update)', () => {
    it('deve retornar 404 quando o usuário não existir', async () => {
      // Arrange
      vi.mocked(User.findByPk).mockResolvedValue(null);

      // Act
      const response = await request(app).put('/api/users/999').send({ nome: 'Novo Nome' });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('erro', 'Usuário não encontrado.');
    });

    it('deve retornar 200 e atualizar o nome quando o usuário existir', async () => {
      // Arrange: Simula um usuário existente com método save()
      const usuarioFalso = {
        id: 1,
        nome: 'Nome Antigo',
        email: 'usuario@fatec.sp.gov.br',
        createdAt: '2026-01-01',
        save: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(User.findByPk).mockResolvedValue(usuarioFalso as any);

      // Act
      const response = await request(app)
        .put('/api/users/1')
        .send({ nome: 'Nome Atualizado' });

      // Assert
      expect(response.status).toBe(200);
      expect(usuarioFalso.save).toHaveBeenCalledTimes(1);
      expect(response.body).toHaveProperty('nome', 'Nome Atualizado');
    });

    it('deve retornar 200 e atualizar email quando informado', async () => {
      // Arrange
      const usuarioFalso = {
        id: 2,
        nome: 'Usuário Existente',
        email: 'antigo@fatec.sp.gov.br',
        createdAt: '2026-01-01',
        save: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(User.findByPk).mockResolvedValue(usuarioFalso as any);

      // Act
      const response = await request(app)
        .put('/api/users/2')
        .send({ email: 'novo@fatec.sp.gov.br' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'novo@fatec.sp.gov.br');
    });

    it('deve retornar 500 quando save() lançar exceção', async () => {
      // Arrange
      const usuarioFalso = {
        id: 3,
        nome: 'Usuário Teste',
        email: 'teste@fatec.sp.gov.br',
        createdAt: '2026-01-01',
        save: vi.fn().mockRejectedValue(new Error('Falha ao salvar')),
      };
      vi.mocked(User.findByPk).mockResolvedValue(usuarioFalso as any);

      // Act
      const response = await request(app)
        .put('/api/users/3')
        .send({ nome: 'Novo Nome' });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('erro', 'Erro ao atualizar usuários.');
    });
  });

  // ──────────────────────────────────────────────
  // DELETE /api/users/:id - delete (branch else não coberto)
  // ──────────────────────────────────────────────
  describe('DELETE /api/users/:id (delete)', () => {
    it('deve retornar 204 ao deletar com sucesso', async () => {
      // Arrange: usuário encontrado com método destroy()
      const usuarioFalso = {
        id: 1,
        nome: 'Para Deletar',
        email: 'deletar@fatec.sp.gov.br',
        destroy: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(User.findByPk).mockResolvedValue(usuarioFalso as any);

      // Act
      const response = await request(app).delete('/api/users/1');

      // Assert
      expect(response.status).toBe(204);
      expect(usuarioFalso.destroy).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 500 quando destroy() lançar exceção', async () => {
      // Arrange
      const usuarioFalso = {
        id: 4,
        nome: 'Usuário com Erro',
        email: 'erro@fatec.sp.gov.br',
        destroy: vi.fn().mockRejectedValue(new Error('Erro ao deletar')),
      };
      vi.mocked(User.findByPk).mockResolvedValue(usuarioFalso as any);

      // Act
      const response = await request(app).delete('/api/users/4');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('erro', 'Erro ao excluir usuário.');
    });
  });
});
