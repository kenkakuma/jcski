#!/usr/bin/env node

/**
 * JCSKI Blog - 数据库到 Content Studio 迁移脚本
 * 
 * 功能:
 * - 从 SQLite 数据库读取 BlogPost 数据
 * - 转换为 Markdown 格式
 * - 保存到 content/ 目录
 * - 处理图片和媒体引用
 * - 保持 metadata 一致性
 */

const fs = require('fs').promises;
const path = require('path');
// 使用 child_process 执行 sqlite3 命令，避免安装依赖
const { execSync } = require('child_process');

// 数据库路径
const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const CONTENT_DIR = path.join(__dirname, '../content');

// 分类映射
const CATEGORY_MAP = {
  'BLOG': 'blog',
  'MUSIC': 'music', 
  'TECH': 'tech',
  'SKIING': 'skiing',
  'FISHING': 'fishing',
  'NEWS': 'blog' // NEWS 归类到 blog
};

/**
 * 转换时间戳为日期字符串
 */
function formatDate(timestamp) {
  if (!timestamp) return new Date().toISOString().split('T')[0];
  
  // 处理毫秒时间戳
  const date = new Date(parseInt(timestamp));
  return date.toISOString().split('T')[0];
}

/**
 * 清理和转义 YAML 值
 */
function escapeYaml(value) {
  if (typeof value !== 'string') return value;
  
  // 如果包含特殊字符，用引号包围
  if (value.includes(':') || value.includes('"') || value.includes("'") || value.includes('\n')) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  
  return value;
}

/**
 * 解析 JSON 标签
 */
function parseTags(tagsString) {
  try {
    if (!tagsString) return [];
    
    // 如果是 JSON 字符串
    if (tagsString.startsWith('[') && tagsString.endsWith(']')) {
      return JSON.parse(tagsString);
    }
    
    // 如果是逗号分隔的字符串
    return tagsString.split(',').map(tag => tag.trim());
  } catch (error) {
    console.warn('解析标签失败:', tagsString, error.message);
    return [];
  }
}

/**
 * 清理文件名，确保符合文件系统要求
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*]/g, '-')  // 替换非法字符
    .replace(/\s+/g, '-')          // 空格替换为连字符
    .replace(/-+/g, '-')           // 多个连字符合并
    .replace(/^-|-$/g, '')         // 移除首尾连字符
    .toLowerCase();
}

/**
 * 生成 Markdown frontmatter
 */
function generateFrontmatter(post) {
  const tags = parseTags(post.tags);
  
  const frontmatter = {
    title: escapeYaml(post.title),
    description: escapeYaml(post.excerpt || ''),
    published: Boolean(post.published),
    category: post.category || 'BLOG',
    tags: tags,
    slug: post.slug,
    isPinned: Boolean(post.isPinned),
    createdAt: formatDate(post.createdAt),
    updatedAt: formatDate(post.updatedAt)
  };
  
  // 添加可选字段
  if (post.coverImage) {
    frontmatter.coverImage = post.coverImage;
  }
  
  if (post.featuredImage) {
    frontmatter.featuredImage = post.featuredImage;
  }
  
  if (post.audioFile) {
    frontmatter.audioFile = post.audioFile;
  }
  
  return frontmatter;
}

/**
 * 处理图片路径
 */
