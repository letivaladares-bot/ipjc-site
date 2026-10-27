/* ==========================================================================
   IPJC v3 — Plano de leitura bíblica "Dia após dia" (Bíblia em 1 ano)
   Duas leituras por dia, em ordem:
   - Antigo Testamento (sem Salmos): 779 capítulos, 2 ou 3 por dia;
   - Novo Testamento intercalado com Salmos: 410 capítulos, 1 ou 2 por dia.
   O plano é calculado aqui (365 dias, de 1º/jan a 31/dez); 29/fev é um dia
   livre para colocar a leitura em dia. O progresso fica salvo no navegador.
   ========================================================================== */
(function () {
  'use strict';

  var AT = [['Gn',50],['Êx',40],['Lv',27],['Nm',36],['Dt',34],['Js',24],['Jz',21],['Rt',4],['1Sm',31],['2Sm',24],['1Rs',22],['2Rs',25],
    ['1Cr',29],['2Cr',36],['Ed',10],['Ne',13],['Et',10],['Jó',42],['Pv',31],['Ec',12],['Ct',8],['Is',66],['Jr',52],['Lm',5],['Ez',48],
    ['Dn',12],['Os',14],['Jl',3],['Am',9],['Ob',1],['Jn',4],['Mq',7],['Na',3],['Hc',3],['Sf',3],['Ag',2],['Zc',14],['Ml',4]];
  var NT = [['Mt',28],['Mc',16],['Lc',24],['Jo',21],['At',28],['Rm',16],['1Co',16],['2Co',13],['Gl',6],['Ef',6],['Fp',4],['Cl',4],
    ['1Ts',5],['2Ts',3],['1Tm',6],['2Tm',4],['Tt',3],['Fm',1],['Hb',13],['Tg',5],['1Pe',5],['2Pe',3],['1Jo',5],['2Jo',1],['3Jo',1],['Jd',1],['Ap',22]];
  var DIAS = 365;
  var MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var DIAS_MES = [31,28,31,30,31,30,31,31,30,31,30,31];

  function capitulos(livros) {
    var lista = [];
    livros.forEach(function (l) { for (var c = 1; c <= l[1]; c++) lista.push([l[0], c]); });
    return lista;
  }
  /* intercala duas listas proporcionalmente (NT e Salmos) */
  function intercalar(a, b) {
    var r = [], i = 0, j = 0, total = a.length + b.length;
    for (var k = 0; k < total; k++) {
      if (j < b.length && (i >= a.length || (j + 1) / b.length <= (i + 1) / a.length)) r.push(b[j++]);
      else r.push(a[i++]);
    }
    return r;
  }
  /* reparte a lista em 365 dias de forma uniforme */
  function repartir(lista) {
    var dias = [];
    for (var d = 0; d < DIAS; d++) dias.push(lista.slice(Math.round(d * lista.length / DIAS), Math.round((d + 1) * lista.length / DIAS)));
    return dias;
  }
  /* [['Gn',1],['Gn',2],['Sl',3]] → "Gn 1–2 · Sl 3" */
  function rotulo(caps) {
    var partes = [];
    caps.forEach(function (c) {
      var u = partes[partes.length - 1];
      if (u && u.livro === c[0] && u.fim === c[1] - 1) u.fim = c[1];
      else partes.push({ livro: c[0], ini: c[1], fim: c[1] });
    });
    return partes.map(function (p) { return p.livro + ' ' + p.ini + (p.fim > p.ini ? '–' + p.fim : ''); }).join('; ');
  }

  function gerarPlano() {
    var salmos = capitulos([['Sl', 150]]);
    var at = repartir(capitulos(AT));
    var nt = repartir(intercalar(capitulos(NT), salmos));
    var plano = [], d = 0;
    for (var m = 0; m < 12; m++) {
      for (var dia = 1; dia <= DIAS_MES[m]; dia++, d++) {
        plano.push({ n: d + 1, mes: m, dia: dia, at: rotulo(at[d]), nt: rotulo(nt[d]) });
      }
    }
    return plano;
  }

  window.IPJCPlano = { gerar: gerarPlano, MESES: MESES };

  /* ------------------------------------------------------------ Página
     Mostra a leitura do dia (atualiza sozinha pela data) e o plano completo
     para consulta. Não há marcação de leituras: sem conta de usuário, ela só
     valeria para um aparelho. */
  if (!window.IPJCSite) return;
  var S = window.IPJCSite;

  function diaDeHoje() {
    var h = new Date();
    if (h.getMonth() === 1 && h.getDate() === 29) return null;   // 29/fev: dia livre
    var n = h.getDate();
    for (var m = 0; m < h.getMonth(); m++) n += DIAS_MES[m];
    return n;   // 1..365
  }

  S.registrarPagina('plano-leitura', function () {
    var plano = gerarPlano();
    var hoje = diaDeHoje();

    document.getElementById('pl-meses').innerHTML = MESES.map(function (nome, m) {
      var dias = plano.filter(function (p) { return p.mes === m; });
      return '<details class="pl-mes"' + (hoje && plano[hoje - 1].mes === m ? ' open' : '') + '>' +
        '<summary><span class="pl-mes-nome">' + nome + '</span></summary>' +
        '<ol class="pl-dias">' + dias.map(function (p) {
          return '<li class="pl-dia' + (p.n === hoje ? ' is-hoje' : '') + '" id="dia-' + p.n + '">' +
            '<span class="pl-data">' + p.dia + '</span>' +
            '<span class="pl-leituras"><span>' + p.at + '</span><span>' + p.nt + '</span></span>' +
            (p.n === hoje ? '<span class="pl-tag-hoje">hoje</span>' : '') + '</li>';
        }).join('') + '</ol>' +
      '</details>';
    }).join('');

    var cartao = document.getElementById('pl-hoje');
    if (hoje) {
      var p = plano[hoje - 1];
      cartao.innerHTML =
        '<p class="eyebrow">Leitura de hoje · ' + p.dia + ' de ' + MESES[p.mes] + '</p>' +
        '<div class="pl-hoje-leituras"><div><small>Antigo Testamento</small><strong>' + p.at + '</strong></div>' +
        '<div><small>Novo Testamento</small><strong>' + p.nt + '</strong></div></div>';
    } else {
      cartao.innerHTML = '<p class="eyebrow">29 de fevereiro</p><p class="pl-livre">Dia livre! Aproveite para colocar a leitura em dia.</p>';
    }

    document.getElementById('pl-ir-hoje').addEventListener('click', function () {
      if (!hoje) return;
      var el = document.getElementById('dia-' + hoje);
      el.closest('details').open = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
})();
