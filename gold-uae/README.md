# gold-uae

Bundle and data for the "Gold rate today in the UAE" page on brokermatch.ae (/gold-rate-today-uae).
Same setup as the EIBOR page (pedrofintech/eibor-rate-today).

- `gold.js`: the tool (CSS + HTML + logic). The Webflow page has `<div id="bmc-gold"></div>` and a registered
  script that loads this file from jsDelivr at a fixed commit.
- `gold-data.json`: data read by the page from raw.githubusercontent.com (no jsDelivr cache).
- `djg-archive.json`: every day's first and last Dubai Jewellery Group rates (feeds the history table).
- `update.py`: run by `.github/workflows/gold-uae.yml` every 2 hours between 07:17 and 23:17 UAE time.

## Sources

- Retail rates (24K, 22K, 21K, 18K, 14K, AED per gram): Dubai Jewellery Group, https://dubaicityofgold.com/dubai-gold-rate-today/
- Spot (USD per ounce): https://api.gold-api.com/price/XAU (also fetched live by the page)
- One-year history: NBP gold fixing (PLN per gram) / ECB USD-PLN (api.frankfurter.dev) x 3.6725

## When does a run fail?

Only when the Dubai Jewellery Group rates have not been refreshed for more than 2 days.
Other failures (spot, history) leave the last good values in the file and add a warning to the run.
