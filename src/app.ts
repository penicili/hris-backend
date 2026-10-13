import express, {
  type Express,
  type Request,
  type Response
} from 'express';
import routes from './modules/index.js';

export const app: Express = express();

app.use(express.json());
app.use('/api', routes);

app.get('/', (_req: Request, res: Response) => {
  res.json('OK');
});