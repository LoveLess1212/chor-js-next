import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';

const rootDir = process.cwd();
const port = Number(process.env.PORT || 8080);

const contentTypes = new Map([
  [ '.css', 'text/css; charset=utf-8' ],
  [ '.html', 'text/html; charset=utf-8' ],
  [ '.js', 'text/javascript; charset=utf-8' ],
  [ '.json', 'application/json; charset=utf-8' ],
  [ '.svg', 'image/svg+xml; charset=utf-8' ],
  [ '.bpmn', 'application/xml; charset=utf-8' ]
]);

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType
  });
  res.end(body);
}

function resolveRequestPath(urlPath) {
  const safePath = decodeURIComponent(urlPath.split('?')[0]);
  const resolvedPath = path.resolve(rootDir, '.' + safePath);
  const relativePath = path.relative(rootDir, resolvedPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  return resolvedPath;
}

const server = http.createServer((req, res) => {
  const requestPath = resolveRequestPath(req.url || '/');

  if (!requestPath) {
    send(res, 400, 'Bad request');
    return;
  }

  let filePath = requestPath;

  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch (error) {
    if (path.extname(filePath) === '') {
      filePath = path.join(filePath, 'index.html');
    }
  }

  if (!fs.existsSync(filePath)) {
    send(res, 404, 'Not found');
    return;
  }

  const contentType = contentTypes.get(path.extname(filePath)) || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(filePath);

  send(res, 200, fileBuffer, contentType);
});

server.listen(port, () => {
  console.log(`Serving ${rootDir} at http://localhost:${port}`);
  console.log('Open http://localhost:' + port + '/docs/local-prepackaged.html');
});