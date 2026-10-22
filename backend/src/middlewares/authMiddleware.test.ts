import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './authMiddleware';

// Mock do módulo jsonwebtoken para controlar o comportamento em cada teste
vi.mock('jsonwebtoken');

// Helper para criar mocks de req, res e next de forma reutilizável
function criarMocks() {
  const req = {
    headers: {} as Record<string, string>,
  } as unknown as Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const next = vi.fn() as NextFunction;

  return { req, res, next };
}

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 401 quando o header Authorization estiver ausente', () => {
    // Arrange
    const { req, res, next } = criarMocks();
    // Nenhum header de authorization definido

    // Act
    authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token não fornecido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o header Authorization não começar com "Bearer "', () => {
    // Arrange
    const { req, res, next } = criarMocks();
    (req as any).headers.authorization = 'Basic algum-token-qualquer';

    // Act
    authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token não fornecido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o token JWT for inválido ou expirado', () => {
    // Arrange
    const { req, res, next } = criarMocks();
    (req as any).headers.authorization = 'Bearer token-invalido-qualquer';

    // Simula jwt.verify lançando um erro (token inválido/expirado)
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('invalid token');
    });

    // Act
    authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token inválido ou expirado.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() e anexar o usuário decodificado em req.user quando o token for válido', () => {
    // Arrange
    const { req, res, next } = criarMocks();
    (req as any).headers.authorization = 'Bearer token-valido';

    const payloadDecodificado = { id: 1, email: 'usuario@fatec.sp.gov.br', nome: 'Usuário Teste' };

    // Simula jwt.verify retornando com sucesso o payload
    vi.mocked(jwt.verify).mockReturnValue(payloadDecodificado as any);

    // Act
    authMiddleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect((req as any).user).toEqual(payloadDecodificado);
    expect(res.status).not.toHaveBeenCalled();
  });
});
