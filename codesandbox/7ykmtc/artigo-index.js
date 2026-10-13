$(document).ready(function () {
  const $rt = $(".text-rich-text.is-artigo");
  const $toc = $(".index_wrapper");
  if (!$rt.length || !$toc.length) return;

  // -------- helpers --------
  const slug = (s) =>
    s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "") || "secao";

  function getScrollParent(el) {
    let p = el.parentElement;
    while (p) {
      const st = getComputedStyle(p).overflowY;
      if ((st === "auto" || st === "scroll") && p.scrollHeight > p.clientHeight)
        return p;
      p = p.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  function padLeft(el) {
    return parseFloat(getComputedStyle(el).paddingLeft) || 0;
  }
  function scrollItemToLeft(container, item, instant = true) {
    if (!container || !item) return;
    container.scrollTo({
      left: item.offsetLeft - padLeft(container),
      behavior: instant ? "instant" : "smooth",
    });
  }

  // -------- build TOC --------
  $toc.empty();
  $rt.find("h2").each(function (i) {
    const $h = $(this);
    const text = $h.text().trim() || `Secção ${i + 1}`;
    let base = slug(text),
      id = base,
      n = 1;
    while (document.getElementById(id) || document.getElementById("a-" + id))
      id = `${base}-${n++}`;
    const anchorId = "a-" + id;

    $("<span>", {
      id: anchorId,
      class: "toc-anchor",
      "aria-hidden": "true",
    }).insertBefore(this);
    $h.attr("id", id);
    $toc.append(
      `<a href="#${anchorId}" class="index-item w-inline-block"><div>${text}</div></a>`
    );
  });

  const $items = $(".index_wrapper .index-item");
  const anchors = $(".toc-anchor").toArray();
  const THRESH = 120;

  // -------- click: jump + align to left --------
  $toc.on("click", "a.index-item", function (e) {
    const id = $(this).attr("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    const scroller = getScrollParent(target);
    const y =
      target.getBoundingClientRect().top +
      (scroller === document.scrollingElement
        ? window.pageYOffset
        : scroller.scrollTop);
    if (scroller === document.scrollingElement) window.scrollTo(0, y);
    else scroller.scrollTop = y;

    history.pushState(null, "", `#${id}`);
    scrollItemToLeft($toc[0], this, true);
  });

  // -------- scroll: active state + align to left --------
  function onScroll() {
    const scrollTop = $(window).scrollTop();
    const firstTop = anchors.length
      ? $(anchors[0]).offset().top - THRESH
      : Infinity;

    let currentId = null;
    if (scrollTop >= firstTop) {
      for (let i = 0; i < anchors.length; i++) {
        const $a = $(anchors[i]);
        if ($a.offset().top - THRESH <= scrollTop) currentId = $a.attr("id");
        else break;
      }
    }

    $items.removeClass("is-active");
    if (currentId) {
      const $active = $items
        .filter(`[href="#${currentId}"]`)
        .addClass("is-active");
      scrollItemToLeft($toc[0], $active[0], false);
    }
  }

  $(window).on("scroll", onScroll);
  onScroll();

  if (location.hash) {
    const link = $items.filter(`[href="${location.hash}"]`)[0];
    if (link) scrollItemToLeft($toc[0], link, true);
  }
});
