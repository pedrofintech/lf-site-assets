# LF kit

Estilos prontos para ferramentas embebidas no Webflow: calculadoras, comparadores, simuladores. Uma ferramenta feita com o kit fica igual às calculadoras live, sem CSS próprio para botões, campos, cartões, tabelas ou gráficos. Cada medida vem das classes do Webflow (form_input, form_label, button, table-results_wrapper, graph_wrapper, resultados_component, help-text_wrapper, badge) e das tabelas das calculadoras, e usa as cores de cada site. A tipografia (tamanhos, alturas de linha, tracking) é fixa e igual nos cinco, com os valores da Literacia, mesmo que as variáveis do Webflow difiram entre sites.

Funciona nos cinco sites (Literacia, EUPF, BrokerMatch, Rahatarkus, Educação Financeira). As cores vêm das variáveis do Webflow de cada site, por isso o botão principal sai laranja na Literacia, verde na Educação Financeira e azul no Rahatarkus, com o mesmo código.

**Para o Claude:** as instruções completas estão em [`CLAUDE.md`](CLAUDE.md). Num pedido novo basta escrever: "Lê o kit/CLAUDE.md do repo pedrofintech/lf-site-assets e usa o kit."

Para ver todas as peças: https://htmlpreview.github.io/?https://github.com/pedrofintech/lf-site-assets/blob/main/kit/demo.html. Localmente: `python3 kit/serve.py` e abrir http://localhost:4321/demo.html (não abre bem com duplo clique). A demo carrega o CSS real do Webflow do site escolhido no seletor, por isso as letras, cores e tamanhos são os do site.

## Como usar

