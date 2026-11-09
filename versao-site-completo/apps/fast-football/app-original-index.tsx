import { Orbitron_700Bold, useFonts } from '@expo-google-fonts/orbitron';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import Matter from 'matter-js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    ImageSourcePropType,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// --- IMPORTAÇÃO ADMOB ---
import mobileAds, {
    AdEventType,
    AdsConsent,
    AdsConsentPrivacyOptionsRequirementStatus,
    InterstitialAd,
    RewardedAd,
    RewardedAdEventType,
    TestIds
} from 'react-native-google-mobile-ads';

import i18n from '../i18n/translations';

// --- IMPORTAÇÃO REVENUECAT (ATIVADA) ---
import Purchases from 'react-native-purchases';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';

// Link da loja com marcação UTM (Play Console > aquisição mostra as instalações vindas do compartilhamento)
const linkCompartilhar = (campanha: 'partida' | 'campeao') =>
    `https://play.google.com/store/apps/details?id=com.julio.footballexpress&referrer=${encodeURIComponent(`utm_source=fastfootball&utm_medium=compartilhar&utm_campaign=${campanha}`)}`;

// =============================================================================
// 1. CONFIGURAÇÕES E ASSETS
// =============================================================================

// --- CONFIGURAÇÃO DOS ANÚNCIOS ---
const adUnitIdInter = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-1665055635227173/2419941208';
const interstitial = InterstitialAd.createForAdRequest(adUnitIdInter);

const adUnitIdRewarded = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-1665055635227173/8682097226';
const rewardedAd = RewardedAd.createForAdRequest(adUnitIdRewarded);

// Intersticial: no máximo 1 a cada INTERSTICIAL_INTERVALO_MS e nunca na primeira sessão.
// Premiado: se o anúncio falhar FALHAS_PARA_LIBERAR vezes seguidas, libera a recompensa mesmo assim.
const INTERSTICIAL_INTERVALO_MS = 90 * 1000;
const RECARREGAR_ANUNCIO_MS = 30 * 1000;
const FALHAS_PARA_LIBERAR = 3;

// --- PERSISTÊNCIA (AsyncStorage) ---
const CONFIG_KEY = 'ff_config';               // velocidade, duração, áudio, goleiro
const CAMPEONATO_KEY = 'ff_campeonato';       // campeonato em andamento
const SESSOES_KEY = 'ff_sessoes';

// --- CONFIGURAÇÃO REVENUECAT ---
const REVENUECAT_API_KEY = 'CHAVE_REMOVIDA';
const ENTITLEMENT_ID = 'pro_access';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_WIDTH = 450;
const GAME_HEIGHT = 800;
const SCALE = Math.min(SCREEN_WIDTH / GAME_WIDTH, SCREEN_HEIGHT / GAME_HEIGHT) * 0.95;
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 40;

type AssetDictionary = Record<string, ImageSourcePropType>;

// --- SONS (.mp3) ---
const SOUNDS: Record<string, any> = {
    gol: require('./assets/sons/gol.mp3'),
    apito: require('./assets/sons/apito.mp3'),
};

// --- LIGAS (.png) ---
const LIGAS: AssetDictionary = {
    'copa': require('./assets/ligas/logo_copa.png'),
    'brasileirao': require('./assets/ligas/brasileirao.png'),
    'bundesliga': require('./assets/ligas/bundesliga.png'),
    'laliga': require('./assets/ligas/laliga.png'),
    'ligue1': require('./assets/ligas/ligue1.png'),
    'premier': require('./assets/ligas/premier.png'),
    'seriea': require('./assets/ligas/seriea.png'),
    'champions': require('./assets/ligas/champions.png'),
};

const LEAGUE_ORDER = ['copa', 'premier', 'laliga', 'seriea', 'brasileirao', 'bundesliga', 'ligue1', 'champions'];

const LEAGUE_DISPLAY_NAMES: Record<string, string> = {
    'copa': 'COPA DO MUNDO',
    'brasileirao': 'BRASILEIRAO',
    'premier': 'PREMIER LEAGUE',
    'laliga': 'LA LIGA',
    'seriea': 'SERIE A',
    'bundesliga': 'BUNDESLIGA',
    'ligue1': 'LIGUE 1',
    'champions': 'CHAMPIONS LEAGUE'
};

// --- ESCUDOS (.png) ---
const TIMES: AssetDictionary = {
    // Brasileiros
    'athletico': require('./assets/escudos/athletico.png'),
    'atleticomg': require('./assets/escudos/atleticomg.png'),
    'bahia': require('./assets/escudos/bahia.png'),
    'botafogo': require('./assets/escudos/botafogo.png'),
    'bragantino': require('./assets/escudos/bragantino.png'),
    'chapecoense': require('./assets/escudos/chapecoense.png'),
    'corinthians': require('./assets/escudos/corinthians.png'),
    'coritiba': require('./assets/escudos/coritiba.png'),
    'cruzeiro': require('./assets/escudos/cruzeiro.png'),
    'flamengo': require('./assets/escudos/flamengo.png'),
    'fluminense': require('./assets/escudos/fluminense.png'),
    'gremio': require('./assets/escudos/gremio.png'),
    'internacional': require('./assets/escudos/internacional.png'),
    'mirassol': require('./assets/escudos/mirassol.png'),
    'palmeiras': require('./assets/escudos/palmeiras.png'),
    'remo': require('./assets/escudos/remo.png'),
    'santos': require('./assets/escudos/santos.png'),
    'sp': require('./assets/escudos/sp.png'),
    'vasco': require('./assets/escudos/vasco.png'),
    'vitoria': require('./assets/escudos/vitoria.png'),

    // Internacionais
    'alaves': require('./assets/escudos/Alavés.png'),
    'angers': require('./assets/escudos/angers.png'),
    'arsenal': require('./assets/escudos/arsenal.png'),
    'atalanta': require('./assets/escudos/atalanta.png'),
    'athletic': require('./assets/escudos/Athletic.png'),
    'atletico': require('./assets/escudos/atletico.png'),
    'augsburg': require('./assets/escudos/augsburg.png'),
    'auxerre': require('./assets/escudos/auxerre.png'),
    'barcelona': require('./assets/escudos/barcelona.png'),
    'bayern': require('./assets/escudos/bayern.png'),
    'betis': require('./assets/escudos/Betis.png'),
    'bologna': require('./assets/escudos/bologna.png'),
    'bournemouth': require('./assets/escudos/Bournemouth.png'),
    'bremen': require('./assets/escudos/bremen.png'),
    'brentford': require('./assets/escudos/Brentford.png'),
    'brighton': require('./assets/escudos/Brighton.png'),
    'burnley': require('./assets/escudos/Burnley.png'),
    'cagliari': require('./assets/escudos/cagliari.png'),
    'celta': require('./assets/escudos/Celta.png'),
    'chelsea': require('./assets/escudos/chelsea.png'),
    'city': require('./assets/escudos/city.png'),
    'como': require('./assets/escudos/como.png'),
    'cremonese': require('./assets/escudos/cremonese.png'),
    'crystal': require('./assets/escudos/Crystal.png'),
    'dortmund': require('./assets/escudos/dortmund.png'),
    'eintracht': require('./assets/escudos/eintracht.png'),
    'elche': require('./assets/escudos/Elche.png'),
    'espanyol': require('./assets/escudos/Espanyol.png'),
    'everton': require('./assets/escudos/Everton.png'),
    'fiorentina': require('./assets/escudos/fiorentina.png'),
    'forest': require('./assets/escudos/forest.png'),
    'freiburg': require('./assets/escudos/freiburg.png'),
    'fulham': require('./assets/escudos/Fulham.png'),
    'genoa': require('./assets/escudos/genoa.png'),
    'getafe': require('./assets/escudos/Getafe.png'),
    'girona': require('./assets/escudos/Girona.png'),
    'hamburger': require('./assets/escudos/hamburger.png'),
    'heidenheim': require('./assets/escudos/heidenheim.png'),
    'hellas': require('./assets/escudos/hellas.png'),
    'hoffenheim': require('./assets/escudos/hoffenheim.png'),
    'inter': require('./assets/escudos/inter.png'),
    'juventus': require('./assets/escudos/juventus.png'),
    'koln': require('./assets/escudos/koln.png'),
    'lazio': require('./assets/escudos/lazio.png'),
    'le_havre': require('./assets/escudos/le_havre.png'),
    'lecce': require('./assets/escudos/lecce.png'),
    'leeds': require('./assets/escudos/leeds.png'),
    'leipzig': require('./assets/escudos/leipzig.png'),
    'lens': require('./assets/escudos/lens.png'),
    'levante': require('./assets/escudos/Levante.png'),
    'leverkusen': require('./assets/escudos/leverkusen.png'),
    'lille': require('./assets/escudos/lille.png'),
    'liverpool': require('./assets/escudos/liverpool.png'),
    'lorient': require('./assets/escudos/lorient.png'),
    'lyon': require('./assets/escudos/lyon.png'),
    'mainz': require('./assets/escudos/mainz.png'),
    'mallorca': require('./assets/escudos/Mallorca.png'),
    'man_united': require('./assets/escudos/man_united.png'),
    'marseille': require('./assets/escudos/marseille.png'),
    'metz': require('./assets/escudos/metz.png'),
    'milan': require('./assets/escudos/milan.png'),
    'monaco': require('./assets/escudos/monaco.png'),
    'monchengladbach': require('./assets/escudos/monchengladbach.png'),
    'nantes': require('./assets/escudos/nantes.png'),
    'napoli': require('./assets/escudos/napoli.png'),
    'newcastle': require('./assets/escudos/Newcastle.png'),
    'nice': require('./assets/escudos/nice.png'),
    'osasuna': require('./assets/escudos/Osasuna.png'),
    'oviedo': require('./assets/escudos/Oviedo.png'),
    'paris': require('./assets/escudos/paris.png'),
    'paris_fc': require('./assets/escudos/paris_fc.png'),
    'parma': require('./assets/escudos/parma.png'),
    'pauli': require('./assets/escudos/pauli.png'),
    'pisa': require('./assets/escudos/pisa.png'),
    'rayo': require('./assets/escudos/Rayo.png'),
    'real_madrid': require('./assets/escudos/real_madrid.png'),
    'rennes': require('./assets/escudos/rennes.png'),
    'roma': require('./assets/escudos/roma.png'),
    'sassuolo': require('./assets/escudos/sassuolo.png'),
    'sevilla': require('./assets/escudos/Sevilla.png'),
    'sociedad': require('./assets/escudos/sociedad.png'),
    'stade': require('./assets/escudos/stade.png'),
    'strasbourg': require('./assets/escudos/strasbourg.png'),
    'stuttgart': require('./assets/escudos/stuttgart.png'),
    'sunderland': require('./assets/escudos/Sunderland.png'),
    'torino': require('./assets/escudos/torino.png'),
    'tottenham': require('./assets/escudos/Tottenham.png'),
    'toulouse': require('./assets/escudos/toulouse.png'),
    'udinese': require('./assets/escudos/udinese.png'),
    'union_berlim': require('./assets/escudos/union_berlim.png'),
    'valencia': require('./assets/escudos/Valencia.png'),
    'villa': require('./assets/escudos/villa.png'),
    'villarreal': require('./assets/escudos/Villarreal.png'),
    'west_ham': require('./assets/escudos/west_ham.png'),
    'wolfsburg': require('./assets/escudos/wolfsburg.png'),
    'wolverhampton': require('./assets/escudos/Wolverhampton.png'),

    // Seleções Copa do Mundo
    'africa_do_sul': require('./assets/escudos_e_estadios_copa/africa_do_sul.png'),
    'alemanha': require('./assets/escudos_e_estadios_copa/alemanha.png'),
    'arabia': require('./assets/escudos_e_estadios_copa/arabia.png'),
    'argelia': require('./assets/escudos_e_estadios_copa/argelia.png'),
    'argentina': require('./assets/escudos_e_estadios_copa/argentina.png'),
    'austria': require('./assets/escudos_e_estadios_copa/austria.png'),
    'belgica': require('./assets/escudos_e_estadios_copa/belgica.png'),
    'bosnia': require('./assets/escudos_e_estadios_copa/bosnia.png'),
    'brasil': require('./assets/escudos_e_estadios_copa/brasil.png'),
    'cabo_verde': require('./assets/escudos_e_estadios_copa/cabo_verde.png'),
    'canada': require('./assets/escudos_e_estadios_copa/canada.png'),
    'catar': require('./assets/escudos_e_estadios_copa/catar.png'),
    'colombia': require('./assets/escudos_e_estadios_copa/colombia.png'),
    'congo': require('./assets/escudos_e_estadios_copa/congo.png'),
    'coreia': require('./assets/escudos_e_estadios_copa/coreia.png'),
    'croacia': require('./assets/escudos_e_estadios_copa/croacia.png'),
    'curacao': require('./assets/escudos_e_estadios_copa/curacao.png'),
    'egito': require('./assets/escudos_e_estadios_copa/egito.png'),
    'equador': require('./assets/escudos_e_estadios_copa/equador.png'),
    'escocia': require('./assets/escudos_e_estadios_copa/escocia.png'),
    'espanha': require('./assets/escudos_e_estadios_copa/espanha.png'),
    'eua': require('./assets/escudos_e_estadios_copa/eua.png'),
    'franca': require('./assets/escudos_e_estadios_copa/franca.png'),
    'gana': require('./assets/escudos_e_estadios_copa/gana.png'),
    'haiti': require('./assets/escudos_e_estadios_copa/haiti.png'),
    'holanda': require('./assets/escudos_e_estadios_copa/holanda.png'),
    'inglaterra': require('./assets/escudos_e_estadios_copa/inglaterra.png'),
    'ira': require('./assets/escudos_e_estadios_copa/ira.png'),
    'iraque': require('./assets/escudos_e_estadios_copa/iraque.png'),
    'japao': require('./assets/escudos_e_estadios_copa/japao.png'),
    'jordania': require('./assets/escudos_e_estadios_copa/jordania.png'),
    'marfim': require('./assets/escudos_e_estadios_copa/marfim.png'),
    'marrocos': require('./assets/escudos_e_estadios_copa/marrocos.png'),
    'mexico': require('./assets/escudos_e_estadios_copa/mexico.png'),
    'noruega': require('./assets/escudos_e_estadios_copa/noruega.png'),
    'nova_zelandia': require('./assets/escudos_e_estadios_copa/nova_zelandia.png'),
    'panama': require('./assets/escudos_e_estadios_copa/panama.png'),
    'paraguai': require('./assets/escudos_e_estadios_copa/paraguai.png'),
    'portugal': require('./assets/escudos_e_estadios_copa/portugal.png'),
    'senegal': require('./assets/escudos_e_estadios_copa/senegal.png'),
    'suecia': require('./assets/escudos_e_estadios_copa/suecia.png'),
    'suica': require('./assets/escudos_e_estadios_copa/suica.png'),
    'tcheca': require('./assets/escudos_e_estadios_copa/tcheca.png'),
    'tunisia': require('./assets/escudos_e_estadios_copa/tunisia.png'),
    'turquia': require('./assets/escudos_e_estadios_copa/turquia.png'),
    'uruguai': require('./assets/escudos_e_estadios_copa/uruguai.png'),
    'uzbequistao': require('./assets/escudos_e_estadios_copa/uzbequistao.png'),
};

