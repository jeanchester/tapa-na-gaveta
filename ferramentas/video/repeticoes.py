"""Acha palavras e frases repetidas na transcrição (gagueira, "tá, tá muito aberta", "vou deixar o Vini, vou deixar o Vini e o Endrick").

  python ferramentas/video/repeticoes.py transcricao.log [--min 1] [--inicio 3.3]

Lê as linhas "12.345 -- 16.789: texto" do sherpa-onnx. Para cada repetição imediata (uma sequência de palavras seguida
dela mesma, com ou sem vírgula no meio) mostra o trecho, o tempo da linha em que está e a sugestão: cortar a 1ª
ocorrência (do começo dela até o começo da 2ª), que deixa a frase emendada pela versão dita por último. Se a 1ª
ficou melhor dita, corte a 2ª. Os tempos de cada palavra não vêm da transcrição por linha: recorte o trecho com
pedacos.py (corta nos vales de energia) e transcreva os pedaços para achar o instante exato da emenda; depois
confira de ouvido. O corte vai em `cortes` no roteiro, em segundos da gravação depois do inicio.
"""
import argparse
import re
import sys
import unicodedata


def norm(w):
    w = unicodedata.normalize('NFD', w.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in w if not unicodedata.combining(c)))


def repeticoes(palavras, minimo=1, maximo=6):
    achados, i, n = [], 0, len(palavras)
    nw = [norm(w) for w in palavras]
    while i < n:
        for k in range(min(maximo, (n - i) // 2), 0, -1):
            a, b = nw[i:i + k], nw[i + k:i + 2 * k]
            if a == b and all(a) and (k >= 2 or len(a[0]) >= 1) and k >= minimo:
                # palavras curtíssimas ("o", "a") sozinhas não contam
                if k == 1 and len(a[0]) < 2:
                    continue
                achados.append((i, k))
                i += 2 * k - 1
                break
        i += 1
    return achados


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('log')
    ap.add_argument('--min', type=int, default=1, help='tamanho mínimo da frase repetida, em palavras (padrão 1)')
    ap.add_argument('--inicio', type=float, default=0.0)
    a = ap.parse_args()
    total = 0
    for linha in open(a.log, encoding='utf-8', errors='replace'):
        m = re.match(r'\s*([\d.]+)\s+--\s+([\d.]+):\s*(.*)', linha)
        if not m:
            continue
        ini, fim, txt = float(m[1]) - a.inicio, float(m[2]) - a.inicio, m[3].strip()
        ps = txt.split()
        for i, k in repeticoes(ps, a.min):
            total += 1
            rep = ' '.join(ps[i:i + k])
            ctx = ' '.join(ps[max(0, i - 3):i + 2 * k + 3])
            print(f'[{ini:7.2f} – {fim:7.2f}]  "{rep}" ×2   …{ctx}…')
    print(f'\n{total} repetição(ões). Sugestão: corte a 1ª ocorrência, ou a 2ª se a 1ª ficou melhor dita; confira de ouvido.')


if __name__ == '__main__':
    sys.exit(main())
