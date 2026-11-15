"""Transforma legendas .srt (CapCut, TikTok, Premiere...) no T do roteiro: [['palavra', segundos], ...].

  python ferramentas/video/legendas.py fala.srt [--inicio 2.4]

--inicio: segundos que o render corta do começo da gravação (o T conta a partir do começo do vídeo final).
Dentro de cada legenda, o tempo é repartido pelas palavras conforme o tamanho delas; confira as palavras
que disparam cenas na prévia (tecla m) e ajuste à mão se precisar.
"""
import argparse
import re
import sys


def seg(s):
    h, m, r = s.replace(',', '.').split(':')
    return int(h) * 3600 + int(m) * 60 + float(r)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('srt')
    ap.add_argument('--inicio', type=float, default=0.0)
    a = ap.parse_args()
    txt = open(a.srt, encoding='utf-8-sig').read()
    blocos = re.findall(r'(\d\d:\d\d:\d\d[,.]\d+)\s*-->\s*(\d\d:\d\d:\d\d[,.]\d+)\s*\n(.*?)(?:\n\s*\n|\Z)', txt, re.S)
    T = []
    for ini, fim, texto in blocos:
        t0, t1 = seg(ini) - a.inicio, seg(fim) - a.inicio
        palavras = re.findall(r"[\wÀ-ÿ%+'-]+", texto)
        if not palavras or t1 <= 0:
            continue
        pesos = [len(p) + 2 for p in palavras]
        tot, acc = sum(pesos), 0
        for p, w in zip(palavras, pesos):
            T.append([p, round(max(0.0, t0 + (t1 - t0) * acc / tot), 2)])
            acc += w
    print('T: [')
    for i in range(0, len(T), 6):
        print('  ' + ', '.join(f"['{p}', {s}]" for p, s in T[i:i + 6]) + ',')
    print('],')


if __name__ == '__main__':
    sys.exit(main())
