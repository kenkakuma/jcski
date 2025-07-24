/**
 * Markdown 解析工具
 * 利用@nuxt/content模块的markdown解析能力
 */

// 简单的Markdown to HTML转换器
export function parseMarkdown(content: string): string {
  if (!content) return ''
  
  let html = content
  
  // 标题解析
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // 粗体和斜体
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
  
  // 代码块
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>')
  
  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  
  // 图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
  
  // 无序列表
  html = html.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
  html = html.replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
  
  // 有序列表
  html = html.replace(/^\d+\. (.*$)/gim, '<ol><li>$1</li></ol>')
  
  // 合并连续的列表项
  html = html.replace(/<\/ul>\s*<ul>/gim, '')
  html = html.replace(/<\/ol>\s*<ol>/gim, '')
  
  // 引用块
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
  
  // 分隔线
  html = html.replace(/^---$/gim, '<hr>')
  html = html.replace(/^\*\*\*$/gim, '<hr>')
  
  // 换行处理
  html = html.replace(/\n\n/gim, '</p><p>')
  html = html.replace(/\n/gim, '<br>')
  
  // 包装段落
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>'
  }
  
  return html
}

// 检测内容是否为Markdown格式
export function isMarkdownContent(content: string): boolean {
  if (!content) return false
  
  // 如果内容包含大量HTML标签（特别是div标签），则认为是HTML内容
  const htmlTagCount = (content.match(/<div|<span|<p>/g) || []).length
  const totalLines = content.split('\n').length
  
  // 如果HTML标签数量占总行数的40%以上，则认为是HTML格式
  if (htmlTagCount > totalLines * 0.4) {
    return false
  }
  
  const markdownPatterns = [
    /^#{1,6}\s/m,           // 标题
    /\*\*.*?\*\*/,          // 粗体
    /\*.*?\*/,              // 斜体
    /\[.*?\]\(.*?\)/,       // 链接
    /!\[.*?\]\(.*?\)/,      // 图片
    /^[\*\-]\s/m,           // 无序列表
    /^\d+\.\s/m,            // 有序列表
    /^>\s/m,                // 引用
    /```[\s\S]*?```/,       // 代码块
    /`.*?`/,                // 行内代码
    /^---$/m                // 分隔线
  ]
  
  // 需要至少匹配3个Markdown模式才认为是纯Markdown
  const matchCount = markdownPatterns.filter(pattern => pattern.test(content)).length
  return matchCount >= 3
}

// 提取Markdown中的标题用于生成目录
export function extractHeadings(content: string): Array<{level: number, text: string, id: string}> {
  const headings: Array<{level: number, text: string, id: string}> = []
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  let match
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    headings.push({ level, text, id })
  }
  
  return headings
}

// 增强的Markdown解析器，支持更多功能
export function parseMarkdownAdvanced(content: string): {html: string, headings: Array<{level: number, text: string, id: string}>} {
  let html = content
  const headings = extractHeadings(content)
  
  // 标题解析（带ID）
  html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
    const level = hashes.length
    const id = text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    return `<h${level} id="${id}">${text}</h${level}>`
  })
  
  // 表格支持
  html = html.replace(/\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)*)/gm, (match, header, rows) => {
    const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell)
    const headerHtml = '<tr>' + headerCells.map(cell => `<th>${cell}</th>`).join('') + '</tr>'
    
    const rowsHtml = rows.trim().split('\n').map(row => {
      const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell)
      return '<tr>' + cells.map(cell => `<td>${cell}</td>`).join('') + '</tr>'
    }).join('')
    
    return `<table class="markdown-table"><thead>${headerHtml}</thead><tbody>${rowsHtml}</tbody></table>`
  })
  
  // 其他Markdown解析...
  html = parseMarkdown(html)
  
  return { html, headings }
}