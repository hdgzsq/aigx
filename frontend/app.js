const API_BASE = '';

const textInput = document.getElementById('textInput');
const styleSelect = document.getElementById('styleSelect');
const generateBtn = document.getElementById('generateBtn');
const outputArea = document.getElementById('outputArea');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorArea = document.getElementById('errorArea');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');

let lastResult = '';

generateBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    const style = styleSelect.value;

    if (!text) {
        showError('请输入需要改写的文案');
        textInput.focus();
        return;
    }

    setLoading(true);
    hideError();
    outputArea.innerHTML = '';
    lastResult = '';

    try {
        const response = await fetch(`${API_BASE}/rewrite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, style }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '改写失败，请重试');
        }

        lastResult = data.result;
        outputArea.textContent = lastResult;
        copyBtn.disabled = false;
        clearBtn.disabled = false;
    } catch (err) {
        showError(err.message || '网络请求失败，请检查后端是否运行');
    } finally {
        setLoading(false);
    }
});

copyBtn.addEventListener('click', () => {
    if (!lastResult) return;
    navigator.clipboard.writeText(lastResult).then(() => {
        const original = copyBtn.textContent;
        copyBtn.textContent = '✅ 已复制';
        setTimeout(() => { copyBtn.textContent = original; }, 1500);
    }).catch(() => {
        showError('复制失败，请手动选择复制');
    });
});

clearBtn.addEventListener('click', () => {
    outputArea.innerHTML = '<span class="placeholder-text">改写后的文案将显示在这里...</span>';
    lastResult = '';
    copyBtn.disabled = true;
    clearBtn.disabled = true;
    hideError();
});

textInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generateBtn.click();
    }
});

function setLoading(loading) {
    generateBtn.disabled = loading;
    loadingIndicator.style.display = loading ? 'flex' : 'none';
    textInput.disabled = loading;
    styleSelect.disabled = loading;
}

function showError(msg) {
    errorArea.textContent = msg;
    errorArea.style.display = 'block';
}

function hideError() {
    errorArea.style.display = 'none';
}
