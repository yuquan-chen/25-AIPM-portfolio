const journeyStages = {
  data: {
    copy: `
      <article class="journey-copy journey-article">
        <span class="eyebrow">01 / EARLY APRIL · FROM OUTPUT TO SUPERVISION</span>
        <h3>我第一次明白，<br>数据本身就是一种判断。</h3>
        <p class="article-lede">这组实验开始于一个很朴素的想法：如果想让模型更会解决问题，训练材料里是不是也应该留下解决问题的过程？</p>
        <div class="article-body">
          <p>一开始，我只是把原来的问答重新整理：补上回答里的<span class="key-point">解题步骤</span>，再把它们保存成可以继续使用的<span class="key-point">训练数据</span>。这个过程看起来像整理文件，真正做起来却更像是在决定什么值得被留下。</p>
          <p>我不只保留最后的答案，也试着把中间那些容易被忽略的<span class="key-point">步骤</span>写下来：怎么检查，哪里走错了，怎样把大问题拆开。于是，每条数据里不只有最后的答案，<span class="key-point">解决问题的过程</span>也被保留下来了。</p>
          <blockquote class="article-quote">“我不只保留最后的答案，也想把它是怎样走到那里的写下来。”<cite>01 / A NOTE ON TRAINING DATA</cite></blockquote>
          <p>等这些数据真正进入训练流程后，我才发现，我以为自己写进去的那些步骤，模型未必会按我想的方式理解。它首先看到的，是一串需要继续写下去的文字。也就是说，我放进材料里的<span class="key-point">格式、顺序和重点</span>，都会影响它以后倾向于模仿什么。</p>
          <p>这次实验真正留下的结果，不是一个立刻变好的数字，而是我第一次看见“<span class="key-point">选择材料</span>”本身就是<span class="key-point">训练的一部分</span>。后来再看任何训练结果，我都会先问：我们到底让模型反复练习了什么？</p>
        </div>
        <p class="article-end">当我开始追踪每个 token 的训练位置时，下一步自然变成了追踪它在 Transformer 里经过了哪些层。</p>
        <a class="journey-link" href="https://github.com/yuquan-chen/LLM_Learning_Journey/tree/main/src/data_process" target="_blank" rel="noreferrer">OPEN THE DATA NOTES ON GITHUB ↗</a>
      </article>`,
    artifact: `
      <div class="journey-artifact"><div class="artifact-code"><span class="blue">BEFORE / A RESULT</span>
instruction + original reasoning + final answer

                   ↓  what should be learnable?

<span class="green">AFTER / A SUPERVISION SCHEMA</span>
&lt;backward_reasoning&gt;
  reason from the desired result
&lt;/backward_reasoning&gt;

&lt;backtracking&gt;
  revise an approach when it fails
&lt;/backtracking&gt;

&lt;verification&gt;
  check intermediate conclusions
&lt;/verification&gt;

&lt;subgoal_setting&gt;
  split the task into manageable steps
&lt;/subgoal_setting&gt;

&lt;output&gt; original reasoning &lt;/output&gt;

<span class="red">THE TURNING POINT</span>
A schema does not only store an answer.
It specifies which behaviours become visible to learning.</div></div>`
  },
    structure: {
      copy: `
      <article class="journey-copy journey-article">
        <span class="eyebrow">02 / MID APRIL · TRANSFORMER</span>
        <h3>我不再背 Transformer，<br>而是跟着它走。</h3>
        <p class="article-lede">我曾经把 Transformer 当成一张必须背下来的结构图。后来我发现，真正让我困惑的不是名词，而是不知道一段信息在模型里究竟经过了什么。</p>
        <div class="article-body">
          <p>我给自己定了一个很笨、但很有效的规则：不先背结论，只看<span class="key-point">每一步进来了什么、出去什么</span>。于是，一段文字先被变成模型可以处理的<span class="key-point">表示</span>，再被拆开去比较不同位置之间的关系，最后重新合在一起。</p>
          <p>我把这些变化画在纸上，也放进了右侧这张维度图里。每往下走一步，我就确认一次：<span class="key-point">信息有没有变长、是否分成几路、最后又有没有回到原来的大小</span>。以前看起来像黑箱的 <span class="key-point">Attention</span>，慢慢变成了一次次有迹可循的重新组合。</p>
          <blockquote class="article-quote">“不先背结论，只看每一步进来了什么、出去什么。”<cite>02 / A WAY TO READ THE MODEL</cite></blockquote>
          <p>这个过程也让我慢慢发现，教学里的 <span class="key-point">Transformer</span>、论文里的结构和实际使用的模型，虽然长得像，走的路却不一定一样。先确认自己正在看哪一种模型，比急着记住所有名词更重要。</p>
          <p>最后留下来的不是“我已经完全看懂了 Transformer”，而是一种继续学习的方法：遇到不确定的地方，就<span class="key-point">沿着信息的路径往下追</span>。速度慢一点，但每一步都更踏实。</p>
        </div>
        <p class="article-end">结构开始清楚之后，我又想知道：在最后一个 token 出现以前，模型究竟面对着怎样的选择。</p>
        <a class="journey-link" href="https://github.com/yuquan-chen/LLM_Learning_Journey/blob/main/notebooks/transformer_lean.ipynb" target="_blank" rel="noreferrer">OPEN TRANSFORMER NOTEBOOK ↗</a>
      </article>`,
    artifact: `
      <div class="journey-artifact"><div class="tensor-flow" aria-label="经典 encoder-decoder Transformer 维度流">
        <div class="tensor-legend">B = batch size · S = sequence length · D = model dimension · H = attention heads<br>D<sub>h</sub> = D / H · D<sub>ff</sub> = FFN dimension · V = vocabulary size</div>

        <div class="tensor-section">ENCODER / SOURCE STREAM</div>
        <div class="tensor-stage">
          <div class="tensor-card tensor-action"><small>01 / ENCODE</small><b>Token Embedding<br>+ Positional Encoding</b></div>
          <div class="tensor-card tensor-shape" role="button" tabindex="0" aria-expanded="false" data-tensor-detail="embedding"><strong>Source token IDs</strong>[B, S<sub>src</sub>]<span class="shape-arrow">↓</span>[B, S<sub>src</sub>, D]<span class="tensor-open">Formula / pseudocode</span></div>
        </div>
        <div class="tensor-stage">
          <div class="tensor-card tensor-action"><small>02 / PROJECT</small><b>Q / K / V Projection<br>+ Split Heads</b></div>
          <div class="tensor-card tensor-shape" role="button" tabindex="0" aria-expanded="false" data-tensor-detail="qkv">Q, K, V: [B, S<sub>src</sub>, D]<span class="shape-arrow">↓</span>each [B, H, S<sub>src</sub>, D<sub>h</sub>]<span class="tensor-open">Formula / pseudocode</span></div>
        </div>
        <div class="tensor-stage">
          <div class="tensor-card tensor-action"><small>03 / ATTEND</small><b>Scaled Dot-Product<br>Self-Attention</b></div>
          <div class="tensor-card tensor-shape" role="button" tabindex="0" aria-expanded="false" data-tensor-detail="selfAttention">QKᵀ / √D<sub>h</sub>: [B, H, S<sub>src</sub>, S<sub>src</sub>]<span class="shape-arrow">↓</span>Attention × V: [B, H, S<sub>src</sub>, D<sub>h</sub>]<span class="tensor-open">Formula / pseudocode</span></div>
        </div>
        <div class="tensor-stage">
          <div class="tensor-card tensor-action"><small>04 / MERGE</small><b>Concat Heads<br>+ Output Projection</b></div>
          <div class="tensor-card tensor-shape" role="button" tabindex="0" aria-expanded="false" data-tensor-detail="merge">[B, H, S<sub>src</sub>, D<sub>h</sub>]<span class="shape-arrow">↓</span>[B, S<sub>src</sub>, D]<span class="tensor-open">Formula / pseudocode</span></div>
        </div>
        <div class="tensor-stage">
          <div class="tensor-card tensor-action"><small>05 / TRANSFORM</small><b>Residual + Norm<br>+ Position-wise FFN</b></div>
          <div class="tensor-card tensor-shape" role="button" tabindex="0" aria-expanded="false" data-tensor-detail="encoderFfn">[B, S<sub>src</sub>, D] → [B, S<sub>src</sub>, D<sub>ff</sub>]<span class="shape-arrow">↓</span>[B, S<sub>src</sub>, D]<span class="tensor-open">Formula / pseudocode</span></div>
        </div>
        <div class="tensor-stage flow-end">
          <div class="tensor-card tensor-action"><small>06 / REMEMBER</small><b>Encoder Memory</b></div>
          <div class="tensor-card tensor-shape" role="button" tabindex="0" aria-expanded="false" data-tensor-detail="memory"><strong>Memory passed to cross-attention</strong>[B, S<sub>src</sub>, D]<span class="tensor-open">Formula / pseudocode</span></div>
        </div>

        <div class="tensor-section">DECODER / TARGET STREAM + MEMORY</div>
        <div class="tensor-stage">
          <div class="tensor-card tensor-action"><small>01 / DECODE</small><b>Target Embedding<br>+ Positional Encoding</b></div>
          <div class="tensor-card tensor-shape" role="button" tabindex="0" aria-expanded="false" data-tensor-detail="targetEmbedding">[B, S<sub>tgt</sub>]<span class="shape-arrow">↓</span>[B, S<sub>tgt</sub>, D]<span class="tensor-open">Formula / pseudocode</span></div>
        </div>
        <div class="tensor-stage">
          <div class="tensor-card tensor-action"><small>02 / MASK</small><b>Causal<br>Self-Attention</b></div>
          <div class="tensor-card tensor-shape" role="button" tabindex="0" aria-expanded="false" data-tensor-detail="causalAttention">Scores: [B, H, S<sub>tgt</sub>, S<sub>tgt</sub>]<span class="shape-arrow">↓</span>[B, S<sub>tgt</sub>, D]<span class="tensor-open">Formula / pseudocode</span></div>
        </div>
        <div class="tensor-stage">
          <div class="tensor-card tensor-action"><small>03 / RETRIEVE</small><b>Encoder–Decoder<br>Cross-Attention</b></div>
          <div class="tensor-card tensor-shape" role="button" tabindex="0" aria-expanded="false" data-tensor-detail="crossAttention">Q: [B, H, S<sub>tgt</sub>, D<sub>h</sub>]<br>K, V: [B, H, S<sub>src</sub>, D<sub>h</sub>]<span class="shape-arrow">↓</span>Scores: [B, H, S<sub>tgt</sub>, S<sub>src</sub>]<span class="tensor-open">Formula / pseudocode</span></div>
        </div>
        <div class="tensor-stage">
          <div class="tensor-card tensor-action"><small>04 / TRANSFORM</small><b>Residual + Norm<br>+ Position-wise FFN</b></div>
          <div class="tensor-card tensor-shape" role="button" tabindex="0" aria-expanded="false" data-tensor-detail="decoderFfn">[B, S<sub>tgt</sub>, D] → [B, S<sub>tgt</sub>, D<sub>ff</sub>]<span class="shape-arrow">↓</span>[B, S<sub>tgt</sub>, D]<span class="tensor-open">Formula / pseudocode</span></div>
        </div>
        <div class="tensor-stage flow-end">
          <div class="tensor-card tensor-action"><small>05 / PREDICT</small><b>Vocabulary Projection<br>+ Log Softmax</b></div>
          <div class="tensor-card tensor-shape" role="button" tabindex="0" aria-expanded="false" data-tensor-detail="vocab">[B, S<sub>tgt</sub>, D]<span class="shape-arrow">↓</span><strong>[B, S<sub>tgt</sub>, V]</strong><span class="tensor-open">Formula / pseudocode</span></div>
        </div>
      </div></div>`
  },
  state: {
    copy: `
      <article class="journey-copy journey-article">
        <span class="eyebrow">03 / LATE APRIL · GENERATION TRACE</span>
        <h3>答案出现以前，<br>模型经历了什么。</h3>
        <p class="article-lede">以前我只关心模型给出的答案是否通顺。后来我开始好奇：一句话出现以前，模型是不是也经历了许多我们看不见的选择？</p>
        <div class="article-body">
          <p>我开始把一次回答拆成<span class="key-point">许多小步</span>来看。模型读到当前的<span class="key-point">上下文</span>，决定接下来写什么，再把刚刚写下的内容放回整句话里，继续往前走。它不是先在某个地方想好完整答案，再一次性把答案交给我。</p>
          <p>这样看以后，一个看似普通的标点、一次换行，甚至一个空格，都可能让<span class="key-point">下一步的选择发生变化</span>。最后出现在屏幕上的句子，只是许多局部决定连在一起之后留下的轨迹。</p>
          <blockquote class="article-quote">“最后出现在屏幕上的句子，只是许多局部决定连在一起之后留下的轨迹。”<cite>03 / GENERATION AS A SEQUENCE</cite></blockquote>
          <p>我也看过 <span class="key-point">PPL 曲线</span>。它只能提醒我哪些位置更难预测，不能直接告诉我模型在想什么。所以我开始把曲线当成<span class="key-point">线索，而不是结论</span>。某个位置的波动，可能提醒我这里比较难预测；但真正有用的，还是把这些变化和具体的文字、上下文放在一起看。</p>
          <p>这段经历给我的收获，是终于开始关注答案没有出现以前的那一片空间。<span class="key-point">理解生成，不能只看最后说了什么</span>，也要看它是怎样一步一步走到那里的。</p>
        </div>
        <p class="article-end">当我看见一个模型每一步都在候选中做选择时，我开始好奇：换一个训练阶段，这些选择能不能在同一张地图上留下不同的轨迹？</p>
        <a class="journey-link" href="https://github.com/yuquan-chen/LLM_Learning_Journey/blob/main/src/analysis/plot_token_ppl_curve.py" target="_blank" rel="noreferrer">READ THE ANALYSIS SCRIPT ↗</a>
      </article>`,
    artifact: `
      <div class="journey-artifact"><div class="ppl-plot">
        <svg viewBox="0 0 720 390" role="img" aria-label="PPL 与注意力方差方法示意">
          <g stroke="rgba(33,30,25,.16)" stroke-width="1"><path d="M65 45V330H675"/><path d="M65 110H675M65 180H675M65 250H675"/></g>
          <path d="M70 92 C130 64 145 190 210 156 S300 235 360 172 S450 104 510 144 S600 208 670 112" fill="none" stroke="#53666a" stroke-width="3"/>
          <g fill="#984536"><circle cx="112" cy="104" r="7"/><circle cx="202" cy="159" r="11"/><circle cx="292" cy="205" r="15"/><circle cx="408" cy="137" r="8"/><circle cx="518" cy="150" r="13"/><circle cx="628" cy="158" r="9"/></g>
          <text x="72" y="30" fill="#53666a" font-family="monospace" font-size="14">TOKEN NLL / GENERATION STEP</text>
          <text x="386" y="312" fill="#984536" font-family="monospace" font-size="12">COLOR + SIZE = ATTENTION STATISTIC</text>
        </svg>
        <footer>Two complementary views / prediction loss + attention distribution</footer>
      </div></div>`
  },
  distribution: {
    copy: `
      <article class="journey-copy journey-article">
        <span class="eyebrow">04 / MAY · TOKEN SPACE</span>
        <h3>我把三组模型输出，<br>放进同一张地图。</h3>
        <p class="article-lede">前一篇里，我看见了模型怎样一步一步生成文字。到了五月，我又想知道：如果模型经历了不同的训练，这些文字会不会在空间里留下不同的形状？</p>
        <div class="article-body">
          <p>我把 <span class="key-point">baseline、continued training 和 LoRA SFT</span> 三个模型放到一起比较，让它们面对同一个问题，再把各自生成出来的文字放进一张<span class="key-point">共享的二维地图</span>里。这张地图是先用 baseline 的 <span class="key-point">token embedding</span> 做出来的。第一次看到结果时，我很容易被形状吸引：有的点铺得开一些，有的点聚得更近，旁边还跟着一圈圈椭圆。</p>
          <p>图形很像主动在讲故事：模型的变化终于被我“看见”了。但我很快意识到，这张地图终究只是我选择的一种<span class="key-point">观察方式</span>，不是模型本身。它能让我看到几组输出走过的轨迹，却还不足以回答<span class="key-point">模型能力有没有变好</span>。</p>
          <blockquote class="article-quote">“地图不是模型本身，它只是我选择的一种观察方式。”<cite>04 / A MAP IS STILL A MAP</cite></blockquote>
          <p>这张图最后给我的意义，不是找到一个漂亮的结论，而是学会在被图形打动之后，再回头问几个简单的问题：这张地图从哪里开始？哪些东西被放了进来？不同的生成过程真的可以这样比较吗？</p>
          <p><span class="key-point">可视化因此变成了一种更诚实的工具</span>。它帮我打开一个角度，也提醒我不要把一个角度误认为全部答案。</p>
        </div>
        <p class="article-end">回头看，这四段学习把我从“模型学到了什么”，带到了“我究竟测到了什么”；这大概是我继续做实验时最想保留的习惯。</p>
        <a class="journey-link" href="https://github.com/yuquan-chen/LLM_Learning_Journey/blob/main/notebooks/UMAP_and_Ellipse.ipynb" target="_blank" rel="noreferrer">OPEN THE REAL NOTEBOOK ↗</a>
      </article>`,
    artifact: `
      <div class="journey-artifact"><figure class="artifact-figure">
        <img src="./assets/llm/token-distribution-study.webp" alt="Base、Training 与 SFT 模型的 Token UMAP 密度及标准差椭圆对比">
        <figcaption><span>REAL NOTEBOOK OUTPUT / BASELINE-EMBEDDING UMAP</span><span>GENERATED TOKENS · KDE · COV ELLIPSE</span></figcaption>
      </figure></div>`
  }
};

