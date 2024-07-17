import { handleWebhook, setWebhook, removeWebhook } from "./telegramBot";

const WEBHOOK = '/endpoint';

async function handleRequest(request, env) {
  const url = new URL(request.url);
  
  const { ENVIRONMENT, USER_LIST } = env;

  const isProduction = ENVIRONMENT === 'production';

  // USER_LIST: id(string) or username(string) split by comma with optional whitespace
  // userList: array of string
  let userList = []
  if (USER_LIST) {
    userList = USER_LIST.split(/,\s*/).map(item => item.trim());
  }
  else {
    console.log('USER_LIST is not set')
  }
  
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
