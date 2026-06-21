(function () {
  const greetingEl = document.getElementById('greeting');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const answersBody = document.getElementById('answers-body');
  const answersEmpty = document.getElementById('answers-empty');

  const history = [];

  greetingEl.textContent =
    'こんにちは。空き家・解体・不動産売却・建替えに関するご相談を承っています。どのようなことでお悩みですか？';

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Claudeの回答に含まれるMarkdown記法（見出し・太字・箇条書き等）を
  // 装飾記号のまま表示せず、整形済みの文章として見せるための簡易レンダラー。
  function markdownToHtml(markdown) {
    const escaped = escapeHtml(markdown).replace(/\r\n/g, '\n');
    const lines = escaped.split('\n');

    const htmlLines = [];
    let listType = null; // 'ul' | 'ol' | null
    let paragraphBuffer = [];

    function flushParagraph() {
      if (paragraphBuffer.length) {
        htmlLines.push('<p>' + paragraphBuffer.join('<br>') + '</p>');
        paragraphBuffer = [];
      }
    }

    function closeList() {
      if (listType) {
        htmlLines.push(`</${listType}>`);
        listType = null;
      }
    }

    function inline(text) {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    }

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        flushParagraph();
        closeList();
        continue;
      }

      if (/^(---|\*\*\*|___)$/.test(line)) {
        flushParagraph();
        closeList();
        htmlLines.push('<hr>');
        continue;
      }

      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        flushParagraph();
        closeList();
        const level = headingMatch[1].length;
        htmlLines.push(`<h${level}>${inline(headingMatch[2])}</h${level}>`);
        continue;
      }

      const ulMatch = line.match(/^[-*]\s+(.*)$/);
      const olMatch = line.match(/^\d+\.\s+(.*)$/);

      if (ulMatch) {
        flushParagraph();
        if (listType !== 'ul') {
          closeList();
          htmlLines.push('<ul>');
          listType = 'ul';
        }
        htmlLines.push(`<li>${inline(ulMatch[1])}</li>`);
        continue;
      }

      if (olMatch) {
        flushParagraph();
        if (listType !== 'ol') {
          closeList();
          htmlLines.push('<ol>');
          listType = 'ol';
        }
        htmlLines.push(`<li>${inline(olMatch[1])}</li>`);
        continue;
      }

      closeList();
      paragraphBuffer.push(inline(line));
    }

    flushParagraph();
    closeList();

    return htmlLines.join('');
  }

  function addAnswerRow(question, answer, isError) {
    answersEmpty.classList.add('hidden');
    const row = document.createElement('tr');
    if (isError) row.className = 'error-row';

    const qCell = document.createElement('td');
    qCell.textContent = question;

    const aCell = document.createElement('td');
    if (isError) {
      aCell.textContent = answer;
    } else {
      aCell.innerHTML = markdownToHtml(answer);
    }

    row.appendChild(qCell);
    row.appendChild(aCell);
    answersBody.appendChild(row);
    row.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    sendBtn.disabled = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();

      if (!res.ok) {
        addAnswerRow(text, data.error || 'エラーが発生しました。', true);
        return;
      }

      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: data.reply });
      addAnswerRow(text, data.reply, false);
    } catch (err) {
      addAnswerRow(text, 'サーバーに接続できませんでした。', true);
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
