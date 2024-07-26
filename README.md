# ServerlessAnkiBot

Telegram bot running on Cloudflare Workers, generates and uploads Anki flashcard.

## Progress

- ✅ Telegram bot
	- ✅ Bot receives and sends messages
	- ✅ Bot receives messages and send them to Apify-Puppeteer
  	- ✅ Check if card is already added using Workers KV
  	- ✅ Delete flashcard from KV
- ✅ Dictionary
	- ✅ Use Free Dictionary API
	- ⏳ Use Merriam-Webster's Learner's Dictionary
- ✅ Generate Anki flashcard
	- ✅ Flashcard for AnkiWeb
	- ✅ Dictionary query for Telegram
- ✅ Upload Anki flashcard
  	- ✅ Use Apify-Puppeteer to simulate adding cards on [Add - AnkiWeb](https://ankiuser.net/add)

## Resources

- Telegram bot [Documentation](https://core.telegram.org/bots/api)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
- Using [Cloudflare Workers KV](https://developers.cloudflare.com/kv/) to check flashcard existence
- Using [Puppeteer](https://pptr.dev/) provided by [Apify](https://docs.apify.com/academy/apify-scrapers/puppeteer-scraper) to add flashcard
- [Free Dictionary API](https://dictionaryapi.dev/) by [meetDeveloper/freeDictionaryAPI](https://github.com/meetDeveloper/freeDictionaryAPI)
- [Merriam-Webster's Learner's Dictionary API](https://dictionaryapi.com/products/api-learners-dictionary)
- Anki sync server by [AnkiWeb](https://ankiweb.net/)
- Bot code inspired by [cvzi/telegram-bot-cloudflare](https://github.com/cvzi/telegram-bot-cloudflare)
- Project inspired by [damaru2/ankigenbot](https://github.com/damaru2/ankigenbot)
