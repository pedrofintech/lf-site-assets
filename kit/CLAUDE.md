# LF kit: instruções para o Claude

Lê este ficheiro antes de fazer qualquer ferramenta (calculadora, simulador, comparador, questionário) para os sites Literacia Financeira, EU Personal Finance, BrokerMatch, Rahatarkus ou Educação Financeira. O kit faz a ferramenta ficar igual às calculadoras que já estão nesses sites. A lista completa de peças está no `README.md` desta pasta e todas as peças estão montadas em `demo.html` (ver ao vivo: https://htmlpreview.github.io/?https://github.com/pedrofintech/lf-site-assets/blob/main/kit/demo.html).

## 1. Carregar o kit

No embed do Webflow (ou no custom code da página), com o commit fixo que está no `README.md`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/pedrofintech/lf-site-assets@COMMIT/kit/lf-kit.css">
<script src="https://cdn.jsdelivr.net/gh/pedrofintech/lf-site-assets@COMMIT/kit/lf-kit.js"></script>
```

Usa sempre um commit fixo (nunca `@main`): o jsDelivr guarda `@main` em cache até 12 horas.

## 2. Regras

1. Tudo dentro de `<div class="lfk">`. Fora dele o kit não mexe em nada.
2. Usa só classes `lfk-*`. Não escrevas CSS para cores, letras, tamanhos, bordas, cantos ou espaços.
3. Se faltar mesmo uma peça: o mínimo num `<style>` com prefixo próprio, só com as variáveis do kit (`var(--lfk-brand)`, `var(--lfk-text)`, `var(--lfk-text-2)`, `var(--lfk-border-2)`, `var(--lfk-bg-2)`, `var(--lfk-r)`, `var(--lfk-fs-s)`...). Nunca cores em hexadecimal nem tamanhos de letra em px.
4. As cores vêm de cada site (o botão principal é laranja na Literacia, escuro na EUPF e BrokerMatch, azul no Rahatarkus, verde na Educação Financeira). Não as fixes.
5. Listas: `<select class="lfk-input">` normal. O `lf-kit.js` troca-o pelo dropdown das calculadoras e mantém o `<select>` com o valor e o evento `change`.
6. Gráficos: só com o `lf-kit.js` (`LFK.bar`, `LFK.line`, `LFK.donut`), dentro de um `lfk-card` com separadores Gráfico / Tabela e o menu `lfk-menu`. Não configures o Chart.js à mão.
7. Números em formato português: `10.000`, `2,5`, `10.182,50€` (`LFK.fmt`). Valores nos campos com `value=""`, não `placeholder=""`.
8. Botões são `<button type="button">`; cada campo tem `<label for="...">`.
9. Links de parceiros (bancos, corretoras) **sempre** pelos `/visita/...` do site, com `rel="sponsored noopener noreferrer"` e `target="_blank"`. Nunca o link direto do parceiro: o tracking de afiliados depende disso.
10. GSAP e ScrollTrigger já existem nos sites (não os importes). Se alguma animação mudar a altura da página, chama `ScrollTrigger.refresh()` no fim.
11. Testa a 375 px de largura, num ecrã com 650 px de altura e em desktop.

## 3. Estrutura de uma calculadora

Igual às do site: em desktop o formulário fica num cartão e os resultados por baixo, numa coluna de 52,6rem (não lado a lado).

```html
<section class="lfk lfk-hero">
  <div class="lfk-hero-head">
    <h1 class="lfk-title">Calculadora de ...</h1>
    <p class="lfk-lead">Uma frase sobre o que a calculadora faz.</p>
  </div>
  <div class="lfk-calc">
    <div class="lfk-calc-form"><div class="lfk-calc-inner">
      <div class="lfk-calc-title">Simulador de ...</div>
      <form class="lfk-stack" id="formulario" onsubmit="return false">
        <div class="lfk-field">
          <label class="lfk-label" for="montante">Montante
            <span class="lfk-help-wrap"><span class="lfk-help" tabindex="0" aria-label="Ajuda"></span><span class="lfk-help-box">Explicação curta.</span></span>
          </label>
          <div class="lfk-input-wrap"><input class="lfk-input lfk-num" id="montante" name="montante" inputmode="numeric" value="10.000"><span class="lfk-unit">€</span></div>
        </div>
        <div class="lfk-field">
          <label class="lfk-label" for="frequencia">Frequência</label>
          <select class="lfk-input" id="frequencia" name="frequencia"><option value="12">Mensal</option><option value="1">Anual</option></select>
        </div>
        <button type="button" class="lfk-btn is-block" id="calcular">Calcular</button>
      </form>
    </div></div>

    <div class="lfk-calc-results" id="resultados" hidden>
      <div class="lfk-card">
        <div class="lfk-card-head"><h2 class="lfk-h-sm">Resultados</h2></div>
        <div class="lfk-kv is-total"><span>Valor final</span><span id="r-final">0,00€</span></div>
        <div class="lfk-kv"><span>Total investido</span><span id="r-investido">0,00€</span></div>
        <p class="lfk-summary" style="margin-top:1.5rem" id="r-frase"></p>
      </div>
      <!-- gráfico com tabela: ver o README ("Gráfico com tabela") -->
    </div>
  </div>
</section>
```

Antes de calcular, em vez de resultados vazios, usa `<div class="lfk-empty">Preenche os campos e carrega em Calcular para veres os resultados.</div>`.

Por baixo da calculadora, as perguntas frequentes vão numa `lfk-faq` (título `lfk-title` "Glossário", cada pergunta em `lfk-faq-item` com `lfk-faq-q` e `lfk-faq-a`).

## 4. Que peça usar

| Preciso de | Usa |
|---|---|
| Campo de número com €, %, anos | `lfk-input-wrap` + `lfk-input` + `lfk-unit` |
| Escolher entre 2 a 4 opções curtas | `lfk-radios` + `lfk-radio` (com `data-lfk-desc` se cada opção tiver explicação) |
| Escolher numa lista longa | `<select class="lfk-input">` |
| Ligar / desligar uma opção | `lfk-check` |
| Trocar entre vistas (Gráfico / Tabela, Mensal / Anual) | `lfk-toggle` + `lfk-tab` |
| Resultado principal e linhas de valores | `lfk-kv` (`is-total` na principal) dentro de `lfk-card` |
| Valores com uma explicação por baixo | `lfk-line` + `lfk-line-note` |
| Classificar um valor em zonas (bom / médio / mau) | `lfk-zones` + `LFK.zones(el, valor)` + `lfk-zones-result` |
| Questionário com várias perguntas seguidas | `lfk-steps` + `lfk-step` + `lfk-option`; respostas no evento `lfk:done` |
| Evolução ao longo do tempo | `LFK.bar` (empilhado) ou `LFK.line` |
| Partes de um total | `LFK.donut` + `lfk-donut-center` + `lfk-legend` |
| Tabela de valores | `LFK.table` (põe "Mostrar mais" a partir de 30 linhas) + `lfk-table-note` para a fonte |
| Descarregar / partilhar | `lfk-menu` com `data-chart`, `data-table`, `data-form`; `LFK.restore(form)` para abrir um link partilhado já calculado |
| Anúncio de um parceiro | `lfk-partner` (link pelo `/visita/`) |
| Aviso ao utilizador | `lfk-alert` (`is-warn`, `is-err`, `is-ok`) |

## 5. Antes de entregar

- Nenhum `style=""` com cores ou tamanhos de letra, nenhuma cor em hexadecimal.
- A ferramenta funciona em telemóvel (375 px) sem deslocar para o lado.
- Os números aparecem em formato português e os links de parceiros passam pelo `/visita/`.
