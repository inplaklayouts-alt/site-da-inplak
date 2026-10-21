"""
Pipeline de imagens do site Inplak.

Lê as imagens originais de _originais/, gera versões otimizadas (AVIF + WebP)
em várias larguras, ícones (favicon, apple-touch, manifest) e imagens de
compartilhamento (Open Graph), e grava media/manifest.json com as dimensões
usadas pelo build para montar <picture>, srcset, width e height.

Uso:  python -P scripts/images.py          (gera só o que falta)
      python -P scripts/images.py --force  (refaz tudo)
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '_originais')
OUT = os.path.join(ROOT, 'media')
FORCE = '--force' in sys.argv

UP6 = 'uploads/2026/06/'
UP8 = 'uploads/2026/08/'
TEMA = 'tema/'

# Fotos: chave semântica -> arquivo original
PHOTOS = {
    # Hero
    'fachada-rede-market': UP8 + 'ChatGPT-Image-29-de-ago.-de-2026-10_07_30-1.png',
    'fachada-boa-supermercados': UP8 + 'ChatGPT-Image-29-de-ago.-de-2026-10_14_16-1.png',
    'fachada-supermercados-alvorada': UP8 + '715c58ea-dca6-4285-bfae-5bdc87351d23-1.png',
    'fachada-super-big': UP8 + 'ChatGPT-Image-29-de-ago.-de-2026-11_22_17-1.png',
    # Fachadas
    'fachada-canossa-supermercados': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-09_13_28-1.png',
    'fachada-abc-plus': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-10_32_53-1.png',
    'fachada-agibank': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-11_35_19.png',
    'fachada-ferreira-supermercados': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-11_45_05-1.png',
    'fachada-isabela-presentes-cristal-academia': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-11_51_36.png',
    'fachada-casa-da-mulher-itaquaquecetuba': UP6 + 'RUID0bf6298a4cdd42f2b147666109decd86.jpg',
    'fachada-superbom-supermercados': UP6 + 'RUID29f409cd0daf49d99a5357fb15d1ae06.jpg',
    'fachada-assai-atacadista': UP6 + 'RUIDe702de9ad80a4d94aadeb9b59d0af61c.jpg',
    'fachada-bluefit': UP8 + 'ChatGPT-Image-29-de-ago.-de-2026-09_53_45-1.png',
    'fachada-centro-de-formacao-itaquaquecetuba': UP8 + 'ChatGPT-Image-29-de-ago.-de-2026-11_15_58-1.png',
    # Totens
    'totem-assai-farma': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-10_14_00.png',
    'totem-st-marche': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-10_18_29.png',
    'totem-assai-atacadista-instalacao': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-10_20_37.png',
    'totem-avistao-instalacao': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-10_30_17.png',
    'totem-barcelos-atacadista': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-10_35_19.png',
    'totem-duda-utilidades': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-10_52_45.png',
    'totem-bluefit-vagas': UP6 + 'RUID41dd4b81c9d8452984afacc177498822.jpg',
    'totem-dia': UP6 + 'Sin-titulo-1.jpg',
    # Comunicação visual interna
    'interna-acougue-e-frios': UP6 + '49dc4615-6f24-40fc-9fab-e1564279b872-1.png',
    'interna-setores-supermercado': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-10_59_51-1-1.png',
    'interna-laticinios-frios-paes': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-10_59_51-2-1.png',
    'interna-hortifruti-ovos': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-11_03_30-1.png',
    'interna-ambientacao-supermercado': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-11_21_55-1-1.png',
    'interna-frios-e-leites': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-11_21_56-2-1.png',
    'interna-barcelos-corredores': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-11_43_38-1.png',
    'interna-barcelos-caixas': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-11_47_13-1.png',
    'interna-adega-forro-ripado': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-11_50_48-1.png',
    'interna-frente-de-caixa': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-11_53_45-1.png',
    'interna-area-de-bazar': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-12_00_11-1.png',
    'interna-adega-letreiro-suspenso': UP6 + 'RUID0d60f559f82f4814bb44ec069eb463fa.jpg',
    'interna-acougue': UP6 + 'WhatsApp-Image-2026-08-06-at-15.55.24.jpeg',
    # Mobiliário e marcenaria
    'mobiliario-loja-de-calcados': UP6 + 'ChatGPT-Image-1-de-set.-de-2026-11_37_35-1-1.png',
    'mobiliario-estantes-metalicas': UP6 + 'ChatGPT-Image-1-de-set.-de-2026-12_18_02-1-1.png',
    'mobiliario-balcao-ripado': UP6 + 'ChatGPT-Image-2-de-set.-de-2026-10_45_18-1.png',
    'mobiliario-ilha-expositora': UP6 + 'ChatGPT-Image-2-de-set.-de-2026-10_53_56-1.png',
    'mobiliario-gondolas': UP6 + 'ChatGPT-Image-2-de-set.-de-2026-11_01_22-1.png',
    'mobiliario-estantes-supermercado-mirassol': UP6 + 'ChatGPT-Image-29-de-ago.-de-2026-09_33_04.png',
    'mobiliario-projeto-3d-supermercado-mirassol': UP8 + 'Captura-de-tela-2026-08-31-115657.png',
    'mobiliario-mesas-restaurante': UP6 + 'WhatsApp-Image-2026-09-02-at-10.09.24.jpeg',
    'mobiliario-estacoes-de-trabalho': UP6 + 'WhatsApp-Image-2026-09-02-at-10.36.15-1.jpeg',
    'mobiliario-balcao-de-atendimento': UP6 + 'WhatsApp-Image-2026-09-02-at-10.49.33.jpeg',
    # Estrutura metálica
    'estrutura-metalica-cobertura': UP6 + 'SaveClip.App_623300155_18014700653653072_1910119605092414456_n-e1780436491675.jpg',
    # Antes e depois
    'antes-oxxo': UP8 + 'ChatGPT-Image-31-de-ago.-de-2026-11_27_26-1.png',
    'depois-oxxo': UP8 + 'ChatGPT-Image-31-de-ago.-de-2026-11_28_54-1.png',
    'antes-centro-de-formacao-itaquaquecetuba': UP8 + 'ChatGPT-Image-31-de-ago.-de-2026-11_59_07-1.png',
}

PHOTO_WIDTHS = [480, 800, 1200, 1600]

# Folder virtual: 12 páginas (1569 x 2200) exportadas do FlipHTML5.
FOLDER_DIR = 'folder/'
FOLDER_PAGES = 12
FOLDER_WIDTHS = [400, 700, 1100]

# Gráficos com transparência: chave -> (arquivo, larguras)
GRAPHICS = {
    'logo-inplak-branco': (TEMA + 'logo-inplak-branco.png', [180, 360, 540]),
    'camaleao': (TEMA + 'hero-camaleao-colorido.png', [160, 320, 640]),
    'camaleao-icone': (TEMA + 'hero-camaleao-colorido-icon.png', [100]),
    'palavra-criacao': (TEMA + 'hero-word-criacao.png', [200, 405]),
    'palavra-fabricacao': (TEMA + 'hero-word-fabricacao.png', [290, 588]),
    'palavra-instalacao': (TEMA + 'hero-word-instalacao.png', [280, 567]),
    'whatsapp-camaleao': (TEMA + 'whatsapp90.png', [90]),
}

CLIENT_LOGOS = sorted(os.listdir(os.path.join(SRC, 'tema', 'brand-strip')))

# Imagens de compartilhamento (1200x630): chave -> (foto, título)
OG = {
    'og-padrao': ('fachada-rede-market', 'Comunicação visual, fachadas e mobiliário para o varejo'),
    'og-externa': ('fachada-boa-supermercados', 'Fachadas e comunicação visual externa'),
    'og-interna': ('interna-acougue', 'Comunicação visual interna e sinalização'),
    'og-mobiliario': ('mobiliario-loja-de-calcados', 'Mobiliário e marcenaria sob medida'),
    'og-totens': ('totem-barcelos-atacadista', 'Totens e letreiros de identificação'),
    'og-supermercados': ('fachada-assai-atacadista', 'Comunicação visual para supermercados e atacarejos'),
    'og-projetos': ('fachada-bluefit', 'Projetos entregues pela Inplak'),
    'og-sobre': ('fachada-supermercados-alvorada', 'Há mais de 22 anos criando, fabricando e instalando'),
    'og-contato': ('fachada-super-big', 'Fale com a Inplak e tire seu projeto do papel'),
    'og-case-centro-formacao': ('fachada-centro-de-formacao-itaquaquecetuba', 'Case: Centro de Formação de Itaquaquecetuba'),
    'og-case-oxxo': ('depois-oxxo', 'Case: comunicação visual externa OXXO'),
    'og-case-mirassol': ('mobiliario-estantes-supermercado-mirassol', 'Case: mobiliário do Supermercado Mirassol'),
    'og-blog-acm': ('fachada-canossa-supermercados', 'Fachada em ACM: guia completo'),
    'og-blog-sinalizacao': ('interna-setores-supermercado', 'Sinalização interna de supermercado'),
    'og-blog-redes': ('fachada-ferreira-supermercados', 'Como padronizar a comunicação visual de uma rede'),
}

AZUL = (1, 62, 105)
VERDE = (105, 194, 2)


def first_font(*paths):
    for p in paths:
        if os.path.exists(p):
            return p
    return None


# Fontes das imagens de compartilhamento (Windows, macOS ou Linux).
FONT_BOLD = first_font(r'C:\Windows\Fonts\segoeuib.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
                       '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
FONT_REG = first_font(r'C:\Windows\Fonts\segoeui.ttf', '/System/Library/Fonts/Supplemental/Arial.ttf',
                      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')


def font(path, size):
    return ImageFont.truetype(path, size) if path else ImageFont.load_default(size=size)

manifest_path = os.path.join(OUT, 'manifest.json')
manifest = {}
if os.path.exists(manifest_path) and not FORCE:
    manifest = json.load(open(manifest_path, encoding='utf-8'))


def need(path):
    return FORCE or not os.path.exists(path)


def save_variants(im, folder, key, widths, alpha=False, quality=(78, 58)):
    """Grava key-<w>.webp e key-<w>.avif para cada largura <= largura original."""
    os.makedirs(folder, exist_ok=True)
    w0, h0 = im.size
    made = []
    for w in widths:
        if w > w0:
            continue
        made.append(w)
    if not made or made[-1] < w0 and w0 < (widths[-1] if widths else w0):
        made.append(w0)
    made = sorted(set(made))
    for w in made:
        h = round(h0 * w / w0)
        r = im if w == w0 else im.resize((w, h), Image.LANCZOS)
        webp = os.path.join(folder, f'{key}-{w}.webp')
        avif = os.path.join(folder, f'{key}-{w}.avif')
        if need(webp):
            if alpha:
                r.save(webp, 'WEBP', quality=90, method=6)
            else:
                r.save(webp, 'WEBP', quality=quality[0], method=6)
        if need(avif):
            r.save(avif, 'AVIF', quality=quality[1] if not alpha else 70, speed=4)
    return made


def open_rgb(path):
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)
    return im.convert('RGB')


def build_photos():
    folder = os.path.join(OUT, 'fotos')
    for key, rel in PHOTOS.items():
        im = open_rgb(os.path.join(SRC, rel))
        # Fotos muito grandes são limitadas a 2000 px de largura antes de gerar variantes
        if im.width > 2000:
            im = im.resize((2000, round(im.height * 2000 / im.width)), Image.LANCZOS)
        widths = save_variants(im, folder, key, PHOTO_WIDTHS)
        manifest[key] = {'dir': 'fotos', 'w': im.width, 'h': im.height, 'widths': widths}
        print('foto', key, im.size, widths)


def build_graphics():
    folder = os.path.join(OUT, 'marca')
    for key, (rel, widths) in GRAPHICS.items():
        im = Image.open(os.path.join(SRC, rel)).convert('RGBA')
        made = save_variants(im, folder, key, widths, alpha=True)
        manifest[key] = {'dir': 'marca', 'w': im.width, 'h': im.height, 'widths': made, 'alpha': True}
        print('grafico', key, im.size, made)


def build_folder():
    folder = os.path.join(OUT, 'folder')
    for n in range(1, FOLDER_PAGES + 1):
        key = f'folder-pagina-{n:02d}'
        im = open_rgb(os.path.join(SRC, FOLDER_DIR, f'pagina-{n:02d}.webp'))
        widths = save_variants(im, folder, key, FOLDER_WIDTHS, quality=(82, 62))
        manifest[key] = {'dir': 'folder', 'w': im.width, 'h': im.height, 'widths': widths}
        print('folder', key, widths)


def build_folder_og():
    """Imagem de compartilhamento do folder: capa e página 2 abertas sobre o azul da marca."""
    out = os.path.join(OUT, 'og', 'og-folder.jpg')
    if not need(out):
        return
    W, H = 1200, 630
    canvas = Image.new('RGBA', (W, H), AZUL + (255,))
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    glow = ImageDraw.Draw(layer)
    for r in range(460, 0, -6):
        a = int(85 * (1 - r / 460) ** 1.6)
        glow.ellipse([W - 330 - r, H // 2 - r, W - 330 + r, H // 2 + r], fill=(105, 194, 2, a))
    canvas.alpha_composite(layer)
    pages = [open_rgb(os.path.join(SRC, FOLDER_DIR, f'pagina-{n:02d}.webp')) for n in (1, 2)]
    ph = 520
    pw = round(pages[0].width * ph / pages[0].height)
    x0 = W - 40 - pw * 2
    y0 = (H - ph) // 2
    shadow = Image.new('RGBA', (pw * 2 + 40, ph + 40), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rectangle([20, 20, pw * 2 + 20, ph + 20], fill=(0, 0, 0, 110))
    canvas.alpha_composite(shadow, (x0 - 10, y0 + 4))
    for i, p in enumerate(pages):
        canvas.alpha_composite(p.resize((pw, ph), Image.LANCZOS).convert('RGBA'), (x0 + i * pw, y0))
    d = ImageDraw.Draw(canvas)
    d.line([(x0 + pw, y0), (x0 + pw, y0 + ph)], fill=(0, 0, 0, 90), width=3)
    title_font = font(FONT_BOLD, 54)
    d.rectangle([60, 210, 144, 218], fill=VERDE + (255,))
    y = 240
    for line in ('Folder', 'virtual', 'Inplak'):
        d.text((60, y), line, font=title_font, fill=(255, 255, 255, 255))
        y += 64
    d.text((60, y + 18), 'Folheie as 12 páginas', font=font(FONT_REG, 26), fill=(255, 255, 255, 220))
    canvas.convert('RGB').save(out, 'JPEG', quality=85, optimize=True, progressive=True)
    print('og og-folder')


def build_client_logos():
    folder = os.path.join(OUT, 'clientes')
    os.makedirs(folder, exist_ok=True)
    for f in CLIENT_LOGOS:
        key = 'cliente-' + os.path.splitext(f)[0].split('-', 1)[1]
        im = Image.open(os.path.join(SRC, 'tema', 'brand-strip', f)).convert('RGBA')
        out = os.path.join(folder, f'{key}.webp')
        if need(out):
            im.save(out, 'WEBP', lossless=True, method=6)
        manifest[key] = {'dir': 'clientes', 'w': im.width, 'h': im.height, 'widths': [], 'single': f'{key}.webp'}
        print('cliente', key, im.size)


def square_on(canvas_size, im, pad_ratio, bg):
    canvas = Image.new('RGBA', (canvas_size, canvas_size), bg)
    inner = round(canvas_size * (1 - 2 * pad_ratio))
    c = im.copy()
    c.thumbnail((inner, inner), Image.LANCZOS)
    canvas.alpha_composite(c, ((canvas_size - c.width) // 2, (canvas_size - c.height) // 2))
    return canvas


def build_icons():
    folder = os.path.join(OUT, 'icones')
    os.makedirs(folder, exist_ok=True)
    cham = Image.open(os.path.join(SRC, 'tema', 'hero-camaleao-colorido.png')).convert('RGBA')
    cham = cham.crop(cham.getbbox())
    transparent = (0, 0, 0, 0)
    blue = AZUL + (255,)
    # favicon.ico (16, 32, 48) com fundo transparente
    ico = square_on(256, cham, 0.02, transparent)
    ico.save(os.path.join(folder, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
    square_on(32, cham, 0.02, transparent).save(os.path.join(folder, 'favicon-32.png'))
    # apple-touch-icon e ícones do manifest com fundo azul da marca
    square_on(180, cham, 0.12, blue).convert('RGB').save(os.path.join(folder, 'apple-touch-icon.png'))
    square_on(192, cham, 0.10, blue).save(os.path.join(folder, 'icon-192.png'))
    square_on(512, cham, 0.10, blue).save(os.path.join(folder, 'icon-512.png'))
    square_on(512, cham, 0.22, blue).save(os.path.join(folder, 'icon-maskable-512.png'))
    print('icones ok')


def fit_text(draw, text, font_path, max_w, start, min_size):
    size = start
    while size > min_size:
        f = font(font_path, size)
        lines = wrap(draw, text, f, max_w)
        if len(lines) <= 3:
            return f, lines
        size -= 2
    f = font(font_path, min_size)
    return f, wrap(draw, text, f, max_w)


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=font) <= max_w:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def build_og():
    folder = os.path.join(OUT, 'og')
    os.makedirs(folder, exist_ok=True)
    logo = Image.open(os.path.join(SRC, 'tema', 'logo-inplak-branco.png')).convert('RGBA')
    logo.thumbnail((300, 130), Image.LANCZOS)
    W, H = 1200, 630
    for key, (photo, title) in OG.items():
        out = os.path.join(folder, f'{key}.jpg')
        if not need(out):
            continue
        im = open_rgb(os.path.join(SRC, PHOTOS[photo]))
        im = ImageOps.fit(im, (W, H), Image.LANCZOS, centering=(0.5, 0.45)).convert('RGBA')
        # Degradê azul da esquerda para a direita para dar leitura ao texto
        grad = Image.new('RGBA', (W, H))
        gd = ImageDraw.Draw(grad)
        for x in range(W):
            a = int(235 * max(0.0, 1 - x / (W * 0.78)) ** 1.15)
            gd.line([(x, 0), (x, H)], fill=AZUL + (a,))
        im.alpha_composite(grad)
        d = ImageDraw.Draw(im)
        im.alpha_composite(logo, (64, 56))
        title_font, lines = fit_text(d, title, FONT_BOLD, 640, 60, 40)
        lh = int(title_font.size * 1.18)
        y = H - 92 - lh * len(lines)
        d.rectangle([64, y - 34, 64 + 84, y - 26], fill=VERDE + (255,))
        for i, line in enumerate(lines):
            d.text((64, y + i * lh), line, font=title_font, fill=(255, 255, 255, 255))
        small = font(FONT_REG, 26)
        d.text((64, H - 64), 'inplak.com.br  ·  Santo André/SP  ·  Atendimento em todo o Brasil', font=small, fill=(255, 255, 255, 215))
        im.convert('RGB').save(out, 'JPEG', quality=84, optimize=True, progressive=True)
        print('og', key)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    build_photos()
    build_graphics()
    build_client_logos()
    build_folder()
    build_icons()
    build_og()
    build_folder_og()
    json.dump(manifest, open(manifest_path, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    total = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(OUT) for f in fs)
    print(f'manifest com {len(manifest)} entradas; pasta media = {total / 1024 / 1024:.1f} MB')
