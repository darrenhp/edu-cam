---
title: 发展时间线：从 NC 到智能制造
order: 1
tags: [历史, NC, CNC, APT, 五轴, 工业4.0]
summary: 数控与 CAM 的关键节点编年：1950s 数控诞生、APT、CNC、CAD/CAM 一体化、五轴普及、数字孪生/工业4.0。
updated: 2026-08
sources:
  - title: novedge · Design Software History（NC/APT/CLDATA 技术史）
    url: https://novedge.com/blogs/design-news/design-software-history-from-apt-to-adaptive-toolpaths-a-technical-history-of-cam-and-the-digital-thread
  - title: Bright Hub Engineering · What is Numerical Control Machine（NC 与 CNC 演进）
    url: https://www.brighthubengineering.com/manufacturing-technology/55670-what-is-numerical-control-machine
  - title: 百度百科 · 计算机辅助制造（APT 与数控发展）
    url: https://baike.baidu.com/item/cam%E8%BD%AF%E4%BB%B6
---

## 新手速览

今天你点一下"生成刀路"，背后是 70 多年的积累：从打孔纸带到 AI 优化刀路。下面这条时间线，串起关键转折。

<div class="timeline">
<div class="timeline-item"><span class="timeline-year">1940s</span><h3>数值控制的思想萌芽</h3><p>John T. Parsons 提出用坐标点驱动机床加工复杂曲面（如飞机螺旋桨叶片），并尝试用打孔卡片记录坐标。核心想法：把"形状"变成"数字指令"。</p></div>
<div class="timeline-item"><span class="timeline-year">1948–1952</span><h3>MIT 与空军：第一台数控原型</h3><p>Parsons 向美国空军演示概念并获得资助，MIT 伺服机构实验室（Gordon S. Brown 主持）改装 Cincinnati Hydro-Tel 铣床，<strong>1952 年演示成功三轴数控铣削</strong>——用刀尖按坐标自动走出复杂轮廓。</p></div>
<div class="timeline-item"><span class="timeline-year">1950s</span><h3>APT：让编程脱离"手算每个点"</h3><p>MIT 的 Douglas T. Ross 等在空军支持下发展 <strong>APT（Automatically Programmed Tools）</strong> 语言，用"描述几何 + 描述刀具运动"的高级语句生成刀路，并引入与机床无关的 <strong>CLDATA</strong> 抽象——这正是今天 CAM 后处理思想的源头。</p></div>
<div class="timeline-item"><span class="timeline-year">1958</span><h3>PRONTO 与 CNC 雏形</h3><p>Patrick Hanratty 在 GE 推出 PRONTO 等早期自动编程语言；同期计算机开始取代打孔纸带，向"计算机数控（CNC）"演进。</p></div>
<div class="timeline-item"><span class="timeline-year">1950s–60s</span><h3>G 代码标准化</h3><p>EIA 推出 <strong>RS-274</strong>（G 代码雏形），后由 <strong>ISO 6983</strong> 国际化。各厂家方言（Fanuc/Siemens/Heidenhain）由此分化，后处理成为刚需。</p></div>
<div class="timeline-item"><span class="timeline-year">late 1950s</span><h3>加工中心出现</h3><p>Kearney &amp; Trecker 的 Milwaukee-Matic 等把数控、自动换刀、多工序集成，零件"一次装夹多工序"，柔性制造起步。</p></div>
<div class="timeline-item"><span class="timeline-year">1970s–80s</span><h3>CAD/CAM 一体化</h3><p>计算机与图形学成熟，设计模型可直接进入刀路计算；专用工作站与后来的 PC 让 CAM 走出实验室、进入中小企业。</p></div>
<div class="timeline-item"><span class="timeline-year">1990s–2000s</span><h3>实体建模与多轴普及</h3><p>NURBS/实体建模内核成熟，曲面 CAM 强大；<strong>五轴加工</strong>从中高端走向更广应用，高速铣（HSM）兴起。</p></div>
<div class="timeline-item"><span class="timeline-year">2010s–今</span><h3>云、AI 与数字孪生</h3><p>CAM 走向订阅/云端协作；机器学习用于刀路优化；仿真向数字孪生演进，接入 MES/PLM，融入工业 4.0 与智能制造。</p></div>
</div>

<div class="note info">一条主线贯穿始终：把"人的经验"不断转化为"可计算、可复用、可审计的几何与运动"——从 Parsons 的坐标，到 APT 的抽象，再到今天的 AI 刀路。</div>

## 相关词条

- [CAM 是什么](/cam/what-is-cam.html)
- [后处理器与 G 代码](/cam/postprocessor.html)
- [中国精密加工简史](/history/china.html)
- [趋势专题](/market/trends.html)
