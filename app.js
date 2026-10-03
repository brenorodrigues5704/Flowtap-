const DEMO = {
  id: "demo",
  name: "Barbearia do João",
  logo: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80",
  pix: "barbeariadojoao@pix",
  google: "https://www.google.com/search?q=Barbearia+do+Joao",
  instagram: "https://instagram.com/",
  whatsapp: "https://wa.me/5543999999999"
};

function getStores() {
  try { return JSON.parse(localStorage.getItem("flowtap_stores") || "[]"); }
  catch { return []; }
}

function saveStores(stores) {
  localStorage.setItem("flowtap_stores", JSON.stringify(stores));
}

function slugify(text) {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function findStore(id) {
  if (id === "demo") return DEMO;
  return getStores().find(s => s.id === id);
}

function publicUrl(id) {
  return `${location.origin}${location.pathname.replace(/\/[^/]*$/, "/")}index.html?loja=${encodeURIComponent(id)}`;
}

function renderPublic() {
  const params = new URLSearchParams(location.search);
  const id = params.get("loja") || "demo";
  const store = findStore(id) || DEMO;

  document.title = `${store.name} — FlowTap`;

  document.querySelector("#app").innerHTML = `
    <section class="phone-page">
      <div class="cover" style="--cover: linear-gradient(180deg, rgba(2,10,18,.15), rgba(2,10,18,.96)), url('${store.logo || ""}')">
        <div>
          <div class="brand-mark">◉ FlowTap</div>
          <h1>${escapeHtml(store.name)}</h1>
          <p>Pagamento e conexões em um só toque.</p>
        </div>
      </div>

      <div class="page-content">
        <button class="action primary" id="pixBtn">
          <div class="icon">▦</div>
          <div>
            <strong>Pagar via Pix</strong>
            <span>Rápido, direto e prático</span>
          </div>
        </button>

        <a class="action" href="${safeUrl(store.google)}" target="_blank" rel="noopener">
          <div class="icon">G</div>
          <div>
            <strong>Avalie no Google</strong>
            <span>Sua opinião ajuda muito!</span>
          </div>
        </a>

        <div class="socials">
          ${store.instagram ? `<a class="social" href="${safeUrl(store.instagram)}" target="_blank">◎ Instagram</a>` : ""}
          ${store.whatsapp ? `<a class="social" href="${safeUrl(store.whatsapp)}" target="_blank">◉ WhatsApp</a>` : ""}
        </div>

        <div class="footer">FlowTap · Conectando você ao que importa.</div>
      </div>
    </section>
  `;

  document.querySelector("#pixBtn").addEventListener("click", () => openPix(store));
}

function openPix(store) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal">
      <button class="close" aria-label="Fechar">×</button>
      <h2>Pagar via Pix</h2>
      <p>Escaneie o QR Code ou copie a chave Pix e informe o valor da compra no seu aplicativo do banco.</p>

      <div class="qr-wrap">
        <div id="qrcode"></div>
      </div>

      <button class="copy-btn" id="copyPix">⧉ Copiar chave Pix</button>
      <p class="note">O pagamento é feito diretamente para ${escapeHtml(store.name)}.</p>

      <button class="action primary" id="paidBtn" style="margin-top:14px">
        <div class="icon">✓</div>
        <div>
          <strong>Já paguei</strong>
          <span>Continuar</span>
        </div>
      </button>
    </div>
  `;
  document.body.appendChild(backdrop);

  new QRCode(document.getElementById("qrcode"), {
    text: store.pix,
    width: 210,
    height: 210,
    correctLevel: QRCode.CorrectLevel.M
  });

  backdrop.querySelector(".close").onclick = () => backdrop.remove();

  backdrop.querySelector("#copyPix").onclick = async () => {
    try {
      await navigator.clipboard.writeText(store.pix);
      backdrop.querySelector("#copyPix").textContent = "✓ Chave Pix copiada";
    } catch {
      alert("Não foi possível copiar automaticamente. Selecione a chave manualmente.");
    }
  };

  backdrop.querySelector("#paidBtn").onclick = () => {
    backdrop.remove();
    showPaidScreen(store);
  };
}

function showPaidScreen(store) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal" style="text-align:center">
      <button class="close" aria-label="Fechar">×</button>
      <div style="font-size:62px;margin:8px 0">✓</div>
      <h2>Pagamento realizado?</h2>
      <p>Quando concluir o pagamento no aplicativo do banco, você pode continuar para avaliar o estabelecimento.</p>
      <a class="action primary" href="${safeUrl(store.google)}" target="_blank" rel="noopener">
        <div class="icon">G</div>
        <div>
          <strong>Avaliar no Google</strong>
          <span>Sua opinião é muito importante!</span>
        </div>
      </a>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.querySelector(".close").onclick = () => backdrop.remove();
}

function renderAdmin() {
  const form = document.getElementById("storeForm");
  const result = document.getElementById("result");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const idBase = slugify(name) || `cliente-${Date.now()}`;
    let id = idBase;
    const stores = getStores();
    let count = 2;
    while (stores.some(s => s.id === id)) id = `${idBase}-${count++}`;

    const store = {
      id,
      name,
      logo: document.getElementById("logo").value.trim(),
      pix: document.getElementById("pix").value.trim(),
      google: document.getElementById("google").value.trim(),
      instagram: normalizeInstagram(document.getElementById("instagram").value.trim()),
      whatsapp: normalizeWhatsapp(document.getElementById("whatsapp").value.trim())
    };

    stores.push(store);
    saveStores(stores);

    const url = publicUrl(store.id);
    result.classList.remove("hidden");
    result.innerHTML = `
      <strong>✓ FlowTap criado!</strong><br>
      <small>Link para gravar no NFC:</small><br>
      <a href="${url}" target="_blank" style="color:var(--accent);word-break:break-all">${url}</a>
    `;

    form.reset();
    renderStoreList();
  });

  renderStoreList();
}

function renderStoreList() {
  const list = document.getElementById("storeList");
  const stores = getStores();

  if (!stores.length) {
    list.innerHTML = `<p style="color:var(--muted);font-size:13px">Nenhum estabelecimento cadastrado ainda.</p>`;
    return;
  }

  list.innerHTML = stores.map(s => `
    <div class="store-card">
      <div>
        <strong>${escapeHtml(s.name)}</strong>
        <small>${escapeHtml(s.id)}</small>
      </div>
      <a class="open-btn" href="index.html?loja=${encodeURIComponent(s.id)}" target="_blank">Abrir</a>
    </div>
  `).join("");
}

function normalizeInstagram(value) {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  return `https://instagram.com/${value.replace("@","")}`;
}

function normalizeWhatsapp(value) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function safeUrl(url) {
  if (!url) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return "#";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

if (document.getElementById("storeForm")) renderAdmin();
else renderPublic();
