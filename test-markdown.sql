INSERT INTO BlogPost (
  title, 
  content, 
  excerpt, 
  slug, 
  category, 
  tags, 
  published, 
  authorId, 
  createdAt, 
  updatedAt
) VALUES (
  'Markdown功能测试文章',
  '# Markdown功能测试

这是一篇用于测试**Markdown格式**的文章。

## 基本格式测试

- *斜体文本*
- **粗体文本**  
- [链接测试](https://jcski.com)
- `行内代码`

### 代码块测试

```javascript
console.log("Hello World!");
const test = "Markdown support";
```

### 第三方图片测试

![测试图片](https://picsum.photos/600/300)

![GitHub Logo](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)

> 这是一个引用块的示例
> 支持多行引用内容

---

### 表格测试

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown解析 | ✅ | 基本语法支持 |
| 第三方图片 | ✅ | 外部URL图片 |
| 代码高亮 | ✅ | 语法高亮 |
| 表格支持 | ✅ | 表格渲染 |

### 列表测试

1. 有序列表项1
2. 有序列表项2
3. 有序列表项3

- 无序列表项A
- 无序列表项B
- 无序列表项C

测试完成！',
  '测试Markdown格式支持和第三方图片引用功能',
  'markdown-test-article',
  'TECH',
  '["markdown", "test", "third-party-images"]',
  1,
  1,
  datetime("now"),
  datetime("now")
);