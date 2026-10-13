document.addEventListener("DOMContentLoaded", function () {
  const calcularButton = document.querySelector("#calcular");

  // ── Väljad selgesõnaliselt ──
  const getSumma = () => document.querySelector('[data-type="summa"]');
  const getMaksuvaba = () => document.querySelector('[data-type="maksuvaba"]');
  const getPeriood = () =>
    document.querySelector('#periood, select[name="periood"]');
  const getPension = () =>
    document.querySelector('#morada, select[name="morada"]');
  const getRadios = () => document.querySelectorAll('input[name="radio-tyyp"]');
  const CHECKBOXES = [
    "sotsmaks-min",
    "ta-tootlus",
    "tt-tootlus",
    "vanaduspension",
  ];
  const CB_PARAMS = {
    "sotsmaks-min": "smin",
    "ta-tootlus": "tat",
    "tt-tootlus": "ttt",
    vanaduspension: "vp",
  };

  // ── URL-ist tagasi täitmine ──
  const params = new URLSearchParams(window.location.search);
  let hasParams = false;

  function setVal(el, v) {
    if (!el) return;
    el.value = v; // params.get() juba dekodeerib — ei tohi teist korda dekodeerida
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    hasParams = true;
  }

  if (params.get("s")) setVal(getSumma(), params.get("s"));
  if (params.get("mv")) setVal(getMaksuvaba(), params.get("mv"));
  if (params.get("p")) setVal(getPeriood(), params.get("p"));
  if (params.get("kp")) setVal(getPension(), params.get("kp"));

  if (params.get("t")) {
    getRadios().forEach((r) => {
      const match = r.value === params.get("t") || r.id === params.get("t");
      r.checked = match;

      // Webflow nähtava raadionupu sünkroniseerimine
      const visual = r.previousElementSibling;
      if (
        visual &&
        visual.classList &&
        visual.classList.contains("w-radio-input")
      ) {
        visual.classList.toggle("w--redirected-checked", match);
      }

      if (match) r.dispatchEvent(new Event("change", { bubbles: true }));
    });
    hasParams = true;
  }

  CHECKBOXES.forEach((id) => {
    const key = CB_PARAMS[id];
    if (params.get(key) !== null) {
      const cb = document.getElementById(id);
      if (cb) {
        cb.checked = params.get(key) === "1";
        const visual = cb.previousElementSibling;
        if (
          visual &&
          visual.classList &&
          visual.classList.contains("w-checkbox-input")
        ) {
          visual.classList.toggle("w--redirected-checked", cb.checked);
        }
        cb.dispatchEvent(new Event("change", { bubbles: true }));
        hasParams = true;
      }
    }
  });

  if (hasParams && calcularButton) {
    setTimeout(() => calcularButton.click(), 500);
  }

  // ── Jagatava URL-i genereerimine ──
  function generateShareableURL() {
    const p = new URLSearchParams();

    const summa = getSumma();
    if (summa && summa.value.trim() !== "") p.set("s", summa.value);

    const mv = getMaksuvaba();
    if (mv && mv.value.trim() !== "") p.set("mv", mv.value);

    const per = getPeriood();
    if (per && per.value) p.set("p", per.value);

    const kp = getPension();
    if (kp && kp.value) p.set("kp", kp.value); // p.toString() kodeerib automaatselt

    getRadios().forEach((r) => {
      if (r.checked) p.set("t", r.value || r.id);
    });

    CHECKBOXES.forEach((id) => {
      const cb = document.getElementById(id);
      if (cb && cb.checked) p.set(CB_PARAMS[id], "1");
    });

    const newUrl = `${window.location.origin}${
      window.location.pathname
    }?${p.toString()}`;

    navigator.clipboard.writeText(newUrl).then(() => {
      const copiedText = document.querySelector("[copied-text]");
      const copiedIcon = document.querySelector("[copied-icon]");
      const shareIcon = document.querySelector("[share-icon]");

      if (copiedText) copiedText.textContent = "Kopeeritud!";
      if (copiedIcon) copiedIcon.style.display = "block";
      if (shareIcon) shareIcon.style.display = "none";

      setTimeout(() => {
        if (copiedText) copiedText.textContent = "Jaga tulemusi";
        if (copiedIcon) copiedIcon.style.display = "none";
        if (shareIcon) shareIcon.style.display = "block";
      }, 2000);
    });
  }

  setTimeout(() => {
    const shareUrlButton = document.querySelector("[share-url]");
    if (shareUrlButton) {
      shareUrlButton.addEventListener("click", (e) => {
        e.preventDefault();
        generateShareableURL();
      });
    }
  }, 100);
});
