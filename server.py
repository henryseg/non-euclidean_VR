from http.server import HTTPServer, BaseHTTPRequestHandler, SimpleHTTPRequestHandler
import ssl

handler = SimpleHTTPRequestHandler
handler.extensions_map = {
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.png': 'image/png',
	'.jpg': 'image/jpg',
	'.svg':	'image/svg+xml',
	'.css':	'text/css',
	'.js':	'text/javascript',
	'.mjs':	'text/javascript',
	'': 'application/octet-stream', # Default
}

httpd = HTTPServer(('localhost', 4443), handler)


httpd.socket = ssl.wrap_socket (httpd.socket,
        keyfile="./ssl/key.pem",
        certfile='./ssl/cert.pem', server_side=True)

httpd.serve_forever()

