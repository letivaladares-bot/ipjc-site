/* ==========================================================================
   IPJC v3 — Painel de administração (admin.html)

   Como funciona:
   - As alterações ficam salvas NESTE navegador (localStorage) e já aparecem no
     site quando aberto aqui, para conferência.
   - Para publicar para todos: Publicar → "Baixar conteudo.js" e substituir o
     arquivo js/conteudo.js na hospedagem.
   - Exportar/importar .json serve de backup ou para passar o trabalho a outra pessoa.

   Login: usuário e resumo SHA-256 da senha em js/admin-config.js. É uma porta de
   entrada simples (o site é estático); a segurança real é que só quem tem acesso
   à hospedagem consegue publicar.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var esc = S.esc;
  var CHAVE = window.IPJC_STORAGE_KEY;
  var SESSAO = 'ipjc-v3-admin-sessao';
  var COLECOES = window.IPJC_EDITAVEIS;   // ['programacoes', 'boletins', 'blog']

  /* ------------------------------------------------------------ Estado */
  var estado = {};
  COLECOES.forEach(function (c) { estado[c] = JSON.parse(JSON.stringify(D[c] || [])); });
  var publicado = window.IPJC_CONTEUDO || {};

  function salvarLocal() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
      return true;
    } catch (e) {
      toast('Não foi possível salvar: o armazenamento do navegador está cheio. Use links para as imagens em vez de enviar arquivos.', true);
      return false;
    }
  }
  function pendencias() {
    return COLECOES.filter(function (c) {
      return JSON.stringify(estado[c]) !== JSON.stringify(publicado[c] || []);
    });
  }

  /* ------------------------------------------------------------ Utilitários */
  function hoje() { return S.chaveData(S.hoje()); }
  function slug(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'item';
  }
  function idUnico(base, colecao, atual) {
    var id = base, n = 2;
    while (estado[colecao].some(function (x) { return x.id === id && x !== atual; })) id = base + '-' + n++;
    return id;
  }
  function baixar(nome, conteudo, tipo) {
    var url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    var a = document.createElement('a');
    a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
  var timerToast;
  function toast(msg, erro) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'adm-toast is-visivel' + (erro ? ' is-erro' : '');
    clearTimeout(timerToast);
    timerToast = setTimeout(function () { t.className = 'adm-toast'; }, erro ? 7000 : 3800);
  }
  function sha256(texto) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  /* Reduz a imagem enviada (JPEG) para caber no armazenamento do navegador */
  function reduzirImagem(arquivo, larguraMax, alturaMax) {
    return new Promise(function (ok, falha) {
      var leitor = new FileReader();
      leitor.onerror = falha;
      leitor.onload = function () {
        var img = new Image();
        img.onerror = falha;
        img.onload = function () {
          var r = Math.min(1, larguraMax / img.width, alturaMax / img.height);
          var cv = document.createElement('canvas');
          cv.width = Math.round(img.width * r); cv.height = Math.round(img.height * r);
          var ctx = cv.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
          ctx.drawImage(img, 0, 0, cv.width, cv.height);
          ok(cv.toDataURL('image/jpeg', 0.82));
        };
        img.src = leitor.result;
      };
      leitor.readAsDataURL(arquivo);
    });
  }

  /* ------------------------------------------------------------ Categorias agrupadas
     Um único campo com cada ministério/sociedade agrupado por categoria;
     o valor "categoria|slug" vira os campos categoria e ministerio. */
  function opcoesCategoria() {
    return D.categorias.map(function (c) {
      var mins = D.ministerios.filter(function (m) { return m.categoria === c.id; });
      if (!mins.length) return '<option value="' + c.id + '|">' + esc(c.nome) + '</option>';
      return '<optgroup label="' + esc(c.nome) + '">' +
        '<option value="' + c.id + '|">' + esc(c.nome) + ' (geral)</option>' +
        mins.map(function (m) { return '<option value="' + c.id + '|' + m.slug + '">' + esc(m.nome) + '</option>'; }).join('') +
      '</optgroup>';
    }).join('');
  }
  function nomeDoGrupo(item) {
    var m = item.ministerio && D.ministerios.filter(function (x) { return x.slug === item.ministerio; })[0];
    return m ? m.nome : (S.nomeCategoria(item.categoria) || 'Geral');
  }

  /* ------------------------------------------------------------ Definição das seções */
  var SECOES = {
    programacoes: {
      titulo: 'Programações', singular: 'programação', novo: 'Nova programação',
      dica: 'Eventos especiais. Programações com data passada saem do site automaticamente, mas continuam aqui.',
      campos: [
        { nome: 'titulo', rotulo: 'Título', tipo: 'text', obrig: true },
        { nome: '_grupo', rotulo: 'Categoria / ministério', tipo: 'grupo', obrig: true },
        { nome: 'data', rotulo: 'Data', tipo: 'date', obrig: true, meia: true },
        { nome: 'dataFim', rotulo: 'Data final', tipo: 'date', meia: true, ajuda: 'Só para eventos de mais de um dia.' },
        { nome: 'horario', rotulo: 'Horário', tipo: 'text', meia: true, dica: 'Ex.: 19h30 ou 9h e 18h30' },
        { nome: 'local', rotulo: 'Local', tipo: 'text', meia: true, dica: 'Ex.: Templo da IPJC' },
        { nome: 'endereco', rotulo: 'Endereço (para o mapa)', tipo: 'text', ajuda: 'Deixe em branco se for no templo: o mapa usa o endereço da igreja.' },
        { nome: 'descricao', rotulo: 'Descrição', tipo: 'textarea', linhas: 4 },
        { nome: 'inscricao', rotulo: 'Link de inscrição', tipo: 'url', meia: true, dica: 'https://…' },
        { nome: 'whatsapp', rotulo: 'WhatsApp de contato', tipo: 'tel', meia: true, ajuda: 'Em branco, usa o WhatsApp oficial da igreja.' },
        { nome: 'arte', rotulo: 'Arte oficial', tipo: 'imagem', largura: 1080, altura: 1080, ajuda: 'Quadrada, 1080×1080 px.' }
      ],
      ordenar: function (a, b) { return (b.data || '').localeCompare(a.data || ''); },
      resumo: function (e) {
        var passou = S.parseData(e.dataFim || e.data) < S.hoje();
        return {
          thumb: e.arte, titulo: e.titulo,
          meta: [e.data && S.dataLonga(e.data), e.horario, nomeDoGrupo(e)].filter(Boolean).join(' · '),
          chip: passou ? 'Já passou' : '', link: S.linkEvento(e)
        };
      },
      antesDeSalvar: function (item, form) {
        var g = (form.elements['_grupo'].value || 'geral|').split('|');
        item.categoria = g[0]; item.ministerio = g[1] || '';
        delete item._grupo;
        if (item.dataFim && item.dataFim < item.data) return 'A data final não pode ser antes da data de início.';
        if (!item.id) item.id = idUnico(slug(item.titulo + '-' + item.data), 'programacoes', item);
      },
      preencher: function (item, form) { form.elements['_grupo'].value = (item.categoria || 'geral') + '|' + (item.ministerio || ''); }
    },

    boletins: {
      titulo: 'Boletins', singular: 'boletim', novo: 'Novo boletim',
      dica: 'Um boletim por mês. A capa é a 1ª página do arquivo do Google Drive (ou a imagem enviada).',
      campos: [
        { nome: 'mes', rotulo: 'Mês', tipo: 'month', obrig: true, meia: true },
        { nome: 'titulo', rotulo: 'Título', tipo: 'text', meia: true, dica: 'Opcional — padrão: "Boletim de <mês>"' },
        { nome: 'arquivo', rotulo: 'Link do boletim (Google Drive)', tipo: 'url', obrig: true, ajuda: 'No Drive: Compartilhar → "Qualquer pessoa com o link" → Copiar link.' },
        { nome: 'resumo', rotulo: 'Resumo', tipo: 'textarea', linhas: 2 },
        { nome: 'capa', rotulo: 'Capa (opcional)', tipo: 'imagem', largura: 600, altura: 800, ajuda: 'Só se quiser trocar a capa automática. 600×800 px.' }
      ],
      ordenar: function (a, b) { return (b.mes || '').localeCompare(a.mes || ''); },
      resumo: function (b) {
        var p = String(b.mes || '').split('-');
        var nome = S.MESES_LONGOS[parseInt(p[1], 10) - 1] || '';
        var drive = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/.exec(b.arquivo || '');
        return {
          thumb: b.capa || (drive ? 'https://drive.google.com/thumbnail?id=' + drive[1] + '&sz=w200' : ''),
          titulo: b.titulo || 'Boletim de ' + nome,
          meta: nome.charAt(0).toUpperCase() + nome.slice(1) + ' de ' + p[0],
          link: b.arquivo
        };
      },
      antesDeSalvar: function (item) {
        if (estado.boletins.some(function (x) { return x.mes === item.mes && x.id !== item.id; })) return 'Já existe um boletim para este mês.';
        if (!item.id) item.id = 'boletim-' + item.mes;
      }
    },

    blog: {
      titulo: 'Blog', singular: 'texto', novo: 'Novo texto',
      dica: 'Use a barra acima do campo Texto para formatar (negrito, subtítulos, listas, destaques, fontes da identidade) e “Pré-visualizar” para ver como fica.',
      campos: [
        { nome: 'titulo', rotulo: 'Título', tipo: 'text', obrig: true },
        { nome: 'subtitulo', rotulo: 'Subtítulo', tipo: 'text' },
        { nome: 'autor', rotulo: 'Autor', tipo: 'text', meia: true },
        { nome: 'data', rotulo: 'Data', tipo: 'date', obrig: true, meia: true },
        { nome: 'tag', rotulo: 'Categoria', tipo: 'select', meia: true, obrig: true, opcoes: D.blogCategorias || [] },
        { nome: 'id', rotulo: 'Endereço do texto', tipo: 'text', meia: true, ajuda: 'Gerado a partir do título. post.html?p=…' },
        { nome: 'resumo', rotulo: 'Resumo', tipo: 'textarea', linhas: 2, ajuda: 'Aparece nos cards da lista.' },
        { nome: 'texto', rotulo: 'Texto', tipo: 'textarea', linhas: 16, obrig: true, editor: true },
        { nome: 'imagem', rotulo: 'Imagem de capa (opcional)', tipo: 'imagem', largura: 1600, altura: 900, ajuda: 'Horizontal, 1600×900 px. Sem imagem, o site cria uma capa na cor do tema.' }
      ],
      ordenar: function (a, b) { return (b.data || '').localeCompare(a.data || ''); },
      resumo: function (p) {
        return { thumb: p.imagem, titulo: p.titulo, meta: [p.data && S.dataLonga(p.data), p.autor, p.tag].filter(Boolean).join(' · '), link: 'post.html?p=' + encodeURIComponent(p.id) };
      },
      antesDeSalvar: function (item) {
        item.id = idUnico(slug(item.id || item.titulo), 'blog', item._original);
      }
    }
  };

  /* ------------------------------------------------------------ Login */
  function entrar() {
    document.getElementById('tela-login').hidden = true;
    document.getElementById('tela-app').hidden = false;
    abrirSecao(location.hash.slice(1) || 'programacoes');
    atualizarIndicadores();
  }
  function initLogin() {
    var form = document.getElementById('form-login');
    var erro = document.getElementById('login-erro');
    try { if (sessionStorage.getItem(SESSAO) === '1') return entrar(); } catch (e) { /* sem sessionStorage */ }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      erro.textContent = '';
      var cfg = window.IPJC_ADMIN || {};
      if (!window.crypto || !crypto.subtle) { erro.textContent = 'Abra o painel pelo endereço https:// do site.'; return; }
      sha256(form.senha.value).then(function (h) {
        if (form.usuario.value.trim() === cfg.usuario && h === cfg.senhaSha256) {
          try { sessionStorage.setItem(SESSAO, '1'); } catch (e2) { /* ok */ }
          form.reset();
          entrar();
        } else {
          erro.textContent = 'Usuário ou senha incorretos.';
          form.senha.value = ''; form.senha.focus();
        }
      });
    });
    document.getElementById('btn-sair').addEventListener('click', function () {
      try { sessionStorage.removeItem(SESSAO); } catch (e) { /* ok */ }
      location.hash = '';
      location.reload();
    });
  }

  /* ------------------------------------------------------------ Navegação */
  function abrirSecao(id) {
    if (!SECOES[id] && id !== 'publicar') id = 'programacoes';
    Array.prototype.forEach.call(document.querySelectorAll('.adm-nav-item'), function (b) {
      if (b.getAttribute('data-secao') === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    history.replaceState(null, '', '#' + id);
    if (id === 'publicar') renderPublicar(); else renderColecao(id);
    document.getElementById('adm-main').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  function atualizarIndicadores() {
    COLECOES.forEach(function (c) {
      var el = document.querySelector('[data-qtd="' + c + '"]');
      if (el) el.textContent = estado[c].length;
    });
    var p = pendencias();
    var badge = document.getElementById('badge-pendente');
    badge.hidden = !p.length;
    badge.textContent = 'Alterações não publicadas';
    badge.onclick = function () { abrirSecao('publicar'); };
  }

  /* ------------------------------------------------------------ Formulário genérico */
  function campoHtml(c) {
    var id = 'f-' + c.nome;
    var req = c.obrig ? ' required' : '';
    var rot = '<span>' + esc(c.rotulo) + (c.obrig ? ' <em>*</em>' : '') + '</span>';
    var ajuda = c.ajuda ? '<small class="adm-ajuda">' + esc(c.ajuda) + '</small>' : '';
    var classe = 'campo' + (c.meia ? ' campo--meia' : '');
    var dica = c.dica ? ' placeholder="' + esc(c.dica) + '"' : '';
    if (c.tipo === 'textarea' && c.editor) return '<div class="' + classe + ' adm-editor">' + '<label for="' + id + '">' + rot + '</label>' + barraEditor() +
      '<textarea id="' + id + '" name="' + c.nome + '" rows="' + (c.linhas || 4) + '"' + req + dica + '></textarea>' +
      '<div class="adm-previa post-texto" hidden></div>' + ajuda + '</div>';
    if (c.tipo === 'textarea') return '<label class="' + classe + '">' + rot + '<textarea id="' + id + '" name="' + c.nome + '" rows="' + (c.linhas || 4) + '"' + req + dica + '></textarea>' + ajuda + '</label>';
    if (c.tipo === 'select') return '<label class="' + classe + '">' + rot + '<select id="' + id + '" name="' + c.nome + '"' + req + '><option value="">Selecione</option>' +
      c.opcoes.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select>' + ajuda + '</label>';
    if (c.tipo === 'grupo') return '<label class="' + classe + '">' + rot + '<select id="' + id + '" name="_grupo"' + req + '>' + opcoesCategoria() + '</select>' + ajuda + '</label>';
    if (c.tipo === 'imagem') {
      return '<div class="campo campo-imagem" data-campo="' + c.nome + '" data-larg="' + c.largura + '" data-alt="' + c.altura + '">' + rot +
        '<div class="adm-img">' +
          '<div class="adm-img-previa" aria-hidden="true"></div>' +
          '<div class="adm-img-controles">' +
            '<input type="url" name="' + c.nome + '" id="' + id + '" placeholder="Cole o link da imagem (ex.: assets/img/eventos/arte.jpg)">' +
            '<div class="adm-img-botoes">' +
              '<label class="btn btn--ghost adm-btn-p">Enviar imagem<input type="file" accept="image/*" hidden></label>' +
              '<button type="button" class="adm-link-btn adm-img-remover">Remover</button>' +
            '</div>' + ajuda +
          '</div>' +
        '</div></div>';
    }
    var lista = c.lista ? ' list="' + c.lista + '"' : '';
    return '<label class="' + classe + '">' + rot + '<input type="' + c.tipo + '" id="' + id + '" name="' + c.nome + '"' + req + dica + lista + '>' + ajuda + '</label>';
  }

  /* ------------------------------------------------------------ Editor do blog
     Os botões só inserem marcações de texto (ver formatarTexto em site.js). */
  var EDITOR = [
    ['negrito', '<b>B</b>', 'Negrito'], ['italico', '<i>I</i>', 'Itálico'], ['marca', '<span class="ed-marca">M</span>', 'Marca-texto'],
    '|', ['h2', 'Subtítulo', 'Subtítulo'], ['h3', 'Título menor', 'Título menor'],
    '|', ['lista', '• Lista', 'Lista com marcadores'], ['numerada', '1. Lista', 'Lista numerada'], ['citacao', '“ Citação', 'Citação'],
    ['destaque', 'Destaque', 'Caixa de destaque'], ['centro', 'Centralizar', 'Centralizar parágrafo'],
    '|', ['espaco', '↕ Espaço', 'Espaço extra'], ['separador', '〰 Separador', 'Linha de separação (ondas)'], ['link', 'Link', 'Inserir link']
  ];
  function barraEditor() {
    return '<div class="adm-barra" role="toolbar" aria-label="Formatação do texto">' +
      EDITOR.map(function (b) {
        return b === '|' ? '<span class="adm-barra-sep" aria-hidden="true"></span>'
          : '<button type="button" data-ed="' + b[0] + '" title="' + b[2] + '" aria-label="' + b[2] + '">' + b[1] + '</button>';
      }).join('') +
      '<label class="adm-barra-fonte">Fonte <select data-ed-fonte aria-label="Fonte do trecho selecionado">' +
        '<option value="">Escolher…</option><option value="serif">Source Serif 4 (serifada)</option><option value="sans">Poppins (sem serifa)</option><option value="manuscrita">Caveat (manuscrita)</option>' +
      '</select></label>' +
      '<button type="button" class="adm-barra-previa" data-ed="previa" aria-pressed="false">Pré-visualizar</button>' +
    '</div>';
  }
  function editorAcao(ta, acao, valor) {
    var v = ta.value, ini = ta.selectionStart, fim = ta.selectionEnd, sel = v.slice(ini, fim);
    function trocar(a, b, texto, selIni, selFim) {
      ta.value = v.slice(0, a) + texto + v.slice(b);
      ta.focus(); ta.setSelectionRange(a + selIni, a + (selFim === undefined ? selIni : selFim));
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function envolver(antes, depois, padrao) {
      var t = sel || padrao;
      trocar(ini, fim, antes + t + depois, antes.length, antes.length + t.length);
    }
    /* blocos: estende a seleção às linhas inteiras e garante linha em branco ao redor */
    function bloco(fn, padrao) {
      var a = v.lastIndexOf('\n', ini - 1) + 1, b = v.indexOf('\n', fim); if (b < 0) b = v.length;
      var miolo = v.slice(a, b) || padrao;
      var novo = fn(miolo);
      var antes = a > 0 && v.slice(0, a).slice(-2) !== '\n\n' ? (v[a - 1] === '\n' ? '\n' : '\n\n') : '';
      var depois = b < v.length && v.slice(b, b + 2) !== '\n\n' ? (v[b] === '\n' ? '\n' : '\n\n') : '';
      trocar(a, b, antes + novo + depois, antes.length, antes.length + novo.length);
    }
    function porLinha(prefixo) {
      return function (m) { return m.split('\n').map(function (l, i) { return (typeof prefixo === 'function' ? prefixo(i) : prefixo) + l.replace(/^(\d+[.)]|[-•>]|#{2,3})\s*/, ''); }).join('\n'); };
    }
    /* insere um bloco novo depois da linha atual, sem apagar nada */
    function inserir(texto) {
      var b = v.indexOf('\n', fim); if (b < 0) b = v.length;
      var antes = b === 0 ? '' : (v.slice(0, b).slice(-1) === '\n' ? '\n' : '\n\n');
      var depois = b < v.length ? (v.slice(b, b + 2) === '\n\n' ? '' : '\n') : '';
      trocar(b, b, antes + texto + depois, antes.length + texto.length);
    }
    switch (acao) {
      case 'negrito': return envolver('**', '**', 'texto em negrito');
      case 'italico': return envolver('*', '*', 'texto em itálico');
      case 'marca': return envolver('==', '==', 'trecho marcado');
      case 'fonte': return envolver('{' + valor + '}', '{/' + valor + '}', 'texto');
      case 'h2': return bloco(porLinha('## '), 'Subtítulo');
      case 'h3': return bloco(porLinha('### '), 'Título menor');
      case 'lista': return bloco(porLinha('- '), 'Item');
      case 'numerada': return bloco(porLinha(function (i) { return (i + 1) + '. '; }), 'Item');
      case 'citacao': return bloco(porLinha('> '), 'Citação');
      case 'destaque': return bloco(function (m) { return '[destaque] ' + m.replace(/^\[destaque\]\s*/i, ''); }, 'Texto em destaque');
      case 'centro': return bloco(function (m) { return '[centro] ' + m.replace(/^\[centro\]\s*/i, ''); }, 'Texto centralizado');
      case 'espaco': return inserir('[espaço]');
      case 'separador': return inserir('---');
      case 'link':
        var url = window.prompt('Endereço do link (começando com https://):', 'https://');
        if (!url || !/^https?:\/\/\S+$/.test(url.trim())) return;
        return envolver('[', '](' + url.trim() + ')', 'texto do link');
    }
  }
  function sairPrevia(form) {
    if (!form) return;
    Array.prototype.forEach.call(form.querySelectorAll('.adm-editor.is-previa [data-ed="previa"]'), function (b) { b.click(); });
  }
  function initEditor() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.adm-editor [data-ed]');
      if (!btn) return;
      var caixa = btn.closest('.adm-editor'), ta = caixa.querySelector('textarea'), previa = caixa.querySelector('.adm-previa');
      if (btn.getAttribute('data-ed') === 'previa') {
        var abrir = previa.hidden;
        if (abrir) previa.innerHTML = S.formatarTexto(ta.value) || '<p class="adm-ajuda">Nada para mostrar ainda.</p>';
        previa.hidden = !abrir; ta.hidden = abrir;
        btn.setAttribute('aria-pressed', String(abrir)); btn.textContent = abrir ? 'Voltar a editar' : 'Pré-visualizar';
        caixa.classList.toggle('is-previa', abrir);
        return;
      }
      if (ta.hidden) return;
      editorAcao(ta, btn.getAttribute('data-ed'));
    });
    document.addEventListener('change', function (e) {
      if (!e.target.matches('.adm-editor [data-ed-fonte]') || !e.target.value) return;
      var ta = e.target.closest('.adm-editor').querySelector('textarea');
      if (!ta.hidden) editorAcao(ta, 'fonte', e.target.value);
      e.target.value = '';
    });
    document.addEventListener('keydown', function (e) {
      if (!(e.ctrlKey || e.metaKey) || !e.target.matches('.adm-editor textarea')) return;
      var k = e.key.toLowerCase();
      if (k === 'b' || k === 'i') { e.preventDefault(); editorAcao(e.target, k === 'b' ? 'negrito' : 'italico'); }
    });
  }

  function previaImagem(box) {
    var input = box.querySelector('input[type=url]');
    var previa = box.querySelector('.adm-img-previa');
    var v = input.value.trim();
    previa.style.backgroundImage = v ? 'url("' + v.replace(/"/g, '%22') + '")' : '';
    previa.classList.toggle('is-vazia', !v);
    /* imagem enviada (data URL): mostra só um rótulo no campo */
    input.classList.toggle('is-arquivo', /^data:image/.test(v));
  }

  /* ------------------------------------------------------------ Seção de coleção */
  var editando = null;   // item em edição

  function renderColecao(id) {
    var sec = SECOES[id];
    editando = null;
    var main = document.getElementById('adm-main');
    main.innerHTML =
      '<div class="adm-cabecalho"><div><h1>' + sec.titulo + '</h1><p>' + esc(sec.dica) + '</p></div></div>' +
      '<div class="adm-colunas">' +
        '<section class="adm-card adm-form-card" aria-labelledby="form-titulo">' +
          '<h2 id="form-titulo">' + sec.novo + '</h2>' +
          '<form class="adm-form" id="adm-form" novalidate>' +
            sec.campos.map(campoHtml).join('') +
            '<div class="adm-form-acoes">' +
              '<button class="btn" type="submit" id="btn-salvar">Salvar</button>' +
              '<button class="btn btn--ghost" type="button" id="btn-cancelar" hidden>Cancelar edição</button>' +
            '</div>' +
          '</form>' +
        '</section>' +
        '<section class="adm-card adm-lista-card" aria-labelledby="lista-titulo">' +
          '<div class="adm-lista-topo"><h2 id="lista-titulo">Cadastrados</h2>' +
            '<input type="search" id="adm-busca" placeholder="Buscar…" aria-label="Buscar em ' + sec.titulo + '"></div>' +
          '<ul class="adm-lista" id="adm-lista"></ul>' +
        '</section>' +
      '</div>' +
      '';

    var form = document.getElementById('adm-form');
    novoItem(id, form);

    /* imagens: link, envio de arquivo e remoção */
    Array.prototype.forEach.call(form.querySelectorAll('.campo-imagem'), function (box) {
      var input = box.querySelector('input[type=url]');
      input.addEventListener('input', function () { previaImagem(box); });
      box.querySelector('input[type=file]').addEventListener('change', function () {
        var arq = this.files[0];
        if (!arq) return;
        reduzirImagem(arq, +box.getAttribute('data-larg'), +box.getAttribute('data-alt')).then(function (dataUrl) {
          input.value = dataUrl; previaImagem(box);
          var kb = Math.round(dataUrl.length * 0.75 / 1024);
          toast('Imagem pronta (' + kb + ' KB). Lembre-se de salvar.');
        }).catch(function () { toast('Não consegui ler essa imagem.', true); });
        this.value = '';
      });
      box.querySelector('.adm-img-remover').addEventListener('click', function () { input.value = ''; previaImagem(box); });
    });

    /* endereço do post acompanha o título enquanto não for editado à mão */
    if (id === 'blog') {
      var campoTitulo = form.elements['titulo'], campoId = form.elements['id'];
      campoTitulo.addEventListener('input', function () { if (!campoId.dataset.manual && !editando) campoId.value = slug(campoTitulo.value); });
      campoId.addEventListener('input', function () { campoId.dataset.manual = '1'; });
    }

    form.addEventListener('submit', function (e) { e.preventDefault(); salvar(id, form); });
    document.getElementById('btn-cancelar').addEventListener('click', function () { novoItem(id, form); renderLista(id); });
    document.getElementById('adm-busca').addEventListener('input', function () { renderLista(id); });
    renderLista(id);
  }

  function novoItem(id, form) {
    editando = null;
    form.reset();
    sairPrevia(form);
    var campoId = form.elements['id'];
    if (campoId) delete campoId.dataset.manual;
    var campoData = form.elements['data'];
    if (campoData && !campoData.value && id !== 'programacoes') campoData.value = hoje();
    Array.prototype.forEach.call(form.querySelectorAll('.campo-imagem'), previaImagem);
    Array.prototype.forEach.call(form.querySelectorAll('.is-erro'), function (x) { x.classList.remove('is-erro'); });
    document.getElementById('form-titulo').textContent = SECOES[id].novo;
    document.getElementById('btn-salvar').textContent = 'Salvar';
    document.getElementById('btn-cancelar').hidden = true;
    form.closest('.adm-form-card').classList.remove('is-editando');
  }

  function editar(id, item) {
    sairPrevia(document.getElementById('adm-form'));
    var sec = SECOES[id];
    var form = document.getElementById('adm-form');
    novoItem(id, form);
    editando = item;
    sec.campos.forEach(function (c) {
      if (c.tipo === 'grupo') return;
      var el = form.elements[c.nome];
      if (el) el.value = item[c.nome] || '';
    });
    if (sec.preencher) sec.preencher(item, form);
    if (form.elements['id']) form.elements['id'].dataset.manual = '1';
    Array.prototype.forEach.call(form.querySelectorAll('.campo-imagem'), previaImagem);
    document.getElementById('form-titulo').textContent = 'Editando ' + sec.singular;
    document.getElementById('btn-salvar').textContent = 'Atualizar';
    document.getElementById('btn-cancelar').hidden = false;
    form.closest('.adm-form-card').classList.add('is-editando');
    renderLista(id);
    form.closest('.adm-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.querySelector('input, select, textarea').focus({ preventScroll: true });
  }

  function salvar(id, form) {
    var sec = SECOES[id];
    /* obrigatórios */
    var faltando = null;
    sec.campos.forEach(function (c) {
      var el = form.elements[c.tipo === 'grupo' ? '_grupo' : c.nome];
      var box = el && el.closest('.campo');
      var vazio = c.obrig && !String(el.value).trim();
      var urlRuim = c.tipo === 'url' && el.value.trim() && !/^(https?:\/\/|assets\/|\.?\/)/i.test(el.value.trim());
      if (box) box.classList.toggle('is-erro', vazio || urlRuim);
      if ((vazio || urlRuim) && !faltando) faltando = el;
    });
    if (faltando) { faltando.focus(); toast('Confira os campos destacados.', true); return; }

    var item = editando ? JSON.parse(JSON.stringify(editando)) : {};
    item._original = editando;
    sec.campos.forEach(function (c) {
      if (c.tipo === 'grupo') return;
      item[c.nome] = String(form.elements[c.nome].value || '').trim();
    });
    if (id === 'programacoes') item._grupo = form.elements['_grupo'].value;
    var problema = sec.antesDeSalvar(item, form);
    delete item._original;
    if (problema) { toast(problema, true); return; }

    if (editando) estado[id][estado[id].indexOf(editando)] = item;
    else estado[id].push(item);
    estado[id].sort(sec.ordenar);

    if (!salvarLocal()) return;
    toast(editando ? 'Atualizado. Já aparece no site neste navegador.' : 'Salvo. Já aparece no site neste navegador.');
    novoItem(id, form);
    renderLista(id, item);
    atualizarIndicadores();
  }

  function renderLista(id, destaque) {
    var sec = SECOES[id];
    var ul = document.getElementById('adm-lista');
    var q = (document.getElementById('adm-busca').value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    var itens = estado[id].slice().sort(sec.ordenar).filter(function (it) {
      return !q || JSON.stringify(it).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').indexOf(q) > -1;
    });
    if (!itens.length) {
      ul.innerHTML = '<li class="adm-vazio">' + (q ? 'Nada encontrado.' : 'Nenhum item cadastrado ainda. Use o formulário ao lado.') + '</li>';
      return;
    }
    ul.innerHTML = itens.map(function (it) {
      var r = sec.resumo(it);
      var i = estado[id].indexOf(it);
      return '<li class="adm-item' + (it === editando ? ' is-editando' : '') + (it === destaque ? ' is-novo' : '') + '">' +
        '<span class="adm-thumb"' + (r.thumb ? ' style="background-image:url(&quot;' + esc(r.thumb) + '&quot;)"' : '') + ' aria-hidden="true"></span>' +
        '<span class="adm-item-texto"><strong>' + esc(r.titulo) + '</strong><small>' + esc(r.meta) + '</small>' +
          (r.chip ? '<span class="adm-chip">' + esc(r.chip) + '</span>' : '') + '</span>' +
        '<span class="adm-item-acoes">' +
          (r.link ? '<a class="adm-link-btn" href="' + esc(r.link) + '" target="_blank" rel="noopener" title="Ver no site">Ver ↗</a>' : '') +
          '<button class="adm-link-btn" type="button" data-editar="' + i + '">Editar</button>' +
          '<button class="adm-link-btn adm-excluir" type="button" data-excluir="' + i + '">Excluir</button>' +
        '</span>' +
      '</li>';
    }).join('');

    ul.onclick = function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-editar')) editar(id, estado[id][+b.getAttribute('data-editar')]);
      if (b.hasAttribute('data-excluir')) {
        var it = estado[id][+b.getAttribute('data-excluir')];
        if (!window.confirm('Excluir "' + sec.resumo(it).titulo + '"? Essa ação não pode ser desfeita.')) return;
        estado[id].splice(estado[id].indexOf(it), 1);
        if (it === editando) novoItem(id, document.getElementById('adm-form'));
        salvarLocal();
        toast('Excluído.');
        renderLista(id);
        atualizarIndicadores();
      }
    };
  }

  /* ------------------------------------------------------------ Publicar */
  function gerarConteudoJs() {
    var dados = { atualizadoEm: hoje() };
    COLECOES.forEach(function (c) { dados[c] = estado[c]; });
    return '/* ==========================================================================\n' +
      '   IPJC v3 — Conteúdo publicado (programações, boletins e blog)\n' +
      '   Este arquivo é GERADO pelo painel admin (admin.html → Publicar → "Baixar conteudo.js").\n' +
      '   Para publicar, substitua este arquivo na hospedagem pelo novo.\n' +
      '   ========================================================================== */\n' +
      'window.IPJC_CONTEUDO = ' + JSON.stringify(dados, null, 2) + ';\n';
  }

  function renderPublicar() {
    var p = pendencias();
    var tamanho = 0;
    try { tamanho = (localStorage.getItem(CHAVE) || '').length; } catch (e) { /* ok */ }
    var main = document.getElementById('adm-main');
    main.innerHTML =
      '<div class="adm-cabecalho"><div><h1>Publicar</h1><p>Leve as alterações deste navegador para o site de todos.</p></div></div>' +

      '<section class="adm-card adm-publicar">' +
        '<div class="adm-status ' + (p.length ? 'is-pendente' : 'is-ok') + '">' +
          (p.length
            ? '<strong>Há alterações não publicadas</strong><span>Em: ' + p.map(function (c) { return SECOES[c].titulo; }).join(', ') + '.</span>'
            : '<strong>Tudo publicado</strong><span>O conteúdo deste navegador é igual ao publicado (' + esc(publicado.atualizadoEm ? S.dataLonga(publicado.atualizadoEm) : 'sem data') + ').</span>') +
        '</div>' +
        '<ol class="adm-passos">' +
          '<li><strong>Baixe o arquivo</strong> com todo o conteúdo atual.<br><button class="btn" type="button" id="btn-conteudo">Baixar conteudo.js</button></li>' +
          '<li><strong>Substitua</strong> o arquivo <code>js/conteudo.js</code> na hospedagem do site pelo arquivo baixado.</li>' +
          '<li><strong>Confira</strong> o site em outro aparelho (ou numa janela anônima).</li>' +
        '</ol>' +
      '</section>' +

      '<div class="adm-colunas adm-colunas--iguais">' +
        '<section class="adm-card">' +
          '<h2>Backup</h2>' +
          '<p class="adm-texto">Exporte um arquivo .json para guardar uma cópia ou passar o trabalho para outra pessoa, que pode importá-lo no painel dela.</p>' +
          '<div class="adm-botoes">' +
            '<button class="btn btn--ghost" type="button" id="btn-exportar">Exportar .json</button>' +
            '<label class="btn btn--ghost">Importar .json<input type="file" accept="application/json,.json" id="inp-importar" hidden></label>' +
          '</div>' +
          '<p class="adm-texto adm-pequeno">Armazenamento usado neste navegador: ' + Math.round(tamanho / 1024) + ' KB (limite aproximado: 5.000 KB).</p>' +
        '</section>' +
        '<section class="adm-card">' +
          '<h2>Descartar alterações</h2>' +
          '<p class="adm-texto">Volta este navegador para o conteúdo publicado no site. Alterações não publicadas serão perdidas.</p>' +
          '<button class="btn btn--ghost adm-perigo" type="button" id="btn-descartar"' + (p.length ? '' : ' disabled') + '>Descartar alterações</button>' +
        '</section>' +
      '</div>' +

      '<section class="adm-card">' +
        '<h2>Trocar senha</h2>' +
        '<p class="adm-texto">Gera um novo arquivo <code>js/admin-config.js</code>. Substitua-o na hospedagem para a nova senha valer.</p>' +
        '<form class="adm-form adm-form--linha" id="form-senha" novalidate>' +
          '<label class="campo campo--meia"><span>Usuário</span><input name="usuario" value="' + esc((window.IPJC_ADMIN || {}).usuario || '') + '" required autocomplete="username"></label>' +
          '<label class="campo campo--meia"><span>Nova senha</span><input type="password" name="senha" required minlength="8" autocomplete="new-password"></label>' +
          '<label class="campo campo--meia"><span>Repita a senha</span><input type="password" name="senha2" required autocomplete="new-password"></label>' +
          '<div class="adm-form-acoes"><button class="btn btn--ghost" type="submit">Gerar admin-config.js</button></div>' +
        '</form>' +
      '</section>';

    document.getElementById('btn-conteudo').addEventListener('click', function () {
      baixar('conteudo.js', gerarConteudoJs(), 'text/javascript;charset=utf-8');
      toast('Arquivo baixado. Agora substitua js/conteudo.js na hospedagem.');
    });
    document.getElementById('btn-exportar').addEventListener('click', function () {
      var dados = { exportadoEm: new Date().toISOString() };
      COLECOES.forEach(function (c) { dados[c] = estado[c]; });
      baixar('ipjc-conteudo-' + hoje() + '.json', JSON.stringify(dados, null, 2), 'application/json');
    });
    document.getElementById('inp-importar').addEventListener('change', function () {
      var arq = this.files[0];
      this.value = '';
      if (!arq) return;
      arq.text().then(function (txt) {
        var dados = JSON.parse(txt);
        var validas = COLECOES.filter(function (c) { return Array.isArray(dados[c]); });
        if (!validas.length) throw new Error('formato');
        var resumo = validas.map(function (c) { return dados[c].length + ' em ' + SECOES[c].titulo; }).join(', ');
        if (!window.confirm('Importar ' + resumo + '? Isso substitui o conteúdo atual deste navegador.')) return;
        validas.forEach(function (c) { estado[c] = dados[c]; });
        salvarLocal(); atualizarIndicadores(); renderPublicar();
        toast('Importado: ' + resumo + '.');
      }).catch(function () { toast('Arquivo inválido. Use um .json exportado por este painel.', true); });
    });
    document.getElementById('btn-descartar').addEventListener('click', function () {
      if (!window.confirm('Descartar todas as alterações não publicadas deste navegador?')) return;
      try { localStorage.removeItem(CHAVE); } catch (e) { /* ok */ }
      COLECOES.forEach(function (c) { estado[c] = JSON.parse(JSON.stringify(publicado[c] || [])); });
      atualizarIndicadores(); renderPublicar();
      toast('Alterações descartadas.');
    });
    document.getElementById('form-senha').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = this;
      if (f.senha.value.length < 8) { toast('Use uma senha com pelo menos 8 caracteres.', true); return; }
      if (f.senha.value !== f.senha2.value) { toast('As senhas não conferem.', true); return; }
      sha256(f.senha.value).then(function (h) {
        baixar('admin-config.js',
          '/* IPJC v3 — Acesso ao painel. A senha não fica escrita aqui: só o seu resumo SHA-256. */\n' +
          'window.IPJC_ADMIN = {\n  usuario: ' + JSON.stringify(f.usuario.value.trim()) + ',\n  senhaSha256: \'' + h + '\'\n};\n',
          'text/javascript;charset=utf-8');
        f.reset();
        toast('admin-config.js gerado. Substitua o arquivo na hospedagem.');
      });
    });
  }

  /* ------------------------------------------------------------ Início */
  S.registrarPagina('admin', function () {
    document.getElementById('adm-main').setAttribute('tabindex', '-1');
    Array.prototype.forEach.call(document.querySelectorAll('.adm-nav-item'), function (b) {
      b.addEventListener('click', function () { abrirSecao(b.getAttribute('data-secao')); });
    });
    window.addEventListener('beforeunload', function (e) {
      var form = document.getElementById('adm-form');
      if (editando && form) { e.preventDefault(); e.returnValue = ''; }
    });
    initEditor();
    initLogin();
  });
})();
