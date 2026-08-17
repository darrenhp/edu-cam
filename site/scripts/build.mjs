// edu-cam 静态站点生成器
// 读取 content/ 下的 Markdown 文件，套用共享 layout，输出 dist/ 静态 HTML。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const SRC = path.join(ROOT, 'src');
const PUBLIC = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');

// ---- 站点基址（GitHub Pages 项目站需要 /<repo>/ 前缀；本地预览留空）----
const RAW_BASE = process.env.SITE_BASE || '/';
const BASE = RAW_BASE === '/' ? '/' : (RAW_BASE.endsWith('/') ? RAW_BASE : RAW_BASE + '/');

// ---- 板块配置（信息架构，见项目计划第3节）----
const SECTIONS = [
  { key: 'cam', title: 'CAM技术百科', en: 'What is CAM', icon: '⚙️' },
  { key: 'processes', title: '精密加工工艺库', en: 'Processes', icon: '🔧' },
  { key: 'chain', title: '产业链地图', en: 'Supply Chain', icon: '🗺️' },
  { key: 'market', title: '市场与趋势', en: 'Market & Trends', icon: '📈' },
  { key: 'history', title: '历史与演进', en: 'History', icon: '🕰️' },
  { key: 'cases', title: '案例研究', en: 'Case Studies', icon: '🧪' },
  { key: 'resources', title: '资源中心', en: 'Resources', icon: '📚' },
  { key: 'glossary', title: '术语词典', en: 'Glossary', icon: '📖' },
  { key: 'about', title: '关于本站', en: 'About', icon: 'ℹ️' },
];
const SECTION_MAP = Object.fromEntries(SECTIONS.map(s => [s.key, s]));

// ---- 收集所有内容页 ----
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

const mdFiles = fs.existsSync(CONTENT) ? walk(CONTENT) : [];
const pages = [];

for (const file of mdFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const rel = path.relative(CONTENT, file).replace(/\\/g, '/');
  const sectionKey = rel.split('/')[0];
  const slug = path.basename(file, '.md');
  const section = SECTION_MAP[sectionKey];
  if (!section) continue;
  pages.push({
    file,
    sectionKey,
    section,
    slug,
    title: data.title || slug,
    order: data.order ?? 999,
    tags: data.tags || [],
    sources: data.sources || [],
    updated: data.updated || '',
    summary: data.summary || '',
    level: data.level || '',
    url: `/${sectionKey}/${slug}.html`,
  });
}
pages.sort((a, b) => a.sectionKey.localeCompare(b.sectionKey) || a.order - b.order);

// ---- 每板块的页列表 ----
const pagesBySection = {};
for (const p of pages) (pagesBySection[p.sectionKey] ||= []).push(p);

// ---- Markdown 配置：标题加 id 用于 TOC ----
marked.setOptions({ gfm: true, breaks: false });
const renderer = new marked.Renderer();
renderer.heading = function (text, level, raw) {
  const id = raw.toLowerCase().replace(/[^\w\u4e00-\u9fa5-]+/g, '-').replace(/^-+|-+$/g, '');
  return `<h${level} id="${id}">${text}</h${level}>\n`;
};
marked.use({ renderer });

function mdToHtml(md) { return marked.parse(md); }

