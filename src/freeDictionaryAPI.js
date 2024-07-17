async function getAnkiDictionaryAPI(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get definition');
    }

    const data = await response.json();

    const ankiData = buildAnkiData(data);

    console.log(ankiData);

    return ankiData;
  } catch (error) {
    console.error(error);
    return error;
  }
}

function buildAnkiData(data) {
  const firstWord = data[0].word;

  return data.map((entry) => {
    let result = '';

    // Show word only if it's different from the first word
    if (entry.word !== firstWord) {
      result += `${entry.word} `;
    }

    result += `${entry.phonetic}\n`;

    entry.meanings.forEach(meaning => {
      result += `[${meaning.partOfSpeech}]\n`;

      meaning.definitions.forEach((definition, defIndex) => {
        if (meaning.definitions.length > 1) {
          result += `${defIndex + 1}. ${definition.definition}`;
        } else {
          result += `${definition.definition}`;
        }

        if (definition.example) {
          result += `\n> ${definition.example}`;
        }

        result += '\n\n';
      });
    });

    result += '--------------------\n';

    return result;
  }).join('\n');
}

export { getAnkiDictionaryAPI };
    