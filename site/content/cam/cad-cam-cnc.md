---
title: CAD → CAM → CNC 的完整链路
order: 2
tags: [CAD, CAM, CNC, 数据链路, 数字主线]
summary: 从三维模型到实际切削的数据流转：CAD 几何如何被 CAM 消费、CAM 如何产出刀路与代码、CNC 如何执行，以及"数字主线"的意义。
updated: 2026-08
sources:
  - title: "novedge · Design Software History: From APT to Adaptive Toolpaths"
    url: https://novedge.com/blogs/design-news/design-software-history-from-apt-to-adaptive-toolpaths-a-technical-history-of-cam-and-the-digital-thread
    note: 对 APT、CLDATA、后处理起源有清晰技术史梳理
  - title: Bright Hub Engineering · What is Numerical Control Machine
    url: https://www.brighthubengineering.com/manufacturing-technology/55670-what-is-numerical-control-machine
    note: NC 与 CNC 演进的通识介绍
---

## 新手速览

制造一个金属零件，数据要经过三道"关口"：

1. **CAD**：把想法画成精确的三维模型（零件的"长相"）。
2. **CAM**：读入模型，算出"刀怎么走"，生成机床代码（零件的"做法"）。
3. **CNC**：机床按代码精准地把材料切出模型的形状（零件的"实体"）。

三者串起来，就是一条**数字主线（Digital Thread）**——从设计到成品，信息以数字形式连续流动，不必重新手抄。

## 第一关：CAD 提供几何

CAD（Computer-Aided Design）产出的是**边界表示（B-rep）**或**曲面/实体模型**，常见格式包括 STEP、IGES、以及各 CAD 原生的 .prt/.sldprt 等。

CAM 需要从中提取：
- 零件的**加工特征**（孔、型腔、凸台、倒角）；
- **需去除的材料**（毛坯与成品之差）；
- **几何约束**（哪些面要保留、哪些面有公差）。

<div class="note tip">现代 CAM 多支持"直接建模"或"同步建模"，可在 CAM 中快速修正小几何问题，而不必退回 CAD 重发模型。</div>

## 第二关：CAM 计算刀路（核心）

CAM 读取 CAD 几何后，依次完成：

1. **定义毛坯与坐标系**（工件零点 G54 等）；
2. **选择加工策略**（粗加工、半精、精加工、清角等）；
3. **生成刀具路径**：软件在曲面上计算密集的刀具中心轨迹，并考虑切削用量（转速 S、进给 F、切深）；
4. **后处理**：把通用的"刀位文件（CLDATA）"翻译成具体机床的 G 代码（见[后处理器与 G 代码](/cam/postprocessor.html)）；
5. **仿真校验**：在软件里模拟切削，检查过切、撞刀、超程。

> 历史上，MIT 在 1950 年代发展的 **APT（Automatically Programmed Tools）** 语言，正是把"描述几何 + 描述刀具运动"抽象出来、再交由处理器计算刀路的思想源头；今天的图形化 CAM 仍是这一逻辑的延续。

## 第三关：CNC 执行

CNC（Computer Numerical Control）是机床的**数控系统**，它：
- 解析 G 代码（如 `G01 X10 Y20 F200` 表示直线插补到某点）；
- 驱动机床各轴伺服电机，实现联动；
- 管理主轴转速、换刀、冷却液等辅助功能（M 代码）。

控制系统的差异（发那科、西门子、海德汉等"方言"）正是**为什么需要后处理器**——同一段刀路，要翻译成本机床听得懂的"方言"。

## 数据链路图

```text
   CAD 模型 ──(STEP/IGES/原生)──▶ CAM
                                     │
                        ┌────────────┼─────────────┐
                        │ 策略/刀路   │ 后处理       │ 仿真
                        ▼            ▼             ▼
                     刀位文件     G 代码       碰撞/过切报告
                                  │
                                  ▼
                              CNC 数控系统 ──▶ 机床执行 ──▶ 检测
                                  ▲
                          MES/PLM 反馈（追溯、排产）
```

## 数字主线（Digital Thread）的意义

当 CAD/CAM/CNC 与 MES、PLM 打通，一个零件从设计到首件的过程可以被**完整记录与追溯**：用的哪版模型、哪版程序、哪台机床、什么刀具寿命。这正是"智能制造"的数据基础。

## 相关词条

- [CAM 是什么](/cam/what-is-cam.html)
- [刀具路径生成原理](/cam/toolpath.html)
- [后处理器与 G 代码](/cam/postprocessor.html)
