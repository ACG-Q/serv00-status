
let updateInterval;

function generateDomains() {
    const domains = [];
    const prefixes = CONFIG.DOMAIN_PREFIXES;
    for (let i = 0; i <= CONFIG.DOMAIN_RANGE; i++) {
        prefixes.forEach((prefix) => {
            domains.push(`${prefix}${i}.serv00.com`);
        });
    }
    return domains;
}

async function resolveDNS(domain) {
    const cacheKey = `dns_${domain}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const { ip, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CONFIG.CACHE_EXPIRY) return ip;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.DNS_TIMEOUT);

    try {
        const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=A`, {
            headers: { Accept: "application/dns-json" },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await response.json();
        const ip = data.Answer?.[0]?.data || "解析失败";

        localStorage.setItem(cacheKey, JSON.stringify({ ip, timestamp: Date.now() }));
        return ip;
    } catch {
        return "解析超时";
    }
}

function createServerRow(domain) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${domain}</td>
        <td class="dns-resolving">正在解析...</td>
        <td>
            <div class="status-indicator"></div>
            <span class="status-text">等待检测</span>
        </td>
    `;
    return tr;
}

async function checkServer(domain) {
    if (!navigator.onLine) return false;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.SERVER_TIMEOUT);

        await fetch(`https://${domain}`, { method: "HEAD", mode: "no-cors", signal: controller.signal });

        clearTimeout(timeoutId);
        return true;
    } catch {
        return false;
    }
}

async function updateStatus() {
    const rows = document.querySelectorAll("#serverStatus tr");

    for (const row of rows) {
        const domain = row.cells[0].textContent;
        const ipCell = row.cells[1];
        const statusCell = row.cells[2];
        const indicator = statusCell.querySelector(".status-indicator");
        const text = statusCell.querySelector(".status-text");

        // 更新IP地址
        const newIp = await resolveDNS(domain);
        ipCell.textContent = newIp;

        // 更新状态
        indicator.className = "status-indicator";
        text.textContent = "检测中...";
        text.style.color = "#000";

        const isAvailable = await checkServer(domain);
        indicator.classList.add(isAvailable ? "available" : "unavailable");
        text.textContent = isAvailable ? "在线" : "离线";
        text.style.color = isAvailable ? "#28a745" : "#dc3545";
    }
}

async function init() {
    const tbody = document.getElementById("serverStatus");
    const domains = generateDomains();

    domains.forEach((domain) => {
        tbody.appendChild(createServerRow(domain));
    });

    // 并发解析DNS
    const ipCells = document.querySelectorAll("#serverStatus td:nth-child(2)");
    await Promise.all(
        domains.map(async (domain, i) => {
            ipCells[i].textContent = await resolveDNS(domain);
        })
    );

    updateStatus();

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopUpdatingStatus();
        } else {
            updateStatus(); // 立即更新一次
            startUpdatingStatus();
        }
    });
}

function startUpdatingStatus() {
    if (!updateInterval) {
        updateInterval = setInterval(updateStatus, CONFIG.UPDATE_INTERVAL);
    }
}

function stopUpdatingStatus() {
    clearInterval(updateInterval);
    updateInterval = null;
}

window.addEventListener("load", init);
