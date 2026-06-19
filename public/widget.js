(function () {
  const root = document.getElementById('chat-widget');

  root.innerHTML = `
    <button id="chat-toggle" aria-label="チャットを開く">💬</button>
    <div id="chat-panel" class="hidden">
      <div id="chat-header">空き家・解体・不動産相談</div>
      <div id="chat-messages"></div>
      <div id="chat-input-area">
        <input id="chat-input" type="text" placeholder="ご相談内容を入力してください" />
        <button id="chat-send">送信</button>
      </div>
    </div>
  `;

  const toggleBtn = document.getElementById('chat-toggle');
  const panel = document.getElementById('chat-panel');
  const messagesEl = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  const history = [];
  let greeted = false;

  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden') && !greeted) {
      greeted = true;
      addMessage(
        'bot',
        'こんにちは。空き家・解体・不動産売却・建替えに関するご相談を承っています。どのようなことでお悩みですか？'
      );
    }
  });

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
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
        addMessage('error', data.error || 'エラーが発生しました。');
        return;
      }

      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: data.reply });
      addMessage('bot', data.reply);
    } catch (err) {
      addMessage('error', 'サーバーに接続できませんでした。');
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