No custom code da página (ou num embed), com o commit fixo:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/pedrofintech/lf-site-assets@63c25df227931cfeb49da2121df5719c1107cc46/kit/lf-kit.css">
<!-- listas (dropdown igual ao das calculadoras), gráficos, separadores e tabelas; carrega o Chart.js 4.5.1 só se houver gráficos -->
<script src="https://cdn.jsdelivr.net/gh/pedrofintech/lf-site-assets@63c25df227931cfeb49da2121df5719c1107cc46/kit/lf-kit.js"></script>
```

E a ferramenta toda dentro de `<div class="lfk">`. Fora desse div o kit não mexe em nada.

## Regras para o Claude

Resumo (as regras completas estão no `CLAUDE.md`):

> Usa o LF kit (`kit/lf-kit.css` do repo pedrofintech/lf-site-assets; exemplos em `kit/demo.html`). Tudo dentro de `<div class="lfk">`. Usa só as classes `lfk-*` do kit para texto, botões, campos, cartões, tabelas, etiquetas e avisos. Não escrevas CSS para cores, letras, bordas ou cantos: se faltar uma peça, junta só o mínimo num `<style>` com prefixo próprio e usa as variáveis do kit (`var(--lfk-brand)`, `var(--lfk-text)`, `var(--lfk-border-2)`, etc.), nunca cores em hexadecimal. Números com `class="lfk-num"` ou `is-num` nas tabelas, sempre escritos com `LFK.fmt` (formato do país de cada site) e lidos com `LFK.num`. Resultados só ao clicar em Calcular, com `LFK.calc`. Listas são `<select class="lfk-input">` (o `lf-kit.js` transforma-as no dropdown das calculadoras e mantém o `<select>` sincronizado). Gráficos só com `lf-kit.js` (`LFK.bar`, `LFK.line`, `LFK.donut`), dentro de um `lfk-card` com separadores Gráfico/Tabela. Botões são `<button>`, campos têm `<label for>`. Testa a 375 px de largura e num ecrã com 650 px de altura.

## Peças

| Peça | Classes |
|---|---|
| Títulos e texto | `lfk-title`, `lfk-h`, `lfk-h-sm`, `lfk-eyebrow`, `lfk-lead`, `lfk-text`, `lfk-small`, `lfk-xs`, `lfk-muted`, `lfk-strong`, `lfk-pos`, `lfk-neg`, `lfk-link` |
| Disposição | `lfk-stack` (`is-sm`, `is-lg`), `lfk-row` (`is-between`), `lfk-grid` (`is-2`, `is-3`), `lfk-divider`, `lfk-or` |
| Cartões | `lfk-card` (`is-soft`, `is-brand`, `is-sm`), `lfk-card-head` |
| Cartões do design system (Figma) | `lfk-post` (artigo do blog; `is-dark`; com `lfk-author`), `lfk-entity` (logotipo + texto), `lfk-feature` (ícone + texto ou lista `lfk-checks`), `lfk-calc-card` (link para uma calculadora), `lfk-price` (`is-highlight`), `lfk-datacard` (valor com variação; `is-pos` / `is-neg`), `lfk-resource` (imagem com título) e `lfk-resource-row` (versão longa), `lfk-team`, `lfk-cookies`. Exemplos de HTML em `demo.html`, secção Cartões |
| Do design system (Figma), por página | **badges**: `lfk-tag` (`is-on-dark`; `is-sm is-ok` = "Novo"). **banner**: `lfk-partner` (`is-bar` = faixa dos artigos). **checkbox**: `lfk-check` / `lfk-radio` (`is-sm`; texto de apoio em `<small>`), `lfk-check-list` + `lfk-clear`. **toggles**: `lfk-switch`, `lfk-segment` (`is-sm`). **inputs**: `lfk-field` + `lfk-input` (`is-sm`, `textarea`, `is-error` no campo, `is-on-dark`). **dropdowns**: `<select class="lfk-input">` (`is-sm`). **table**: `lfk-table` (`is-dark` nos artigos, linha `is-on`, `lfk-cell-help`). **table of contents**: `lfk-toc` + `lfk-toc-item` (`data-lfk-spy` marca a secção no ecrã). **tabs**: `lfk-toggle` + `lfk-tab` (`is-input`, `is-cat` com `is-ok` / `is-warn` / `is-err`). **toast**: `lfk-toast` (`is-ok`, `is-warn`, `is-err`). **tooltip**: `lfk-help-wrap` (`is-bottom`, `is-left`, `is-right`; título em `lfk-help-title`) |
| Botões (design system do Figma) | `lfk-btn`: tipos `is-dark`, `is-secondary`, `is-on-dark` (em fundo escuro), `is-ghost`; tamanhos `is-sm` (36px), normal (40px), `is-lg` (46px); `is-block`; `disabled`. Só ícone: `is-icon` (redondo 24/28/32px; com `is-secondary` fica quadrado). Seta: `<span class="lfk-ico-arrow"></span>`. Link com seta: `lfk-link-btn` (`is-secondary`, `is-lg`). Rede social: `lfk-social is-linkedin`. Ícones em `kit/icons/` |
| Campos | `lfk-field` (`is-error`), `lfk-label`, `lfk-input` (também em `<select>` e `<textarea>`), `lfk-input-wrap` + `lfk-unit`, `lfk-hint`, `lfk-error`, `lfk-help` |
| Escolhas | `lfk-radios` + `lfk-radio` (`<label><input type="radio"> <span>..</span></label>`), `lfk-check` (`<label><input type="checkbox"> <span>..</span></label>`), `lfk-toggle` (`is-fill`) + `lfk-tab` (`is-active`, igual aos botões Gráfico/Tabela), `lfk-chips` + `lfk-chip` (`is-on`), `lfk-range` |
| Resultados | `lfk-stat` (`lfk-stat-l`, `lfk-stat-v`, `lfk-stat-s`; `is-sm`, `is-brand`), `lfk-kpis`, `lfk-kv` (`is-total`), `lfk-summary`, `lfk-table-wrap` + `lfk-table` (`is-num`, linha `is-on`) |
| Gráficos | `lfk-chart` (`is-sm`) com `<canvas>`, `lfk-chart-head`, `lfk-donut` + `lfk-donut-center` (`lfk-donut-value`, `lfk-donut-label`), `lfk-legend` + `lfk-legend-item` (`lfk-legend-name`, `lfk-legend-dot`, `lfk-legend-val`), `[data-lfk-tab]` / `[data-lfk-view]`, `lfk-menu` (Descarregar gráfico / Descarregar tabela / Partilhar resultados) |
| Página da calculadora | `lfk-hero` (fundo cinzento), `lfk-hero-head` (título + `lfk-lead` ao centro), `lfk-calc` (coluna de 52,6rem), `lfk-calc-form` + `lfk-calc-inner` + `lfk-calc-title` (formulário num cartão), `lfk-calc-results` (resultados por baixo). Em desktop o formulário e os resultados ficam empilhados, como no site |
| Barra com zonas | `lfk-zones` (`data-max`, `data-zones="35:Saudável:ok,45:Aceitável:warn,100:Preocupante:err"`), `LFK.zones(el, valor)`; `lfk-zones-result` (com `is-ok` / `is-warn` / `is-err`), `lfk-zones-text` |
| Questionário por passos | `lfk-steps` > `lfk-step` (`data-name`) > `lfk-label is-strong` + `lfk-options` > `lfk-option` (`data-value`); o lf-kit.js põe a contagem, a barra de progresso e Anterior / Seguinte; evento `lfk:done` com as respostas. Resultado: `lfk-meter` (`data-value`, `data-max`) |
| Linhas com nota | `lfk-line` (`is-down`) > `lfk-line-main` (`lfk-line-label`, `lfk-line-value`) + `lfk-line-note`; `lfk-subtitle` |
| Texto por baixo das opções | `lfk-radios data-lfk-desc="#id"` + `data-desc` em cada radio; o texto aparece em `lfk-desc` |
| Nota da tabela | `lfk-table-note` |
| Bloco de parceiro | `lfk-partner` > `a` (link **sempre** pelo `/visita/` do site, `rel="sponsored noopener noreferrer"`) > `lfk-partner-left` (`lfk-partner-brand` com `lfk-partner-ad` "Anúncio" e `lfk-partner-logo`, `lfk-partner-line`, `lfk-partner-copy` com `lfk-partner-title` e `lfk-partner-small`) + `lfk-partner-cta` ("Sabe mais" + `lfk-arrow`) |
| FAQ / Glossário | `lfk-faq` (coluna de 39rem ao centro, com `lfk-title`), `lfk-faq-item`, `lfk-faq-q` (h3), `lfk-faq-a` (parágrafos e listas), `lfk-formula` (caixa branca da fórmula, imagem ou texto) |
| Etiquetas e avisos | `lfk-tag` (`is-sm`, `is-ok`, `is-warn`, `is-err`, `is-dark`, `is-brand`), `lfk-alert` (`is-ok`, `is-warn`, `is-err`), `lfk-empty`, `lfk-spinner`, `lfk-foot` |

Exemplo de campo com unidade e ajuda:

```html
<div class="lfk-field">
  <label class="lfk-label" for="montante">Montante
    <span class="lfk-help-wrap"><span class="lfk-help" tabindex="0" aria-label="Ajuda"></span><span class="lfk-help-box">O valor que pedes ao banco.</span></span>
  </label>
  <div class="lfk-input-wrap"><input class="lfk-input lfk-num" id="montante" inputmode="numeric" value="150.000"><span class="lfk-unit">€</span></div>
