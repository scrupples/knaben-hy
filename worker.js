// KnabenDB + Premiumize DirectDL - With Built-in Configurator UI
// Deploy once, configure via web interface!

const TMDB_API_KEY = 'f051e7366c6105ad4f9aafe4733d9dae';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Default config - can be overridden via URL params
const DEFAULT_CONFIG = {
    premiumizeKey: '',
    indexers: 'eztv|thepiratebay|yts|rutracker',
    categories: '10000000|2000000|3000000'
};

const AVAILABLE_INDEXERS = {
    eztv: { name: 'EZTV', categories: ['10000000'], desc: 'TV Shows' },
    thepiratebay: { name: 'The Pirate Bay', categories: ['10000000', '2000000', '3000000', '6000000'], desc: 'Movies & TV' },
    limetorrents: { name: 'Limetorrents', categories: ['10000000', '2000000', '3000000', '6000000'], desc: 'Movies & TV' },
    yts: { name: 'YTS', categories: ['10000000', '2000000', '3000000', '6000000'], desc: 'Movies' },
    rutracker: { name: 'RuTracker', categories: ['2000000', '3000000', '10000000'], desc: 'Movies & TV (RU)' },
    '1337x': { name: '1337x', categories: ['3001000', '3003000', '3004000', '3005000', '3008000', '2001000', '2002000', '2003000', '2004000', '2008000'], desc: 'Movies & TV' },
    nyaasi: { name: 'Nyaa.si', categories: ['6001000', '6002000', '6003000', '6004000', '6008000', '10000000'], desc: 'Anime (All categories)' }
};

// File list cache
const fileCache = new Map();
const CACHE_TTL = 1800000; // 30 minutes

// ============================================
// CONFIGURATION UI HTML
// ============================================

