# DDT 机器人建图生态系统 - 业务时序图

以下是使用 Mermaid 语法设计的业务时序图，涵盖了 RCS 设备端应用、云端建图服务以及 DDT Studio 桌面端应用之间的交互逻辑。

```mermaid
sequenceDiagram
    autonumber
    participant U as 用户 (User)
    participant RCS as RCS 设备端 (Ubuntu)
    participant Cloud as 云端建图 (云服务器)
    participant Studio as DDT Studio (Windows)

    Note over U, KOS: 0. 设备注册与激活阶段
    U->>RCS: 首次启动，选择并连接 Wi-Fi
    RCS->>RCS: 建立网络连接 (Network Connected)
    U->>RCS: 点击二维码图标获取机器码
    RCS-->>U: 弹出二维码 (Machine Code QR)
    U->>KOS: 飞书登录 KOS 系统 (资产管理 > 终端列表)
    U->>KOS: 扫描/输入机器码并点击【查询】
    KOS->>KOS: 校验机器码与 SN 码匹配性
    KOS-->>U: 生成并返回激活码 (Activation Code)
    U->>RCS: 粘贴激活码并点击【提交激活】
    RCS->>RCS: 本地校验激活码有效性
    RCS-->>U: 激活成功，进入主界面

    Note over U, RCS: 1. 现场数据采集阶段
    U->>RCS: 点击【开始扫图】
    RCS->>RCS: 执行前置校验 (传感器/配额/电量/存储)
    alt 校验失败
        RCS-->>U: 弹出告警 (红色/黄色) 并阻断或提示
    else 校验通过
        RCS->>RCS: 开启扫图模式 (Scanning)
        RCS->>RCS: 采集激光雷达/视觉原始数据
        RCS-->>U: 实时预览点云、轨迹、时长
        opt 异常发生
            RCS-->>U: 弹出异常提示 (时间跳变/特征不足)
        end
        U->>RCS: 结束扫图
        RCS->>RCS: 进入“保存中”状态
        RCS-->>U: 保存完成，展示建图选项
        U->>RCS: 选择建图模式 (专业/快速)
    end

    Note over U, Cloud: 2. 云端高精建图阶段
    RCS->>RCS: 自动执行云端配额与网络预校验
    alt 校验通过
        par 上传阶段
            RCS->>Cloud: 上传原始数据包 (含模式信息)
            RCS-->>U: 展示上传进度、速度、ETA
            opt 网络断开
                RCS->>RCS: 自动尝试重连 (30s)
                RCS-->>U: 置红提示，冻结进度
            end
        end
        Cloud->>Cloud: 算力调度与任务排队 (Queuing)
        alt 任务开始
            Cloud->>Cloud: 执行高精建图 (Processing)
            Cloud-->>RCS: 定期推送进度 (每 10%)
            RCS-->>U: 展示建图进度与 ETA
        end
        Cloud-->>RCS: 建图完成通知
        RCS->>U: 自动跳转项目详情
    end
    Note over U, RCS: 3. 地图成果分享阶段
    U->>RCS: 选择分享地图 (Local/Online Share)
    alt 本地分享 (Local Share)
        RCS->>RCS: 检查所选格式地图是否已下载
        opt 未下载
            RCS->>Cloud: 执行地图成果下载
        end
        RCS->>RCS: 启动局域网分享服务 (Port 53317)
        RCS-->>U: 展示局部 IP 链接与二维码
        U->>Studio: 跨设备扫码或输入链接下载
    else 在线分享 (Online Share)
        RCS->>Cloud: 获取永久公开分享链接与二维码
        Cloud-->>RCS: 返回云端分享资源地址
        RCS-->>U: 展示在线分享链接与码
        U->>Studio: PC 端通过链接在线导入/共享
    end

    Note over U, Studio: 5. 桌面端项目管理与部署阶段
    U->>Studio: 新建项目并同步云端地图列表
    Studio->>Cloud: 获取指定项目数据 (用户隔离校验)
    Cloud-->>Studio: 返回高精模型文件
    U->>Studio: 查看模型效果与项目管理
    U->>Studio: 确认并发布模型
    Studio->>RCS: 部署最终地图至机器人
    RCS-->>U: 提示地图部署成功，进入定位模式
```

### 关键业务逻辑说明：
1.  **计费校验**：云端建图在接收到建图请求后，首先通过 KOS/DDT 模块进行余额校验，确保 B 端业务的闭环。
2.  **算力调度**：云端根据当前任务并发量，通过 AXS 模块动态调度计算节点，保证建图效率。
3.  **用户隔离**：在 Studio 同步地图时，云端建图严格校验用户权限，确保地图数据在不同企业/用户间物理隔离。
4.  **数据闭环**：从 RCS 采集，到 云端建图 处理，再到 DDT Studio 编辑，最后回到 RCS 部署，形成完整的业务闭环。
