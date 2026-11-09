import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '@react-native-firebase/analytics';
import { LinearGradient } from 'expo-linear-gradient';
import * as StoreReview from 'expo-store-review';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    BackHandler,
    Dimensions,
    Easing,
    Image,
    ImageBackground,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    AdEventType,
    BannerAd,
    BannerAdSize,
    InterstitialAd,
    RewardedAd,
    RewardedAdEventType
} from 'react-native-google-mobile-ads';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';

const { width: SW, height: SH } = Dimensions.get('window');

// Link da loja com marcação UTM (Play Console > aquisição mostra as instalações vindas do compartilhamento)
const LINK_COMPARTILHAR = `https://play.google.com/store/apps/details?id=com.julio333.ShowMilhaoFutebol&referrer=${encodeURIComponent('utm_source=milhao&utm_medium=compartilhar&utm_campaign=resultado')}`;
const isSmallScreen = SH < 700; // Inteligência para detectar celulares menores

// =============================================================================
// IDS DE ANÚNCIOS
// =============================================================================
const adUnitBanner = 'ca-app-pub-1665055635227173/3522265070';
const adUnitInterstitial = 'ca-app-pub-1665055635227173/4204791355';
const adUnitRewarded = 'ca-app-pub-1665055635227173/8583020062';

// Intersticial no fim da partida perdida: a cada N derrotas, com intervalo mínimo e fora da 1ª sessão
const DERROTAS_POR_INTERSTICIAL = 2;
const INTERSTICIAL_INTERVALO_MS = 2 * 60 * 1000;
// Pedido de avaliação (In-App Review do Google Play) a cada N partidas
const PARTIDAS_POR_AVALIACAO = 5;
// Retenção diária
const PRESENTE_DIARIO_BASE = 50000; // multiplicado pelo dia da sequência, até PRESENTE_DIARIO_MAX_DIAS
const PRESENTE_DIARIO_MAX_DIAS = 7;
const PREMIO_PERGUNTA_DO_DIA = 100000;

const hojeStr = () => new Date().toDateString();
const ontemStr = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

// =============================================================================
// ASSETS & DADOS
// =============================================================================

const SONS: Record<string, any> = {
    '1000': require('./assets/sons/mil.mp3'),
    '2000': require('./assets/sons/2mil.mp3'),
    '3000': require('./assets/sons/3mil.mp3'),
    '4000': require('./assets/sons/4mil.mp3'),
    '5000': require('./assets/sons/5mil.mp3'),
    '10000': require('./assets/sons/10mil.mp3'),
    '20000': require('./assets/sons/20mil.mp3'),
    '30000': require('./assets/sons/30mil.mp3'),
    '40000': require('./assets/sons/40mil.mp3'),
    '50000': require('./assets/sons/50mil.mp3'),
    '100000': require('./assets/sons/100mil.mp3'),
    '200000': require('./assets/sons/200mil.mp3'),
    '300000': require('./assets/sons/300mil.mp3'),
    '400000': require('./assets/sons/400mil.mp3'),
    '500000': require('./assets/sons/500mil.mp3'),
    '1000000': require('./assets/sons/1milhao.mp3'),
    'gol': require('./assets/sons/gol.mp3'),
    'parar': require('./assets/sons/parar.mp3'),
    'parabens': require('./assets/sons/parabéns.mp3'),
    'grana': require('./assets/sons/grana.mp3'),
    'cartoes': require('./assets/sons/cartao.mp3'),
    'driblar': require('./assets/sons/finta.mp3'),
    'torcedores': require('./assets/sons/torcida.mp3'),
    'var': require('./assets/sons/var.mp3'),
    'errou': require('./assets/sons/errou.mp3'),
    'intro': require('./assets/sons/intro.mp3'),
    'apito': require('./assets/sons/apito.mp3'),
};

const TIMES: Record<string, any> = {
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

    // Brasileiros Extras (Novos Escudos)
    '15piracicaba': require('./assets/novos escudos/15piracicaba.png'),
    'americamg': require('./assets/novos escudos/americamg.png'),
    'americarj': require('./assets/novos escudos/americarj.png'),
    'asa': require('./assets/novos escudos/asa.png'),
    'athleticbr': require('./assets/novos escudos/athletic.png'),
    'atleticogo': require('./assets/novos escudos/atleticogo.png'),
    'avai': require('./assets/novos escudos/avai.png'),
    'botafogopb': require('./assets/novos escudos/botafogopb.png'),
    'botafogosp': require('./assets/novos escudos/botafogosp.png'),
    'brusque': require('./assets/novos escudos/brusque.png'),
    'caxias': require('./assets/novos escudos/caxias.png'),
    'ceara': require('./assets/novos escudos/ceara.png'),
    'crb': require('./assets/novos escudos/crb.png'),
    'criciuma': require('./assets/novos escudos/criciuma.png'),
    'cuiaba': require('./assets/novos escudos/cuiaba.png'),
    'ferroviaria': require('./assets/novos escudos/ferroviaria.png'),
    'figueirense': require('./assets/novos escudos/figueirense.png'),
    'fortaleza': require('./assets/novos escudos/fortaleza.png'),
    'gama': require('./assets/novos escudos/gama.png'),
    'goias': require('./assets/novos escudos/goias.png'),
    'guarani': require('./assets/novos escudos/guarani.png'),
    'ituano': require('./assets/novos escudos/ituano.png'),
    'joinville': require('./assets/novos escudos/joinville.png'),
    'juventude': require('./assets/novos escudos/juventude.png'),
    'juventusmooca': require('./assets/novos escudos/juventusmooca.png'),
    'londrina': require('./assets/novos escudos/londrina.png'),
    'madureira': require('./assets/novos escudos/madureira.png'),
    'nautico': require('./assets/novos escudos/nautico.png'),
    'novorizontino': require('./assets/novos escudos/novorizontino.png'),
    'operario': require('./assets/novos escudos/operario.png'),
    'paysandu': require('./assets/novos escudos/paysandu.png'),
    'pontepreta': require('./assets/novos escudos/pontepreta.png'),
    'portuguesa': require('./assets/novos escudos/portuguesa.png'),
    'sampaiocorrea': require('./assets/novos escudos/sampaiocorrea.png'),
    'santacruz': require('./assets/novos escudos/santacruz.png'),
    'saobernardo': require('./assets/novos escudos/saobernardo.png'),
    'sport': require('./assets/novos escudos/sport.png'),
    'vilanova': require('./assets/novos escudos/vilanova.png'),

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
    'verona': require('./assets/escudos/hellas.png'),
    'villa': require('./assets/escudos/villa.png'),
    'villarreal': require('./assets/escudos/Villarreal.png'),
    'west_ham': require('./assets/escudos/west_ham.png'),
    'wolfsburg': require('./assets/escudos/wolfsburg.png'),
    'wolverhampton': require('./assets/escudos/Wolverhampton.png'),
};

const ESCUDOS_SELECOES: Record<string, any> = {
    africa_do_sul: require('./assets/escudos/africa_do_sul.png'),
    alemanha: require('./assets/escudos/alemanha.png'),
    arabia: require('./assets/escudos/arabia.png'),
    argelia: require('./assets/escudos/argelia.png'),
    argentina: require('./assets/escudos/argentina.png'),
    australia: require('./assets/escudos/australia.png'),
    austria: require('./assets/escudos/austria.png'),
    belgica: require('./assets/escudos/belgica.png'),
    brasil: require('./assets/escudos/brasil.png'),
    cabo_verde: require('./assets/escudos/cabo_verde.png'),
    canada: require('./assets/escudos/canada.png'),
    catar: require('./assets/escudos/catar.png'),
    colombia: require('./assets/escudos/colombia.png'),
    coreia: require('./assets/escudos/coreia.png'),
    croacia: require('./assets/escudos/croacia.png'),
    curacao: require('./assets/escudos/curacao.png'),
    egito: require('./assets/escudos/egito.png'),
    equador: require('./assets/escudos/equador.png'),
    escocia: require('./assets/escudos/escocia.png'),
    espanha: require('./assets/escudos/espanha.png'),
    eua: require('./assets/escudos/eua.png'),
    franca: require('./assets/escudos/franca.png'),
    gana: require('./assets/escudos/gana.png'),
    haiti: require('./assets/escudos/haiti.png'),
    holanda: require('./assets/escudos/holanda.png'),
    inglaterra: require('./assets/escudos/inglaterra.png'),
    ira: require('./assets/escudos/ira.png'),
    japao: require('./assets/escudos/japao.png'),
    jordania: require('./assets/escudos/jordania.png'),
    marfim: require('./assets/escudos/marfim.png'),
    marrocos: require('./assets/escudos/marrocos.png'),
    mexico: require('./assets/escudos/mexico.png'),
    noruega: require('./assets/escudos/noruega.png'),
    panama: require('./assets/escudos/panama.png'),
    paraguai: require('./assets/escudos/paraguai.png'),
    portugal: require('./assets/escudos/portugal.png'),
    senegal: require('./assets/escudos/senegal.png'),
    suica: require('./assets/escudos/suica.png'),
    tunisia: require('./assets/escudos/tunisia.png'),
    uruguai: require('./assets/escudos/uruguai.png'),
    uzbequistao: require('./assets/escudos/uzbequistao.png'),
    bosnia: require('./assets/escudos/bosnia.png'),
    republica_tcheca: require('./assets/escudos/republica_tcheca.png'),
    suecia: require('./assets/escudos/suecia.png'),
    iraque: require('./assets/escudos/iraque.png'),
    turquia: require('./assets/escudos/turquia.png'),
    congo: require('./assets/escudos/congo.png'),
};

const ESTADIOS: Record<string, any> = {
    // Padrão
    'campo': require('./assets/estadios/estadio_brinco.png'),

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
    'brasileirao': ['athletico', 'atleticomg', 'bahia', 'botafogo', 'bragantino', 'chapecoense', 'corinthians', 'coritiba', 'cruzeiro', 'flamengo', 'fluminense', 'gremio', 'internacional', 'mirassol', 'palmeiras', 'remo', 'santos', 'sp', 'vasco', 'vitoria'],
    'premier': ['arsenal', 'bournemouth', 'brentford', 'brighton', 'burnley', 'chelsea', 'city', 'crystal', 'everton', 'forest', 'fulham', 'leeds', 'liverpool', 'man_united', 'newcastle', 'sunderland', 'tottenham', 'villa', 'west_ham', 'wolves', 'wolverhampton', 'united'],
    'laliga': ['alaves', 'athletic', 'atletico', 'barcelona', 'betis', 'celta', 'elche', 'espanyol', 'getafe', 'girona', 'levante', 'mallorca', 'osasuna', 'oviedo', 'rayo', 'real_madrid', 'sevilla', 'sociedad', 'valencia', 'villarreal'],
    'seriea': ['atalanta', 'bologna', 'cagliari', 'como', 'cremonese', 'fiorentina', 'genoa', 'hellas', 'inter', 'juventus', 'lazio', 'lecce', 'milan', 'napoli', 'parma', 'pisa', 'roma', 'sassuolo', 'torino', 'udinese', 'verona'],
    'bundesliga': ['augsburg', 'bayern', 'bremen', 'dortmund', 'eintracht', 'freiburg', 'gladbach', 'hamburger', 'heidenheim', 'hoffenheim', 'koln', 'leipzig', 'leverkusen', 'mainz', 'monchengladbach', 'pauli', 'stuttgart', 'union_berlim', 'wolfsburg'],
    'ligue1': ['angers', 'auxerre', 'brest', 'le_havre', 'lens', 'lille', 'lorient', 'lyon', 'marseille', 'metz', 'monaco', 'nantes', 'nice', 'paris', 'paris_fc', 'rennes', 'stade', 'strasbourg', 'toulouse']
};

const TEAM_NAMES_MAP: Record<string, string> = {
    // Brasileiros
    'athletico': 'Athletico-PR', 'atleticomg': 'Atlético-MG', 'bahia': 'Bahia', 'botafogo': 'Botafogo', 'bragantino': 'RB Bragantino',
    'chapecoense': 'Chapecoense', 'corinthians': 'Corinthians', 'coritiba': 'Coritiba', 'cruzeiro': 'Cruzeiro', 'flamengo': 'Flamengo',
    'fluminense': 'Fluminense', 'gremio': 'Grêmio', 'internacional': 'Internacional', 'mirassol': 'Mirassol', 'palmeiras': 'Palmeiras',
    'remo': 'Remo', 'santos': 'Santos', 'sp': 'São Paulo', 'vasco': 'Vasco', 'vitoria': 'Vitória',
    // Brasileiros Extras
    '15piracicaba': 'XV de Piracicaba', 'americamg': 'América Mineiro', 'americarj': 'América-RJ', 'asa': 'ASA de Arapiraca', 'athleticbr': 'Athletic Club',
    'atleticogo': 'Atlético-GO', 'avai': 'Avaí', 'botafogopb': 'Botafogo-PB', 'botafogosp': 'Botafogo-SP', 'brusque': 'Brusque',
    'caxias': 'Caxias', 'ceara': 'Ceará', 'crb': 'CRB', 'criciuma': 'Criciúma', 'cuiaba': 'Cuiabá', 'ferroviaria': 'Ferroviária',
    'figueirense': 'Figueirense', 'fortaleza': 'Fortaleza', 'gama': 'Gama', 'goias': 'Goiás', 'guarani': 'Guarani',
    'ituano': 'Ituano', 'joinville': 'Joinville', 'juventude': 'Juventude', 'juventusmooca': 'Juventus da Mooca', 'londrina': 'Londrina',
    'madureira': 'Madureira', 'nautico': 'Náutico', 'novorizontino': 'Novorizontino', 'operario': 'Operário', 'paysandu': 'Paysandu',
    'pontepreta': 'Ponte Preta', 'portuguesa': 'Portuguesa', 'sampaiocorrea': 'Sampaio Corrêa', 'santacruz': 'Santa Cruz',
    'saobernardo': 'São Bernardo', 'sport': 'Sport Recife', 'vilanova': 'Vila Nova',
    // Premier League
    'arsenal': 'Arsenal', 'bournemouth': 'Bournemouth', 'brentford': 'Brentford', 'brighton': 'Brighton', 'burnley': 'Burnley',
    'chelsea': 'Chelsea', 'city': 'Man City', 'crystal': 'Crystal Palace', 'everton': 'Everton', 'forest': 'Nottm Forest',
    'fulham': 'Fulham', 'leeds': 'Leeds United', 'liverpool': 'Liverpool', 'man_united': 'Man United', 'newcastle': 'Newcastle',
    'sunderland': 'Sunderland', 'tottenham': 'Tottenham', 'villa': 'Aston Villa', 'west_ham': 'West Ham', 'wolverhampton': 'Wolves', 'wolves': 'Wolves', 'united': 'Man United',
    // La Liga
    'alaves': 'Alavés', 'athletic': 'Ath. Bilbao', 'atletico': 'Atl. Madrid', 'barcelona': 'Barcelona', 'betis': 'Real Betis',
    'celta': 'Celta Vigo', 'elche': 'Elche', 'espanyol': 'Espanyol', 'getafe': 'Getafe', 'girona': 'Girona', 'levante': 'Levante',
    'mallorca': 'Mallorca', 'osasuna': 'Osasuna', 'oviedo': 'Oviedo', 'rayo': 'Rayo Vallecano', 'real_madrid': 'Real Madrid',
    'sevilla': 'Sevilla', 'sociedad': 'Real Sociedad', 'valencia': 'Valencia', 'villarreal': 'Villarreal',
    // Serie A
    'atalanta': 'Atalanta', 'bologna': 'Bologna', 'cagliari': 'Cagliari', 'como': 'Como', 'cremonese': 'Cremonese', 'fiorentina': 'Fiorentina',
    'genoa': 'Genoa', 'hellas': 'Hellas Verona', 'verona': 'Hellas Verona', 'inter': 'Inter Milan', 'juventus': 'Juventus', 'lazio': 'Lazio',
    'lecce': 'Lecce', 'milan': 'AC Milan', 'napoli': 'Napoli', 'parma': 'Parma', 'pisa': 'Pisa', 'roma': 'AS Roma', 'sassuolo': 'Sassuolo',
    'torino': 'Torino', 'udinese': 'Udinese',
    // Bundesliga
    'augsburg': 'Augsburg', 'bayern': 'Bayern Munich', 'bremen': 'Werder Bremen', 'dortmund': 'Dortmund', 'eintracht': 'Eintracht',
    'freiburg': 'Freiburg', 'gladbach': 'M\'gladbach', 'hamburger': 'Hamburg', 'heidenheim': 'Heidenheim', 'hoffenheim': 'Hoffenheim',
    'koln': 'FC Köln', 'leipzig': 'RB Leipzig', 'leverkusen': 'Bayer Leverkusen', 'mainz': 'Mainz', 'monchengladbach': 'M\'gladbach',
    'pauli': 'St. Pauli', 'stuttgart': 'Stuttgart', 'union_berlim': 'Union Berlin', 'wolfsburg': 'Wolfsburg',
    // Ligue 1
    'angers': 'Angers', 'auxerre': 'Auxerre', 'brest': 'Brest', 'le_havre': 'Le Havre', 'lens': 'Lens', 'lille': 'Lille', 'lorient': 'Lorient',
    'lyon': 'Lyon', 'marseille': 'Marseille', 'metz': 'Metz', 'monaco': 'Monaco', 'nantes': 'Nantes', 'nice': 'Nice', 'paris': 'PSG',
    'paris_fc': 'Paris FC', 'rennes': 'Rennes', 'stade': 'Stade Brestois', 'strasbourg': 'Strasbourg', 'toulouse': 'Toulouse',
};

