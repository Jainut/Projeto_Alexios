function limparCampos()
{
    document.getElementById("matricula").value = '';
    document.getElementById("senha").value = '';
}

function voltarLogin() 
{
    window.location.href = "file:///C:/Users/henri/Desktop/Projeto_Alexios/some_Codes/userLogin/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const matricula = document.getElementById("matricula").value.trim();
    const senha = document.getElementById("senha").value.trim();

    const resposta = await fetch("https://9d7b1233-1112-454a-8bae-264760b5436a-00-1l04tpjgywvvc.janeway.replit.dev/registrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ matricula, senha })
    });

    const data = await resposta.json();

    if (resposta.ok) {
      window.location.href = "file:///C:/Users/Aluno_Analytics.CENTRO40.000/Downloads/Projeto_Alexios/some_Codes/userLogin/index.html";
    } else {
      const respostaServidor = document.getElementById("respostaServidor")
      respostaServidor.innerHTML = data.erro;
    }
  });
});