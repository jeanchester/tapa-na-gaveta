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


def escudo_novo(nome, logo):
    """Time sem escudo nos nossos arquivos (recém-promovido, por exemplo): baixa o da ESPN para
    midia/escudos/<nome>.png e passa a usar esse arquivo."""
    if not logo:
        return None
    slug = ''.join(c for c in sem_acento(nome).replace(' ', '_') if c.isalnum() or c == '_').strip('_')
    pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'midia', 'escudos')
    destino = os.path.join(pasta, slug + '.png')
    if not os.path.exists(destino):
        try:
            req = urllib.request.Request(logo, headers={'User-Agent': 'tapa-na-gaveta/1.0'})
            with urllib.request.urlopen(req, timeout=30) as r:
                png = r.read()
            if png[:8] != b'\x89PNG\r\n\x1a\n':
                return None
            with open(destino, 'wb') as f:
                f.write(png)
            print('escudo novo:', nome, '->', slug + '.png')
        except Exception as e:  # noqa: BLE001
            print('escudo de', nome, 'não baixou:', e)
            return None
    if _ARQUIVOS is not None:
        _ARQUIVOS.add(slug)
    return slug


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
        envolvidos = d.get('athletesInvolved') or [{}]
        quem = envolvidos[0]
        nome = quem.get('displayName') or quem.get('shortName')
        time_do_gol = str((d.get('team') or {}).get('id') or (quem.get('team') or {}).get('id') or '')
        if nome:
            gols.append({'id': str(quem.get('id') or nome), 'nome': nome, 'time': time_do_gol,
                         'penalti': bool(d.get('penaltyKick')),
                         # quem mais aparece no lance (a assistência, quando a ESPN informa): serve para
                         # conferir o time de cada jogador pelo jogo, e não só pelo cadastro dele
                         'outros': [str(x.get('id')) for x in envolvidos[1:] if x.get('id')]})


def cartoes_do_jogo(c, jogo_id, data, cartoes):
    """Cartões listados no placar do dia (details com yellowCard/redCard): jogador, time e jogo."""
    for d in c.get('details') or []:
        if not (d.get('yellowCard') or d.get('redCard')):
            continue
        quem = (d.get('athletesInvolved') or [{}])[0]
        nome = quem.get('displayName') or quem.get('shortName')
        if not nome:
            continue
        cartoes.append({'id': str(quem.get('id') or nome), 'nome': nome, 'jogo': jogo_id, 'data': data,
                        'time': str((d.get('team') or {}).get('id') or (quem.get('team') or {}).get('id') or ''),
                        'cor': 'v' if d.get('redCard') else 'a'})


# amarelos que dão suspensão automática (CBF: a cada 3; o vermelho suspende o jogo seguinte)
LIMITE_AMARELOS = {'bra.1': 3, 'bra.2': 3}


def resumo_cartoes(cartoes, jogos, times, LIGA='bra.1'):
    """Por jogador: amarelos e vermelhos no campeonato e, onde a regra é conhecida, quem está
    suspenso para o próximo jogo do time e quem está pendurado (a um amarelo da suspensão)."""
    limite = LIMITE_AMARELOS.get(LIGA)
    feitos = [j for j in jogos if j['status'] == 'STATUS_FULL_TIME']
    validos = {j['id'] for j in feitos}
    ultimo = {}   # último jogo terminado de cada time
    for j in feitos:
        for t in (j['mandante'], j['visitante']):
            ultimo[t] = j['id']
    proximo = {}
    for j in jogos:
        if j['status'] == 'STATUS_FULL_TIME':
            continue
        for t, o in ((j['mandante'], j['visitante']), (j['visitante'], j['mandante'])):
            proximo.setdefault(t, {'data': j['data'], 'contra': (times.get(o) or {}).get('nome'), 'jogo': j['id']})
    por = {}
    for c in sorted((c for c in cartoes if c['jogo'] in validos), key=lambda c: c['data']):
        p = por.setdefault(c['id'], {'nome': c['nome'], 'time': c['time'], 'jogos': {}})
        p['time'] = c['time'] or p['time']
        p['jogos'].setdefault(c['jogo'], []).append(c['cor'])
    out = []
    for p in por.values():
        am = vm = ciclo = 0
        gatilho = motivo = None
        for jid, cores in p['jogos'].items():   # em ordem de data
            if 'v' in cores:                    # expulso: os amarelos do mesmo jogo não acumulam
                vm += 1
                gatilho, motivo = jid, 'vermelho'
                continue
            am += cores.count('a')
            if limite:
                ciclo += cores.count('a')
                if ciclo >= limite:
                    ciclo -= limite
                    gatilho, motivo = jid, 'amarelos'
        tid = p['time']
        suspenso = bool(limite and gatilho and gatilho == ultimo.get(tid) and tid in proximo)
        out.append({'nome': p['nome'], 'time': tid, 'escudo': (times.get(tid) or {}).get('escudo'),
                    'amarelos': am, 'vermelhos': vm,
                    **({'motivo': motivo} if suspenso else {}),
                    **({'ciclo': ciclo, 'suspenso': suspenso, 'pendurado': (not suspenso) and ciclo == limite - 1} if limite else {}),
                    **({'proximo': proximo[tid]} if suspenso or (limite and ciclo == limite - 1 and tid in proximo) else {})})
    out.sort(key=lambda x: (-x['vermelhos'] * 2 - x['amarelos'], x['nome']))
    return {'limite_amarelos': limite, 'jogadores': out}


