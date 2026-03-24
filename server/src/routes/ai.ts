import type { Express, Request, Response } from 'express';
import { failure, success } from '../lib/response';
import { createAiService, type AiService } from '../lib/genai';
import { requireNonEmptyString } from '../lib/validators';

export function registerAiRoutes(app: Express, ai: AiService = createAiService()) {
  app.post('/api/ai/titles', async (req: Request, res: Response) => {
    try {
      const domain = requireNonEmptyString((req.body as { domain?: unknown })?.domain, 'domain');
      const result = await ai.generateTitles(domain);
      res.status(200).json(success(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate titles';
      res.status(400).json(failure(message));
    }
  });

  app.post('/api/ai/article', async (req: Request, res: Response) => {
    try {
      const body = req.body as { domain?: unknown; title?: unknown };
      const domain = requireNonEmptyString(body.domain, 'domain');
      const title = requireNonEmptyString(body.title, 'title');
      const result = await ai.generateArticle(title, domain);
      res.status(200).json(success({ articleData: result }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate article';
      res.status(400).json(failure(message));
    }
  });
}
