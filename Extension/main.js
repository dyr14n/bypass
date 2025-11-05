(function() {
    'use strict';

    const v = "1.7.0.1";
    
    const host = location.hostname;

    let currentLanguage = localStorage.getItem('lang') || 'vi';

    const translations = {
        vi: {
            title: "Dyrian Bypass",
            pleaseSolveCaptcha: "Vui lòng giải CAPTCHA để tiếp tục",
            captchaSuccess: "CAPTCHA đã thành công",
            redirectingToWork: "Đang qua Work.ink...",
            bypassSuccessCopy: "Bypass thành công, đã Copy Key (bấm 'Cho Phép' nếu có)",
            waitingCaptcha: "Đang chờ CAPTCHA...",
            pleaseReload: "Vui lòng tải lại trang...(workink lỗi)",
            bypassSuccess: "Bypass thành công, chờ {time}s...",
            backToCheckpoint: "Đang về lại Checkpoint...",
            captchaSuccessBypassing: "CAPTCHA đã thành công, đang bypass...",
            version: `Phiên bản v${v}`,
            madeBy: "Được tạo bởi DyRian (dựa trên IHaxU)"
        },
        en: {
            title: "Dyrian Bypass",
            pleaseSolveCaptcha: "Please solve the CAPTCHA to continue",
            captchaSuccess: "CAPTCHA solved successfully",
            redirectingToWork: "Redirecting to Work.ink...",
            bypassSuccessCopy: "Bypass successful! Key copied (click 'Allow' if prompted)",
            waitingCaptcha: "Waiting for CAPTCHA...",
            pleaseReload: "Please reload the page...(workink bugs)",
            bypassSuccess: "Bypass successful, waiting {time}s...",
            backToCheckpoint: "Returning to checkpoint...",
            captchaSuccessBypassing: "CAPTCHA solved successfully, bypassing...",
            version: `Version v${v}`,
            madeBy: "Made by DyRian (based on IHaxU)"
        }
    };

    function t(key, replacements = {}) {
        let text = translations[currentLanguage][key] || key;
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        return text;
    }

    class BypassPanel {
        constructor() {
            this.container = null;
            this.shadow = null;
            this.panel = null;
            this.statusText = null;
            this.statusDot = null;
            this.versionEl = null;
            this.creditEl = null;
            this.langBtns = [];
            this.currentMessageKey = null;
            this.currentType = 'info';
            this.currentReplacements = {};
            this.isMinimized = false;
            this.body = null;
            this.minimizeBtn = null;
            this.init();
        }

        init() {
            this.createPanel();
            this.setupEventListeners();
        }

        createPanel() {
            this.container = document.createElement('div');
            this.shadow = this.container.attachShadow({ mode: 'closed' });

            const style = document.createElement('style');
            style.textContent = `
                * { margin: 0; padding: 0; box-sizing: border-box; }

                .panel-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 400px;
                    z-index: 2147483647;
                    font-family: 'Segoe UI', Roboto, 'Noto Sans', Arial, sans-serif;
                }

                .panel {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    transition: all 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }

                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 16px 20px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                    animation: shine 3s infinite;
                }

                @keyframes shine {
                    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                }

                .title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    position: relative;
                    z-index: 1;
                }

                .minimize-btn {
                    background: rgba(255,255,255,0.15);
                    border: none;
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    font-size: 20px;
                    font-weight: 700;
                    position: relative;
                    z-index: 1;
                }

                .minimize-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: scale(1.1);
                }

                .status-section {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .status-box {
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 16px;
                    position: relative;
                    overflow: hidden;
                }

                .status-box::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .status-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    position: relative;
                    z-index: 1;
                }

                .status-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    animation: pulse 2s ease-in-out infinite;
                    box-shadow: 0 0 12px currentColor;
                    flex-shrink: 0;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.15); }
                }

                .status-dot.info { background: #60a5fa; }
                .status-dot.success { background: #4ade80; }
                .status-dot.warning { background: #facc15; }
                .status-dot.error { background: #f87171; }

                .status-text {
                    color: #fff;
                    font-size: 14px;
                    font-weight: 500;
                    flex: 1;
                    line-height: 1.5;
                }

                .panel-body {
                    max-height: 500px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    opacity: 1;
                }

                .panel-body.hidden {
                    max-height: 0;
                    opacity: 0;
                }

                .language-section {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .lang-toggle {
                    display: flex;
                    gap: 10px;
                }

                .lang-btn {
                    flex: 1;
                    background: rgba(255,255,255,0.05);
                    border: 2px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 10px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .lang-btn:hover {
                    background: rgba(255,255,255,0.1);
                    transform: translateY(-2px);
                }

                .lang-btn.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-color: #667eea;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }

                .info-section {
                    padding: 16px 20px;
                    background: rgba(0,0,0,0.2);
                }

                .version {
                    color: rgba(255,255,255,0.6);
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    text-align: center;
                }

                .credit {
                    color: rgba(255,255,255,0.6);
                    font-size: 12px;
                    font-weight: 500;
                    text-align: center;
                    margin-bottom: 8px;
                }

                .credit-author {
                    color: #667eea;
                    font-weight: 700;
                }

                .links {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    font-size: 11px;
                }

                .links a {
                    color: #667eea;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .links a:hover {
                    color: #764ba2;
                    text-decoration: underline;
                }

                @media (max-width: 480px) {
                    .panel-container {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        width: auto;
                    }
                }
            `;

            this.shadow.appendChild(style);

            const panelHTML = `
                <div class="panel-container">
                    <div class="panel">
                        <div class="header">
                            <div class="title">${t('title')}</div>
                            <button class="minimize-btn" id="minimize-btn">-</button>
                        </div>
                        <div class="status-section">
                            <div class="status-box">
                                <div class="status-content">
                                    <div class="status-dot info" id="status-dot"></div>
                                    <div class="status-text" id="status-text">${t('pleaseSolveCaptcha')}</div>
                                </div>
                            </div>
                        </div>
                        <div class="panel-body" id="panel-body">
                            <div class="language-section">
                                <div class="lang-toggle">
                                    <button class="lang-btn ${currentLanguage === 'vi' ? 'active' : ''}" data-lang="vi">Tiếng Việt</button>
                                    <button class="lang-btn ${currentLanguage === 'en' ? 'active' : ''}" data-lang="en">English</button>
                                </div>
                            </div>
                            <div class="info-section">
                                <div class="version" id="version">${t('version')}</div>
                                <div class="credit" id="credit">
                                    ${t('madeBy')}
                                </div>
                                <div class="links">
                                    <a href="https://www.youtube.com/@dyydeptry" target="_blank">YouTube</a>
                                    <a href="https://discord.gg/DWyEfeBCzY" target="_blank">Discord</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = panelHTML;
            this.shadow.appendChild(wrapper.firstElementChild);

            this.panel = this.shadow.querySelector('.panel');
            this.statusText = this.shadow.querySelector('#status-text');
            this.statusDot = this.shadow.querySelector('#status-dot');
            this.versionEl = this.shadow.querySelector('#version');
            this.creditEl = this.shadow.querySelector('#credit');
            this.langBtns = Array.from(this.shadow.querySelectorAll('.lang-btn'));
            this.body = this.shadow.querySelector('#panel-body');
            this.minimizeBtn = this.shadow.querySelector('#minimize-btn');

            document.documentElement.appendChild(this.container);
        }

        setupEventListeners() {
            this.langBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    currentLanguage = btn.dataset.lang;
                    this.updateLanguage();
                });
            });

            this.minimizeBtn.addEventListener('click', () => {
                this.isMinimized = !this.isMinimized;
                this.body.classList.toggle('hidden');
                this.minimizeBtn.textContent = this.isMinimized ? '+' : '−';
            });
        }

        updateLanguage() {
            localStorage.setItem('lang', currentLanguage);

            this.langBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
            });

            this.shadow.querySelector('.title').textContent = t('title');
            this.versionEl.textContent = t('version');
            this.creditEl.textContent = t('madeBy');

            if (this.currentMessageKey) {
                this.show(this.currentMessageKey, this.currentType, this.currentReplacements);
            }
        }

        show(messageKey, type = 'info', replacements = {}) {
            this.currentMessageKey = messageKey;
            this.currentType = type;
            this.currentReplacements = replacements;

            const message = t(messageKey, replacements);
            this.statusText.textContent = message;
            this.statusDot.className = `status-dot ${type}`;
        }
    }

    let panel = null;
    setTimeout(() => { panel = new BypassPanel(); panel.show('pleaseSolveCaptcha', 'info'); }, 100);

    if (host.includes("key.volcano.wtf")) handleVolcano();
    else if (host.includes("work.ink")) handleWorkInk();

    function handleVolcano() {
        if (panel) panel.show('pleaseSolveCaptcha', 'info');

        let alreadyDoneContinue = false;
        let alreadyDoneCopy = false;

        function actOnCheckpoint(node) {
            if (!alreadyDoneContinue) {
                const buttons = node && node.nodeType === 1
                    ? node.matches('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]')
                        ? [node]
                        : node.querySelectorAll('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]')
                    : document.querySelectorAll('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]');
                for (const btn of buttons) {
                    const text = (btn.innerText || btn.value || "").trim().toLowerCase();
                    if (text.includes("continue") || text.includes("next step")) {
                        const disabled = btn.disabled || btn.getAttribute("aria-disabled") === "true";
                        const style = getComputedStyle(btn);
                        const visible = style.display !== "none" && style.visibility !== "hidden" && btn.offsetParent !== null;
                        if (visible && !disabled) {
                            alreadyDoneContinue = true;
                            if (panel) panel.show('captchaSuccess', 'success');

                            for (const btn of buttons) {
                                const currentBtn = btn;
                                const currentPanel = panel;

                                setTimeout(() => {
                                    try {
                                        currentBtn.click();
                                        if (currentPanel) currentPanel.show('redirectingToWork', 'info');
                                    } catch (err) { }
                                }, 300);
                            }
                            return true;
                        }
                    }
                }
            }

            const copyBtn = node && node.nodeType === 1
                ? node.matches("#copy-key-btn, .copy-btn, [aria-label='Copy']")
                    ? node
                    : node.querySelector("#copy-key-btn, .copy-btn, [aria-label='Copy']")
                : document.querySelector("#copy-key-btn, .copy-btn, [aria-label='Copy']");
            if (copyBtn) {
                setInterval(() => {
                    try {
                        copyBtn.click();
                        if (panel) panel.show('bypassSuccessCopy', 'success');
                    } catch (err) { }
                }, 500);
                return true;
            }

            return false;
        }

        const mo = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            if (actOnCheckpoint(node)) {
                                if (alreadyDoneCopy) {
                                    mo.disconnect();
                                    return;
                                }
                            }
                        }
                    }
                }
                if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
                    if (actOnCheckpoint(mutation.target)) {
                        if (alreadyDoneCopy) {
                            mo.disconnect();
                            return;
                        }
                    }
                }
            }
        });

        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'style'] });

        if (actOnCheckpoint()) {
            if (alreadyDoneCopy) {
                mo.disconnect();
            }
        }
    }

    function handleWorkInk() {

        const id = 'deaiapbieocoklikiokamcdklicacgdo';
        const value = 'wk_installed';
        const res = { "installed": true, "name": "pdfeditor" };

        if (typeof window.chrome === 'undefined') window.chrome = {};
        if (typeof window.chrome.runtime === 'undefined') window.chrome.runtime = {};

        window.chrome.runtime.sendMessage = function(extensionId, message, options, responseCallback) {
            const callback = [responseCallback, options].find(arg => typeof arg === 'function');

            let isMatch = false;
            if ((typeof message === 'object' && message !== null && message.message === value) ||
                (typeof message === 'string' && message === value)) {
                isMatch = true;
            }

            if (extensionId === id && isMatch) {
                if (callback) {
                    setTimeout(() => callback(res), 50 + Math.random() * 100);
                }
            }
        };

        const startTime = Date.now();
        let sessionController = undefined;
        let sendMessageA = undefined;
        let onLinkInfoA = undefined;
        let onLinkDestinationA = undefined;

        const map = {
            onLI: ["onLinkInfo"],
            onLD: ["onLinkDestination"]
        };

        const types = {
            mo: 'c_monetization',
            ss: 'c_social_started',
            tr: 'c_turnstile_response',
            ad: 'c_adblocker_detected',
        };

        function resolveName(obj, candidates) {
            if (!obj || typeof obj !== "object") {
                return { fn: null, index: -1, name: null };
            }

            for (let i = 0; i < candidates.length; i++) {
                const name = candidates[i];
                if (typeof obj[name] === "function") {
                    return { fn: obj[name], index: i, name };
                }
            }
            return { fn: null, index: -1, name: null };
        }

        function resolveWriteFunction(obj) {
            if (!obj || typeof obj !== "object") {
                return { fn: null, index: -1, name: null };
            }

            for (let i in obj) {
                if (typeof obj[i] === "function" && obj[i].length === 2) {
                    return { fn: obj[i], name: i };
                }
            }
            return { fn: null, index: -1, name: null };
        }


        function createSendMessageProxy() {
            return function(...args) {
                const [type] = args;

                if (type === types.ad) return;

                if (type == types.tr) {
                    if (panel) panel.show('captchaSuccessBypassing', 'success');
                }
                return sendMessageA ? sendMessageA.apply(this, args) : undefined;
            };
        }

        function createLinkInfoProxy() {
            return function(...args) {
                const [info] = args;

                try {
                    Object.defineProperty(info, 'isAdblockEnabled', {
                        get: () => false,
                        set: () => {},
                        configurable: false,
                        enumerable: true
                    });
                } catch (e) { }

                return onLinkInfoA ? onLinkInfoA.apply(this, args) : undefined;
            };
        }

        function redirect(url) {
            window.location.href = url;
        }

        function startCountdown(url, waitLeft) {
            if (panel) panel.show('bypassSuccess', 'warning', { time: Math.ceil(waitLeft) });

            const interval = setInterval(() => {
                waitLeft -= 1;
                if (waitLeft > 0) {
                    if (panel) panel.show('bypassSuccess', 'warning', { time: Math.ceil(waitLeft) });
                } else {
                    clearInterval(interval);
                    redirect(url);
                }
            }, 1000);
        }

        function createDestinationProxy() {
            return function(...args) {
                const [data] = args;
                const secondsPassed = (Date.now() - startTime) / 1000;

                let waitTimeSeconds = 5;
                const url = location.href;
                if (url.includes('42rk6hcq') || url.includes('ito4wckq') || url.includes('pzarvhq1')) {
                    waitTimeSeconds = 38;
                }

                if (secondsPassed >= waitTimeSeconds) {
                    if (panel) panel.show('backToCheckpoint', 'info');
                    redirect(data.url);
                } else {
                    startCountdown(data.url, waitTimeSeconds - secondsPassed);
                }

                return onLinkDestinationA ? onLinkDestinationA.apply(this, args) : undefined;
            };
        }

        function setupProxies() {
            const send = resolveWriteFunction(sessionController);
            const info = resolveName(sessionController, map.onLI);
            const dest = resolveName(sessionController, map.onLD);

            if (!send.fn || !info.fn || !dest.fn) return;

            sendMessageA = send.fn;
            onLinkInfoA = info.fn;
            onLinkDestinationA = dest.fn;

            try {
                Object.defineProperty(sessionController, send.name, {
                    get: createSendMessageProxy,
                    set: v => (sendMessageA = v),
                    configurable: true
                });
                Object.defineProperty(sessionController, info.name, {
                    get: createLinkInfoProxy,
                    set: v => (onLinkInfoA = v),
                    configurable: true
                });
                Object.defineProperty(sessionController, dest.name, {
                    get: createDestinationProxy,
                    set: v => (onLinkDestinationA = v),
                    configurable: true
                });
            } catch (e) { }
        }

        function checkController(target, prop, value) {
            if (value &&
                typeof value === 'object' &&
                resolveWriteFunction(value).fn &&
                resolveName(value, map.onLI).fn &&
                resolveName(value, map.onLD).fn &&
                !sessionController) {
                sessionController = value;
                setupProxies();
            }
            return Reflect.set(target, prop, value);
        }

        function createComponentProxy(comp) {
            return new Proxy(comp, {
                construct(target, args) {
                    const instance = Reflect.construct(target, args);
                    if (instance.$$.ctx) {
                        instance.$$.ctx = new Proxy(instance.$$.ctx, { set: checkController });
                    }
                    return instance;
                }
            });
        }

        function createNodeProxy(node) {
            return async (...args) => {
                const result = await node(...args);
                return new Proxy(result, {
                    get: (t, p) => p === 'component' ? createComponentProxy(t.component) : Reflect.get(t, p)
                });
            };
        }

        function createKitProxy(kit) {
            if (!kit?.start) return [false, kit];
            return [
                true,
                new Proxy(kit, {
                    get(target, prop) {
                        if (prop === 'start') {
                            return function(...args) {
                                const [nodes, , opts] = args;
                                if (nodes?.nodes && opts?.node_ids) {
                                    const idx = opts.node_ids[1];
                                    if (nodes.nodes[idx]) {
                                        nodes.nodes[idx] = createNodeProxy(nodes.nodes[idx]);
                                    }
                                }
                                return kit.start.apply(this, args);
                            };
                        }
                        return Reflect.get(target, prop);
                    }
                })
            ];
        }

        function setupInterception() {
            const origPromiseAll = window.Promise.all;
            let intercepted = false;

            window.Promise.all = function(promises) {
                const result = origPromiseAll.call(this, promises);
                if (!intercepted) {
                    intercepted = true;
                    return new Promise((resolve) => {
                        result.then(([kit, app, ...args]) => {
                            const [success, created] = createKitProxy(kit);
                            if (success) {
                                window.Promise.all = origPromiseAll;
                            }
                            resolve([created, app, ...args]);
                        });
                    });
                }
                return result;
            };
        }

        setupInterception();

        const hide = 'W2lkXj0iYnNhLXpvbmVfIl0sCmRpdi5maXhlZC5pbnNldC0wLmJnLWJsYWNrXC81MC5iYWNrZHJvcC1ibHVyLXNtLApkaXYuZG9uZS1iYW5uZXItY29udGFpbmVyLnN2ZWx0ZS0xeWptazFnLAppbnM6bnRoLW9mLXR5cGUoMSksCmRpdjpudGgtb2YtdHlwZSg5KSwKZGl2LmZpeGVkLnRvcC0xNi5sZWZ0LTAucmlnaHQtMC5ib3R0b20tMC5iZy13aGl0ZS56LTQwLm92ZXJmbG93LXktYXV0bywKcFtzdHlsZV0sCi5hZHNieWdvb2dsZSwKLmFkc2Vuc2Utd3JhcHBlciwKLmlubGluZS1hZCwKLmdwdC1iaWxsYm9hcmQtY29udGFpbmVyLAojYmlsbGJvYXJkLTEsCiNiaWxsYm9hcmQtMiwKI2JpbGxib2FyZC0zLAojc2lkZWJhci1hZC0xLAojc2t5c2NyYXBlci1hZC0xIHsKICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDsKfQ==';

        const style = document.createElement('style');
        style.textContent = (typeof atob === 'function') ? atob(hide) : (Buffer ? Buffer.from(hide, 'base64').toString() : '');
        (document.head || document.documentElement).appendChild(style);

        const ob = new MutationObserver(mutations => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeType !== 1) continue;

                    if (node.classList?.contains('adsbygoogle')) node.remove();
                    node.querySelectorAll?.('.adsbygoogle').forEach(el => el.remove());

                    if (node.matches('.button.large.accessBtn.pos-relative') && node.textContent.includes('Go To Destination')) {
                        if (panel) panel.show('captchaSuccessBypassing', 'success');
                        node.click();
                    } else {
                        node.querySelectorAll?.('.button.large.accessBtn.pos-relative').forEach(btn => {
                            if (btn.textContent.includes('Go To Destination')) {
                                if (panel) panel.show('captchaSuccessBypassing', 'success');
                                btn.click();
                            }
                        });
                    }
                }
            }
        });
        ob.observe(document.documentElement, { childList: true, subtree: true });
    }

    console.log(`[Dyrian Bypass v${v}] Script loaded successfully`);
})();
