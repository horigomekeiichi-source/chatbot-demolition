(function () {
  const root = document.getElementById('chat-widget');

  root.innerHTML = `
    <button id="chat-toggle" aria-label="チャットを開く">💬</button>
    <div id="chat-panel" class="hidden">
      <div id="chat-header">
        <span id="chat-title">空き家・解体・不動産相談</span>
        <div id="chat-tabs">
          <button id="tab-ask" class="tab active">質問する</button>
          <button id="tab-answers">回答一覧</button>
        </div>
      </div>

      <div id="ask-screen">
        <div id="ask-greeting"></div>
        <div id="chat-input-area">
          <input id="chat-input" type="text" placeholder="ご相談内容を入力してください" />
          <button id="chat-send">送信</button>
        </div>
      </div>

      <div id="answers-screen" class="hidden">
        <table id="answers-table">
          <thead>
            <tr><th>質問</th><th>回答</th></tr>
          </thead>
          <tbody id="answers-body"></tbody>
        </table>
        <p id="answers-empty">まだ回答はありません。「質問する」画面からご相談内容を送信してください。</p>
      </div>
    </div>
  `;

  const toggleBtn = document.getElementById('chat-toggle');
  const panel = document.getElementById('chat-panel');
  const tabAsk = document.getElementById('tab-ask');
  const tabAnswers = document.getElementById('tab-answers');
  const askScreen = document.getElementById('ask-screen');
  const answersScreen = document.getElementById('answers-screen');
  const answersBody = document.getElementById('answers-body');
  const answersEmpty = document.getElementById('answers-empty');
  const greetingEl = document.getElementById('ask-greeting');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  const history = [];
  let greeted = false;

  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden') && !greeted) {
      greeted = true;
      greetingEl.textContent =
        'こんにちは。空き家・解体・不動産売却・建替えに関するご相談を承っています。どのようなことでお悩みですか？';
    }
  });

  function showScreen(screen) {
    if (screen === 'ask') {
      askScreen.classList.remove('hidden');
      answersScreen.classList.add('hidden');
      tabAsk.classList.add('active');
      tabAnswers.classList.remove('active');
    } else {
      askScreen.classList.add('hidden');
      answersScreen.classList.remove('hidden');
      tabAsk.classList.remove('active');
      tabAnswers.classList.add('active');
    }
  }

  tabAsk.addEventListener('click', () => showScreen('ask'));
  tabAnswers.addEventListener('click', () => showScreen('answers'));

  function addAnswerRow(question, answer, isError) {
    answersEmpty.classList.add('hidden');
    const row = document.createElement('tr');
    if (isError) row.className = 'error-row';

    const qCell = document.createElement('td');
    qCell.textContent = question;
    const aCell = document.createElement('td');
    aCell.textContent = answer;

    row.appendChild(qCell);
    row.appendChild(aCell);
    answersBody.appendChild(row);
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
        showScreen('answers');
        return;
      }

      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: data.reply });
      addAnswerRow(text, data.reply, false);
      showScreen('answers');
    } catch (err) {
      addAnswerRow(text, 'サーバーに接続できませんでした。', true);
      showScreen('answers');
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
