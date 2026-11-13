import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const root = new URL('../', import.meta.url);
const site = 'https://star-japan.github.io/ai-zukan/';
const read = (path) => readFile(new URL(path, root), 'utf8');
const write = (path, content) => writeFile(new URL(path, root), content);
const escape = (text) => String(text).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const index = await read('index.html');
const catalog = JSON.parse(await read('article-catalog.json')).articles;
const application = index.match(/<script>\n'use strict';\nconst preservedArticleItems=[\s\S]*?<\/script>/)?.[0];
const startup = application?.indexOf('let searchFocusAfterSync=');
const styles = index.match(/<style>([\s\S]*?)<\/style>/)?.[1];
if (!startup || startup < 0 || !styles) throw new Error('Site renderer or stylesheet could not be found.');

const main = {};
const document = { getElementById: (id) => id === 'main' ? main : {} };
const { items, renderArticle } = runInNewContext(
  application.slice('<script>'.length, startup) + '\n({ items, renderArticle })',
  { document, window: {} },
  { timeout: 5000 }
);
const liveItems = new Map(items.map((item) => [item.id, item]));
const published = catalog.filter((entry) => entry.updateStatus === 'published' && liveItems.has(entry.id));
const ids = new Set(published.map((entry) => entry.id));
if (!ids.size || ids.size !== published.length || [...ids].some((id) => !/^[a-z0-9][a-z0-9-]*$/.test(id))) {
  throw new Error('Invalid or duplicate published article IDs.');
}

const articlePath = (id) => '/ai-zukan/articles/' + id + '/';
const articleUrl = (id) => site + 'articles/' + id + '/';
const legacyPath = (id) => '/ai-zukan/#/article/' + id;
const analytics = index.match(/<!-- Google Analytics 4 -->[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/)?.[0] ?? '';
const footer = index.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? '';
const home = '/ai-zukan/';
function page({ title, description, canonical, body }) {
  return '<!doctype html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    + '<title>' + escape(title) + '</title>\n'
    + '<meta name="description" content="' + escape(description) + '">\n'
    + '<link rel="canonical" href="' + escape(canonical) + '">\n'
    + '<link rel="stylesheet" href="' + home + 'assets/article-pages.css">\n'
    + analytics + '\n</head>\n<body>\n<a class="skip" href="#main">本文へ移動</a>\n'
    + '<header class="masthead"><div class="wrap"><a class="brand" href="' + home + '">知識の大図鑑</a></div></header>\n'
    + '<main class="wrap" id="main" tabindex="-1">' + body + '</main>\n'
    + footer + '\n</body>\n</html>\n';
}

const files = new Map();
for (const entry of published) {
  const item = liveItems.get(entry.id);
  main.innerHTML = '';
  renderArticle(item);
  const article = main.innerHTML
    .replace(/^<button class="back" id="back">[^<]*<\/button>/, '<a class="back" href="' + home + '">← 一覧に戻る</a>')
    .replace(/<header class="articleheader[^"]*"><div>[\s\S]*?<h2\b[^>]*>[\s\S]*?<\/h2>/, (heading) =>
      heading.replace('<h2', '<h1').replace('</h2>', '</h1>'))
    .replace(/(\b(?:src|href)=")assets\//g, '$1' + home + 'assets/')
    .replace(/href="(?:#\/article\/|(?:\/ai-zukan\/)?articles\/)([a-z0-9-]+)\/?"/g, (_, id) =>
      'href="' + (ids.has(id) ? articlePath(id) : legacyPath(id)) + '"');
  if (!article.includes('<h1') || !article.includes('<article')) throw new Error('Article markup missing for ' + entry.id);
  const literary = item.cat === 'literature' || item.cat === 'myth';
  const topics = [];
  if (/<h3\b[^>]*>あらすじ(?:<|\s)/.test(article)) topics.push('あらすじ');
  if (/<h3\b[^>]*>登場人物<\/h3>/.test(article)) topics.push('登場人物');
  if (!topics.length && item.cat === 'person') topics.push('人物紹介');
  const name = (literary && entry.author ? entry.author + '『' + entry.title + '』' : entry.title);
  files.set('articles/' + entry.id + '/index.html', page({
    title: name + (topics.length ? 'の' + topics.join('・') : 'の解説') + '｜知識の大図鑑',
    description: item.gist,
    canonical: articleUrl(entry.id),
    body: article
  }));
}

files.set('articles/index.html', page({
  title: '作品・人物・地域の記事一覧｜知識の大図鑑',
  description: '知識の大図鑑の記事一覧。文学作品のあらすじや登場人物、偉人、地域文化の記事を読めます。',
  canonical: site + 'articles/',
  body: '<h1>作品・人物・地域の記事一覧</h1>\n<ul>\n' + published.map((entry) =>
    '<li><a href="' + articlePath(entry.id) + '">' + escape(entry.title) + '</a>'
    + (entry.author ? ' — ' + escape(entry.author) : '') + '</li>').join('\n') + '\n</ul>'
}));
files.set('assets/article-pages.css', styles + '\n.articleheader h1{font-size:clamp(2rem,5vw,3.2rem);margin:10px 0;line-height:1.9}\n.articleheader h1.long-title{font-size:1.65rem}\n');
files.set('assets/article-routes.js', 'window.publishedArticleIds = new Set(' + JSON.stringify([...ids]) + ');\n');
files.set('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + [site, site + 'articles/', ...published.map((entry) => articleUrl(entry.id))]
    .map((url) => '  <url><loc>' + escape(url) + '</loc></url>').join('\n') + '\n</urlset>\n');

const articlesDir = new URL('articles/', root);
const previousDirs = await readdir(articlesDir, { withFileTypes: true }).catch((error) => {
  if (error.code !== 'ENOENT') throw error;
  return [];
});
for (const dir of previousDirs) {
  if (dir.isDirectory() && /^[a-z0-9][a-z0-9-]*$/.test(dir.name) && !ids.has(dir.name)) {
    const path = new URL(dir.name + '/', articlesDir);
    await rm(new URL('index.html', path), { force: true });
  }
}
await mkdir(articlesDir, { recursive: true });
for (const [path, content] of files) {
  if (path.startsWith('articles/')) await mkdir(new URL('./', new URL(path, root)), { recursive: true });
  await write(path, content);
}
console.log('Generated ' + published.length + ' article pages and the sitemap.');