const journeyDetail = document.getElementById('journey-detail');
const journeySteps = [...document.querySelectorAll('[data-journey]')];
let tensorResizeObserver;

const tensorDetails = {
  embedding: {
    formula: 'X₀ = Embedding(ids) · √D + PE[:, :S<sub>src</sub>, :]',
    code: `x = token_embedding(src_ids) * sqrt(D)
pe = positional_encoding[:, :S_src, :]

# broadcast positional encoding over B
x = x + pe`
  },
  qkv: {
    formula: 'Q = XW<sub>Q</sub> · K = XW<sub>K</sub> · V = XW<sub>V</sub>',
    code: `q = Wq(x)
k = Wk(x)
v = Wv(x)

q = q.reshape(B, S_src, H, D_h)
q = q.transpose(1, 2)
k = k.reshape(B, S_src, H, D_h)
k = k.transpose(1, 2)
v = v.reshape(B, S_src, H, D_h)
v = v.transpose(1, 2)`
  },
  selfAttention: {
    formula: 'A = softmax(QKᵀ / √D<sub>h</sub> + M) · Head = AV',
    code: `scores = (q @ k.transpose(-2, -1)) / sqrt(D_h)\nscores = apply_padding_mask(scores)\nattention = softmax(scores, dim=-1)\nhead_output = attention @ v`
  },
  merge: {
    formula: 'Y = Concat(head₁, …, head<sub>H</sub>)W<sub>O</sub>',
    code: `y = head_output.transpose(1, 2)
y = y.contiguous()
y = y.reshape(B, S_src, H * D_h)

# H * D_h = D
y = output_projection(y)`
  },
  encoderFfn: {
    formula: 'FFN(X) = W₂ σ(W₁X + b₁) + b₂',
    code: `x = x + attention(norm(x))

hidden = W1(norm(x))
hidden = activation(hidden)
x = x + W2(hidden)

# [B, S_src, D]
# → [B, S_src, D_ff]
# → [B, S_src, D]`
  },
  memory: {
    formula: 'Memory = Encoder(source)',
    code: `memory = encoder(
    src_ids,
    src_mask
)

# one D-dimensional vector
# for each source position
shape = [B, S_src, D]`
  },
  targetEmbedding: {
    formula: 'Z₀ = Embedding(tgt) · √D + PE[:, :S<sub>tgt</sub>, :]',
    code: `z = token_embedding(tgt_ids) * sqrt(D)
pe = positional_encoding[:, :S_tgt, :]
z = z + pe`
  },
  causalAttention: {
    formula: 'A = softmax(QKᵀ / √D<sub>h</sub> + M<sub>causal</sub>)',
    code: `scores = (q @ k.transpose(-2, -1))
scores = scores / sqrt(D_h)
scores = scores.masked_fill(
    future_positions,
    -inf
)
weights = softmax(scores, dim=-1)
z = weights @ v`
  },
  crossAttention: {
    formula: 'Q = ZW<sub>Q</sub> · K = MemoryW<sub>K</sub> · V = MemoryW<sub>V</sub>',
    code: `q = split_heads(Wq(decoder_state))
k = split_heads(Wk(memory))
v = split_heads(Wv(memory))

# Q follows S_tgt; K and V follow S_src
scores = q @ k.transpose(-2, -1)
scores = scores / sqrt(D_h)
z = softmax(scores, dim=-1) @ v`
  },
  decoderFfn: {
    formula: 'FFN(Z) = W₂ σ(W₁Z + b₁) + b₂',
    code: `z = z + cross_attention(
    norm(z),
    memory
)

hidden = W1(norm(z))
hidden = activation(hidden)
z = z + W2(hidden)

# [B, S_tgt, D]
# → [B, S_tgt, D_ff]
# → [B, S_tgt, D]`
  },
  vocab: {
    formula: 'logits = ZW<sub>vocab</sub> + b · log p = log_softmax(logits)',
    code: `logits = vocabulary_projection(z)
log_probs = log_softmax(logits, dim=-1)

# one V-dimensional distribution
# for every target position`
  }
};