function getConfiguratorHTML(currentUrl) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KnabenDB Addon Configurator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
            min-height: 100vh;
            padding: 20px;
            color: #e1e8ed;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            background: linear-gradient(135deg, #37474f 0%, #546e7a 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            box-shadow: 0 8px 24px rgba(55, 71, 79, 0.4);
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #ffffff 0%, #b0bec5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
        }
        .header p {
            color: #8b98a5;
            font-size: 1.1rem;
            font-weight: 500;
        }
        .card {
            background: rgba(26, 31, 46, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .section-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .indexers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .indexer-card {
            background: rgba(255,255,255,0.1);
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        .indexer-card:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
        }
        .indexer-card.selected {
            background: rgba(72, 187, 120, 0.3);
            border-color: #48bb78;
        }
        .indexer-card input[type="checkbox"] {
            margin-top: 3px;
            width: 20px;
            height: 20px;
            cursor: pointer;
            flex-shrink: 0;
        }
        .indexer-name {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 5px;
        }
        .indexer-desc {
            opacity: 0.8;
            font-size: 0.9rem;
        }
        .input-group {
            margin-bottom: 20px;
        }
        .input-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }
        .input-group input {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            border: 2px solid rgba(255,255,255,0.3);
            background: rgba(255,255,255,0.1);
            color: #fff;
            font-size: 1rem;
        }
        .input-group input::placeholder {
            color: rgba(255,255,255,0.5);
        }
        .button-group {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        button {
            padding: 12px 24px;
            border-radius: 10px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 1rem;
        }
        .btn-primary {
            background: linear-gradient(135deg, #37474f 0%, #546e7a 100%);
            color: white;
            flex: 1;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 16px rgba(55, 71, 79, 0.3);
        }
        .btn-primary:hover {
            background: linear-gradient(135deg, #455a64 0%, #607d8b 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 24px rgba(55, 71, 79, 0.4);
        }
        .btn-primary:active {
            transform: translateY(0);
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: #b0bec5;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(84, 110, 122, 0.3);
        }
        .btn-small {
            padding: 8px 16px;
            font-size: 0.9rem;
        }
        .output-box {
            background: rgba(0, 0, 0, 0.4);
            color: #00d428;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9rem;
            word-break: break-all;
            margin-bottom: 15px;
            position: relative;
            border: 1px solid rgba(0, 176, 32, 0.2);
        }
        .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 6px 12px;
            font-size: 0.8rem;
        }
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .alert-info {
            background: rgba(84, 110, 122, 0.1);
            border: 2px solid rgba(84, 110, 122, 0.3);
            color: #b0bec5;
        }
        .alert-success {
            background: rgba(0, 176, 32, 0.05);
            border: 2px solid rgba(0, 176, 32, 0.2);
            color: #00d428;
        }
        .alert-warning {
            background: rgba(255, 152, 0, 0.1);
            border: 2px solid rgba(255, 152, 0, 0.3);
            color: #ffcc80;
        }
        .alert strong {
            color: #ffffff;
        }
        #result {
            display: none;
            animation: slideIn 0.4s ease-out;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .emoji {
            font-size: 1.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ KnabenDB Addon Configurator</h1>
            <p>Create your custom Stremio addon with selected indexers</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">For The Hungry Man Community 🍽️</p>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Note:</strong> Premiumize API Key is optional. If provided, streams will be served via DirectDL for instant playback.
        </div>

        <div class="card">
            <div class="section-title">
                <span class="emoji">🎯</span>
                <span>Select Indexers</span>
            </div>
            
            <div class="button-group">
                <button class="btn-secondary btn-small" onclick="selectRecommended()">✓ Recommended</button>
                <button class="btn-secondary btn-small" onclick="selectAll()">Select All</button>
                <button class="btn-secondary btn-small" onclick="clearAll()">Clear All</button>
            </div>

            <div class="indexers-grid" id="indexersGrid">
                ${Object.entries(AVAILABLE_INDEXERS).map(([id, info]) => `
                    <div class="indexer-card" onclick="toggleIndexer('${id}')">
                        <input type="checkbox" id="idx_${id}" value="${id}" onchange="updateSelection()" 
                               ${['eztv', 'thepiratebay', 'yts', 'rutracker'].includes(id) ? 'checked' : ''}>
                        <div>
                            <div class="indexer-name">${info.name}</div>
                            <div class="indexer-desc">${info.desc}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="card">
            <div class="section-title">
                <span class="emoji">🔑</span>
                <span>Premiumize Configuration (Optional)</span>
            </div>

            <div class="alert alert-info">
                <strong>ℹ️ Premiumize is optional but recommended!</strong><br>
                • With Premiumize: Streams served via DirectDL for instant playback<br>
                • Without Premiumize: Magnet links shown (requires torrent client or other debrid service)
            </div>

            <div class="input-group">
                <label>Premiumize API Key (Optional)</label>
                <input type="text" id="apiKey" placeholder="pr=your_api_key_here" 
                       value="${DEFAULT_CONFIG.premiumizeKey}">
                <small style="opacity: 0.7; display: block; margin-top: 5px;">
                    Get your API key from Premiumize.me settings. Leave empty for magnet links only.
                </small>
            </div>

            <button class="btn-primary" onclick="generateAddon()">
                🚀 Generate Addon URL
            </button>
        </div>

        <div class="card" id="result">
            <div class="section-title">
                <span class="emoji">✅</span>
                <span>Your Addon is Ready!</span>
            </div>

            <div class="alert alert-success">
                <strong>🎉 Success!</strong> Copy the URL below and add it to Stremio.
            </div>

            <div class="input-group">
                <label>Stremio Addon URL</label>
                <div class="output-box" id="addonUrl">
                    <button class="copy-btn btn-secondary" onclick="copyUrl()">Copy</button>
                    <div id="urlText"></div>
                </div>
            </div>

            <div class="alert alert-info">
                <strong>📝 How to install:</strong><br>
                1. Copy the URL above<br>
                2. Open Stremio → Addons → Community Addons<br>
                3. Paste the URL in "Add addon" field<br>
                4. Click Install and enjoy!
            </div>

            <div class="input-group">
                <label>Configuration Summary</label>
                <div class="output-box" id="configSummary"></div>
            </div>
        </div>
    </div>

    <script>
        const indexers = ${JSON.stringify(AVAILABLE_INDEXERS)};

        function toggleIndexer(id) {
            const checkbox = document.getElementById('idx_' + id);
            checkbox.checked = !checkbox.checked;
            updateSelection();
        }

        function updateSelection() {
            document.querySelectorAll('.indexer-card').forEach(card => {
                const checkbox = card.querySelector('input[type="checkbox"]');
                if (checkbox.checked) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
        }

        function selectRecommended() {
            const recommended = ['eztv', 'thepiratebay', 'yts', 'rutracker'];
            document.querySelectorAll('#indexersGrid input[type="checkbox"]').forEach(cb => {
                cb.checked = recommended.includes(cb.value);
            });
            updateSelection();
        }

        function selectAnimeOnly() {
            // Clear all first
            document.querySelectorAll('#indexersGrid input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            
            // Select only anime indexers (only nyaasi)
            const animeIndexers = ['nyaasi'];
            animeIndexers.forEach(id => {
                const checkbox = document.getElementById('idx_' + id);
                if (checkbox) checkbox.checked = true;
            });
            
            updateSelection();
            
            // Show notification
            alert('Selected Nyaa.si with anime categories! (6001000|6002000|6003000|6004000|6008000|10000000)');
        }

        function selectAll() {
            document.querySelectorAll('#indexersGrid input[type="checkbox"]').forEach(cb => {
                cb.checked = true;
            });
            updateSelection();
        }

        function clearAll() {
            document.querySelectorAll('#indexersGrid input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            updateSelection();
        }

        function generateAddon() {
            const selectedIndexers = Array.from(
                document.querySelectorAll('#indexersGrid input[type="checkbox"]:checked')
            ).map(cb => cb.value);

            if (selectedIndexers.length === 0) {
                alert('Please select at least one indexer!');
                return;
            }

            const apiKey = document.getElementById('apiKey').value.trim();
            
            // Get ALL categories for selected indexers
            const allCategories = [...new Set(
                selectedIndexers.flatMap(id => indexers[id].categories)
            )].join('|');

            const indexersList = selectedIndexers.join('|');
            const baseUrl = window.location.origin;
            let addonUrl = baseUrl + '/manifest.json?' + 
                'indexers=' + encodeURIComponent(indexersList) +
                '&categories=' + encodeURIComponent(allCategories);
            
            if (apiKey) {
                addonUrl += '&key=' + encodeURIComponent(apiKey);
            }

            document.getElementById('urlText').textContent = addonUrl;
            document.getElementById('configSummary').innerHTML = 
                '<strong>Selected Indexers:</strong> ' + selectedIndexers.map(id => indexers[id].name).join(', ') + '<br>' +
                '<strong>Categories:</strong> ' + allCategories.replace(/\|/g, ', ') + '<br>' +
                '<strong>Stream Type:</strong> ' + (apiKey ? 'Premiumize DirectDL' : 'Magnet Links') + '<br>' +
                '<strong>Total Sources:</strong> ' + selectedIndexers.length;

            document.getElementById('result').style.display = 'block';
            document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
        }

        function copyUrl() {
            const text = document.getElementById('urlText').textContent;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('.copy-btn');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 2000);
            });
        }

        // Initialize
        updateSelection();
    </script>
</body>
</html>`;
}

// ============================================
// PREMIUMIZE DIRECTDL (OPTIONAL)
// ============================================

class Premiumize {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://www.premiumize.me/api';
        this.batchSize = 99;
    }

    async checkCacheStatuses(hashes) {
        try {
            console.log(`🔍 Checking ${hashes.length} hashes in Premiumize cache`);
            const results = {};
            const batches = [];

            for (let i = 0; i < hashes.length; i += this.batchSize) {
                batches.push(hashes.slice(i, i + this.batchSize));
            }

            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                const params = new URLSearchParams();
                batch.forEach(hash => params.append('items[]', hash));

                const data = await this.makeRequest('GET', `/cache/check?${params}`);

                batch.forEach((hash, index) => {
                    results[hash] = {
                        cached: data.response[index],
                        service: 'Premiumize'
                    };
                });

                if (i < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            return results;

        } catch (error) {
            console.error('❌ Cache check failed:', error);
            return {};
        }
    }

    async getFileList(magnetLink) {
        const cacheKey = `files:${extractInfoHash(magnetLink)}`;
        
        if (fileCache.has(cacheKey)) {
            const cached = fileCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                console.log(`📂 Using cached file list`);
                return cached.data;
            }
            fileCache.delete(cacheKey);
        }

        try {
            const formData = new URLSearchParams();
            formData.append('src', magnetLink);
            formData.append('apikey', this.apiKey.replace('pr=', ''));

            console.log(`📂 Getting file list via DirectDL...`);
            const data = await this.makeRequest('POST', '/transfer/directdl', {
                body: formData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const files = (data.content || []).map(file => ({
                path: file.path,
                size: file.size,
                link: file.link,
                isVideo: /\.(mkv|mp4|avi|mov|wmv|m4v|webm)$/i.test(file.path),
                isSubtitle: /\.(srt|sub|ass|ssa|vtt)$/i.test(file.path),
                extension: file.path.split('.').pop().toLowerCase()
            }));

            fileCache.set(cacheKey, { data: files, timestamp: Date.now() });
            console.log(`📂 Found ${files.length} files (${files.filter(f => f.isVideo).length} videos)`);
            return files;

        } catch (error) {
            console.error('❌ Failed to get file list:', error);
            return [];
        }
    }

    async makeRequest(method, path, opts = {}) {
        const retries = 3;
        let lastError;

        for (let i = 0; i < retries; i++) {
            try {
                const url = `${this.baseUrl}${path}`;
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 30000);

                const finalUrl = method === 'GET' 
                    ? `${url}${url.includes('?') ? '&' : '?'}apikey=${this.apiKey.replace('pr=', '')}`
                    : url;

                const response = await fetch(finalUrl, {
                    ...opts,
                    method,
                    signal: controller.signal
                });

                clearTimeout(timeout);
                const data = await response.json();

                if (data.status === 'error') {
                    throw new Error(`API Error: ${data.message}`);
                }

                return data;

            } catch (error) {
                lastError = error;
                if (i < retries - 1) {
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        }

        throw lastError;
    }
}

// ============================================
// SMART FILE SELECTION
// ============================================

class FileSelector {
    static findBestMovieFile(files) {
        const videoFiles = files.filter(f => f.isVideo);
        
        if (videoFiles.length === 0) {
            console.log('⚠️ No video files found');
            return null;
        }

        const scored = videoFiles.map(file => ({
            ...file,
            score: this.scoreMovieFile(file)
        }));

        scored.sort((a, b) => b.score - a.score);

        console.log('🎯 Top movie file candidates:');
        scored.slice(0, 3).forEach((f, i) => {
            console.log(`  ${i + 1}. [Score: ${f.score}] ${formatFileSize(f.size)} - ${f.path}`);
        });

        return scored[0];
    }

    static scoreMovieFile(file) {
        const filename = file.path.toLowerCase();
        let score = 100;

        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > 500) score += 300;
        if (sizeMB > 1000) score += 200;
        if (sizeMB > 2000) score += 150;
        if (sizeMB > 5000) score += 100;

        const badKeywords = [
            'sample', 'trailer', 'preview', 'extras', 'bonus',
            'deleted', 'behind', 'making', 'interview', 'featurette'
        ];
        if (badKeywords.some(kw => filename.includes(kw))) {
            score -= 800;
        }

        if (file.extension === 'mkv') score += 50;
        if (file.extension === 'mp4') score += 40;

        const pathDepth = file.path.split('/').length;
        if (pathDepth <= 2) score += 100;

        return score;
    }

    static extractMetadata(filename) {
        const name = filename.toLowerCase();
        const metadata = {
            quality: this.extractQuality(name),
            hdr: [],
            codec: null,
            audio: null
        };

        if (/hdr10\+/i.test(name)) metadata.hdr.push('HDR10+');
        else if (/hdr10/i.test(name)) metadata.hdr.push('HDR10');
        if (/dolby.?vision|dv/i.test(name)) metadata.hdr.push('DV');

        if (/[hx].?265|hevc/i.test(name)) metadata.codec = 'HEVC';
        else if (/[hx].?264|avc/i.test(name)) metadata.codec = 'H.264';
        else if (/av1/i.test(name)) metadata.codec = 'AV1';

        if (/atmos/i.test(name)) metadata.audio = 'Atmos';
        else if (/7\.1/i.test(name)) metadata.audio = '7.1';
        else if (/5\.1/i.test(name)) metadata.audio = '5.1';

        return metadata;
    }

    static extractQuality(text) {
        if (/2160p|4k|uhd/i.test(text)) return '4K';
        if (/1080p/i.test(text)) return '1080p';
        if (/720p/i.test(text)) return '720p';
        if (/480p/i.test(text)) return '480p';
        return 'SD';
    }
}

// ============================================
// RSS PARSING
// ============================================

function parseRSSXML(xmlString) {
    try {
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        
        let match;
        while ((match = itemRegex.exec(xmlString)) !== null) {
            const itemContent = match[1];
            
            const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
            const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : '';
            
            const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/);
            const description = descMatch ? (descMatch[1] || descMatch[2]) : '';
            
            const authorMatch = itemContent.match(/<author>(.*?)<\/author>/);
            const author = authorMatch ? authorMatch[1] : '';
            
            items.push({ title, description, author });
        }
        
        return items;
    } catch (error) {
        console.error('❌ XML parsing error:', error);
        return [];
    }
}

function extractMagnetFromDescription(description) {
    if (!description) return null;
    const magnetMatch = description.match(/magnet:\?xt=urn:btih:[A-Za-z0-9]+[^"'\s]*/);
    return magnetMatch ? magnetMatch[0] : null;
}

function extractInfoHash(magnetLink) {
    const match = magnetLink.match(/btih:([a-fA-F0-9]{40})/i);
    return match ? match[1].toUpperCase() : null;
}

async function fetchKnabenRSS(searchQuery, indexers, categories) {
    console.log('🔎 Searching KnabenDB for:', searchQuery);
    console.log('📡 Using indexers:', indexers);
    console.log('📡 Using categories:', categories);

    try {
        const yearMatch = searchQuery.match(/\(\d{4}\)/);
        const year = yearMatch ? yearMatch[0].replace(/[()]/g, '') : '';
        const title = searchQuery.replace(/\(\d{4}\)/, '').trim();

        const searchTerm = `${title} ${year}`.trim();
        const encodedSearch = encodeURIComponent(searchTerm);
        const rssUrl = `https://rss.knaben.org/${encodedSearch}/${categories}//${indexers}`;

        console.log('📡 Request URL:', rssUrl);

        const response = await fetch(rssUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/rss+xml,application/xml,text/xml'
            }
        });

        if (!response.ok) {
            throw new Error(`RSS fetch failed: ${response.status}`);
        }

        const rssData = await response.text();
        const items = parseRSSXML(rssData);

        console.log(`📦 Found ${items.length} RSS items`);

        const torrents = items.map(item => {
            if (!item || !item.title || !item.description) return null;

            const magnetLink = extractMagnetFromDescription(item.description);
            if (!magnetLink) return null;

            const sizeMatch = item.description.match(/Size:\s*([\d.]+)\s*(MB|GB|TB)/i);
            const size = sizeMatch ? `${sizeMatch[1]} ${sizeMatch[2]}` : 'Unknown';

            let sizeInBytes = 0;
            if (sizeMatch) {
                const [, value, unit] = sizeMatch;
                const multiplier = unit.toUpperCase() === 'TB' ? 1024 ** 4 :
                                 unit.toUpperCase() === 'GB' ? 1024 ** 3 :
                                 1024 ** 2;
                sizeInBytes = parseFloat(value) * multiplier;
            }

            const infoHash = extractInfoHash(magnetLink);
            
            // Extract source from author field
            const source = item.author || 'Unknown';

            return {
                magnetLink,
                title: item.title,
                source: source,
                size,
                sizeInBytes,
                infoHash
            };
        }).filter(Boolean);

        console.log(`✅ Parsed ${torrents.length} valid torrents`);
        return torrents;

    } catch (error) {
        console.error('❌ Knaben RSS error:', error);
        return [];
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatFileSize(bytes) {
    if (!bytes) return '';
    const gb = bytes / (1024 ** 3);
    return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 ** 2)).toFixed(0)} MB`;
}

async function getTMDBDetails(imdbId) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
        );
        const data = await response.json();
        
        if (data.movie_results?.[0]) {
            const movie = data.movie_results[0];
            return {
                title: movie.title,
                year: movie.release_date ? movie.release_date.substring(0, 4) : '',
                type: 'movie'
            };
        }
        
        if (data.tv_results?.[0]) {
            const show = data.tv_results[0];
            return {
                title: show.name,
                year: show.first_air_date ? show.first_air_date.substring(0, 4) : '',
                type: 'series'
            };
        }
        
        return null;
    } catch (error) {
        console.error('❌ TMDB error:', error);
        return null;
    }
}

function createMagnetStream(torrent, mediaDetails) {
    const metadata = FileSelector.extractMetadata(torrent.title);
    const qualityBadge = metadata.quality;
    const techSpecs = [
        metadata.codec,
        metadata.audio
    ].filter(Boolean).join(' • ');

    const titleLines = [
        `🎬 ${mediaDetails.title}${mediaDetails.year ? ` (${mediaDetails.year})` : ''}`,
        ``,
        `📺 Quality: ${qualityBadge}`,
        techSpecs ? `🔧 ${techSpecs}` : null,
        `💾 Size: ${torrent.size}`,
        ``,
        `🌱 Source: ${torrent.source}`,
        `🔗 Type: Magnet Link`,
        ``,
        `⚠️ Requires torrent client or debrid service`
    ].filter(Boolean);

    return {
        name: `Magnet: ${qualityBadge} | ${torrent.size} | ${torrent.source}`,
        title: titleLines.join('\n'),
        url: torrent.magnetLink,
        behaviorHints: {
            bingeGroup: `magnet-${torrent.infoHash}`
        }
    };
}

function createPremiumizeStream(torrent, selectedFile, mediaDetails, metadata) {
    let qualityBadge = metadata.quality;
    if (metadata.hdr.length > 0) {
        qualityBadge += ` ${metadata.hdr.join('+')}`;
    }

    const techSpecs = [
        metadata.codec,
        metadata.audio
    ].filter(Boolean).join(' • ');
    const fileSize = formatFileSize(selectedFile.size);

    const titleLines = [
        `🎬 ${mediaDetails.title}${mediaDetails.year ? ` (${mediaDetails.year})` : ''}`,
        ``,
        `📺 Quality: ${qualityBadge}`,
        techSpecs ? `🔧 ${techSpecs}` : null,
        `💾 Size: ${fileSize}`,
        ``,
        `📁 File: ${selectedFile.path.split('/').pop()}`,
        `🌱 Source: ${torrent.source}`,
        ``,
        `⚡ Cached on Premiumize - instant playback!`,
        ``,
        `💡 DirectDL Method: No account clutter!`
    ].filter(Boolean);

    return {
        name: `${qualityBadge} | ${fileSize} | ${torrent.source} | ⚡ Cached`,
        title: titleLines.join('\n'),
        url: selectedFile.link,
        behaviorHints: {
            filename: selectedFile.path.split('/').pop(),
            bingeGroup: `premiumize-${torrent.infoHash}`
        }
    };
}

// ============================================
// MAIN HANDLER
// ============================================

export default {
    async fetch(request, env, ctx) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);

        // ROOT - Show configurator UI
        if (url.pathname === '/' || url.pathname === '') {
            return new Response(getConfiguratorHTML(url.origin), {
                headers: { 'Content-Type': 'text/html', ...corsHeaders }
            });
        }

        // Extract config from URL params
        const urlParams = new URLSearchParams(url.search);
        const indexers = urlParams.get('indexers') || DEFAULT_CONFIG.indexers;
        const categories = urlParams.get('categories') || DEFAULT_CONFIG.categories;
        const premiumizeKey = urlParams.get('key') || DEFAULT_CONFIG.premiumizeKey;

        const config = {
            premiumizeKey,
            indexers,
            categories,
            hasPremiumize: premiumizeKey && premiumizeKey.trim() !== '' && premiumizeKey !== 'pr='
        };

        console.log('⚙️ Configuration:', {
            indexers: config.indexers,
            categories: config.categories,
            hasPremiumize: config.hasPremiumize,
            premiumizeConfigured: !!config.premiumizeKey
        });

        // Manifest
        if (url.pathname === '/manifest.json') {
            const indexersList = config.indexers.split('|');
            const manifest = {
                id: config.hasPremiumize 
                    ? 'com.premiumize.knabendb.custom'
                    : 'com.knabendb.magnet.custom',
                version: '3.2.0',
                name: config.hasPremiumize 
                    ? `KnabenDB Premiumize (${indexersList.length} sources)`
                    : `KnabenDB Magnet (${indexersList.length} sources)`,
                description: config.hasPremiumize
                    ? `Custom KnabenDB addon with ${indexersList.join(', ')} via Premiumize DirectDL`
                    : `Custom KnabenDB addon with ${indexersList.join(', ')} - Magnet links only`,
                logo: 'https://img.sur.ly/favicons/k/knaben.eu.ico',
                resources: ['stream'],
                types: ['movie', 'series'],
                catalogs: [],
                idPrefixes: ['tt'],
                behaviorHints: {
                    configurable: true,
                    configurationRequired: false
                }
            };

            return new Response(JSON.stringify(manifest), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        // Stream endpoint
        if (url.pathname.startsWith('/stream/')) {
            try {
                const pathParts = url.pathname.split('/');
                const type = pathParts[2];
                let id = pathParts[3];

                if (id.endsWith('.json')) {
                    id = id.slice(0, -5);
                }

                id = decodeURIComponent(id);
                const imdbId = id.split(':')[0];

                console.log(`\n🎬 Request: ${type} - ${imdbId}`);
                console.log(`⚙️ Using indexers: ${config.indexers}`);

                // Get media details
                const mediaDetails = await getTMDBDetails(imdbId);
                if (!mediaDetails) {
                    throw new Error('Media not found');
                }

                console.log(`📺 ${mediaDetails.type}: ${mediaDetails.title} (${mediaDetails.year})`);

                // Search torrents with custom indexers
                const searchQuery = `${mediaDetails.title} (${mediaDetails.year})`;
                const torrents = await fetchKnabenRSS(searchQuery, config.indexers, config.categories);

                if (torrents.length === 0) {
                    console.log('❌ No torrents found');
                    return new Response(JSON.stringify({ streams: [] }), {
                        headers: { 'Content-Type': 'application/json', ...corsHeaders }
                    });
                }

                const streams = [];

                if (config.hasPremiumize) {
                    // Premiumize flow
                    console.log('💰 Premiumize key found, checking cache...');
                    const premiumize = new Premiumize(config.premiumizeKey);
                    
                    // Check cache for all torrents
                    const hashes = torrents.map(t => t.infoHash).filter(Boolean);
                    const cacheResults = await premiumize.checkCacheStatuses(hashes);
                    
                    const cachedTorrents = torrents.filter(t => 
                        t.infoHash && cacheResults[t.infoHash]?.cached
                    );

                    console.log(`✅ ${cachedTorrents.length}/${torrents.length} cached on Premiumize`);

                    // Process cached torrents
                    for (const torrent of cachedTorrents.slice(0, 10)) {
                        try {
                            const files = await premiumize.getFileList(torrent.magnetLink);
                            
                            if (files.length === 0) {
                                console.log(`⚠️ No files in torrent: ${torrent.title}`);
                                continue;
                            }

                            const selectedFile = FileSelector.findBestMovieFile(files);

                            if (!selectedFile) {
                                console.log(`⚠️ No suitable file found in: ${torrent.title}`);
                                continue;
                            }

                            const metadata = FileSelector.extractMetadata(selectedFile.path);
                            const stream = createPremiumizeStream(torrent, selectedFile, mediaDetails, metadata);
                            streams.push(stream);

                            console.log(`✅ Added Premiumize stream: ${stream.name}`);

                        } catch (error) {
                            console.error(`❌ Error processing torrent:`, error);
                        }
                    }
                } else {
                    // Magnet links flow
                    console.log('🔗 No Premiumize key, showing magnet links');
                    
                    for (const torrent of torrents.slice(0, 20)) {
                        try {
                            const stream = createMagnetStream(torrent, mediaDetails);
                            streams.push(stream);
                            console.log(`✅ Added magnet link: ${torrent.title}`);
                        } catch (error) {
                            console.error(`❌ Error creating magnet stream:`, error);
                        }
                    }
                }

                // Sort streams by quality
                streams.sort((a, b) => {
                    const qualityOrder = { '4K': 4, '1080p': 3, '720p': 2, '480p': 1, 'SD': 0 };
                    
                    const getQuality = (name) => {
                        if (name.includes('4K')) return qualityOrder['4K'];
                        if (name.includes('1080p')) return qualityOrder['1080p'];
                        if (name.includes('720p')) return qualityOrder['720p'];
                        if (name.includes('480p')) return qualityOrder['480p'];
                        return qualityOrder['SD'];
                    };
                    
                    const qualityDiff = getQuality(b.name) - getQuality(a.name);
                    if (qualityDiff !== 0) return qualityDiff;
                    
                    // Sort Premiumize streams above magnet links
                    const isPremiumizeA = a.name.includes('⚡');
                    const isPremiumizeB = b.name.includes('⚡');
                    if (isPremiumizeA && !isPremiumizeB) return -1;
                    if (!isPremiumizeA && isPremiumizeB) return 1;
                    
                    return 0;
                });

                console.log(`🎉 Returning ${streams.length} streams`);
                console.log(`🔗 Type: ${config.hasPremiumize ? 'Premiumize DirectDL' : 'Magnet Links'}\n`);

                return new Response(JSON.stringify({ streams }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });

            } catch (error) {
                console.error('❌ Stream error:', error);
                return new Response(JSON.stringify({ 
                    streams: [],
                    error: error.message 
                }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }
        }

        // Health check
        if (url.pathname === '/health') {
            return new Response(JSON.stringify({ 
                status: 'OK',
                addon: 'KnabenDB Configurator',
                version: '3.2.0',
                mode: config.hasPremiumize ? 'Premiumize DirectDL' : 'Magnet Links',
                indexers: config.indexers
            }), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        return new Response('Not Found', { 
            status: 404,
            headers: corsHeaders 
        });
    }
};
