// URL da API do Google Apps Script que fornece os dados dos arquivos
const FILES_API_URL =
    "https://script.google.com/macros/s/AKfycbwJDYQ9bQm3_mOn5cPQVdzAAkKYAWdDnwb_K3SyTpn5mj-Ibld2jXRXDSvmftSV9Hzh/exec";

// URL base da sua API Flask (AGORA SOMENTE A RAIZ DO DOMÍNIO DO REPLIT)
const FLASK_API_BASE_URL =
    "https://9d7b1233-1112-454a-8bae-264760b5436a-00-1l04tpjgywvvc.janeway.replit.dev";

// Variáveis globais
let allFiles = []; // Armazena todos os arquivos da API externa
let statuses = []; // Armazena o status de cada arquivo (index mapeado para status)
let currentTab = "arquivos"; // Aba atualmente selecionada
let currentPage = 1; // Página atual na paginação
const filesPerPage = 10; // Número de arquivos por página
// --- NOVAS FUNÇÕES DE COMUNICAÇÃO COM A API FLASK ---

/**
 * Envia a atualização de status para a API Flask.
 * @param {number} fileIndex O índice do arquivo na lista global `allFiles`.
 * @param {string} newStatus O novo status a ser aplicado ('validado', 'erro', 'invalido' ou 'pendente').
 * @returns {Promise<boolean>} True se o salvamento foi bem-sucedido.
 */
async function sendStatusUpdate(fileIndex, newStatus) {
    try {
        // Chamada correta: BASE_URL + /update_status
        const res = await fetch(`${FLASK_API_BASE_URL}/update_status`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fileIndex: fileIndex,
                newStatus: newStatus,
            }),
        });

        const data = await res.json();
        if (!res.ok || !data.sucesso) {
            throw new Error(
                data.erro || "Falha ao salvar status na API Flask."
            );
        }
        return true;
    } catch (error) {
        console.error("Erro ao salvar status no servidor:", error);
        alert(
            `Erro ao salvar status para o arquivo ${fileIndex}: ${error.message}`
        );
        return false;
    }
}

// --- Funções de Inicialização e Renderização (MODIFICADAS) ---

// Função principal para carregar arquivos e status salvos
async function loadFiles() {
    const statusElem = document.getElementById("status");
    try {
        statusElem.textContent = "Carregando arquivos e status..."; // 1. Buscar Arquivos da API Externa

        const filesRes = await fetch(FILES_API_URL);
        if (!filesRes.ok)
            throw new Error(
                "Erro ao acessar API de Arquivos: " + filesRes.status
            );
        allFiles = await filesRes.json();

        // 2. Buscar Status Salvos da API Flask (Endpoint adicionado e correto)
        const statusRes = await fetch(`${FLASK_API_BASE_URL}/load_statuses`);
        if (!statusRes.ok)
            throw new Error(
                "Erro ao acessar API de Status (Flask): " + statusRes.status
            );
        const savedStatusesList = await statusRes.json();

        // 3. Mapear Status: Inicializa todos como "pendente" e aplica os salvos
        statuses = new Array(allFiles.length).fill("pendente");

        savedStatusesList.forEach((item) => {
            const index = parseInt(item.file_index);
            if (index >= 0 && index < allFiles.length) {
                statuses[index] = item.status;
            }
        }); // Atualiza mensagem de status

        statusElem.textContent = `Encontrados ${allFiles.length} arquivo(s).`; // Renderiza os arquivos na tela
        renderFiles();
    } catch (err) {
        // Tratamento de erro
        statusElem.textContent = "Erro: " + err.message;
    }
}

