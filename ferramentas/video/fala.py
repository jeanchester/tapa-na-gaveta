"""Rascunho do campo `fala` do roteiro a partir da transcrição local (sherpa-onnx com VAD).

  python ferramentas/video/fala.py transcricao.log --inicio 3.3 > /tmp/fala.js

A saída da transcrição tem linhas "12.345 -- 16.789: texto". Os tempos viram segundos da gravação depois do
`inicio` (a mesma conta dos `cortes`). O Whisper erra nomes e números: corrija o texto à mão (o que for ao ar
na legenda é este texto) e apague os trechos que saem nos cortes, ou deixe que o render tire as palavras que caem
dentro de um corte.
"""
import argparse
import re
import sys


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('log')
    ap.add_argument('--inicio', type=float, default=0.0)
    a = ap.parse_args()
    print('  fala: [')
    for linha in open(a.log, encoding='utf-8', errors='replace'):
        m = re.match(r'\s*([\d.]+)\s+--\s+([\d.]+):\s*(.*)', linha)
        if not m:
            continue
        ini, fim, txt = float(m[1]) - a.inicio, float(m[2]) - a.inicio, m[3].strip()
        if fim <= 0 or not txt:
            continue
        txt = txt.replace("'", "\\'")
        print(f"    [{max(0, ini):.2f}, {fim:.2f}, '{txt}'],")
    print('  ],')


if __name__ == '__main__':
    sys.exit(main())
