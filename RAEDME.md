# 病后灾区重建 — 虚拟仿真原型

一个前端静态原型，用于演示病后灾区重建资源分配与指标变化（教学与决策支持演示）。

快速开始

1. 在本地打开 `index.html`（静态文件，无需安装）。
2. 使用页面左侧调整资源与策略，点击播放开始仿真。可导出方案 JSON 与 CSV 报告。

主要文件

- `index.html` — 主页面
- `styles.css` — 样式
- `app.js` — 简易仿真逻辑与交互

依赖

- Leaflet（地图）
- Chart.js（图表）

后续建议

- 将仿真算法从前端分离到后端以允许更复杂的模型
- 支持 GeoJSON 数据导入与真实数据集
- 添加导出 PDF 报告和方案对比功能

部署到 GitHub Pages（自动化）

1. 如果尚未安装 `gh`（GitHub CLI），请先安装并登录：

```bash
# 安装 gh（示例）
choco install gh      # Windows (Chocolatey)
# 或 macOS: brew install gh
gh auth login
```

2. 在项目根目录运行：

```bash
git init
git add .
git commit -m "Initial commit: reconstruction prototype"
gh repo create <repo-name> --public --source=. --remote=origin --push
# 如果不使用 gh，可手动在 GitHub 上建仓并执行 git remote add origin ... && git push -u origin main
```

3. 本仓库包含 GitHub Actions workflow：`.github/workflows/pages.yml`，会在你推送 `main` 分支后自动构建并部署到 GitHub Pages（站点地址为 `https://<your-user>.github.io/<repo-name>/`）。

4. 本地快速预览（推荐用于调试）：

```powershell
python -m http.server 8000
# 打开 http://localhost:8000/index.html
```

注意：GitHub Pages 部署在首次启用/构建后可能需要几分钟才会生效。
