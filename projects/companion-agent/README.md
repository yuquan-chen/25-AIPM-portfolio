# 陪伴式 Agent - 交付文件

## 📦 包含内容

### 1. index.html
**可运行的 HTML Demo**
- 完全自动演示的陪伴式 Agent 系统
- 10轮对话场景，从游戏失利到周末聚会安排
- 支持嵌入参数：`?embed=1` 和 `?autoplay=0`
- 双击即可在浏览器中运行

### 2. project.md
**项目说明文档**
- 问题分析、系统架构、我的工作
- 结果展示和反思
- 商业化思考

### 3. html-cover.html
**封面图（HTML版本）**
- 可用于项目展示的封面设计
- 支持浏览器截图保存为PNG

## 🚀 如何使用

### 直接运行 Demo
```bash
# 双击 index.html 文件
# 或者在命令行中：
open index.html
```

### 嵌入到网站
```html
<!-- 嵌入模式 -->
<iframe 
  src="./companion-agent/index.html?embed=1" 
  title="陪伴式 Agent Demo"
  loading="lazy"
  style="border: none; width: 100%; height: 600px;">
</iframe>

<!-- 手动控制播放 -->
<iframe 
  src="./companion-agent/index.html?embed=1&autoplay=0" 
  title="陪伴式 Agent Demo">
</iframe>
```

### 获取封面图
1. 打开 `html-cover.html`
2. 使用浏览器截图工具或打印功能保存为PNG
3. 或直接使用HTML版本作为封面

## 🎯 Demo 功能

**完整演示流程**（10轮对话）：
1. 游戏失利后的安慰回复（AI建议）
2. 约时间的犹豫（AI建议）
3. 邀请朋友（直接回复）
4. 担心合不来（AI主动回复）
5. 讨论吃什么（直接回复）
6. 确定时间地点（AI建议）
7. 晚点到达（AI建议）
8. 推荐好地方（直接回复）
9. 表达期待（AI建议）
10. 最后确认（直接回复）

**技术特点**：
- 完全自动运行，循环播放
- AI建议3秒后自动发送
- 固定大小对话框，支持滚动
- 实时感知指标显示
- 响应式设计

## 📁 建议目录结构

```
personal-website/
└── companion-agent/
    ├── index.html          # 可运行Demo
    ├── project.md          # 项目说明
    ├── cover.html          # 封面图（可选）
    └── README.md           # 使用说明
```

## 🎨 设计说明

**配色方案**：
- 暖纸色：#E9DFCA
- 墨黑色：#25201D  
- 酒红色：#743F43
- 柔粉色：#C88F82
- 暗绿色：#405248
- 灰褐色：#9C8E7B

**设计风格**：
- 夜间情绪观察日志 × 社交通讯档案
- 克制、温暖、略带夜晚气息
- 体现系统如何判断与行动

---

**交付日期**：2026-08-20
**版本**：v1.0
