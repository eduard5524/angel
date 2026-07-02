(function () {
    'use strict';

    var chatForm = document.getElementById('chatForm');
    var chatInput = document.getElementById('chatInput');
    var chatMessages = document.getElementById('chatMessages');
    var sendBtn = document.getElementById('sendBtn');
    var newChatBtn = document.getElementById('newChatBtn');
    var startChatBtn = document.getElementById('startChatBtn');
    var deleteConvBtn = document.getElementById('deleteConvBtn');
    var sidebarToggle = document.getElementById('sidebarToggle');
    var chatSidebar = document.getElementById('chatSidebar');

    // Auto-resize textarea
    if (chatInput) {
        chatInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        });

        chatInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (chatForm) chatForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    // Send message
    if (chatForm) {
        chatForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var message = chatInput.value.trim();
            if (!message) return;

            var convId = chatForm.dataset.convId;
            appendMessage('user', message);
            chatInput.value = '';
            chatInput.style.height = 'auto';
            sendBtn.disabled = true;

            var typingEl = showTypingIndicator();

            fetch('/chat/' + convId + '/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                removeTypingIndicator(typingEl);
                if (data.error) {
                    appendMessage('assistant', 'Error: ' + data.error);
                } else {
                    appendMessage('assistant', data.reply);
                    if (data.title) {
                        var titleEl = document.getElementById('convTitle');
                        if (titleEl) titleEl.textContent = data.title;

                        var activeItem = document.querySelector('.conv-item.active .conv-title');
                        if (activeItem) activeItem.textContent = data.title;
                    }
                }
            })
            .catch(function () {
                removeTypingIndicator(typingEl);
                appendMessage('assistant', 'Failed to send message. Please try again.');
            })
            .finally(function () {
                sendBtn.disabled = false;
                chatInput.focus();
            });
        });
    }

    function appendMessage(role, content) {
        if (!chatMessages) return;
        var div = document.createElement('div');
        div.className = 'message message-' + role;

        var avatarLetter = role === 'user' ? getUserInitial() : 'A';
        div.innerHTML =
            '<div class="message-avatar">' + avatarLetter + '</div>' +
            '<div class="message-content">' +
                '<div class="message-role">' + (role === 'user' ? 'You' : 'Angel') + '</div>' +
                '<div class="message-text"></div>' +
            '</div>';

        div.querySelector('.message-text').textContent = content;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        if (!chatMessages) return null;
        var div = document.createElement('div');
        div.className = 'message message-assistant';
        div.innerHTML =
            '<div class="message-avatar">A</div>' +
            '<div class="message-content">' +
                '<div class="message-role">Angel</div>' +
                '<div class="typing-indicator"><span></span><span></span><span></span></div>' +
            '</div>';
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return div;
    }

    function removeTypingIndicator(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function getUserInitial() {
        var badge = document.querySelector('.user-badge');
        return badge ? badge.textContent.trim() : 'U';
    }

    // New conversation
    function createNewChat(model) {
        fetch('/chat/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model || 'deepseek-r1:7b' })
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            window.location.href = '/chat/' + data.id;
        });
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', function () {
            createNewChat('deepseek-r1:7b');
        });
    }

    if (startChatBtn) {
        startChatBtn.addEventListener('click', function () {
            var select = document.getElementById('modelSelect');
            createNewChat(select ? select.value : 'deepseek-r1:7b');
        });
    }

    // Delete conversation
    if (deleteConvBtn && chatForm) {
        deleteConvBtn.addEventListener('click', function () {
            if (!confirm('Delete this conversation?')) return;
            var convId = chatForm.dataset.convId;
            fetch('/chat/' + convId + '/delete', { method: 'POST' })
                .then(function () { window.location.href = '/'; });
        });
    }

    // Mobile sidebar toggle
    if (sidebarToggle && chatSidebar) {
        sidebarToggle.addEventListener('click', function () {
            chatSidebar.classList.toggle('open');
        });
    }

    // Scroll to bottom on load
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
})();