const formatTeamName = (name: string) => {
    return TEAM_NAMES_MAP[name] || name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const getEscudo = (nome: string): any => {
    return TIMES[nome] || ESCUDOS_SELECOES[nome] || null;
};

// =============================================================================
// HELPER PARA PREÇO DE ESTÁDIOS
// =============================================================================
const getEstadioPreco = (chave: string): number => {
    if (chave === 'campo') return 0;

    // Categorias de times
    const gigantes = [
        'real_madrid', 'barcelona', 'bayern', 'city', 'arsenal', 'liverpool', 'man_united', 'united', 'paris',
        'inter', 'milan', 'juventus', 'flamengo', 'palmeiras', 'sp', 'corinthians', 'curintia', 'dortmund'
    ];

    const grandes = [
        'atletico', 'leverkusen', 'chelsea', 'tottenham', 'newcastle', 'villa', 'napoli', 'roma', 'lazio',
        'vasco', 'botafogo', 'fluminense', 'cruzeiro', 'gremio', 'internacional', 'athletico', 'atleticomg',
        'bahia', 'vitoria', 'leipzig', 'sociedad', 'sevilla', 'marseille', 'lyon', 'monaco', 'porto', 'benfica'
    ];

    const timeId = chave.replace('estadio_', '');

    if (gigantes.includes(timeId)) return 2000000;
    if (grandes.includes(timeId)) return 1500000;
    return 1000000; // Demais times
};

// =============================================================================
// CONSTANTES DO JOGO
// =============================================================================

const PREMIOS = [
    1000, 2000, 3000, 4000, 5000,
    10000, 20000, 30000, 40000, 50000,
    100000, 200000, 300000, 400000, 500000,
    1000000,
];

const MODOS = [
    { id: 'brasileiro', label: 'Futebol Brasileiro', icon: '🇧🇷' },
    { id: 'europeu', label: 'Futebol Europeu', icon: '🌍' },
    { id: 'copa', label: 'Copa do Mundo', image: require('./assets/logo_copa.png') },
    { id: 'escudos', label: 'Apenas Escudos', icon: '🛡️', exclusivo: true },
];

const AJUDAS = [
    { id: 'cartoes', image: require('./assets/simbolos/cartoes.png'), label: 'CARTÕES' },
    { id: 'var', image: require('./assets/simbolos/var.png'), label: 'VAR' },
    { id: 'torcedores', image: require('./assets/simbolos/torcida.png'), label: 'TORCIDA' },
    { id: 'driblar', image: require('./assets/simbolos/drible.png'), label: 'DRIBLAR' },
];

const TEXTOS_AJUDA = {
    cartoes: "Elimina até 3 alternativas erradas para facilitar sua escolha!",
    var: "O árbitro de vídeo revelará qual é a resposta correta da questão!",
    torcedores: "A torcida dará seus palpites sobre qual é a alternativa certa.",
    driblar: "Pula a pergunta atual e avança no jogo sem perder dinheiro."
};

const LETRAS = ['1', '2', '3', '4'];
const COR_ACENTO = '#FBC02D';
const COR_ERRADA = '#e53935';
const COR_CERTA = '#43A047';

const PERGUNTAS_DB: Record<string, any[]> = require('./perguntas.json');

const DIFICULDADE_POR_PERGUNTA: string[] = [
    'facil', 'facil', 'facil', 'facil', 'medio',       // 1–5
    'medio', 'medio', 'medio', 'dificil', 'dificil',       // 6–10
    'dificil', 'muito_dificil', 'muito_dificil', 'muito_dificil', 'impossivel', // 11–15
    'impossivel',                                      // 16
];

// =============================================================================
// TIPOS
// =============================================================================
type Tela = 'home' | 'jogo' | 'loja_estadios' | 'loja_arbitragem';
type ModoJogo = string;
type Pergunta = {
    id: number;
    tipo: 'texto' | 'escudo';
    modo: string[];
    pergunta: string;
    alternativas: string[];
    correta: number;
    escudo?: string;
};
type EstadoResposta = 'aguardando' | 'correta' | 'errada' | 'tempo_esgotado';
type EstadoJogo = 'jogando' | 'fim_vitoria' | 'fim_derrota' | 'fim_desistencia';

function formatarPremio(valor: number): string {
    return valor.toLocaleString('pt-BR');
}

function embaralharArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function gerarListaPerguntas(modosSelecionados: string[]): Pergunta[] {
    const apenasEscudos = modosSelecionados.includes('escudos');
    const modosEfetivos = apenasEscudos
        ? ['brasileiro', 'europeu', 'copa', 'mix']
        : modosSelecionados;

    const usados = new Set<number>();
    const lista: Pergunta[] = [];

    // Probabilidade de "upset": sortear uma pergunta mais difícil nas rodadas fáceis/médias
    const UPSETS: Record<string, { prob: number; niveisAlternos: string[] }> = {
        facil: { prob: 0.12, niveisAlternos: ['dificil', 'muito_dificil'] },
        medio: { prob: 0.08, niveisAlternos: ['dificil', 'muito_dificil'] },
        dificil: { prob: 0.07, niveisAlternos: ['impossivel'] },
        muito_dificil: { prob: 0.07, niveisAlternos: ['impossivel'] },
    };

    const filtrarPool = (nivel: string): any[] => {
        const base = PERGUNTAS_DB[nivel] ?? [];
        return base.filter(
            (p: any) =>
                p.modo.some((m: string) => modosEfetivos.includes(m)) &&
                !usados.has(p.id) &&
                (!apenasEscudos || p.tipo === 'escudo')
        );
    };

    for (let i = 0; i < 16; i++) {
        const nivelBase = DIFICULDADE_POR_PERGUNTA[i];
        const upset = UPSETS[nivelBase];

        let pool: any[] = [];

        // Tenta sortear nível mais difícil com baixa probabilidade
        if (upset && Math.random() < upset.prob) {
            const alt = upset.niveisAlternos[Math.floor(Math.random() * upset.niveisAlternos.length)];
            const poolAlt = filtrarPool(alt);
            if (poolAlt.length > 0) pool = poolAlt;
        }

        // Se não entrou no upset (ou pool veio vazio), usa o nível normal
        if (pool.length === 0) pool = filtrarPool(nivelBase);

        // Fallback sem filtro de modo
        if (pool.length === 0) {
            pool = (PERGUNTAS_DB[nivelBase] ?? []).filter(
                (p: any) => !usados.has(p.id) && (!apenasEscudos || p.tipo === 'escudo')
            );
        }

        // Fallback final para modo escudos
        if (pool.length === 0 && apenasEscudos) {
            for (const nivel2 of Object.keys(PERGUNTAS_DB)) {
                const extra = PERGUNTAS_DB[nivel2].filter(
                    (p: any) => p.tipo === 'escudo' && !usados.has(p.id)
                );
                if (extra.length > 0) { pool = extra; break; }
            }
        }

        if (pool.length > 0) {
            const escolhida = pool[Math.floor(Math.random() * pool.length)];
            usados.add(escolhida.id);
            lista.push(escolhida as Pergunta);
        }
    }
    return lista;
}

// Pergunta do dia: a mesma para todos no mesmo dia, sorteada entre as de texto dos níveis médio e difícil
function perguntaDoDia(): Pergunta | null {
    const pool = [...(PERGUNTAS_DB['medio'] ?? []), ...(PERGUNTAS_DB['dificil'] ?? [])].filter((p: any) => p.tipo === 'texto');
    if (pool.length === 0) return null;
    let h = 0;
    for (const c of hojeStr()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return pool[h % pool.length] as Pergunta;
}

// =============================================================================
// COMPONENTE: CHUVA DE ITENS (HOME)
// =============================================================================
const RainAnimation = () => {
    const { width: W, height: H } = Dimensions.get('window');
    const items = ['💸', '🪙', '⚽', '🏆'];

    const raindrops = useRef(Array.from({ length: 20 }).map(() => ({
        emoji: items[Math.floor(Math.random() * items.length)],
        x: Math.random() * W,
        y: new Animated.Value(-100),
        duration: 3000 + Math.random() * 4000,
        delay: Math.random() * 5000,
        scale: 0.5 + Math.random() * 1,
        opacity: 0.1 + Math.random() * 0.3,
    }))).current;

    useEffect(() => {
        const agendarQueda = (gota: any) => {
            gota.y.setValue(-100);
            Animated.timing(gota.y, {
                toValue: H + 100,
                duration: gota.duration,
                delay: gota.delay,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) {
                    gota.delay = Math.random() * 2000;
                    agendarQueda(gota);
                }
            });
        };

        raindrops.forEach(agendarQueda);
    }, [H, raindrops]);

    return (
        <View style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]} pointerEvents="none">
            {raindrops.map((gota, idx) => (
                <Animated.Text
                    key={idx}
                    style={{
                        position: 'absolute',
                        left: gota.x,
                        transform: [{ translateY: gota.y }, { scale: gota.scale }],
                        fontSize: 30,
                        opacity: gota.opacity,
                    }}
                >
                    {gota.emoji}
                </Animated.Text>
            ))}
        </View>
    );
};