function processImagePaths(content) {
  if (!content) return '';
  
  // 更新相对路径图片为绝对路径
  return content
    .replace(/src="\/uploads\//g, 'src="/uploads/')
    .replace(/src="uploads\//g, 'src="/uploads/')
    // 处理 Markdown 图片语法
    .replace(/!\[([^\]]*)\]\(uploads\//g, '![$1](/uploads/')
    .replace(/!\[([^\]]*)\]\(\/uploads\//g, '![$1](/uploads/');
}

/**
 * 将文章转换为 Markdown 格式
 */
function convertToMarkdown(post) {
  const frontmatter = generateFrontmatter(post);
  const content = processImagePaths(post.content || '');
  
  // 生成 YAML frontmatter
  let yamlFrontmatter = '---\n';
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      yamlFrontmatter += `${key}: [${value.map(v => `"${v}"`).join(', ')}]\n`;
    } else {
      yamlFrontmatter += `${key}: ${value}\n`;
    }
  }
  yamlFrontmatter += '---\n\n';
  
  // 添加标题（如果内容中没有）
  let markdownContent = content;
  if (!content.startsWith('# ')) {
    markdownContent = `# ${post.title}\n\n${content}`;
  }
  
  return yamlFrontmatter + markdownContent;
}

/**
 * 从数据库读取文章
 */
function readPostsFromDatabase() {
  try {
    const query = `
      SELECT 
        id, title, content, excerpt, slug, coverImage, featuredImage, 
        audioFile, tags, category, published, isPinned, createdAt, updatedAt
      FROM BlogPost 
      ORDER BY createdAt DESC
    `;
    
    // 使用 sqlite3 命令行工具
    const result = execSync(`sqlite3 "${DB_PATH}" "${query}"`, { 
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    
    // 解析结果
    const lines = result.trim().split('\n').filter(line => line.trim());
    const posts = lines.map(line => {
      const parts = line.split('|');
      if (parts.length < 12) {
        console.warn('数据行格式不完整:', line);
        return null;
      }
      
      return {
        id: parseInt(parts[0]) || 0,
        title: parts[1] || '',
        content: parts[2] || '',
        excerpt: parts[3] || '',
        slug: parts[4] || '',
        coverImage: parts[5] || null,
        featuredImage: parts[6] || null,
        audioFile: parts[7] || null,
        tags: parts[8] || '[]',
        category: parts[9] || 'BLOG',
        published: parts[10] === '1',
        isPinned: parts[11] === '1',
        createdAt: parts[12] || null,
        updatedAt: parts[13] || null
      };
    }).filter(post => post !== null);
    
    return Promise.resolve(posts);
    
  } catch (error) {
    return Promise.reject(new Error(`数据库查询失败: ${error.message}`));
  }
}

/**
 * 保存文章到 Content 目录
 */
async function savePostToContent(post, targetDir = null) {
  try {
    // 确定目标目录
    const category = post.category || 'BLOG';
    const contentSubdir = targetDir || CATEGORY_MAP[category] || 'blog';
    const targetPath = path.join(CONTENT_DIR, contentSubdir);
    
    // 确保目录存在
    await fs.mkdir(targetPath, { recursive: true });
    
    // 生成文件名
    let filename = post.slug || sanitizeFilename(post.title);
    if (!filename.endsWith('.md')) {
      filename += '.md';
    }
    
    const filePath = path.join(targetPath, filename);
    
    // 转换为 Markdown
    const markdownContent = convertToMarkdown(post);
    
    // 保存文件
    await fs.writeFile(filePath, markdownContent, 'utf8');
    
    console.log(`✅ 已保存: ${contentSubdir}/${filename}`);
    return {
      success: true,
      path: filePath,
      category: contentSubdir,
      filename
    };
    
  } catch (error) {
    console.error(`❌ 保存失败 [${post.title}]:`, error.message);
    return {
      success: false,
      error: error.message,
      post: post.title
    };
  }
}

/**
 * 迁移指定文章
 */
async function migrateSpecificPosts(postIds = []) {
  try {
    console.log('🚀 开始迁移数据库文章到 Content Studio...\n');
    
    // 读取所有文章
    const posts = await readPostsFromDatabase();
    console.log(`📚 找到 ${posts.length} 篇文章\n`);
    
    // 过滤指定文章（如果提供了ID）
    const targetPosts = postIds.length > 0 
      ? posts.filter(post => postIds.includes(post.id))
      : posts;
    
    if (targetPosts.length === 0) {
      console.log('⚠️ 没有找到要迁移的文章');
      return;
    }
    
    console.log(`🎯 准备迁移 ${targetPosts.length} 篇文章:\n`);
    
    // 显示文章列表
    targetPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   分类: ${post.category} | 状态: ${post.published ? '已发布' : '草稿'}`);
      console.log(`   Slug: ${post.slug}\n`);
    });
    
    // 执行迁移
    const results = [];
    for (const post of targetPosts) {
      const result = await savePostToContent(post);
      results.push(result);
    }
    
    // 统计结果
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('\n📊 迁移结果:');
    console.log(`✅ 成功: ${successful.length} 篇`);
    console.log(`❌ 失败: ${failed.length} 篇`);
    
    if (failed.length > 0) {
      console.log('\n❌ 失败的文章:');
      failed.forEach(f => {
        console.log(`   - ${f.post}: ${f.error}`);
      });
    }
    
    if (successful.length > 0) {
      console.log('\n✅ 成功迁移的文章:');
      successful.forEach(s => {
        console.log(`   - ${s.category}/${s.filename}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('💥 迁移过程中发生错误:', error);
    throw error;
  }
}

/**
 * 命令行接口
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📝 JCSKI Blog 内容迁移工具

用法:
  node scripts/migrate-to-content-studio.js [选项] [文章ID...]

选项:
  --help, -h     显示帮助信息
  --sample       迁移前3篇文章作为样本测试
  --all          迁移所有文章 
  
示例:
  node scripts/migrate-to-content-studio.js --sample
  node scripts/migrate-to-content-studio.js 1 2 3
  node scripts/migrate-to-content-studio.js --all
    `);
    return;
  }
  
  try {
    if (args.includes('--sample')) {
      console.log('🧪 样本迁移模式 - 迁移前3篇文章\n');
      await migrateSpecificPosts([1, 2, 3]);
    } else if (args.includes('--all')) {
      console.log('🌟 全量迁移模式 - 迁移所有文章\n');
      await migrateSpecificPosts([]);
    } else {
      // 解析文章ID
      const postIds = args
        .filter(arg => !arg.startsWith('--'))
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));
      
      if (postIds.length > 0) {
        console.log(`🎯 指定文章迁移模式 - 迁移文章 ID: ${postIds.join(', ')}\n`);
        await migrateSpecificPosts(postIds);
      } else {
        console.log('🧪 默认样本迁移模式 - 迁移前3篇文章\n');
        await migrateSpecificPosts([1, 2, 3]);
      }
    }
    
    console.log('\n🎉 迁移完成!');
    
  } catch (error) {
    console.error('\n💥 迁移失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行这个脚本
if (require.main === module) {
  main();
}

module.exports = {
  migrateSpecificPosts,
  convertToMarkdown,
  readPostsFromDatabase
};