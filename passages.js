(function (root) {
  'use strict';
  // Narrator quotes can be written words or thoughts. Only explicitly attributed
  // quotes in those scenes become speech; nested quotes stay with their speaker.
  function split({ speaker = 'あなた', text = '', quoteSpeakers } = {}) {
    const passages = [];
    const defaultVoice = speaker === 'あなた' ? null : speaker;
    function append(value, voice) {
      if (!value) return;
      const kind = voice ? 'speech' : 'narration';
      const previous = passages.at(-1);
      if (kind === 'narration' && previous?.kind === kind) previous.text += value;
      else passages.push({ kind, speaker: voice || '情景・心の声', text: value });
    }
    let start = 0, quoteStart = -1, depth = 0, quoteIndex = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '「') {
        if (depth === 0) quoteStart = i;
        depth++;
      } else if (text[i] === '」' && depth > 0) {
        depth--;
        if (depth === 0) {
          const voice = quoteSpeakers && Object.hasOwn(quoteSpeakers, quoteIndex)
            ? quoteSpeakers[quoteIndex] : defaultVoice;
          append(text.slice(start, quoteStart), null);
          append(text.slice(quoteStart, i + 1), voice);
          quoteIndex++;
          start = i + 1;
        }
      }
    }
    append(text.slice(start), null);
    return passages;
  }
  const api = { split };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BunriPassages = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