// 将内部绝对路径（/...）转为相对路径，配合 <base> 标签适配子路径部署
function relativize(html) {
  return html.replace(/(href|src)="\//g, '$1="');
}
const stripBase = (u) => u.replace(/^\//, '');

// ---- 侧边栏导航 ----
function buildSidebar(activeUrl) {
  let html = '<nav class="side-nav" aria-label="板块导航">';
  for (const s of SECTIONS) {
    const sp = pagesBySection[s.key] || [];
    const isIndex = activeUrl === `/${s.key}/index.html`;
    const containsActive = sp.some(p => p.url === activeUrl);
    const isActiveSection = isIndex || containsActive;
    const groupCls = 'side-group' + (isActiveSection ? ' open' : '');
    const titleActive = isIndex ? ' active' : '';
    html += `<div class="${groupCls}" data-section="${s.key}">
      <div class="side-group-head">
        <button class="side-group-toggle" type="button" aria-label="展开或收起该板块" aria-expanded="${isActiveSection ? 'true' : 'false'}" onclick="toggleSideGroup(this)">▾</button>
        <a class="side-group-title${titleActive}" href="/${s.key}/index.html">${s.icon} ${s.title}</a>
      </div>`;
    if (sp.length) {
      html += '<ul class="side-group-list">';
      for (const p of sp) {
        const active = p.url === activeUrl ? ' active' : '';
        html += `<li><a class="side-link${active}" href="${p.url}">${p.title}</a></li>`;
      }
      html += '</ul>';
    }
    html += '</div>';
  }
  html += '</nav>';
  return html;
}

// ---- 顶部全局导航 ----
function buildTopNav(activeKey) {
  let html = '<nav class="top-nav" aria-label="主导航"><ul>';
  for (const s of SECTIONS) {
    const active = s.key === activeKey ? ' active' : '';
    html += `<li><a class="${active}" href="/${s.key}/index.html">${s.title}</a></li>`;
  }
  html += '</ul></nav>';
  return html;
}

// ---- 页脚来源（引用）----
function buildSources(sources) {
  if (!sources || !sources.length) return '';
  let html = '<section class="refs"><h2>参考资料与来源</h2><ul>';
  for (const s of sources) {
    if (s.url) html += `<li>${s.title} —— <a href="${s.url}" target="_blank" rel="noopener">${s.url}</a>${s.note ? '（' + s.note + '）' : ''}</li>`;
    else html += `<li>${s.title}${s.note ? '（' + s.note + '）' : ''}</li>`;
  }
  html += '</ul></section>';
  return html;
}

// ---- 板块索引页 ----
function renderSectionIndex(section) {
  const sp = pagesBySection[section.key] || [];
  let body = `# ${section.icon} ${section.title}\n\n`;
  body += `> ${section.en}\n\n`;
  if (sp.length === 0) {
    body += '_本板块内容整理中。_\n';
  } else {
    for (const p of sp) {
      body += `## [${p.title}](${p.url})\n\n`;
      if (p.summary) body += `${p.summary}\n\n`;
      if (p.updated) body += `_最近更新：${p.updated}_\n\n`;
    }
  }
  const ct = mdToHtml(body);
  return layout({
    title: section.title,
    sectionKey: section.key,
    activeUrl: `/${section.key}/index.html`,
    content: ct,
    updated: '',
    sources: [],
    summary: section.en,
  });
}

// ---- 布局 ----
function layout({ title, sectionKey, activeUrl, content, updated, sources, summary, includeSidebar = true }) {
  const section = SECTION_MAP[sectionKey];
  const sidebar = includeSidebar ? buildSidebar(activeUrl) : '';
  const topNav = buildTopNav(sectionKey);
  const refs = sources && sources.length ? buildSources(sources) : '';
  const crumb = section ? `<a href="/${sectionKey}/index.html">${section.title}</a> <span>›</span> <span>${title}</span>` : `<span>${title}</span>`;
  const updatedLine = updated ? `<p class="updated">本页最近更新：${updated}</p>` : '';
  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} · CAM精密加工知识库</title>
<meta name="description" content="${summary || title}">
<link rel="stylesheet" href="/assets/main.css">
<noscript><style>.side-group:not(.open) .side-group-list{display:block!important}</style></noscript>
</head>
<body>
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="/index.html">
      <span class="brand-mark">CAM</span>
      <span class="brand-text">精密加工知识库</span>
    </a>
    ${topNav}
    <form class="search" role="search" onsubmit="return false;">
      <input id="search-input" type="search" placeholder="搜索…" aria-label="站内搜索" autocomplete="off">
      <div id="search-results" class="search-results"></div>
    </form>
    <button class="menu-toggle" aria-label="菜单" onclick="toggleMenu()">☰</button>
  </div>
</header>
<div class="layout${includeSidebar ? '' : ' no-sidebar'}">
  ${sidebar}
  <main class="content" id="main">
    <div class="breadcrumb">${crumb}</div>
    <article class="page">
      ${content}
      ${updatedLine}
      ${refs}
    </article>
  </main>
</div>
<footer class="site-footer">
  <p>CAM / 精密加工行业知识库 · 内容由 AI 基于公开资料整理，仅供参考，重要决策请核验原始来源。</p>
  <p class="disclaimer">本站为非实时资料站，市场数据标注截止时间；具体工艺参数以厂商技术文档与现行标准为准。</p>
</footer>
<script src="/assets/main.js"></script>
</body>
</html>`;
  html = relativize(html);
  html = html.replace('<head>', `<head>\n  <base href="${BASE}">`);
  return html;
}

// ---- 首页 ----
function renderHome() {
  let cards = '';
  for (const s of SECTIONS) {
    if (s.key === 'about') continue;
    const sp = pagesBySection[s.key] || [];
    const count = sp.length;
    cards += `<a class="board-card" href="/${s.key}/index.html">
      <div class="board-icon">${s.icon}</div>
      <div class="board-body">
        <h3>${s.title}</h3>
        <p class="board-en">${s.en}</p>
        <p class="board-count">${count} 篇内容</p>
      </div>
    </a>`;
  }
  const body = `# CAM / 精密加工行业知识库

> 系统性讲清楚"CAM 是什么、精密加工怎么做、这个行业由谁组成、钱从哪来到哪去、它是怎么发展到今天的"。

面向工程师、采购与供应链人员、学生、投资者与行业新人。本站内容基于公开资料与工程共识整理，技术陈述力求带来源标注，关键图示为原创绘制。

## 浏览板块

## 内容分层说明

- **新手速览**：每篇技术文以概念与类比开篇，先建立直觉。
- **深入阅读**：向下展开原理、参数、标准与交叉链接，供专业读者取用。

> 本站为知识整理项目，不构成任何投资、采购或工艺决策建议。
`;
  const ct = mdToHtml(body);
  // 把 board-card 注入：替换占位
  return layout({
    title: '首页',
    sectionKey: '',
    activeUrl: '/index.html',
    content: injectHomeCards(ct, cards),
    updated: '',
    sources: [],
    summary: 'CAM与精密加工行业知识库首页',
    includeSidebar: false,
  });
}

function injectHomeCards(ct, cards) {
  // 在已渲染的 "浏览板块" 标题（<h2>浏览板块</h2>）之后注入卡片网格
  const marker = '浏览板块</h2>';
  const idx = ct.indexOf(marker);
  if (idx < 0) return ct;
  const insertAt = idx + marker.length;
  return ct.slice(0, insertAt) + `<div class="board-grid">${cards}</div>` + ct.slice(insertAt);
}

// ---- 术语词典 ----
function renderGlossary() {
  const jsonPath = path.join(CONTENT, 'glossary', 'glossary.json');
  let entries = [];
  if (fs.existsSync(jsonPath)) {
    entries = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
  entries.sort((a, b) => a.term.localeCompare(b.term, 'zh-Hans-CN'));
  let body = `# 📖 术语词典

> 中英双语术语表，首次出现附英文原词；点击关联页面可跳转深入阅读。

`;
  for (const e of entries) {
    let line = `## ${e.term}`;
    if (e.en) line += `（${e.en}）`;
    line += `\n\n${e.def}\n`;
    if (e.rel && e.rel.length) {
      line += `\n**相关：** ` + e.rel.map(r => `[${r.title}](/${r.section}/${r.slug}.html)`).join('、') + '\n';
    }
    body += line + '\n';
  }
  const ct = mdToHtml(body);
  return layout({
    title: '术语词典',
    sectionKey: 'glossary',
    activeUrl: '/glossary/index.html',
    content: ct,
    updated: '',
    sources: [],
    summary: 'CAM与精密加工中英双语术语表',
  });
}

