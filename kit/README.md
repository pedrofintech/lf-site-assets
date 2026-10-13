# LF kit

Estilos prontos para ferramentas embebidas no Webflow: calculadoras, comparadores, simuladores. Uma ferramenta feita com o kit fica logo com o aspeto do site, sem CSS próprio para botões, campos ou cartões.

Funciona nos cinco sites (Literacia, EUPF, BrokerMatch, Rahatarkus, Educação Financeira). As cores e as letras vêm das variáveis do Webflow de cada site, por isso o botão principal sai laranja na Literacia, verde na Educação Financeira e azul no Rahatarkus, com o mesmo código.

Para ver todas as peças: abrir `kit/demo.html` (tem um seletor para ver como fica em cada site).

## Como usar

No custom code da página (ou num embed), com o commit fixo:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/pedrofintech/lf-site-assets@COMMIT/kit/lf-kit.css">
```

E a ferramenta toda dentro de `<div class="lfk">`. Fora desse div o kit não mexe em nada.

## Regras para o Claude

Colar isto no pedido quando se pede uma ferramenta nova:

> Usa o LF kit (`kit/lf-kit.css` do repo pedrofintech/lf-site-assets; exemplos em `kit/demo.html`). Tudo dentro de `<div class="lfk">`. Usa só as classes `lfk-*` do kit para texto, botões, campos, cartões, tabelas, etiquetas e avisos. Não escrevas CSS para cores, letras, bordas ou cantos: se faltar uma peça, junta só o mínimo num `<style>` com prefixo próprio e usa as variáveis do kit (`var(--lfk-brand)`, `var(--lfk-text)`, `var(--lfk-border-2)`, etc.), nunca cores em hexadecimal. Números com `class="lfk-num"` ou `is-num` nas tabelas. Botões são `<button>`, campos têm `<label for>`. Testa a 375 px de largura e num ecrã com 650 px de altura.

## Peças

| Peça | Classes |
|---|---|
| Títulos e texto | `lfk-title`, `lfk-h`, `lfk-h-sm`, `lfk-eyebrow`, `lfk-lead`, `lfk-text`, `lfk-small`, `lfk-xs`, `lfk-muted`, `lfk-strong`, `lfk-pos`, `lfk-neg`, `lfk-link` |
| Disposição | `lfk-stack` (`is-sm`, `is-lg`), `lfk-row` (`is-between`), `lfk-grid` (`is-2`, `is-3`), `lfk-divider`, `lfk-or` |
| Cartões | `lfk-card` (`is-soft`, `is-raised`, `is-brand`, `is-sm`), `lfk-card-head` |
| Botões | `lfk-btn` (`is-dark`, `is-secondary`, `is-ghost`, `is-sm`, `is-block`) |
| Campos | `lfk-field` (`is-error`), `lfk-label`, `lfk-input` (também em `<select>` e `<textarea>`), `lfk-input-wrap` + `lfk-unit`, `lfk-hint`, `lfk-error`, `lfk-help` |
| Escolhas | `lfk-toggle` + `lfk-tab` (`is-active`), `lfk-chips` + `lfk-chip` (`is-on`), `lfk-check`, `lfk-range` |
| Resultados | `lfk-stat` (`lfk-stat-l`, `lfk-stat-v`, `lfk-stat-s`; `is-sm`, `is-brand`), `lfk-kpis`, `lfk-kv` (`is-total`), `lfk-summary`, `lfk-table-wrap` + `lfk-table` (`is-num`, linha `is-on`) |
| Etiquetas e avisos | `lfk-tag` (`is-ok`, `is-warn`, `is-err`, `is-dark`, `is-brand`), `lfk-alert` (`is-ok`, `is-warn`, `is-err`), `lfk-empty`, `lfk-spinner`, `lfk-foot` |

Exemplo de campo com unidade e ajuda:

```html
<div class="lfk-field">
  <label class="lfk-label" for="montante">Montante <span class="lfk-help" tabindex="0" data-tip="O valor que pedes ao banco."></span></label>
  <div class="lfk-input-wrap"><input class="lfk-input lfk-num" id="montante" inputmode="numeric" value="150.000"><span class="lfk-unit">€</span></div>
</div>
```

O que precisa de JavaScript (o kit só tem o aspeto):
- `lfk-tab` e `lfk-chip`: trocar `is-active` / `is-on` no clique.
- `lfk-range`: pintar a parte preenchida, `el.style.setProperty('--lfk-fill', pct + '%')` no `input`.
- `lfk-field is-error`: pôr e tirar a classe quando o valor não é válido.

## Windows

O que o kit já trata: setas próprias nas listas (iguais em Mac e Windows), sem setas nos campos numéricos, barra de deslocar fina nas tabelas, contornos visíveis no modo de contraste elevado, e menos espaço vertical em portáteis com ecrã baixo (720 px ou menos de altura).
