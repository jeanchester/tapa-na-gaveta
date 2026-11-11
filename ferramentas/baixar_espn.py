"""Baixa da ESPN a tabela e todos os jogos do Brasileirão Série A e grava um retrato em JSON.

Uso:  python ferramentas/baixar_espn.py [ano] [saida]          Série A (padrão: ano atual)
      python ferramentas/baixar_espn.py --comp premier          uma competição de shared/competicoes.json
      python ferramentas/baixar_espn.py --todas                 todas as competições
      (artilharia e últimas escalações só saem para a Série A)

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


# nomes da ESPN (sem acento, minúsculo) de outras ligas -> arquivo em midia/escudos/
# (por liga: "Athletic Club" é o de Bilbao na Espanha e o de São João del-Rei na Série B)
ESCUDOS_LIGA = {
    'bra.2': {'athletic club': 'athleticbr', 'athletic': 'athleticbr', 'sport recife': 'sport', 'sport': 'sport', 'america-mg': 'americamg', 'america mineiro': 'americamg',
              'atletico-go': 'atleticogo', 'atletico goianiense': 'atleticogo', 'atletico go': 'atleticogo', 'vila nova': 'vilanova', 'ponte preta': 'pontepreta',
              'sao bernardo': 'saobernardo', 'botafogo-sp': 'botafogosp', 'botafogo sp': 'botafogosp', 'operario-pr': 'operario', 'operario': 'operario',
              'novorizontino': 'novorizontino', 'gremio novorizontino': 'novorizontino', 'santa cruz': 'santacruz', 'sampaio correa': 'sampaiocorrea',
              'botafogo-pb': 'botafogopb', 'america-rj': 'americarj', 'ferroviaria': 'ferroviaria', 'guarani': 'guarani', 'paysandu': 'paysandu', 'remo': 'remo'},
    'eng.1': {'manchester city': 'city', 'manchester united': 'man_united', 'tottenham hotspur': 'tottenham', 'newcastle united': 'newcastle', 'nottingham forest': 'forest',
              'wolverhampton wanderers': 'wolverhampton', 'west ham united': 'west_ham', 'crystal palace': 'crystal', 'brighton & hove albion': 'brighton',
              'afc bournemouth': 'bournemouth', 'aston villa': 'villa', 'leeds united': 'leeds'},
    'esp.1': {'real madrid': 'real_madrid', 'atletico madrid': 'atletico', 'athletic club': 'athletic', 'real sociedad': 'sociedad', 'real betis': 'betis',
              'celta vigo': 'celta', 'rayo vallecano': 'rayo', 'alaves': 'alaves', 'deportivo alaves': 'alaves', 'real oviedo': 'oviedo', 'rcd mallorca': 'mallorca'},
    'ita.1': {'internazionale': 'inter', 'inter milan': 'inter', 'ac milan': 'milan', 'as roma': 'roma', 'hellas verona': 'verona', 'verona': 'verona'},
    'ger.1': {'bayern munich': 'bayern', 'borussia dortmund': 'dortmund', 'bayer leverkusen': 'leverkusen', 'rb leipzig': 'leipzig', 'eintracht frankfurt': 'eintracht',
              'vfb stuttgart': 'stuttgart', 'sc freiburg': 'freiburg', 'borussia monchengladbach': 'gladbach', "borussia m'gladbach": 'gladbach', 'vfl wolfsburg': 'wolfsburg',
              'werder bremen': 'bremen', 'tsg hoffenheim': 'hoffenheim', '1. fc union berlin': 'union_berlim', 'union berlin': 'union_berlim', 'fc augsburg': 'augsburg',
              'mainz': 'mainz', '1. fsv mainz 05': 'mainz', '1. fc heidenheim 1846': 'heidenheim', 'heidenheim': 'heidenheim', 'fc cologne': 'koln', '1. fc koln': 'koln',
              'hamburg sv': 'hamburger', 'hamburger sv': 'hamburger', 'st. pauli': 'pauli', 'fc st. pauli': 'pauli'},
    'fra.1': {'paris saint-germain': 'paris', 'stade rennais': 'rennes', 'stade brestois 29': 'brest', 'brest': 'brest', 'le havre ac': 'le_havre', 'le havre': 'le_havre',
              'paris fc': 'paris_fc', 'as monaco': 'monaco', 'olympique lyonnais': 'lyon', 'olympique de marseille': 'marseille', 'ogc nice': 'nice', 'rc lens': 'lens',
              'rc strasbourg': 'strasbourg', 'losc lille': 'lille', 'fc nantes': 'nantes', 'aj auxerre': 'auxerre', 'fc lorient': 'lorient', 'fc metz': 'metz', 'angers sco': 'angers'},
}
_ARQUIVOS = None


def escudo_de(nome, liga):
    """Arquivo do escudo: mapa da liga, mapa da Série A ou o nome sem espaços (se o arquivo existir)."""
    global _ARQUIVOS
    if _ARQUIVOS is None:
        pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'midia', 'escudos')
        _ARQUIVOS = {f[:-4] for f in os.listdir(pasta) if f.endswith('.png')} if os.path.isdir(pasta) else set()
    k = sem_acento(nome)
    for mapa in (ESCUDOS_LIGA.get(liga, {}), ESCUDOS if liga == 'bra.1' else {}):
        if k in mapa:
            return mapa[k]
    if liga != 'bra.1' and k in ESCUDOS and liga.startswith('bra'):
        return ESCUDOS[k]
    comuns = {'city', 'united', 'fc', 'club', 'real', 'sporting', 'athletic', 'atletico', 'clube', 'esporte', 'sport', 'ac', 'as', 'sc', 'cf'}
    for cand in (k.replace(' ', ''), k.replace(' ', '_'), k.split(' ')[-1], k.split(' ')[0]):
        cand = ''.join(c for c in cand if c.isalnum() or c == '_')
        if cand in _ARQUIVOS and cand not in comuns:
            return cand
    return None


def sem_acento(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().strip()


def baixar(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'tapa-na-gaveta/1.0', 'Accept-Encoding': 'gzip'})
    with urllib.request.urlopen(req, timeout=30) as r:
        dados = r.read()
        if r.headers.get('Content-Encoding') == 'gzip' or dados[:2] == b'\x1f\x8b':
            dados = gzip.decompress(dados)
    return json.loads(dados.decode('utf-8'))


def gravar(caminho, dados):
    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=1)
    print(caminho, 'gravado')


def gols_do_jogo(c, gols):
    """Gols listados no placar do dia (competitions[0].details): autor e time; gol contra não conta."""
    for d in c.get('details') or []:
        if not d.get('scoringPlay') or d.get('ownGoal'):
            continue
        quem = (d.get('athletesInvolved') or [{}])[0]
        nome = quem.get('displayName') or quem.get('shortName')
        if nome:
            gols.append({'id': str(quem.get('id') or nome), 'nome': nome, 'time': str((d.get('team') or {}).get('id') or (quem.get('team') or {}).get('id') or ''),
                         'penalti': bool(d.get('penaltyKick'))})


def lideres(ano, gols, times, LIGA='bra.1'):
    """Artilheiros e garçons. Tenta o quadro de líderes da ESPN; sem ele, conta os gols do placar."""
    out = {'atualizado': datetime.datetime.now().isoformat(timespec='seconds'), 'artilheiros': [], 'assistencias': []}
    try:
        st = baixar(f'{BASE}/site/v2/sports/soccer/{LIGA}/statistics?season={ano}')
        for cat in st.get('stats') or []:
            nome = (cat.get('name') or '').lower()
            alvo = 'artilheiros' if 'goal' in nome else 'assistencias' if 'assist' in nome else None
            if not alvo:
                continue
            for l in (cat.get('leaders') or [])[:15]:
                a = l.get('athlete') or {}
                tid = str((a.get('team') or l.get('team') or {}).get('id') or '')
                out[alvo].append({'nome': a.get('displayName') or a.get('shortName'), 'time': tid,
                                  'escudo': (times.get(tid) or {}).get('escudo'), 'n': int(float(l.get('value') or 0))})
    except Exception as e:  # noqa: BLE001
        print('quadro de líderes indisponível:', e)
    if not out['artilheiros'] and gols:
        conta = {}
        for g in gols:
            x = conta.setdefault(g['id'], {'nome': g['nome'], 'time': g['time'], 'n': 0, 'pen': 0})
            x['n'] += 1
            x['pen'] += g['penalti']
        top = sorted(conta.values(), key=lambda x: (-x['n'], x['pen'], x['nome']))[:15]
        out['artilheiros'] = [dict(x, escudo=(times.get(x['time']) or {}).get('escudo')) for x in top]
        out['fonte_artilharia'] = 'placares'
    return out


def ultimas_escalacoes(jogos, times, LIGA='bra.1'):
    """Os 11 titulares de cada time no último jogo terminado (súmula da ESPN: rosters)."""
    feitos = [j for j in jogos if j['status'] == 'STATUS_FULL_TIME']
    out, sumulas = {'atualizado': datetime.datetime.now().isoformat(timespec='seconds'), 'times': {}}, {}
    for tid, t in times.items():
        if not t.get('escudo'):
            continue
        meus = [j for j in feitos if tid in (j['mandante'], j['visitante'])]
        for j in reversed(meus[-3:]):          # se a súmula do último vier sem escalação, tenta o anterior
            if j['id'] not in sumulas:
                try:
                    sumulas[j['id']] = baixar(f'{BASE}/site/v2/sports/soccer/{LIGA}/summary?event={j["id"]}')
                except Exception as e:  # noqa: BLE001
                    print('súmula', j['id'], 'falhou:', e)
                    sumulas[j['id']] = {}
            r = next((x for x in sumulas[j['id']].get('rosters') or [] if str((x.get('team') or {}).get('id')) == tid), None)
            tit = [p for p in (r or {}).get('roster') or [] if p.get('starter')]
            if len(tit) < 11:
                continue
            outro = j['visitante'] if j['mandante'] == tid else j['mandante']
            out['times'][t['escudo']] = {
                'jogo': j['id'], 'data': j['data'], 'contra': (times.get(outro) or {}).get('nome'),
                'esquema': (r.get('formation') or '').strip(),
                'titulares': [{
                    'n': (p.get('athlete') or {}).get('displayName') or (p.get('athlete') or {}).get('shortName'),
                    'curto': (p.get('athlete') or {}).get('shortName'),
                    'num': int(p['jersey']) if str(p.get('jersey') or '').isdigit() else None,
                    'pos': (p.get('position') or {}).get('abbreviation') or '',
                    'lugar': int(p['formationPlace']) if str(p.get('formationPlace') or '').isdigit() else None,
                } for p in tit[:11]],
            }
            break
    return out


def competicoes():
    caminho = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shared', 'competicoes.json')
    with open(caminho, encoding='utf-8') as f:
        return json.load(f)['lista']


def meses_de(ini, fim):
    a, m = map(int, ini.split('-'))
    af, mf = map(int, fim.split('-'))
    while (a, m) <= (af, mf):
        yield a, m
        m += 1
        if m > 12:
            a, m = a + 1, 1


def main():
    if '--todas' in sys.argv or '--comp' in sys.argv:
        alvo = None if '--todas' in sys.argv else sys.argv[sys.argv.index('--comp') + 1]
        falhas = 0
        for c in competicoes():
            if (alvo and c['id'] != alvo) or (not alvo and c['id'] == 'seriea'):   # a Série A tem passo próprio
                continue
            try:
                baixar_liga(c['espn'], c['temporada'], c['dados'], list(meses_de(*c['meses'])), extras=c['id'] == 'seriea')
            except Exception as e:  # noqa: BLE001
                falhas += 1
                print(f'::warning::{c["id"]} não saiu: {e}')
        if alvo and falhas:
            sys.exit(1)
        return
    ano = int(sys.argv[1]) if len(sys.argv) > 1 else datetime.date.today().year
    saida = sys.argv[2] if len(sys.argv) > 2 else os.path.join('dados', f'brasileirao-{ano}.json')
    baixar_liga('bra.1', ano, saida, [(ano, m) for m in range(1, 13)], extras=True)


def baixar_liga(LIGA, ano, saida, meses, extras=False):

    tabela = baixar(f'{BASE}/v2/sports/soccer/{LIGA}/standings?season={ano}')
    entradas = tabela['children'][0]['standings']['entries']
    times, classificacao = {}, []
    for e in entradas:
        t = e['team']
        st = {x['name']: x.get('value') for x in e['stats']}
        nome = t['displayName']
        times[t['id']] = {
            'id': t['id'], 'nome': nome, 'abrev': t.get('abbreviation'),
            'escudo': escudo_de(nome, LIGA),
            'logo_espn': (t.get('logos') or [{}])[0].get('href'),
        }
        classificacao.append({
            'time': t['id'], 'pos': int(st.get('rank') or 0), 'pts': int(st.get('points') or 0),
            'j': int(st.get('gamesPlayed') or 0), 'v': int(st.get('wins') or 0), 'e': int(st.get('ties') or 0),
            'd': int(st.get('losses') or 0), 'gp': int(st.get('pointsFor') or 0), 'gc': int(st.get('pointsAgainst') or 0),
            'sg': int(st.get('pointDifferential') or 0),
        })

    jogos, vistos, gols = [], set(), []
    for a_mes, mes in meses:
        sb = baixar(f'{BASE}/site/v2/sports/soccer/{LIGA}/scoreboard?dates={a_mes}{mes:02d}&limit=300')
        for ev in sb.get('events', []):
            c = ev['competitions'][0]
            status = c['status']['type']['name']
            casa = next(x for x in c['competitors'] if x['homeAway'] == 'home')
            fora = next(x for x in c['competitors'] if x['homeAway'] == 'away')
            for x in (casa, fora):  # time que não estava na tabela (não deveria acontecer)
                tid = x['team']['id']
                if tid not in times:
                    times[tid] = {'id': tid, 'nome': x['team']['displayName'], 'abrev': x['team'].get('abbreviation'),
                                  'escudo': escudo_de(x['team']['displayName'], LIGA), 'logo_espn': x['team'].get('logo')}
            terminado = status == 'STATUS_FULL_TIME'
            chave = (ev['id'], status)
            if chave in vistos:
                continue
            vistos.add(chave)
            if terminado:
                gols_do_jogo(c, gols)
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
    # só a fase de pontos corridos: fora os jogos com time a definir (TBD) e os de playoff/
    # mata-mata depois da última rodada (cada time joga no máximo 2 × (clubes − 1) vezes)
    reais = {k for k, t in times.items() if not t['nome'].upper().startswith('TBD')}
    limite = 2 * (len(reais) - 1)
    conta, filtrados = {}, []
    for j in jogos:
        h, a = j['mandante'], j['visitante']
        if h not in reais or a not in reais or conta.get(h, 0) >= limite or conta.get(a, 0) >= limite:
            continue
        conta[h] = conta.get(h, 0) + 1
        conta[a] = conta.get(a, 0) + 1
        filtrados.append(j)
    jogos = filtrados
    times = {k: t for k, t in times.items() if k in reais}

    # artilharia, assistências e a última escalação de cada time (arquivos à parte: o simulador
    # não precisa deles e eles podem falhar sem derrubar o retrato principal)
    pasta = os.path.dirname(saida) or '.'
    if not extras:
        gols = None
    try:
        if gols is None:
            raise RuntimeError('só na Série A')
        gravar(os.path.join(pasta, 'estatisticas-jogadores.json'), lideres(ano, gols, times, LIGA))
    except Exception as e:  # noqa: BLE001
        if extras:
            print('::warning::artilharia não saiu:', e)
    try:
        if not extras:
            raise RuntimeError('só na Série A')
        gravar(os.path.join(pasta, 'ultimas-escalacoes.json'), ultimas_escalacoes(jogos, times, LIGA))
    except Exception as e:  # noqa: BLE001
        if extras:
            print('::warning::escalações não saíram:', e)

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
