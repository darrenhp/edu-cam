---
title: 后处理器（Post-Processor）与 G 代码
order: 4
tags: [后处理, Post-Processor, G代码, CLDATA, RS-274]
summary: 什么是后处理器、为什么必须有它；刀位文件（CLDATA）与 G 代码的区别；G 代码基础与主要"方言"差异。
updated: 2026-08
sources:
  - title: novedge · Design Software History（CLDATA 与后处理起源）
    url: https://novedge.com/blogs/design-news/design-software-history-from-apt-to-adaptive-toolpaths-a-technical-history-of-cam-and-the-digital-thread
  - title: Bright Hub Engineering · What is Numerical Control Machine（RS-274 / G 代码标准化）
    url: https://www.brighthubengineering.com/manufacturing-technology/55670-what-is-numerical-control-machine
---

## 新手速览

CAM 算完刀路后，得到的是一份**"通用的刀位描述"**（刀尖在每个时刻应该在哪、刀轴朝哪）。但每台机床"听不懂"这份通用描述——它只认自己数控系统的**方言**。

**后处理器（Post-Processor）** 就是这台"翻译机"：把通用刀路翻译成特定机床能直接运行的 **G 代码**。

> 为什么不直接生成 G 代码？因为世上机床型号成百上千，刀路算法一旦耦合具体机床，换个机床就得重写一遍。后处理器把"几何计算"和"机器方言"解耦——这正是 1950 年代 APT 用 **CLDATA（刀位数据）** 做抽象的思想延续。

## 刀位文件（CLDATA）是什么

在刀路计算阶段，CAM 内部先生成**与机床无关**的刀具中心轨迹，记录诸如：

- 刀尖坐标（X/Y/Z）；
- 刀轴矢量（I/J/K）；
- 运动类型（快速/直线/圆弧插补）；
- 进给、转速、刀具号等。

这份中间表示不依赖任何具体控制器，便于在不同机床间复用同一份工艺。

## G 代码基础

G 代码（源自 EIA **RS-274** 标准，后由 **ISO 6983** 国际化）是用**地址字 + 数字**描述机床动作的文本指令。常见地址：

| 代码 | 含义 | 示例 |
|---|---|---|
| `G00` | 快速定位（不切削） | `G00 X0 Y0` |
| `G01` | 直线插补（切削走直线） | `G01 X10 Y20 F200` |
| `G02 / G03` | 圆弧插补（顺/逆） | `G02 X0 Y10 I5 J0` |
| `G54~G59` | 工件坐标系偏置 | `G54` |
| `G90 / G91` | 绝对/增量编程 | `G90` |
| `M03 / M05` | 主轴正转/停 | `M03 S8000` |
| `M06` | 换刀 | `T02 M06` |

一段最小示意：

```gcode
G54 G90 G21        ; 选坐标系、绝对编程、毫米
M03 S8000          ; 主轴 8000rpm 正转
G00 Z5             ; 快速抬到安全高
G00 X0 Y0          ; 快速定位到起点
G01 Z-2 F200       ; 下刀到 -2mm，进给 200
G01 X30 Y0 F300    ; 直线切削
G00 Z50            ; 抬刀
M05                ; 主轴停
M30                ; 程序结束
```

## "方言"差异（为什么必须后处理）

虽然 ISO 6983 是基础，各家控制器仍有大量**非标准扩展**：

- **发那科（Fanuc）**：循环代码（如 `G81` 钻孔循环）、宏变量体系影响深远；
- **西门子（SINUMERIK）**：有自己的高级语言（ShopMill/高级编程），圆弧格式与 Fanuc 不同；
- **海德汉（Heidenhain）**：采用**对话式（conversational）** 的 TNC 格式，与 G 代码并列；
- **三菱、发格、兄弟**等：均有一套自己的细节约定。

<div class="note warn">同一段刀路，给 Fanuc 和给 Heidenhain 的后处理输出**完全不同**。把一个机床的 G 代码直接拷到另一台，可能导致撞机或加工错误。后处理器必须按机床型号、系统版本、行程与换刀方式**逐一配置并验证**。</div>

## 后处理器从哪来

- **CAM 厂商内置**：主流 CAM 通常带常见机床/系统的后处理库（如 Mastercam 的 MP 后处理、Fusion 的 Post Library）；
- **定制修改**：用户基于模板（如 Fusion 的 `.cps`、PowerMill 的 `pmoptz`）按机床微调；
- **专业服务**：复杂多轴机床常由设备商或第三方按机床参数生成专用后处理。

## 相关词条

- [刀具路径生成原理](/cam/toolpath.html)
- [仿真与碰撞检测](/cam/simulation.html)
- [CAD → CAM → CNC 的完整链路](/cam/cad-cam-cnc.html)
