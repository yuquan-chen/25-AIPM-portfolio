# 25-AIPM-portfolio

在线预览：<https://yuquan-chen.github.io/25-AIPM-portfolio/>

GitHub Pages 根地址由 `index.html` 转到 `cover-preview.html`。新访客首次进入默认使用像素封面；顶部可切换纸感，选择会保存在当前浏览器中。

## 本地运行

在包含 `index.html` 的项目目录打开终端并运行：

Windows：

```powershell
py -m http.server 8780
```

macOS / Linux：

```bash
python3 -m http.server 8780
```

然后访问 <http://127.0.0.1:8780/>。按 `Ctrl+C` 停止服务器。

## 随笔区新增规范

随笔按“一级分类 → 分类内的笔记”组织。现在的 `01 / LLM TRAINING` 是第一个分类；之后可以新增 `02 / AGENT`、`03 / RSI`、`04 / MEMORY` 等。分类编号按新增顺序递增，每个分类里的笔记也从 `01` 开始，默认追加到该分类末尾。

每篇笔记只需要一个简短标题和一个日期。标题同时用作抽屉文件标签和正文标题，尽量控制在 2–8 个汉字；过长时由维护者压缩成简洁标签。日期请提供完整年份，优先用 `YYYY-MM-DD`，只知道月份时用 `YYYY-MM`，不确定具体日期时不要猜。页面会把日期简洁地显示在阅读页顶部，不重复显示分类名、`PERSONAL NOTES`、整段日期范围或多层编号说明。

添加内容时，可直接复制下面的格式发给维护者。正文可以是完整文章、要点或未经整理的草稿；图片、图表、数据来源和希望保留的原话都是可选项。

```text
操作：新增笔记 / 新建一级目录
一级目录：02 / AGENT
标题：简短标题
日期：YYYY-MM-DD（只知道月份时填 YYYY-MM）
正文：
（粘贴文章、要点或草稿）
素材与来源：（选填，可附图片或链接）
特别说明：（选填，例如哪些表达要保留、哪些内容不要展示）
```

如果是修改已有笔记，请注明“分类编号 / 笔记编号 / 标题”，再列出要改的内容。新建分类时，维护者会同时建立分类切换和对应的文件列表；不要把新分类里的笔记混进 `01 / LLM TRAINING`。

### 维护位置

- `cover-preview.html`：随笔抽屉的分类与文件标签。
- `scripts/llm-journey.js`：当前 LLM Training 笔记正文和图示。
- `motion/notes-drawer/scene.js`：抽屉动画使用的分类、文件标题和日期数据。
- `scripts/notes-drawer.js`：由 Remotion 源码生成的浏览器 bundle，不要手工编辑；修改抽屉数据或动画后，在 `motion/notes-drawer/` 下运行 `npm run build` 更新它。
