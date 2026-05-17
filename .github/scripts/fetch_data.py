#!/usr/bin/env python3
"""热搜数据采集脚本 - 每6小时运行一次"""
import json, os, time
from datetime import datetime, timezone, timedelta
from urllib.request import Request, urlopen
from urllib.error import HTTPError

TZ = timezone(timedelta(hours=8))
TOKEN = os.environ.get("QILING_TOKEN", "")
BASE_URL = "https://api.istero.com/resource/v1"
PLATFORMS = {"weibo":"微博","douyin":"抖音","baidu":"百度","toutiao":"今日头条","bilibili":"B站","zhihu":"知乎"}

def fetch(platform):
    url = f"{BASE_URL}/{platform}/top?token={TOKEN}"
    try:
        with urlopen(Request(url), timeout=15) as r:
            data = json.loads(r.read().decode())
        if data.get("code") == 200:
            items = data.get("data", [])
            print(f"  ✅ {PLATFORMS[platform]}: {len(items)}条")
            return items
        else:
            print(f"  ⚠️  {PLATFORMS[platform]}: {data.get('message','')}")
            return None
    except Exception as e:
        print(f"  ❌ {PLATFORMS[platform]}: {str(e)[:60]}")
        return None

def main():
    now = datetime.now(TZ)
    ds = now.strftime("%Y-%m-%d")
    ts = now.strftime("%H:%M:%S")
    print(f"=== 热搜数据采集 [{ds} {ts}] ===")

    result = {}
    for p in PLATFORMS:
        result[p] = fetch(p)
        time.sleep(1.1)

    snapshot = {"update_time": now.isoformat(), "date": ds, "platforms": result}
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    with open(os.path.join(root, "data", "latest.json"), "w", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, indent=2)
    print(f"\n✅ data/latest.json 已更新")

    hist_dir = os.path.join(root, "data", "history")
    os.makedirs(hist_dir, exist_ok=True)
    hf = os.path.join(hist_dir, f"{ds}.json")
    day_data = json.load(open(hf)) if os.path.exists(hf) else {"date": ds, "snapshots": []}
    day_data["snapshots"].append({"time": ts, "platforms": result})
    with open(hf, "w", encoding="utf-8") as f:
        json.dump(day_data, f, ensure_ascii=False, indent=2)
    print(f"✅ data/history/{ds}.json ({len(day_data['snapshots'])}次)")

if __name__ == "__main__":
    main()