</div>
```

Nos campos com `lfk-num` os milhares aparecem enquanto se escreve, no formato do site (1600 fica `1.600` na Literacia, `1,600` na EUPF em inglês, `1 600` no Rahatarkus), como nas calculadoras live. Por omissão o campo não aceita decimais; com `inputmode="decimal"` aceita 2, ou o número que puseres em `data-decimals="1"`. Nos sites com vírgula decimal, tanto `.` como `,` escritos pelo utilizador viram vírgula. `data-max="500000"` (ou `max-value`, como no site) limita o valor. O valor lê-se sempre com `LFK.num(campo.value)`.

Gráfico com tabela (igual ao graph_wrapper das calculadoras):

```html
<div class="lfk-card" id="evolucao">
  <div class="lfk-chart-head">
    <h3 class="lfk-h-sm">Evolução</h3>
    <div class="lfk-toggle"><button class="lfk-tab is-active" data-lfk-tab="g">Gráfico</button><button class="lfk-tab" data-lfk-tab="t">Tabela</button></div>
    <div class="lfk-menu" data-chart="#grafico" data-table="#tabela" data-form="#formulario" data-file="evolucao"></div>
  </div>
  <div data-lfk-view="g"><div class="lfk-chart"><canvas id="grafico"></canvas></div></div>
  <!-- menu do gráfico: o lf-kit.js monta os itens com os ícones do site; cada data-* é opcional -->
  <div data-lfk-view="t" hidden id="tabela"></div>
