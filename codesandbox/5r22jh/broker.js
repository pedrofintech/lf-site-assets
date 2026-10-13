$(document).ready(function () {
  $(".broker_component").each(function () {
    const wrapper = $(this).find(".score_wrapper");
    const scoreNumber = $(this).find("[score-number]").text().trim();
    const score = parseFloat(scoreNumber);
    if (isNaN(score)) return;

    const stars = Math.round((score / 10) * 5 * 2) / 2;
    const full = Math.floor(stars);
    const half = stars % 1 !== 0 ? 1 : 0;
    const empty = 5 - full - half;

    const fullIcon = wrapper.find("[score-full]").first().clone();
    const halfIcon = wrapper.find("[score-half]").first().clone();
    const emptyIcon = wrapper.find("[score-empty]").first().clone();

    // Remove all existing icons but keep score-number if it's outside the wrapper
    wrapper.find("[score-full], [score-half], [score-empty]").remove();

    // Append icons in correct order
    for (let i = 0; i < full; i++) wrapper.append(fullIcon.clone());
    if (half) wrapper.append(halfIcon.clone());
    for (let i = 0; i < empty; i++) wrapper.append(emptyIcon.clone());
  });
});
