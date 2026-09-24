// Contrato do usuário retornado pelo banco de dados
export interface User {
    id: number;
    nome: string;
    email: string;
    createdAt: string;
}

// Dados necessários para cadastrar um novo usuário
export interface CreateUserDTO {
    nome: string;
    email: string;
    senha_hash: string;
}