</div>
<script>
  LFK.views(document.getElementById('evolucao'));
  LFK.bar(document.getElementById('grafico'), { labels: ['1','2','3'], title: 'Capital total', xTitle: 'Anos',
    datasets: [{ label: 'Total de investimentos', data: [11200, 12400, 13600] }, { label: 'Juros acumulados', data: [540, 1168, 1890] }] });
  LFK.table(document.getElementById('tabela'), { head: ['Ano', 'Investido', 'Juros'], num: [false, true, true],
    rows: [['1', LFK.fmt(11200), LFK.fmt(540)], ['2', LFK.fmt(12400), LFK.fmt(1168)], ['3', LFK.fmt(13600), LFK.fmt(1890)]] });
</script>
```

`LFK.line` (linha, como o S&P 500 histórico) e `LFK.donut` (donut com valor ao centro, como os depósitos a prazo) recebem o mesmo tipo de dados. `LFK.fmt(10182.5)` escreve o valor no formato do site e da língua da página: `10.182,50€` na Literacia, `€10,182.50` na EUPF em inglês, `10 182,50 zł` na EUPF em polaco, `AED 10,182.50` na BrokerMatch, `R$ 10.182,50` na Educação Financeira (tabela completa no `CLAUDE.md`). `LFK.num('10.000')` lê um campo no mesmo formato. Sem moeda: `LFK.fmt(2.5, {currency: false})`.

Calcular: `LFK.calc(botao, {results, empty, run})` faz o mesmo que as calculadoras do site. Só calcula no clique, esconde o placeholder `lfk-empty`, mostra os resultados e faz scroll suave até eles. Mudar um campo nunca recalcula.

Listas: escrever um `<select class="lfk-input">` normal. O `lf-kit.js` troca-o pelo dropdown das calculadoras (lista própria, opção escolhida a azul, teclado com setas, Enter e Esc) e o `<select>` continua a existir escondido, com o valor e o evento `change`, por isso o resto do código lê-o como sempre. Para um `<select>` que já exista depois de a página carregar: `LFK.selects(elemento)`. Para manter o nativo: `class="lfk-input lfk-native"`.

Partilhar resultados copia um link com os valores do formulário (`data-form`). Para o abrir já calculado: `if (LFK.restore('#formulario')) calcular();`. Textos do menu noutra língua: `data-text-chart`, `data-text-table`, `data-text-share`, `data-text-copied`, `data-text-menu`.

O que precisa de JavaScript (o kit só tem o aspeto):
- `lfk-tab` e `lfk-chip`: trocar `is-active` / `is-on` no clique.
- `lfk-range`: pintar a parte preenchida, `el.style.setProperty('--lfk-fill', pct + '%')` no `input`.
- `lfk-field is-error`: pôr e tirar a classe quando o valor não é válido.

## Windows

O que o kit já trata: setas próprias nas listas (iguais em Mac e Windows), sem setas nos campos numéricos, barra de deslocar fina nas tabelas, contornos visíveis no modo de contraste elevado, e menos espaço vertical em portáteis com ecrã baixo (720 px ou menos de altura).
