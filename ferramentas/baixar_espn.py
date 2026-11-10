"""Baixa da ESPN a tabela e todos os jogos do Brasileirão Série A e grava um retrato em JSON.

Uso:  python ferramentas/baixar_espn.py [ano] [saida]
      (padrão: ano atual, dados/brasileirao-<ano>.json)

A API da ESPN é pública e não oficial (sem chave, CORS liberado: o site pode chamá-la direto do
navegador). Este retrato serve de reserva quando ela falhar ou mudar, e para testar sem rede.
Ressalvas conferidas em 07/11/2026:
- o parâmetro de data que funciona é o mês inteiro (dates=AAAAMM); intervalo e dia avulso voltam vazios;
- a ESPN NÃO informa a rodada; o jogo adiado continua listado (STATUS_POSTPONED) e a remarcação vem com outro id;
- "form" traz os últimos 5 resultados de cada time (W/D/L, o mais recente à direita... confira);
- jogo sem horário definido vem com timeValid = false.
"""
import datetime
import gzip
import json
import os
import sys
import unicodedata
import urllib.request

LIGA = 'bra.1'
BASE = 'https://site.api.espn.com/apis'

# nome da ESPN (sem acento, minúsculo) -> arquivo em midia/escudos/
ESCUDOS = {
    'athletico-pr': 'athletico', 'athletico paranaense': 'athletico', 'atletico-mg': 'atleticomg', 'bahia': 'bahia', 'botafogo': 'botafogo',
    'red bull bragantino': 'bragantino', 'bragantino': 'bragantino', 'chapecoense': 'chapecoense',
    'corinthians': 'corinthians', 'coritiba': 'coritiba', 'cruzeiro': 'cruzeiro', 'flamengo': 'flamengo',
    'fluminense': 'fluminense', 'gremio': 'gremio', 'internacional': 'internacional', 'mirassol': 'mirassol',
    'palmeiras': 'palmeiras', 'remo': 'remo', 'santos': 'santos', 'sao paulo': 'sp', 'vasco da gama': 'vasco',
    'vasco': 'vasco', 'vitoria': 'vitoria', 'ceara': 'ceara', 'fortaleza': 'fortaleza', 'sport': 'sport',
    'juventude': 'juventude',
}


def sem_acento(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().strip()


def baixar(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'tapa-na-gaveta/1.0', 'Accept-Encoding': 'gzip'})
    with urllib.request.urlopen(req, timeout=30) as r:
        dados = r.read()
        if r.headers.get('Content-Encoding') == 'gzip' or dados[:2] == b'\x1f\x8b':
            dados = gzip.decompress(dados)
    return json.loads(dados.decode('utf-8'))


def main():
    ano = int(sys.argv[1]) if len(sys.argv) > 1 else datetime.date.today().year
    saida = sys.argv[2] if len(sys.argv) > 2 else os.path.join('dados', f'brasileirao-{ano}.json')

    tabela = baixar(f'{BASE}/v2/sports/soccer/{LIGA}/standings?season={ano}')
    entradas = tabela['children'][0]['standings']['entries']
    times, classificacao = {}, []
    for e in entradas:
        t = e['team']
        st = {x['name']: x.get('value') for x in e['stats']}
        nome = t['displayName']
        times[t['id']] = {
            'id': t['id'], 'nome': nome, 'abrev': t.get('abbreviation'),
            'escudo': ESCUDOS.get(sem_acento(nome)),
            'logo_espn': (t.get('logos') or [{}])[0].get('href'),
        }
        classificacao.append({
            'time': t['id'], 'pos': int(st.get('rank') or 0), 'pts': int(st.get('points') or 0),
            'j': int(st.get('gamesPlayed') or 0), 'v': int(st.get('wins') or 0), 'e': int(st.get('ties') or 0),
            'd': int(st.get('losses') or 0), 'gp': int(st.get('pointsFor') or 0), 'gc': int(st.get('pointsAgainst') or 0),
            'sg': int(st.get('pointDifferential') or 0),
        })

    jogos, vistos = [], set()
    for mes in range(1, 13):
        sb = baixar(f'{BASE}/site/v2/sports/soccer/{LIGA}/scoreboard?dates={ano}{mes:02d}&limit=300')
        for ev in sb.get('events', []):
            c = ev['competitions'][0]
            status = c['status']['type']['name']
            casa = next(x for x in c['competitors'] if x['homeAway'] == 'home')
            fora = next(x for x in c['competitors'] if x['homeAway'] == 'away')
            for x in (casa, fora):  # time que não estava na tabela (não deveria acontecer)
                tid = x['team']['id']
                if tid not in times:
                    times[tid] = {'id': tid, 'nome': x['team']['displayName'], 'abrev': x['team'].get('abbreviation'),
                                  'escudo': ESCUDOS.get(sem_acento(x['team']['displayName'])), 'logo_espn': x['team'].get('logo')}
            terminado = status == 'STATUS_FULL_TIME'
            chave = (ev['id'], status)
            if chave in vistos:
                continue
            vistos.add(chave)
            jogos.append({
                'id': ev['id'], 'data': ev['date'], 'horario_definido': c.get('timeValid', True),
                'status': status, 'mandante': casa['team']['id'], 'visitante': fora['team']['id'],
                'gols_mandante': int(casa['score']) if terminado else None,
                'gols_visitante': int(fora['score']) if terminado else None,
                'forma_mandante': casa.get('form'), 'forma_visitante': fora.get('form'),
            })

    # o jogo adiado continua listado (STATUS_POSTPONED) e a remarcação vem com outro id:
    # descarta o adiado quando o mesmo confronto, com o mesmo mando, aparece de novo
    confrontos = {(j['mandante'], j['visitante']) for j in jogos if j['status'] != 'STATUS_POSTPONED'}
    jogos = [j for j in jogos if not (j['status'] == 'STATUS_POSTPONED' and (j['mandante'], j['visitante']) in confrontos)]
    jogos.sort(key=lambda j: j['data'])

    sem_escudo = [t['nome'] for t in times.values() if not t['escudo']]
    out = {
        'fonte': 'ESPN (site.api.espn.com, não oficial)', 'liga': LIGA, 'temporada': ano,
        'baixado_em': datetime.datetime.now().isoformat(timespec='seconds'),
        'times': sorted(times.values(), key=lambda t: t['nome']),
        'classificacao': sorted(classificacao, key=lambda c: c['pos']),
        'jogos': jogos,
    }
    os.makedirs(os.path.dirname(saida) or '.', exist_ok=True)
    with open(saida, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    feitos = sum(1 for j in jogos if j['status'] == 'STATUS_FULL_TIME')
    print(f'{saida}: {len(times)} times, {len(jogos)} jogos ({feitos} terminados, {len(jogos) - feitos} a jogar)')
    if sem_escudo:
        print('sem escudo mapeado:', ', '.join(sem_escudo))


if __name__ == '__main__':
    main()
