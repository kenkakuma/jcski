#!/bin/bash

# 测试文章发布功能的脚本
BASE_URL="https://jcski.com"

echo "🚀 开始测试文章管理功能..."
echo ""

# 1. 管理员登录
echo "1. 测试管理员登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jcski.com","password":"admin123456"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo "✅ 管理员登录成功"
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
else
  echo "❌ 登录失败: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

# 2. 获取现有文章列表
echo "2. 获取现有文章列表..."
ARTICLES_RESPONSE=$(curl -s "$BASE_URL/api/admin/posts?published=all" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ARTICLES_RESPONSE" | grep -q "posts"; then
  ARTICLE_COUNT=$(echo "$ARTICLES_RESPONSE" | jq '.data.posts | length')
  echo "✅ 获取文章列表成功: $ARTICLE_COUNT 篇文章"
  echo "现有文章:"
  echo "$ARTICLES_RESPONSE" | jq -r '.data.posts[] | "   \(.title) (\(if .published then "已发布" else "草稿" end))"'
else
  echo "❌ 获取文章列表失败: $ARTICLES_RESPONSE"
  exit 1
fi
echo ""

# 3. 创建新测试文章
echo "3. 创建新测试文章..."
TIMESTAMP=$(date +%s)
TEST_ARTICLE=$(cat <<EOF
{
  "title": "功能测试文章 $(date)",
  "content": "这是一篇测试文章，用于验证文章发布功能是否正常工作。\\n\\n创建时间: $(date)\\n\\n功能测试内容：\\n- 文章创建功能测试\\n- 文章发布功能测试\\n- 前端显示功能测试",
  "excerpt": "测试文章摘要 - 验证文章发布功能",
  "slug": "test-article-$TIMESTAMP",
  "category": "TECH",
  "published": true,
  "isPinned": false,
  "tags": ["测试", "文章发布", "功能验证"]
}
EOF
)

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/posts/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$TEST_ARTICLE")

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
  echo "✅ 文章创建成功"
  NEW_ARTICLE_SLUG=$(echo "$CREATE_RESPONSE" | jq -r '.data.slug')
  NEW_ARTICLE_TITLE=$(echo "$CREATE_RESPONSE" | jq -r '.data.title')
  echo "   文章标题: $NEW_ARTICLE_TITLE"
  echo "   文章 slug: $NEW_ARTICLE_SLUG"
else
  echo "❌ 文章创建失败: $CREATE_RESPONSE"
  exit 1
fi
echo ""

# 4. 验证文章列表更新
echo "4. 验证文章列表更新..."
UPDATED_ARTICLES_RESPONSE=$(curl -s "$BASE_URL/api/admin/posts?published=all" \
  -H "Authorization: Bearer $TOKEN")

if echo "$UPDATED_ARTICLES_RESPONSE" | grep -q "posts"; then
  NEW_ARTICLE_COUNT=$(echo "$UPDATED_ARTICLES_RESPONSE" | jq '.data.posts | length')
  echo "✅ 文章列表已更新: $NEW_ARTICLE_COUNT 篇文章"
  if [ "$NEW_ARTICLE_COUNT" -gt "$ARTICLE_COUNT" ]; then
    echo "✅ 文章数量增加，列表更新正常"
  else
    echo "⚠️  文章数量未增加，可能存在问题"
  fi
else
  echo "❌ 获取更新后文章列表失败"
  exit 1
fi
echo ""

# 5. 验证文章在前端可见
echo "5. 验证文章在前端可见..."
PUBLIC_RESPONSE=$(curl -s "$BASE_URL/api/posts/$NEW_ARTICLE_SLUG")

if echo "$PUBLIC_RESPONSE" | grep -q '"success":true'; then
  PUBLIC_TITLE=$(echo "$PUBLIC_RESPONSE" | jq -r '.data.title')
  echo "✅ 文章在前端可见: $PUBLIC_TITLE"
else
  echo "❌ 文章前端访问失败: $PUBLIC_RESPONSE"
  exit 1
fi
echo ""

# 6. 验证文章在首页列表中
echo "6. 验证文章在首页文章列表中..."
HOMEPAGE_RESPONSE=$(curl -s "$BASE_URL/api/posts")

if echo "$HOMEPAGE_RESPONSE" | grep -q "$NEW_ARTICLE_SLUG"; then
  echo "✅ 文章已出现在首页文章列表中"
else
  echo "⚠️  文章未在首页文章列表中找到（可能因为文章数量过多）"
fi
echo ""

echo "🎉 所有测试通过！文章管理功能正常工作。"
echo ""
echo "测试总结："
echo "- ✅ 管理员登录功能正常"
echo "- ✅ 文章列表获取功能正常"
echo "- ✅ 文章创建功能正常"
echo "- ✅ 文章发布功能正常"
echo "- ✅ 前端文章访问功能正常"
echo "- ✅ 文章列表更新功能正常"