const tensorActionDetails = {
  encode: { what: '把每个 token 变成模型可以处理的向量，并补上它在句子中的位置信息。', effect: '文字从离散编号变成带有语义和位置的连续表示。' },
  project: { what: '把同一份表示投影成 Q、K、V，并拆成多个注意力头。', effect: '模型可以从不同角度比较序列中的位置。' },
  attend: { what: '计算每个位置应该关注其他位置的程度，再汇总相关信息。', effect: '每个 token 都得到结合上下文后的新表示。' },
  merge: { what: '把多个注意力头重新拼回一条表示，再做一次整体变换。', effect: '分头得到的信息回到统一的模型维度。' },
  encoderTransform: { what: '保留原表示，同时用归一化和前馈网络继续整理特征。', effect: '表示经过更深一层变换，但形状仍保持稳定。' },
  remember: { what: '保存编码器读完整个源序列后形成的中间表示。', effect: '解码器之后可以回看源序列中的信息。' },
  decode: { what: '把目标序列的 token 编号变成向量，并加入目标位置。', effect: '模型获得生成端当前序列的初始表示。' },
  mask: { what: '只允许当前位置看到已经出现的 token，遮住未来位置。', effect: '生成过程保持从左到右，不会提前看到答案。' },
  retrieve: { what: '让生成端的表示去读取编码器留下的源序列信息。', effect: '当前要生成的内容可以和输入内容重新对齐。' },
  decoderTransform: { what: '继续整理已经融合上下文的目标表示。', effect: '每个目标位置得到更适合预测下一个 token 的表示。' },
  predict: { what: '把隐藏表示投影到整个词表，并得到每个 token 的分数。', effect: '模型可以从词表中选择下一步输出。' }
};

