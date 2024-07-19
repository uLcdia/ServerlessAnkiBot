// Send request to apify/puppeteer-scraper, which will add a card to AnkiWeb
async function sendAnki(apifyURL, apifyURLParams, apifyToken, ankiCookie, deckName, front, back) {
  // Uses apify/puppeteer-scraper
  // https://apify.com/apify/puppeteer-scraper
  // https://docs.apify.com/api/v2#tag/ActorsRun-collection/operation/act_runs_post
  const pageFunction = `
  async function pageFunction(context) {
    const { page, request, log } = context;
    
    log.info('0: Waiting for the form to load');
    await page.waitForSelector('form button');

    log.info('1: Selecting card type: Basic');
    const cardTypeSelector = 'div.mt-2.row.form-group:nth-of-type(1) .col-10 .svelte-select input';
    await page.waitForSelector(cardTypeSelector);
    await page.click(cardTypeSelector);
    await page.type(cardTypeSelector, 'Basic\\n');

    log.info(\`2: Selecting deck: ${deckName}\`);
    const deckSelector = 'div.mt-2.mb-4.row.form-group .col-10 .svelte-select input';
    await page.waitForSelector(deckSelector);
    await page.click(deckSelector);
    await page.type(deckSelector, '${deckName}\\n');

    log.info(\`3: Filling in the front field: ${front}\`);
    const front = '${front}';
    const frontSelector = 'div.mt-2.row.form-group:nth-of-type(1) > .col-10 > .field.form-control';
    await page.waitForSelector(frontSelector);
    await page.focus(frontSelector);
    await page.evaluate((frontSelector, front) => {
        const frontElement = document.querySelector(frontSelector);
        frontElement.innerText = front;
        frontElement.dispatchEvent(new Event('input', { bubbles: true }));
    }, frontSelector, front);

    log.info('4: Filling in the back field');
    const back = \`${back}\`;
    const backSelector = 'div.mt-2.row.form-group:nth-of-type(2) > .col-10 > .field.form-control';
    await page.waitForSelector(backSelector);
    await page.focus(backSelector);
    await page.evaluate((backSelector, back) => {
        const backElement = document.querySelector(backSelector);
        backElement.innerText = back;
        backElement.dispatchEvent(new Event('input', { bubbles: true }));
    }, backSelector, back);
    
    /* 
    // uncomment if you want to use tags
    log.info('4.5: Filling in tags if provided');
    const tags = 'your_tags';
    if (tags) {
        const tagsSelector = 'div.form-group.row.mt-2:nth-of-type(5) input';
        await page.waitForSelector(tagsSelector);
        await page.type(tagsSelector, tags);
    } */

    log.info('5: Enabling and clicking the Add button');
    const addButtonSelector = 'button.btn.btn-primary.btn-large.mt-2';
    await page.waitForSelector(addButtonSelector);
    await page.evaluate((addButtonSelector) => {
        const addButton = document.querySelector(addButtonSelector);
        addButton.disabled = false;
    }, addButtonSelector);
    await page.click(addButtonSelector);

    return ;
}
  `;

  const url = buildApiUrl(apifyURL, apifyURLParams);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "browserLog": false,
        "closeCookieModals": false,
        "debugLog": false,
        "downloadCss": false,
        "downloadMedia": false,
        "headless": true,
        "ignoreCorsAndCsp": false,
        "ignoreSslErrors": false,
        "initialCookies": [
            {
                "name": "ankiweb",
                "value": ankiCookie,
                "domain": "ankiuser.net",
                "path": "/"
            },
            {
                "name": "has_auth",
                "value": "1",
                "domain": "ankiuser.net",
                "path": "/"
            }
        ],
        "keepUrlFragments": false,
        "pageFunction": pageFunction,
        "proxyConfiguration": {
            "useApifyProxy": true,
            "apifyProxyGroups": []
        },
        "startUrls": [
            {
                "url": "https://ankiuser.net/add"
            }
        ],
        "useChrome": false,
        "waitUntil": [
            "networkidle2"
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send data to the API');
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

function buildApiUrl(url, params = {}) {
  const query = new URLSearchParams(params).toString();
  return `${url}${query ? `?${query}` : ''}`;
}

export { sendAnki };
  