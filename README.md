# ServerlessAnkiBot

Telegram bot running on Cloudflare Workers, generates and uploads Anki flashcard.

This repo is archived because I can't find a way to add flashcard to Ankiweb:
- Ankiweb doesn't provide API.
- Failed to ensure integrity of POST request sent to ankiuser.net with [422 Unprocessable Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422).
- Browser Rendering on Cloudflare Workers requires a paid plan.
- Deploying [Selenium](https://www.selenium.dev/) on [AWS Lambda](https://aws.amazon.com/lambda/) proves to be trickier than Cloudflare Workers.
- Failed to properly use Cookie for ankiweb.net in [apify/puppeteer-scraper](https://console.apify.com/).

## Progress

- [x] ✅ Create basic Telegram bot
- [ ] ⏳ Query dictionary, using [Free Dictionary API](https://dictionaryapi.dev/)
- [ ] ⏳ Generate Anki flashcard
- [ ] ⛔ Add flashcard to [AnkiWeb](https://ankiuser.net/add)

## Resources

- Telegram bot [Documentation](https://core.telegram.org/bots/api)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
- Bot code inspired by [cvzi/telegram-bot-cloudflare](https://github.com/cvzi/telegram-bot-cloudflare)
- [Dictionary](https://dictionaryapi.dev/) by [meetDeveloper/freeDictionaryAPI](https://github.com/meetDeveloper/freeDictionaryAPI)
- Anki sync server by [AnkiWeb](https://ankiweb.net/)