// --- ESTÁDIOS (.jpg) ---
const ESTADIOS: AssetDictionary = {
    // Padrão
    'campo': require('./assets/estadios/estadio_sp.jpg'),

    // Estádios Copa do Mundo
    'estadio_atlanta': require('./assets/escudos_e_estadios_copa/Atlanta Stadium.jpg'),
    'estadio_bc_place': require('./assets/escudos_e_estadios_copa/BC Place Vancouver.jpg'),
    'estadio_boston': require('./assets/escudos_e_estadios_copa/Boston Stadium.jpg'),
    'estadio_dallas': require('./assets/escudos_e_estadios_copa/Dallas Stadium.jpg'),
    'estadio_guadalajara': require('./assets/escudos_e_estadios_copa/Estadio Guadalajara.jpg'),
    'estadio_monterrey': require('./assets/escudos_e_estadios_copa/Estadio Monterrey.jpg'),
    'estadio_houston': require('./assets/escudos_e_estadios_copa/Houston Stadium.jpg'),
    'estadio_kansas': require('./assets/escudos_e_estadios_copa/Kansas City Stadium.jpg'),
    'estadio_los_angeles': require('./assets/escudos_e_estadios_copa/Los Angeles Stadium.jpg'),
    'estadio_mexico_city': require('./assets/escudos_e_estadios_copa/Mexico City Stadium.jpg'),
    'estadio_miami': require('./assets/escudos_e_estadios_copa/Miami Stadium.jpg'),
    'estadio_ny_nj': require('./assets/escudos_e_estadios_copa/New York New Jersey Stadium.jpg'),
    'estadio_philadelphia': require('./assets/escudos_e_estadios_copa/Philadelphia Stadium.jpg'),
    'estadio_san_francisco': require('./assets/escudos_e_estadios_copa/San Francisco Bay Area Stadium.jpg'),
    'estadio_seattle': require('./assets/escudos_e_estadios_copa/Seattle Stadium.jpg'),
    'estadio_toronto': require('./assets/escudos_e_estadios_copa/Toronto Stadium.jpg'),

    // Mapeados
    'estadio_alaves': require('./assets/estadios/estadio_alaves.jpg'),
    'estadio_angers': require('./assets/estadios/estadio_angers.jpg'),
    'estadio_arsenal': require('./assets/estadios/estadio_arsenal.jpg'),
    'estadio_atalanta': require('./assets/estadios/estadio_atalanta.jpg'),
    'estadio_atletico': require('./assets/estadios/estadio_atletico.jpg'),
    'estadio_augsburg': require('./assets/estadios/estadio_augsburg.jpg'),
    'estadio_auxerre': require('./assets/estadios/estadio_auxerre.jpg'),
    'estadio_barcelona': require('./assets/estadios/estadio_barcelona.jpg'),
    'estadio_bayern': require('./assets/estadios/estadio_bayern.jpg'),
    'estadio_betis': require('./assets/estadios/estadio_betis.jpg'),
    'estadio_bilbao': require('./assets/estadios/estadio_bilbao.jpg'),
    'estadio_bologna': require('./assets/estadios/estadio_bologna.jpg'),
    'estadio_bournemouth': require('./assets/estadios/estadio_bournemouth.jpg'),
    'estadio_bremen': require('./assets/estadios/estadio_bremen.jpg'),
    'estadio_brentford': require('./assets/estadios/estadio_brentford.jpg'),
    'estadio_brest': require('./assets/estadios/estadio_brest.jpg'),
    'estadio_brighton': require('./assets/estadios/estadio_brighton.jpg'),
    'estadio_burnley': require('./assets/estadios/estadio_burnley.jpg'),
    'estadio_cagliari': require('./assets/estadios/estadio_cagliari.jpg'),
    'estadio_celta': require('./assets/estadios/estadio_celta.jpg'),
    'estadio_chelsea': require('./assets/estadios/estadio_chelsea.jpg'),
    'estadio_city': require('./assets/estadios/estadio_city.jpg'),
    'estadio_como': require('./assets/estadios/estadio_como.jpg'),
    'estadio_cremonese': require('./assets/estadios/estadio_cremonese.jpg'),
    'estadio_dortmund': require('./assets/estadios/estadio_dortmund.jpg'),
    'estadio_elche': require('./assets/estadios/estadio_elche.jpg'),
    'estadio_espanyol': require('./assets/estadios/estadio_espanyol.jpg'),
    'estadio_everton': require('./assets/estadios/estadio_everton.jpg'),
    'estadio_fiorentina': require('./assets/estadios/estadio_fiorentina.jpg'),
    'estadio_forest': require('./assets/estadios/estadio_forest.jpg'),
    'estadio_frankfurt': require('./assets/estadios/estadio_frankfurt.jpg'),
    'estadio_freiburg': require('./assets/estadios/estadio_freiburg.jpg'),
    'estadio_fulham': require('./assets/estadios/estadio_fulham.jpg'),
    'estadio_genoa': require('./assets/estadios/estadio_genoa.jpg'),
    'estadio_getafe': require('./assets/estadios/estadio_getafe.jpg'),
    'estadio_girona': require('./assets/estadios/estadio_girona.jpg'),
    'estadio_gladbach': require('./assets/estadios/estadio_gladbach.jpg'),
    'estadio_hamburger': require('./assets/estadios/estadio_hamburg.jpg'),
    'estadio_le_havre': require('./assets/estadios/estadio_havre.jpg'),
    'estadio_heidenheim': require('./assets/estadios/estadio_heidenheim.jpg'),
    'estadio_hoffenheim': require('./assets/estadios/estadio_hoffenheim.jpg'),
    'estadio_inter': require('./assets/estadios/estadio_inter.jpg'),
    'estadio_juventus': require('./assets/estadios/estadio_juventus.jpg'),
    'estadio_koln': require('./assets/estadios/estadio_koln.jpg'),
    'estadio_lazio': require('./assets/estadios/estadio_lazio.jpg'),
    'estadio_lecce': require('./assets/estadios/estadio_lecce.jpg'),
    'estadio_leeds': require('./assets/estadios/estadio_leeds.jpg'),
    'estadio_leipzig': require('./assets/estadios/estadio_leipzig.jpg'),
    'estadio_lens': require('./assets/estadios/estadio_lens.jpg'),
    'estadio_levante': require('./assets/estadios/estadio_levante.jpg'),
    'estadio_leverkusen': require('./assets/estadios/estadio_leverkusen.jpg'),
    'estadio_lille': require('./assets/estadios/estadio_lille.jpg'),
    'estadio_liverpool': require('./assets/estadios/estadio_liverpool.jpg'),
    'estadio_lorient': require('./assets/estadios/estadio_lorient.jpg'),
    'estadio_lyon': require('./assets/estadios/estadio_lyon.jpg'),
    'estadio_mainz': require('./assets/estadios/estadio_mainz.jpg'),
    'estadio_mallorca': require('./assets/estadios/estadio_mallorca.jpg'),
    'estadio_man_united': require('./assets/estadios/estadio_united.jpg'),
    'estadio_marseille': require('./assets/estadios/estadio_marseille.jpg'),
    'estadio_metz': require('./assets/estadios/estadio_metz.jpg'),
    'estadio_milan': require('./assets/estadios/estadio_milan.jpg'),
    'estadio_monaco': require('./assets/estadios/estadio_monaco.jpg'),
    'estadio_monchengladbach': require('./assets/estadios/estadio_gladbach.jpg'),
    'estadio_nantes': require('./assets/estadios/estadio_nantes.jpg'),
    'estadio_napoli': require('./assets/estadios/estadio_napoli.jpg'),
    'estadio_newcastle': require('./assets/estadios/estadio_newcastle.jpg'),
    'estadio_nice': require('./assets/estadios/estadio_nice.jpg'),
    'estadio_osasuna': require('./assets/estadios/estadio_osasuna.jpg'),
    'estadio_oviedo': require('./assets/estadios/estadio_oviedo.jpg'),
    'estadio_palace': require('./assets/estadios/estadio_palace.jpg'),
    'estadio_paris': require('./assets/estadios/estadio_paris.jpg'),
    'estadio_paris_fc': require('./assets/estadios/estadio_paris_fc.jpg'),
    'estadio_parma': require('./assets/estadios/estadio_parma.jpg'),
    'estadio_pauli': require('./assets/estadios/estadio_pauli.jpg'),
    'estadio_pisa': require('./assets/estadios/estadio_pisa.jpg'),
    'estadio_rayo': require('./assets/estadios/estadio_rayo.jpg'),
    'estadio_real_madrid': require('./assets/estadios/estadio_real_madrid.jpg'),
    'estadio_rennes': require('./assets/estadios/estadio_rennes.jpg'),
    'estadio_roma': require('./assets/estadios/estadio_roma.jpg'),
    'estadio_sassuolo': require('./assets/estadios/estadio_sassuolo.jpg'),
    'estadio_sevilla': require('./assets/estadios/estadio_sevilla.jpg'),
    'estadio_sociedad': require('./assets/estadios/estadio_sociedad.jpg'),
    'estadio_stade': require('./assets/estadios/estadio_brest.jpg'),
    'estadio_strasbourg': require('./assets/estadios/estadio_strasbourg.jpg'),
    'estadio_stuttgart': require('./assets/estadios/estadio_stuttgart.jpg'),
    'estadio_sunderland': require('./assets/estadios/estadio_sunderland.jpg'),
    'estadio_torino': require('./assets/estadios/estadio_torino.jpg'),
    'estadio_tottenham': require('./assets/estadios/estadio_tottenham.jpg'),
    'toulouse': require('./assets/estadios/estadio_toulouse.jpg'),
    'udinese': require('./assets/estadios/estadio_udinese.jpg'),
    'union_berlim': require('./assets/estadios/estadio_union_berlim.jpg'),
    'valencia': require('./assets/estadios/estadio_valencia.jpg'),
    'verona': require('./assets/estadios/estadio_verona.jpg'),
    'villa': require('./assets/estadios/estadio_villa.jpg'),
    'villarreal': require('./assets/estadios/estadio_villarreal.jpg'),
    'west_ham': require('./assets/estadios/estadio_west_ham.jpg'),
    'wolfsburg': require('./assets/estadios/estadio_wolfsburg.jpg'),
    'wolverhampton': require('./assets/estadios/estadio_wolves.jpg'),

    // Brasileiros (Estádios Extras)
    'estadio_athletico': require('./assets/estadios/estadio_athletico.jpg'),
    'estadio_atleticomg': require('./assets/estadios/estadio_atleticomg.jpg'),
    'estadio_bahia': require('./assets/estadios/estadio_bahia.jpg'),
    'estadio_botafogo': require('./assets/estadios/estadio_botafogo.jpg'),
    'estadio_bragantino': require('./assets/estadios/estadio_bragantino.jpg'),
    'estadio_chapecoense': require('./assets/estadios/estadio_chapecoense.jpg'),
    'estadio_coritiba': require('./assets/estadios/estadio_coritiba.jpg'),
    'estadio_cruzeiro': require('./assets/estadios/estadio_cruzeiro.jpg'),
    'estadio_curintia': require('./assets/estadios/estadio_curintia.jpg'),
    'estadio_flamengo': require('./assets/estadios/estadio_flamengo.jpg'),
    'estadio_fluminense': require('./assets/estadios/estadio_fluminense.jpg'),
    'estadio_gremio': require('./assets/estadios/estadio_gremio.jpg'),
    'estadio_internacional': require('./assets/estadios/estadio_internacional.jpg'),
    'estadio_mirassol': require('./assets/estadios/estadio_mirassol.jpg'),
    'estadio_palmeiras': require('./assets/estadios/estadio_palmeiras.jpg'),
    'estadio_remo': require('./assets/estadios/estadio_remo.jpg'),
    'estadio_santos': require('./assets/estadios/estadio_santos.jpg'),
    'estadio_sp': require('./assets/estadios/estadio_sp.jpg'),
    'estadio_vasco': require('./assets/estadios/estadio_vasco.jpg'),
    'estadio_vitoria': require('./assets/estadios/estadio_vitoria.jpg'),
};

const LEAGUE_TEAMS: Record<string, string[]> = {
    'copa': ['africa_do_sul', 'alemanha', 'arabia', 'argelia', 'argentina', 'austria', 'belgica', 'bosnia', 'brasil', 'cabo_verde', 'canada', 'catar', 'colombia', 'congo', 'coreia', 'croacia', 'curacao', 'egito', 'equador', 'escocia', 'espanha', 'eua', 'franca', 'gana', 'haiti', 'holanda', 'inglaterra', 'ira', 'iraque', 'japao', 'jordania', 'marfim', 'marrocos', 'mexico', 'noruega', 'nova_zelandia', 'panama', 'paraguai', 'portugal', 'senegal', 'suecia', 'suica', 'tcheca', 'tunisia', 'turquia', 'uruguai', 'uzbequistao'],
    'brasileirao': ['athletico', 'atleticomg', 'bahia', 'botafogo', 'bragantino', 'chapecoense', 'corinthians', 'coritiba', 'cruzeiro', 'flamengo', 'fluminense', 'gremio', 'internacional', 'mirassol', 'palmeiras', 'remo', 'santos', 'sp', 'vasco', 'vitoria'],
    'premier': ['arsenal', 'bournemouth', 'brentford', 'brighton', 'burnley', 'chelsea', 'city', 'crystal', 'everton', 'forest', 'fulham', 'leeds', 'liverpool', 'man_united', 'newcastle', 'sunderland', 'tottenham', 'villa', 'west_ham', 'wolves', 'wolverhampton', 'united'],
    'laliga': ['alaves', 'athletic', 'atletico', 'barcelona', 'betis', 'celta', 'elche', 'espanyol', 'getafe', 'girona', 'levante', 'mallorca', 'osasuna', 'oviedo', 'rayo', 'real_madrid', 'sevilla', 'sociedad', 'valencia', 'villarreal'],
    'seriea': ['atalanta', 'bologna', 'cagliari', 'como', 'cremonese', 'fiorentina', 'genoa', 'hellas', 'inter', 'juventus', 'lazio', 'lecce', 'milan', 'napoli', 'parma', 'pisa', 'roma', 'sassuolo', 'torino', 'udinese', 'verona'],
    'bundesliga': ['augsburg', 'bayern', 'bremen', 'dortmund', 'eintracht', 'freiburg', 'gladbach', 'hamburger', 'heidenheim', 'hoffenheim', 'koln', 'leipzig', 'leverkusen', 'mainz', 'monchengladbach', 'pauli', 'stuttgart', 'union_berlim', 'wolfsburg'],
    'ligue1': ['angers', 'auxerre', 'brest', 'le_havre', 'lens', 'lille', 'lorient', 'lyon', 'marseille', 'metz', 'monaco', 'nantes', 'nice', 'paris', 'paris_fc', 'rennes', 'stade', 'strasbourg', 'toulouse']
};

