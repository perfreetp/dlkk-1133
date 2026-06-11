## 1. 架构设计

```mermaid
graph TB
    subgraph "前端层"
        A["React 18 + TypeScript"] --> B["Vite 构建工具"]
        A --> C["TailwindCSS 样式"]
        A --> D["React Router 路由"]
        A --> E["Zustand 状态管理"]
        A --> F["Recharts 图表库"]
        A --> G["Lucide React 图标"]
    end
    subgraph "数据层"
        H["Mock 数据服务"] --> I["本地 JSON 数据"]
    end
    A --> H
```

## 2. 技术说明
- 前端：React@18 + TypeScript@5 + TailwindCSS@3 + Vite@5
- 路由：react-router-dom@6
- 状态管理：zustand@4
- 图表库：recharts@2
- 图标：lucide-react
- 后端：无后端，采用前端 Mock 数据模拟
- 数据：本地 TypeScript Mock 数据

## 3. 路由定义
| 路由 | 页面 | 说明 |
|------|------|------|
| / | 重定向到 /dashboard | 首页 |
| /dashboard | 运营看板 | 核心指标和图表 |
| /vehicles | 车辆列表 | 车辆管理和控制 |
| /stations | 站点管理 | 站点和围栏配置 |
| /dispatch | 调度任务 | 调度任务管理 |
| /inspection | 巡检工单 | 巡检和维修工单 |
| /complaints | 用户投诉 | 投诉处理 |
| /pricing | 价格规则 | 定价和优惠配置 |
| /reports | 报表统计 | 数据分析报表 |

## 4. 数据模型

```mermaid
erDiagram
    VEHICLE {
        string id PK
        string code
        string status
        number battery
        string stationId FK
        number lat
        number lng
        datetime lastActive
    }
    STATION {
        string id PK
        string name
        number capacity
        number currentCount
        string fenceGeo
        string type
    }
    DISPATCH_TASK {
        string id PK
        string type
        string priority
        string status
        string vehicleId FK
        string fromStation FK
        string toStation FK
        string assignee
        datetime createdAt
    }
    INSPECTION_ORDER {
        string id PK
        string vehicleId FK
        string category
        string status
        string[] photos
        string description
        string assignee
        datetime createdAt
    }
    COMPLAINT {
        string id PK
        string type
        string userId
        string orderId FK
        string vehicleId FK
        string status
        string description
    }
    PRICING_RULE {
        string id PK
        string name
        string type
        number basePrice
        number perMinute
        number perKm
        string timeRange
        string area
    }
    STATION ||--o{ VEHICLE : has
    VEHICLE ||--o{ DISPATCH_TASK : has
    VEHICLE ||--o{ INSPECTION_ORDER : has
    VEHICLE ||--o{ COMPLAINT : related
```
