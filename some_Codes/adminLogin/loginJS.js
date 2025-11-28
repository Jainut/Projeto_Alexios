function limparCampos() {
  document.getElementById("cpf").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("lembrarSenha").checked = false;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("loginForm");
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cpf = document.getElementById("cpf").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!cpf || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    const resposta = await fetch("https://9d7b1233-1112-454a-8bae-264760b5436a-00-1l04tpjgywvvc.janeway.replit.dev/loginAdmin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, senha }) 
    });

    const data = await resposta.json();

    if (resposta.ok) {
      window.location.href = "file:///C:/Users/Aluno_Analytics.CENTRO40.000/Downloads/Projeto_Alexios/some_Codes/telaAdmin/index.html";
    } else {
      document.getElementById("respostaServidor").textContent = data.erro || "Erro";
    }
  });
});
