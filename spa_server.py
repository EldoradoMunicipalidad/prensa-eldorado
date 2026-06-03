import http.server
import os
import sys

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Ensure we serve from dist/
        file_path = os.path.join(os.getcwd(), self.path.lstrip('/'))
        print(f'Request: {self.path} -> {file_path}', file=sys.stderr)
        
        if os.path.isfile(file_path):
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        
        # SPA fallback
        self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def log_message(self, format, *args):
        print(f'[SPA] {args[0]} {args[1]} {args[2]}', file=sys.stderr)

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    directory = sys.argv[2] if len(sys.argv) > 2 else 'dist'
    abspath = os.path.abspath(directory)
    os.chdir(abspath)
    server = http.server.HTTPServer(('0.0.0.0', port), SPAHandler)
    print(f'SPA server on http://localhost:{port}, serving {abspath}')
    server.serve_forever()
