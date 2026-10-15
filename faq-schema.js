/* FAQ -> dados estruturados (schema.org FAQPage) para Google e motores de IA.
   Le as perguntas e respostas que ja estao na pagina e acrescenta um <script type="application/ld+json">.
   Nao muda nada do que se ve. Nao faz nada se a pagina ja tiver FAQPage ou se tiver menos de 2 perguntas.
   Igual nos 5 sites. Formatos que reconhece:
   1. Glossario das calculadoras e paginas fixas (.glossario-content_wrapper): pergunta em h3.faq-calculators-h3,
      h3.h3-faq-calculator ou no bloco .text-weight-semibold; resposta nos blocos seguintes ate a proxima pergunta.
   2. Texto dos artigos (.w-richtext): depois de um titulo "Perguntas frequentes" / "FAQ" / equivalentes, cada h3/h4
      ou paragrafo todo a negrito e uma pergunta (ou paragrafo que comeca com uma pergunta a negrito, com a resposta a seguir);
      a resposta e o texto ate a pergunta seguinte. Acaba no proximo h2.
   3. Blocos .f-item (h3 + texto) dentro de um elemento com "faq" na classe. */
(function () {
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }

  function run() {
    var hasFaq = Array.prototype.some.call(document.querySelectorAll('script[type="application/ld+json"]'), function (s) {
      return /"FAQPage"/.test(s.textContent);
    });
    if (hasFaq) return;

    var items = [], seen = {};
    function add(q, a) {
      q = clean(q); a = clean(a);
      if (!q || !a || seen[q] || !/[?؟]$/.test(q)) return; /* so perguntas: fica de fora "Nota", "Conclusao", etc. */
      seen[q] = 1;
      items.push([q, a]);
    }

    /* 1) Glossario */
    var blocks = [];
    document.querySelectorAll(
      "h3.faq-calculators-h3, h3.h3-faq-calculator, .glossario-content_wrapper > .text-weight-semibold, .glossario-content_wrapper > div > .text-weight-semibold"
    ).forEach(function (el) {
      var b = el;
      while (b.parentElement && !b.nextElementSibling) b = b.parentElement;
      if (blocks.indexOf(b) < 0) blocks.push(b);
    });
    blocks.forEach(function (b) {
      var a = [], el = b.nextElementSibling;
      while (el && blocks.indexOf(el) < 0 && !/^(H1|H2|H3|A)$/.test(el.tagName)) {
        if (/^(DIV|P|UL|OL)$/.test(el.tagName)) a.push(el.textContent);
        el = el.nextElementSibling;
      }
      add(b.textContent, a.join(" "));
    });

    /* 2) Texto dos artigos */
    var TITLE = /(perguntas frequentes|frequently asked|veel ?gestelde vragen|najczęściej zadawane|najczęstsze pytania|często zadawane|korduma kippuvad|الأسئلة الشائعة|الأسئلة المتكررة)|(^|[^a-z])(faq|faqs|faq’s|faq's|kkk)([^a-z]|$)/i;
    document.querySelectorAll(".w-richtext").forEach(function (rt) {
      var inFaq = false, q = null, a = [];
      function flush() { if (q) add(q, a.join(" ")); q = null; a = []; }
      Array.prototype.forEach.call(rt.children, function (el) {
        var tag = el.tagName, txt = clean(el.textContent);
        if (/^H[1-6]$/.test(tag) && TITLE.test(txt)) { flush(); inFaq = true; return; }
        if (!inFaq) return;
        if (/^H[12]$/.test(tag)) { flush(); inFaq = false; return; }
        var first = tag === "P" && el.firstElementChild, lead = first && /^(STRONG|B)$/.test(first.tagName) && !clean(el.textContent.split(first.textContent)[0]);
        if (tag === "H3" || tag === "H4" || (lead && clean(first.textContent) === txt)) { flush(); q = txt; return; }
        if (lead && /\?\s*$/.test(clean(first.textContent))) { flush(); q = clean(first.textContent); a.push(txt.slice(q.length)); return; }
        if (q && txt) a.push(txt);
      });
      flush();
    });

    /* 3) .f-item */
    document.querySelectorAll('[class*="faq"] .f-item').forEach(function (it) {
      var h = it.querySelector("h3, h4");
      if (!h) return;
      var a = [];
      Array.prototype.forEach.call(it.children, function (el) { if (el !== h) a.push(el.textContent); });
      add(h.textContent, a.join(" "));
    });

    if (items.length < 2) return;
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-faq-schema", "");
    s.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": items.map(function (it) {
        return { "@type": "Question", "name": it[0], "acceptedAnswer": { "@type": "Answer", "text": it[1] } };
      })
    });
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
