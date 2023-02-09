/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildTarget: 'netlify',
  server:
    process.env.NETLIFY || process.env.NETLIFY_LOCAL
      ? './server.js'
      : undefined,
  ignoredRouteFiles: ['*.css', '*.scss'], // same as remix config
  future: {
    v2_routeConvention: true,
  },
  serverDependenciesToBundle: [
    /^rehype.*/,
    /^remark.*/,
    /^unified.*/,
    /^unist.*/,
    /^hast.*/,
    /^bail.*/,
    /^trough.*/,
    /^mdast.*/,
    /^micromark.*/,
    /^decode.*/,
    /^character.*/,
    /^property.*/,
    /^space.*/,
    /^comma.*/,
    /^react-markdown$/,
    /^vfile.*/,
    /^ccount*/,
    /^trim-lines*/,
    /^markdown-table*/,
    /^markdown*/,
    /^react-syntax-highlighter*/,
    /^codemirror.*/,
    /^replit\/codemirror-vim$/,
  ],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "api/index.js",
  // publicPath: "/build/",
}
