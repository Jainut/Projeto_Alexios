function limparCampos()
{
    document.getElementById("cpf").value = '';
    document.getElementById("senha").value = '';
    document.getElementById("token").value = '';
}

function voltarLogin() 
{
    window.location.href = "file:///C:/Users/henri/Desktop/Projeto_Alexios/some_Codes/adminLogin/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cpf = document.getElementById("cpf").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const token = document.getElementById("token").value.trim();

    const resposta = await fetch("https://9d7b1233-1112-454a-8bae-264760b5436a-00-1l04tpjgywvvc.janeway.replit.dev/registrarAdmin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ cpf, senha })
    });

    const data = await resposta.json();

    if (resposta.ok) {
      window.location.href = "file:///C:/Users/Aluno_Analytics.CENTRO40.000/Downloads/Projeto_Alexios/some_Codes/adminLogin/index.html";
    } else {
      document.getElementById("respostaServidor").innerHTML = data.erro;
    }
  });
});