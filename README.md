# ServerlessAnkiBot

Telegram bot running on Cloudflare Workers, generates and uploads Anki flashcard.

## Progress

- [x] ✅ Create Telegram bot
- [ ] ⏳ Query dictionary, using [Free Dictionary API](https://dictionaryapi.dev/)
- [ ] ⏳ Generate Anki flashcard
- [x] ✅ Add flashcard to [AnkiWeb](https://ankiuser.net/add)

## Resources

- Telegram bot [Documentation](https://core.telegram.org/bots/api)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
- Using [Puppeteer](https://pptr.dev/) provided by [Apify](https://docs.apify.com/academy/apify-scrapers/puppeteer-scraper) to add flashcard
- Bot code inspired by [cvzi/telegram-bot-cloudflare](https://github.com/cvzi/telegram-bot-cloudflare)
- [Dictionary](https://dictionaryapi.dev/) by [meetDeveloper/freeDictionaryAPI](https://github.com/meetDeveloper/freeDictionaryAPI)
- Anki sync server by [AnkiWeb](https://ankiweb.net/)
