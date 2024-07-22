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
  let isUserAuthorized ;
  if (!env.USER_LIST.length) {
    console.warn('USER_LIST not set');
    isUserAuthorized = true;
  } else {
    isUserAuthorized = env.USER_LIST.includes(update.message.from.id.toString()) || env.USER_LIST.includes(update.message.from.username)
  }

  if (!isUserAuthorized) {
    console.log(`Unauthorized userid: ${update.message.from.id}${update.message.from.username ? `, username: ${update.message.from.username}` : ''}`);
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

    // Receives '/command commandText'
    if (text.startsWith('/')) {
      const command = text.split(' ')[0];
      const commandText = text.slice(command.length).trim();

      // Avoid formatInputWord('') when text = '/command [nothing]'
      if (!commandText.length) {
        console.error(`${text}\nError: Command text is empty`);
        await sendMessage(chatID, `${text}\nError: Command text is empty`, env.BOT_TOKEN);
        return;
      }
      let word;
      try {
        word = formatInputWord(commandText);
      } catch(error) {
        console.error(error);
        await sendMessage(chatID, `${text}\n${error}`, env.BOT_TOKEN);
        return;
      }
      
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
          await sendMessage(chatID, 'Invalid command', env.BOT_TOKEN);
          return;
      }
    } else {
      const word = formatInputWord(text);
      await respondAnki(chatID, word, env);
      return;
    }
}

// Send dictionary definition to Telegram and add flashcard to deck.
async function respondAnki(chatID, word, env) {
  const deck = 'deck';
  const apifyURL = 'https://api.apify.com/v2/acts/apify~puppeteer-scraper/runs';

  try {
    const data = await fetchDicAPI(word);

    // If already in deck, skip adding
    const isWordExist = await env.KV.get(word);
    if (!isWordExist) {
      await env.KV.put(word, 1);

      const tgQuery = buildTgDicAPI(data);
      await sendMessage(chatID, `${tgQuery}`, env.BOT_TOKEN);
      const ankiQuery = buildAnkiDicAPI(data);
      await sendAnki(apifyURL, { memory: 512, timeout: 60 }, env.APIFY_TOKEN, env.ANKI_COOKIE, deck, word, ankiQuery);
    } else {
      const tgQuery = buildTgDicAPI(data) + `Warning: "${word}" already in "${deck}".`;
      await sendMessage(chatID, `${tgQuery}`, env.BOT_TOKEN);
    }
  } catch (error) {
    console.error(error);
    await sendMessage(chatID, `${word}\n${error}`, env.BOT_TOKEN);
  }
}

// Send dictionary definition to Telegram, without adding flashcard to deck.
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

// Delete flashcard from KV. You need to manually delete 'word' flashcard from deck before sending '/delete word' to bot.
async function respondDelete(chatID, word, env) {
  env.KV.delete(word);
  await sendMessage(chatID, `Deleting ${word} from KV.`, env.BOT_TOKEN);
}

async function sendMessage(chatID, text, token) {
  const response = await fetch(buildApiUrl(token, 'sendMessage', { chat_id: chatID, text }));
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

function formatInputWord(input) {
  try {
    // Replace all non-alphabetic characters with spaces
    input = input.replace(/[^a-zA-Z]+/g, ' ');

    // Remove extra spaces at the beginning and end, and reduce multiple spaces to a single space
    input = input.trim().replace(/\s+/g, ' ');

    // First letter toUpperCase(), others toLowerCase()
    const word = input[0].toUpperCase() + input.slice(1).toLowerCase();

    return word;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to format input word');
  }
}

export { handleWebhook, setWebhook, removeWebhook };