function MainApp() {
    const insets = useSafeAreaInsets();
    const [tela, setTela] = useState<Tela>('home');
    const [dinheiro, setDinheiro] = useState(0);
    const [jogosJogados, setJogosJogados] = useState(0);

    const [modosSelecionados, setModosSelecionados] = useState<string[]>(['brasileiro']);
    const [modalModosVisivel, setModalModosVisivel] = useState(false);

    // Sistema de Áudio
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [configVisivel, setConfigVisivel] = useState(false);
    const [premiumVisivel, setPremiumVisivel] = useState(false);

    // --- REVENUECAT & COMPRAS ---
    const [packages, setPackages] = useState<any[]>([]);
    const [hasRemovedAds, setHasRemovedAds] = useState(false);
    const [hasUnlockedStadiums, setHasUnlockedStadiums] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    // ----------------------------

    // Fila Inteligente de Áudio
    const currentSoundRef = useRef<any>(null);
    const audioEnabledRef = useRef(audioEnabled);

    // Loja de Estádios
    const [estadiosComprados, setEstadiosComprados] = useState<string[]>(['campo']);
    const [estadioSelecionado, setEstadioSelecionado] = useState<string>('campo');
    const [filtroLiga, setFiltroLiga] = useState<string>('brasileirao');
    const [estadioVisualizacao, setEstadioVisualizacao] = useState<string | null>(null);
    const [modalCartaChefaoVisivel, setModalCartaChefaoVisivel] = useState(false);
    const [chefaoVisto, setChefaoVisto] = useState(false);

    // Loja da Arbitragem
    const [comprasArbitragem, setComprasArbitragem] = useState<string[]>([]);

    // Animações e Confirmação
    const [confirmaAnswer, setConfirmaAnswer] = useState<number | null>(null);
    const [confirmarParar, setConfirmarParar] = useState(false);
    const [showGolAnim, setShowGolAnim] = useState(false);
    const [showStartScreen, setShowStartScreen] = useState(false);

    // Estados para a Animação em PNG do GOL
    const [faseGol, setFaseGol] = useState<0 | 1>(0);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const scaleTextAnim = useRef(new Animated.Value(0)).current;

    const [erroAtual, setErroAtual] = useState<{ tipo: string, msg: string } | null>(null);

    const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
    const [perguntaAtual, setPerguntaAtual] = useState(0);
    const [estadoJogo, setEstadoJogo] = useState<EstadoJogo>('jogando');
    const [estadoResposta, setEstadoResposta] = useState<EstadoResposta>('aguardando');
    const [alternativaEliminada, setAlternativaEliminada] = useState<number[]>([]);
    const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null);
    const [premioGanho, setPremioGanho] = useState(0);

    const [ajudasDisponiveis, setAjudasDisponiveis] = useState<string[]>([]);
    const [qtdDriblar, setQtdDriblar] = useState(0);
    const [perguntasPuladas, setPerguntasPuladas] = useState<number[]>([]);

    // Rastreio de anúncios premiados por partida
    const [adHelpUsed, setAdHelpUsed] = useState<Record<string, boolean>>({
        cartoes: false,
        driblar: false,
        torcedores: false
    });

    // Modais de Ajuda
    const [modalAjudaConfirm, setModalAjudaConfirm] = useState<string | null>(null);
    const [modalVarVisivel, setModalVarVisivel] = useState(false);
    const [modalTorcidaVisivel, setModalTorcidaVisivel] = useState(false);
    const [torcidaVotos, setTorcidaVotos] = useState<number[]>([]);
    const [modalCartoesVisivel, setModalCartoesVisivel] = useState(false);
    const [cartoesOpcoes, setCartoesOpcoes] = useState<number[]>([]);
    const [cartaoRevelado, setCartaoRevelado] = useState<number | null>(null);
    const varScanX = useRef(new Animated.Value(-300)).current;

    // Modal Especial 1 Milhão
    const [modalMilhaoVisivel, setModalMilhaoVisivel] = useState(false);

    // Segunda chance (vídeo premiado ao errar, 1 vez por partida) e prêmio em dobro
    const [modalSegundaChance, setModalSegundaChance] = useState(false);
    const segundaChanceUsadaRef = useRef(false);
    const segundaChanceGanhaRef = useRef(false);
    // Os listeners do anúncio são registrados uma vez só; este ref sempre aponta para a versão
    // atual da função que continua (ou encerra) a partida depois do vídeo
    const aposSegundaChanceRef = useRef<((ganhou: boolean) => void) | null>(null);
    const [premioDobrado, setPremioDobrado] = useState(false);
    const resultadoRef = useRef<View>(null);
    const [capturandoResultado, setCapturandoResultado] = useState(false);   // mostra a marca do jogo só na imagem

    // Intersticial no fim da partida perdida
    const ultimoIntersticialRef = useRef(0);
    const derrotasDesdeAnuncioRef = useRef(0);
    const primeiraSessaoRef = useRef(true);
    const avaliacaoNestaPartidaRef = useRef(false);
    const aposIntersticialRef = useRef<(() => void) | null>(null);

    // Retenção diária: presente com sequência de dias e pergunta do dia
    const [presenteDisponivel, setPresenteDisponivel] = useState<{ dia: number; valor: number } | null>(null);
    const [perguntaDiaRespondida, setPerguntaDiaRespondida] = useState(true);
    const [modalPerguntaDia, setModalPerguntaDia] = useState(false);
    const [respostaPerguntaDia, setRespostaPerguntaDia] = useState<number | null>(null);

    // Modais para Ads
    const [modalConfirmAdStadium, setModalConfirmAdStadium] = useState<string | null>(null);
    const [modalConfirmAdHelp, setModalConfirmAdHelp] = useState<string | null>(null);
    const [modalConfirmAdMoney, setModalConfirmAdMoney] = useState(false);

    // Auto-trigger help logic
    const pendingActionRef = useRef<any>(null); // Para saber o que executar após o fechamento do ad
    const pendingAutoHelpRef = useRef<string | null>(null);
    const [autoTriggerHelp, setAutoTriggerHelp] = useState<string | null>(null);

    // Timer 45s
    const [tempo, setTempo] = useState(45);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    // =========================================================================
    // INICIALIZAÇÃO E CONTROLE DE COMPRAS (RevenueCat) - CORRIGIDO
    // =========================================================================
    useEffect(() => {
        const setupRevenueCat = async () => {
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);

            if (Platform.OS === 'android') {
                Purchases.configure({ apiKey: 'CHAVE_REMOVIDA' });
            }

            try {
                const customerInfo = await Purchases.getCustomerInfo();

                // Nomes corrigidos de acordo com suas imagens: 'anuncios' e 'estadios'
                if (customerInfo.entitlements.active['anuncios']) {
                    setHasRemovedAds(true);
                }

                if (customerInfo.entitlements.active['estadios']) {
                    setHasUnlockedStadiums(true);
                }

                const offerings = await Purchases.getOfferings();

                // Forçamos a busca pelo seu identifier específico caso o 'current' falhe
                const currentOffering = offerings.current || offerings.all['default_certa'];

                if (currentOffering && currentOffering.availablePackages.length > 0) {
                    setPackages(currentOffering.availablePackages);
                } else {
                    console.log("AVISO: Certifique-se de que 'default_certa' é o offering CURRENT no painel.");
                }

            } catch (e) {
                console.log("Erro ao inicializar RevenueCat", e);
            }
        };
        setupRevenueCat();
    }, []);

    const handlePurchase = (pkg: any, type: 'anuncios' | 'estadios') => {
        if (isPurchasing) return;

        const confirmMessage = type === 'anuncios'
            ? "Remover anúncios? (Você ainda poderá ver os anúncios para ganhar itens)"
            : "Torne-se o chefão magnata mundial do futebol! Desbloquear todos os estádios?";

        Alert.alert(
            "Confirmação",
            confirmMessage,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Comprar",
                    onPress: async () => {
                        try {
                            setIsPurchasing(true);
                            const { customerInfo } = await Purchases.purchasePackage(pkg);

                            // Verificação pós-compra com os nomes novos
                            if (customerInfo.entitlements.active[type]) {
                                if (type === 'anuncios') setHasRemovedAds(true);
                                if (type === 'estadios') setHasUnlockedStadiums(true);
                                try {
                                    analytics().logEvent('purchase', {
                                        value: pkg.product.price,
                                        currency: pkg.product.currencyString || 'BRL',
                                        items: [{ item_id: type, item_name: type }]
                                    });
                                } catch (e) { }
                                Alert.alert("Sucesso!", "Compra realizada com sucesso.");
                            }
                        } catch (e: any) {
                            if (!e.userCancelled) {
                                Alert.alert("Erro", "Ocorreu um erro ao processar a compra.");
                            }
                        } finally {
                            setIsPurchasing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleRestorePurchases = async () => {
        if (isPurchasing) return;
        setIsPurchasing(true);
        try {
            const customerInfo = await Purchases.restorePurchases();
            let restored = false;

            if (customerInfo.entitlements.active['anuncios']) {
                setHasRemovedAds(true);
                restored = true;
            }
            if (customerInfo.entitlements.active['estadios']) {
                setHasUnlockedStadiums(true);
                restored = true;
            }

            if (restored) {
                Alert.alert("Sucesso", "Suas compras foram restauradas com sucesso!");
            } else {
                Alert.alert("Aviso", "Nenhuma compra anterior foi encontrada para restaurar.");
            }
        } catch (e: any) {
            Alert.alert("Erro", "Ocorreu um erro ao tentar restaurar suas compras.");
        } finally {
            setIsPurchasing(false);
        }
    };

    // =========================================================================
    // INICIALIZAÇÃO E CONTROLE DE ADS (AdMob)
    // =========================================================================
    const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
    const [isRewardedLoaded, setIsRewardedLoaded] = useState(false);

    const interstitialAdRef = useRef<InterstitialAd | null>(null);
    const rewardedAdRef = useRef<RewardedAd | null>(null);

    const interstitialRetryCount = useRef(0);
    const interstitialRetryTimeout = useRef<NodeJS.Timeout | null>(null);
    const rewardedRetryCount = useRef(0);
    const rewardedRetryTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Interstitial
        const intAd = InterstitialAd.createForAdRequest(adUnitInterstitial);
        const unsubIntLoad = intAd.addAdEventListener(AdEventType.LOADED, () => {
            setIsInterstitialLoaded(true);
            interstitialRetryCount.current = 0;
        });
        const unsubIntError = intAd.addAdEventListener(AdEventType.ERROR, (error) => {
            setIsInterstitialLoaded(false);
            try { analytics().logEvent('ad_load_error', { ad_type: 'interstitial', error: error?.message, code: error?.code }); } catch (e) { }

            if (interstitialRetryCount.current < 4) {
                interstitialRetryCount.current++;
                const backoffDelay = interstitialRetryCount.current === 1 ? 5000 : interstitialRetryCount.current === 2 ? 15000 : 30000;
                if (interstitialRetryTimeout.current) clearTimeout(interstitialRetryTimeout.current);
                interstitialRetryTimeout.current = setTimeout(() => {
                    intAd.load();
                }, backoffDelay);
            }
        });
        const unsubIntClose = intAd.addAdEventListener(AdEventType.CLOSED, () => {
            setIsInterstitialLoaded(false);
            interstitialRetryCount.current = 0;
            intAd.load();
            if (pendingActionRef.current === 'advance_to_50k') {
                pendingActionRef.current = null;
                setAlternativaEliminada([]);
                setRespostaSelecionada(null);
                setEstadoResposta('aguardando');
                setPerguntaAtual(10);
                animarFade();
                iniciarTimer();
                tocarSom('100000');
            } else {
                pendingActionRef.current = null;
            }
            // Ação que estava esperando o anúncio fechar (ex.: sair da tela de derrota)
            if (aposIntersticialRef.current) {
                const continuar = aposIntersticialRef.current;
                aposIntersticialRef.current = null;
                continuar();
            }
        });
        intAd.load();
        interstitialAdRef.current = intAd;

        // Rewarded
        const rewAd = RewardedAd.createForAdRequest(adUnitRewarded);
        const unsubRewLoad = rewAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setIsRewardedLoaded(true);
            rewardedRetryCount.current = 0;
        });
        const unsubRewError = rewAd.addAdEventListener(AdEventType.ERROR, (error) => {
            setIsRewardedLoaded(false);
            try { analytics().logEvent('ad_load_error', { ad_type: 'rewarded', error: error?.message, code: error?.code }); } catch (e) { }

            if (rewardedRetryCount.current < 4) {
                rewardedRetryCount.current++;
                const backoffDelay = rewardedRetryCount.current === 1 ? 5000 : rewardedRetryCount.current === 2 ? 15000 : 30000;
                if (rewardedRetryTimeout.current) clearTimeout(rewardedRetryTimeout.current);
                rewardedRetryTimeout.current = setTimeout(() => {
                    rewAd.load();
                }, backoffDelay);
            }
        });
        const unsubRewEarn = rewAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
            handleRewardEarned();
        });
        const unsubRewClose = rewAd.addAdEventListener(AdEventType.CLOSED, () => {
            setIsRewardedLoaded(false);
            rewardedRetryCount.current = 0;
            rewAd.load();

            // Checks if a help action is pending to be automatically triggered
            if (pendingAutoHelpRef.current) {
                setAutoTriggerHelp(pendingAutoHelpRef.current);
                pendingAutoHelpRef.current = null;
            }
            // Segunda chance: continua a partida se o vídeo foi assistido até o fim; senão, encerra
            if (pendingActionRef.current?.type === 'segunda_chance' && aposSegundaChanceRef.current) {
                const ganhou = segundaChanceGanhaRef.current;
                segundaChanceGanhaRef.current = false;
                const continuar = aposSegundaChanceRef.current;
                setTimeout(() => continuar(ganhou), 300);
            }
            pendingActionRef.current = null;
        });
        rewAd.load();
        rewardedAdRef.current = rewAd;

        return () => {
            unsubIntLoad(); unsubIntError(); unsubIntClose();
            unsubRewLoad(); unsubRewError(); unsubRewEarn(); unsubRewClose();
            if (interstitialRetryTimeout.current) clearTimeout(interstitialRetryTimeout.current);
            if (rewardedRetryTimeout.current) clearTimeout(rewardedRetryTimeout.current);
        };
    }, []);

    const handleRewardEarned = () => {
        const action = pendingActionRef.current;
        if (!action) return;

        if (action.type === 'money') {
            setDinheiro(d => {
                const novo = d + 200000;
                AsyncStorage.setItem('dinheiro', String(novo));
                return novo;
            });
        } else if (action.type === 'stadium') {
            setEstadiosComprados(est => {
                if (!est.includes(action.id)) {
                    const novos = [...est, action.id];
                    AsyncStorage.setItem('estadiosComprados', JSON.stringify(novos));
                    return novos;
                }
                return est;
            });
        } else if (action.type === 'help') {
            // Em vez de só registrar a compra, registramos para disparar no fechamento
            pendingAutoHelpRef.current = action.id;
            setAdHelpUsed(prev => ({ ...prev, [action.id]: true }));
            if (action.id === 'driblar') {
                setQtdDriblar(q => q + 1);
            } else {
                setAjudasDisponiveis(a => [...a, action.id]);
            }
        } else if (action.type === 'segunda_chance') {
            // A partida continua quando o anúncio fechar (listener de CLOSED)
            segundaChanceGanhaRef.current = true;
        } else if (action.type === 'dobrar_premio') {
            // O prêmio já foi creditado no fim da partida: somar de novo = dobrar
            setDinheiro(d => {
                const novo = d + action.valor;
                AsyncStorage.setItem('dinheiro', String(novo));
                return novo;
            });
            setPremioDobrado(true);
            try { analytics().logEvent('prize_doubled', { valor: action.valor }); } catch (e) { }
        }
    };

    const DELAY_FECHAR_MODAL_ANTES_DO_ANUNCIO = 350; // ms — tempo pra animação do Modal nativo sumir de fato

    const showRewardedAdAposFecharModal = (action: any) => {
        setTimeout(() => {
            showRewardedAd(action);
        }, DELAY_FECHAR_MODAL_ANTES_DO_ANUNCIO);
    };

    const showRewardedAd = (action: any) => {
        if (isRewardedLoaded && rewardedAdRef.current) {
            pendingActionRef.current = action;
            try { analytics().logEvent('ad_show', { ad_type: 'rewarded', local: action.id ? `${action.type}_${action.id}` : action.type }); } catch (e) { }
            rewardedAdRef.current.show().catch(() => {
                pendingActionRef.current = null;
                if (action.type === 'segunda_chance') setEstadoJogo('fim_derrota');
            });
        } else {
            alert('Anúncio não está disponível no momento. Tentando recarregar, aguarde alguns segundos.');
            rewardedAdRef.current?.load();
            // Sem vídeo, a segunda chance não acontece: a partida termina normalmente
            if (action.type === 'segunda_chance') setEstadoJogo('fim_derrota');
        }
    };

    // Effect for triggering help automatically after ad closed
    useEffect(() => {
        if (autoTriggerHelp) {
            const id = autoTriggerHelp;
            setAutoTriggerHelp(null);

            // Slight delay gives React Native time to unmount modals gracefully
            setTimeout(() => {
                confirmarAjuda(id);
            }, 300);
        }
    }, [autoTriggerHelp]);

    // =========================================================================
    // BOTÃO VOLTAR NATIVO (ANDROID)
    // =========================================================================
    useEffect(() => {
        const backAction = () => {
            if (modalConfirmAdStadium || modalConfirmAdHelp || modalConfirmAdMoney) {
                setModalConfirmAdStadium(null);
                setModalConfirmAdHelp(null);
                setModalConfirmAdMoney(false);
                return true;
            }
            if (modalModosVisivel) {
                setModalModosVisivel(false);
                return true;
            }
            if (tela === 'loja_estadios' || tela === 'loja_arbitragem') {
                setTela('home');
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [tela, modalModosVisivel, modalConfirmAdStadium, modalConfirmAdHelp, modalConfirmAdMoney]);


    useEffect(() => {
        carregarDados();
    }, []);

    useEffect(() => {
        audioEnabledRef.current = audioEnabled;
    }, [audioEnabled]);

    const carregarDados = async () => {
        try {
            const d = await AsyncStorage.getItem('dinheiro');
            if (d) setDinheiro(Number(d));
            const jj = await AsyncStorage.getItem('jogosJogados');
            if (jj) setJogosJogados(Number(jj));

            // 1ª sessão: sem intersticial de derrota (quem já tinha jogado antes da atualização não conta como novo)
            const sessoes = Number((await AsyncStorage.getItem('sessoes')) || '0') + 1;
            await AsyncStorage.setItem('sessoes', String(sessoes));
            primeiraSessaoRef.current = sessoes === 1 && !(Number(jj) > 0);

            // Presente diário: cresce enquanto a pessoa volta em dias seguidos
            const ultimoPresente = await AsyncStorage.getItem('presenteUltimoDia');
            if (ultimoPresente !== hojeStr()) {
                const sequencia = Number((await AsyncStorage.getItem('presenteSequencia')) || '0');
                const dia = ultimoPresente === ontemStr() ? sequencia + 1 : 1;
                setPresenteDisponivel({ dia, valor: PRESENTE_DIARIO_BASE * Math.min(dia, PRESENTE_DIARIO_MAX_DIAS) });
            }
            setPerguntaDiaRespondida((await AsyncStorage.getItem('perguntaDiaData')) === hojeStr());

            const m = await AsyncStorage.getItem('modosSelecionados');
            if (m) setModosSelecionados(JSON.parse(m));
            const ec = await AsyncStorage.getItem('estadiosComprados');
            if (ec) setEstadiosComprados(JSON.parse(ec));
            const es = await AsyncStorage.getItem('estadioSelecionado');
            if (es) setEstadioSelecionado(es);
            const arb = await AsyncStorage.getItem('comprasArbitragem');
            if (arb) setComprasArbitragem(JSON.parse(arb));
            const aud = await AsyncStorage.getItem('audioEnabled');
            if (aud !== null) setAudioEnabled(aud === 'true');
            const chef = await AsyncStorage.getItem('chefaoVisto');
            if (chef === 'true') setChefaoVisto(true);
        } catch (_) { }
    };

    // Música de Background
    const backgroundMusicRef = useRef<any>(null);

    useEffect(() => {
        const controleIntro = async () => {
            if (!audioEnabled) {
                if (backgroundMusicRef.current) {
                    try {
                        backgroundMusicRef.current.pause();
                        backgroundMusicRef.current.remove();
                    } catch (e) { }
                    backgroundMusicRef.current = null;
                }
                return;
            }

            if (tela === 'home' || tela === 'loja_estadios' || tela === 'loja_arbitragem') {
                if (!backgroundMusicRef.current) {
                    try {
                        const { createAudioPlayer } = await import('expo-audio');
                        const player = createAudioPlayer(SONS['intro']);
                        backgroundMusicRef.current = player;
                        player.loop = true;
                        player.play();
                    } catch (e) { }
                } else {
                    try {
                        backgroundMusicRef.current.play();
                    } catch (e) { }
                }
            } else {
                if (backgroundMusicRef.current) {
                    try {
                        backgroundMusicRef.current.pause();
                        backgroundMusicRef.current.remove();
                        backgroundMusicRef.current = null;
                    } catch (e) { }
                }
            }
        };

        controleIntro();
    }, [tela, audioEnabled]);

    // Referência para interromper soms de desistência
    const pararSoundRef = useRef<any>(null);

    const pararSomAtivo = async () => {
        if (pararSoundRef.current) {
            try {
                pararSoundRef.current.pause();
                pararSoundRef.current.remove();
            } catch (_) { }
            pararSoundRef.current = null;
        }
    };

    const tocarSomParar = async () => {
        await pararSomAtivo();
        try {
            const { createAudioPlayer } = await import('expo-audio');
            const player = createAudioPlayer(SONS['parar']);
            pararSoundRef.current = player;
            player.play();
        } catch (_) { }
    };

    const salvarDados = async (novoD: number, novasComprasArb?: string[]) => {
        try {
            await AsyncStorage.setItem('dinheiro', String(novoD));
            await AsyncStorage.setItem('modosSelecionados', JSON.stringify(modosSelecionados));
            await AsyncStorage.setItem('estadiosComprados', JSON.stringify(estadiosComprados));
            await AsyncStorage.setItem('estadioSelecionado', estadioSelecionado);
            if (novasComprasArb !== undefined) {
                await AsyncStorage.setItem('comprasArbitragem', JSON.stringify(novasComprasArb));
            }
        } catch (_) { }
    };

    // =========================================================================
    // SISTEMA DE ÁUDIO (INTERRUPÇÃO DIRETA)
    // =========================================================================
    const tocarSom = async (somKey: keyof typeof SONS) => {
        if (!audioEnabledRef.current || !SONS[somKey]) return;

        // Interrompe imediatamente qualquer som do jogo que esteja tocando antes de iniciar o próximo
        if (currentSoundRef.current) {
            try {
                currentSoundRef.current.pause();
                currentSoundRef.current.remove();
            } catch (e) { }
            currentSoundRef.current = null;
        }

        try {
            const { createAudioPlayer } = await import('expo-audio');
            const player = createAudioPlayer(SONS[somKey]);
            currentSoundRef.current = player;
            player.play();
        } catch (e) {
            console.log("Aviso: Falha ao reproduzir áudio.", e);
        }
    };

    // =========================================================================
    // RETENÇÃO DIÁRIA: PRESENTE E PERGUNTA DO DIA
    // =========================================================================
    const receberPresente = () => {
        if (!presenteDisponivel) return;
        const { dia, valor } = presenteDisponivel;
        setPresenteDisponivel(null);
        setDinheiro(d => {
            const novo = d + valor;
            AsyncStorage.setItem('dinheiro', String(novo));
            return novo;
        });
        AsyncStorage.setItem('presenteUltimoDia', hojeStr());
        AsyncStorage.setItem('presenteSequencia', String(dia));
        tocarSom('grana');
        try { analytics().logEvent('daily_gift_claimed', { dia, valor }); } catch (e) { }
    };

    const responderPerguntaDia = (idx: number) => {
        const pd = perguntaDoDia();
        if (!pd || respostaPerguntaDia !== null) return;
        setRespostaPerguntaDia(idx);
        setPerguntaDiaRespondida(true);
        AsyncStorage.setItem('perguntaDiaData', hojeStr());
        const acertou = idx === pd.correta;
        if (acertou) {
            setDinheiro(d => {
                const novo = d + PREMIO_PERGUNTA_DO_DIA;
                AsyncStorage.setItem('dinheiro', String(novo));
                return novo;
            });
            tocarSom('gol');
        } else {
            tocarSom('errou');
        }
        try { analytics().logEvent('daily_question_answered', { acertou }); } catch (e) { }
    };

    const fecharPerguntaDia = () => {
        setModalPerguntaDia(false);
        setRespostaPerguntaDia(null);
    };

    const toggleAudio = () => {
        const newVal = !audioEnabled;
        setAudioEnabled(newVal);
        AsyncStorage.setItem('audioEnabled', String(newVal));
    };

    const animarFade = () => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    };

    // =========================================================================
    // SISTEMA DE TEMPO COM USEEFFECT ROBUSTO (CORREÇÃO DE BUG DE STATE NO INTERVAL)
    // =========================================================================
    const iniciarTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current as any);
        setTempo(45);
        timerRef.current = setInterval(() => {
            setTempo(t => t > 0 ? t - 1 : 0);
        }, 1000) as any;
    };

    const pararTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current as any);
    };

    // Fica assistindo o valor do tempo diminuir. Quando chegar a 0 limpo, aciona
    // a derrota de forma completamente separada do atualizador de estado.
    useEffect(() => {
        if (tempo === 0 && estadoResposta === 'aguardando' && estadoJogo === 'jogando') {
            if (timerRef.current) clearInterval(timerRef.current as any);
            lidarTempoEsgotado();
        }
    }, [tempo, estadoResposta, estadoJogo]);

    const calcularPremioErrar = (idx: number): number => {
        if (idx === 0) return 0;
        if (idx === 15) return 0; // Se errar no milhão perde tudo!
        return PREMIOS[idx - 1] / 2; // Errou, leva metade do que ia ganhar se parasse
    };

    const lidarTempoEsgotado = () => {
        if (estadoResposta !== 'aguardando') return;
        setEstadoResposta('tempo_esgotado');
        const garantido = calcularPremioErrar(perguntaAtual);
        setPremioGanho(garantido);

        // FECHAR QUALQUER MODAL ABERTO À FORÇA PARA NÃO TRAVAR O FIM DO JOGO
        setModalAjudaConfirm(null);
        setModalConfirmAdHelp(null);
        setModalTorcidaVisivel(false);
        setModalCartoesVisivel(false);
        setModalVarVisivel(false);

        setTimeout(() => oferecerSegundaChance(), 2000);
    };

    // Ao errar (ou acabar o tempo), oferece 1 vez por partida continuar assistindo a um vídeo
    const oferecerSegundaChance = () => {
        if (!segundaChanceUsadaRef.current && isRewardedLoaded) {
            setModalSegundaChance(true);
            try { analytics().logEvent('second_chance_offered', { pergunta: perguntaAtual }); } catch (e) { }
        } else {
            setEstadoJogo('fim_derrota');
        }
    };

    const recusarSegundaChance = () => {
        setModalSegundaChance(false);
        setEstadoJogo('fim_derrota');
    };

    const aceitarSegundaChance = () => {
        setModalSegundaChance(false);
        segundaChanceUsadaRef.current = true;
        showRewardedAdAposFecharModal({ type: 'segunda_chance' });
    };

    const toggleModo = (id: string) => {
        setModosSelecionados(prev => {
            if (id === 'escudos') {
                if (prev.includes('escudos')) return prev;
                return ['escudos'];
            }
            const semEscudos = prev.filter(m => m !== 'escudos');
            if (semEscudos.includes(id)) {
                if (semEscudos.length === 1) return semEscudos;
                return semEscudos.filter(m => m !== id);
            }
            return [...semEscudos, id];
        });
    };

    const iniciarJogo = () => {
        const lista = gerarListaPerguntas(modosSelecionados.length > 0 ? modosSelecionados : ['mix']);
        setPerguntas(lista);
        setPerguntaAtual(0);
        setEstadoJogo('jogando');
        setEstadoResposta('aguardando');
        setAlternativaEliminada([]);
        setRespostaSelecionada(null);
        setPremioGanho(0);
        setTempo(45);
        setPerguntasPuladas([]);

        // Segunda chance e prêmio em dobro valem uma vez por partida
        segundaChanceUsadaRef.current = false;
        segundaChanceGanhaRef.current = false;
        avaliacaoNestaPartidaRef.current = false;
        setModalSegundaChance(false);
        setPremioDobrado(false);

        // Resetar o controle de ads usados nas ajudas
        setAdHelpUsed({
            cartoes: false,
            driblar: false,
            torcedores: false
        });

        // Mesclar as ajudas padrão com as compradas na Loja da Arbitragem
        const ajudasBase = ['var', 'torcedores', 'cartoes'];
        const comprasVarTorcidaCartoes = comprasArbitragem.filter(a => a !== 'driblar');
        const comprasDribles = comprasArbitragem.filter(a => a === 'driblar').length;

        setAjudasDisponiveis([...ajudasBase, ...comprasVarTorcidaCartoes]);
        setQtdDriblar(2 + comprasDribles);

        setComprasArbitragem([]);
        salvarDados(dinheiro, []);

        setConfirmaAnswer(null);
        setConfirmarParar(false);
        setErroAtual(null);
        setModalAjudaConfirm(null);
        setModalVarVisivel(false);
        setModalTorcidaVisivel(false);
        setModalCartoesVisivel(false);
        setCartoesOpcoes([]);
        setCartaoRevelado(null);
        setModalMilhaoVisivel(false);
        setModalConfirmAdStadium(null);
        setModalConfirmAdHelp(null);
        setModalConfirmAdMoney(false);

        setTela('jogo');
        setModalModosVisivel(false);

        setShowStartScreen(true);
        tocarSom('apito');

        setTimeout(() => {
            setShowStartScreen(false);
            animarFade();
            iniciarTimer();
            tocarSom('1000');
        }, 2000);
    };

    const responder = (idx: number) => {
        if (estadoResposta !== 'aguardando') return;
        pararTimer();
        setConfirmaAnswer(idx);
    };

    const efetivarResposta = (idx: number) => {
        const pq = perguntas[perguntaAtual];
        setRespostaSelecionada(idx);

        if (idx === pq.correta) {
            setEstadoResposta('correta');
            animarGol();
            setTimeout(() => avancar(), 2000);
        } else {
            setEstadoResposta('errada');
            const garantido = calcularPremioErrar(perguntaAtual);
            setPremioGanho(garantido);

            const possiveisErros = [
                { tipo: 'trave', msg: 'Na Trave!' },
                { tipo: 'pra_fora', msg: 'Pra Fora!' }
            ];
            const erroSorteado = possiveisErros[Math.floor(Math.random() * possiveisErros.length)];

            animarErro(erroSorteado);

            setTimeout(() => {
                oferecerSegundaChance();
            }, 3000);
        }
    };

    const animarGol = () => {
        setShowGolAnim(true);
        setFaseGol(0);
        scaleTextAnim.setValue(0);
        shakeAnim.setValue(0);

        tocarSom('gol');

        setTimeout(() => {
            setFaseGol(1);
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
            ]).start();

            Animated.spring(scaleTextAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true
            }).start();
        }, 400);

        setTimeout(() => setShowGolAnim(false), 2000);
    };

    const [showErroAnim, setShowErroAnim] = useState(false);

    const animarErro = (erroSorteado: { tipo: string, msg: string }) => {
        setErroAtual(erroSorteado);
        setShowErroAnim(true);
        setFaseGol(0);
        scaleTextAnim.setValue(0);
        shakeAnim.setValue(0);

        tocarSom('errou');

        setTimeout(() => {
            setFaseGol(1);
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
            ]).start();

            Animated.spring(scaleTextAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true
            }).start();
        }, 400);

        setTimeout(() => setShowErroAnim(false), 2000);
    };

    const comprarEstadio = (chave: string, preco: number) => {
        if (estadiosComprados.includes(chave)) return;
        if (dinheiro >= preco) {
            const novoDinheiro = dinheiro - preco;
            const novosEstadios = [...estadiosComprados, chave];
            setDinheiro(novoDinheiro);
            setEstadiosComprados(novosEstadios);
            salvarDados(novoDinheiro);
        } else {
            alert('Saldo insuficiente!');
        }
    };

    const selecionarEstadio = (chave: string) => {
        // Adicionado o "|| hasUnlockedStadiums"
        if (estadiosComprados.includes(chave) || hasUnlockedStadiums) {
            setEstadioSelecionado(chave);
            AsyncStorage.setItem('estadioSelecionado', chave);
        }
    };

    const comprarArbitragem = (idAjuda: string, preco: number) => {
        if (dinheiro >= preco) {
            const novoDinheiro = dinheiro - preco;
            const novasCompras = [...comprasArbitragem, idAjuda];
            setDinheiro(novoDinheiro);
            setComprasArbitragem(novasCompras);
            salvarDados(novoDinheiro, novasCompras);
        } else {
            alert('Saldo insuficiente!');
        }
    };

    const triggerVictory = () => {
        setPremioGanho(1000000);
        setEstadoJogo('fim_vitoria');
    };

    const avancar = () => {
        const proxima = perguntaAtual + 1;
        if (proxima >= 16) {
            triggerVictory();
        } else if (proxima === 15) {
            setModalMilhaoVisivel(true);
        } else if (proxima === 10 && !hasRemovedAds) {
            if (isInterstitialLoaded && interstitialAdRef.current) {
                // Intersticial ao acertar a pergunta de 50k (avançando para 100k)
                pendingActionRef.current = 'advance_to_50k';
                ultimoIntersticialRef.current = Date.now();
                try { analytics().logEvent('ad_show', { ad_type: 'interstitial', local: 'pergunta_10' }); } catch (e) { }
                interstitialAdRef.current.show();
            } else {
                try { analytics().logEvent('ad_skipped_not_loaded', { ad_type: 'interstitial' }); } catch (e) { }
                setAlternativaEliminada([]);
                setRespostaSelecionada(null);
                setEstadoResposta('aguardando');
                setPerguntaAtual(proxima);
                animarFade();
                iniciarTimer();
                tocarSom(String(PREMIOS[proxima]) as keyof typeof SONS);
            }
        } else {
            if (proxima === 8 && !hasRemovedAds && !isInterstitialLoaded) {
                interstitialAdRef.current?.load();
            }
            setAlternativaEliminada([]);
            setRespostaSelecionada(null);
            setEstadoResposta('aguardando');
            setPerguntaAtual(proxima);
            animarFade();
            iniciarTimer();
            tocarSom(String(PREMIOS[proxima]) as keyof typeof SONS);
        }
    };

    const desistir = () => {
        pararTimer();
        const premioParar = perguntaAtual > 0 ? PREMIOS[perguntaAtual - 1] : 0;
        setPremioGanho(premioParar);
        setEstadoJogo('fim_desistencia');
    };

    const finalizarJogo = (premioFinal: number) => {
        const novoTotal = dinheiro + premioFinal;
        setDinheiro(novoTotal);
        salvarDados(novoTotal);

        const novoTotalJogos = jogosJogados + 1;
        setJogosJogados(novoTotalJogos);
        AsyncStorage.setItem('jogosJogados', String(novoTotalJogos));

        // Pedido de avaliação (In-App Review do Google Play) a cada PARTIDAS_POR_AVALIACAO partidas,
        // direto, sem pergunta antes. O Google limita sozinho quantas vezes a janela aparece.
        if (novoTotalJogos % PARTIDAS_POR_AVALIACAO === 0) {
            avaliacaoNestaPartidaRef.current = true; // nessa partida não mostramos intersticial na saída
            // Um pequeno delay para não conflitar com a animação/som da tela de fim de jogo
            setTimeout(async () => {
                try {
                    if (await StoreReview.hasAction()) {
                        try { analytics().logEvent('review_requested', { partidas: novoTotalJogos }); } catch (e) { }
                        await StoreReview.requestReview();
                    }
                } catch (e) { }
            }, 1500);
        }
    };

    // Sai da tela de fim de partida. Depois de uma derrota pode vir o intersticial: a cada
    // DERROTAS_POR_INTERSTICIAL derrotas, com intervalo mínimo e nunca na 1ª sessão do jogador.
    const sairDoFimDeJogo = (acao: () => void) => {
        pararSomAtivo();
        const podeMostrar = estadoJogo === 'fim_derrota'
            && !hasRemovedAds
            && isInterstitialLoaded
            && !!interstitialAdRef.current
            && !primeiraSessaoRef.current
            && !avaliacaoNestaPartidaRef.current
            && derrotasDesdeAnuncioRef.current >= DERROTAS_POR_INTERSTICIAL
            && Date.now() - ultimoIntersticialRef.current >= INTERSTICIAL_INTERVALO_MS;
        if (!podeMostrar || !interstitialAdRef.current) {
            acao();
            return;
        }
        derrotasDesdeAnuncioRef.current = 0;
        ultimoIntersticialRef.current = Date.now();
        aposIntersticialRef.current = acao;
        try { analytics().logEvent('ad_show', { ad_type: 'interstitial', local: 'derrota' }); } catch (e) { }
        interstitialAdRef.current.show().catch(() => {
            // Se o anúncio não abrir, segue normalmente
            aposIntersticialRef.current = null;
            acao();
        });
    };

    // --- COMPARTILHAR RESULTADO ("Desafiar um amigo"): imagem do resultado + texto com link da loja ---
    const premioFinalExibido = premioDobrado ? premioGanho * 2 : premioGanho;

    const compartilharResultado = async () => {
        let uri = '';
        try {
            setCapturandoResultado(true);
            await new Promise((r) => setTimeout(r, 120));          // espera a marca aparecer antes da captura
            uri = await captureRef(resultadoRef, { format: 'png', quality: 0.95, result: 'tmpfile' });
        } catch (e) {
            Alert.alert('Ops', 'Não foi possível gerar a imagem agora.');
            return;
        } finally {
            setCapturandoResultado(false);
        }
        const texto = estadoJogo === 'fim_vitoria'
            ? `Fiquei MILIONÁRIO no Jogo do Milhão do Futebol! 🏆⚽ Duvido você conseguir: ${LINK_COMPARTILHAR}`
            : `Cheguei a $ ${formatarPremio(premioFinalExibido)} no Jogo do Milhão do Futebol! ⚽ Duvido você ir mais longe: ${LINK_COMPARTILHAR}`;
        try {
            const resultado = await Share.open({ url: uri.startsWith('file://') ? uri : `file://${uri}`, type: 'image/png', message: texto, failOnCancel: false });
            if (resultado?.dismissedAction) return;
            try { analytics().logEvent('share_result', { premio: premioFinalExibido, resultado: estadoJogo }); } catch (e) { }
        } catch (e) {
            // Sem imagem, ao menos o texto com o link
            try { await Share.open({ message: texto, failOnCancel: false }); } catch (e2) { }
        }
    };

    useEffect(() => {
        const processarFimDeJogo = async () => {
            if (estadoJogo === 'fim_vitoria') {
                finalizarJogo(premioGanho);
                tocarSom('parabens');
                tocarSom('grana');
                // 👇 EVENTO DE VITÓRIA (O jogador chegou ao milhão)
                try { await analytics().logEvent('game_victory', { premio: premioGanho }); } catch (e) { }

            } else if (estadoJogo === 'fim_derrota' || estadoJogo === 'fim_desistencia') {
                finalizarJogo(premioGanho);

                if (estadoJogo === 'fim_desistencia') {
                    tocarSom('grana');
                    // 👇 EVENTO DE DESISTÊNCIA (O jogador clicou em "PARAR")
                    try { await analytics().logEvent('game_player_quit', { pergunta_parou: perguntaAtual }); } catch (e) { }

                } else {
                    tocarSom('grana');
                    derrotasDesdeAnuncioRef.current += 1;
                    // 👇 EVENTO DE DERROTA (O jogador errou a questão ou o tempo acabou)
                    try {
                        await analytics().logEvent('game_defeat', {
                            pergunta_parou: perguntaAtual,
                            motivo: estadoResposta // Aqui envia se foi 'errada' ou 'tempo_esgotado'
                        });
                    } catch (e) { }
                }
            }

        };

        if (estadoJogo !== 'jogando') {
            processarFimDeJogo();
        }
    }, [estadoJogo]);

    const usarAjuda = (id: string) => {
        const contagem = id === 'driblar' ? qtdDriblar : ajudasDisponiveis.filter(a => a === id).length;
        if (contagem <= 0) return;
        pararTimer(); // Pausa o tempo enquanto decide se quer usar ou não
        setModalAjudaConfirm(id);
    };

    const solicitarAdAjuda = (id: string) => {
        if (id === 'var') return; // VAR não tem anuncio
        pararTimer(); // Pausa o tempo enquanto pede confirmação do AD
        setModalConfirmAdHelp(id);
    }

    // Troca a pergunta atual por outra do mesmo nível (usado no "Driblar" e na segunda chance)
    const substituirPerguntaAtual = () => {
        // Registra a pergunta atual como pulada
        setPerguntasPuladas(prevPuladas => [...prevPuladas, perguntas[perguntaAtual].id]);

        setPerguntas(prev => {
            const novas = [...prev];
            const pq = novas[perguntaAtual];
            if (!pq) return prev;

            const nivel = DIFICULDADE_POR_PERGUNTA[perguntaAtual];
            const usadosIds = novas.map(p => p.id);

            // Junta as perguntas da rodada atual com todas as que já foram puladas no jogo
            const todosUsados = [...usadosIds, ...perguntasPuladas, pq.id];

            const apenasEscudos = modosSelecionados.includes('escudos');
            const modosEfetivos = apenasEscudos ? ['brasileiro', 'europeu', 'copa', 'mix'] : modosSelecionados;

            // Aqui substituímos "!usadosIds.includes(p.id)" por "!todosUsados.includes(p.id)"
            let pool = PERGUNTAS_DB[nivel].filter((p: any) =>
                p.modo.some((m: string) => modosEfetivos.includes(m)) &&
                !todosUsados.includes(p.id) &&
                (!apenasEscudos || p.tipo === 'escudo')
            );

            if (pool.length === 0) {
                pool = PERGUNTAS_DB[nivel].filter((p: any) =>
                    !todosUsados.includes(p.id) &&
                    (!apenasEscudos || p.tipo === 'escudo')
                );
            }

            if (pool.length === 0 && apenasEscudos) {
                for (const nivel2 of Object.keys(PERGUNTAS_DB)) {
                    const extra = PERGUNTAS_DB[nivel2].filter((p: any) => p.tipo === 'escudo' && !todosUsados.includes(p.id));
                    if (extra.length > 0) { pool = extra; break; }
                }
            }

            if (pool.length > 0) {
                const novaPergunta = pool[Math.floor(Math.random() * pool.length)];
                novas[perguntaAtual] = novaPergunta;
            }
            return novas;
        });
    };

    // Depois do vídeo da segunda chance: continua com uma nova pergunta do mesmo valor ou encerra.
    // Reatribuído a cada render para o listener do anúncio sempre usar o estado atual da partida.
    aposSegundaChanceRef.current = (ganhou: boolean) => {
        if (!ganhou) {
            setEstadoJogo('fim_derrota');
            return;
        }
        try { analytics().logEvent('second_chance_used', { pergunta: perguntaAtual }); } catch (e) { }
        substituirPerguntaAtual();
        setPremioGanho(0);
        setErroAtual(null);
        setConfirmaAnswer(null);
        setAlternativaEliminada([]);
        setRespostaSelecionada(null);
        setEstadoResposta('aguardando');
        animarFade();
        iniciarTimer();
        tocarSom(String(PREMIOS[perguntaAtual]) as keyof typeof SONS);
    };

    const confirmarAjuda = (id: string) => {
        setModalAjudaConfirm(null);
        tocarSom(id as keyof typeof SONS);

        if (id === 'driblar') {
            setQtdDriblar(q => Math.max(0, q - 1));
            substituirPerguntaAtual();

            setAlternativaEliminada([]);
            setRespostaSelecionada(null);
            setEstadoResposta('aguardando');
            iniciarTimer();
        }
        if (id === 'cartoes' || id === 'var' || id === 'torcedores') {
            setAjudasDisponiveis(prev => {
                const index = prev.indexOf(id);
                if (index !== -1) {
                    const newArr = [...prev];
                    newArr.splice(index, 1);
                    return newArr;
                }
                return prev;
            });

            if (id === 'cartoes') {
                setCartaoRevelado(null);
                setModalCartoesVisivel(true);
                iniciarTimer(); // O tempo flui normal enquanto usa o cartão
            }
            if (id === 'var') {
                setModalVarVisivel(true);
                varScanX.setValue(-300);
                Animated.timing(varScanX, { toValue: 0, duration: 800, useNativeDriver: true }).start();
                iniciarTimer(); // O tempo flui normal
            }
            if (id === 'torcedores') {
                const pq = perguntas[perguntaAtual];
                const errar = Math.random() < 0.25; // 25% de chance de erro

                let baseVotos = [0, 0, 0, 0];

                if (!errar) {
                    // Torcida vai acertar. Colocamos o certo entre 35 e 65.
                    baseVotos[pq.correta] = 35 + Math.floor(Math.random() * 31);
                    const wrongIndexes = [0, 1, 2, 3].filter(x => x !== pq.correta);
                    baseVotos[wrongIndexes[0]] = 15 + Math.floor(Math.random() * 15);
                    baseVotos[wrongIndexes[1]] = 5 + Math.floor(Math.random() * 15);
                    baseVotos[wrongIndexes[2]] = 5 + Math.floor(Math.random() * 10);
                } else {
                    // Torcida vai errar por margem mínima da verdadeira certa.
                    const wrongIndexes = embaralharArray([0, 1, 2, 3].filter(x => x !== pq.correta));
                    const chosenWrong = wrongIndexes[0];

                    baseVotos[chosenWrong] = 35 + Math.floor(Math.random() * 10); // Lidera com 35 a 44
                    baseVotos[pq.correta] = baseVotos[chosenWrong] - (2 + Math.floor(Math.random() * 5)); // Fica atrás por míseros 2 a 6%

                    const remaining = 100 - baseVotos[chosenWrong] - baseVotos[pq.correta];
                    baseVotos[wrongIndexes[1]] = Math.floor(remaining * 0.6);
                    baseVotos[wrongIndexes[2]] = remaining - baseVotos[wrongIndexes[1]];
                }

                // Normaliza com rigor absoluto
                const total = baseVotos.reduce((a, b) => a + b, 0);
                const normalizados = baseVotos.map(v => Math.round((v / total) * 100));

                // Distribui restinho pro garantido dar 100% cravado
                const diff = 100 - normalizados.reduce((a, b) => a + b, 0);
                normalizados[pq.correta] += diff;

                setTorcidaVotos(normalizados);
                setModalTorcidaVisivel(true);
                iniciarTimer(); // O tempo flui normal enquanto visualiza a torcida
            }
        }
    };

    const aceitarMilhao = () => {
        setModalMilhaoVisivel(false);
        setAlternativaEliminada([]);
        setRespostaSelecionada(null);
        setEstadoResposta('aguardando');
        setPerguntaAtual(15);
        animarFade();
        iniciarTimer();
        tocarSom('1000000');
    };

    const recusarMilhao = () => {
        setModalMilhaoVisivel(false);
        setPremioGanho(500000);
        setEstadoJogo('fim_desistencia');
    };

    // ==========================================================================
    // RENDER: HOME
    // ==========================================================================
    if (tela === 'home') {
        const pdHoje = modalPerguntaDia ? perguntaDoDia() : null;
        return (
            <View style={[s.flex, { backgroundColor: '#0F3830' }]}>
                <StatusBar hidden={true} />
                <LinearGradient colors={['#0F3830', '#0a4232', '#0F3830']} style={s.flex}>
                    <RainAnimation />
                    <SafeAreaView style={s.flex} edges={['top', 'left', 'right']}>
                        <View style={{ flex: 1 }}>
                            {/* Pílula discreta de saldo no canto superior esquerdo */}
                            <View style={{ position: 'absolute', top: Math.max(insets.top, 20), left: 15, zIndex: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 56, 48, 0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COR_ACENTO }}>
                                <Text style={{ fontSize: 14, marginRight: 5 }}>💰</Text>
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>$ {formatarPremio(dinheiro)}</Text>
                            </View>

                            {/* Configurações e Premium no canto superior direito */}
                            <View style={{ position: 'absolute', top: Math.max(insets.top, 20), right: 20, zIndex: 10, alignItems: 'center', gap: 12 }}>
                                <TouchableOpacity onPress={() => setConfigVisivel(true)}>
                                    <Ionicons name="settings-sharp" size={28} color="#FFF" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setPremiumVisivel(true)} style={{ backgroundColor: 'rgba(251,192,45,0.2)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1, borderColor: COR_ACENTO, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons name="diamond-outline" size={16} color={COR_ACENTO} />
                                    <Text style={{ color: COR_ACENTO, fontWeight: 'bold', fontSize: 10 }}>PREMIUM</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={s.homeLayout}>
                                <View style={s.homeCenterWrap}>
                                    {/* Em telas pequenas o logo encolhe um pouco para caber o botão da pergunta do dia */}
                                    <Image source={require('./assets/logo.png')} style={{ width: 340, height: isSmallScreen && !perguntaDiaRespondida ? 170 : 220, marginBottom: isSmallScreen && !perguntaDiaRespondida ? 15 : 30 }} resizeMode="contain" />

                                    <TouchableOpacity style={s.btnModos} onPress={() => setModalModosVisivel(true)}>
                                        <Ionicons name="checkbox-outline" size={24} color="#FFF" />
                                        <Text style={s.btnModosText}>ESCOLHER TEMAS</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[s.btnModos, { backgroundColor: '#1E403C' }]} onPress={() => {
                                        setTela('loja_estadios');
                                        if (!chefaoVisto) {
                                            setChefaoVisto(true);
                                            setModalCartaChefaoVisivel(true);
                                            AsyncStorage.setItem('chefaoVisto', 'true');
                                        }
                                    }}>
                                        <Ionicons name="storefront-outline" size={24} color="#FFF" />
                                        <Text style={s.btnModosText}>LOJA DE ESTÁDIOS</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[s.btnModos, { backgroundColor: '#1E403C' }]} onPress={() => setTela('loja_arbitragem')}>
                                        <MaterialCommunityIcons name="whistle" size={24} color="#FFF" />
                                        <Text style={s.btnModosText}>LOJA DA ARBITRAGEM</Text>
                                    </TouchableOpacity>

                                    {/* Pergunta do dia: some depois de respondida e volta no dia seguinte */}
                                    {!perguntaDiaRespondida && (
                                        <TouchableOpacity style={[s.btnModos, { backgroundColor: '#1E403C', borderWidth: 1, borderColor: COR_ACENTO }]} onPress={() => setModalPerguntaDia(true)}>
                                            <Ionicons name="help-circle-outline" size={24} color={COR_ACENTO} />
                                            <Text style={[s.btnModosText, { color: COR_ACENTO }]}>PERGUNTA DO DIA</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity style={s.btnJogarPremium} onPress={iniciarJogo} activeOpacity={0.8}>
                                        <LinearGradient colors={['#FBC02D', '#F57F17']} style={s.btnJogarPremiumGrad}>
                                            <Text style={s.btnJogarPremiumText}>JOGAR</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Banner de Anúncio na parte inferior da Home (Sem Borda preta em excesso) */}
                        {!hasRemovedAds && (
                            <View style={{ width: '100%', alignItems: 'center', backgroundColor: '#000', paddingBottom: Math.max(insets.bottom, 0) }}>
                                <BannerAd
                                    unitId={adUnitBanner}
                                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                                />
                            </View>
                        )}
                    </SafeAreaView>
                </LinearGradient>

                {/* MODAL CONFIGURAÇÕES */}
                <Modal visible={configVisivel} transparent animationType="fade">
                    <View style={s.fimOverlay}>
                        <View style={s.fimCard}>
                            <Text style={s.fimTitulo}>⚙️ Configurações</Text>

                            {/* Controle de Som */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginVertical: 20, backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#555' }}>
                                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Som do Jogo</Text>
                                <TouchableOpacity onPress={toggleAudio} style={{ backgroundColor: audioEnabled ? COR_ACENTO : '#555', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 }}>
                                    <Text style={{ fontWeight: 'bold', color: audioEnabled ? '#000' : '#FFF' }}>{audioEnabled ? 'LIGADO' : 'DESLIGADO'}</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={s.fimBtnJogarNovamente} onPress={() => setConfigVisivel(false)}>
                                <Text style={s.fimBtnText}>FECHAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* MODAL PREMIUM */}
                <Modal visible={premiumVisivel} transparent animationType="fade">
                    <View style={s.fimOverlay}>
                        <View style={s.fimCard}>
                            <Text style={s.fimTitulo}>💎 Premium</Text>

                            {/* COMPRAS IN APP (RevenueCat) */}
                            {packages.map((pkg) => {
                                const isAds = pkg.product.identifier === 'remover_anuncios';
                                const isStadiums = pkg.product.identifier === 'liberar_estadios';

                                if (isAds && hasRemovedAds) return null;
                                if (isStadiums && hasUnlockedStadiums) return null;
                                if (!isAds && !isStadiums) return null;

                                return (
                                    <View key={pkg.identifier} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#555' }}>
                                        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1 }}>
                                            {isAds ? 'Remover Anúncios' : 'Liberar Estádios'}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => handlePurchase(pkg, isAds ? 'anuncios' : 'estadios')}
                                            disabled={isPurchasing}
                                            style={{ backgroundColor: COR_ACENTO, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 }}
                                        >
                                            <Text style={{ fontWeight: 'bold', color: '#000' }}>
                                                {pkg.product.priceString}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}

                            {/* BOTÃO RESTAURAR COMPRAS */}
                            <TouchableOpacity
                                onPress={handleRestorePurchases}
                                disabled={isPurchasing}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#555', opacity: isPurchasing ? 0.6 : 1 }}
                            >
                                <Ionicons name={isPurchasing ? "hourglass-outline" : "refresh-circle-outline"} size={24} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
                                    {isPurchasing ? 'Restaurando...' : 'Restaurar Compras'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={s.fimBtnJogarNovamente} onPress={() => setPremiumVisivel(false)}>
                                <Text style={s.fimBtnText}>FECHAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* MODAL: MODOS/TEMAS */}
                <Modal visible={modalModosVisivel} transparent animationType="slide">
                    <View style={s.modalOverlay}>
                        <View style={s.modalBox}>
                            <View style={s.modalHeader}>
                                <View>
                                    <Text style={s.modalTitle}>MODOS DE JOGO</Text>
                                    <Text style={{ color: '#FBC02D', fontSize: 12, marginTop: 4 }}>Escolha um ou mais!</Text>
                                </View>
                                <TouchableOpacity onPress={() => setModalModosVisivel(false)}>
                                    <Ionicons name="close" size={28} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={{ width: '100%', maxHeight: 400 }}>
                                {MODOS.map(modo => {
                                    const ativo = modosSelecionados.includes(modo.id);
                                    const isCopa = modo.id === 'copa';
                                    const isEscudos = modo.id === 'escudos';
                                    const escudosAtivo = modosSelecionados.includes('escudos');
                                    // Os modos normais ficam apagados quando 'escudos' está selecionado
                                    const desativado = !isEscudos && escudosAtivo;
                                    return (
                                        <TouchableOpacity
                                            key={modo.id}
                                            style={[
                                                s.modoItem,
                                                ativo && !desativado && s.modoItemAtivo,
                                                isCopa && !desativado && { borderColor: COR_ACENTO, borderWidth: 2, backgroundColor: 'rgba(251,192,45,0.08)' },
                                                isEscudos && { borderColor: '#a78bfa', borderWidth: 2, backgroundColor: ativo ? 'rgba(167,139,250,0.15)' : 'rgba(167,139,250,0.05)' },
                                                desativado && { opacity: 0.35 },
                                            ]}
                                            onPress={() => toggleModo(modo.id)}
                                        >
                                            {(modo as any).image
                                                ? <Image source={(modo as any).image} style={{ width: 28, height: 28, marginRight: 12 }} resizeMode="contain" />
                                                : <Text style={s.modoIcon}>{(modo as any).icon}</Text>
                                            }
                                            <View style={{ flex: 1 }}>
                                                <Text style={[s.modoLabel, isCopa && !desativado && { color: COR_ACENTO }, isEscudos && { color: ativo ? '#a78bfa' : '#c4b5fd' }]}>{modo.label}</Text>
                                                {isCopa && !desativado && <Text style={{ color: COR_ACENTO, fontSize: 10, fontWeight: 'bold' }}>★ DESTAQUE</Text>}
                                                {isEscudos && <Text style={{ color: ativo ? '#a78bfa' : '#8b7ab0', fontSize: 10, fontWeight: 'bold' }}>MODO EXCLUSIVO</Text>}
                                            </View>
                                            <View style={[s.tickBox, ativo && !desativado && s.tickBoxAtivo, isEscudos && ativo && { backgroundColor: '#a78bfa', borderColor: '#a78bfa' }]}>
                                                {ativo && !desativado && <Ionicons name="checkmark" size={18} color="#000" />}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                            <TouchableOpacity style={[s.btnModalOk, { marginBottom: 5 }]} onPress={() => setModalModosVisivel(false)}>
                                <Text style={s.btnModalOkText}>CONFIRMAR</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Banner de Anúncio no Modal de Temas colado ao fundo */}
                        {!hasRemovedAds && (
                            <View style={{ position: 'absolute', bottom: 0, width: '100%', alignItems: 'center', backgroundColor: '#000', paddingBottom: Math.max(insets.bottom, 0), paddingTop: 10 }}>
                                <BannerAd
                                    unitId={adUnitBanner}
                                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                                />
                            </View>
                        )}
                    </View>
                </Modal>

                {/* MODAL: PRESENTE DIÁRIO */}
                <Modal visible={!!presenteDisponivel} transparent animationType="fade" onRequestClose={receberPresente}>
                    <View style={s.fimOverlay}>
                        <View style={s.fimCard}>
                            <Text style={s.fimEmoji}>🎁</Text>
                            <Text style={[s.fimTitulo, { color: COR_ACENTO }]}>PRESENTE DIÁRIO</Text>
                            <Text style={{ color: '#FFF', fontSize: 15, textAlign: 'center', marginBottom: 15 }}>
                                {presenteDisponivel && presenteDisponivel.dia > 1
                                    ? `${presenteDisponivel.dia} dias seguidos! Volte amanhã para ganhar ainda mais.`
                                    : 'Volte todo dia: o presente cresce a cada dia seguido!'}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
                                {Array.from({ length: PRESENTE_DIARIO_MAX_DIAS }).map((_, i) => {
                                    const conquistado = !!presenteDisponivel && i < Math.min(presenteDisponivel.dia, PRESENTE_DIARIO_MAX_DIAS);
                                    return (
                                        <View key={i} style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: conquistado ? COR_ACENTO : 'rgba(255,255,255,0.15)' }}>
                                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: conquistado ? '#000' : '#FFF' }}>{i + 1}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            <Text style={s.fimPremioValor}>+ $ {formatarPremio(presenteDisponivel?.valor ?? 0)}</Text>
                            <TouchableOpacity style={s.fimBtnJogarNovamente} onPress={receberPresente}>
                                <Text style={s.fimBtnText}>RECEBER</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* MODAL: PERGUNTA DO DIA */}
                <Modal visible={modalPerguntaDia} transparent animationType="fade" onRequestClose={fecharPerguntaDia}>
                    <View style={s.fimOverlay}>
                        <View style={[s.fimCard, { maxWidth: 380 }]}>
                            <Text style={[s.fimTitulo, { color: COR_ACENTO }]}>⚽ PERGUNTA DO DIA</Text>
                            <Text style={{ color: '#DDD', fontSize: 13, marginBottom: 15, textAlign: 'center' }}>
                                Acertou, ganhou $ {formatarPremio(PREMIO_PERGUNTA_DO_DIA)}. Uma chance por dia!
                            </Text>
                            <Text style={{ color: '#FFF', fontSize: 17, fontWeight: 'bold', textAlign: 'center', marginBottom: 18 }}>
                                {pdHoje?.pergunta}
                            </Text>
                            <View style={{ width: '100%', gap: 8 }}>
                                {pdHoje?.alternativas.map((alt, i) => {
                                    const respondida = respostaPerguntaDia !== null;
                                    const certa = respondida && i === pdHoje.correta;
                                    const errada = respondida && i === respostaPerguntaDia && i !== pdHoje.correta;
                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            disabled={respondida}
                                            onPress={() => responderPerguntaDia(i)}
                                            style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#555', backgroundColor: certa ? '#2E7D32' : errada ? '#C62828' : 'rgba(0,0,0,0.3)' }}
                                        >
                                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{alt}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            {respostaPerguntaDia !== null && pdHoje && (
                                <Text style={[s.fimRespostaCerta, { marginTop: 15, marginBottom: 0 }]}>
                                    {respostaPerguntaDia === pdHoje.correta
                                        ? `GOLAÇO! + $ ${formatarPremio(PREMIO_PERGUNTA_DO_DIA)}`
                                        : 'Na trave! Volte amanhã para a próxima.'}
                                </Text>
                            )}
                            <TouchableOpacity style={[s.fimBtnJogarNovamente, { marginTop: 20 }]} onPress={fecharPerguntaDia}>
                                <Text style={s.fimBtnText}>{respostaPerguntaDia === null ? 'DEPOIS' : 'FECHAR'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    // ==========================================================================
    // RENDER: LOJA DE ESTÁDIOS
    // ==========================================================================
    if (tela === 'loja_estadios') {
        const ligasFiltro = [
            { id: 'brasileirao', label: 'BRASILEIRÃO' },
            { id: 'premier', label: 'PREMIER LEAGUE' },
            { id: 'laliga', label: 'LA LIGA' },
            { id: 'seriea', label: 'SERIE A' },
            { id: 'bundesliga', label: 'BUNDESLIGA' },
            { id: 'ligue1', label: 'LIGUE 1' },
        ];

        return (
            <View style={s.flex}>
                <StatusBar hidden={true} />
                <LinearGradient colors={['#0F3830', '#0a4232', '#0F3830']} style={s.flex}>
                    <SafeAreaView style={s.flex}>
                        <View style={[s.modalHeader, { padding: 20, paddingBottom: 15 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Text style={s.modalTitle}>🏟️ LOJA DE ESTÁDIOS</Text>
                                <TouchableOpacity
                                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FBC02D' }}
                                    onPress={() => setModalCartaChefaoVisivel(true)}
                                >
                                    <Ionicons name="mail-open-outline" size={18} color="#FBC02D" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => setTela('home')} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Ionicons name="arrow-back" size={24} color="#FBC02D" />
                                <Text style={{ color: '#FBC02D', fontWeight: 'bold' }}>VOLTAR</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ width: '100%', marginBottom: 15 }}>
                            <Image source={require('./assets/chefao.png')} style={{ width: '100%', height: 200, borderBottomWidth: 3, borderColor: '#FBC02D' }} resizeMode="cover" />
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 15 }}>
                                <View style={{ backgroundColor: '#FBC02D', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 }}>
                                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>SALDO: $ {formatarPremio(dinheiro)}</Text>
                                </View>
                                {!hasUnlockedStadiums && (() => {
                                    const stadiumPkg = packages.find((pkg: any) => pkg.product.identifier === 'liberar_estadios');
                                    if (!stadiumPkg) return null;
                                    return (
                                        <TouchableOpacity
                                            style={{ backgroundColor: '#4A148C', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E040FB', flexDirection: 'row', alignItems: 'center', gap: 8 }}
                                            onPress={() => handlePurchase(stadiumPkg, 'estadios')}
                                            disabled={isPurchasing}
                                        >
                                            <Ionicons name="lock-open-outline" size={16} color="#E040FB" />
                                            <Text style={{ color: '#E040FB', fontWeight: 'bold', fontSize: 12 }}>DESBLOQUEAR TODOS ({stadiumPkg.product.priceString})</Text>
                                        </TouchableOpacity>
                                    );
                                })()}
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                                {ligasFiltro.map(liga => (
                                    <TouchableOpacity
                                        key={liga.id}
                                        style={[s.pillFilter, filtroLiga === liga.id && s.pillFilterActive]}
                                        onPress={() => setFiltroLiga(liga.id)}
                                    >
                                        <Text style={[s.pillFilterText, filtroLiga === liga.id && { color: '#000' }]}>{liga.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" style={{ marginLeft: 5 }} />
                        </View>

                        <ScrollView style={{ width: '100%', paddingHorizontal: 20, paddingBottom: 20 }}>
                            {Object.keys(ESTADIOS).map((chave, idx) => {
                                const timeId = chave.replace('estadio_', '');

                                const timesDaLiga = LEAGUE_TEAMS[filtroLiga] || [];
                                if (!timesDaLiga.includes(timeId) && timeId !== 'campo') return null;

                                const comprado = estadiosComprados.includes(chave) || hasUnlockedStadiums;
                                const selecionado = estadioSelecionado === chave;
                                const preco = getEstadioPreco(chave);
                                const nomeFormatado = timeId === 'campo' ? 'ESTÁDIO PADRÃO' : formatTeamName(timeId).toUpperCase();

                                return (
                                    <View key={idx} style={[s.lojaItem, selecionado && s.lojaItemAtivo]}>
                                        <Image source={ESTADIOS[chave]} style={s.lojaThumb} />
                                        <View style={{ flex: 1, marginLeft: 15 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                                <Text style={[s.lojaNome, { marginBottom: 0 }]}>{nomeFormatado}</Text>
                                                {!comprado && <Text style={{ color: '#FBC02D', fontWeight: 'bold', fontSize: 12 }}>$ {formatarPremio(preco)}</Text>}
                                            </View>

                                            {comprado ? (
                                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                                                    <TouchableOpacity
                                                        style={[s.btnComprar, selecionado ? { backgroundColor: '#555' } : {}]}
                                                        onPress={() => selecionarEstadio(chave)}
                                                        disabled={selecionado}
                                                    >
                                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{selecionado ? '✓ USANDO' : 'USAR'}</Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={[s.btnComprar, { backgroundColor: '#4A148C' }]}
                                                        onPress={() => setEstadioVisualizacao(chave)}
                                                    >
                                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>VER</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                                                    <TouchableOpacity style={s.btnComprar} onPress={() => comprarEstadio(chave, preco)}>
                                                        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 12 }}>COMPRAR</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[s.btnComprar, { backgroundColor: '#4A148C', flexDirection: 'row', alignItems: 'center', gap: 5, opacity: isRewardedLoaded ? 1 : 0.5 }]}
                                                        onPress={() => setModalConfirmAdStadium(chave)}
                                                        disabled={!isRewardedLoaded}
                                                    >
                                                        <Ionicons name="play" size={14} color="#FFF" />
                                                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>GRÁTIS</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )
                            })}
                            <View style={{ height: 40 }} />
                        </ScrollView>

                        {/* Modal Confirmar Ad Estádio */}
                        {modalConfirmAdStadium && (
                            <Modal transparent animationType="fade">
                                <View style={s.fimOverlay}>
                                    <View style={s.fimCard}>
                                        <Text style={s.fimTitulo}>Desbloquear Estádio?</Text>
                                        <Text style={{ color: '#FFF', marginBottom: 20, fontSize: 16, textAlign: 'center' }}>
                                            Deseja ver um anúncio para desbloquear este estádio gratuitamente?
                                        </Text>
                                        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                                            <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1, backgroundColor: '#555' }]} onPress={() => setModalConfirmAdStadium(null)}>
                                                <Text style={[s.fimBtnText, { color: '#FFF' }]}>NÃO</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1 }]} onPress={() => {
                                                const idStadium = modalConfirmAdStadium;
                                                setModalConfirmAdStadium(null);
                                                showRewardedAdAposFecharModal({ type: 'stadium', id: idStadium });
                                            }}>
                                                <Text style={s.fimBtnText}>SIM</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        )}

                        {/* Modal da Carta do Chefão */}
                        <Modal visible={modalCartaChefaoVisivel} transparent animationType="fade">
                            <View style={s.fimOverlay}>
                                <View style={s.fimCard}>
                                    <Text style={{ fontSize: 50, marginBottom: 15 }}>✉️</Text>
                                    <Text style={[s.fimTitulo, { marginBottom: 20 }]}>CARTA DO CHEFÃO</Text>
                                    <Text style={{ color: '#FFF', fontSize: 16, fontStyle: 'italic', lineHeight: 24, textAlign: 'center', marginBottom: 25 }}>
                                        "Opa! Tá cheio da grana hein, empresário? Quer desembolsar esse dinheiro todo pra comprar qual estádio pro seu império de futebol?"
                                    </Text>
                                    <TouchableOpacity style={s.fimBtnJogarNovamente} onPress={() => setModalCartaChefaoVisivel(false)}>
                                        <Text style={s.fimBtnText}>FECHAR</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

                        {/* Modal para visualizar o Estádio em Tela Cheia */}
                        <Modal visible={!!estadioVisualizacao} transparent animationType="fade">
                            <View style={{ flex: 1, backgroundColor: '#000' }}>
                                {estadioVisualizacao && (
                                    <Image
                                        source={ESTADIOS[estadioVisualizacao]}
                                        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                                    />
                                )}
                                <TouchableOpacity
                                    style={{ position: 'absolute', top: Math.max(insets.top, 20), right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 25 }}
                                    onPress={() => setEstadioVisualizacao(null)}
                                >
                                    <Ionicons name="close" size={32} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </Modal>

                    </SafeAreaView>
                </LinearGradient>
            </View>
        );
    }

    // ==========================================================================
    // RENDER: LOJA DA ARBITRAGEM
    // ==========================================================================
    if (tela === 'loja_arbitragem') {
        const itensArbitragem = [
            { id: 'cartoes', nome: 'CARTÕES', preco: 100000, img: require('./assets/simbolos/cartoes.png'), desc: 'Elimina 2 alternativas.' },
            { id: 'torcedores', nome: 'AJUDA DA TORCIDA', preco: 200000, img: require('./assets/simbolos/torcida.png'), desc: 'Percentual de palpites.' },
            { id: 'driblar', nome: 'DRIBLES', preco: 200000, img: require('./assets/simbolos/drible.png'), desc: 'Pula a questão sem perder.' },
            { id: 'var', nome: 'USO DO VAR', preco: 500000, img: require('./assets/simbolos/var.png'), desc: 'Dá a resposta correta exata.' },
        ];

        return (
            <View style={s.flex}>
                <StatusBar hidden={true} />
                <LinearGradient colors={['#1A0B2E', '#311042', '#1A0B2E']} style={s.flex}>
                    <SafeAreaView style={s.flex}>
                        <View style={[s.modalHeader, { padding: 20, paddingBottom: 15, borderColor: '#7B1FA2' }]}>
                            <Text style={s.modalTitle}>⚖️ LOJA DA ARBITRAGEM</Text>
                            <TouchableOpacity onPress={() => setTela('home')} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Ionicons name="arrow-back" size={24} color="#E040FB" />
                                <Text style={{ color: '#E040FB', fontWeight: 'bold' }}>VOLTAR</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                            <Text style={{ color: '#FFF', fontSize: 16, textAlign: 'center', lineHeight: 24, fontStyle: 'italic' }}>
                                Compre vantagens extras com o juiz! Elas serão adicionadas ao seu inventário e <Text style={{ color: '#E040FB', fontWeight: 'bold' }}>serão válidas SOMENTE para a PRÓXIMA partida que você jogar.</Text>
                            </Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 10 }}>
                                <View style={{ flex: 1, backgroundColor: '#7B1FA2', paddingVertical: 12, alignItems: 'center', borderRadius: 10 }}>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>SALDO: $ {formatarPremio(dinheiro)}</Text>
                                </View>
                                <TouchableOpacity
                                    style={{ flex: 1, backgroundColor: '#4A148C', paddingVertical: 12, alignItems: 'center', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#E040FB', opacity: isRewardedLoaded ? 1 : 0.5 }}
                                    onPress={() => setModalConfirmAdMoney(true)}
                                    disabled={!isRewardedLoaded}
                                >
                                    <Ionicons name="play-circle" size={20} color="#E040FB" />
                                    <Text style={{ color: '#E040FB', fontWeight: 'bold', fontSize: 14 }}>GANHAR $200K</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView style={{ width: '100%', paddingHorizontal: 20 }}>
                            {itensArbitragem.map(item => {
                                const qtdComprada = comprasArbitragem.filter(a => a === item.id).length;
                                return (
                                    <View key={item.id} style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#7B1FA2', alignItems: 'center' }}>
                                        <View style={{ backgroundColor: '#FFF', borderRadius: 30, padding: 5, marginRight: 15 }}>
                                            <Image source={item.img} style={{ width: 50, height: 50 }} resizeMode="contain" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18, marginBottom: 2 }}>+1 {item.nome}</Text>
                                            <Text style={{ color: '#AAA', fontSize: 12, marginBottom: 10 }}>{item.desc}</Text>
                                            <TouchableOpacity
                                                style={{ backgroundColor: qtdComprada > 0 ? '#555' : '#E040FB', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' }}
                                                onPress={() => comprarArbitragem(item.id, item.preco)}
                                                disabled={qtdComprada > 0}
                                            >
                                                <Text style={{ color: qtdComprada > 0 ? '#AAA' : '#000', fontWeight: 'bold', fontSize: 14 }}>
                                                    {qtdComprada > 0 ? 'COMPRADO' : `COMPRAR ($ ${formatarPremio(item.preco)})`}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        {qtdComprada > 0 && (
                                            <View style={{ backgroundColor: '#000', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E040FB', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ color: '#E040FB', fontSize: 10, fontWeight: 'bold' }}>COMPRADOS</Text>
                                                <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>{qtdComprada}x</Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                            <View style={{ height: 40 }} />
                        </ScrollView>

                        {/* Modal Confirmar Ad Dinheiro */}
                        {modalConfirmAdMoney && (
                            <Modal transparent animationType="fade">
                                <View style={s.fimOverlay}>
                                    <View style={s.fimCard}>
                                        <Text style={s.fimTitulo}>Suborno do VAR?</Text>
                                        <Text style={{ color: '#FFF', marginBottom: 20, fontSize: 16, textAlign: 'center' }}>
                                            Deseja se comunicar com a cabine do VAR para ver um anúncio e ganhar 200 mil reais?
                                        </Text>
                                        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                                            <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1, backgroundColor: '#555' }]} onPress={() => setModalConfirmAdMoney(false)}>
                                                <Text style={[s.fimBtnText, { color: '#FFF' }]}>NÃO</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1 }]} onPress={() => {
                                                setModalConfirmAdMoney(false);
                                                showRewardedAdAposFecharModal({ type: 'money' });
                                            }}>
                                                <Text style={s.fimBtnText}>SIM</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        )}
                    </SafeAreaView>
                </LinearGradient>
            </View>
        );
    }

    // ==========================================================================
    // RENDER: JOGO
    // ==========================================================================
    if (tela === 'jogo') {
        if (showStartScreen) {
            return (
                <View style={[s.flex, { backgroundColor: '#0F3830', justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                    <StatusBar hidden={true} />
                    <Text style={{ color: '#FBC02D', fontSize: 36, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 }}>Apita o árbitro, tá valendo!</Text>
                    <Text style={{ color: '#FFF', fontSize: 24, textAlign: 'center', marginTop: 30, fontStyle: 'italic' }}>Será você o próximo milionário?</Text>
                </View>
            );
        }

        const pq = perguntas[perguntaAtual];
        const premioAtual = PREMIOS[perguntaAtual];
        const premioParar = perguntaAtual > 0 ? PREMIOS[perguntaAtual - 1] : 0;
        const premioErrar = calcularPremioErrar(perguntaAtual);
        const fimJogo = estadoJogo !== 'jogando';
        const temImagem = pq.tipo === 'escudo' && !!pq.escudo;

        const corBordaTimer = tempo > 10 ? '#FFF' : '#ff1744';

        const getBgColor = (idx: number) => {
            if (alternativaEliminada.includes(idx)) return '#0B3A2C';
            if (estadoResposta === 'aguardando') {
                return respostaSelecionada === idx ? COR_ACENTO : '#084f3c';
            }
            if (idx === pq.correta) return COR_CERTA;
            if (idx === respostaSelecionada && estadoResposta === 'errada') return COR_ERRADA;
            return '#084f3c';
        };

        return (
            <View style={s.flex}>
                <StatusBar hidden={true} />
                <ImageBackground source={ESTADIOS[estadioSelecionado] || ESTADIOS['campo']} style={s.flex}>
                    <LinearGradient colors={['rgba(15,56,48,0.6)', 'rgba(10,66,50,0.7)', 'rgba(8,38,30,0.8)']} style={s.flex}>
                        <SafeAreaView style={s.flex}>
                            <View style={[s.jogoLayout, { paddingBottom: Math.max(insets.bottom, 10) }]}>

                                {/* Topo: Timer */}
                                <View style={s.topoRow}>
                                    <View style={[s.timerCircle, { borderColor: corBordaTimer }]}>
                                        <Text style={[s.timerText, tempo <= 10 && { color: '#ff1744' }]}>{tempo}</Text>
                                    </View>
                                </View>

                                {/* Área da Pergunta Flexível (Anti-Overlap Dinâmico) */}
                                <View style={s.questionArea}>
                                    <Animated.View style={[s.perguntaBox, { padding: isSmallScreen ? 15 : 20, opacity: fadeAnim }]}>
                                        <Text style={s.catText}>{(pq.modo || []).map(m => m.toUpperCase()).join(' - ')}</Text>

                                        {temImagem && (
                                            <Image source={getEscudo(pq.escudo!)} style={[s.escudoImg, { width: isSmallScreen ? 50 : 80, height: isSmallScreen ? 50 : 80 }]} />
                                        )}

                                        <Text
                                            style={[s.perguntaTexto, { fontSize: temImagem && isSmallScreen ? 13 : isSmallScreen ? 15 : 17 }]}
                                            numberOfLines={2}
                                            adjustsFontSizeToFit
                                            minimumFontScale={0.6}
                                        >
                                            {pq.pergunta.toUpperCase()}
                                        </Text>
                                    </Animated.View>

                                    {/* Alternativas */}
                                    <Animated.View style={[s.alternativasWrapper, { gap: isSmallScreen ? 5 : 10, opacity: fadeAnim }]}>
                                        {pq.alternativas.map((alt, idx) => {
                                            const eliminada = alternativaEliminada.includes(idx);
                                            return (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={[s.altBtn, { minHeight: isSmallScreen ? 40 : 50, paddingVertical: isSmallScreen ? 6 : 8, backgroundColor: getBgColor(idx) }]}
                                                    onPress={() => !eliminada && responder(idx)}
                                                    disabled={eliminada || estadoResposta !== 'aguardando'}
                                                    activeOpacity={0.8}
                                                >
                                                    <View style={[s.altNumberCircle, respostaSelecionada === idx && estadoResposta === 'aguardando' && { backgroundColor: '#FFF' }]}>
                                                        <Text style={[s.altNumberText, respostaSelecionada === idx && estadoResposta === 'aguardando' && { color: '#000' }]}>{LETRAS[idx]}</Text>
                                                    </View>
                                                    <Text style={[s.altText, eliminada && { color: '#666' }, respostaSelecionada === idx && estadoResposta === 'aguardando' && { color: '#000' }]}>{alt.toUpperCase()}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </Animated.View>
                                </View>

                                {/* Rodapé: Ajudas */}
                                <View style={s.footerContainer}>
                                    <View style={s.ajudasLayout}>
                                        {AJUDAS.map((ajuda, index) => {
                                            const contagem = ajuda.id === 'driblar' ? qtdDriblar : ajudasDisponiveis.filter(a => a === ajuda.id).length;
                                            const bloqueada = perguntaAtual === 15;
                                            const ativo = contagem > 0 && !bloqueada;
                                            const isVar = ajuda.id === 'var';
                                            const adDisponivel = !ativo && !isVar && !adHelpUsed[ajuda.id] && !bloqueada && isRewardedLoaded;

                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[s.ajudaBtn, !ativo && !adDisponivel && s.ajudaInativa]}
                                                    onPress={() => adDisponivel ? solicitarAdAjuda(ajuda.id) : usarAjuda(ajuda.id)}
                                                    disabled={(!ativo && !adDisponivel) || estadoResposta !== 'aguardando'}
                                                >
                                                    <View style={[s.ajudaIconCircle, isSmallScreen && { width: 38, height: 38, borderRadius: 19 }]}>
                                                        <Image source={ajuda.image} style={{ width: isSmallScreen ? 22 : 30, height: isSmallScreen ? 22 : 30 }} resizeMode="contain" />
                                                    </View>
                                                    <Text style={[s.ajudaLabelTexto, !ativo && !adDisponivel && { color: '#666' }]}>{ajuda.label}</Text>
                                                    {contagem > 0 && <Text style={{ color: ativo ? COR_ACENTO : '#666', fontSize: 10, fontWeight: 'bold', marginTop: 2 }}>x{contagem}</Text>}
                                                    {contagem === 0 && adDisponivel && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 2 }}>
                                                            <Ionicons name="play" size={10} color="#E040FB" />
                                                            <Text style={{ color: '#E040FB', fontSize: 10, fontWeight: 'bold' }}>AD</Text>
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                        <TouchableOpacity style={[s.ajudaBtn, perguntaAtual === 15 && s.ajudaInativa]} onPress={() => { pararTimer(); tocarSomParar(); setConfirmarParar(true); }} disabled={estadoResposta !== 'aguardando' || perguntaAtual === 15}>
                                            <View style={[s.ajudaIconCircle, { borderColor: '#FFF', backgroundColor: 'transparent' }]}>
                                                <Ionicons name="close" size={26} color="#FFF" />
                                            </View>
                                            <Text style={s.ajudaLabelTexto}>PARAR</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Rodapé: Prêmios */}
                                    <View style={s.premiosContainer}>
                                        <View style={[s.premioBox, { backgroundColor: '#072E23' }]}>
                                            <Text style={s.premioRotulo}>ERRAR</Text>
                                            <View style={s.premioRow}>
                                                <Text style={{ fontSize: 16, color: '#FFF', fontWeight: 'bold' }}>$</Text>
                                                <Text style={s.premioValor}>{formatarPremio(premioErrar)}</Text>
                                            </View>
                                        </View>
                                        <View style={[s.premioBox, { backgroundColor: '#072E23' }]}>
                                            <Text style={s.premioRotulo}>PARAR</Text>
                                            <View style={s.premioRow}>
                                                <Text style={{ fontSize: 16, color: '#FFF', fontWeight: 'bold' }}>$</Text>
                                                <Text style={s.premioValor}>{formatarPremio(premioParar)}</Text>
                                            </View>
                                        </View>
                                        <View style={[s.premioBox, { backgroundColor: '#072E23' }]}>
                                            <Text style={s.premioRotulo}>ACERTAR</Text>
                                            <View style={s.premioRow}>
                                                <Text style={{ fontSize: 16, color: COR_ACENTO, fontWeight: 'bold' }}>$</Text>
                                                <Text style={[s.premioValor, { color: COR_ACENTO }]}>{formatarPremio(premioAtual)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                            </View>

                            {/* Modal Confirmar Ad Ajuda Extra */}
                            {modalConfirmAdHelp !== null && (() => {
                                const ajuda = AJUDAS.find(a => a.id === modalConfirmAdHelp)!;
                                const nomeAjuda = ajuda.label.toLowerCase();
                                return (
                                    <Modal transparent animationType="fade">
                                        <View style={s.fimOverlay}>
                                            <View style={s.fimCard}>
                                                <Text style={s.fimTitulo}>Ajuda Extra!</Text>
                                                <Text style={{ color: '#FFF', marginBottom: 20, fontSize: 16, textAlign: 'center' }}>
                                                    Deseja ver um anúncio para ganhar mais uma ajuda de {nomeAjuda}?
                                                </Text>
                                                <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                                                    <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1, backgroundColor: '#555' }]} onPress={() => { setModalConfirmAdHelp(null); iniciarTimer(); }}>
                                                        <Text style={[s.fimBtnText, { color: '#FFF' }]}>NÃO</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1 }]} onPress={() => {
                                                        const idHelp = modalConfirmAdHelp;
                                                        setModalConfirmAdHelp(null);
                                                        showRewardedAdAposFecharModal({ type: 'help', id: idHelp });
                                                    }}>
                                                        <Text style={s.fimBtnText}>SIM</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </Modal>
                                );
                            })()}

                            {/* Modal Tem Certeza Parar */}
                            {confirmarParar && (
                                <Modal transparent animationType="fade">
                                    <View style={s.fimOverlay}>
                                        <View style={s.fimCard}>
                                            <Text style={s.fimTitulo}>Tem certeza?</Text>
                                            <Text style={{ color: '#FFF', marginBottom: 20, fontSize: 16, textAlign: 'center' }}>
                                                Você deseja parar agora e garantir $ {formatarPremio(premioParar)}?
                                            </Text>
                                            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                                                <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1, backgroundColor: '#555' }]} onPress={() => { pararSomAtivo(); iniciarTimer(); setConfirmarParar(false); }}>
                                                    <Text style={[s.fimBtnText, { color: '#FFF' }]}>NÃO</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1 }]} onPress={() => { setConfirmarParar(false); desistir(); }}>
                                                    <Text style={s.fimBtnText}>SIM</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            )}

                            {/* Modal Tem Certeza Resposta */}
                            {confirmaAnswer !== null && (
                                <Modal transparent animationType="fade">
                                    <View style={s.fimOverlay}>
                                        <View style={s.fimCard}>
                                            <Text style={s.fimTitulo}>Tem certeza?</Text>
                                            <Text style={{ color: '#FFF', marginBottom: 20, fontSize: 18, textAlign: 'center' }}>
                                                Você escolheu: {pq.alternativas[confirmaAnswer].toUpperCase()}
                                            </Text>
                                            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                                                <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1, backgroundColor: '#555' }]} onPress={() => { setConfirmaAnswer(null); iniciarTimer(); }}>
                                                    <Text style={[s.fimBtnText, { color: '#FFF' }]}>NÃO</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1 }]} onPress={() => { const ans = confirmaAnswer; setConfirmaAnswer(null); efetivarResposta(ans); }}>
                                                    <Text style={s.fimBtnText}>SIM</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            )}

                            {/* Modal Especial 1 MILHÃO */}
                            {modalMilhaoVisivel && (
                                <Modal transparent animationType="fade">
                                    <View style={s.fimOverlay}>
                                        <View style={[s.fimCard, { maxWidth: 380 }]}>
                                            <Text style={[s.fimTitulo, { color: COR_ACENTO, fontSize: 32 }]}>A PERGUNTA DO MILHÃO!</Text>
                                            <Text style={{ color: '#FFF', fontSize: 16, textAlign: 'center', marginBottom: 25, lineHeight: 24 }}>
                                                Você deseja parar agora e levar os <Text style={{ fontWeight: 'bold', color: '#FBC02D' }}>$ 500.000</Text> garantidos ou quer arriscar tudo e jogar pelo <Text style={{ fontWeight: 'bold', color: '#FBC02D' }}>MILHÃO</Text>?{"\n\n"}
                                                ⚠️ ATENÇÃO: Se escolher jogar e errar, você perde TUDO e sai com $ 0!
                                            </Text>
                                            <View style={{ gap: 12, width: '100%' }}>
                                                <TouchableOpacity style={[s.fimBtnJogarNovamente, { backgroundColor: '#555' }]} onPress={recusarMilhao}>
                                                    <Text style={[s.fimBtnText, { color: '#FFF' }]}>PARAR COM $ 500.000</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={s.fimBtnJogarNovamente} onPress={aceitarMilhao}>
                                                    <Text style={s.fimBtnText}>JOGAR O MILHÃO!</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            )}

                            {/* Modal Segunda Chance (vídeo premiado, 1 vez por partida) */}
                            {modalSegundaChance && (
                                <Modal transparent animationType="fade" onRequestClose={recusarSegundaChance}>
                                    <View style={s.fimOverlay}>
                                        <View style={s.fimCard}>
                                            <Text style={s.fimEmoji}>📺</Text>
                                            <Text style={[s.fimTitulo, { color: COR_ACENTO }]}>SEGUNDA CHANCE!</Text>
                                            <Text style={{ color: '#FFF', fontSize: 16, textAlign: 'center', marginBottom: 25, lineHeight: 24 }}>
                                                Assista a um vídeo curto e continue no jogo com uma nova pergunta valendo <Text style={{ fontWeight: 'bold', color: COR_ACENTO }}>$ {formatarPremio(PREMIOS[perguntaAtual])}</Text>.
                                            </Text>
                                            <View style={{ gap: 12, width: '100%' }}>
                                                <TouchableOpacity style={s.fimBtnJogarNovamente} onPress={aceitarSegundaChance}>
                                                    <Text style={s.fimBtnText}>ASSISTIR E CONTINUAR</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[s.fimBtnJogarNovamente, { backgroundColor: '#555' }]} onPress={recusarSegundaChance}>
                                                    <Text style={[s.fimBtnText, { color: '#FFF' }]}>ENCERRAR</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            )}

                            {/* Animação DINÂMICA com PNGs (GOL) */}
                            {showGolAnim && (
                                <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999 }]}>
                                    <Animated.View style={{ transform: [{ translateX: shakeAnim }, { translateY: shakeAnim }] }}>
                                        <Image
                                            source={faseGol === 0 ? require('./assets/animacoes/bola_antes.png') : require('./assets/animacoes/bola_depois.png')}
                                            style={{ width: 300, height: 300 }}
                                            resizeMode="contain"
                                        />
                                    </Animated.View>

                                    {faseGol === 1 && (
                                        <Animated.View style={{ transform: [{ scale: scaleTextAnim }], alignItems: 'center' }}>
                                            <Text style={{ fontSize: 52, fontWeight: 'bold', color: '#FBC02D', marginTop: 20, letterSpacing: 2 }}>GOL!</Text>
                                            <Text style={{ fontSize: 18, color: '#FFF', marginTop: 8 }}>🎉 QUESTÃO CERTA! 🎉</Text>
                                        </Animated.View>
                                    )}
                                </View>
                            )}

                            {/* Animação DINÂMICA com PNGs (ERRO) */}
                            {showErroAnim && erroAtual && (
                                <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999 }]}>
                                    <Animated.View style={{ transform: [{ translateX: shakeAnim }, { translateY: shakeAnim }] }}>
                                        <Image
                                            source={faseGol === 0 ? require('./assets/animacoes/bola_antes.png') : (erroAtual.tipo === 'trave' ? require('./assets/animacoes/bola_depois_trave.png') : require('./assets/animacoes/bola_depois_fora.png'))}
                                            style={{ width: 300, height: 300 }}
                                            resizeMode="contain"
                                        />
                                    </Animated.View>

                                    {faseGol === 1 && (
                                        <Animated.View style={{ transform: [{ scale: scaleTextAnim }], alignItems: 'center' }}>
                                            <Text style={{ fontSize: 52, fontWeight: 'bold', color: '#ff1744', marginTop: 20, letterSpacing: 2 }}>{erroAtual.msg.toUpperCase()}</Text>
                                            <Text style={{ fontSize: 18, color: '#FFF', marginTop: 8 }}>❌ QUESTÃO ERRADA! ❌</Text>
                                        </Animated.View>
                                    )}
                                </View>
                            )}

                            {/* Modal Confirmar Ajuda */}
                            {modalAjudaConfirm !== null && (() => {
                                const ajuda = AJUDAS.find(a => a.id === modalAjudaConfirm)!;
                                const contagemRestante = modalAjudaConfirm === 'driblar' ? qtdDriblar : ajudasDisponiveis.filter(a => a === modalAjudaConfirm).length;

                                let nomeAjuda = ajuda.label.toLowerCase();
                                if (ajuda.id === 'driblar') {
                                    nomeAjuda = contagemRestante > 1 ? 'dribles' : 'drible';
                                } else if (ajuda.id === 'cartoes') {
                                    nomeAjuda = contagemRestante > 1 ? 'cartões' : 'cartão';
                                } else if (ajuda.id === 'torcedores') {
                                    nomeAjuda = 'ajuda da torcida';
                                } else if (ajuda.id === 'var') {
                                    nomeAjuda = 'uso do VAR';
                                }

                                return (
                                    <Modal transparent animationType="fade">
                                        <View style={s.fimOverlay}>
                                            <View style={[s.fimCard, { gap: 15 }]}>
                                                <View style={{ backgroundColor: '#FFF', borderRadius: 40, padding: 10 }}>
                                                    <Image source={ajuda.image} style={{ width: 60, height: 60 }} resizeMode="contain" />
                                                </View>
                                                <Text style={s.fimTitulo}>Usar {ajuda.label}?</Text>
                                                <Text style={{ color: '#DDD', fontSize: 16, textAlign: 'center' }}>Você ainda tem: {contagemRestante} {nomeAjuda}</Text>

                                                <Text style={{ color: '#FBC02D', fontSize: 13, textAlign: 'center', marginTop: 5, fontStyle: 'italic', paddingHorizontal: 10 }}>
                                                    "{TEXTOS_AJUDA[ajuda.id as keyof typeof TEXTOS_AJUDA]}"
                                                </Text>

                                                <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 10 }}>
                                                    <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1, backgroundColor: '#555' }]} onPress={() => {
                                                        setModalAjudaConfirm(null);
                                                        iniciarTimer(); // Retoma o tempo se desistir
                                                    }}>
                                                        <Text style={[s.fimBtnText, { color: '#FFF' }]}>NÃO</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[s.fimBtnJogarNovamente, { flex: 1 }]} onPress={() => confirmarAjuda(modalAjudaConfirm)}>
                                                        <Text style={s.fimBtnText}>SIM</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </Modal>
                                );
                            })()}

                            {/* Modal VAR */}
                            <Modal visible={modalVarVisivel} transparent animationType="fade">
                                <View style={s.fimOverlay}>
                                    <View style={[s.fimCard, { overflow: 'hidden' }]}>
                                        <Animated.View style={{ transform: [{ translateX: varScanX }], borderWidth: 3, borderColor: '#00BFFF', borderRadius: 8, padding: 20, width: '100%', alignItems: 'center' }}>
                                            <Text style={{ color: '#00BFFF', fontSize: 28, fontWeight: 'bold', letterSpacing: 4 }}>📺 VAR</Text>
                                            <Text style={{ color: '#aaa', fontSize: 14, marginTop: 5 }}>⏪ Analisando lances...</Text>
                                        </Animated.View>
                                        <Text style={{ color: '#FFF', fontSize: 16, marginTop: 20, textAlign: 'center' }}>A resposta correta é:</Text>
                                        <Text style={{ color: COR_ACENTO, fontSize: 22, fontWeight: 'bold', marginTop: 8, textAlign: 'center' }}>
                                            {perguntas[perguntaAtual]?.alternativas[perguntas[perguntaAtual]?.correta]?.toUpperCase()}
                                        </Text>
                                        <TouchableOpacity style={[s.fimBtnJogarNovamente, { marginTop: 20 }]} onPress={() => setModalVarVisivel(false)}>
                                            <Text style={s.fimBtnText}>ENTENDIDO</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>

                            {/* Modal Torcida */}
                            <Modal visible={modalTorcidaVisivel} transparent animationType="fade">
                                <View style={s.fimOverlay}>
                                    <View style={s.fimCard}>
                                        <Text style={s.fimTitulo}>🏟️ A TORCIDA ACHA...</Text>
                                        {pq.alternativas.map((alt, idx) => (
                                            <View key={idx} style={{ width: '100%', marginTop: 10 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: '#FFF', fontSize: 13 }}>{LETRAS[idx]}. {alt}</Text>
                                                    <Text style={{ color: COR_ACENTO, fontWeight: 'bold' }}>{torcidaVotos[idx] || 0}%</Text>
                                                </View>
                                                <View style={{ height: 8, backgroundColor: '#073', borderRadius: 4, marginTop: 4 }}>
                                                    <View style={{ width: `${torcidaVotos[idx] || 0}%`, height: 8, backgroundColor: COR_ACENTO, borderRadius: 4 }} />
                                                </View>
                                            </View>
                                        ))}
                                        <TouchableOpacity style={[s.fimBtnJogarNovamente, { marginTop: 20 }]} onPress={() => setModalTorcidaVisivel(false)}>
                                            <Text style={s.fimBtnText}>FECHAR</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>

                            {/* Modal Cartões */}
                            <Modal visible={modalCartoesVisivel} transparent animationType="fade">
                                <View style={s.fimOverlay}>
                                    <View style={s.fimCard}>
                                        <Text style={s.fimTitulo}>🟨🟥 CARTÕES</Text>
                                        <Text style={{ color: '#DDD', fontSize: 14, textAlign: 'center', marginBottom: 15 }}>Escolha um cartão para revelar quantas alternativas serão eliminadas</Text>
                                        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                                            {[0, 1, 2, 3].map(i => (
                                                <TouchableOpacity
                                                    key={i}
                                                    style={[
                                                        { width: 60, height: 90, borderRadius: 8, borderWidth: 2, borderColor: cartaoRevelado === null ? '#888' : '#333', justifyContent: 'center', alignItems: 'center' },
                                                        cartaoRevelado === null
                                                            ? { backgroundColor: i < 2 ? '#f5a623' : '#e53935' }
                                                            : { backgroundColor: cartoesOpcoes[i] === cartaoRevelado ? '#444' : '#222' }
                                                    ]}
                                                    onPress={() => {
                                                        if (cartaoRevelado !== null) return;
                                                        const possibilidades = embaralharArray([0, 1, 2, 3]);
                                                        setCartoesOpcoes(possibilidades);
                                                        const eliminaQtd = possibilidades[i];
                                                        setCartaoRevelado(eliminaQtd);

                                                        if (eliminaQtd > 0) {
                                                            const erradas = [0, 1, 2, 3].filter(x => x !== pq.correta);
                                                            const paraEliminar = embaralharArray(erradas).slice(0, eliminaQtd);
                                                            setAlternativaEliminada(paraEliminar);
                                                        }
                                                    }}
                                                >
                                                    {cartaoRevelado !== null ? (
                                                        <Text style={{ color: cartoesOpcoes[i] === cartaoRevelado ? '#FFF' : '#666', fontSize: cartoesOpcoes[i] === cartaoRevelado ? 28 : 18, fontWeight: 'bold' }}>
                                                            {cartoesOpcoes[i]}
                                                        </Text>
                                                    ) : (
                                                        <Text style={{ color: '#FFF', fontSize: 28, fontWeight: 'bold' }}>?</Text>
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        {cartaoRevelado !== null && (
                                            <Text style={{ color: COR_ACENTO, fontSize: 18, fontWeight: 'bold', marginTop: 15, textAlign: 'center' }}>
                                                {cartaoRevelado === 0 ? 'Nenhuma alternativa eliminada!' : `${cartaoRevelado} alternativa${cartaoRevelado > 1 ? 's' : ''} eliminada${cartaoRevelado > 1 ? 's' : ''}!`}
                                            </Text>
                                        )}
                                        <TouchableOpacity style={[s.fimBtnJogarNovamente, { marginTop: 15 }]} onPress={() => setModalCartoesVisivel(false)}>
                                            <Text style={s.fimBtnText}>FECHAR</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>

                            {/* Modal de Fim */}
                            {fimJogo && (
                                <Modal transparent animationType="fade" visible={fimJogo}>
                                    <View style={s.fimOverlay}>
                                        <View style={s.fimCard}>
                                            {/* Topo do cartão: é esta parte que vira a imagem compartilhada */}
                                            <View ref={resultadoRef} collapsable={false} style={[s.fimTopoCompartilhavel, capturandoResultado && s.fimTopoCapturando]}>
                                            <Text style={s.fimEmoji}>
                                                {estadoJogo === 'fim_vitoria' ? '🏆' : estadoJogo === 'fim_derrota' ? '❌' : '🏳️'}
                                            </Text>
                                            <Text style={s.fimTitulo}>
                                                {estadoJogo === 'fim_vitoria'
                                                    ? 'MILIONÁRIO!'
                                                    : estadoJogo === 'fim_derrota'
                                                        ? estadoResposta === 'tempo_esgotado' ? 'TEMPO ESGOTADO!' : 'FIM DE JOGO!'
                                                        : 'VOCÊ PAROU!'}
                                            </Text>
                                            {estadoJogo === 'fim_derrota' && respostaSelecionada !== null && pq.alternativas[pq.correta] && (
                                                <Text style={s.fimRespostaCerta}>
                                                    Certa: {pq.alternativas[pq.correta].toUpperCase()}
                                                </Text>
                                            )}
                                            <Text style={s.fimPremioLabel}>Seu prêmio final:</Text>
                                            <Text style={s.fimPremioValor}>$ {formatarPremio(premioDobrado ? premioGanho * 2 : premioGanho)}</Text>
                                            {premioDobrado && (
                                                <Text style={[s.fimRespostaCerta, { marginTop: -20 }]}>PRÊMIO DOBRADO! 🎉</Text>
                                            )}
                                            {capturandoResultado && (
                                                <Text style={s.fimMarcaCompartilhar}>⚽ Jogo do Milhão do Futebol · Duvido você!</Text>
                                            )}
                                            </View>

                                            {/* Compartilhar o resultado (imagem + texto com link da loja) */}
                                            {premioFinalExibido > 0 && (
                                                <TouchableOpacity style={[s.fimBtnJogarNovamente, { backgroundColor: '#25D366', marginBottom: 10 }]} onPress={compartilharResultado}>
                                                    <Text style={[s.fimBtnText, { color: '#FFF' }]}>📤 DESAFIAR UM AMIGO</Text>
                                                </TouchableOpacity>
                                            )}

                                            {/* Dobrar o prêmio com vídeo (vitória ou parada, 1 vez por partida) */}
                                            {(estadoJogo === 'fim_vitoria' || estadoJogo === 'fim_desistencia') && premioGanho > 0 && !premioDobrado && isRewardedLoaded && (
                                                <TouchableOpacity style={[s.fimBtnJogarNovamente, { backgroundColor: '#1E88E5', marginBottom: 10 }]} onPress={() => showRewardedAd({ type: 'dobrar_premio', valor: premioGanho })}>
                                                    <Text style={[s.fimBtnText, { color: '#FFF' }]}>📺 DOBRAR PRÊMIO (+$ {formatarPremio(premioGanho)})</Text>
                                                </TouchableOpacity>
                                            )}

                                            <TouchableOpacity style={s.fimBtnJogarNovamente} onPress={() => sairDoFimDeJogo(iniciarJogo)}>
                                                <Text style={s.fimBtnText}>Jogar Novamente</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[s.fimBtnJogarNovamente, { backgroundColor: '#072a20', marginTop: 10 }]} onPress={() => sairDoFimDeJogo(() => setTela('home'))}>
                                                <Text style={[s.fimBtnText, { color: '#fff' }]}>Menu Principal</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>
                            )}
                        </SafeAreaView>
                    </LinearGradient>
                </ImageBackground>
            </View>
        );
    }

    return null;
}

export default function App() {
    return (
        <SafeAreaProvider>
            <MainApp />
        </SafeAreaProvider>
    );
}

const s = StyleSheet.create({
    flex: { flex: 1 },

    // HOME E LAYOUT BASE
    homeLayout: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    homeCenterWrap: { width: '100%', maxWidth: 400, alignItems: 'center', gap: 15 },

    btnModos: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#084f3c', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#138C61', width: '100%', justifyContent: 'center' },
    btnModosText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

    btnJogarPremium: { width: '100%', borderRadius: 30, overflow: 'hidden', marginTop: 20 },
    btnJogarPremiumGrad: { paddingVertical: 18, alignItems: 'center' },
    btnJogarPremiumText: { fontSize: 24, fontWeight: 'bold', color: '#000', letterSpacing: 2 },

    // MODAIS
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { width: '90%', maxWidth: 400, backgroundColor: '#0F3830', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: COR_ACENTO },
    modalHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingBottom: 15, marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    modoItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
    modoItemAtivo: { borderColor: COR_ACENTO, backgroundColor: 'rgba(255,215,0,0.2)' },
    modoIcon: { fontSize: 24, marginRight: 15 },
    modoLabel: { flex: 1, fontSize: 16, color: '#FFF', fontWeight: 'bold' },
    tickBox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
    tickBoxAtivo: { backgroundColor: COR_ACENTO, borderColor: COR_ACENTO },
    btnModalOk: { backgroundColor: COR_ACENTO, width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
    btnModalOkText: { fontSize: 16, fontWeight: 'bold', color: '#000' },

    // JOGO RESPONSIVO SEM SCROLLVIEW PARA EVITAR OVERLAP
    jogoLayout: { flex: 1, flexDirection: 'column' },

    topoRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 5 },
    timerCircle: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B3A2C', zIndex: 10 },
    timerText: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },

    questionArea: { flex: 1, paddingHorizontal: 20, paddingTop: 5, paddingBottom: 10, justifyContent: 'flex-start', gap: 10 },

    perguntaBox: { flexShrink: 1, backgroundColor: '#084f3c', borderRadius: 12, paddingTop: 25, borderWidth: 2, borderColor: '#138C61', justifyContent: 'center', alignItems: 'center', position: 'relative' },
    catText: { position: 'absolute', top: -14, backgroundColor: '#138C61', paddingHorizontal: 15, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: 'bold', color: '#FFF', letterSpacing: 1, zIndex: 5 },
    perguntaTexto: { fontWeight: 'bold', color: '#FFF', textAlign: 'center', lineHeight: 24 },
    escudoImg: { marginBottom: 10, resizeMode: 'contain' },

    alternativasWrapper: { justifyContent: 'flex-start', marginTop: 5 },
    altBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 30, paddingRight: 20, borderWidth: 2, borderColor: '#0A3B2E', backgroundColor: '#084f3c', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 4 },
    altNumberCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#138C61', justifyContent: 'center', alignItems: 'center', margin: 6 },
    altNumberText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
    altText: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#FFF', paddingLeft: 10 },

    footerContainer: { paddingBottom: Platform.OS === 'ios' ? (isSmallScreen ? 8 : 20) : (isSmallScreen ? 4 : 15), paddingTop: 5, backgroundColor: 'transparent' },
    ajudasLayout: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 10 },
    ajudaBtn: { alignItems: 'center', flex: 1 },
    ajudaInativa: { opacity: 0.4 },
    ajudaIconCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#138C61', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', marginBottom: 8 },
    ajudaLabelTexto: { fontSize: 9, color: '#FFF', fontWeight: 'bold', textAlign: 'center', letterSpacing: 0.5 },

    premiosContainer: { flexDirection: 'row', paddingHorizontal: 15, gap: 10 },
    premioBox: { flex: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 5, alignItems: 'center', backgroundColor: '#072E23', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    premioRotulo: { fontSize: 12, fontWeight: 'bold', color: '#FFF', marginBottom: 6, letterSpacing: 1 },
    premioRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    premioValor: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },

    fimOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    fimCard: { width: '100%', maxWidth: 350, backgroundColor: '#0B5D45', borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 2, borderColor: COR_ACENTO },
    fimTopoCompartilhavel: { width: '100%', alignItems: 'center', backgroundColor: '#0B5D45' },
    fimTopoCapturando: { paddingTop: 16, paddingBottom: 8, borderRadius: 16 },
    fimMarcaCompartilhar: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginTop: -16, marginBottom: 8, opacity: 0.9 },
    fimEmoji: { fontSize: 70, marginBottom: 15 },
    fimTitulo: { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 10, textAlign: 'center' },
    fimRespostaCerta: { fontSize: 14, color: COR_ACENTO, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    fimPremioLabel: { fontSize: 14, color: '#DDD', fontWeight: '600' },
    fimPremioValor: { fontSize: 40, fontWeight: 'bold', color: COR_ACENTO, marginBottom: 30 },
    fimBtnJogarNovamente: { backgroundColor: COR_ACENTO, width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
    fimBtnText: { fontSize: 16, fontWeight: 'bold', color: '#000', letterSpacing: 1 },

    // NOVOS ESTILOS PARA FILTROS E LOJA DE ESTÁDIOS
    pillFilter: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#FBC02D', marginRight: 10, backgroundColor: 'rgba(0,0,0,0.4)' },
    pillFilterActive: { backgroundColor: '#FBC02D' },
    pillFilterText: { color: '#FBC02D', fontWeight: 'bold', fontSize: 12 },

    lojaItem: { flexDirection: 'row', padding: 15, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#555' },
    lojaItemAtivo: { borderColor: '#FBC02D', backgroundColor: 'rgba(255,215,0,0.1)' },
    lojaThumb: { width: 80, height: 50, borderRadius: 5, backgroundColor: '#000', borderWidth: 1, borderColor: '#333' },
    lojaNome: { fontSize: 14, color: '#fff', fontWeight: 'bold', marginBottom: 5 },
    btnComprar: { backgroundColor: '#FBC02D', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 5, alignSelf: 'flex-start', marginTop: 5 }
});