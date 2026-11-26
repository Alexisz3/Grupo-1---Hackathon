# Ilustrador local: SD-Turbo en CPU. POST /generate {prompt, seed, steps?} → WEBP
# Sin img2img: con dibujos de líneas sobre blanco devolvía el mismo boceto. La descripción del dibujo va en el prompt.
import io, json, os, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import torch
from diffusers import AutoPipelineForText2Image

torch.set_num_threads(os.cpu_count())
text2img = AutoPipelineForText2Image.from_pretrained(os.environ.get('PAINTER_MODEL', 'stabilityai/sd-turbo'), variant='fp16', torch_dtype=torch.float32)
text2img.set_progress_bar_config(disable=True)
lock = threading.Lock()  # ponytail: una imagen a la vez en CPU; una cola por usuario si hay muchos niños a la vez


def paint(data):
    prompt = str(data.get('prompt', ''))[:600]
    generator = torch.Generator().manual_seed(int(data.get('seed', 0)))
    with lock:
        # 1 paso: unos 5 a 8 s en CPU con calidad de libro ilustrado
        return text2img(prompt, num_inference_steps=int(data.get('steps', 1)), guidance_scale=0.0, width=512, height=512, generator=generator).images[0]


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200 if self.path == '/health' else 404)
        self.end_headers()

    def do_POST(self):
        if self.path != '/generate':
            self.send_response(404); self.end_headers(); return
        try:
            data = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))))
            out = io.BytesIO()
            paint(data).save(out, 'WEBP', quality=88)
        except Exception as error:
            body = json.dumps({'error': str(error)}).encode()
            self.send_response(500); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(body); return
        self.send_response(200)
        self.send_header('Content-Type', 'image/webp')
        self.send_header('Content-Length', str(out.tell()))
        self.end_headers()
        self.wfile.write(out.getvalue())

    def log_message(self, *args):
        pass


print('Ilustrador listo en :7860', flush=True)
ThreadingHTTPServer(('0.0.0.0', 7860), Handler).serve_forever()
