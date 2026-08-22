# 首页整合预览

这一版将已确认的 A–I 首页布局，与两份真实项目原型进行了统一编排：

- 陪伴式 Agent：保留完整 10 轮连续演示，新增嵌入铭牌与轮次进度。
- LLM 学习记录：作为一个完整研究项目展示，支持三张索引卡与笔记详情切换。
- Finance Agent：本轮保留已确认的 Featured System 展框，尚未接入 Three.js 页面。

## 运行

请不要双击 `index.html`，使用静态服务器运行：

```bash
cd /Users/dogpay/Desktop/25点学习-personal-website/09-首页整合预览
python3 -m http.server 8780
```

然后访问：

```text
http://127.0.0.1:8780/
```

## 本轮目的

这是内容、尺寸、编排与视觉语言的整合预览，不是最终上线版本。后续可继续接入 Finance Agent、城市可听化与 AIStudio。
