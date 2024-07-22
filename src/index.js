import { handleWebhook, setWebhook, removeWebhook } from "./telegramBot";

const WEBHOOK = '/endpoint';

async function handleRequest(request, env) {
  const url = new URL(request.url);
  
  const { ENVIRONMENT } = env;

  const isProduction = ENVIRONMENT === 'production';

  switch (url.pathname) {
    case WEBHOOK:
      return handleWebhook(request, env);
    case '/setWebhook':
      if (isProduction)
        return new Response('Operation not allowed in production', { status: 403 });
      return setWebhook(url, WEBHOOK, env.WEBHOOK_SECRET, env.BOT_TOKEN);
    case '/removeWebhook':
      if (isProduction)
        return new Response('Operation not allowed in production', { status: 403 });
      return removeWebhook(env.BOT_TOKEN);
    default:
      return new Response('Restricted', { status: 403 });
  }
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};
