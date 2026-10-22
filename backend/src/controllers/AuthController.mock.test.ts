import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dos módulos externos para isolar o controller
vi.mock('../models/User', () => ({
  User: {
    findOne: vi.fn(),
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

describe('AuthController - POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 400 quando email estiver ausente', async () => {
    // Arrange: payload sem email
    const payload = { password: 'senha123' };

    // Act
    const response = await request(app).post('/api/auth/login').send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('erro', 'Email e senha são obrigatórios.');
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it('deve retornar 400 quando senha estiver ausente', async () => {
    // Arrange: payload sem password
    const payload = { email: 'usuario@fatec.sp.gov.br' };

    // Act
    const response = await request(app).post('/api/auth/login').send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('erro', 'Email e senha são obrigatórios.');
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o usuário não for encontrado no banco', async () => {
    // Arrange: findOne retorna null (usuário não existe)
    vi.mocked(User.findOne).mockResolvedValue(null);

    // Act
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inexistente@fatec.sp.gov.br', password: 'qualquerSenha' });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('erro', 'Credenciais inválidas.');
  });

  it('deve retornar 401 quando o usuário existe mas senha_hash está ausente', async () => {
    // Arrange: findOne retorna usuário sem senha_hash
    vi.mocked(User.findOne).mockResolvedValue({ id: 1, email: 'usuario@fatec.sp.gov.br', senha_hash: null } as any);

    // Act
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'usuario@fatec.sp.gov.br', password: 'qualquerSenha' });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('erro', 'Credenciais inválidas.');
  });

  it('deve retornar 401 quando a senha informada for incorreta', async () => {
    // Arrange: usuário existe mas bcrypt.compare retorna false
    const usuarioFalso = { id: 1, email: 'usuario@fatec.sp.gov.br', nome: 'Usuário', senha_hash: '$2a$10$hash' };
    vi.mocked(User.findOne).mockResolvedValue(usuarioFalso as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    // Act
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'usuario@fatec.sp.gov.br', password: 'senhaErrada' });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('erro', 'Credenciais inválidas.');
  });

  it('deve retornar 200 e o token JWT quando as credenciais forem válidas', async () => {
    // Arrange
    const usuarioFalso = { id: 1, email: 'usuario@fatec.sp.gov.br', nome: 'Usuário Teste', senha_hash: '$2a$10$hash' };
    vi.mocked(User.findOne).mockResolvedValue(usuarioFalso as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue('token.jwt.mockado' as any);

    // Act
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'usuario@fatec.sp.gov.br', password: 'senhaCorreta' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('messagem', 'Login realizado com sucesso!');
    expect(response.body).toHaveProperty('token', 'token.jwt.mockado');
  });

  it('deve retornar 500 quando ocorrer um erro inesperado no banco', async () => {
    // Arrange: findOne lança uma exceção
    vi.mocked(User.findOne).mockRejectedValue(new Error('Falha na conexão com o banco'));

    // Act
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'usuario@fatec.sp.gov.br', password: 'qualquerSenha' });

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('erro');
  });
});
