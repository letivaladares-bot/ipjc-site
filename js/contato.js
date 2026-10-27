/* ==========================================================================
   IPJC v3 — Contato
   Abas (Fale conosco · Pedido de oração · Visitante), com #fale-conosco,
   #oracao e #visitante na URL. Envio por e-mail via FormSubmit (AJAX);
   se falhar, oferece o WhatsApp oficial.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var esc = S.esc;

  var ASSUNTOS = {
    fale: 'Site IPJC — Fale conosco',
    oracao: 'Site IPJC — Pedido de oração',
    visitante: 'Site IPJC — Novo visitante'
  };
  var SUCESSO = {
    fale: ['Mensagem enviada!', 'Obrigado por escrever. Vamos responder o quanto antes.'],
    oracao: ['Pedido recebido.', 'Estaremos orando por você. “Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.” — 1 Pedro 5.7'],
    visitante: ['Que bom ter você por perto!', 'Recebemos seus dados e em breve alguém da IPJC vai falar com você. Seja bem-vindo em nome de Jesus.']
  };

  /* ------------------------------------------------------------ Abas */
  function initAbas() {
    var abas = Array.prototype.slice.call(document.querySelectorAll('.aba'));
    function ativar(aba, foco, atualizarUrl) {
      abas.forEach(function (a) {
        var sel = a === aba;
        a.setAttribute('aria-selected', String(sel));
        a.tabIndex = sel ? 0 : -1;
        document.getElementById(a.getAttribute('aria-controls')).hidden = !sel;
      });
      if (foco) aba.focus();
      if (atualizarUrl) history.replaceState(null, '', '#' + aba.getAttribute('data-hash'));
    }
    abas.forEach(function (aba, i) {
      aba.addEventListener('click', function () { ativar(aba, false, true); });
      aba.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % abas.length;
        if (e.key === 'ArrowLeft') n = (i - 1 + abas.length) % abas.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = abas.length - 1;
        if (n !== null) { e.preventDefault(); ativar(abas[n], true, true); }
      });
    });
    var inicial = abas.filter(function (a) { return a.getAttribute('data-hash') === location.hash.slice(1); })[0];
    if (inicial) {
      ativar(inicial, false, false);
      setTimeout(function () { document.querySelector('.ct-forms').scrollIntoView({ block: 'start' }); }, 50);
    }
  }

  /* ------------------------------------------------------------ Validação */
  function mensagemErro(campo) {
    if (campo.validity.valueMissing) return campo.type === 'checkbox' ? 'É preciso marcar esta opção para enviar.' : 'Preencha este campo.';
    if (campo.validity.typeMismatch && campo.type === 'email') return 'Confira o e-mail (ex.: nome@email.com).';
    return '';
  }
  function marcar(campo) {
    var box = campo.closest('.campo, .campo-check');
    if (!box) return true;
    var msg = mensagemErro(campo);
    var el = box.querySelector('.campo-erro');
    box.classList.toggle('is-erro', !!msg);
    campo.setAttribute('aria-invalid', String(!!msg));
    if (msg && !el) { el = document.createElement('span'); el.className = 'campo-erro'; box.appendChild(el); }
    if (el) el.textContent = msg;
    return !msg;
  }
  function validar(form) {
    var campos = Array.prototype.slice.call(form.querySelectorAll('input, textarea, select')).filter(function (c) { return c.name && c.name !== '_honey'; });
    var primeiroInvalido = null;
    campos.forEach(function (c) { if (!marcar(c) && !primeiroInvalido) primeiroInvalido = c; });
    if (primeiroInvalido) primeiroInvalido.focus();
    return !primeiroInvalido;
  }

  /* ------------------------------------------------------------ Envio */
  function dadosDoForm(form) {
    var dados = {};
    new FormData(form).forEach(function (valor, nome) {
      if (nome === '_honey' || valor === '') return;
      dados[nome] = dados[nome] ? dados[nome] + '; ' + valor : valor;
    });
    return dados;
  }

  function sucesso(form, tipo) {
    var t = SUCESSO[tipo];
    var painel = form.parentNode;
    form.hidden = true;
    var box = document.createElement('div');
    box.className = 'form-sucesso';
    box.setAttribute('tabindex', '-1');
    box.innerHTML =
      '<span class="form-sucesso-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>' +
      '<h2>' + esc(t[0]) + '</h2><p>' + esc(t[1]) + '</p>' +
      '<button class="btn btn--ghost" type="button">Enviar outra mensagem</button>';
    painel.appendChild(box);
    box.focus();
    box.querySelector('button').addEventListener('click', function () {
      box.remove(); form.reset(); form.hidden = false;
      form.querySelector('.form-status').textContent = '';
      form.querySelector('input:not([type=hidden]):not(.campo-mel), textarea').focus();
    });
  }

  function falha(form, tipo) {
    var status = form.querySelector('.form-status');
    status.className = 'form-status is-erro';
    status.innerHTML = 'Não conseguimos enviar agora. Tente de novo em instantes ou <a href="' +
      S.linkWhats(D.contato.whatsapp) + '?text=' + encodeURIComponent('Olá! Tentei falar pelo site (' + ASSUNTOS[tipo].replace('Site IPJC — ', '') + ').') +
      '" target="_blank" rel="noopener">fale pelo WhatsApp</a>.';
  }

  function initForms() {
    Array.prototype.forEach.call(document.querySelectorAll('.form'), function (form) {
      var tipo = form.getAttribute('data-tipo');
      var botao = form.querySelector('button[type=submit]');
      var rotulo = botao.querySelector('.rotulo');
      var textoBotao = rotulo.textContent;

      /* tira o erro assim que a pessoa corrige */
      form.addEventListener('input', function (e) { if (e.target.closest('.is-erro')) marcar(e.target); });
      form.addEventListener('change', function (e) { if (e.target.closest('.is-erro')) marcar(e.target); });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validar(form)) return;

        /* armadilha para robôs: campo invisível preenchido = finge sucesso */
        if (form.querySelector('.campo-mel').value) { sucesso(form, tipo); return; }

        var destino = tipo === 'oracao' ? (D.contato.emailOracao || D.contato.email) : D.contato.email;
        var dados = dadosDoForm(form);
        dados._subject = ASSUNTOS[tipo];
        dados._template = 'table';
        dados._captcha = 'false';
        if (dados.email) dados._replyto = dados.email;

        botao.disabled = true;
        botao.classList.add('is-enviando');
        rotulo.textContent = 'Enviando…';
        var status = form.querySelector('.form-status');
        status.className = 'form-status'; status.textContent = '';

        fetch('https://formsubmit.co/ajax/' + String(destino).trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(dados)
        })
          .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
          .then(function (res) {
            if (res.ok && String(res.j.success) === 'true') sucesso(form, tipo);
            else falha(form, tipo);
          })
          .catch(function () { falha(form, tipo); })
          .then(function () {
            botao.disabled = false;
            botao.classList.remove('is-enviando');
            rotulo.textContent = textoBotao;
          });
      });
    });
  }

  /* ------------------------------------------------------------ Canais e mapa */
  function initCanais() {
    var w = document.getElementById('ct-whats');
    w.href = S.linkWhats(D.contato.whatsapp) + '?text=' + encodeURIComponent('Olá! Vim pelo site da IPJC.');
    w.target = '_blank'; w.rel = 'noopener';
    document.getElementById('ct-email').href = 'mailto:' + D.contato.email;

    var r = D.redes;
    document.getElementById('ct-redes').innerHTML = [
      ['instagram', 'Instagram', r.instagram], ['facebook', 'Facebook', r.facebook],
      ['youtube', 'YouTube', r.youtube], ['spotify', 'Spotify', r.spotify]
    ].filter(function (x) { return x[2] && x[2] !== '#'; }).map(function (x) {
      return '<a href="' + esc(x[2]) + '" target="_blank" rel="noopener" aria-label="' + x[1] + '">' + S.icon(x[0]) + '</a>';
    }).join('');

    var e = D.igreja.endereco;
    var end = e.rua + ', ' + e.bairro + ', ' + e.cidade + ' - ' + e.uf;
    document.getElementById('ct-endereco').textContent = end;
    document.getElementById('ct-mapa-links').innerHTML =
      '<a class="btn btn--ghost" href="' + esc(e.mapa) + '" target="_blank" rel="noopener">Google Maps</a>' +
      '<a class="btn btn--ghost" href="https://waze.com/ul?q=' + encodeURIComponent(end) + '&navigate=yes" target="_blank" rel="noopener">Waze</a>';
    document.getElementById('ct-mapa').innerHTML =
      '<iframe title="Mapa: IPJC, ' + esc(end) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + encodeURIComponent(end) + '&z=16&output=embed"></iframe>';
  }

  S.registrarPagina('contato', function () {
    initAbas();
    initForms();
    initCanais();
  });
})();