const TEAM_NAMES_MAP: Record<string, string> = {
    // Seleções Copa
    'africa_do_sul': 'África do Sul', 'alemanha': 'Alemanha', 'arabia': 'Arábia Saudita',
    'argelia': 'Argélia', 'argentina': 'Argentina', 'austria': 'Áustria',
    'belgica': 'Bélgica', 'bosnia': 'Bósnia', 'brasil': 'Brasil',
    'cabo_verde': 'Cabo Verde', 'canada': 'Canadá', 'catar': 'Catar',
    'colombia': 'Colômbia', 'congo': 'Congo', 'coreia': 'Coreia do Sul',
    'croacia': 'Croácia', 'curacao': 'Curaçao', 'egito': 'Egito',
    'equador': 'Equador', 'escocia': 'Escócia', 'espanha': 'Espanha',
    'eua': 'EUA', 'franca': 'França', 'gana': 'Gana', 'haiti': 'Haiti',
    'holanda': 'Holanda', 'inglaterra': 'Inglaterra', 'ira': 'Irã',
    'iraque': 'Iraque', 'japao': 'Japão', 'jordania': 'Jordânia',
    'marfim': 'Costa do Marfim', 'marrocos': 'Marrocos', 'mexico': 'México',
    'noruega': 'Noruega', 'nova_zelandia': 'Nova Zelândia', 'panama': 'Panamá',
    'paraguai': 'Paraguai', 'portugal': 'Portugal', 'senegal': 'Senegal',
    'suecia': 'Suécia', 'suica': 'Suíça', 'tcheca': 'Rep. Tcheca',
    'tunisia': 'Tunísia', 'turquia': 'Turquia', 'uruguai': 'Uruguai',
    'uzbequistao': 'Uzbequistão',

    // Brasileiros
    'athletico': 'Athletico-PR',
    'atleticomg': 'Atlético-MG',
    'bahia': 'Bahia',
    'botafogo': 'Botafogo',
    'bragantino': 'RB Bragantino',
    'chapecoense': 'Chapecoense',
    'corinthians': 'Corinthians',
    'coritiba': 'Coritiba',
    'cruzeiro': 'Cruzeiro',
    'flamengo': 'Flamengo',
    'fluminense': 'Fluminense',
    'gremio': 'Grêmio',
    'internacional': 'Internacional',
    'mirassol': 'Mirassol',
    'palmeiras': 'Palmeiras',
    'remo': 'Remo',
    'santos': 'Santos',
    'sp': 'São Paulo',
    'vasco': 'Vasco',
    'vitoria': 'Vitória',

    // Premier League
    'arsenal': 'Arsenal',
    'bournemouth': 'Bournemouth',
    'brentford': 'Brentford',
    'brighton': 'Brighton',
    'burnley': 'Burnley',
    'chelsea': 'Chelsea',
    'city': 'Man City',
    'crystal': 'Crystal Palace',
    'everton': 'Everton',
    'forest': 'Nottm Forest',
    'fulham': 'Fulham',
    'leeds': 'Leeds United',
    'liverpool': 'Liverpool',
    'man_united': 'Man United',
    'newcastle': 'Newcastle',
    'sunderland': 'Sunderland',
    'tottenham': 'Tottenham',
    'villa': 'Aston Villa',
    'west_ham': 'West Ham',
    'wolverhampton': 'Wolves',
    'wolves': 'Wolves',
    'united': 'Man United',

    // La Liga
    'alaves': 'Alavés',
    'athletic': 'Ath. Bilbao',
    'atletico': 'Atl. Madrid',
    'barcelona': 'Barcelona',
    'betis': 'Real Betis',
    'celta': 'Celta Vigo',
    'elche': 'Elche',
    'espanyol': 'Espanyol',
    'getafe': 'Getafe',
    'girona': 'Girona',
    'levante': 'Levante',
    'mallorca': 'Mallorca',
    'osasuna': 'Osasuna',
    'oviedo': 'Oviedo',
    'rayo': 'Rayo Vallecano',
    'real_madrid': 'Real Madrid',
    'sevilla': 'Sevilla',
    'sociedad': 'Real Sociedad',
    'valencia': 'Valencia',
    'villarreal': 'Villarreal',

    // Serie A
    'atalanta': 'Atalanta',
    'bologna': 'Bologna',
    'cagliari': 'Cagliari',
    'como': 'Como',
    'cremonese': 'Cremonese',
    'fiorentina': 'Fiorentina',
    'genoa': 'Genoa',
    'hellas': 'Hellas Verona',
    'verona': 'Hellas Verona',
    'inter': 'Inter Milan',
    'juventus': 'Juventus',
    'lazio': 'Lazio',
    'lecce': 'Lecce',
    'milan': 'AC Milan',
    'napoli': 'Napoli',
    'parma': 'Parma',
    'pisa': 'Pisa',
    'roma': 'AS Roma',
    'sassuolo': 'Sassuolo',
    'torino': 'Torino',
    'udinese': 'Udinese',

    // Bundesliga
    'augsburg': 'Augsburg',
    'bayern': 'Bayern Munich',
    'bremen': 'Werder Bremen',
    'dortmund': 'Dortmund',
    'eintracht': 'Eintracht',
    'freiburg': 'Freiburg',
    'gladbach': 'M\'gladbach',
    'hamburger': 'Hamburg',
    'heidenheim': 'Heidenheim',
    'hoffenheim': 'Hoffenheim',
    'koln': 'FC Köln',
    'leipzig': 'RB Leipzig',
    'leverkusen': 'Bayer Leverkusen',
    'mainz': 'Mainz',
    'monchengladbach': 'M\'gladbach',
    'pauli': 'St. Pauli',
    'stuttgart': 'Stuttgart',
    'union_berlim': 'Union Berlin',
    'wolfsburg': 'Wolfsburg',

    // Ligue 1
    'angers': 'Angers',
    'auxerre': 'Auxerre',
    'brest': 'Brest',
    'le_havre': 'Le Havre',
    'lens': 'Lens',
    'lille': 'Lille',
    'lorient': 'Lorient',
    'lyon': 'Lyon',
    'marseille': 'Marseille',
    'metz': 'Metz',
    'monaco': 'Monaco',
    'nantes': 'Nantes',
    'nice': 'Nice',
    'paris': 'PSG',
    'paris_fc': 'Paris FC',
    'rennes': 'Rennes',
    'stade': 'Stade Brestois',
    'strasbourg': 'Strasbourg',
    'toulouse': 'Toulouse',
};

const TEAM_NAMES_MAP_EN: Record<string, string> = {
    // Seleções Copa do Mundo (Inglês)
    'africa_do_sul': 'South Africa', 'alemanha': 'Germany', 'arabia': 'Saudi Arabia',
    'argelia': 'Algeria', 'argentina': 'Argentina', 'austria': 'Austria',
    'belgica': 'Belgium', 'bosnia': 'Bosnia', 'brasil': 'Brazil',
    'cabo_verde': 'Cape Verde', 'canada': 'Canada', 'catar': 'Qatar',
    'colombia': 'Colombia', 'congo': 'Congo', 'coreia': 'South Korea',
    'croacia': 'Croatia', 'curacao': 'Curaçao', 'egito': 'Egypt',
    'equador': 'Ecuador', 'escocia': 'Scotland', 'espanha': 'Spain',
    'eua': 'USA', 'franca': 'France', 'gana': 'Ghana', 'haiti': 'Haiti',
    'holanda': 'Netherlands', 'inglaterra': 'England', 'ira': 'Iran',
    'iraque': 'Iraq', 'japao': 'Japan', 'jordania': 'Jordan',
    'marfim': 'Ivory Coast', 'marrocos': 'Morocco', 'mexico': 'Mexico',
    'noruega': 'Norway', 'nova_zelandia': 'New Zealand', 'panama': 'Panama',
    'paraguai': 'Paraguay', 'portugal': 'Portugal', 'senegal': 'Senegal',
    'suecia': 'Sweden', 'suica': 'Switzerland', 'tcheca': 'Czech Rep.',
    'tunisia': 'Tunisia', 'turquia': 'Turkey', 'uruguai': 'Uruguay',
    'uzbequistao': 'Uzbekistan'
};