function toggleTensorDetail(card) {
  const detail = tensorDetails[card.dataset.tensorDetail];
  if (!detail) return;
  const shouldOpen = !card.classList.contains('is-open');
  journeyDetail.querySelectorAll('.tensor-action.is-open').forEach((openCard) => {
    openCard.classList.remove('is-open');
    openCard.setAttribute('aria-expanded', 'false');
  });
  journeyDetail.querySelectorAll('.tensor-shape.is-open').forEach((openCard) => {
    openCard.classList.remove('is-open');
    openCard.setAttribute('aria-expanded', 'false');
  });
  if (!shouldOpen) {
    scheduleTensorConnectorSync();
    return;
  }
  let panel = card.querySelector('.tensor-detail');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'tensor-detail';
    panel.innerHTML = `
      <span class="tensor-detail-label">Formula</span>
      <code class="tensor-formula">${detail.formula}</code>
      <span class="tensor-detail-label">Pseudocode</span>
      <pre>${detail.code}</pre>`;
    card.appendChild(panel);
  }
  card.classList.add('is-open');
  card.setAttribute('aria-expanded', 'true');
  scheduleTensorConnectorSync();
}

function toggleTensorAction(card) {
  const detail = tensorActionDetails[card.dataset.actionDetail];
  if (!detail) return;
  const shouldOpen = !card.classList.contains('is-open');
  journeyDetail.querySelectorAll('.tensor-shape.is-open').forEach((openCard) => {
    openCard.classList.remove('is-open');
    openCard.setAttribute('aria-expanded', 'false');
  });
  journeyDetail.querySelectorAll('.tensor-action.is-open').forEach((openCard) => {
    openCard.classList.remove('is-open');
    openCard.setAttribute('aria-expanded', 'false');
  });
  if (!shouldOpen) {
    scheduleTensorConnectorSync();
    return;
  }
  let panel = card.querySelector('.tensor-action-detail');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'tensor-action-detail';
    panel.innerHTML = `<strong>这一步做什么</strong><p>${detail.what}</p><strong>它带来的变化</strong><p>${detail.effect}</p>`;
    card.appendChild(panel);
  }
  card.classList.add('is-open');
  card.setAttribute('aria-expanded', 'true');
  scheduleTensorConnectorSync();
}