// Renderiza arquivos filtrados e paginados
function renderFiles() {
    const ul = document.getElementById("files");
    const searchTerm = document.getElementById("searchBox").value.toLowerCase();
    ul.innerHTML = ""; // Limpa a lista // Cria array com índices para referência

    let filtered = allFiles.map((f, i) => ({ ...f, index: i })); // Aplica filtro de busca se houver termo

    if (searchTerm) {
        filtered = filtered.filter((f) =>
            f.name.toLowerCase().includes(searchTerm)
        );
    } else {
        // Aplica filtro por aba
        filtered = filtered.filter((f) => {
            const st = statuses[f.index];
            if (currentTab === "arquivos") return true; // Mostra todos
            if (currentTab === "pendente") return st === "pendente";
            if (currentTab === "validado") return st === "validado";
            if (currentTab === "erro") return st === "erro";
            if (currentTab === "invalido") return st === "invalido";
            return true;
        });
    } // Paginação

    const totalPages = Math.ceil(filtered.length / filesPerPage);
    if (currentPage > totalPages) currentPage = 1; // Ajusta página se necessário
    const start = (currentPage - 1) * filesPerPage;
    const paginated = filtered.slice(start, start + filesPerPage); // Renderiza cada arquivo da página atual

    paginated.forEach((f) => {
        const i = f.index;
        const li = document.createElement("li"); // Container principal que alinha as colunas
        li.className = "file-row-content"; // Cria container de informações do arquivo

        const fileInfo = document.createElement("div");
        fileInfo.className = "file-info"; // Link para o arquivo

        const a = document.createElement("a");
        a.href = f.url;
        a.textContent = f.name;
        a.target = "_blank"; // Abre em nova aba // Metadados do arquivo

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = `${f.mimeType} — ${f.size} bytes`;

        fileInfo.appendChild(a);
        fileInfo.appendChild(meta);
        li.appendChild(fileInfo); // Cria radios de status para cada opção

        ["validado", "erro", "invalido"].forEach((val) => {
            const div = document.createElement("div");
            div.className = "checkbox-group status-col"; // Adiciona classe de coluna

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "status_" + i; // Nome único por arquivo
            input.value = val;
            input.checked = statuses[i] === val; // Marca o status atual // Evento para alterar status (AGORA CHAMA A API)

            input.addEventListener("change", async () => {
                const newStatus = input.checked ? val : "pendente";
                const success = await sendStatusUpdate(i, newStatus);

                if (success) {
                    statuses[i] = val; // Atualiza o status local para o novo valor selecionado
                    updateStats(); // Re-renderiza para aplicar filtros
                    if (currentTab === "arquivos" || currentTab === val) {
                        renderFiles();
                    }
                } else {
                    // Se falhou, recarrega o estado do servidor para desfazer o click visual
                    loadFiles();
                }
            });

            div.appendChild(input);
            li.appendChild(div);
        });

        ul.appendChild(li);
        ul.appendChild(document.createElement("hr")); // Linha separadora
    }); // Renderiza controles de paginação

    renderPagination(totalPages); // Atualiza estatísticas
    updateStats();
}

// --- Funções Auxiliares (PAGINAÇÃO, ESTATÍSTICAS, ABAS) ---

// Renderiza botões de paginação
function renderPagination(totalPages) {
    let paginationDiv = document.getElementById("pagination"); // Cria div de paginação se não existir
    if (!paginationDiv) {
        paginationDiv = document.createElement("div");
        paginationDiv.id = "pagination";
        paginationDiv.style.display = "flex";
        paginationDiv.style.justifyContent = "center";
        paginationDiv.style.gap = "8px";
        paginationDiv.style.marginTop = "15px";
        document.querySelector(".conteudo").appendChild(paginationDiv);
    }
    paginationDiv.innerHTML = ""; // Limpa paginação anterior // Não mostra paginação se só há uma página

    if (totalPages <= 1) return; // Botão "Anterior"

    const prev = document.createElement("button");
    prev.textContent = "← Anterior";
    prev.disabled = currentPage === 1; // Desabilita na primeira página
    prev.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderFiles();
        }
    });
    paginationDiv.appendChild(prev); // Botões numéricos de página

    for (let p = 1; p <= totalPages; p++) {
        const btn = document.createElement("button");
        btn.textContent = p;
        btn.style.padding = "6px 12px";
        btn.style.borderRadius = "6px";
        btn.style.border = "1px solid #ccc";
        btn.style.cursor = "pointer"; // Destaca página atual
        if (p === currentPage) {
            btn.style.backgroundColor = "#11228d";
            btn.style.color = "#fff";
        }
        btn.addEventListener("click", () => {
            currentPage = p;
            renderFiles();
        });
        paginationDiv.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "Próxima →";
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderFiles();
        }
    });
    paginationDiv.appendChild(next);
}

function updateStats() {
    const counts = { pendente: 0, validado: 0, erro: 0, invalido: 0 };
    statuses.forEach((st) => counts[st]++);
    document.getElementById("stats").innerHTML = `
    <span>Pendentes: ${counts.pendente}</span>
    <span>Validados: ${counts.validado}</span>
    <span>Com Erro: ${counts.erro}</span>
    <span>Inválidos: ${counts.invalido}</span>`;
}

// --- Listeners de Evento (ABAS e BUSCA) ---

document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document
            .querySelectorAll(".tab")
            .forEach((t) => t.classList.remove("active"));

        tab.classList.add("active");

        currentTab = tab.dataset.tab;
        currentPage = 1;

        renderFiles();
    });
});

document.getElementById("searchBox").addEventListener("input", () => {
    currentPage = 1;
    renderFiles();
});

// Inicializa a aplicação carregando os arquivos
loadFiles();
