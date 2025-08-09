<div align="center">
	<h1>🛰️ DJI Offline Map Helper</h1>
	<p><strong>Simple guide to create & update offline map areas for your DJI controller.</strong></p>
	<p>No coding. No editing JSON by hand. Just import → adjust → export.</p>
    <p>Open the tool directly in your [browser](https://markus1812.github.io/dji-offline-map-helper/).</p>
</div>

---

## 👶 What Is This?
DJI controllers store offline map areas in a small file called <code>config.json</code>. This tool lets you:

1. Load (Import) your existing file.
2. See each saved offline area on a map.
3. Add new areas or adjust existing ones.
4. See how “big” they are (tile counts) so you don’t overload the controller.
5. Export a fresh <code>config.json</code> to put back on the controller.

You never have to open or understand the JSON itself. 😊

---

## ✅ Tested Devices
| Drone | Controller | Status | Notes |
|-------|------------|--------|-------|
| DJI Mini 3 | DJI RC | ✅ Working | Tile file imported / edited / reloaded successfully |

> Have another model? You can help by testing and opening a short report (works / issues).

---

## ❓ Where Is The File?
If you use an SD-card, the configuration file for the offline maps is located at the following path:
```
Android/data/dji.go.v5/files/DJI/tiles/config.json
```
Copy this file to your computer and make a backup, before modifying the file with the tool.

---

## 🧭 Using The Website/App
1. Open the site [here](https://markus1812.github.io/dji-offline-map-helper/).
2. Click **Import** and choose your saved `config.json`.
3. Your existing offline areas appear as blue rectangles.
4. To add a new area: use the rectangle drawing tool on the map (top-right tool palette). Click and drag.
5. Give it a name (or keep the default).
6. In the left panel you can:
	 * Change the name later.
	 * Adjust minimum & maximum zoom (higher max zoom = more detail = many more tiles).
	 * See tile counts. “Unique Tiles” at the top is the total across everything (overlapping areas don’t double-count).
7. If the warning text turns orange or red your map set might be too big—reduce the size or the max zoom of some areas.
8. Done? Click **Export**. A new `config.json` downloads to your computer.

---

## 🔄 Putting The File Back
1. Connect the controller again (USB) or move the SD card back.
2. Go to the same folder: `Android/data/dji.go.v5/files/DJI/tiles/`
3. Rename the old file to something like `config.backup.json` (just in case).
4. Copy your new `config.json` into that folder.
5. Fully close the DJI Fly app (or reboot the controller) so it reloads the areas.

---

## 🚦 Tile Size Warnings (Plain English)
Think of “tiles” as tiny map squares the controller has to store.

| Total Unique Tiles | Meaning |
|--------------------|---------|
| Under 5,000 | 👍 Usually fine |
| 5,000 – 10,000 | ⚠️ Large – may slow things down |
| Over 10,000 | 🔥 Risky – app might not recognize offline maps |

If you’re high:
* Lower the “Max Zoom” for big rectangles.
* Split one giant area into a few smaller ones with lower zoom.
* Remove areas you don’t really need offline.

---

## ✅ Quick Checklist
1. Backup original file.
2. Import into tool.
3. Add / adjust areas (keep an eye on warnings).
4. Export new file.
5. Replace on controller & restart app.

---

## ❓ FAQ
**Q: Do I have to edit JSON?**  
No. The tool handles it; you only move the file.

**Q: It says too many tiles. What do I do?**  
Shrink areas or lower max zoom numbers.

**Q: My new areas don’t show offline.**  
Make sure you rebooted or fully closed DJI Fly. Also ensure the file really replaced the old one.

**Q: Can I break anything?**  
Worst case: delete your added areas or restore your backup file.

**Q: Are my files uploaded anywhere?**  
No. Everything stays in your browser.

---

## 🛡️ Safety Tips
* Always keep a backup of the original `config.json`.
* Don’t try to cache enormous regions at the highest zoom.
* If performance gets sluggish, reduce high zoom areas.

---

## 🧊 Privacy
The tool only fetches map tiles from public map servers you view.
Your rectangles/config stay local in your browser memory until you export.

---

## ⚖️ Disclaimer
Unofficial helper. Not affiliated with DJI.
Tile thresholds are approximate; use at your own risk.
This tool was completly vibe-coded with GitHub Copilot Agent mode and GPT-5

---

## 🛫 Enjoy!
Have fun preparing safer offline flights. 🚁