function scheduleTensorConnectorSync() {
  requestAnimationFrame(() => {
    syncTensorConnectors();
    window.setTimeout(syncTensorConnectors, 360);
  });
}

function syncTensorConnectors() {
  const stages = [...journeyDetail.querySelectorAll('.tensor-stage')];
  stages.slice(0, -1).forEach((stage, stageIndex) => {
    const stageRect = stage.getBoundingClientRect();
    const nextStage = stages[stageIndex + 1];
    [
      ['.tensor-action', '.tensor-connector-left'],
      ['.tensor-shape', '.tensor-connector-right']
    ].forEach(([cardSelector, connectorSelector]) => {
      const card = stage.querySelector(cardSelector);
      const connector = stage.querySelector(connectorSelector);
      if (!card || !connector) return;
      const cardRect = card.getBoundingClientRect();
      const nextCard = nextStage.querySelector(cardSelector);
      const nextTop = nextCard
        ? nextCard.getBoundingClientRect().top - stageRect.top
        : nextStage.getBoundingClientRect().top - stageRect.top;
      const top = cardRect.bottom - stageRect.top;
      connector.style.left = `${cardRect.left - stageRect.left + cardRect.width / 2}px`;
      connector.style.top = `${top}px`;
      connector.style.height = `${Math.max(12, nextTop - top - 11)}px`;
    });
  });
}

