const areaTexto = document.getElementById("area-texto");

const botoes = document.querySelectorAll(".botao");

const tagsPorComando = {
  negrito: "b",       
  italico: "i",       
  sublinhado: "u"    
};

// Sobe pelos elementos pais, a partir do ponto onde o cursor está,
// procurando a tag (ex.: "b"). Serve para saber se o negrito já está ligado.
function acharTagAcima(no, nomeTag) {
  while (no && no !== areaTexto) {
     if (no.nodeName.toLowerCase() === nomeDaTag) {
      return no;        
    }
    no = no.parentNode; // sobe um nível na árvore DOM
}
return null;          
}

// Lê a posição exata da seleção, fatia o texto em três pedaços
// (antes, selecionado, depois) e embrulha só o do meio na tag.
function formatarTrechoSelecionado(nomeDaTag, trecho, selecao) {

  // lê onde a seleção começa e termina
  const noInicial = trecho.startContainer;    
  const noFinal = trecho.endContainer;        
  const posicaoInicial = trecho.startOffset;  
  const posicaoFinal = trecho.endOffset;      

  //seleção dentro de UM nó de texto (nodeType 3)
  const ehCasoSimples = (noInicial === noFinal) && (noInicial.nodeType === 3);

  if (!ehCasoSimples) {
    alert("Selecione apenas um trecho de texto com a mesma formatação.");
    return;
  }
  
// fatia o texto em três pedaços
  const textoCompleto = noInicial.nodeValue;
  const textoAntes = textoCompleto.slice(0, posicaoInicial);
  const textoSelecionado = textoCompleto.slice(posicaoInicial, posicaoFinal);
  const textoDepois = textoCompleto.slice(posicaoFinal);

// cria a tag (ex.: <b>) e coloca só o trecho selecionado dentro dela
  const elemento = document.createElement(nomeDaTag);
  elemento.textContent = textoSelecionado;

  // o pai do texto original vai receber os pedaços novos
  const pai = noInicial.parentNode;

  if (textoAntes !== "") {
    pai.insertBefore(document.createTextNode(textoAntes), noInicial);
  }
  pai.insertBefore(elemento, noInicial);
  if (textoDepois !== "") {
    pai.insertBefore(document.createTextNode(textoDepois), noInicial);
  }

  // remove o texto original, que foi substituído pelos pedaços
  pai.removeChild(noInicial);

  // seleciona o conteúdo da tag nova, para a pessoa ver o resultado
  const novoTrecho = document.createRange();
  novoTrecho.selectNodeContents(elemento);
  selecao.removeAllRanges();
  selecao.addRange(novoTrecho);
}

// LIGAR e DESLIGAR PARA AS PRÓXIMAS PALAVRAS
function alternarProximasPalavras(nomeDaTag, trecho, selecao) {

  // o cursor já está dentro dessa tag? (ex.: já está em negrito)
  const tagAtual = acharTagAcima(selecao.anchorNode, nomeDaTag);

  // "\u200B" é um caractere INVISÍVEL.
  const marcador = document.createTextNode("\u200B");

  if (tagAtual !== null) {
    // DESLIGAR: coloca o marcador logo DEPOIS da tag, do lado de fora
    tagAtual.after(marcador);

  } else {
    // LIGAR: cria a tag com o marcador dentro dela.
    const elemento = document.createElement(nomeDaTag);
    elemento.appendChild(marcador);
    trecho.insertNode(elemento);
  }

  // põe o cursor logo depois do marcador 
  const novoTrecho = document.createRange();
  novoTrecho.setStart(marcador, 1);
  novoTrecho.collapse(true); 
  selecao.removeAllRanges();
  selecao.addRange(novoTrecho);
}

//FUNÇÃO PRINCIPAL
function aplicarFormatacao(nomeDaTag) {

  // a seleção atual da página
  const selecao = window.getSelection();

  // sem seleção nenhuma, ou fora da área de texto: avisa e para
  if (selecao.rangeCount === 0 ||
      !areaTexto.contains(selecao.getRangeAt(0).commonAncestorContainer)) {
    alert("Clique dentro da área de texto primeiro.");
    return;
  }

  // o Range é o trecho selecionado
  const trecho = selecao.getRangeAt(0);

  if (selecao.isCollapsed) {
    alternarProximasPalavras(nomeDaTag, trecho, selecao);
  } else {
    formatarTrechoSelecionado(nomeDaTag, trecho, selecao);
  }
}

botoes.forEach(function (botao) {

  // impede que clicar no botão faça a seleção desaparecer
  botao.addEventListener("mousedown", function (evento) {
    evento.preventDefault();
  });

  // quando clica, lê o comando e aplica a formatação
  botao.addEventListener("click", function () {
    const comando = botao.dataset.comando;       
    const nomeDaTag = tagsPorComando[comando];   
    aplicarFormatacao(nomeDaTag);
  });
});

// O preventDefault impede o navegador de usar o jeito dele de formatar, para usarmos o nosso.
areaTexto.addEventListener("keydown", function (evento) {

  // só nos interessa quando Ctrl está apertado
  if (evento.ctrlKey || evento.metaKey) {
    const tecla = evento.key.toLowerCase();

    if (tecla === "b") {
      evento.preventDefault();
      aplicarFormatacao("b");
    } else if (tecla === "i") {
      evento.preventDefault();
      aplicarFormatacao("i");
    } else if (tecla === "u") {
      evento.preventDefault();
      aplicarFormatacao("u");
    }
  }
});

// Fazer a mensagem de dica voltar
areaTexto.addEventListener("input", function () {

  const textoLimpo = areaTexto.textContent.replace(/\u200B/g, "").trim();

  if (textoLimpo === "") {
    areaTexto.innerHTML = "";
  }
});

document.addEventListener("selectionchange", function () {
  const selecao = window.getSelection();

  botoes.forEach(function (botao) {
    const nomeDaTag = tagsPorComando[botao.dataset.comando];
    let ativo = false;

    // se o cursor está na área de texto, vê se está dentro da tag
    if (selecao.rangeCount > 0 && areaTexto.contains(selecao.anchorNode)) {
      ativo = acharTagAcima(selecao.anchorNode, nomeDaTag) !== null;
    }

    // liga ou desliga a classe "ativo" no botão
    botao.classList.toggle("ativo", ativo);
  });
});