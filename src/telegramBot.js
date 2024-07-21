import { sendAnki } from "./puppeteer";
import { fetchData as fetchDicAPI, buildTg as buildTgDicAPI, buildAnki as buildAnkiDicAPI } from "./freeDictionaryAPI";

// https://core.telegram.org/bots/api#getting-updates
async function handleWebhook(request, env) {
  // https://core.telegram.org/bots/api#setwebhook
  // Set secret_tokenwith setWebhook() first, then use handleWebhook()
  if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) {
    return new Response('Invalid secret_token', { status: 403 });
  }

  const update = await request.json();
  await handleUpdate(update, env);

  return new Response('Ok');
}

// https://core.telegram.org/bots/api#update
async function handleUpdate(update, env) {
  // userID or username in env.USER_LIST, or env.USER_LIST is empty
  const isUserAuthorized = env.USER_LIST.includes(update.message.from.id.toString()) || env.USER_LIST.includes(update.message.from.username) || !env.USER_LIST.length;

  if (!isUserAuthorized) {
    console.log(`Unauthorized userid: ${update.message.from.id} , username: ${update.message.from.username}`);
    return;
  }

  if (update.message) {
    await handleMessage(update.message, env);
  }
}

// https://core.telegram.org/bots/api#update
// https://core.telegram.org/bots/api#message
async function handleMessage(message, env) {
  const chatID = message.chat.id;
  const text = message.text;

  if (text.startsWith('/')) {
    const command = text.split(' ')[0];
    const commandText = text.slice(command.length).trim();
    // First letter toUpperCase(), others toLowerCase()
    const word = commandText[0].toUpperCase() + commandText.slice(1).toLowerCase();

    switch (command) {
      case '/delete':
        await respondDelete(chatID, word, env);
        return;
      case '/query':
        await respondQuery(chatID, word, env);
        return;
      case '/add':
        await respondAnki(chatID, word, env);
        return;
      default:
        await sendMessage(message.chat.id, 'Invalid command', env.BOT_TOKEN);
        return;
    }
  } else {
    const word = text[0].toUpperCase() + text.slice(1).toLowerCase();
    await respondAnki(chatID, word, env);
    return;
  }
}

async function respondAnki(chatID, word, env) {
  const deck = 'deck';

  try {
    const data = await fetchDicAPI(word);

    // If already in deck, skip adding
    const isWordExist = await env.KV.get(word);
    if (!isWordExist) {
      await env.KV.put(word, 1);

      const tgQuery = buildTgDicAPI(data);
      await sendMessage(chatID, `${tgQuery}`, env.BOT_TOKEN);
      const ankiQuery = buildAnkiDicAPI(data);
      await sendAnki(env.APIFY_URL, { memory: 512, timeout: 60 }, env.APIFY_TOKEN, env.ANKI_COOKIE, deck, word, ankiQuery);
    } else {
      const tgQuery = buildTgDicAPI(data) + `Warning: "${word}" already in "${deck}".`;
      await sendMessage(chatID, `${tgQuery}`, env.BOT_TOKEN);
    }
  } catch (error) {
    console.error(error);
    await sendMessage(chatID, `${word}\n${error}`, env.BOT_TOKEN);
  }
}

async function respondQuery(chatID, word, env) {
  try {
    const data = await fetchDicAPI(word);
    const tgQuery = buildTgDicAPI(data);
    await sendMessage(chatID, `${tgQuery}`, env.BOT_TOKEN);
  } catch (error) {
    console.error(error);
    await sendMessage(chatID, `${word}\n${error}`, env.BOT_TOKEN);
  }
}

async function respondDelete(chatID, word, env) {
  env.KV.delete(word);
  await sendMessage(chatID, `Deleting ${word} from KV.`, env.BOT_TOKEN);
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

export { handleWebhook, setWebhook, removeWebhook };
