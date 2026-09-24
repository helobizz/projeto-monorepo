import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocumment from './docs/swagger.json';
import cors from 'cors'; // tenta acessar um site através de outro domínio
import { appRoutes } from './routes';

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rota de Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    mensagem: 'Servidor Backend rodando com sucesso.',
    timestamp: new Date().toISOString(),
  });
});

// Rota da documentação interativa
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocumment));

// Registra todas as rotas da aplicacao sob o prefixo /api
app.use('/api', appRoutes);

export { app };

// agora não será mais criada uma instância para cada teste de integração (está migrando do server)
// no server, ele tentarai fazer várias conexões com o banco e falharia (cada teste tentaria fazer uma integração)