const formatTeamName = (name: string) => {
    // Verifica o idioma atual configurado no i18n (fallback para 'pt' por segurança)
    const currentLocale = (i18n.locale || (i18n as any).language || 'pt').toString().toLowerCase();
    const isPortuguese = currentLocale.startsWith('pt');

    // Se NÃO for português e o time existir no mapa em inglês, retorna a versão em inglês
    if (!isPortuguese && TEAM_NAMES_MAP_EN[name]) {
        return TEAM_NAMES_MAP_EN[name];
    }

    // Caso contrário (é português ou é um time de clube que não traduz), usa o mapa padrão
    const map = TEAM_NAMES_MAP as any;
    if (map[name]) return map[name];

    // Fallback genérico caso o time não esteja em nenhum mapa
    return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

// --- LÓGICA DE ESTÁDIOS DA COPA ---
let lastCopaHomeTeam: string | null = null;
let lastCopaStadium: ImageSourcePropType | null = null;
const COPA_STADIUMS = ['estadio_atlanta', 'estadio_bc_place', 'estadio_boston', 'estadio_dallas', 'estadio_guadalajara', 'estadio_monterrey', 'estadio_houston', 'estadio_kansas', 'estadio_los_angeles', 'estadio_mexico_city', 'estadio_miami', 'estadio_ny_nj', 'estadio_philadelphia', 'estadio_san_francisco', 'estadio_seattle', 'estadio_toronto'];

const getStadiumForTeam = (teamKey: string): ImageSourcePropType => {
    // Se for seleção da Copa, escolhe estádio aleatório e mantém o mesmo para aquele mandante na sessão
    if (LEAGUE_TEAMS['copa']?.includes(teamKey)) {
        if (lastCopaHomeTeam !== teamKey || !lastCopaStadium) {
            const randomKey = COPA_STADIUMS[Math.floor(Math.random() * COPA_STADIUMS.length)];
            lastCopaStadium = ESTADIOS[randomKey];
            lastCopaHomeTeam = teamKey;
        }
        return lastCopaStadium;
    }

    const directKey = `estadio_${teamKey}`;
    if (ESTADIOS[directKey]) return ESTADIOS[directKey];
    return ESTADIOS['estadio_bayern'] || ESTADIOS['campo'];
};

const TeamNameDisplay = ({ name }: { name: string }) => {
    const hasSpace = name.includes(' ');
    return (
        <Text style={[styles.scoreName, !hasSpace && { width: '100%' }]} numberOfLines={hasSpace ? 2 : 1} adjustsFontSizeToFit={!hasSpace}>
            {name}
        </Text>
    );
};

const KeeperVisual = ({ x, y }: { x: number; y: number }) => (
    <View style={{ position: 'absolute', left: x, top: y }}>
        <View style={[styles.keeperHead, { left: -8, top: -8 - 8 }]} />
        <View style={[styles.keeperBody, { left: -11, top: -11 + 8 }]} />
    </View>
);

type Match = {
    id: number;
    t1: string;
    t2: string;
    score1: number;
    score2: number;
    winner: string | null;
    played: boolean;
    isUserMatch: boolean;
    rematchTaken?: boolean;
};

type ChampionshipRound = 'round_16' | 'quarter' | 'semi' | 'final' | 'champion';

type Recompensa = { type: 'rematch' | 'league' | 'teams', id?: string };

type CampeonatoSalvo = {
    champRound: ChampionshipRound;
    champMatches: Match[];
    bracketHistory: Record<string, Match[]>;
    userTeam: string;
};

export default function App() {
    useKeepAwake();

    const [fontsLoaded] = useFonts({ Orbitron_700Bold });

    // App States
    const [appMode, setAppMode] = useState<'menu' | 'game' | 'bracket' | 'champion_screen' | 'championship_setup' | 'bracket_view'>('menu');

    // Flags
    const [activeChampionship, setActiveChampionship] = useState(false);
    const activeChampionshipRef = useRef(false);

    // Settings
    const [gameMode, setGameMode] = useState<'simulacao' | 'jogar' | 'campeonato'>('simulacao');
    const [matchType, setMatchType] = useState<'simulacao' | 'jogar'>('simulacao');
    const [teamA, setTeamA] = useState('flamengo');
    const [teamB, setTeamB] = useState('palmeiras');
    const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [controlKeeperEnabled, setControlKeeperEnabled] = useState(true);
    const [selectedDuration, setSelectedDuration] = useState(40);
    const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
    const [showSettings, setShowSettings] = useState(false);

    // Premium State
    const [isPremium, setIsPremium] = useState(false);
    const [iapPrice, setIapPrice] = useState('');

    // Game State
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);
    const [gameState, setGameState] = useState<'STOPPED' | 'PLAYING_1ST' | 'PAUSED_HALF' | 'PLAYING_2ND' | 'GOLDEN_GOAL' | 'ENDED'>('STOPPED');
    const [overlayText, setOverlayText] = useState('');
    const [overlayColor, setOverlayColor] = useState('#fff');
    const [teamAtTop, setTeamAtTop] = useState('B');

    // Championship State
    const [champRound, setChampRound] = useState<ChampionshipRound>('round_16');
    const [champMatches, setChampMatches] = useState<Match[]>([]);
    const [bracketHistory, setBracketHistory] = useState<Record<string, Match[]>>({});
    const [userTeam, setUserTeam] = useState('');
    const [championTeam, setChampionTeam] = useState('');

    // --- ESTADOS DE ANÚNCIOS E BLOQUEIOS ---
    const [interstitialLoaded, setInterstitialLoaded] = useState(false);
    const [rewardedLoaded, setRewardedLoaded] = useState(false);

    // Bloqueios
    const [unlockedLeagues, setUnlockedLeagues] = useState<string[]>(['copa', 'brasileirao', 'bundesliga', 'seriea', 'champions']);
    const [unlockedTeamSets, setUnlockedTeamSets] = useState<string[]>([]);

    // Controle de recompensa pendente
    const [pendingReward, setPendingReward] = useState<Recompensa | null>(null);

    // Consentimento de anúncios (UMP), ritmo do intersticial e falhas do premiado
    const [mostrarPrivacidadeAnuncios, setMostrarPrivacidadeAnuncios] = useState(false);
    const primeiraSessaoRef = useRef(true);
    const ultimoIntersticialRef = useRef(0);
    const falhasPremiadoRef = useRef(0);

    // Persistência: configurações carregadas e campeonato salvo (retomado pelo botão CAMPEONATO)
    const [dadosCarregados, setDadosCarregados] = useState(false);
    const [campeonatoSalvo, setCampeonatoSalvo] = useState<CampeonatoSalvo | null>(null);

    // Comemoração de gol: tremida rápida do campo e o escudo de quem marcou aparecendo
    const tremidaAnim = useRef(new Animated.Value(0)).current;
    const escudoGolAnim = useRef(new Animated.Value(0)).current;
    const [timeDoGol, setTimeDoGol] = useState<string | null>(null);

    // Compartilhar placar/título: a marca "FAST FOOTBALL" e o fundo sólido só aparecem na imagem
    const resultadoPartidaRef = useRef<View>(null);
    const campeaoRef = useRef<View>(null);
    const [capturandoImagem, setCapturandoImagem] = useState(false);

    // Refs
    const engineRef = useRef<Matter.Engine | null>(null);
    const entitiesRef = useRef<any>({});
    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>(0);
    const elapsedPausedRef = useRef<number>(0);
    const matchTimePausedAtRef = useRef<number>(0);
    const gameTimeRef = useRef<number>(0);
    const stuckStartTimeRef = useRef<number>(0);
    const gameStateRef = useRef<'STOPPED' | 'PLAYING_1ST' | 'PAUSED_HALF' | 'PLAYING_2ND' | 'GOLDEN_GOAL' | 'ENDED'>('STOPPED');
    const spawnBallRef = useRef<() => void>(() => { });

    // --- NOVO REF PARA DELTA TIME ---
    const lastFrameTimeRef = useRef<number>(0);

    // Input Refs
    const isLeftPressed = useRef(false);
    const isRightPressed = useRef(false);
    const userKeeperXRef = useRef(GAME_WIDTH / 2);
    const selectedDurationRef = useRef(selectedDuration); // REF para persistência de config

    const soundGol = useRef(new Audio.Sound());
    const soundApito = useRef(new Audio.Sound());

    // Refs Cruciais para evitar Bugs de Closure e Estado
    const champMatchesRef = useRef<Match[]>([]);
    const teamARef = useRef(teamA);
    const teamBRef = useRef(teamB);
    const teamAtTopRef = useRef(teamAtTop);
    const matchTypeRef = useRef(matchType);
    const scoreARef = useRef(scoreA);
    const scoreBRef = useRef(scoreB);
    const speedMultiplierRef = useRef(speedMultiplier);
    const controlKeeperEnabledRef = useRef(controlKeeperEnabled);
    const pendingRewardRef = useRef(pendingReward);
    const pendingInterActionRef = useRef<(() => void) | null>(null);

    const [searchTextA, setSearchTextA] = useState('');
    const [searchTextB, setSearchTextB] = useState('');
    const [searchChampionship, setSearchChampionship] = useState('');

    useEffect(() => { champMatchesRef.current = champMatches; }, [champMatches]);
    useEffect(() => { teamARef.current = teamA; }, [teamA]);
    useEffect(() => { teamBRef.current = teamB; }, [teamB]);
    useEffect(() => { teamAtTopRef.current = teamAtTop; }, [teamAtTop]);
    useEffect(() => { matchTypeRef.current = matchType; }, [matchType]);
    useEffect(() => { scoreARef.current = scoreA; }, [scoreA]);
    useEffect(() => { scoreBRef.current = scoreB; }, [scoreB]);
    useEffect(() => { speedMultiplierRef.current = speedMultiplier; }, [speedMultiplier]);
    useEffect(() => { controlKeeperEnabledRef.current = controlKeeperEnabled; }, [controlKeeperEnabled]);
    useEffect(() => { pendingRewardRef.current = pendingReward; }, [pendingReward]);

    // Sincroniza o ref com o estado de campeonato
    useEffect(() => { activeChampionshipRef.current = activeChampionship; }, [activeChampionship]);
    useEffect(() => { selectedDurationRef.current = selectedDuration; }, [selectedDuration]); // Sync ref

    useEffect(() => { loadSounds(); }, []);

    // --- PERSISTÊNCIA: carrega configurações, campeonato em andamento e conta a sessão ---
    useEffect(() => {
        const carregarDados = async () => {
            try {
                const sessoes = Number(await AsyncStorage.getItem(SESSOES_KEY) || '0') + 1;
                await AsyncStorage.setItem(SESSOES_KEY, String(sessoes));
                primeiraSessaoRef.current = sessoes <= 1;

                const config = JSON.parse(await AsyncStorage.getItem(CONFIG_KEY) || 'null');
                if (config) {
                    if (typeof config.speedMultiplier === 'number') setSpeedMultiplier(config.speedMultiplier);
                    if (typeof config.selectedDuration === 'number') setSelectedDuration(config.selectedDuration);
                    if (typeof config.audioEnabled === 'boolean') setAudioEnabled(config.audioEnabled);
                    if (typeof config.controlKeeperEnabled === 'boolean') setControlKeeperEnabled(config.controlKeeperEnabled);
                }

                const campeonato = JSON.parse(await AsyncStorage.getItem(CAMPEONATO_KEY) || 'null');
                if (campeonato && Array.isArray(campeonato.champMatches) && campeonato.champMatches.length > 0) {
                    setCampeonatoSalvo(campeonato);
                }
            } catch (e) { }
            setDadosCarregados(true);
        };
        carregarDados();
    }, []);

    useEffect(() => {
        if (!dadosCarregados) return;
        AsyncStorage.setItem(CONFIG_KEY, JSON.stringify({ speedMultiplier, selectedDuration, audioEnabled, controlKeeperEnabled })).catch(() => { });
    }, [dadosCarregados, speedMultiplier, selectedDuration, audioEnabled, controlKeeperEnabled]);

    // Campeonato em andamento: salvo a cada mudança; só é apagado ao sair dele (exitChampionship)
    useEffect(() => {
        if (!activeChampionship || champMatches.length === 0) return;
        const dados: CampeonatoSalvo = { champRound, champMatches, bracketHistory, userTeam };
        AsyncStorage.setItem(CAMPEONATO_KEY, JSON.stringify(dados)).catch(() => { });
    }, [activeChampionship, champRound, champMatches, bracketHistory, userTeam]);

    const retomarCampeonato = (dados: CampeonatoSalvo) => {
        setChampRound(dados.champRound);
        setChampMatches(dados.champMatches);
        setBracketHistory(dados.bracketHistory || {});
        setUserTeam(dados.userTeam);
        setActiveChampionship(true);
        setCampeonatoSalvo(null);
        setAppMode('bracket');
    };

    // --- REVENUECAT SETUP ---
    useEffect(() => {
        const setupPurchases = async () => {
            if (Platform.OS === 'android') {
                await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
            }

            try {
                // 1. Verifica se já é Premium
                const customerInfo = await Purchases.getCustomerInfo();
                if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
                    setIsPremium(true);
                }

                // 2. Busca o preço atualizado da loja (NOVO)
                const offerings = await Purchases.getOfferings();
                let myOffering = offerings.current;

                // Lógica de fallback igual à da compra
                if (!myOffering && offerings.all) {
                    myOffering = offerings.all['default2'] || Object.values(offerings.all)[0];
                }

                if (myOffering && myOffering.availablePackages.length > 0) {
                    // Salva o preço formatado (ex: "R$ 14,99") no estado
                    setIapPrice(myOffering.availablePackages[0].product.priceString);
                }

            } catch (e) {
                console.log("Erro ao buscar info ou ofertas", e);
            }
        };

        setupPurchases();
    }, []);

    const restorePurchases = async () => {
        try {
            const customerInfo = await Purchases.restorePurchases();
            if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
                setIsPremium(true);
                Alert.alert(i18n.t('success'), i18n.t('restoreSuccess'));
            } else {
                Alert.alert(i18n.t('premiumTitle'), i18n.t('noPurchaseFound'));
            }
        } catch (e: any) {
            Alert.alert(i18n.t('error'), e.message);
        }
    };

    const handlePurchase = async () => {
        try {
            const offerings = await Purchases.getOfferings();

            // --- LÓGICA DE FALLBACK (CORREÇÃO) ---
            let myOffering = offerings.current;

            // Se current for nulo, tenta achar 'default2' ou pega a primeira oferta disponível
            if (!myOffering && offerings.all) {
                console.log("RevenueCat: Current é nulo, tentando fallback em 'all'");
                myOffering = offerings.all['default2'] || Object.values(offerings.all)[0];
            }

            if (myOffering && myOffering.availablePackages.length !== 0) {
                const packageToBuy = myOffering.availablePackages[0];

                const { customerInfo } = await Purchases.purchasePackage(packageToBuy);

                if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
                    setIsPremium(true);
                    Alert.alert(i18n.t('success'), i18n.t('purchaseSuccess'));
                }
            } else {
                Alert.alert(i18n.t('error'), i18n.t('offersError'));
            }
        } catch (e: any) {
            if (!e.userCancelled) {
                Alert.alert(i18n.t('error'), e.message);
            }
        }
    };

    const handlePurchaseAlert = () => {
        // Se o preço ainda não carregou, usa um texto genérico ou vazio
        const priceDisplay = iapPrice ? ` (${iapPrice})` : '';

        Alert.alert(
            i18n.t('premiumTitle'),
            // Adiciona o preço à mensagem traduzida
            `${i18n.t('premiumMessage')}\n\n${i18n.t('price') || 'Preço'}: ${iapPrice || i18n.t('loading')}`,
            [
                { text: i18n.t('cancel'), style: "cancel" },
                { text: i18n.t('buy') + priceDisplay, onPress: handlePurchase } // Opcional: Colocar preço no botão também
            ]
        );
    };

    // --- FUNÇÃO PARA INICIAR SEGUNDO TEMPO ---
    const startSecondHalf = () => {
        const now = Date.now();
        // A duração de um tempo em milissegundos (ex: se o total é 90s, um tempo é 45s * 1000)
        const halfDurationMs = (selectedDurationRef.current / 2) * 1000;

        // Resetamos o início para ser exatamente "um tempo atrás"
        startTimeRef.current = now - halfDurationMs;

        // Zeramos o acumulador de pausas, pois já recalibramos o start
        elapsedPausedRef.current = 0;
        matchTimePausedAtRef.current = 0;

        // --- RESETAR O TIME DE FÍSICA ---
        lastFrameTimeRef.current = Date.now();

        setTeamAtTop(prev => prev === 'A' ? 'B' : 'A');
        gameStateRef.current = 'PLAYING_2ND';
        setGameState('PLAYING_2ND');

        setOverlayText('');
        if (spawnBallRef.current) spawnBallRef.current();
        playSound('apito');
    };

    // --- INICIALIZAÇÃO DE ANÚNCIOS ---
    useEffect(() => {
        // Interstitial
        const unsubscribeInterLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setInterstitialLoaded(true);
        });
        const unsubscribeInterClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            setInterstitialLoaded(false);
            interstitial.load();
            if (pendingInterActionRef.current) {
                pendingInterActionRef.current();
                pendingInterActionRef.current = null;
            }
        });
        // Sem internet ou sem anúncio: tenta de novo depois (antes ficava sem anúncio até reabrir o app)
        const unsubscribeInterError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
            setInterstitialLoaded(false);
            setTimeout(() => interstitial.load(), RECARREGAR_ANUNCIO_MS);
        });

        // Rewarded
        const unsubscribeRewardLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setRewardedLoaded(true);
        });
        const unsubscribeRewardEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
            aplicarRecompensa(pendingRewardRef.current);
            setPendingReward(null);
        });
        const unsubscribeRewardClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
            setRewardedLoaded(false);
            rewardedAd.load();
            setPendingReward(null);
        });
        const unsubscribeRewardError = rewardedAd.addAdEventListener(AdEventType.ERROR, () => {
            setRewardedLoaded(false);
            setTimeout(() => rewardedAd.load(), RECARREGAR_ANUNCIO_MS);
        });

        // Consentimento (UMP): o formulário só aparece onde a lei exige (Europa/Reino Unido).
        // Os anúncios só são pedidos depois disso.
        const iniciarAnuncios = async () => {
            let podeAnunciar = true;
            try {
                const consentimento = await AdsConsent.gatherConsent();
                podeAnunciar = consentimento.canRequestAds;
                setMostrarPrivacidadeAnuncios(
                    consentimento.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED
                );
            } catch (e) {
                try { podeAnunciar = (await AdsConsent.getConsentInfo()).canRequestAds; } catch (e2) { }
            }
            if (!podeAnunciar) return;
            try { await mobileAds().initialize(); } catch (e) { }
            interstitial.load();
            rewardedAd.load();
        };
        iniciarAnuncios();

        return () => {
            unsubscribeInterLoaded();
            unsubscribeInterClosed();
            unsubscribeInterError();
            unsubscribeRewardLoaded();
            unsubscribeRewardEarned();
            unsubscribeRewardClosed();
            unsubscribeRewardError();
        };
    }, []);

    // Entrega a recompensa do vídeo (ou a libera sem vídeo, depois de várias falhas do anúncio)
    const aplicarRecompensa = (reward: Recompensa | null, semAnuncio = false) => {
        if (!reward) return;
        if (reward.type === 'rematch') {
            if (semAnuncio) Alert.alert(i18n.t('success'), i18n.t('unlockedWithoutAd'));
            handleRematchSuccess();
        } else if (reward.type === 'league' && reward.id) {
            setUnlockedLeagues(prev => [...prev, reward.id!]);
            Alert.alert(i18n.t('success'), semAnuncio ? i18n.t('unlockedWithoutAd') : i18n.t('leagueUnlocked'));
        } else if (reward.type === 'teams' && reward.id) {
            setUnlockedTeamSets(prev => [...prev, reward.id!]);
            Alert.alert(i18n.t('success'), semAnuncio ? i18n.t('unlockedWithoutAd') : i18n.t('teamsUnlocked'));
        }
    };

    // Mostra o premiado. Se não estiver carregado, avisa; na FALHAS_PARA_LIBERAR-ésima tentativa, libera assim mesmo.
    const mostrarPremiado = (reward: Recompensa) => {
        if (rewardedLoaded) {
            falhasPremiadoRef.current = 0;
            pendingRewardRef.current = reward;
            setPendingReward(reward);
            rewardedAd.show().catch(() => { });
            return;
        }
        falhasPremiadoRef.current += 1;
        if (falhasPremiadoRef.current >= FALHAS_PARA_LIBERAR) {
            falhasPremiadoRef.current = 0;
            aplicarRecompensa(reward, true);
            return;
        }
        Alert.alert(i18n.t('adNotReady'), i18n.t('tryAgainMoment'));
        try { rewardedAd.load(); } catch (e) { }
    };

    // Alerta de item bloqueado: vídeo para liberar, ou o Premium (preço vindo da loja)
    const alertaBloqueado = (titulo: string, mensagem: string, reward: Recompensa) => {
        Alert.alert(titulo, mensagem, [
            { text: i18n.t('cancel'), style: 'cancel' },
            { text: i18n.t('watchAd'), onPress: () => mostrarPremiado(reward) },
            { text: `${i18n.t('unlockAll')}${iapPrice ? ` (${iapPrice})` : ''}`, onPress: handlePurchase },
        ]);
    };

    // BackHandler Logic
    useEffect(() => {
        const backAction = () => {
            if (showSettings) {
                setShowSettings(false);
                return true;
            }
            if (appMode === 'game') {
                backToMenu();
                return true;
            }
            if (appMode === 'bracket') {
                exitChampionship();
                return true;
            }
            if (appMode === 'bracket_view') {
                setAppMode('bracket');
                return true;
            }
            if (appMode === 'championship_setup') {
                setAppMode('menu');
                return true;
            }
            if (appMode === 'champion_screen') {
                exitChampionship();
                return true;
            }
            if (appMode === 'menu') {
                return false;
            }
            setAppMode('menu');
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [appMode, activeChampionship, showSettings]);

    // Effect para lidar com Fim de Jogo e Atualizar Bracket
    useEffect(() => {
        if (gameState === 'ENDED' && activeChampionship) {
            const currentT1 = teamARef.current;
            const currentT2 = teamBRef.current;

            const currentMatch = champMatchesRef.current.find(m =>
                (m.t1 === currentT1 && m.t2 === currentT2) || (m.t2 === currentT1 && m.t1 === currentT2)
            );

            if (currentMatch) {
                const finalScore1 = currentMatch.t1 === currentT1 ? scoreA : scoreB;
                const finalScore2 = currentMatch.t2 === currentT1 ? scoreA : scoreB;
                updateMatchResult(currentMatch.id, finalScore1, finalScore2);
            }
        }
    }, [gameState]);

    const loadSounds = async () => {
        try {
            await soundGol.current.loadAsync(SOUNDS['gol']);
            await soundApito.current.loadAsync(SOUNDS['apito']);
        } catch (error) { }
    };

    const playSound = async (type: string) => {
        if (!audioEnabled) return;
        try {
            const sound = type === 'gol' ? soundGol.current : soundApito.current;
            await sound.replayAsync();
        } catch (e) { }
    };

    const filteredTeams = useMemo(() => {
        let pool: string[] = [];
        if (selectedLeague === 'champions') {
            const brTeams = new Set(LEAGUE_TEAMS['brasileirao']);
            pool = Object.keys(TIMES).filter(t => !brTeams.has(t));
        } else if (!selectedLeague) {
            pool = Object.keys(TIMES);
        } else {
            const leagueSet = new Set(LEAGUE_TEAMS[selectedLeague] || []);
            pool = Object.keys(TIMES).filter(t => leagueSet.has(t));
        }
        pool.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        return pool;
    }, [selectedLeague]);

    const filteredTeamsA = useMemo(() => {
        if (!searchTextA.trim()) return filteredTeams;
        return filteredTeams.filter(t =>
            formatTeamName(t).toLowerCase().includes(searchTextA.toLowerCase())
        );
    }, [filteredTeams, searchTextA]);

    const filteredTeamsB = useMemo(() => {
        if (!searchTextB.trim()) return filteredTeams;
        return filteredTeams.filter(t =>
            formatTeamName(t).toLowerCase().includes(searchTextB.toLowerCase())
        );
    }, [filteredTeams, searchTextB]);

    const filteredChampionshipTeams = useMemo(() => {
        if (!searchChampionship.trim()) return filteredTeams;
        return filteredTeams.filter(t =>
            formatTeamName(t).toLowerCase().includes(searchChampionship.toLowerCase())
        );
    }, [filteredTeams, searchChampionship]);

    // --- LÓGICA DE BLOQUEIO DE TIMES ---
    const isTeamLocked = (teamId: string) => {
        // Se for premium, nada é bloqueado
        if (isPremium) return false;

        // Encontrar a liga desse time
        let leagueId = '';
        for (const [league, teams] of Object.entries(LEAGUE_TEAMS)) {
            if (teams.includes(teamId)) {
                leagueId = league;
                break;
            }
        }

        // Se a liga já teve os times desbloqueados, retorna false (desbloqueado)
        if (unlockedTeamSets.includes(leagueId)) return false;

        // Logica: Metade final bloqueada (índice >= 10)
        const teamsList = LEAGUE_TEAMS[leagueId];
        if (!teamsList) return false;
        const index = teamsList.indexOf(teamId);

        return index >= 10; // Bloqueia a segunda metade
    };

    const handleLeagueSelect = (league: string) => {
        // Se for premium, libera tudo
        if (isPremium || unlockedLeagues.includes(league)) {
            setSelectedLeague(league);
        } else {
            alertaBloqueado(i18n.t('lockedLeague'), i18n.t('watchAdUnlock'), { type: 'league', id: league });
        }
    };

    const handleTeamSelect = (teamId: string, setTeamFn: (t: string) => void) => {
        if (!isTeamLocked(teamId)) {
            setTeamFn(teamId);
        } else {
            // Encontrar liga
            let leagueId = '';
            for (const [l, t] of Object.entries(LEAGUE_TEAMS)) {
                if (t.includes(teamId)) { leagueId = l; break; }
            }

            const leagueNameDisplay = LEAGUE_DISPLAY_NAMES[leagueId] || leagueId.toUpperCase();

            alertaBloqueado(i18n.t('lockedTeam'), `${i18n.t('watchAdUnlockTeams')} ${leagueNameDisplay}?`, { type: 'teams', id: leagueId });
        }
    };

    const initChampionship = () => {
        setCampeonatoSalvo(null);          // o novo campeonato substitui o salvo
        setActiveChampionship(true);
        setBracketHistory({});

        const pool = [...filteredTeams].filter(t => t !== teamA);
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const opponents = pool.slice(0, 15);
        const tournamentTeams = [teamA, ...opponents];
        for (let i = tournamentTeams.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tournamentTeams[i], tournamentTeams[j]] = [tournamentTeams[j], tournamentTeams[i]];
        }
        const matches: Match[] = [];
        for (let i = 0; i < 8; i++) {
            const t1 = tournamentTeams[i * 2];
            const t2 = tournamentTeams[i * 2 + 1];
            matches.push({
                id: i,
                t1,
                t2,
                score1: 0,
                score2: 0,
                winner: null,
                played: false,
                isUserMatch: (t1 === teamA || t2 === teamA),
                rematchTaken: false // INIT
            });
        }
        matches.sort((a, b) => (a.isUserMatch ? -1 : b.isUserMatch ? 1 : 0));

        setUserTeam(teamA);
        setChampMatches(matches);
        setChampRound('round_16');
        setAppMode('bracket');
    };

    const exitChampionship = () => {
        AsyncStorage.removeItem(CAMPEONATO_KEY).catch(() => { });
        setCampeonatoSalvo(null);
        setActiveChampionship(false);
        setChampMatches([]);
        setBracketHistory({});
        setChampRound('round_16');
        setAppMode('menu');
        setGameMode('simulacao');
        setMatchType('simulacao');
        setChampionTeam('');
    };

    const simulateMatch = (matchId: number, watch: boolean) => {
        const matchIndex = champMatches.findIndex(m => m.id === matchId);
        if (matchIndex === -1) return;
        const match = champMatches[matchIndex];

        if (watch) {
            setTeamA(match.t1);
            setTeamB(match.t2);
            setMatchType('simulacao');
            startGame(true);
        } else {
            const s1 = Math.floor(Math.random() * 4);
            const s2 = Math.floor(Math.random() * 4);
            let finalS1 = s1; let finalS2 = s2;
            if (s1 === s2) { if (Math.random() > 0.5) finalS1++; else finalS2++; }
            updateMatchResult(matchId, finalS1, finalS2);
        }
    };

    const updateMatchResult = (matchId: number, s1: number, s2: number) => {
        setChampMatches(prev => prev.map(m => {
            if (m.id === matchId) {
                return {
                    ...m,
                    score1: s1,
                    score2: s2,
                    winner: s1 > s2 ? m.t1 : m.t2,
                    played: true
                };
            }
            return m;
        }));
    };

    const playUserMatch = (mode: 'jogar' | 'simulacao') => {
        const match = champMatches.find(m => m.isUserMatch);
        if (!match) return;
        setTeamA(match.t1);
        setTeamB(match.t2);
        setMatchType(mode);
        startGame(true);
    };

    const advanceChampionship = () => {
        if (champMatches.some(m => !m.played)) return;

        setBracketHistory(prev => ({ ...prev, [champRound]: champMatches }));

        const winners = champMatches.map(m => m.winner as string);

        if (winners.length === 1) {
            setChampionTeam(winners[0]);
            setChampRound('champion');
            setAppMode('champion_screen');
            return;
        }

        const nextMatches: Match[] = [];
        for (let i = 0; i < winners.length / 2; i++) {
            const t1 = winners[i * 2];
            const t2 = winners[i * 2 + 1];
            nextMatches.push({
                id: i,
                t1,
                t2,
                score1: 0,
                score2: 0,
                winner: null,
                played: false,
                isUserMatch: (t1 === userTeam || t2 === userTeam),
                rematchTaken: false
            });
        }
        nextMatches.sort((a, b) => (a.isUserMatch ? -1 : b.isUserMatch ? 1 : 0));
        setChampMatches(nextMatches);
        if (champRound === 'round_16') setChampRound('quarter');
        else if (champRound === 'quarter') setChampRound('semi');
        else if (champRound === 'semi') setChampRound('final');
    };

    const stopGame = () => {
        gameStateRef.current = 'STOPPED';
        setGameState('STOPPED');
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (engineRef.current) {
            Matter.World.clear(engineRef.current.world, false);
            Matter.Engine.clear(engineRef.current);
            engineRef.current = null;
        }
        entitiesRef.current = {};
        isLeftPressed.current = false;
        isRightPressed.current = false;
    };

    const backToMenu = () => {
        stopGame();
        if (activeChampionship) {
            setAppMode('bracket');
        } else {
            setAppMode('menu');
        }
    };

    const startGame = (isChampMatch = false) => {
        stopGame();
        setScoreA(0); setScoreB(0); gameTimeRef.current = 0;
        gameStateRef.current = 'PLAYING_1ST'; setGameState('PLAYING_1ST');
        setTeamAtTop('B');
        setOverlayText(''); setAppMode('game');
        setupWorld(); playSound('apito');

        // Reset timers
        const now = Date.now();
        startTimeRef.current = now;
        elapsedPausedRef.current = 0;
        lastFrameTimeRef.current = now; // RESET DELTA TIMER
    };

    // --- LÓGICA DE REVANCHE ---
    const handleRematch = () => {
        // Se for premium, a opção nem aparece no botão, mas por segurança:
        if (isPremium) return;
        mostrarPremiado({ type: 'rematch' });
    };

    const handleRematchSuccess = () => {
        // 1. Achar o jogo do usuário que acabou de ser jogado
        const currentMatch = champMatchesRef.current.find(m => m.isUserMatch && m.played);
        if (currentMatch) {
            // 2. Resetar o jogo no bracket E MARCAR COMO REMATCH TAKEN
            setChampMatches(prev => prev.map(m => {
                if (m.id === currentMatch.id) {
                    return { ...m, played: false, winner: null, score1: 0, score2: 0, rematchTaken: true };
                }
                return m;
            }));

            // 3. Reiniciar o jogo imediatamente
            // Nota: ActiveChampionship continua true
            startGame(true);
        }
    };

    const comemorarGol = (time: string) => {
        setTimeDoGol(time);
        tremidaAnim.setValue(0);
        escudoGolAnim.setValue(0);
        const passo = (x: number) => Animated.timing(tremidaAnim, { toValue: x, duration: 45, useNativeDriver: true });
        Animated.sequence([passo(12), passo(-12), passo(9), passo(-9), passo(5), passo(-5), passo(0)]).start();
        Animated.sequence([
            Animated.spring(escudoGolAnim, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }),
            Animated.delay(650),
            Animated.timing(escudoGolAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => setTimeDoGol(null));
    };

    const handleTap = (side: 'left' | 'right') => {
        if (!engineRef.current) return;
        const spinner = engineRef.current.world.bodies.find(b => b.label === 'spinner');
        if (!spinner) return;

        const currentVel = spinner.angularVelocity;
        const IMPULSE = 0.20 * speedMultiplierRef.current;

        if (side === 'left') {
            Matter.Body.setAngularVelocity(spinner, currentVel + IMPULSE);
        } else {
            Matter.Body.setAngularVelocity(spinner, currentVel - IMPULSE);
        }
    };

    const setupWorld = () => {
        const Engine = Matter.Engine, Bodies = Matter.Bodies, Composite = Matter.Composite, Events = Matter.Events, Body = Matter.Body;
        const engine = Engine.create();
        engine.world.gravity.y = 0; engine.world.gravity.x = 0;
        engine.timing.timeScale = 0.42;
        const W = 450; const H = 800; const CX = W / 2; const CY = H / 2; const RADIUS = 200;

        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * Math.PI * 2;
            if (Math.abs(Math.sin(angle)) < 0.95) {
                Composite.add(engine.world, Bodies.rectangle(CX + Math.cos(angle) * RADIUS, CY + Math.sin(angle) * RADIUS, 40, 15, { isStatic: true, angle: angle + Math.PI / 2, label: 'wall' }));
            }
        }

        const goalW = 100; const postOpts = { isStatic: true, label: 'post' };
        Composite.add(engine.world, [
            Bodies.rectangle(CX - goalW / 2 - 5, CY - RADIUS - 40, 10, 80, postOpts), Bodies.rectangle(CX + goalW / 2 + 5, CY - RADIUS - 40, 10, 80, postOpts), Bodies.rectangle(CX, CY - RADIUS - 80, goalW + 20, 10, postOpts),
            Bodies.rectangle(CX - goalW / 2 - 5, CY + RADIUS + 40, 10, 80, postOpts), Bodies.rectangle(CX + goalW / 2 + 5, CY + RADIUS + 40, 10, 80, postOpts), Bodies.rectangle(CX, CY + RADIUS + 80, goalW + 20, 10, postOpts)
        ]);

        const createArcBodies = (cx, cy, r, sa, ea) => {
            const bodies = [];
            for (let i = 0; i < 3; i++) {
                const t = i / 3;
                const a = sa + (ea - sa) * t;
                bodies.push(Bodies.rectangle(
                    cx + Math.cos(a) * (r - 10),
                    cy + Math.sin(a) * (r - 10),
                    2, 1,
                    { isStatic: true, isSensor: false, angle: a + Math.PI / 2, label: 'arc' }
                ));
            }
            return bodies;
        };
        Composite.add(engine.world, [...createArcBodies(CX, CY, RADIUS, Math.PI * 1.3, Math.PI * 1.45), ...createArcBodies(CX, CY, RADIUS, Math.PI * 1.55, Math.PI * 1.7), ...createArcBodies(CX, CY, RADIUS, Math.PI * 0.55, Math.PI * 0.7), ...createArcBodies(CX, CY, RADIUS, Math.PI * 0.3, Math.PI * 0.45)]);

        const spinner = Bodies.rectangle(CX, CY, 220, 15, { density: 100, label: 'spinner', frictionAir: 0.01 });
        Composite.add(engine.world, [spinner, Matter.Constraint.create({ pointA: { x: CX, y: CY }, bodyB: spinner, length: 0, stiffness: 1 })]);

        const createKeeperBody = (x, y, label) => {
            const head = Bodies.circle(x, y - 8, 8, { isStatic: true });
            const body = Bodies.rectangle(x, y + 8, 22, 22, { isStatic: true, chamfer: { radius: 4 } });
            const keeper = Body.create({ parts: [head, body], isStatic: true, label: label, restitution: 1.0 });
            Body.setPosition(keeper, { x, y }); return keeper;
        };
        const keeperTop = createKeeperBody(CX, CY - RADIUS + 25, 'keeperTop');
        const keeperBot = createKeeperBody(CX, CY + RADIUS - 25, 'keeperBot');
        Composite.add(engine.world, [keeperTop, keeperBot]);

        const sensorTop = Bodies.rectangle(CX, CY - RADIUS - 20, goalW, 30, { isStatic: true, isSensor: true, label: 'sensorTop' });
        const sensorBot = Bodies.rectangle(CX, CY + RADIUS + 20, goalW, 30, { isStatic: true, isSensor: true, label: 'sensorBot' });
        Composite.add(engine.world, [sensorTop, sensorBot]);

        let ball = null; // framesStuck removido

        // --- DEFINIÇÃO DO SPAWNBALL ---
        spawnBallRef.current = () => {
            if (ball) Composite.remove(engine.world, ball);
            ball = Bodies.circle(CX, CY - 40, 12, { restitution: 1.2, friction: 0, frictionAir: 0, label: 'ball' });
            Composite.add(engine.world, ball);
            Body.setVelocity(ball, { x: (Math.random() - 0.5) * 7, y: (Math.random() - 0.5) * 7 });
        };
        spawnBallRef.current(); // Inicial

        engineRef.current = engine;
        let spinnerSpeed = 0.05;
        // Simulação: a cada 2 s sorteia nova velocidade e, às vezes, inverte o sentido da barra
        let spinnerDirection = 1;
        let ultimoSorteioBarra = -1;
        const HALF_DURATION_SECONDS = selectedDurationRef.current / 2;

        Events.on(engine, 'collisionStart', (evt) => {
            if (gameStateRef.current === 'ENDED') return;
            evt.pairs.forEach((pair) => {
                const labels = [pair.bodyA.label, pair.bodyB.label];
                if (labels.includes('sensorTop')) handleGoal('Top');
                if (labels.includes('sensorBot')) handleGoal('Bot');
            });
        });

        const handleGoal = (sensorSide: 'Top' | 'Bot') => {
            if (!ball || gameStateRef.current === 'ENDED') return;

            const isTeamBAtTop = teamAtTopRef.current === 'B';
            let scoringTeam = '';

            if (isTeamBAtTop) {
                if (sensorSide === 'Top') scoringTeam = 'A';
                else scoringTeam = 'B';
            } else {
                if (sensorSide === 'Top') scoringTeam = 'B';
                else scoringTeam = 'A';
            }

            comemorarGol(scoringTeam === 'A' ? teamARef.current : teamBRef.current);

            if (gameStateRef.current === 'GOLDEN_GOAL') {
                if (scoringTeam === 'A') setScoreA(s => s + 1); else setScoreB(s => s + 1);
                playSound('gol');
                Composite.remove(engine.world, ball); ball = null;
                gameStateRef.current = 'ENDED'; setGameState('ENDED');
                return;
            }

            if (scoringTeam === 'A') setScoreA(s => s + 1); else setScoreB(s => s + 1);

            playSound('gol'); setOverlayText(i18n.t('goal')); setOverlayColor(scoringTeam === 'A' ? '#00ffff' : '#ff00ff');
            Composite.remove(engine.world, ball); ball = null;
            setTimeout(() => {
                setOverlayText('');
                if (engineRef.current && gameStateRef.current !== 'ENDED') {
                    if (spawnBallRef.current) spawnBallRef.current();
                    playSound('apito');
                }
            }, 1500);
        };

        const gameLoop = () => {
            if (!engineRef.current) return;
            const currentGameState = gameStateRef.current;
            if (currentGameState === 'STOPPED') return;

            if (currentGameState !== 'ENDED') {
                const time = engine.timing.timestamp;
                const now = Date.now();     // declarado antes do resgate da bola presa, que usa este valor

                if (matchTypeRef.current === 'simulacao') {
                    const sorteio = Math.floor(time / 2000);
                    if (sorteio !== ultimoSorteioBarra) {
                        ultimoSorteioBarra = sorteio;
                        if (sorteio > 0 && Math.random() < 0.3) spinnerDirection *= -1;
                        spinnerSpeed = spinnerDirection * (0.14 + Math.random() * 0.15) * speedMultiplierRef.current;
                    }
                    // Aproxima aos poucos da velocidade sorteada: a inversão vira uma freada seguida de arrancada
                    Body.setAngularVelocity(spinner, spinner.angularVelocity + (spinnerSpeed - spinner.angularVelocity) * 0.08);
                } else if (matchTypeRef.current === 'jogar') {
                    Body.setAngularVelocity(spinner, spinner.angularVelocity * 0.98);
                }

                // Goleiro controlado
                const userKeeperBody = teamAtTopRef.current === 'B' ? keeperBot : keeperTop;
                const aiKeeperBody = teamAtTopRef.current === 'B' ? keeperTop : keeperBot;

                if (matchTypeRef.current === 'jogar' && controlKeeperEnabledRef.current) {
                    Body.setPosition(userKeeperBody, { x: userKeeperXRef.current, y: userKeeperBody.position.y });
                    Body.setPosition(aiKeeperBody, { x: CX + Math.sin(time * 0.0055) * 45, y: aiKeeperBody.position.y });
                } else {
                    Body.setPosition(keeperTop, { x: CX + Math.sin(time * 0.0065) * 45, y: keeperTop.position.y });
                    Body.setPosition(keeperBot, { x: CX + Math.cos(time * 0.006) * 45, y: keeperBot.position.y });
                }

                if (ball) {
                    if (ball.speed > 16) Body.setVelocity(ball, { x: ball.velocity.x * (16 / ball.speed), y: ball.velocity.y * (16 / ball.speed) });

                    // ✅ NOVA LÓGICA DE TEMPO REAL
                    if (ball.speed < 0.5) {
                        if (stuckStartTimeRef.current === 0) {
                            stuckStartTimeRef.current = now; // Começa a contar
                        } else if (now - stuckStartTimeRef.current > 2000) { // 2000ms = 2 segundos
                            if (spawnBallRef.current) spawnBallRef.current();
                            stuckStartTimeRef.current = 0;
                        }
                    } else {
                        stuckStartTimeRef.current = 0; // Reset se a bola se mover
                    }
                }

                if (currentGameState !== 'PAUSED_HALF' && currentGameState !== 'GOLDEN_GOAL') {
                    const totalElapsed = now - startTimeRef.current - elapsedPausedRef.current;
                    let gameMinutes = (totalElapsed / (HALF_DURATION_SECONDS * 1000)) * 45;
                    gameTimeRef.current = gameMinutes;

                    if (currentGameState === 'PLAYING_1ST' && gameMinutes >= 45) {
                        gameMinutes = 45; gameTimeRef.current = 45;
                        gameStateRef.current = 'PAUSED_HALF'; setGameState('PAUSED_HALF');
                        setOverlayText(i18n.t('halfTime')); setOverlayColor('#fff');
                        if (ball) { Composite.remove(engine.world, ball); ball = null; }

                        // LÓGICA DO INTERVALO (SEM ANÚNCIO)
                        setTimeout(startSecondHalf, 2000);

                    } else if (currentGameState === 'PLAYING_2ND') {
                        gameMinutes = 45 + (gameMinutes - 45);
                        if (gameMinutes >= 90) {
                            gameMinutes = 90; gameTimeRef.current = 90;
                            if (activeChampionshipRef.current && scoreARef.current === scoreBRef.current) {
                                gameStateRef.current = 'GOLDEN_GOAL'; setGameState('GOLDEN_GOAL');
                                setOverlayText(''); playSound('apito');
                            } else {
                                gameStateRef.current = 'ENDED'; setGameState('ENDED');
                                setOverlayText(i18n.t('fullTime'));
                                if (ball) { Composite.remove(engine.world, ball); ball = null; }
                            }
                        }
                    }
                }

                // --- IMPLEMENTAÇÃO DELTA TIME ---
                // Calcula o tempo passado desde o último frame
                const delta = now - lastFrameTimeRef.current;
                lastFrameTimeRef.current = now;

                // Cap no delta para evitar grandes saltos se o app travar/lagar (max 100ms)
                const safeDelta = Math.min(delta, 100);

                // Atualiza o motor com o tempo real passado, não um fixo de 16.6ms
                Matter.Engine.update(engine, safeDelta);
            }

            entitiesRef.current = { spinner: { ...spinner.position, angle: spinner.angle }, ball: ball ? { ...ball.position } : null, keeperTop: { ...keeperTop.position }, keeperBot: { ...keeperBot.position } };
            setUpdateTick(t => t + 1);
            requestRef.current = requestAnimationFrame(gameLoop);
        };

        requestRef.current = requestAnimationFrame(gameLoop);
    };
    const [updateTick, setUpdateTick] = useState(0);

    // --- HELPERS (Definidos antes do render) ---
    const getWinnerText = () => {
        if (scoreA > scoreB) return `${formatTeamName(teamA)}\n${i18n.t('wins')}`;
        if (scoreB > scoreA) return `${formatTeamName(teamB)}\n${i18n.t('wins')}`;
        return i18n.t('draw');
    };
    const getWinnerColor = () => {
        if (scoreA > scoreB) return '#00ffff';
        if (scoreB > scoreA) return '#ff00ff';
        return '#fff';
    };

    // Gera a imagem (placar ou campeão) e compartilha junto com um texto com o link da loja
    const compartilharImagem = async (ref: React.RefObject<View | null>, texto: string) => {
        let uri = '';
        try {
            setCapturandoImagem(true);
            await new Promise((r) => setTimeout(r, 150));          // espera a marca aparecer antes da captura
            uri = await captureRef(ref, { format: 'png', quality: 0.95, result: 'tmpfile' });
        } catch (e) {
            Alert.alert(i18n.t('error'), i18n.t('shareError'));
            return;
        } finally {
            setCapturandoImagem(false);
        }
        try {
            await Share.open({ url: uri.startsWith('file://') ? uri : `file://${uri}`, type: 'image/png', message: texto, failOnCancel: false });
        } catch (e) {
            // Sem imagem, ao menos o texto com o link
            try { await Share.open({ message: texto, failOnCancel: false }); } catch (e2) { }
        }
    };

    const compartilharPartida = () => compartilharImagem(resultadoPartidaRef, i18n.t('shareMatch', {
        teamA: formatTeamName(teamA), scoreA, scoreB, teamB: formatTeamName(teamB), link: linkCompartilhar('partida'),
    }));

    const compartilharCampeao = () => compartilharImagem(campeaoRef, i18n.t('shareChampion', {
        team: formatTeamName(championTeam), link: linkCompartilhar('campeao'),
    }));

    const onPlayAgain = () => {
        startGame();
    };

    const onMainMenu = () => {
        const action = () => { if (activeChampionship) setAppMode('bracket'); else setAppMode('menu'); };
        const podeMostrar = !isPremium && interstitialLoaded && !primeiraSessaoRef.current
            && Date.now() - ultimoIntersticialRef.current >= INTERSTICIAL_INTERVALO_MS;
        if (podeMostrar) {
            ultimoIntersticialRef.current = Date.now();
            pendingInterActionRef.current = action;
            interstitial.show().catch(() => { pendingInterActionRef.current = null; action(); });
        } else {
            action();
        }
    };

    const didUserLose = () => {
        if (!activeChampionship) return false;
        if (userTeam === teamA && scoreA < scoreB) return true;
        if (userTeam === teamB && scoreB < scoreA) return true;
        return false;
    };

    // Encontrar o objeto match correspondente ao jogo atual (para verificar rematchTaken)
    const getCurrentChampMatch = () => {
        if (!activeChampionship) return null;
        // Procura na lista de jogos do campeonato, um jogo que envolva os times atuais e seja do usuário
        return champMatchesRef.current.find(m =>
            m.isUserMatch &&
            ((m.t1 === teamA && m.t2 === teamB) || (m.t2 === teamA && m.t1 === teamB))
        );
    };
    const currentMatch = getCurrentChampMatch();

    if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

    // =============================================================================
    // RENDERIZAÇÃO
    // =============================================================================

    // --- BRACKET VIEW SCREEN ---
    if (appMode === 'bracket_view') {
        const bracketData = { ...bracketHistory, [champRound]: champMatches };

        const renderNode = (m: Match) => (
            <View style={[styles.bracketNode, { width: 80 }]}>
                <View style={[styles.bracketNodeItem, m.winner === m.t1 && { backgroundColor: '#00e676' }]}>
                    <Image source={TIMES[m.t1]} style={{ width: 15, height: 15 }} />
                    <Text style={{ fontSize: 8, color: m.winner === m.t1 ? '#000' : '#fff', fontWeight: 'bold' }}>{formatTeamName(m.t1).substring(0, 3)}</Text>
                    <Text style={{ fontSize: 8, color: m.winner === m.t1 ? '#000' : '#fff' }}>{m.played ? m.score1 : ''}</Text>
                </View>
                <View style={[styles.bracketNodeItem, m.winner === m.t2 && { backgroundColor: '#00e676' }]}>
                    <Image source={TIMES[m.t2]} style={{ width: 15, height: 15 }} />
                    <Text style={{ fontSize: 8, color: m.winner === m.t2 ? '#000' : '#fff', fontWeight: 'bold' }}>{formatTeamName(m.t2).substring(0, 3)}</Text>
                    <Text style={{ fontSize: 8, color: m.winner === m.t2 ? '#000' : '#fff' }}>{m.played ? m.score2 : ''}</Text>
                </View>
            </View>
        );

        const renderColumn = (matches: Match[] | undefined, count: number, side: 'left' | 'right') => {
            const list = matches || Array.from({ length: count }).map((_, i) => ({ id: i, t1: '', t2: '', score1: 0, score2: 0, winner: null, played: false, isUserMatch: false }));
            const splitList = side === 'left' ? list.slice(0, list.length / 2) : list.slice(list.length / 2);

            return (
                <View style={{ justifyContent: 'space-around', height: '100%' }}>
                    {splitList.map((m, i) => (
                        <View key={i} style={{ marginBottom: 10 }}>{renderNode(m as Match)}</View>
                    ))}
                </View>
            );
        }

        const r16 = bracketData['round_16'] || champMatches;
        const qf = bracketData['quarter'];
        const sf = bracketData['semi'];
        const final = bracketData['final'];

        return (
            <View style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: SCREEN_HEIGHT, height: SCREEN_WIDTH, transform: [{ rotate: '90deg' }], backgroundColor: '#111' }}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center', zIndex: 10 }}>
                            <Text style={[styles.menuTitle, { marginLeft: 40 }]} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('fullBracket')}</Text>
                            <TouchableOpacity onPress={() => setAppMode('bracket')} style={[styles.btnClose, { width: '10%' }]}>
                                <Feather name="x" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 15, padding: 5, paddingTop: 10, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', gap: 5, height: '100%', alignItems: 'center' }}>
                                {renderColumn(r16, 8, 'left')}
                                {renderColumn(qf, 4, 'left')}
                                {renderColumn(sf, 2, 'left')}
                            </View>

                            <View style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 }}>
                                <Text style={{ color: '#FFD700', fontSize: 10, marginBottom: 5, fontFamily: 'Orbitron_700Bold' }}>FINAL</Text>
                                {final ? renderNode(final[0]) : (
                                    <View style={[styles.bracketNode, { width: 80, opacity: 0.5 }]}>
                                        <View style={styles.bracketNodeItem}><Text style={{ color: '#fff', fontSize: 8 }}>TBD</Text></View>
                                        <View style={styles.bracketNodeItem}><Text style={{ color: '#fff', fontSize: 8 }}>TBD</Text></View>
                                    </View>
                                )}
                            </View>

                            <View style={{ flexDirection: 'row-reverse', gap: 5, height: '100%', alignItems: 'center' }}>
                                {renderColumn(r16, 8, 'right')}
                                {renderColumn(qf, 4, 'right')}
                                {renderColumn(sf, 2, 'right')}
                            </View>
                        </View>

                    </SafeAreaView>
                </View>
            </View>
        );
    }

    if (appMode === 'champion_screen') {
        return (
            <ImageBackground source={getStadiumForTeam(championTeam)} style={styles.menuContainer} blurRadius={3}>
                <View style={styles.modalOverlay}>
                    {/* Esta parte vira a imagem compartilhada */}
                    <View ref={campeaoRef} collapsable={false} style={[styles.areaCompartilhavel, capturandoImagem && styles.areaCapturando]}>
                        <FontAwesome5 name="trophy" size={100} color="#FFD700" style={{ marginBottom: 20, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 10 }} />
                        <Text style={[styles.endGameTitle, { color: '#FFD700', fontSize: 30, textAlign: 'center' }]} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('champion')}</Text>
                        <Text style={[styles.endGameTitle, { color: '#fff', fontSize: 40, marginTop: 10, textAlign: 'center' }]} numberOfLines={2} adjustsFontSizeToFit>{formatTeamName(championTeam)}</Text>
                        <Image source={TIMES[championTeam]} style={{ width: 120, height: 120, resizeMode: 'contain', marginVertical: 30 }} />
                        {capturandoImagem && (
                            <View style={styles.marcaCompartilhar}>
                                <Image source={require('./assets/logo.png')} style={styles.marcaCompartilharLogo} />
                                <Text style={styles.marcaCompartilharTexto}>FAST FOOTBALL</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity style={[styles.endGameBtn, { backgroundColor: '#25D366', marginBottom: 12 }]} onPress={compartilharCampeao}>
                        <Text style={[styles.endGameBtnText, { color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('shareBtn')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.endGameBtn} onPress={exitChampionship}>
                        <Text style={styles.endGameBtnText} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('mainMenu')}</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    }

    if (appMode === 'championship_setup') {
        return (
            <View style={[styles.menuContainer, { backgroundColor: '#121212', paddingTop: STATUSBAR_HEIGHT }]}>
                <LinearGradient colors={['#1a1a1a', '#000']} style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                    <SafeAreaView style={styles.menuSafeArea}>
                        <View style={[styles.menuHeader, { marginTop: -20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }]}>
                            <TouchableOpacity
                                onPress={() => setAppMode('menu')}
                                style={{ position: 'absolute', left: 0, padding: 10 }}
                            >
                                <Feather name="arrow-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.menuTitle} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('newChampionship')}</Text>
                        </View>

                        {/* ÁREA DE SELEÇÃO LADO A LADO */}
                        <View style={{ flex: 1, flexDirection: 'row', width: '100%', paddingHorizontal: 10, gap: 10 }}>
                            {/* Coluna Liga */}
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { textAlign: 'center', marginBottom: 10 }]} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('league')}</Text>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {LEAGUE_ORDER.map(l => (
                                        LIGAS[l] && (
                                            <TouchableOpacity
                                                key={l}
                                                onPress={() => handleLeagueSelect(l)}
                                                style={[styles.leagueItem, selectedLeague === l && styles.leagueSelected, { marginBottom: 10 }]}
                                            >
                                                <View style={[styles.leagueBg, l === 'copa' && { borderColor: '#FFD700', borderWidth: 2 }, (!isPremium && !unlockedLeagues.includes(l)) && { opacity: 0.5 }]}>
                                                    <Image source={LIGAS[l]} style={{ width: 50, height: 50, resizeMode: 'contain' }} />
                                                </View>
                                                {(!isPremium && !unlockedLeagues.includes(l)) && (
                                                    <View style={styles.lockedOverlay}>
                                                        <FontAwesome5 name="lock" size={14} color="#fff" />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        )
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Coluna Time */}
                            {/* Coluna Time */}
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { textAlign: 'center', marginBottom: 10 }]} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('team')}</Text>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder={i18n.t('searchTeam')}
                                    placeholderTextColor="#666"
                                    value={searchChampionship}
                                    onChangeText={setSearchChampionship}
                                />
                                <View style={[styles.teamListContainer, { height: '100%' }]}>
                                    <FlatList
                                        data={filteredChampionshipTeams}
                                        keyExtractor={item => item}
                                        initialNumToRender={10}
                                        renderItem={({ item }) => {
                                            const locked = isTeamLocked(item);
                                            return (
                                                <TouchableOpacity
                                                    onPress={() => handleTeamSelect(item, setTeamA)}
                                                    style={[
                                                        styles.teamItem,
                                                        teamA === item && styles.teamSelected,
                                                        locked && { opacity: 0.5, backgroundColor: '#333' }
                                                    ]}
                                                >
                                                    <Image source={TIMES[item]} style={styles.teamIconSmall} />
                                                    <Text style={styles.teamTextList} numberOfLines={1}>
                                                        {formatTeamName(item)}
                                                    </Text>
                                                    {locked && <FontAwesome5 name="lock" size={10} color="#fff" style={{ marginLeft: 5 }} />}
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* BOTÕES PRÓXIMOS */}
                        <View style={{ padding: 20, width: '100%', gap: 10 }}>
                            <TouchableOpacity style={[styles.btnStart, { backgroundColor: '#FFD700', marginBottom: 0 }]} onPress={initChampionship}>
                                <Text style={[styles.btnText, { color: '#000' }]} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('startTournament')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.exitBtn, { position: 'relative', alignSelf: 'center', marginTop: 0, backgroundColor: 'transparent' }]} onPress={() => setAppMode('menu')}>
                                <Text style={{ color: '#fff', textDecorationLine: 'underline' }}>{i18n.t('back')}</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </View>
        );
    }

    if (appMode === 'bracket') {
        const currentMatchId = champMatches.find(m => !m.played)?.id;
        return (
            <View style={[styles.menuContainer, { backgroundColor: '#121212', paddingTop: STATUSBAR_HEIGHT }]}>
                <LinearGradient colors={['#1a1a1a', '#000']} style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                    <SafeAreaView style={styles.menuSafeArea}>
                        <View style={[styles.menuHeader, { marginTop: -10, justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 20 }]}>
                            <View>
                                <Text style={[styles.menuTitle, { textAlign: 'left' }]} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('tournament')}</Text>
                                <Text style={[styles.label, { color: '#fff', textAlign: 'left', marginBottom: 0 }]} numberOfLines={1} adjustsFontSizeToFit>{i18n.t(champRound)}</Text>
                            </View>
                            <TouchableOpacity
                                style={{ padding: 8, backgroundColor: '#333', borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 5 }}
                                onPress={() => setAppMode('bracket_view')}
                            >
                                <Feather name="list" size={14} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Orbitron_700Bold' }}>{i18n.t('viewBrackets')}</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ width: '100%', paddingHorizontal: 20, marginTop: 10 }}>
                            {champMatches.map((m, index) => {
                                const isEven = index % 2 === 0;
                                const isCurrent = m.id === currentMatchId;
                                return (
                                    <View key={m.id} style={{ marginBottom: isEven ? 0 : 20 }}>
                                        <View style={[styles.matchCard, isCurrent && { borderColor: '#00e676', borderWidth: 2, backgroundColor: 'rgba(33,33,33,1)' }]}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                                {/* Team 1 */}
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                                    <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.matchTeam, { textAlign: 'right' }, m.winner === m.t1 && { color: '#00e676' }]}>{formatTeamName(m.t1)}</Text>
                                                    <Image source={TIMES[m.t1]} style={styles.matchLogo} />
                                                    <Text style={styles.matchScore}>{m.played ? m.score1 : ''}</Text>
                                                </View>

                                                {/* X */}
                                                <Text style={{ color: '#555', marginHorizontal: 8, fontSize: 12, fontFamily: 'Orbitron_700Bold' }}>X</Text>

                                                {/* Team 2 */}
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                                                    <Text style={styles.matchScore}>{m.played ? m.score2 : ''}</Text>
                                                    <Image source={TIMES[m.t2]} style={styles.matchLogo} />
                                                    <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.matchTeam, { textAlign: 'left' }, m.winner === m.t2 && { color: '#00e676' }]}>{formatTeamName(m.t2)}</Text>
                                                </View>
                                            </View>

                                            {!m.played && isCurrent && (
                                                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10, width: '100%', borderTopWidth: 1, borderColor: '#333', paddingTop: 10 }}>
                                                    {m.isUserMatch ? (
                                                        <>
                                                            <TouchableOpacity onPress={() => playUserMatch('jogar')} style={[styles.actionBtn, { paddingHorizontal: 20 }]}><Text style={styles.actionBtnText}>{i18n.t('playMatch')}</Text></TouchableOpacity>
                                                            <TouchableOpacity onPress={() => playUserMatch('simulacao')} style={[styles.actionBtn, { backgroundColor: '#2196f3', paddingHorizontal: 20 }]}><Text style={styles.actionBtnText}>{i18n.t('simulate')}</Text></TouchableOpacity>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TouchableOpacity onPress={() => simulateMatch(m.id, true)} style={[styles.actionBtn, { backgroundColor: '#2196f3' }]}><Text style={styles.actionBtnText}>{i18n.t('watch')}</Text></TouchableOpacity>
                                                            <TouchableOpacity onPress={() => simulateMatch(m.id, false)} style={[styles.actionBtn, { backgroundColor: '#ff9800' }]}><Text style={styles.actionBtnText}>{i18n.t('quickResult')}</Text></TouchableOpacity>
                                                        </>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                        {isEven && <View style={{ height: 10, width: 2, backgroundColor: '#333', alignSelf: 'center' }} />}
                                    </View>
                                );
                            })}
                        </ScrollView>
                        <View style={{ padding: 20 }}>
                            {!champMatches.some(m => !m.played) && (
                                <TouchableOpacity style={styles.btnStart} onPress={advanceChampionship}>
                                    <Text style={[styles.btnText, { color: '#000' }]} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('nextRound')}</Text>
                                </TouchableOpacity>
                            )}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 }}>
                                <TouchableOpacity style={[styles.btnStart, { backgroundColor: '#444', flex: 1, marginTop: 0 }]} onPress={exitChampionship}>
                                    <Text style={styles.btnText} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('exit')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btnStart, { backgroundColor: '#444', flex: 1, marginTop: 0 }]} onPress={initChampionship}>
                                    <Text style={styles.btnText} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('restart')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </View>
        );
    }

    // --- MENU ---
    if (appMode === 'menu') {
        return (
            <ImageBackground source={require('./assets/estadios/estadio_sp.jpg')} style={styles.menuContainer} blurRadius={5}>
                <StatusBar hidden />
                <SafeAreaView style={styles.menuSafeArea}>
                    <LinearGradient colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']} style={styles.menuOverlay}>
                        <View style={styles.menuHeader}>
                            {/* BOTÃO PREMIUM (REMOVE ADS) - LADO ESQUERDO */}
                            {!isPremium && (
                                <View style={styles.premiumContainer}>
                                    <TouchableOpacity style={styles.premiumBtn} onPress={handlePurchaseAlert}>
                                        <FontAwesome5 name="crown" size={14} color="#000" />
                                        <Text style={styles.premiumText} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('premium')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={restorePurchases}>
                                        <Text style={styles.restoreText} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('restorePurchases')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* LOGO - CENTRO */}
                            <Image source={require('./assets/logo.png')} style={styles.menuLogo} />

                            {/* CONFIG - LADO DIREITO */}
                            <TouchableOpacity style={styles.configBtn} onPress={() => setShowSettings(true)} activeOpacity={0.7}>
                                <Feather name="settings" size={32} color="#fff" style={{ textShadowColor: '#000', textShadowRadius: 4 }} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuSection}>
                            <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('selectMode')}</Text>
                            <View style={styles.row}>
                                <TouchableOpacity style={[styles.btnOption, gameMode === 'simulacao' && styles.btnSelected]} onPress={() => { setGameMode('simulacao'); setMatchType('simulacao'); }}>
                                    <Text style={styles.btnText} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('simulation')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btnOption, gameMode === 'jogar' && styles.btnSelected]} onPress={() => { setGameMode('jogar'); setMatchType('jogar'); }}>
                                    <Text style={styles.btnText} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('play')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btnOption, gameMode === 'campeonato' && styles.btnSelected]} onPress={() => campeonatoSalvo ? retomarCampeonato(campeonatoSalvo) : setAppMode('championship_setup')}>
                                    <Text style={styles.btnText} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('championship')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.menuSection}>
                            <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('selectLeague')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 80 }}>
                                <TouchableOpacity onPress={() => setSelectedLeague(null)} style={[styles.leagueItem, !selectedLeague && styles.leagueSelected, { justifyContent: 'center' }]}>
                                    <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Orbitron_700Bold' }}>{i18n.t('any')}</Text>
                                </TouchableOpacity>
                                {LEAGUE_ORDER.map(l => (
                                    LIGAS[l] && (
                                        <TouchableOpacity
                                            key={l}
                                            onPress={() => handleLeagueSelect(l)}
                                            style={[styles.leagueItem, selectedLeague === l && styles.leagueSelected]}
                                        >
                                            <View style={[styles.leagueBg, l === 'copa' && { borderColor: '#FFD700', borderWidth: 2 }, (!isPremium && !unlockedLeagues.includes(l)) && { opacity: 0.5 }]}>
                                                <Image source={LIGAS[l]} style={{ width: 50, height: 50, resizeMode: 'contain' }} />
                                            </View>
                                            {(!isPremium && !unlockedLeagues.includes(l)) && (
                                                <View style={styles.lockedOverlay}>
                                                    <FontAwesome5 name="lock" size={14} color="#fff" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )
                                ))}
                            </ScrollView>
                        </View>

                        <View style={[styles.menuSection, { flex: 1 }]}>
                            <View style={[styles.row, { height: '100%' }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('home')}</Text>
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder={i18n.t('searchTeam')}
                                        placeholderTextColor="#666"
                                        value={searchTextA}
                                        onChangeText={setSearchTextA}
                                    />
                                    <View style={styles.teamListContainer}>
                                        <FlatList
                                            data={filteredTeamsA}
                                            keyExtractor={item => item}
                                            initialNumToRender={10}
                                            renderItem={({ item }) => {
                                                const locked = isTeamLocked(item);
                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => handleTeamSelect(item, setTeamA)}
                                                        style={[
                                                            styles.teamItem,
                                                            teamA === item && styles.teamSelected,
                                                            locked && { opacity: 0.5, backgroundColor: '#333' }
                                                        ]}
                                                    >
                                                        <Image source={TIMES[item]} style={styles.teamIconSmall} />
                                                        <Text style={styles.teamTextList} numberOfLines={1}>{formatTeamName(item)}</Text>
                                                        {locked && <FontAwesome5 name="lock" size={10} color="#fff" style={{ marginLeft: 5 }} />}
                                                    </TouchableOpacity>
                                                );
                                            }}
                                        />
                                    </View>
                                </View>
                                <View style={{ width: 10 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('away')}</Text>
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder={i18n.t('searchTeam')}
                                        placeholderTextColor="#666"
                                        value={searchTextB}
                                        onChangeText={setSearchTextB}
                                    />
                                    <View style={styles.teamListContainer}>
                                        <FlatList
                                            data={filteredTeamsB}
                                            keyExtractor={item => item}
                                            initialNumToRender={10}
                                            renderItem={({ item }) => {
                                                const locked = isTeamLocked(item);
                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => handleTeamSelect(item, setTeamB)}
                                                        style={[
                                                            styles.teamItem,
                                                            teamB === item && styles.teamSelected,
                                                            locked && { opacity: 0.5, backgroundColor: '#333' }
                                                        ]}
                                                    >
                                                        <Image source={TIMES[item]} style={styles.teamIconSmall} />
                                                        <Text style={styles.teamTextList} numberOfLines={1}>{formatTeamName(item)}</Text>
                                                        {locked && <FontAwesome5 name="lock" size={10} color="#fff" style={{ marginLeft: 5 }} />}
                                                    </TouchableOpacity>
                                                );
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.btnStart} onPress={() => startGame(false)}>
                            <Text style={[styles.btnText, { color: '#000', fontSize: 18 }]} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('startMatch')}</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    <Modal
                        visible={showSettings}
                        transparent
                        animationType="slide"
                        onRequestClose={() => {
                            setShowSettings(false);
                        }}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('settings')}</Text>

                                {/* BOTÕES DE VELOCIDADE 2 COLUNAS */}
                                <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('gameSpeed')}</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 20, justifyContent: 'center' }}>
                                    <View style={{ flexDirection: 'row', gap: 5, width: '100%', justifyContent: 'center' }}>
                                        <TouchableOpacity onPress={() => setSpeedMultiplier(0.5)} style={[styles.timeItem, { flex: 1 }, speedMultiplier === 0.5 && styles.leagueSelected]}><Text style={styles.btnTextSettings} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('veryLow')}</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => setSpeedMultiplier(0.75)} style={[styles.timeItem, { flex: 1 }, speedMultiplier === 0.75 && styles.leagueSelected]}><Text style={styles.btnTextSettings} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('low')}</Text></TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 5, width: '100%', justifyContent: 'center' }}>
                                        <TouchableOpacity onPress={() => setSpeedMultiplier(1.25)} style={[styles.timeItem, { flex: 1 }, speedMultiplier === 1.25 && styles.leagueSelected]}><Text style={styles.btnTextSettings} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('fast')}</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => setSpeedMultiplier(1.5)} style={[styles.timeItem, { flex: 1 }, speedMultiplier === 1.5 && styles.leagueSelected]}><Text style={styles.btnTextSettings} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('veryFast')}</Text></TouchableOpacity>
                                    </View>
                                    <TouchableOpacity onPress={() => setSpeedMultiplier(1.0)} style={[styles.timeItem, { width: '50%' }, speedMultiplier === 1.0 && styles.leagueSelected]}><Text style={styles.btnTextSettings} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('normal')}</Text></TouchableOpacity>
                                </View>

                                <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('totalTime')}</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 25, justifyContent: 'center' }}>
                                    {[20, 30, 40, 60, 90, 120].map(dur => (
                                        <TouchableOpacity key={dur} onPress={() => setSelectedDuration(dur)} style={[styles.timeItem, selectedDuration === dur && styles.leagueSelected]} activeOpacity={0.6}>
                                            <Text style={styles.timeText}>{dur}s</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('audio')}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 35, justifyContent: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 12, marginRight: 10, fontFamily: 'Orbitron_700Bold' }}>{i18n.t('off')}</Text>
                                    <Switch trackColor={{ false: "#767577", true: "#00e676" }} thumbColor={audioEnabled ? "#f4f3f4" : "#f4f3f4"} onValueChange={() => setAudioEnabled(!audioEnabled)} value={audioEnabled} />
                                    <Text style={{ color: '#fff', fontSize: 12, marginLeft: 10, fontFamily: 'Orbitron_700Bold' }}>{i18n.t('on')}</Text>
                                </View>
                                <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('controlKeeper')}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 35, justifyContent: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 12, marginRight: 10, fontFamily: 'Orbitron_700Bold' }}>{i18n.t('off')}</Text>
                                    <Switch trackColor={{ false: "#767577", true: "#00e676" }} thumbColor={controlKeeperEnabled ? "#f4f3f4" : "#f4f3f4"} onValueChange={() => setControlKeeperEnabled(!controlKeeperEnabled)} value={controlKeeperEnabled} />
                                    <Text style={{ color: '#fff', fontSize: 12, marginLeft: 10, fontFamily: 'Orbitron_700Bold' }}>{i18n.t('on')}</Text>
                                </View>

                                {/* Exigido onde há formulário de consentimento (Europa): permite rever a escolha */}
                                {mostrarPrivacidadeAnuncios && (
                                    <TouchableOpacity onPress={() => AdsConsent.showPrivacyOptionsForm().catch(() => { })} style={{ alignSelf: 'center', marginBottom: 10 }}>
                                        <Text style={{ color: '#aaa', fontSize: 11, textDecorationLine: 'underline', fontFamily: 'Orbitron_700Bold' }}>{i18n.t('adPrivacy')}</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity style={[styles.btnClose, { marginTop: 10 }]} onPress={() => setShowSettings(false)} activeOpacity={0.7}>
                                    <Text style={styles.btnText} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('close')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </SafeAreaView>
            </ImageBackground>
        );
    }

    // --- GAME ---
    const entities = entitiesRef.current;
    const stadiumImg = getStadiumForTeam(teamA);
    const displayMins = gameTimeRef.current;
    const displayM = Math.floor(displayMins);
    const displayS = Math.floor((displayMins - displayM) * 60);

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <ImageBackground source={stadiumImg} style={styles.bgImage} resizeMode="cover">
                <View style={styles.bgOverlay} />
            </ImageBackground>

            <Animated.View style={[styles.gameWrapper, { transform: [{ scale: SCALE }, { translateX: tremidaAnim }] }]}>
                <View style={styles.headerLeft}>
                    {selectedLeague && LIGAS[selectedLeague] && (
                        <View style={styles.leagueBadge}>
                            <Image source={LIGAS[selectedLeague]} style={{ width: 50, height: 50, resizeMode: 'contain' }} />
                        </View>
                    )}
                </View>
                <View style={styles.headerRight}>
                    {gameState === 'GOLDEN_GOAL' ? (
                        <Text style={[styles.timerText, { color: '#FFD700', fontSize: 16 }]}>{i18n.t('goldenGoal')}</Text>
                    ) : (
                        <Text style={styles.timerText}>{displayM.toString().padStart(2, '0')}:{displayS.toString().padStart(2, '0')}</Text>
                    )}
                </View>

                <View style={styles.scoreboard}>
                    <View style={[styles.scoreBox, { borderBottomColor: '#00ffff' }]}>
                        {TIMES[teamA] && <Image source={TIMES[teamA]} style={styles.teamLogoUi} />}
                        <View style={{ alignItems: 'center' }}>
                            <TeamNameDisplay name={formatTeamName(teamA)} />
                            <Text style={[styles.scoreNum, { textShadowColor: '#00ffff', textShadowRadius: 10 }]}>{scoreA}</Text>
                        </View>
                    </View>
                    <View style={[styles.scoreBox, { borderBottomColor: '#ff00ff' }]}>
                        <View style={{ alignItems: 'center' }}>
                            <TeamNameDisplay name={formatTeamName(teamB)} />
                            <Text style={[styles.scoreNum, { textShadowColor: '#ff00ff', textShadowRadius: 10 }]}>{scoreB}</Text>
                        </View>
                        {TIMES[teamB] && <Image source={TIMES[teamB]} style={styles.teamLogoUi} />}
                    </View>
                </View>

                <View style={[styles.goalArea, { top: GAME_HEIGHT / 2 - 200 - 80, height: 80 }]} />
                <View style={[styles.goalPost, { top: GAME_HEIGHT / 2 - 200 - 40, left: GAME_WIDTH / 2 - 100 / 2 - 10 }]} />
                <View style={[styles.goalPost, { top: GAME_HEIGHT / 2 - 200 - 40, left: GAME_WIDTH / 2 + 100 / 2 }]} />
                <View style={[styles.goalArea, { top: GAME_HEIGHT / 2 + 200, height: 80 }]} />
                <View style={[styles.goalPost, { top: GAME_HEIGHT / 2 + 200 - 40, left: GAME_WIDTH / 2 - 100 / 2 - 10 }]} />
                <View style={[styles.goalPost, { top: GAME_HEIGHT / 2 + 200 - 40, left: GAME_WIDTH / 2 + 100 / 2 }]} />

                {entities.keeperTop && <KeeperVisual x={entities.keeperTop.x} y={entities.keeperTop.y} />}
                {entities.keeperBot && <KeeperVisual x={entities.keeperBot.x} y={entities.keeperBot.y} />}

                {teamAtTop === 'A' ?
                    (TIMES[teamA] && <Image source={TIMES[teamA]} style={[styles.goalLogo, { top: GAME_HEIGHT / 2 - 200 - 40 - 30, left: GAME_WIDTH / 2 - 30 }]} />) :
                    (TIMES[teamB] && <Image source={TIMES[teamB]} style={[styles.goalLogo, { top: GAME_HEIGHT / 2 - 200 - 40 - 30, left: GAME_WIDTH / 2 - 30 }]} />)
                }
                {teamAtTop === 'A' ?
                    (TIMES[teamB] && <Image source={TIMES[teamB]} style={[styles.goalLogo, { top: GAME_HEIGHT / 2 + 200 + 40 - 30, left: GAME_WIDTH / 2 - 30 }]} />) :
                    (TIMES[teamA] && <Image source={TIMES[teamA]} style={[styles.goalLogo, { top: GAME_HEIGHT / 2 + 200 + 40 - 30, left: GAME_WIDTH / 2 - 30 }]} />)
                }

                {entities.spinner && (
                    <View style={[styles.spinner, { left: entities.spinner.x - 110, top: entities.spinner.y - 7.5, transform: [{ rotate: `${entities.spinner.angle}rad` }] }]} />
                )}
                {entities.ball && <View style={[styles.ball, { left: entities.ball.x - 12, top: entities.ball.y - 12 }]} />}

                {/* Marca d'água na Simulação: quem gravar a tela e postar divulga o app */}
                {matchType === 'simulacao' && (
                    <View style={styles.marcaDagua} pointerEvents="none">
                        <Image source={require('./assets/logo.png')} style={styles.marcaDaguaLogo} />
                        <Text style={styles.marcaDaguaTexto}>FAST FOOTBALL</Text>
                    </View>
                )}

                {Array.from({ length: 60 }).map((_, i) => {
                    const angle = (i / 60) * Math.PI * 2;
                    if (Math.abs(Math.sin(angle)) < 0.95) {
                        const x = (GAME_WIDTH / 2) + Math.cos(angle) * 200;
                        const y = (GAME_HEIGHT / 2) + Math.sin(angle) * 200;
                        return (<View key={i} style={{ position: 'absolute', left: x - 20, top: y - 7.5, width: 40, height: 15, backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.5)', borderWidth: 1, transform: [{ rotate: `${angle + Math.PI / 2}rad` }] }} />);
                    }
                    return null;
                })}

                {/* Escudo de quem marcou, surgindo acima do "GOL!" */}
                {timeDoGol && TIMES[timeDoGol] && (
                    <Animated.Image
                        source={TIMES[timeDoGol]}
                        style={[styles.escudoGol, {
                            opacity: escudoGolAnim,
                            transform: [{ scale: escudoGolAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
                        }]}
                    />
                )}

                {!!overlayText && (
                    <View style={styles.overlayContainer}>
                        <Text style={[styles.overlayText, { color: overlayColor, textShadowColor: '#000', textShadowRadius: 20 }]} numberOfLines={1} adjustsFontSizeToFit>{overlayText}</Text>
                    </View>
                )}

                {gameState === 'ENDED' && (
                    <View style={styles.endGameOverlay}>
                        {/* Esta parte vira a imagem compartilhada */}
                        <View ref={resultadoPartidaRef} collapsable={false} style={[styles.areaCompartilhavel, capturandoImagem && styles.areaCapturando]}>
                            {scoreA !== scoreB && (
                                <Image
                                    source={TIMES[scoreA > scoreB ? teamA : teamB]}
                                    style={{ width: 100, height: 100, resizeMode: 'contain', marginBottom: 20 }}
                                />
                            )}
                            <Text style={[styles.endGameTitle, { color: getWinnerColor(), textShadowColor: getWinnerColor(), textAlign: 'center' }]} numberOfLines={2} adjustsFontSizeToFit>
                                {getWinnerText()}
                            </Text>
                            <Text style={styles.placarFinal} numberOfLines={1} adjustsFontSizeToFit>
                                {formatTeamName(teamA)} {scoreA} x {scoreB} {formatTeamName(teamB)}
                            </Text>
                            {capturandoImagem && (
                                <View style={styles.marcaCompartilhar}>
                                    <Image source={require('./assets/logo.png')} style={styles.marcaCompartilharLogo} />
                                    <Text style={styles.marcaCompartilharTexto}>FAST FOOTBALL</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.endGameButtons}>
                            <TouchableOpacity style={[styles.endGameBtn, { backgroundColor: '#25D366', marginBottom: 10 }]} onPress={compartilharPartida}>
                                <Text style={[styles.endGameBtnText, { color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('shareBtn')}</Text>
                            </TouchableOpacity>

                            {/* --- BOTÃO DE REVANCHE (Se perdeu no campeonato, não for premium e não usou a revanche ainda) --- */}
                            {didUserLose() && !isPremium && !currentMatch?.rematchTaken && (
                                <TouchableOpacity
                                    style={[styles.endGameBtn, { backgroundColor: '#FFD700', marginBottom: 10 }]}
                                    onPress={handleRematch}>
                                    <Text style={[styles.endGameBtnText, { color: '#000' }]} numberOfLines={1} adjustsFontSizeToFit>
                                        {rewardedLoaded ? i18n.t('watchAdRematch') : i18n.t('loading')}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {!activeChampionship ? (
                                <TouchableOpacity style={styles.endGameBtn} onPress={onPlayAgain}>
                                    <Text style={styles.endGameBtnText} numberOfLines={1} adjustsFontSizeToFit>{i18n.t('playAgain')}</Text>
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity style={[styles.endGameBtn, { backgroundColor: '#444' }]} onPress={onMainMenu}>
                                <Text style={styles.endGameBtnText} numberOfLines={1} adjustsFontSizeToFit>{activeChampionship ? i18n.t('backToBracket') : i18n.t('mainMenu')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Animated.View>

            {matchType === 'jogar' && gameState !== 'ENDED' && (
                <>
                    {/* Botão Esquerdo - Gira spinner para esquerda */}
                    <TouchableOpacity
                        style={styles.controlLeft}
                        onPressIn={() => handleTap('left')}
                        activeOpacity={0.3}
                    >
                        <View style={styles.controlOverlay}>
                            <Feather name="chevron-left" size={40} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* Botão Central - Controla goleiro (só aparece se opção ativada) */}
                    {controlKeeperEnabled && (
                        <View
                            style={styles.controlCenter}
                            onStartShouldSetResponder={() => true}
                            onMoveShouldSetResponder={() => true}
                            onResponderGrant={(evt) => {
                                const touchX = evt.nativeEvent.pageX;
                                const screenCenterX = SCREEN_WIDTH / 2;
                                const gameOffsetX = (SCREEN_WIDTH - (GAME_WIDTH * SCALE)) / 2;
                                const gameTouchX = (touchX - gameOffsetX) / SCALE;
                                const centerX = GAME_WIDTH / 2;
                                userKeeperXRef.current = Math.max(centerX - 60, Math.min(centerX + 60, gameTouchX));
                            }}
                            onResponderMove={(evt) => {
                                const touchX = evt.nativeEvent.pageX;
                                const gameOffsetX = (SCREEN_WIDTH - (GAME_WIDTH * SCALE)) / 2;
                                const gameTouchX = (touchX - gameOffsetX) / SCALE;
                                const centerX = GAME_WIDTH / 2;
                                userKeeperXRef.current = Math.max(centerX - 60, Math.min(centerX + 60, gameTouchX));
                            }}
                        >
                            <View style={styles.controlOverlay}>
                                <FontAwesome5 name="hand-rock" size={30} color="#fff" />
                            </View>
                        </View>
                    )}

                    {/* Botão Direito - Gira spinner para direita */}
                    <TouchableOpacity
                        style={styles.controlRight}
                        onPressIn={() => handleTap('right')}
                        activeOpacity={0.3}
                    >
                        <View style={styles.controlOverlay}>
                            <Feather name="chevron-right" size={40} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </>
            )}

            <TouchableOpacity style={styles.exitBtn} onPress={backToMenu}><Text style={styles.exitText}>X</Text></TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
    menuContainer: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
    menuSafeArea: { flex: 1, width: '100%', backgroundColor: 'transparent', paddingTop: STATUSBAR_HEIGHT },
    menuOverlay: { flex: 1, width: '100%', padding: 20, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
    menuHeader: { width: '100%', alignItems: 'center', marginBottom: 20, position: 'relative', height: 120, justifyContent: 'center' },
    menuLogo: { width: 115, height: 115, marginBottom: -5 },
    menuTitle: { fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 20, textAlign: 'center' },
    configBtn: { position: 'absolute', right: 0, top: 10, padding: 10, zIndex: 20 },
    premiumContainer: { position: 'absolute', left: -10, top: 20, zIndex: 20, alignItems: 'center' },
    premiumBtn: { flexDirection: 'row', backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, alignItems: 'center', gap: 5, marginBottom: 5 },
    premiumText: { fontFamily: 'Orbitron_700Bold', fontSize: 10, color: '#000' },
    restoreText: { color: '#ccc', fontSize: 9, textDecorationLine: 'underline', fontFamily: 'Orbitron_700Bold', textAlign: 'center' },
    menuSection: { width: '100%', marginBottom: 15 },
    label: { fontFamily: 'Orbitron_700Bold', color: '#00e676', fontSize: 12, marginBottom: 5 },
    row: { flexDirection: 'row', gap: 10 },
    btnOption: { flex: 1, backgroundColor: '#333', paddingVertical: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#555' },
    btnSelected: { backgroundColor: '#00e676', borderColor: '#fff' },
    btnText: { fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 12 },
    btnTextSettings: { fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 8 },
    leagueItem: { marginRight: 10, padding: 5, borderWidth: 1, borderColor: 'transparent', borderRadius: 8, minWidth: 50, alignItems: 'center', position: 'relative' },
    leagueBg: { padding: 5, backgroundColor: '#ffffff', borderRadius: 20 },
    leagueSelected: { borderColor: '#00e676', backgroundColor: 'rgba(0, 230, 118, 0.2)' },
    lockedOverlay: { position: 'absolute', top: -5, right: -5, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    timeItem: { width: 70, height: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333', borderRadius: 8, backgroundColor: '#222' },
    timeText: { color: '#fff', fontFamily: 'Orbitron_700Bold', fontSize: 14 },
    teamListContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, borderWidth: 1, borderColor: '#333' },
    teamItem: { flexDirection: 'row', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
    teamSelected: { backgroundColor: 'rgba(0, 230, 118, 0.3)' },
    teamIconSmall: { width: 20, height: 20, marginRight: 10, resizeMode: 'contain' },
    teamTextList: { color: '#fff', fontFamily: 'Orbitron_700Bold', fontSize: 10, flex: 1 },
    btnStart: { width: '100%', backgroundColor: '#00e676', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 40 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '90%', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#444', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
    modalTitle: { fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 22, marginBottom: 25, letterSpacing: 2 },
    btnClose: { backgroundColor: '#d50000', padding: 15, borderRadius: 8, width: '40%', alignItems: 'center' },
    bgImage: { position: 'absolute', width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
    bgOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    gameWrapper: { width: GAME_WIDTH, height: GAME_HEIGHT, position: 'relative', overflow: 'hidden' },
    headerLeft: { position: 'absolute', top: 10, left: 15, zIndex: 10 },
    leagueBadge: { backgroundColor: '#ffffff', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    headerRight: { position: 'absolute', top: 10, right: 15, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    timerText: { fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 20 },
    scoreboard: { position: 'absolute', top: 85, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
    scoreBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 12, borderBottomWidth: 4 },
    teamLogoUi: { width: 40, height: 40, resizeMode: 'contain' },
    scoreName: { fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 10, opacity: 0.9, textTransform: 'uppercase', maxWidth: 80, textAlign: 'center' },
    scoreNum: { fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 30, lineHeight: 30 },
    goalArea: { position: 'absolute', width: 120, left: GAME_WIDTH / 2 - 60, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
    goalPost: { position: 'absolute', width: 10, height: 80, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 5 },
    spinner: { position: 'absolute', width: 220, height: 15, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
    ball: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', borderWidth: 2, borderColor: '#ddd' },
    keeperHead: { position: 'absolute', width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#fff', backgroundColor: '#ffeb3b', zIndex: 2 },
    keeperBody: { position: 'absolute', width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#fff', backgroundColor: '#ffeb3b', zIndex: 1 },
    goalLogo: { position: 'absolute', width: 60, height: 60, opacity: 0.8, resizeMode: 'contain' },
    escudoGol: { position: 'absolute', top: GAME_HEIGHT / 2 - 190, left: GAME_WIDTH / 2 - 70, width: 140, height: 140, resizeMode: 'contain', zIndex: 19 },
    marcaDagua: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, opacity: 0.8 },
    marcaDaguaLogo: { width: 36, height: 36, resizeMode: 'contain' },
    marcaDaguaTexto: { color: '#fff', fontSize: 18, fontFamily: 'Orbitron_700Bold', letterSpacing: 2, textShadowColor: '#000', textShadowRadius: 6 },
    overlayContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 20 },
    overlayText: { fontFamily: 'Orbitron_700Bold', fontSize: 60, color: '#fff' },
    endGameOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 50 },
    endGameTitle: { fontFamily: 'Orbitron_700Bold', fontSize: 40, marginBottom: 40, textShadowRadius: 10 },
    endGameButtons: { width: '80%', gap: 15 },
    areaCompartilhavel: { alignItems: 'center', width: '100%' },
    areaCapturando: { backgroundColor: '#0d0d0d', paddingVertical: 24, paddingHorizontal: 16, borderRadius: 16 },
    placarFinal: { color: '#fff', fontSize: 20, fontFamily: 'Orbitron_700Bold', marginTop: -24, marginBottom: 30, textAlign: 'center' },
    marcaCompartilhar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    marcaCompartilharLogo: { width: 30, height: 30, resizeMode: 'contain' },
    marcaCompartilharTexto: { color: '#fff', fontSize: 16, fontFamily: 'Orbitron_700Bold', letterSpacing: 2 },
    endGameBtn: { backgroundColor: '#00e676', padding: 20, borderRadius: 12, alignItems: 'center', width: '100%' },
    endGameBtnText: { fontFamily: 'Orbitron_700Bold', fontSize: 16, color: '#fff' },
    controlLeft: { position: 'absolute', bottom: 0, left: 0, width: '30%', height: '35%', zIndex: 5, justifyContent: 'center', alignItems: 'center' },
    controlCenter: { position: 'absolute', bottom: 0, left: '30%', width: '40%', height: '35%', zIndex: 5, justifyContent: 'center', alignItems: 'center' },
    controlRight: { position: 'absolute', bottom: 0, right: 0, width: '30%', height: '35%', zIndex: 5, justifyContent: 'center', alignItems: 'center' },
    controlOverlay: { backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 20, borderRadius: 50, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)' },
    controlHint: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center', zIndex: 6 },
    searchInput: { backgroundColor: '#222', color: '#fff', fontFamily: 'Orbitron_700Bold', fontSize: 12, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#444', marginBottom: 8 },
    exitBtn: { position: 'absolute', top: 50, right: 20, zIndex: 100, width: 30, height: 30, backgroundColor: 'red', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    exitText: { color: '#fff', fontWeight: 'bold' },
    matchCard: { flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.6)', marginBottom: 5, borderRadius: 12, padding: 10, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#333' },
    matchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center', marginVertical: 2 },
    matchLogo: { width: 30, height: 30, resizeMode: 'contain' },
    matchTeam: { fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 11, flex: 1 },
    matchScore: { fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 18, width: 30, textAlign: 'center' },
    actionBtn: { padding: 10, backgroundColor: '#00e676', borderRadius: 6, minWidth: 80, alignItems: 'center' },
    actionBtnText: { fontSize: 10, fontWeight: 'bold', color: '#000', fontFamily: 'Orbitron_700Bold' },
    bracketColumn: { alignItems: 'center', marginHorizontal: 20 },
    bracketRoundTitle: { color: '#fff', fontFamily: 'Orbitron_700Bold', marginBottom: 20, fontSize: 12 },
    bracketNode: { width: 80, backgroundColor: '#222', borderRadius: 8, padding: 5, marginBottom: 20, gap: 2, borderWidth: 1, borderColor: '#444' },
    bracketNodeItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 2, borderRadius: 4, gap: 5 },
    bracketConnector: { width: 20, height: 1, backgroundColor: '#444', alignSelf: 'center', marginTop: 20 }
});