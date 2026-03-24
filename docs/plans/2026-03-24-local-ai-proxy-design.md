# 本地 AI 代理接入设计

## 目标

把当前 Learn a Bit 的 AI 生成链路改成“前端只调后端，后端代理本地 OpenAI 兼容 API”的真实上线模拟方案。

## 总体架构

- 前端继续只调用项目自己的 Express 后端，不直接访问 `http://localhost:8000/v1`
- 后端作为唯一 AI 代理层，统一负责：
  - 按领域生成 30 个吸引人的标题
  - 按标题一次生成文章、分块策略、预测题、检测题
- 本地 AI 服务只承担模型推理，不承担业务编排

## 数据流

### 1. 选择领域后生成标题

1. 前端提交 `domain`
2. 后端调用本地 OpenAI 兼容接口
3. 后端返回 30 个标题
4. 后端按 `10 组 × 每组 3 个` 组织成 `titleGroups`
5. 前端默认只展示第一组 3 个标题供用户选择

### 2. 选择标题后生成文章包

1. 前端提交 `domain + title`
2. 后端调用本地 OpenAI 兼容接口
3. 后端一次性返回完整学习包：
   - `part1 / part2 / part3`
   - `chunkPlan` 分块策略
   - `prediction1 / prediction2`
   - `quiz[]` 检测题
4. 前端直接进入后续学习流程，不再二次拼装 AI 结果

## 接口契约

### `POST /api/ai/titles`

入参：

```json
{ "domain": "科学" }
```

出参：

```json
{
  "success": true,
  "data": {
    "titleGroups": [
      ["标题1", "标题2", "标题3"],
      ["标题4", "标题5", "标题6"]
    ]
  },
  "error": null
}
```

约束：
- 必须返回 10 组
- 每组 3 个标题
- 标题要偏个人兴趣、好奇心、成长、现实关联
- 标题不要过于学术化或空泛

### `POST /api/ai/article`

入参：

```json
{ "domain": "科学", "title": "相对论为什么改变了我们对世界的理解" }
```

出参：

```json
{
  "success": true,
  "data": {
    "articleData": {
      "part1": "...",
      "part2": "...",
      "part3": "...",
      "chunkPlan": ["...", "...", "..."],
      "prediction1": {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "correctIndex": 1
      },
      "prediction2": {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "correctIndex": 2
      },
      "quiz": [
        {
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 0
        }
      ]
    }
  },
  "error": null
}
```

约束：
- 一次请求直接生成完整文章包
- 题目统一 4 选 1
- `correctIndex` 必须在 `0-3`
- `chunkPlan` 用于表示文章分块策略

## Prompt 设计

### 标题生成

Prompt 重点：
- 只根据领域生成
- 目标是“吸引个人点击”，不是课程目录
- 输出必须是可解析 JSON
- 严格限制为 10 组 × 3 个标题

### 文章生成

Prompt 重点：
- 一次性生成文章、分块策略、预测题、检测题
- 题目必须与文章内容严格对应
- 输出必须是可解析 JSON
- 禁止附带多余说明文字

## 错误处理

### 入参校验

- `domain` 和 `title` 不能为空
- 字符串长度需要做基础限制

### 返回校验

- JSON 解析失败则返回生成失败
- 字段缺失或类型不正确则返回格式错误
- 不把原始模型返回、堆栈或本地地址暴露给前端

### 安全策略

- 前端只接触后端 API
- 后端记录详细错误日志
- 前端仅展示安全、可读的错误信息

## 前端行为

- 领域页调用 `POST /api/ai/titles`
- 只展示第一组 3 个标题
- 用户选中标题后调用 `POST /api/ai/article`
- 文章包成功返回后直接进入 Lesson / Quiz / Review 流程

## 设计结论

这个方案最接近真实上线：
- 客户端不暴露模型服务
- 后端承担 AI 编排
- 本地模型服务可以无缝替换成线上服务
- 现有前端流程只需要最小改动
