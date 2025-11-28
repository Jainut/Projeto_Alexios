function limparCampos() {
  document.getElementById("matricula").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("lembrarSenha").checked = false;
}

function entrarAdminLogin(){
    window.location.href = "file:///C:/Users/henri/Desktop/Projeto_Alexios/some_Codes/adminLogin/index.html";
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("loginForm");
    
    if (form) {
        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            const matricula = document.getElementById("matricula").value.trim();
            const senha = document.getElementById("senha").value.trim();

            if (!matricula || !senha) {
                alert("Preencha todos os campos!");
                return;
            }

            const resposta = await fetch("https://9d7b1233-1112-454a-8bae-264760b5436a-00-1l04tpjgywvvc.janeway.replit.dev/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ matricula, senha }) 
            });

            const data = await resposta.json();

            if (resposta.ok) {
                window.location.href = "file:///C:/Users/Aluno_Analytics.CENTRO40.000/Downloads/Projeto_Alexios/Projeto_Atestado/guia.html";
            } else {
                const respostaServidor = document.getElementById("respostaServidor")
                respostaServidor.innerHTML = data.erro || "Erro";
            }
        });
    } else {
        console.error("Erro: Elemento 'loginForm' não encontrado no DOM.");
    }
});
