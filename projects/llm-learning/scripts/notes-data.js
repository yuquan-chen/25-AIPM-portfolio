// 笔记数据
const NOTES = {
  sft: {
    title: 'SFT 到底改变了什么？',
    date: '2025.04',
    content: `
      <p class="research-time">研究时间：2025年4月</p>

      <h2>发现过程</h2>
      <p>用LoRA微调Qwen（r=8），发现输出格式变统一了，不再有冗长的"让我来思考..."开场白。但对于推理任务，改善并不明显。</p>
      <p class="red-text">疑问：SFT是在学习新能力，还是只是学会了"如何说话"？</p>

      <h2>验证方法</h2>
      <p>观察训练过程中的Token分布变化：</p>
      <ol>
        <li>收集不同训练阶段的token embeddings</li>
        <li>UMAP降维到2D</li>
        <li>拟合标准椭圆，对比形状变化</li>
      </ol>

      <h2>发现</h2>
      <p><span class="blue-text">SFT阶段</span>：Token分布显著<span class="green-text">散开</span></p>
      <p><span class="blue-text">RLHF阶段</span>：Token分布开始<span class="green-text">集中</span></p>
      <p class="red-text">结论：SFT是在"散开"表达空间，让模型学会更多样的响应方式，而非学习新知识。RL再收敛到优质表达。</p>

      <h2>Bad Case</h2>
      <p>鸡兔同笼问题：Base Model会给出完整推理过程，SFT后直接给答案。推理过程被隐藏了。</p>

      <h2>判断</h2>
      <p class="red-text">SFT改变的是表达方式，而非能力本身。Base Model已经"知道"，只是不知道"如何输出"。</p>

      <div class="meta-info">
        代码位置：<code>src/training/sft/SFT_LoRA.py</code><br>
        相关笔记：NOTE-002《Token 分布训练规律的发现》
      </div>
    `
  },
  token: {
    title: 'Token 分布训练规律的发现',
    date: '2025.05',
    content: `
      <p class="research-time">研究时间：2025年5月</p>

      <h2>疑问</h2>
      <p>模型内部表征在训练过程中是如何变化的？能否"看见"这个变化？</p>

      <h2>方法</h2>
      <ol>
        <li>收集Base/Pretrain/SFT/RLHF四个阶段的token embeddings</li>
        <li>UMAP降维到2D</li>
        <li>为每个阶段拟合标准椭圆，对比形状和大小</li>
      </ol>
      <p class="blue-text">数据规模：984个tokens（Group1: 481, Group2: 503）</p>

      <h2>发现</h2>
      <p><span class="blue-text">Base</span>：中等椭圆（基准）</p>
      <p><span class="blue-text">Pretrain</span>：开始调整（逐步优化）</p>
      <p><span class="blue-text">SFT</span>：<span class="green-text">📈 分布散开</span></p>
      <p><span class="blue-text">RLHF</span>：<span class="green-text">📉 分布集中</span></p>

      <h2>理解</h2>
      <p><span class="red-text">SFT散开分布</span>：模型学会更多样的响应方式（不同指令格式、回答风格）</p>
      <p><span class="red-text">RL集中分布</span>：人类反馈收敛到优质表达</p>
      <p class="red-text">与直觉相反：训练不一定是"收敛"，SFT阶段反而是"散开"的。</p>

      <h2>意义</h2>
      <p>为理解训练过程提供新视角：SFT在"扩展"表达空间，RL在"优化"表达质量。</p>

      <div class="meta-info">
        分析工具：<code>notebooks/UMAP_and_Ellipse.ipynb</code><br>
        结果目录：<code>examples/analysis/token_ellipse/</code>
      </div>
    `
  },
  ppl: {
    title: '如何看见模型的"纠结"与"确定"',
    date: '2025.04',
    content: `
      <p class="research-time">研究时间：2025年4月</p>

      <h2>疑问</h2>
      <p>模型生成过程中，内部注意力是如何变化的？与困惑度有什么关系？</p>

      <h2>方法</h2>
      <p>结合两个指标：</p>
      <ul>
        <li><span class="blue-text">PPL</span>：exp(loss)，衡量预测不确定性</li>
        <li><span class="blue-text">Attention Variance</span>：注意力分布方差，衡量关注集中度</li>
      </ul>
      <p class="red-text">创新点：用PPL曲线追踪生成质量，用颜色编码展示方差变化。</p>

      <h2>发现</h2>
      <p><span class="blue-text">开头</span>：高PPL + 高方差（还在理解任务）</p>
      <p><span class="blue-text">中间</span>：波动（逐步生成）</p>
      <p><span class="blue-text">结尾</span>：低PPL + 低方差（确定如何结束）</p>

      <p><span class="red-text">高PPL + 高方差</span>：模型在多个可能性间犹豫（纠结）</p>
      <p><span class="red-text">低PPL + 低方差</span>：模型明确知道该生成什么（确定）</p>

      <h2>应用价值</h2>
      <ul>
        <li>Debug生成质量：定位模型"纠结"的位置，改进提示</li>
        <li>训练监控：追踪训练过程中"纠结"程度变化</li>
        <li>模型对比：不同模型在同一任务上的"确定"程度</li>
      </ul>

      <h2>局限性</h2>
      <p>只分析了最后一层的注意力方差，多层、多head的差异有待探索。</p>

      <div class="meta-info">
        分析工具：<code>src/analysis/plot_token_ppl_curve.py</code><br>
        结果目录：<code>examples/analysis/ppl_attn/</code>
      </div>
    `
  }
};
