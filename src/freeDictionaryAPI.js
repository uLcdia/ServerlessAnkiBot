async function fetchData(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get definition');
    }

    const data = await response.json();

    return data;
  } catch(error) {
    throw error;
  }
}

// Telegram's custom Markdown is too limited, using plain text instead
function buildTg(data) {
  return data.map((entry) => {
    let result = `${entry.word} ${getPhonetic(entry)}\n`;

    entry.meanings.forEach(meaning => {
      result += `${meaning.partOfSpeech}\n`;

      meaning.definitions.forEach((definition, defIndex) => {
        if (meaning.definitions.length > 1) {
          result += `    ${defIndex + 1}. ${definition.definition}`;
        } else {
          result += `    ${definition.definition}`;
        }

        result += `${definition.example ? '\n    >  ' + definition.example : ''}`

        result += '\n\n';
      });
    });

    return result;
  }).join('\n');
}

function buildAnki(data) {
  const firstWord = data[0].word;

  return data.map((entry) => {
    // Show word only if it's different from the first word
    let result = `${entry.word !== firstWord ? entry.word : ''}`;

    // Show phonetic only if it exists
    result += `${getPhonetic(entry) ? getPhonetic(entry) + '\n' : ''}`;

    entry.meanings.forEach(meaning => {
      result += `[${meaning.partOfSpeech}]\n`;

      meaning.definitions.forEach((definition, defIndex) => {
        if (meaning.definitions.length > 1) {
          result += `${defIndex + 1}. ${definition.definition}`;
        } else {
          result += `${definition.definition}`;
        }

        result += `${definition.example ? '\n> ' + definition.example : ''}`

        result += '\n\n';
      });
    });

    result += '--------------------\n';

    return result;
  }).join('\n');
}

function getPhonetic(entry) {
  // entry.phonetic may or may not exist, if not, use the first encounter of entry.phonetics.text
  if (entry.phonetic) {
    return entry.phonetic;
  } else {
    for (const phoneticEntry of entry.phonetics) {
      if (phoneticEntry.text) {
        return phoneticEntry.text;
      }
    }
  }
  // API may not provide pronunciation at all
  return '';
}

export { fetchData, buildTg, buildAnki };
    