function prepareTensorFlow() {
  tensorResizeObserver?.disconnect();
  const stages = [...journeyDetail.querySelectorAll('.tensor-stage:not(.flow-end)')];
  if (!stages.length) return;
  const actionKeys = ['encode', 'project', 'attend', 'merge', 'encoderTransform', 'remember', 'decode', 'mask', 'retrieve', 'decoderTransform', 'predict'];
  stages.forEach((stage, index) => {
    const action = stage.querySelector('.tensor-action');
    if (action) {
      action.dataset.actionDetail = actionKeys[index];
      action.setAttribute('role', 'button');
      action.setAttribute('tabindex', '0');
      action.setAttribute('aria-expanded', 'false');
    }
    if (!stage.querySelector('.tensor-connector-left')) {
      stage.insertAdjacentHTML('beforeend', '<span class="tensor-connector tensor-connector-left" aria-hidden="true"></span><span class="tensor-connector tensor-connector-right" aria-hidden="true"></span>');
    }
  });
  syncTensorConnectors();
  if ('ResizeObserver' in window) {
    tensorResizeObserver = new ResizeObserver(syncTensorConnectors);
    stages.forEach((stage) => {
      if (stage instanceof Element && stage.isConnected) tensorResizeObserver.observe(stage);
    });
  }
}

function selectJourneyStage(key) {
  const stage = journeyStages[key];
  if (!stage) return;
  journeyDetail.innerHTML = stage.copy + stage.artifact;
  journeySteps.forEach((step) => step.setAttribute('aria-selected', String(step.dataset.journey === key)));
  requestAnimationFrame(prepareTensorFlow);
}

journeySteps.forEach((step) => step.addEventListener('click', () => selectJourneyStage(step.dataset.journey)));
journeyDetail.addEventListener('click', (event) => {
  if (event.target.closest('.tensor-detail, .tensor-action-detail')) return;
  const action = event.target.closest('.tensor-action[data-action-detail]');
  if (action) {
    toggleTensorAction(action);
    return;
  }
  const card = event.target.closest('.tensor-shape[data-tensor-detail]');
  if (card) toggleTensorDetail(card);
});
journeyDetail.addEventListener('keydown', (event) => {
  const action = event.target.closest('.tensor-action[data-action-detail]');
  if (action && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    toggleTensorAction(action);
    return;
  }
  const card = event.target.closest('.tensor-shape[data-tensor-detail]');
  if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  toggleTensorDetail(card);
});
selectJourneyStage('data');
