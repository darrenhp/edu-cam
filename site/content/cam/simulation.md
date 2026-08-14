---
title: 仿真与碰撞检测（Verification & Simulation）
order: 5
tags: [仿真, 碰撞检测, 过切, 机床仿真, 数字孪生]
summary: CAM 中的仿真校验：为什么"先模拟再上机"是底线；过切/撞刀/超程三类典型问题；从刀路仿真到整机数字孪生。
updated: 2026-08
sources:
  - title: Credence Research · CAM Market（提及仿真能力与数字孪生机会）
    url: https://www.credenceresearch.com/zh/report/computer-aided-manufacturing-market-zh
  - title: MarketsandMarkets · CAM Market Size（数字孪生与仿真带来的增长机会）
    url: https://www.marketsandmarketsblog.com/industry/cam-software-market-size
---

## 新手速览

CAM 算出的刀路，在真正切削前**必须先在电脑里"虚切"一遍**。这一步叫**仿真校验（Verification/Simulation）**。

原因很现实：一旦上机才发现刀路错了，轻则废一个零件，重则**撞断刀具、砸坏主轴、伤到人**。在电脑里花几分钟仿真，能挡掉绝大多数这类事故。

## 仿真在解决什么

| 问题 | 表现 | 后果 |
|---|---|---|
| **过切（Overcut）** | 刀把不该削的地方削掉了 | 零件报废 |
| **撞刀/干涉（Collision）** | 刀柄、夹头或机床部件碰到工件/夹具 | 刀具断裂、机床损伤 |
| **超程（Over-travel）** | 运动超出机床行程或转台干涉 | 报警、撞限位 |
| **残余材料** | 该削没削干净 | 尺寸不到、需补加工 |

## 仿真怎样工作

1. **读入模型**：毛坯（或铸件）、成品、夹具、刀具装配；
2. **驱动刀路**：按 G 代码/刀位逐行"切削"虚拟材料；
3. **比对**：把仿真结果和理论成品比对，标出过切/残余区域（常以颜色显示）；
4. **干涉运算**：实时检测刀柄、夹持、转台与工件的距离，给出最小间隙；
5. **输出报告**：通过/不通过，以及风险位置截图。

成熟的 CAM（如 Vericut、PowerMill 的仿真模块、Fusion 的仿真）可做**完整机床运动学仿真**，包括转台、摆头、换刀动作，而不只是刀具中心轨迹。

<div class="note tip">行业惯例：对 5 轴、深腔、薄壁、高价零件，**不上仿真绝不试切**。仿真通过是 release 刀路的前置条件。</div>

## 从"刀路仿真"到"数字孪生"

仿真正在从"离线校验"走向"在线镜像"：

- **离线仿真**：编程阶段在 CAM 内验证（本文所述）；
- **数字孪生（Digital Twin）**：把机床的物理参数（反向间隙、热变形、伺服特性）也建进模型，仿真更贴近真实加工结果；
- **在机检测闭环**：加工中用测头实测关键尺寸，反馈回 CAM/CNC 做补偿（见[计量与检测](/processes/metrology.html)）。

## 常见误区

- **"机床自带图形模拟就够了"** —— 机床端的图形显示通常只验证 G 代码语法与简单轨迹，**不做材料去除与干涉体积运算**，远弱于专业 CAM 仿真。
- **"小零件不用仿真"** —— 撞刀不分大小，且小零件常因刚性差更易出问题。

## 相关词条

- [刀具路径生成原理](/cam/toolpath.html)
- [后处理器与 G 代码](/cam/postprocessor.html)
- [数字孪生与智能工厂（市场趋势）](/market/trends.html)
