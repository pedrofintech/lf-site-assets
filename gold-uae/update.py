"""Update gold-data.json for the BrokerMatch "Gold rate today in the UAE" page.

Sources
- Dubai Jewellery Group suggested retail rates (AED per gram, 24K/22K/21K/18K/14K):
  https://dubaicityofgold.com/dubai-gold-rate-today/
- Spot price (USD per troy ounce): https://api.gold-api.com/price/XAU
- Daily history: NBP gold fixing (PLN per gram of fine gold) converted to USD with the
  ECB USD/PLN reference rate (api.frankfurter.dev), then to AED at the 3.6725 peg.

Rules: never overwrite good data with nothing. If a source fails, the last good values
stay in the file and the source is flagged as stale. The run fails only when the retail
rates have not been refreshed for more than 2 days.
"""
import datetime as dt
import json
import os
import re
import sys
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "gold-data.json")
ARCHIVE = os.path.join(HERE, "djg-archive.json")
PEG = 3.6725
OZ = 31.1034768
KARATS = ["24", "22", "21", "18", "14"]
UA = {"User-Agent": "Mozilla/5.0 (compatible; brokermatch-gold-bot/1.0; +https://www.brokermatch.ae)"}
DJG_URL = "https://dubaicityofgold.com/dubai-gold-rate-today/"
DJG_AJAX = "https://dubaicityofgold.com/wp-admin/admin-ajax.php"


def fetch(url, data=None, as_json=True, timeout=30):
    body = None
    headers = dict(UA)
    if data is not None:
        body = urllib.parse.urlencode(data).encode()
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    req = urllib.request.Request(url, data=body, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read().decode("utf-8", "replace")
    return json.loads(raw) if as_json else raw


def load(path, default):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return default


def parse_djg(html):
    pairs = re.findall(r'sortd-gold-type">\s*(\d+)K Gold\s*</span>\s*<span class="sortd-gold-value">\s*AED\s*([\d.,]+)', html)
    rates = {k: float(v.replace(",", "")) for k, v in pairs}
    if not all(k in rates for k in KARATS):
        raise ValueError("DJG rates not found (got %s)" % rates)
    r24 = rates["24"]
    if not 100 < r24 < 2000:
        raise ValueError("DJG 24K out of range: %s" % r24)
    for k in KARATS[1:]:
        if not 0.5 * r24 < rates[k] / (int(k) / 24) < 1.2 * r24:
            raise ValueError("DJG %sK inconsistent: %s" % (k, rates[k]))
    return {k: rates[k] for k in KARATS}


def get_djg():
    errors = []
    try:
        return parse_djg(fetch(DJG_URL, as_json=False))
    except Exception as e:
        errors.append("page: %s" % e)
    try:
        today = (dt.datetime.utcnow() + dt.timedelta(hours=4)).strftime("%Y-%m-%d")
        res = fetch(DJG_AJAX, data={"action": "sortd_gold_price", "date": today})
        return parse_djg(res.get("data", ""))
    except Exception as e:
        errors.append("ajax: %s" % e)
    raise RuntimeError("; ".join(errors))


def get_spot():
    p = float(fetch("https://api.gold-api.com/price/XAU")["price"])
    if not 500 < p < 50000:
        raise ValueError("spot out of range: %s" % p)
    return p


def get_history(days=370):
    end = dt.date.today()
    start = end - dt.timedelta(days=days)
    nbp = fetch("https://api.nbp.pl/api/cenyzlota/%s/%s/?format=json" % (start + dt.timedelta(days=4), end))
    fx = fetch("https://api.frankfurter.dev/v1/%s..%s?base=USD&symbols=PLN" % (start, end))["rates"]
    fx_dates = sorted(fx)
    out = []
    for row in nbp:
        d = row["data"]
        prior = [x for x in fx_dates if x <= d]
        if not prior:
            continue
        usd_pln = fx[prior[-1]]["PLN"]
        usd_g = row["cena"] / usd_pln
        out.append({"d": d, "g": round(usd_g * PEG, 2)})
    if len(out) < 100:
        raise ValueError("history too short: %d rows" % len(out))
    last = out[-1]["g"]
    if not 100 < last < 2000:
        raise ValueError("history last value out of range: %s" % last)
    return out


def main():
    now = dt.datetime.utcnow().replace(microsecond=0)
    uae = now + dt.timedelta(hours=4)
    uae_day = uae.strftime("%Y-%m-%d")
    data = load(DATA, {})
    archive = load(ARCHIVE, {"days": {}})
    warnings = []

    # 1) Dubai Jewellery Group retail rates
    try:
        rates = get_djg()
        day = archive["days"].setdefault(uae_day, {})
        stamp = uae.strftime("%H:%M")
        if "first" not in day:
            day["first"] = {"t": stamp, "r": rates}
        if day.get("last", {}).get("r") != rates:
            day["last"] = {"t": stamp, "r": rates}
        day["checked"] = stamp
        data["djg"] = {"date": uae_day, "since": day["last"]["t"], "checked": stamp, "rates": rates, "stale": False}
    except Exception as e:
        warnings.append("DJG: %s" % e)
        if data.get("djg"):
            data["djg"]["stale"] = True

    keep = sorted(archive["days"])[-400:]
    archive["days"] = {k: archive["days"][k] for k in keep}
    days = sorted(archive["days"])
    data["djgDays"] = [dict(d=k, **{"r" + kk: archive["days"][k]["last"]["r"][kk] for kk in KARATS}) for k in days[-60:]]
    cur = data.get("djg", {}).get("date")
    prev_days = [k for k in days if cur and k < cur]
    data["djgPrev"] = {"date": prev_days[-1], "rates": archive["days"][prev_days[-1]]["last"]["r"]} if prev_days else None

    # 2) Spot
    try:
        usd_oz = get_spot()
        data["spot"] = {"usdOz": round(usd_oz, 2), "aedG": round(usd_oz * PEG / OZ, 2), "at": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "stale": False}
    except Exception as e:
        warnings.append("spot: %s" % e)
        if data.get("spot"):
            data["spot"]["stale"] = True

    # 3) History (once a day is enough, but cheap to refresh)
    try:
        data["history"] = get_history()
    except Exception as e:
        warnings.append("history: %s" % e)

    data["peg"] = PEG
    data["updatedAt"] = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    data["sources"] = {
        "retail": "Dubai Jewellery Group (dubaicityofgold.com)",
        "spot": "api.gold-api.com",
        "history": "NBP gold fixing + ECB USD/PLN (api.frankfurter.dev), AED at the 3.6725 peg",
    }

    with open(DATA, "w") as f:
        f.write(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    with open(ARCHIVE, "w") as f:
        f.write(json.dumps(archive, indent=1, ensure_ascii=False) + "\n")

    for w in warnings:
        print("::warning::%s" % w)

    last_good = data.get("djg", {}).get("date")
    if not last_good or (dt.date.fromisoformat(uae_day) - dt.date.fromisoformat(last_good)).days > 2:
        print("::error::Dubai Jewellery Group rates not refreshed for more than 2 days")
        sys.exit(1)


if __name__ == "__main__":
    main()