// ---- 写入文件 ----
function writeHtml(relUrl, html) {
  const outPath = path.join(DIST, relUrl.replace(/^\//, ''));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
}

// 复制 public 资源
function copyPublic() {
  if (!fs.existsSync(PUBLIC)) return;
  for (const e of fs.readdirSync(PUBLIC, { withFileTypes: true })) {
    const src = path.join(PUBLIC, e.name);
    const dst = path.join(DIST, 'assets', e.name);
    if (e.isDirectory()) fs.cpSync(src, dst, { recursive: true });
    else fs.copyFileSync(src, dst);
  }
}

// ---- 主流程 ----
// 搜索索引
const searchIndex = [];
function stripText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// 复制 src 资源（css/js）
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
fs.copyFileSync(path.join(SRC, 'css', 'main.css'), path.join(DIST, 'assets', 'main.css'));
fs.copyFileSync(path.join(SRC, 'js', 'main.js'), path.join(DIST, 'assets', 'main.js'));

// 首页
writeHtml('/index.html', renderHome());
searchIndex.push({ t: '首页', u: 'index.html', s: '首页', x: 'CAM 精密加工行业知识库 导航 板块' });

// 各内容页
for (const p of pages) {
  const { content } = matter(fs.readFileSync(p.file, 'utf8'));
  const body = mdToHtml(content);
  writeHtml(p.url, layout({
    title: p.title,
    sectionKey: p.sectionKey,
    activeUrl: p.url,
    content: body,
    updated: p.updated,
    sources: p.sources,
    summary: p.summary,
  }));
  searchIndex.push({ t: p.title, u: stripBase(p.url), s: p.section.title, x: stripText(body).slice(0, 400) });
}

// 板块索引页
for (const s of SECTIONS) {
  if (s.key === 'glossary') {
    writeHtml('/glossary/index.html', renderGlossary());
  } else if (s.key === 'about') {
    // about 由 content/about 提供
    continue;
  } else {
    writeHtml(`/${s.key}/index.html`, renderSectionIndex(s));
  }
}

copyPublic();

// 术语词典加入搜索索引
const gJson = path.join(CONTENT, 'glossary', 'glossary.json');
if (fs.existsSync(gJson)) {
  const gEntries = JSON.parse(fs.readFileSync(gJson, 'utf8'));
  for (const e of gEntries) {
    searchIndex.push({ t: e.term + (e.en ? `（${e.en}）` : ''), u: 'glossary/index.html', s: '术语词典', x: e.def.slice(0, 200) });
  }
}

// 搜索索引 JSON
fs.writeFileSync(path.join(DIST, 'assets', 'search-index.json'), JSON.stringify(searchIndex, 'utf8'));

// sitemap
const urls = ['/index.html', ...pages.map(p => p.url), ...SECTIONS.map(s => `/${s.key}/index.html`)];
fs.writeFileSync(path.join(DIST, 'sitemap.txt'), urls.map(u => BASE + stripBase(u)).join('\n'));

console.log(`✅ 构建完成：${pages.length} 篇内容页 + ${SECTIONS.length} 个板块索引 + 首页；搜索索引 ${searchIndex.length} 条`);
console.log('输出目录：', DIST);
