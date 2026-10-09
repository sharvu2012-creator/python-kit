/* ==========================================================================
   Python Kit — Animated Chatbot Widget
   Floating snake mascot → slide-up chat panel → self-brain NLP
   Zero external AI API dependency. Works offline after load.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__pkBotLoaded) return;
  window.__pkBotLoaded = true;

  /* ---------- CONFIG ---------- */
  var BOT_NAME = 'PyBot';
  var BOT_MASCOT = '🐍';
  var MAX_MESSAGES = 50;

  /* ---------- KNOWLEDGE BASE ---------- */
  var KB = {
    greetings: {
      patterns: ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'hola', 'salaam', 'kaise', 'kaisa', 'kya haal', 'good morning', 'good evening'],
      responses: [
        'Hello! 🐍 I\'m PyBot, your Python learning assistant. Ask me anything about Python Kit!',
        'Namaste! 🙏 Ready to learn Python? I can help with lessons, quizzes, or code questions.',
        'Hey there! 👋 I\'m here to help you master Python. What would you like to know?'
      ]
    },
    lessons: {
      patterns: ['lesson', 'lessons', 'course', 'curriculum', 'what will i learn', 'topics', 'syllabus', 'roadmap'],
      responses: [
        'Python Kit has **10 lessons** covering:\n\n1. Variables & Data Types\n2. Input & Output\n3. Operators\n4. Conditionals (if/else)\n5. Loops (for/while)\n6. Functions\n7. Lists & Tuples\n8. Dictionaries & Sets\n9. File Handling\n10. Error Handling\n\nEach lesson has a quiz and code challenge! 🎯'
      ]
    },
    quiz: {
      patterns: ['quiz', 'quizzes', 'test', 'exam', 'assessment', 'mcq', 'code test'],
      responses: [
        'Each lesson has **3 AI-generated MCQs** + **3 real code challenges** graded by actual execution! 🧪\n\nYou need **67% to pass** and unlock the next lesson. Questions are different every attempt!'
      ]
    },
    xp: {
      patterns: ['xp', 'experience', 'points', 'score', 'stars', 'streak', 'badge', 'reward'],
      responses: [
        'You earn **XP** for every passed test! ⭐\n\n• Pass a quiz → earn XP\n• Complete code challenges → bonus XP\n• Build a **streak** 🔥 by learning daily\n• Unlock **badges** for milestones\n\nCheck your progress in the roadmap!'
      ]
    },
    languages: {
      patterns: ['language', 'languages', 'punjabi', 'hindi', 'translate', 'translation', 'bangla', 'telugu', 'tamil', 'gujarati', 'marathi', 'kannada', 'urdu', 'odia', 'malayalam', 'assamese'],
      responses: [
        'Python Kit supports **13 languages**! 🌍\n\nEnglish, ਪੰਜਾਬੀ, हिंदी, বাংলা, తెలుగు, தமிழ், ગુજરાતી, मराठी, ಕನ್ನಡ, ଓଡ଼ିଆ, മലയാളം, অসমীয়া, اردو\n\nThe entire UI and AI tutor work in your language!'
      ]
    },
    teacher: {
      patterns: ['teacher', 'instructor', 'faculty', 'who made', 'creator', 'developer', 'team'],
      responses: [
        'Python Kit was built by **Team Python Kit** for **Siksha-Hack 2026** 🏆\n\nA free, zero-setup coding education platform for Punjab\'s schools.'
      ]
    },
    install: {
      patterns: ['install', 'pwa', 'offline', 'app', 'home screen', 'download'],
      responses: [
        'Python Kit is a **PWA** (Progressive Web App)! 📲\n\n• Tap **Install** in the top bar\n• Or use browser menu → "Add to Home Screen"\n• Works **offline** after first visit\n• No app store needed!'
      ]
    },
    help: {
      patterns: ['help', 'how to', 'how do i', 'guide', 'tutorial', 'start', 'begin', 'first step'],
      responses: [
        'Here\'s how to get started: 🚀\n\n1. **Pick a lesson** from the roadmap\n2. **Read the lesson** content\n3. **Pass the quiz** (3 MCQs + 3 code tests)\n4. **Earn XP** and unlock the next lesson\n5. **Repeat** until you finish all 10!\n\nNeed help with a specific topic? Just ask!'
      ]
    },
    code: {
      patterns: ['code', 'coding', 'program', 'programming', 'syntax', 'error', 'bug', 'debug', 'not working'],
      responses: [
        'Having trouble with code? 🐛\n\n• Make sure you\'re using **Python 3** syntax\n• Check for **indentation** errors (Python is strict!)\n• Use the **code playground** to test snippets\n• Ask me about specific topics like loops, functions, etc.\n\nI can explain any Python concept!'
      ]
    },
    thanks: {
      patterns: ['thank', 'thanks', 'shukriya', 'dhanyavad', 'bahut badhiya', 'great', 'awesome', 'nice', 'good', 'amazing'],
      responses: [
        'You\'re welcome! 😊 Keep learning and growing! 🐍✨',
        'Happy to help! 💜 Happy coding!',
        'Anytime! 🚀 Keep up the great work!'
      ]
    },
    bye: {
      patterns: ['bye', 'goodbye', 'alvida', 'chalta hoon', 'see you', 'later'],
      responses: [
        'Goodbye! 👋 Keep practicing Python! 🐍',
        'See you later! 🌟 Don\'t forget to maintain your streak! 🔥'
      ]
    }
  };

  var FALLBACK_RESPONSES = [
    'I\'m not sure about that yet. 🤔 Try asking about:\n• Lessons\n• Quizzes\n• XP & streaks\n• Languages\n• Installation',
    'Hmm, I didn\'t understand. 🐍 Try:\n• "What lessons are there?"\n• "How do quizzes work?"\n• "How do I install?"',
    'I\'m still learning! 📚 Ask me about Python lessons, quizzes, or features.'
  ];

  var QUICK_REPLIES = [
    '📚 Lessons',
    '🧪 Quizzes',
    '⭐ XP & Streaks',
    '🌍 Languages',
    '📲 Install',
    '❓ Help'
  ];

  /* ---------- STATE ---------- */
  var isOpen = false;
  var messageCount = 0;
  var conversationContext = [];

  /* ---------- DOM BUILD ---------- */
  function buildWidget() {
    // Floating action button
    var fab = document.createElement('div');
    fab.id = 'pkBotFab';
    fab.innerHTML = '<span class="pk-bot-mascot">' + BOT_MASCOT + '</span><span class="pk-bot-pulse"></span>';
    fab.setAttribute('role', 'button');
    fab.setAttribute('aria-label', 'Open PyBot chat');
    fab.addEventListener('click', toggleChat);
    document.body.appendChild(fab);

    // Chat panel
    var panel = document.createElement('div');
    panel.id = 'pkBotPanel';
    panel.innerHTML = [
      '<div class="pk-bot-header">',
      '  <div class="pk-bot-header-left">',
      '    <span class="pk-bot-avatar">' + BOT_MASCOT + '</span>',
      '    <div>',
      '      <div class="pk-bot-name">' + BOT_NAME + '</div>',
      '      <div class="pk-bot-status"><span class="pk-bot-online-dot"></span> Online</div>',
      '    </div>',
      '  </div>',
      '  <button class="pk-bot-close" id="pkBotClose" aria-label="Close chat">✕</button>',
      '</div>',
      '<div class="pk-bot-messages" id="pkBotMessages"></div>',
      '<div class="pk-bot-quick-replies" id="pkBotQuickReplies"></div>',
      '<div class="pk-bot-input-row">',
      '  <input type="text" id="pkBotInput" placeholder="Ask me anything about Python..." autocomplete="off" />',
      '  <button id="pkBotSend" aria-label="Send">➤</button>',
      '</div>'
    ].join('');
    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('pkBotClose').addEventListener('click', toggleChat);
    document.getElementById('pkBotSend').addEventListener('click', handleSend);
    document.getElementById('pkBotInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleSend();
    });

    // Render quick replies
    renderQuickReplies();

    // Initial bot message
    setTimeout(function () {
      addBotMessage('Hello! 🐍 I\'m **PyBot**, your Python learning assistant!\n\nAsk me about lessons, quizzes, XP, or anything about Python Kit!');
    }, 800);
  }

  /* ---------- CHAT TOGGLE ---------- */
  function toggleChat() {
    isOpen = !isOpen;
    var panel = document.getElementById('pkBotPanel');
    var fab = document.getElementById('pkBotFab');
    if (isOpen) {
      panel.classList.add('open');
      fab.classList.add('hidden');
      document.getElementById('pkBotInput').focus();
    } else {
      panel.classList.remove('open');
      fab.classList.remove('hidden');
    }
  }

  /* ---------- MESSAGE HANDLING ---------- */
  function handleSend() {
    var input = document.getElementById('pkBotInput');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUserMessage(text);
    showTyping();
    setTimeout(function () {
      hideTyping();
      var response = generateResponse(text);
      addBotMessage(response);
    }, 600 + Math.random() * 800);
  }

  function addUserMessage(text) {
    var container = document.getElementById('pkBotMessages');
    var div = document.createElement('div');
    div.className = 'pk-bot-msg user';
    div.innerHTML = '<div class="pk-bot-bubble">' + escapeHtml(text) + '</div>';
    container.appendChild(div);
    scrollToBottom();
    messageCount++;
    if (messageCount > MAX_MESSAGES) {
      container.removeChild(container.firstChild);
    }
  }

  function addBotMessage(text) {
    var container = document.getElementById('pkBotMessages');
    var div = document.createElement('div');
    div.className = 'pk-bot-msg bot';
    div.innerHTML = '<div class="pk-bot-bubble">' + formatMarkdown(text) + '</div>';
    container.appendChild(div);
    scrollToBottom();
    messageCount++;
    if (messageCount > MAX_MESSAGES) {
      container.removeChild(container.firstChild);
    }
  }

  function showTyping() {
    var container = document.getElementById('pkBotMessages');
    var div = document.createElement('div');
    div.className = 'pk-bot-msg bot typing';
    div.id = 'pkBotTyping';
    div.innerHTML = '<div class="pk-bot-bubble"><span class="pk-bot-dot"></span><span class="pk-bot-dot"></span><span class="pk-bot-dot"></span></div>';
    container.appendChild(div);
    scrollToBottom();
  }

  function hideTyping() {
    var el = document.getElementById('pkBotTyping');
    if (el) el.remove();
  }

  function scrollToBottom() {
    var container = document.getElementById('pkBotMessages');
    container.scrollTop = container.scrollHeight;
  }

  /* ---------- QUICK REPLIES ---------- */
  function renderQuickReplies() {
    var container = document.getElementById('pkBotQuickReplies');
    QUICK_REPLIES.forEach(function (label) {
      var btn = document.createElement('button');
      btn.className = 'pk-bot-quick-btn';
      btn.textContent = label;
      btn.addEventListener('click', function () {
        document.getElementById('pkBotInput').value = label.replace(/^[^\s]+\s/, '');
        handleSend();
      });
      container.appendChild(btn);
    });
  }

  /* ---------- NLP ENGINE ---------- */
  function generateResponse(input) {
    var text = input.toLowerCase().trim();
    conversationContext.push(text);
    if (conversationContext.length > 10) conversationContext.shift();

    // Check each knowledge base entry
    for (var key in KB) {
      var entry = KB[key];
      for (var i = 0; i < entry.patterns.length; i++) {
        if (text.indexOf(entry.patterns[i]) !== -1) {
          var responses = entry.responses;
          return responses[Math.floor(Math.random() * responses.length)];
        }
      }
    }

    // Context-aware fallback
    if (conversationContext.length > 1) {
      var prev = conversationContext[conversationContext.length - 2];
      if (prev.indexOf('lesson') !== -1 || prev.indexOf('quiz') !== -1) {
        return 'Would you like to know more about **lessons** or **quizzes**? 📚';
      }
    }

    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }

  /* ---------- UTILITIES ---------- */
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatMarkdown(text) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  /* ---------- INIT ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