def lideres(ano, gols, times, LIGA='bra.1'):
    """Artilheiros e garçons. Tenta o quadro de líderes da ESPN; sem ele, conta os gols do placar."""
    out = {'atualizado': datetime.datetime.now().isoformat(timespec='seconds'), 'artilheiros': [], 'assistencias': []}
    # time de cada jogador pelos lances (o último gol ou assistência dele no campeonato); o cadastro
    # da ESPN às vezes aponta outro clube, e há homônimos (dois Matheus Pereira, por exemplo)
    time_pelo_lance = {}
    for g in gols or []:
        if g['time']:
            time_pelo_lance[g['id']] = g['time']
            for o in g.get('outros', []):
                time_pelo_lance[o] = g['time']
    try:
        st = baixar(f'{BASE}/site/v2/sports/soccer/{LIGA}/statistics?season={ano}')
        for cat in st.get('stats') or []:
            nome = (cat.get('name') or '').lower()
            alvo = 'artilheiros' if 'goal' in nome else 'assistencias' if 'assist' in nome else None
            if not alvo:
                continue
            for l in (cat.get('leaders') or [])[:50]:
                a = l.get('athlete') or {}
                tid = time_pelo_lance.get(str(a.get('id') or '')) or str((a.get('team') or l.get('team') or {}).get('id') or '')
                out[alvo].append({'nome': a.get('displayName') or a.get('shortName'), 'time': tid,
                                  'escudo': (times.get(tid) or {}).get('escudo'), 'n': int(float(l.get('value') or 0))})
    except Exception as e:  # noqa: BLE001
        print('quadro de líderes indisponível:', e)
    # todos os autores de gol, contados pelos placares: completa o quadro da ESPN (que só traz os
    # primeiros) quando se filtra por time
    conta = {}
    for g in gols or []:
        x = conta.setdefault(g['id'], {'nome': g['nome'], 'time': g['time'], 'n': 0, 'pen': 0})
        x['n'] += 1
        x['pen'] += g['penalti']
        x['time'] = g['time'] or x['time']
    todos = sorted(conta.values(), key=lambda x: (-x['n'], x['pen'], x['nome']))
    out['gols_por_jogador'] = [{'nome': x['nome'], 'time': x['time'], 'escudo': (times.get(x['time']) or {}).get('escudo'), 'n': x['n']} for x in todos]
    if not out['artilheiros'] and todos:
        out['artilheiros'] = out['gols_por_jogador'][:50]
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


def elencos_espn(times, LIGA='bra.1'):
    """Elenco de cada time na ESPN, com o número de jogos na liga desta temporada (para cruzar com
    os elencos do Você Escala: quem saiu do clube some, quem é da base e nunca jogou fica de fora)."""
    POS = {'G': 'G', 'D': 'D', 'M': 'M', 'F': 'A'}
    out = {'atualizado': datetime.datetime.now().isoformat(timespec='seconds'), 'times': {}}
    for tid, t in times.items():
        if not t.get('escudo'):
            continue
        try:
            r = baixar(f'{BASE}/site/v2/sports/soccer/{LIGA}/teams/{tid}/roster')
        except Exception as e:  # noqa: BLE001
            print(f'::warning::elenco de {t["nome"]} não saiu: {e}')
            continue
        lista = []
        for a in r.get('athletes') or []:
            jogos = 0
            for c in (((a.get('statistics') or {}).get('splits') or {}).get('categories') or []):
                for s in c.get('stats') or []:
                    if s.get('name') == 'appearances':
                        jogos = int(s.get('value') or 0)
            num = str(a.get('jersey') or '')
            lista.append({
                'n': a.get('displayName') or a.get('fullName'), 'curto': a.get('shortName'),
                'num': int(num) if num.isdigit() else None,
                'pos': POS.get((a.get('position') or {}).get('abbreviation'), 'M'), 'jogos': jogos,
            })
        if lista:
            out['times'][t['escudo']] = lista
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

    jogos, vistos, gols, cartoes = [], set(), [], []
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
                cartoes_do_jogo(c, ev['id'], ev['date'], cartoes)
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
    # artilharia de todas as competições: estatisticas-jogadores.json (Série A) ou -<arquivo>.json
    base = os.path.splitext(os.path.basename(saida))[0]
    arq_jog = 'estatisticas-jogadores.json' if extras else 'estatisticas-jogadores-' + base + '.json'
    try:
        est = lideres(ano, gols, times, LIGA)
        try:
            est['cartoes'] = resumo_cartoes(cartoes, jogos, times, LIGA)
        except Exception as e:  # noqa: BLE001
            print('::warning::cartões não saíram:', e)
        gravar(os.path.join(pasta, arq_jog), est)
    except Exception as e:  # noqa: BLE001
        print('::warning::artilharia não saiu:', e)
    try:
        if not extras:
            raise RuntimeError('só na Série A')
        gravar(os.path.join(pasta, 'ultimas-escalacoes.json'), ultimas_escalacoes(jogos, times, LIGA))
    except Exception as e:  # noqa: BLE001
        if extras:
            print('::warning::escalações não saíram:', e)
    if extras:
        try:
            gravar(os.path.join(pasta, 'elencos-espn.json'), elencos_espn(times, LIGA))
        except Exception as e:  # noqa: BLE001
            print('::warning::elencos da ESPN não saíram:', e)

    for t in times.values():
        if not t['escudo']:
            t['escudo'] = escudo_novo(t['nome'], t.get('logo_espn'))
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
