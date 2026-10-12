$(document).ready(function () {
  $(function () {
    const $rt = $(".text-rich-text.is-artigo");
    const $toc = $(".index_wrapper");
    if (!$rt.length || !$toc.length) return;

    // Clear existing items
    $toc.empty();

    // slug + unique id
    const seen = {};
    const slug = (s) =>
      s
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "") || "secao";

    // Build anchors & links
    $rt.find("h2").each(function (i) {
      const $h = $(this);
      const text = $h.text().trim() || `Secção ${i + 1}`;
      let base = slug(text);
      let id = base,
        n = 1;
      while (document.getElementById(id) || document.getElementById("a-" + id))
        id = `${base}-${n++}`;

      // Insert offset anchor BEFORE the h2
      const anchorId = "a-" + id;
      $("<span>", {
        id: anchorId,
        class: "toc-anchor",
        "aria-hidden": "true",
      }).insertBefore(this);

      // (Optional) keep id on the h2 for deep links too
      $h.attr("id", id);

      // Add TOC link pointing to the offset anchor
      $toc.append(
        `<a href="#${anchorId}" class="index-item w-inline-block"><div>${text}</div></a>`
      );
    });

    // Smooth scroll that also works if a scrollable container is used
    function getScrollParent(el) {
      let p = el.parentElement;
      while (p) {
        const st = getComputedStyle(p).overflowY;
        if (
          (st === "auto" || st === "scroll") &&
          p.scrollHeight > p.clientHeight
        )
          return p;
        p = p.parentElement;
      }
      return document.scrollingElement || document.documentElement;
    }

    // INSTANT JUMP
    //——————————————————————————-
    //——————————————————————————-
    $toc.on("click", "a.index-item", function (e) {
      const id = $(this).attr("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      const scroller = getScrollParent(target);
      const rectTop = target.getBoundingClientRect().top;
      const current =
        scroller === document.scrollingElement
          ? window.pageYOffset
          : scroller.scrollTop;
      const y = rectTop + current;

      if (scroller === document.scrollingElement) {
        window.scrollTo(0, y);
      } else {
        scroller.scrollTop = y;
      }

      history.pushState(null, "", `#${id}`);
    });

    // SMOOTH scroll
    //——————————————————————————-
    //——————————————————————————-
    /*
    $toc.on("click", "a.index-item", function (e) {
      const id = $(this).attr("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      const scroller = getScrollParent(target);
      const rectTop = target.getBoundingClientRect().top;
      const current =
        scroller === document.scrollingElement
          ? window.pageYOffset
          : scroller.scrollTop;
      const y = rectTop + current; // anchor already includes visual offset via CSS

      if (window.lenis?.scrollTo && scroller === document.scrollingElement) {
        window.lenis.scrollTo(y, { duration: 1 });
      } else if (scroller === document.scrollingElement) {
        window.scrollTo({ top: y, behavior: "smooth" });
      } else {
        $(scroller).animate({ scrollTop: y }, 600);
      }

      // Update URL without triggering native jump
      history.pushState(null, "", `#${id}`);
    });*/
  });

  /*
  $(function () {
    const $items = $(".index_wrapper .index-item");
    const anchors = $(".toc-anchor").toArray();

    function onScroll() {
      let scrollTop = $(window).scrollTop();
      let currentId = null;

      // find the last anchor above the middle of viewport
      for (let i = 0; i < anchors.length; i++) {
        const $a = $(anchors[i]);
        if ($a.offset().top - 120 <= scrollTop) {
          // 120px buffer (header/offset)
          currentId = $a.attr("id");
        }
      }

      if (currentId) {
        $items.removeClass("is-active");
        $items.filter(`[href="#${currentId}"]`).addClass("is-active");
      }
    }

    $(window).on("scroll", onScroll);
    onScroll(); // run on load
  });*/

  $(function () {
    const $items = $(".index_wrapper .index-item");
    const anchors = $(".toc-anchor").toArray();
    const THRESH = 120; // same buffer you used

    function onScroll() {
      const scrollTop = $(window).scrollTop();

      // If we're above the first section, clear any active state
      const firstTop = anchors.length
        ? $(anchors[0]).offset().top - THRESH
        : Infinity;
      if (scrollTop < firstTop) {
        $items.removeClass("is-active");
        return;
      }

      // Otherwise, find the last anchor above the threshold
      let currentId = null;
      for (let i = 0; i < anchors.length; i++) {
        const $a = $(anchors[i]);
        if ($a.offset().top - THRESH <= scrollTop) {
          currentId = $a.attr("id");
        } else {
          break; // anchors are in order; can stop scanning
        }
      }

      $items.removeClass("is-active");
      if (currentId) {
        $items.filter(`[href="#${currentId}"]`).addClass("is-active");
      }
    }

    $(window).on("scroll", onScroll);
    onScroll(); // run on load
  });

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // ------------------ AUTO SCROLL MOBILE -----------------------
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // -------------------------------------------------------------

  // --- helpers -------------------------------------------------
  function padLeft(el) {
    return parseFloat(getComputedStyle(el).paddingLeft) || 0;
  }
  function scrollItemToLeft(container, item, instant = true) {
    if (!container || !item) return;
    const x = item.offsetLeft - padLeft(container);
    container.scrollTo({ left: x, behavior: instant ? "instant" : "smooth" });
  }
  // -------------------------------------------------------------

  $(function () {
    const $rt = $(".text-rich-text.is-artigo");
    const $toc = $(".index_wrapper");
    if (!$rt.length || !$toc.length) return;

    // ... your TOC build code stays the same ...

    // CLICK: jump to section and align clicked link to left
    $toc.on("click", "a.index-item", function (e) {
      const id = $(this).attr("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      // jump instantly to content (your existing logic)
      const scroller = (function getScrollParent(el) {
        let p = el.parentElement;
        while (p) {
          const st = getComputedStyle(p).overflowY;
          if (
            (st === "auto" || st === "scroll") &&
            p.scrollHeight > p.clientHeight
          )
            return p;
          p = p.parentElement;
        }
        return document.scrollingElement || document.documentElement;
      })(target);

      const rectTop = target.getBoundingClientRect().top;
      const current =
        scroller === document.scrollingElement
          ? window.pageYOffset
          : scroller.scrollTop;
      const y = rectTop + current;
      if (scroller === document.scrollingElement) window.scrollTo(0, y);
      else scroller.scrollTop = y;

      history.pushState(null, "", `#${id}`);

      // align link to left
      const tocEl = $toc[0];
      scrollItemToLeft(tocEl, this, /*instant*/ true);
    });

    // SCROLL: set active & align to left
    const $items = $(".index_wrapper .index-item");
    const anchors = $(".toc-anchor").toArray();
    const THRESH = 120;

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
        // align active to left (smooth here if you like)
        scrollItemToLeft($toc[0], $active[0], /*instant*/ false);
      }
    }
    $(window).on("scroll", onScroll);
    onScroll();

    // On load with hash: align initial active item to left
    if (location.hash) {
      const link = $items.filter(`[href="${location.hash}"]`)[0];
      if (link) scrollItemToLeft($toc[0], link, /*instant*/ true);
    }
  });
});
