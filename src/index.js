const WEBHOOK = '/endpoint';

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const { BOT_TOKEN: token, WEBHOOK_SECRET: secret, ENVIRONMENT, USER_LIST } = env;
  const isProduction = ENVIRONMENT === 'production';
  let userList = []
  if (USER_LIST) {
    // USER_LIST: id(string) or username(string) split by comma with optional whitespace
    // userList: array of string
    userList = USER_LIST.split(/,\s*/).map(item => item.trim());
  }
  else {
    console.log('USER_LIST is not set')
  }
  
  switch (url.pathname) {
    case WEBHOOK:
      return handleWebhook(request, secret, token, userList);
    case '/setWebhook':
      if (isProduction)
        return new Response('Operation not allowed in production', { status: 403 });
      return setWebhook(url, WEBHOOK, secret, token);
    case '/removeWebhook':
      if (isProduction)
        return new Response('Operation not allowed in production', { status: 403 });
      return removeWebhook(token);
    default:
      return new Response('Restricted', { status: 403 });
  }
}

// https://core.telegram.org/bots/api#getting-updates
async function handleWebhook(request, secret, token, userList) {
  // https://core.telegram.org/bots/api#setwebhook
  // Set secret_tokenwith setWebhook() first, then use handleWebhook()
  if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== secret) {
    return new Response('Invalid secret_token', { status: 403 });
  }

  const update = await request.json();
  await handleUpdate(update, token, userList);

  return new Response('Ok');
}

// https://core.telegram.org/bots/api#update
async function handleUpdate(update, token, userList) {

  // userID or username in userList, or userList is empty
  const isUserAuthorized = userList.includes(update.message.from.id.toString()) || userList.includes(update.message.from.username) || !userList.length;

  if (!isUserAuthorized) {
    console.log(`Unauthorized userid: ${update.message.from.id} , username: ${update.message.from.username}`);
    return;
  }

  if (update.message) {
    await handleMessage(update.message, token);
  }
}

// https://core.telegram.org/bots/api#update
// https://core.telegram.org/bots/api#message
async function handleMessage(message, token) {
  await sendMessage(message.chat.id, `Echo: ${message.text}`, token);
}

async function sendMessage(chatId, text, token) {
  const response = await fetch(buildApiUrl(token, 'sendMessage', { chat_id: chatId, text }));
  return response.json();
}

// https://core.telegram.org/bots/api#setwebhook
async function setWebhook(url, suffix, secret, token) {
  // Example: "https://anki.exampleaccount.workers.dev/endpoint"
  const webhookUrl = `${url.protocol}//${url.hostname}${suffix}`;

  const response = await fetch(buildApiUrl(token, 'setWebhook', { url: webhookUrl, secret_token: secret }));
  const result = await response.json();

  return new Response(result.ok ? 'Ok' : JSON.stringify(result, null, 2));
}

// https://core.telegram.org/bots/api#setwebhook
// setWebhook() but wihout url specified
async function removeWebhook(token) {
  const response = await fetch(buildApiUrl(token, 'setWebhook'));
  const result = await response.json();

  return new Response(result.ok ? 'Ok' : JSON.stringify(result, null, 2));
}

function buildApiUrl(token, methodName, params = {}) {
  const query = new URLSearchParams(params).toString();
  return `https://api.telegram.org/bot${token}/${methodName}${query ? `?${query}` : ''}`;
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};
