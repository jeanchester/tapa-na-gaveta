"""Servidor local sem cache para o desenvolvimento: python serve.py  ->  http://localhost:8780/"""
import http.server
import socketserver
import sys

PORTA = int(sys.argv[1]) if len(sys.argv) > 1 else 8780


class SemCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
                      '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def log_message(self, fmt, *args):  # só os erros
        if args and str(args[1])[:1] in '45':
            super().log_message(fmt, *args)


socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('', PORTA), SemCache) as httpd:
    print(f'http://localhost:{PORTA}/')
    httpd.serve_forever()
