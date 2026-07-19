import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = "static-dist";
const nestedIndex = join(outDir, "static", "index.html");
const rootIndex = join(outDir, "index.html");
const projectRootIndex = "index.html";

if (!existsSync(nestedIndex)) {
  throw new Error(`Missing generated entry: ${nestedIndex}`);
}

copyFileSync(nestedIndex, rootIndex);
console.log(`Prepared ${rootIndex} for static hosts.`);

const wholeProjectIndex = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="上传图片，一键生成可调行列、带参考色号和用量清单的拼豆图纸。"
    />
    <meta property="og:title" content="拼豆图纸工坊" />
    <meta
      property="og:description"
      content="上传图片，一键生成可调行列、带参考色号和用量清单的拼豆图纸。"
    />
    <meta property="og:image" content="/static-dist/og.png" />
    <title>拼豆图纸工坊</title>
    <script type="module" crossorigin src="/static-dist/assets/${extractAssetName("script")}"></script>
    <link rel="stylesheet" crossorigin href="/static-dist/assets/${extractAssetName("style")}" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

writeFileSync(projectRootIndex, wholeProjectIndex, "utf8");
console.log(`Prepared ${projectRootIndex} for whole-project uploads.`);

function extractAssetName(type) {
  const html = existsSync(rootIndex) ? String(readFileSyncSafe(rootIndex)) : "";
  const pattern =
    type === "script"
      ? /src="\/assets\/([^"]+\.js)"/
      : /href="\/assets\/([^"]+\.css)"/;
  const match = html.match(pattern);

  if (!match) {
    throw new Error(`Could not find ${type} asset in ${rootIndex}`);
  }

  return match[1];
}

function readFileSyncSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}
