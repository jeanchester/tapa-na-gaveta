import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Sharing from 'expo-sharing';
import * as StoreReview from 'expo-store-review';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

// --- IMPORTAÇÃO ADMOB ---
import {
  AdEventType,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  RewardedAd, // <--- NOVO
  RewardedAdEventType, // <--- NOVO
  TestIds
} from 'react-native-google-mobile-ads';

// --- IMPORTAÇÃO COMPRAS (REVENUECAT) ---
import analytics from '@react-native-firebase/analytics';
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import Share from 'react-native-share';

// --- DIVULGAÇÃO: links da loja com marcação UTM (medida em Play Console > aquisição) ---
const PACOTE_VOCE_ESCALA = 'com.julio.escalafutebol';
const PACOTE_MILHAO = 'com.julio333.ShowMilhaoFutebol';
const PACOTE_FOOTBALL_DRAFT = 'com.julio333.FootballDraft';
const utm = (meio: string, campanha: string) =>
  encodeURIComponent(`utm_source=voceescala&utm_medium=${meio}&utm_campaign=${campanha}`);
const linkLoja = (pacote: string, meio: string, campanha: string) =>
  `https://play.google.com/store/apps/details?id=${pacote}&referrer=${utm(meio, campanha)}`;
// Promoção cruzada do Milhão: cartão no lugar do intersticial depois de salvar (nunca para Premium),
// no máximo 1 vez a cada PROMO_MILHAO_INTERVALO_DIAS e PROMO_MILHAO_MAX_VEZES no total; some depois do 1º clique
const PROMO_MILHAO_KEY = '@futebol_app:promo_milhao';   // { vezes, ultima, clicou }
const PROMO_MILHAO_MAX_VEZES = 4;
const PROMO_MILHAO_INTERVALO_DIAS = 3;

// --- CONFIGURAÇÃO: DATA DE CORTE PARA USUÁRIOS ANTIGOS ---
const DATA_MIGRACAO_PREMIUM = new Date('2026-01-01').getTime();

// --- CONFIGURAÇÃO DOS ANÚNCIOS ---
const adUnitIdBanner = __DEV__ ? TestIds.BANNER : 'ca-app-pub-1665055635227173/5716910191';
const adUnitIdInter = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-1665055635227173/5960452774';
const interstitial = InterstitialAd.createForAdRequest(adUnitIdInter);

// --- CONFIGURAÇÃO DO ANÚNCIO PREMIADO (REWARDED) ---
const adUnitIdRewarded = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-1665055635227173/8998846946';
const rewardedAd = RewardedAd.createForAdRequest(adUnitIdRewarded);

// Intervalo mínimo entre dois intersticiais, em qualquer ponto do app
const INTERSTICIAL_INTERVALO_MS = 45 * 1000;
// Depois de quantas tentativas sem vídeo disponível o time é liberado mesmo assim
const FALHAS_VIDEO_PARA_LIBERAR = 3;
// Espera entre as novas tentativas de carregar um anúncio que falhou
const ESPERAS_RECARGA_MS = [5000, 15000, 30000, 60000];

// Pedido de avaliação (API In-App Review do Google Play): depois de N escalações salvas ou
// compartilhadas, e no máximo 1 vez a cada AVALIACAO_INTERVALO_DIAS (o Google ainda limita por conta própria)
const AVALIACAO_APOS_ACOES = 2;
const AVALIACAO_INTERVALO_DIAS = 60;

// URL do arquivo JSON gerado pelo GitHub Action
const ELENCOS_JSON_URL = 'https://raw.githubusercontent.com/jujubs333/futebol-elencos/main/data/elencos.json';
const ELENCOS_COPA_URL = 'https://raw.githubusercontent.com/jujubs333/futebol-elencos/main/data/elencos_copa_2026.json';

const MAPA_IDS_COPA: { [key: number]: string } = {
  2001: "South Africa",
  25: "Germany",
  2003: "Saudi Arabia",
  2004: "Algeria",
  26: "Argentina",
  2006: "Australia",
  2007: "Austria",
  1: "Belgium",
  2009: "Bosnia and Herzegovina",
  6: "Brazil",
  2011: "Cape Verde",
  2012: "Canada",
  2013: "Qatar",
  2014: "Czechia",
  8: "Colombia",
  2016: "South Korea",
  2017: "Ivory Coast",
  3: "Croatia",
  2019: "Curacao",
  2020: "Egypt",
  2021: "Ecuador",
  2022: "Scotland",
  9: "Spain",
  2024: "United States",
  2: "France",
  2026: "Ghana",
  2027: "Haiti",
  1118: "Netherlands",
  10: "England",
  2030: "Iran",
  2031: "Iraq",
  12: "Japan",
  2033: "Jordan",
  2034: "Morocco",
  16: "Mexico",
  2036: "Norway",
  2037: "New Zealand",
  2038: "Panama",
  2039: "Paraguay",
  27: "Portugal",
  2041: "DR Congo",
  2042: "Senegal",
  2043: "Sweden",
  2044: "Switzerland",
  2045: "Tunisia",
  2046: "Turkiye",
  7: "Uruguay",
  2048: "Uzbekistan"
};

// --- ESQUEMAS TÁTICOS ---
const ESQUEMAS_TATICOS: { [key: string]: [number, number][] } = {
  '4-3-3': [
    [0.5, 0.92], [0.15, 0.75], [0.38, 0.78], [0.62, 0.78], [0.85, 0.75],
    [0.3, 0.55], [0.5, 0.50], [0.7, 0.55], [0.2, 0.25], [0.5, 0.20], [0.8, 0.25],
  ],
  '4-4-2': [
    [0.5, 0.92], [0.15, 0.75], [0.38, 0.78], [0.62, 0.78], [0.85, 0.75],
    [0.15, 0.50], [0.38, 0.50], [0.62, 0.50], [0.85, 0.50], [0.35, 0.25], [0.65, 0.25],
  ],
  '4-2-3-1': [
    [0.5, 0.92], [0.15, 0.75], [0.38, 0.78], [0.62, 0.78], [0.85, 0.75],
    [0.35, 0.60], [0.65, 0.60], [0.2, 0.40], [0.5, 0.35], [0.8, 0.40], [0.5, 0.15],
  ],
  '4-1-4-1': [
    [0.5, 0.92], [0.15, 0.75], [0.38, 0.78], [0.62, 0.78], [0.85, 0.75],
    [0.5, 0.65], [0.15, 0.45], [0.38, 0.45], [0.62, 0.45], [0.85, 0.45], [0.5, 0.20],
  ],
  '3-5-2': [
    [0.5, 0.92], [0.3, 0.78], [0.5, 0.80], [0.7, 0.78],
    [0.1, 0.55], [0.3, 0.55], [0.5, 0.45], [0.7, 0.55], [0.9, 0.55], [0.35, 0.25], [0.65, 0.25],
  ],
  '3-4-3': [
    [0.5, 0.92], [0.25, 0.78], [0.5, 0.80], [0.75, 0.78],
    [0.15, 0.55], [0.4, 0.50], [0.6, 0.50], [0.85, 0.55], [0.2, 0.25], [0.5, 0.20], [0.8, 0.25],
  ],
  '5-3-2': [
    [0.5, 0.92], [0.1, 0.65], [0.25, 0.75], [0.5, 0.78], [0.75, 0.75], [0.9, 0.65],
    [0.35, 0.50], [0.5, 0.45], [0.65, 0.50], [0.35, 0.25], [0.65, 0.25],
  ],
  '5-4-1': [
    [0.5, 0.92], [0.1, 0.68], [0.25, 0.75], [0.5, 0.78], [0.75, 0.75], [0.9, 0.68],
    [0.2, 0.45], [0.4, 0.45], [0.6, 0.45], [0.8, 0.45], [0.5, 0.20],
  ],
};

// --- TIPOS ---
interface Time {
  nome: string;
  id: number;
  cor: string;
  corSecundaria: string;
}

interface Jogador {
  id: number;
  nome: string;
  posicao: string;
  numero: number | null;
}

// --- BANCO DE DADOS DE TIMES ---
const DB_TIMES: Time[] = [
  // SÉRIE A
  { nome: 'Palmeiras', id: 121, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Flamengo', id: 127, cor: '#C8102E', corSecundaria: '#000000' }, // Curação: Vermelho + Preto
  { nome: 'Botafogo', id: 120, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Internacional', id: 119, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Fortaleza', id: 154, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  { nome: 'São Paulo', id: 126, cor: '#FFFFFF', corSecundaria: '#000000' }, // Customizado abaixo
  { nome: 'Corinthians', id: 131, cor: '#FFFFFF', corSecundaria: '#000000' },
  { nome: 'Bahia', id: 118, cor: '#00316B', corSecundaria: '#FFFFFF' },
  { nome: 'Cruzeiro', id: 135, cor: '#0047AB', corSecundaria: '#FFFFFF' },
  { nome: 'Vasco da Gama', id: 133, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Vitória', id: 136, cor: '#FF0000', corSecundaria: '#000000' },
  { nome: 'Atlético Mineiro', id: 1062, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Fluminense', id: 124, cor: '#8A1538', corSecundaria: '#FFFFFF' }, // Customizado abaixo
  { nome: 'Grêmio', id: 130, cor: '#0097D7', corSecundaria: '#FFFFFF' },  // Customizado abaixo
  { nome: 'Juventude', id: 152, cor: '#00913E', corSecundaria: '#FFFFFF' },
  { nome: 'Bragantino', id: 794, cor: '#FFFFFF', corSecundaria: '#000000' },
  { nome: 'Athletico Paranaense', id: 134, cor: '#C8102E', corSecundaria: '#FFFFFF' },
  { nome: 'Criciúma', id: 140, cor: '#FDD116', corSecundaria: '#000000' },
  { nome: 'Atlético Goianiense', id: 144, cor: '#FF0000', corSecundaria: '#000000' },
  { nome: 'Cuiabá', id: 1193, cor: '#014421', corSecundaria: '#FDD116' },
  // SÉRIE B
  { nome: 'Santos', id: 128, cor: '#FFFFFF', corSecundaria: '#000000' },
  { nome: 'Mirassol', id: 7848, cor: '#FFC926', corSecundaria: '#FFFFFF' },
  { nome: 'Novorizontino', id: 7834, cor: '#FFF200', corSecundaria: '#FFFFFF' },
  { nome: 'Sport Recife', id: 123, cor: '#C8102E', corSecundaria: '#FDD116' },
  { nome: 'Ceará', id: 129, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Goiás', id: 151, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Operário - PR', id: 1223, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Vila Nova', id: 142, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'América Mineiro', id: 125, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Coritiba', id: 147, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Avaí', id: 145, cor: '#0047AB', corSecundaria: '#FFFFFF' },
  { nome: 'Paysandu', id: 149, cor: '#0091D6', corSecundaria: '#FFFFFF' },
  { nome: 'Botafogo-SP', id: 2618, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Chapecoense', id: 132, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'CRB', id: 146, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Ponte Preta', id: 139, cor: '#FFFFFF', corSecundaria: '#000000' },
  { nome: 'Ituano', id: 7779, cor: '#FF0000', corSecundaria: '#000000' },
  { nome: 'Brusque', id: 1211, cor: '#FDE910', corSecundaria: '#FFFFFF' },
  { nome: 'Guarani', id: 138, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Amazonas', id: 10862, cor: '#F3C242', corSecundaria: '#FFFFFF' },
  // SÉRIE C e OUTROS
  { nome: 'Náutico', id: 755, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Figueirense', id: 137, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Remo', id: 1198, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  { nome: 'Volta Redonda', id: 7814, cor: '#FDD116', corSecundaria: '#FFFFFF' },
  { nome: 'Ferroviária', id: 7826, cor: '#8A1538', corSecundaria: '#FFFFFF' },
  { nome: 'CSA', id: 150, cor: '#0047AB', corSecundaria: '#FFFFFF' },
  { nome: 'ABC', id: 754, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Sampaio Corrêa', id: 155, cor: '#FDD116', corSecundaria: '#FFFFFF' },
  { nome: 'Confiança', id: 7772, cor: '#0047AB', corSecundaria: '#FFFFFF' },
  { nome: 'Ypiranga', id: 1221, cor: '#FDD116', corSecundaria: '#FFFFFF' },
  { nome: 'Londrina', id: 148, cor: '#0091D6', corSecundaria: '#FFFFFF' },
  { nome: 'São Bernardo', id: 7865, cor: '#FDD116', corSecundaria: '#FFFFFF' },
  { nome: 'Caxias', id: 7770, cor: '#8A1538', corSecundaria: '#FFFFFF' },
  { nome: 'Athletic Club', id: 13975, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Tombense', id: 2227, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Botafogo-PB', id: 1197, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Aparecidense', id: 1202, cor: '#0047AB', corSecundaria: '#FFFFFF' },
  { nome: 'Floresta', id: 7774, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'São José-RS', id: 2232, cor: '#0047AB', corSecundaria: '#FFFFFF' },
  { nome: 'Ferroviário', id: 1195, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Portuguesa', id: 1214, cor: '#FF0000', corSecundaria: '#006437' },
  { nome: 'Brasiliense', id: 2208, cor: '#FDD116', corSecundaria: '#FFFFFF' },
  { nome: 'Tuna Luso', id: 15611, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Manauara', id: 18308, cor: '#FF6600', corSecundaria: '#FFFFFF' },
  { nome: 'Manaus', id: 2214, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Trem', id: 7868, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Humaitá', id: 10478, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Altos', id: 1203, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Imperatriz', id: 2213, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Maranhão', id: 7832, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  { nome: 'Iguatu', id: 15505, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  { nome: 'Tocantinópolis', id: 7878, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Parnahyba', id: 7784, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  { nome: 'Maracanã', id: 13089, cor: '#0091D6', corSecundaria: '#FFFFFF' },
  { nome: 'América-RN', id: 2233, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Santa Cruz', id: 753, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Central', id: 2210, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Horizonte', id: 12297, cor: '#FDD116', corSecundaria: '#FFFFFF' },
  { nome: 'Treze', id: 7787, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Sousa', id: 7864, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'ASA', id: 1207, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Lagarto', id: 10002, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Sergipe', id: 2224, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Juazeirense', id: 1224, cor: '#FFFF00', corSecundaria: '#FFFFFF' },
  { nome: 'Jequié', id: 15104, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  { nome: 'Barcelona-BA', id: 15103, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Ceilândia', id: 7771, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Luverdense', id: 752, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Mixto', id: 2215, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Goiânia', id: 10674, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Goianésia', id: 7873, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  { nome: 'Portuguesa-RJ', id: 7835, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Água Santa', id: 10018, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  { nome: 'Maricá', id: 14000, cor: '#808080', corSecundaria: '#FFFFFF' },
  { nome: 'Pouso Alegre', id: 13084, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Nova Iguaçu', id: 7782, cor: '#FF6600', corSecundaria: '#FFFFFF' },
  { nome: 'Boavista', id: 222, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Inter de Limeira', id: 1201, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Cianorte', id: 1194, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  { nome: 'Cascavel', id: 10673, cor: '#FDD116', corSecundaria: '#FFFFFF' },
  { nome: 'Uberlândia', id: 1196, cor: '#006437', corSecundaria: '#FFFFFF' },
  { nome: 'Monte Azul', id: 10021, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  { nome: 'Itabirito', id: 21165, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Barra', id: 18271, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  { nome: 'Joinville', id: 795, cor: '#000000', corSecundaria: '#FFFFFF' },
  { nome: 'Marcílio Dias', id: 10677, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Brasil de Pelotas', id: 141, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'São Luiz', id: 10004, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Azuriz', id: 12939, cor: '#1135A5', corSecundaria: '#FFFFFF' },
  // COPA DO MUNDO
  { nome: 'África do Sul', id: 2001, cor: '#FFB81C', corSecundaria: '#007749' },
  { nome: 'Alemanha', id: 25, cor: '#FFFFFF', corSecundaria: '#000000' },
  { nome: 'Arábia Saudita', id: 2003, cor: '#006C35', corSecundaria: '#FFFFFF' },
  { nome: 'Argélia', id: 2004, cor: '#FFFFFF', corSecundaria: '#006633' },
  { nome: 'Argentina', id: 26, cor: '#43A1D5', corSecundaria: '#FFFFFF' },
  { nome: 'Austrália', id: 2006, cor: '#FFCC00', corSecundaria: '#006633' },
  { nome: 'Áustria', id: 2007, cor: '#ED2939', corSecundaria: '#FFFFFF' },
  { nome: 'Bélgica', id: 1, cor: '#E30613', corSecundaria: '#000000' },
  { nome: 'Bósnia e Herzegovina', id: 2009, cor: '#002395', corSecundaria: '#FFCC00' },
  { nome: 'Brasil', id: 6, cor: '#FFDF00', corSecundaria: '#009C3B' },
  { nome: 'Cabo Verde', id: 2011, cor: '#003893', corSecundaria: '#CF2027' },
  { nome: 'Canadá', id: 2012, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Catar', id: 2013, cor: '#8A1538', corSecundaria: '#FFFFFF' },
  { nome: 'Chéquia', id: 2014, cor: '#D7141A', corSecundaria: '#FFFFFF' },
  { nome: 'Colômbia', id: 8, cor: '#FCD116', corSecundaria: '#003893' },
  { nome: 'Coreia do Sul', id: 2016, cor: '#C60C30', corSecundaria: '#000000' },
  { nome: 'Costa do Marfim', id: 2017, cor: '#FF8200', corSecundaria: '#FFFFFF' },
  { nome: 'Croácia', id: 3, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Curaçao', id: 2019, cor: '#002B7F', corSecundaria: '#F9E814' },
  { nome: 'Egito', id: 2020, cor: '#CE1126', corSecundaria: '#FFFFFF' },
  { nome: 'Equador', id: 2021, cor: '#FFD100', corSecundaria: '#0033A0' },
  { nome: 'Escócia', id: 2022, cor: '#005EB8', corSecundaria: '#FFFFFF' },
  { nome: 'Espanha', id: 9, cor: '#AA151B', corSecundaria: '#F1BF00' },
  { nome: 'EUA', id: 2024, cor: '#FFFFFF', corSecundaria: '#002868' },
  { nome: 'França', id: 2, cor: '#002395', corSecundaria: '#FFFFFF' },
  { nome: 'Gana', id: 2026, cor: '#FFFFFF', corSecundaria: '#000000' },
  { nome: 'Haiti', id: 2027, cor: '#00209F', corSecundaria: '#D21034' },
  { nome: 'Holanda', id: 1118, cor: '#F36C21', corSecundaria: '#FFFFFF' },
  { nome: 'Inglaterra', id: 10, cor: '#FFFFFF', corSecundaria: '#CE1124' },
  { nome: 'Irã', id: 2030, cor: '#FFFFFF', corSecundaria: '#DA0000' },
  { nome: 'Iraque', id: 2031, cor: '#007A3D', corSecundaria: '#FFFFFF' },
  { nome: 'Japão', id: 12, cor: '#000555', corSecundaria: '#FFFFFF' },
  { nome: 'Jordânia', id: 2033, cor: '#FFFFFF', corSecundaria: '#CE1126' },
  { nome: 'Marrocos', id: 2034, cor: '#C1272D', corSecundaria: '#006233' },
  { nome: 'México', id: 16, cor: '#006847', corSecundaria: '#FFFFFF' },
  { nome: 'Noruega', id: 2036, cor: '#BA0C2F', corSecundaria: '#00205B' },
  { nome: 'Nova Zelândia', id: 2037, cor: '#FFFFFF', corSecundaria: '#000000' },
  { nome: 'Panamá', id: 2038, cor: '#DA291C', corSecundaria: '#FFFFFF' },
  { nome: 'Paraguai', id: 2039, cor: '#D52B1E', corSecundaria: '#FFFFFF' },
  { nome: 'Portugal', id: 27, cor: '#FF0000', corSecundaria: '#006600' },
  { nome: 'RD Congo', id: 2041, cor: '#007FFF', corSecundaria: '#CE1126' },
  { nome: 'Senegal', id: 2042, cor: '#FFFFFF', corSecundaria: '#00853F' },
  { nome: 'Suécia', id: 2043, cor: '#FECC00', corSecundaria: '#006AA7' },
  { nome: 'Suíça', id: 2044, cor: '#FF0000', corSecundaria: '#FFFFFF' },
  { nome: 'Tunísia', id: 2045, cor: '#FFFFFF', corSecundaria: '#E70013' },
  { nome: 'Turquia', id: 2046, cor: '#E30A17', corSecundaria: '#FFFFFF' },
  { nome: 'Uruguai', id: 7, cor: '#75AADB', corSecundaria: '#000000' },
  { nome: 'Uzbequistão', id: 2048, cor: '#0099B5', corSecundaria: '#FFFFFF' }
];

// --- FUNÇÕES UTILITÁRIAS ---
const removeAccents = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const traduzirPosicao = (p: string | null): string => {
  if (!p) return 'Meio-Campo';
  if (p === 'Goalkeeper') return 'Goleiro';
  if (p === 'Defender') return 'Defensor';
  if (p === 'Midfielder') return 'Meio-Campo';
  if (p === 'Attacker') return 'Atacante';
  return p;
};

// NOVA FUNÇÃO: Formatar Nome (G. Jesus)
const formatarNomeCurto = (nome: string): string => {
  const partes = nome.trim().split(/\s+/);

  if (partes.length > 1) {
    const primeiroNome = partes[0];
    const ultimoNome = partes[partes.length - 1];
    // Retorna: "G. Jesus"
    const nomeFormatado = `${primeiroNome[0].toUpperCase()}. ${ultimoNome}`;
    return nomeFormatado.substring(0, 13);
  }

  return nome.substring(0, 12);
};

const fixString = (texto: string | null): string => {
  if (!texto) return '';
  return texto;
};

const getCorTexto = (corHex: string): string => {
  const coresClaras = [
    '#FFFFFF', '#FFF200', '#FDD116', '#FDE910', '#F3C242', '#FFC926', '#FFFF00',
  ];
  if (coresClaras.includes(corHex.toUpperCase())) return 'black';
  return 'white';
};

const coresSimilares = (hex1: string, hex2: string): boolean => {
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  };

  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const dist = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );

  return dist < 120;
};

const gerarPosicoesAdversario = (esquema: string): [number, number][] => {
  return ESQUEMAS_TATICOS[esquema].map(([x, y]) => {
    const yInvertido = 1 - y;
    return [x, yInvertido] as [number, number];
  });
};

// --- COMPONENTE CAMPO DE FUTEBOL (MEMOIZED PARA PERFORMANCE) ---
// React.memo garante que o campo não seja redesenhado se as props não mudarem
const CampoFutebol = React.memo((props: any) => {
  const {
    jogadores,
    corTime,
    indiceSelecionado,
    modoEdicao,
    posicoes,
    onSelectSlot,
    onRemovePlayer,
    onUpdatePosition,
    onDeselectAll,
    modoConfronto,
    jogadoresAdversario,
    posicoesAdversario,
    indiceAdversarioSelecionado,
    onSelectSlotAdversario,
    onRemovePlayerAdversario,
    onUpdatePositionAdversario,
    corTimeAdversario,
    timeSelecionado,
    timeAdversario,
  } = props;

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const panRefs = useRef<{ [key: number]: Animated.ValueXY }>({});
  const layoutRef = useRef({ width: 0, height: 0 });
  const isDragging = useRef(false);

  const onLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
    layoutRef.current = { width, height };
  };

  const createPanResponder = useCallback(
    (index: number) => {
      if (!panRefs.current[index]) {
        panRefs.current[index] = new Animated.ValueXY();
      }

      const isAdversario = index >= 100;
      const realIndex = isAdversario ? index - 100 : index;

      return PanResponder.create({
        onStartShouldSetPanResponder: () => modoEdicao,
        onMoveShouldSetPanResponder: () => modoEdicao,
        onPanResponderGrant: () => {
          isDragging.current = true;
          panRefs.current[index].setOffset({
            x: (panRefs.current[index] as any)._value?.x || 0,
            y: (panRefs.current[index] as any)._value?.y || 0,
          });
          panRefs.current[index].setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event(
          [null, { dx: panRefs.current[index].x, dy: panRefs.current[index].y }],
          { useNativeDriver: false },
        ),
        onPanResponderRelease: (_, gestureState) => {
          panRefs.current[index].flattenOffset();
          const { width, height } = layoutRef.current;
          const currentPos = isAdversario ? posicoesAdversario[realIndex] : posicoes[realIndex];
          const newX = Math.max(
            0.05,
            Math.min(0.95, currentPos[0] + gestureState.dx / width),
          );
          const newY = Math.max(
            0.05,
            Math.min(0.95, currentPos[1] + gestureState.dy / height),
          );

          if (isAdversario) {
            onUpdatePositionAdversario(realIndex, newX, newY);
          } else {
            onUpdatePosition(realIndex, newX, newY);
          }

          panRefs.current[index].setValue({ x: 0, y: 0 });
          setTimeout(() => {
            isDragging.current = false;
          }, 100);
        },
      });
    },
    [modoEdicao, posicoes, posicoesAdversario, onUpdatePosition, onUpdatePositionAdversario],
  );

  const handleCampoPress = () => {
    if (!isDragging.current) {
      onDeselectAll();
    }
  };

  const { width: w, height: h } = dimensions;
  const raio = Math.max(20, Math.min(w, h) * 0.05); // Garantir mínimo de 20 para evitar fontSize=0
  const wGa = w * 0.6;
  const hGa = h * 0.16;
  const wPa = w * 0.25;
  const hPa = h * 0.06;
  const raioMl = w * 0.09;

  return (
    <TouchableOpacity
      style={styles.campoContainer}
      onLayout={onLayout}
      activeOpacity={1}
      onPress={handleCampoPress}
    >
      {/* Gramado listrado */}
      {[...Array(10)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.faixaGramado,
            {
              top: (h / 10) * i,
              height: h / 10,
              backgroundColor: i % 2 === 0 ? '#3cb371' : '#2E8B57',
            },
          ]}
        />
      ))}

      {/* Linha do meio */}
      <View
        style={[
          styles.linhaMeio,
          { top: h / 2 - 1, left: 5, right: 5, height: 2 },
        ]}
      />

      {/* Círculo central */}
      <View
        style={[
          styles.circuloCentral,
          {
            top: h / 2 - raioMl,
            left: w / 2 - raioMl,
            width: raioMl * 2,
            height: raioMl * 2,
            borderRadius: raioMl,
          },
        ]}
      />

      {/* Ponto central */}
      <View
        style={[
          styles.pontoCentral,
          { top: h / 2 - 4, left: w / 2 - 4, width: 8, height: 8 },
        ]}
      />

      {/* Borda do campo */}
      <View style={[styles.bordaCampo, { top: 5, left: 5, right: 5, bottom: 5 }]} />

      {/* Grande área superior */}
      <View
        style={[
          styles.grandeArea,
          {
            top: 5,
            left: w / 2 - wGa / 2,
            width: wGa,
            height: hGa,
          },
        ]}
      />

      {/* Grande área inferior */}
      <View
        style={[
          styles.grandeArea,
          {
            bottom: 5,
            left: w / 2 - wGa / 2,
            width: wGa,
            height: hGa,
          },
        ]}
      />

      {/* Pequena área superior */}
      <View
        style={[
          styles.pequenaArea,
          {
            top: 5,
            left: w / 2 - wPa / 2,
            width: wPa,
            height: hPa,
          },
        ]}
      />

      {/* Pequena área inferior */}
      <View
        style={[
          styles.pequenaArea,
          {
            bottom: 5,
            left: w / 2 - wPa / 2,
            width: wPa,
            height: hPa,
          },
        ]}
      />

      {/* Marca do pênalti superior */}
      <View
        style={[
          styles.marcaPenalti,
          {
            top: 5 + hGa * 0.7,
            left: w / 2 - 4,
            width: 8,
            height: 8,
          },
        ]}
      />

      {/* Marca do pênalti inferior */}
      <View
        style={[
          styles.marcaPenalti,
          {
            bottom: 5 + hGa * 0.7,
            left: w / 2 - 4,
            width: 8,
            height: 8,
          },
        ]}
      />

      {/* Meia-lua superior */}
      <View
        style={[
          styles.meiaLua,
          {
            top: 5 + hGa - 2,
            left: w / 2 - raioMl,
            width: raioMl * 2,
            height: raioMl,
            borderBottomLeftRadius: raioMl,
            borderBottomRightRadius: raioMl,
            borderTopWidth: 0,
          },
        ]}
      />

      {/* Meia-lua inferior */}
      <View
        style={[
          styles.meiaLua,
          {
            bottom: 5 + hGa - 2,
            left: w / 2 - raioMl,
            width: raioMl * 2,
            height: raioMl,
            borderTopLeftRadius: raioMl,
            borderTopRightRadius: raioMl,
            borderBottomWidth: 0,
          },
        ]}
      />

      {/* Gol superior */}
      <View
        style={[
          styles.gol,
          {
            top: 0,
            left: w / 2 - w * 0.08,
            width: w * 0.16,
            height: 5,
          },
        ]}
      />

      {/* Gol inferior */}
      <View
        style={[
          styles.gol,
          {
            bottom: 0,
            left: w / 2 - w * 0.08,
            width: w * 0.16,
            height: 5,
          },
        ]}
      />

      {/* Jogadores */}
      {posicoes.map((pos: [number, number], i: number) => {
        const cx = w * pos[0];
        const cy = h * pos[1];
        const jogador = jogadores[i];
        const selecionado = indiceSelecionado === i;
        const corFundo = jogador ? corTime : (modoConfronto ? '#FF6B6B' : '#BBBBBB');

        let corTexto = jogador ? (timeSelecionado ? timeSelecionado.corSecundaria : 'white') : 'white';
        let isSplit = false;
        let corTop = '';
        let corBottom = '';

        if (jogador && timeSelecionado) {
          if (timeSelecionado.nome === 'São Paulo') {
            isSplit = true;
            corTop = '#FFFFFF';
            corBottom = '#C8102E';
            corTexto = '#000000';
          } else if (timeSelecionado.nome === 'Grêmio') {
            isSplit = true;
            corTop = '#0097D7';
            corBottom = '#000000';
            corTexto = '#FFFFFF';
          } else if (timeSelecionado.nome === 'Fluminense') {
            isSplit = true;
            corTop = '#00913E';
            corBottom = '#8A1538';
            corTexto = '#FFFFFF';
          }
        }

        const panResponder = createPanResponder(i);

        return (
          <Animated.View
            key={i}
            {...(modoEdicao ? panResponder.panHandlers : {})}
            style={[
              styles.jogadorContainer,
              {
                left: cx - raio,
                top: cy - raio,
                width: raio * 2,
                height: raio * 2,
                transform: modoEdicao && panRefs.current[i]
                  ? panRefs.current[i].getTranslateTransform()
                  : [],
              },
            ]}>
            {/* Borda de seleção */}
            {selecionado && (
              <View
                style={[
                  styles.selecaoBorda,
                  {
                    width: raio * 2 + 8,
                    height: raio * 2 + 8,
                    borderRadius: raio + 4,
                    left: -4,
                    top: -4,
                  },
                ]}
              />
            )}

            <TouchableOpacity
              style={[
                styles.jogadorCirculo,
                {
                  width: raio * 2,
                  height: raio * 2,
                  borderRadius: raio,
                  backgroundColor: isSplit ? 'transparent' : corFundo,
                  borderColor: selecionado ? '#FFFF00' : 'white',
                  overflow: 'hidden', // Importante para clipar as metades
                },
              ]}
              onPress={() => !modoEdicao && onSelectSlot(i)}
              activeOpacity={0.8}>

              {isSplit && (
                <>
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '50%', backgroundColor: corTop }} />
                  <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, bottom: 0, backgroundColor: corBottom }} />
                </>
              )}

              {jogador ? (
                <Text
                  style={[
                    styles.jogadorNumero,
                    { color: corTexto, fontSize: raio * 0.7, zIndex: 10 },
                  ]}>
                  {jogador.numero || '?'}
                </Text>
              ) : (
                !modoEdicao && (
                  <Text
                    style={[
                      styles.jogadorMais,
                      { color: corTexto, fontSize: raio * 1.2, zIndex: 10 },
                    ]}>
                    +
                  </Text>
                )
              )}
            </TouchableOpacity>

            {/* Nome do jogador - COM FORMATAÇÃO */}
            {jogador && (
              <Text style={styles.jogadorNome} numberOfLines={1}>
                {formatarNomeCurto(jogador.nome)}
              </Text>
            )}

            {/* Botão de remover */}
            {selecionado && jogador && !modoEdicao && (
              <TouchableOpacity
                style={styles.botaoRemover}
                onPress={() => onRemovePlayer(i)}>
                <Text style={styles.botaoRemoverTexto}>X</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        );
      })}

      {/* Jogadores Adversários (modo confronto) */}
      {modoConfronto && posicoesAdversario.map((pos: [number, number], i: number) => {
        const cx = w * pos[0];
        const cy = h * pos[1];
        const jogador = jogadoresAdversario[i];
        const selecionado = indiceAdversarioSelecionado === i;

        let corFundo = jogador ? corTimeAdversario : '#87CEEB';
        let corTexto = jogador ? (timeAdversario ? timeAdversario.corSecundaria : 'white') : 'white';
        let isSplit = false;
        let corTop = '';
        let corBottom = '';

        if (jogador && timeAdversario) {
          if (timeAdversario.nome === 'São Paulo') {
            isSplit = true;
            corTop = '#FFFFFF';
            corBottom = '#C8102E';
            corTexto = '#000000';
          } else if (timeAdversario.nome === 'Grêmio') {
            isSplit = true;
            corTop = '#0097D7';
            corBottom = '#000000';
            corTexto = '#FFFFFF';
          } else if (timeAdversario.nome === 'Fluminense') {
            isSplit = true;
            corTop = '#00913E';
            corBottom = '#8A1538';
            corTexto = '#FFFFFF';
          }

          // Respeita a inversão de uniforme alternativo caso as cores sejam colidentes
          if (!isSplit && corTimeAdversario === timeAdversario.corSecundaria) {
            corTexto = timeAdversario.cor;
          }
        }

        const panResponderAdv = createPanResponder(i + 100);

        return (
          <Animated.View
            key={`adv-${i}`}
            {...(modoEdicao ? panResponderAdv.panHandlers : {})}
            style={[
              styles.jogadorContainer,
              {
                left: cx - raio,
                top: cy - raio,
                width: raio * 2,
                height: raio * 2,
                transform: modoEdicao && panRefs.current[i + 100]
                  ? panRefs.current[i + 100].getTranslateTransform()
                  : [],
              },
            ]}>
            {/* Borda de seleção */}
            {selecionado && (
              <View
                style={[
                  styles.selecaoBorda,
                  {
                    width: raio * 2 + 8,
                    height: raio * 2 + 8,
                    borderRadius: raio + 4,
                    left: -4,
                    top: -4,
                  },
                ]}
              />
            )}

            <TouchableOpacity
              style={[
                styles.jogadorCirculo,
                {
                  width: raio * 2,
                  height: raio * 2,
                  borderRadius: raio,
                  backgroundColor: isSplit ? 'transparent' : corFundo,
                  borderColor: selecionado ? '#FFFF00' : 'white',
                  overflow: 'hidden',
                },
              ]}
              onPress={() => !modoEdicao && onSelectSlotAdversario(i)}
              activeOpacity={0.8}>

              {isSplit && (
                <>
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '50%', backgroundColor: corTop }} />
                  <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, bottom: 0, backgroundColor: corBottom }} />
                </>
              )}

              {jogador ? (
                <Text
                  style={[
                    styles.jogadorNumero,
                    { color: corTexto, fontSize: raio * 0.7, zIndex: 10 },
                  ]}>
                  {jogador.numero || '?'}
                </Text>
              ) : (
                !modoEdicao && (
                  <Text
                    style={[
                      styles.jogadorMais,
                      { color: corTexto, fontSize: raio * 1.2, zIndex: 10 },
                    ]}>
                    +
                  </Text>
                )
              )}
            </TouchableOpacity>

            {/* Nome do jogador - COM FORMATAÇÃO */}
            {jogador && (
              <Text style={styles.jogadorNome} numberOfLines={1}>
                {formatarNomeCurto(jogador.nome)}
              </Text>
            )}

            {/* Botão de remover */}
            {selecionado && jogador && !modoEdicao && (
              <TouchableOpacity
                style={styles.botaoRemover}
                onPress={() => onRemovePlayerAdversario(i)}>
                <Text style={styles.botaoRemoverTexto}>X</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        );
      })}
    </TouchableOpacity>
  );
});

// --- COMPONENTE PRINCIPAL ---
const App: React.FC = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [elencoVisible, setElencoVisible] = useState(false);
  const [divisao, setDivisao] = useState('Série A');
  const [times, setTimes] = useState<Time[]>([]);
  const [timeSelecionado, setTimeSelecionado] = useState<Time | null>(null);
  const [esquema, setEsquema] = useState('4-3-3');
  const [esquemaAdversario, setEsquemaAdversario] = useState('4-3-3');
  const [modoMover, setModoMover] = useState(false);
  const [modoConfronto, setModoConfronto] = useState(false);
  const [elenco, setElenco] = useState<Jogador[]>([]);
  const [elencoFiltrado, setElencoFiltrado] = useState<Jogador[]>([]);
  const [elencoAdversario, setElencoAdversario] = useState<Jogador[]>([]);
  const [elencoAdversarioFiltrado, setElencoAdversarioFiltrado] = useState<Jogador[]>([]);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [jogadoresCampo, setJogadoresCampo] = useState<(Jogador | null)[]>(
    Array(11).fill(null),
  );
  const [jogadoresAdversario, setJogadoresAdversario] = useState<(Jogador | null)[]>(
    Array(11).fill(null),
  );
  const [indiceSelecionado, setIndiceSelecionado] = useState<number | null>(null);
  const [indiceAdversarioSelecionado, setIndiceAdversarioSelecionado] = useState<number | null>(null);
  const [posicoes, setPosicoes] = useState<[number, number][]>(
    ESQUEMAS_TATICOS['4-3-3'],
  );
  const [posicoesAdversario, setPosicoesAdversario] = useState<[number, number][]>(
    gerarPosicoesAdversario('4-3-3')
  );
  const [corTime, setCorTime] = useState('#00008B');
  const [timeAdversario, setTimeAdversario] = useState<Time | null>(null);
  const [corTimeAdversario, setCorTimeAdversario] = useState('#1E90FF');

  // Modais de seleção
  const [showDivisaoModal, setShowDivisaoModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showTimeAdversarioModal, setShowTimeAdversarioModal] = useState(false);
  const [showEsquemaModal, setShowEsquemaModal] = useState(false);
  const [showEsquemaAdversarioModal, setShowEsquemaAdversarioModal] = useState(false);

  // Modal adicionar jogador customizado
  const [showAdicionarJogadorModal, setShowAdicionarJogadorModal] = useState(false);
  const [novoJogadorNome, setNovoJogadorNome] = useState('');
  const [novoJogadorNumero, setNovoJogadorNumero] = useState('');

  // Refs
  const campoRef = useRef<View>(null);
  const tutorialMenuRef = useRef<any>(null);
  const tutorialSalvarRef = useRef<any>(null);
  const tutorialCompartilharRef = useRef<any>(null);
  const tutorialElencoRef = useRef<any>(null);
  const tutorialMenuEsquemaRef = useRef<any>(null);
  const tutorialMenuEsquemaConfrontoRef = useRef<any>(null);
  const tutorialMenuConfigRef = useRef<any>(null);
  const tutorialMenuConfrontoRef = useRef<any>(null);
  const tutorialMoverJogadoresRef = useRef<any>(null);

  // --- TUTORIAL ---
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialPos, setTutorialPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const pollIdRef = useRef(0);

  const TUTORIAL_STEPS_CONFIG = [
    { ref: tutorialMenuRef, precisaMenuAberto: false, texto: "Acesse o menu para escolher seu time e configurar o aplicativo." },
    { ref: tutorialMenuConfigRef, precisaMenuAberto: true, texto: "Escolha a divisão, o time e o esquema tático aqui!" },
    { ref: tutorialMoverJogadoresRef, precisaMenuAberto: true, texto: "Ative aqui para poder arrastar os jogadores e reposicioná-los no campo." },
    { ref: tutorialMenuConfrontoRef, precisaMenuAberto: true, texto: "Ative o Modo Confronto para escalar dois times ao mesmo tempo!" },
    { ref: tutorialElencoRef, precisaMenuAberto: false, texto: "Toque aqui para ver o elenco completo do time selecionado!" },
    { ref: campoRef, precisaMenuAberto: false, texto: "Toque nos espaços para escalar, ou ative o 'Mover Jogadores' no menu para arrastá-los.", inside: true },
    { ref: tutorialSalvarRef, precisaMenuAberto: false, texto: "Salve suas escalações para não perder seu progresso." },
    { ref: tutorialCompartilharRef, precisaMenuAberto: false, texto: "Compartilhe sua escalação como imagem com seus amigos!" }
  ];

  const startTutorial = () => {
    setTutorialStep(0);
    setTutorialVisible(true);
    measureTutorialStep(0);
  };

  const measureTutorialStep = (stepIndex: number) => {
    if (stepIndex >= TUTORIAL_STEPS_CONFIG.length) {
      finishTutorial();
      return;
    }

    const currentStep = TUTORIAL_STEPS_CONFIG[stepIndex];
    setMenuVisible(currentStep.precisaMenuAberto);

    const currentPollId = ++pollIdRef.current;
    let lastPos = { x: -1, y: -1, width: -1, height: -1 };
    let stableCount = 0;

    const poll = () => {
      if (pollIdRef.current !== currentPollId) return;

      const ref = currentStep.ref;
      if (ref && ref.current) {
        (ref.current as any).measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          if (width > 0 && height > 0) {
            if (
              Math.abs(pageX - lastPos.x) < 1 &&
              Math.abs(pageY - lastPos.y) < 1 &&
              Math.abs(width - lastPos.width) < 1 &&
              Math.abs(height - lastPos.height) < 1
            ) {
              stableCount++;
            } else {
              stableCount = 0;
              lastPos = { x: pageX, y: pageY, width, height };
            }

            if (stableCount >= 2) {
              setTutorialPos({ x: pageX, y: pageY, width, height });
            } else {
              setTimeout(poll, 50);
            }
          } else {
            setTimeout(poll, 50);
          }
        });
      } else {
        setTimeout(poll, 50);
      }
    };

    poll();
  };

  const nextTutorialStep = () => {
    const next = tutorialStep + 1;
    setTutorialStep(next);
    measureTutorialStep(next);
  };

  const finishTutorial = async () => {
    setTutorialVisible(false);
    await AsyncStorage.setItem('@futebol_app:tutorial_visto_v1', 'true');
  };

  useEffect(() => {
    const checkTutorial = async () => {
      const visto = await AsyncStorage.getItem('@futebol_app:tutorial_visto_v1');
      if (!visto) {
        setTimeout(() => {
          startTutorial();
        }, 1500); // Aguarda renderização completa
      }
    };
    checkTutorial();
  }, []);

  // --- ESTADOS PARA SALVAMENTO (PERSISTÊNCIA) ---
  const [modalSalvarVisible, setModalSalvarVisible] = useState(false);
  const [modalMinhasEscalacoesVisible, setModalMinhasEscalacoesVisible] = useState(false);
  const [nomeEscalacao, setNomeEscalacao] = useState('');
  const [escalacoesSalvas, setEscalacoesSalvas] = useState<any[]>([]);

  const STORAGE_KEY = '@futebol_app:escalacoes_v1';
  const JOGADORES_PERSONALIZADOS_KEY = '@futebol_app:jogadores_personalizados_v1'; // { [idDoTime | 'sem_time']: Jogador[] }
  const OFERTA_PREMIUM_KEY = '@futebol_app:oferta_premium_data';
  const ACOES_POSITIVAS_KEY = '@futebol_app:acoes_positivas';
  const AVALIACAO_PEDIDA_KEY = '@futebol_app:avaliacao_pedida_em';

  // --- ESTADOS NOVOS: PREMIUM & COMPRAS ---
  const [isPremium, setIsPremium] = useState(false); // Controla se remove anúncios
  const [capturandoImagem, setCapturandoImagem] = useState(false); // mostra a faixa "Monte a sua" só na imagem compartilhada
  const [promoMilhaoVisivel, setPromoMilhaoVisivel] = useState(false);
  const [pacoteRemoverAnuncios, setPacoteRemoverAnuncios] = useState<PurchasesPackage | null>(null);
  const premiumAtivoRef = useRef(false); // evita repetir o aviso de "Premium Ativado" a cada abertura

  // --- ESTADO PARA TIMES DESBLOQUEADOS ---
  const [unlockedTeams, setUnlockedTeams] = useState<number[]>([]); // Lista de IDs desbloqueados
  const [rewardedLoaded, setRewardedLoaded] = useState(false);
  const [timeToUnlock, setTimeToUnlock] = useState<{ id: number, type: 'primary' | 'adversary' } | null>(null);
  // Os listeners do premiado são registrados uma vez só; estes refs guardam os valores atuais
  const timeToUnlockRef = useRef(timeToUnlock);
  const unlockedTeamsRef = useRef(unlockedTeams);
  unlockedTeamsRef.current = unlockedTeams;
  const timesRef = useRef(times);
  timesRef.current = times;
  const falhasVideoRef = useRef(0);

  // --- JOGADORES PERSONALIZADOS (salvos no aparelho, por time) ---
  const jogadoresPersonalizadosRef = useRef<{ [chave: string]: Jogador[] }>({});

  // --- LÓGICA DE ANÚNCIOS (INTERSTICIAL) ---
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const ultimoIntersticialRef = useRef(0);
  const intersticiaisNaSessaoRef = useRef(0);

  const isRestoring = useRef(false);

  // 1. Inicializar Compras e Verificar Status
  useEffect(() => {
    const setupPurchases = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

        // Platform-specific API keys
        const iosApiKey = 'test_gzBNHADuXMehLRAsnQvlBeUIsfg';
        const androidApiKey = 'CHAVE_REMOVIDA';

        if (Platform.OS === 'ios') {
          await Purchases.configure({ apiKey: iosApiKey });
        } else if (Platform.OS === 'android') {
          await Purchases.configure({ apiKey: androidApiKey });
        }

        // Verifica se o usuário já é Premium no RevenueCat
        const info = await Purchases.getCustomerInfo();
        if (typeof info.entitlements.active['premium'] !== "undefined") {
          premiumAtivoRef.current = true;
          setIsPremium(true);
        }

        // --- CHECAGEM DE USUÁRIO LEGADO (ANDROID) ---
        // Se ainda não é premium, verifica se o app foi instalado antes da migração
        if (typeof info.entitlements.active['premium'] === "undefined" && Platform.OS === 'android') {
          const installDate = await Application.getInstallationTimeAsync();
          // Se instalou antes da data de corte, ganha premium de graça
          if (installDate.getTime() < DATA_MIGRACAO_PREMIUM) {
            console.log("Usuário Legado Detectado! Liberando Premium.");
            premiumAtivoRef.current = true;
            setIsPremium(true);
          }
        }

        // Carrega o produto da loja (Ofertas)
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.availablePackages.length > 0) {
          setPacoteRemoverAnuncios(offerings.current.availablePackages[0]);
        }

        // --- LISTENER: Atualiza o app assim que a compra acontece (NOVO!) ---
        Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
          // Só avisa quando o Premium acaba de ser ativado (o listener também dispara na abertura)
          if (typeof info.entitlements.active['premium'] !== "undefined" && !premiumAtivoRef.current) {
            premiumAtivoRef.current = true;
            setIsPremium(true);
            Alert.alert("Premium Ativado", "Obrigado! Anúncios removidos.");
            try { analytics().logEvent('premium_purchased'); } catch (e) { }
          }
        });

      } catch (e) {
        console.log("Erro RevenueCat", e);
      }
    };
    setupPurchases();
  }, []);

  // --- NOVO: CARREGAR TIMES DESBLOQUEADOS ---
  useEffect(() => {
    const loadUnlockedTeams = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@futebol_app:unlocked_teams');
        if (jsonValue != null) {
          setUnlockedTeams(JSON.parse(jsonValue));
        }
      } catch (e) { }
    };
    loadUnlockedTeams();
  }, []);

  // --- NOVO: CARREGAR JOGADORES PERSONALIZADOS E O "PRIMEIRO TIME GRÁTIS" ---
  useEffect(() => {
    const carregar = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(JOGADORES_PERSONALIZADOS_KEY);
        if (jsonValue != null) {
          jogadoresPersonalizadosRef.current = JSON.parse(jsonValue);
          // Jogadores criados sem time escolhido aparecem no elenco enquanto nenhum time é selecionado
          const semTime = jogadoresPersonalizadosRef.current['sem_time'] || [];
          if (semTime.length > 0) {
            setElenco(atual => (atual.length > 0 ? atual : semTime));
            setElencoFiltrado(atual => (atual.length > 0 ? atual : semTime));
          }
        }
      } catch (e) { }
    };
    carregar();
  }, []);

  // 2. Inicializar AdMob (Apenas se não for Premium)
  useEffect(() => {
    if (isPremium) return;

    // --- INTERSTICIAL ---
    let tentativas = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      tentativas = 0;
      setInterstitialLoaded(true);
    });

    // Falhou ao carregar (sem internet, sem anúncio disponível...): tenta de novo com espera crescente
    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      setInterstitialLoaded(false);
      try { analytics().logEvent('ad_load_error', { ad_type: 'interstitial', code: String((error as any)?.code ?? '') }); } catch (e) { }
      if (tentativas < ESPERAS_RECARGA_MS.length) {
        timer = setTimeout(() => interstitial.load(), ESPERAS_RECARGA_MS[tentativas]);
        tentativas++;
      }
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setInterstitialLoaded(false);
      interstitial.load();
    });

    interstitial.load();

    return () => {
      unsubscribe();
      unsubscribeError();
      unsubscribeClosed();
      if (timer) clearTimeout(timer);
    };
  }, [isPremium]);

  // Libera um time para sempre e já o seleciona
  const liberarTime = async (id: number, type: 'primary' | 'adversary') => {
    const newList = [...unlockedTeamsRef.current.filter(t => t !== id), id];
    unlockedTeamsRef.current = newList;
    setUnlockedTeams(newList);
    try { await AsyncStorage.setItem('@futebol_app:unlocked_teams', JSON.stringify(newList)); } catch (e) { }

    const timeObj = timesRef.current.find(t => t.id === id);
    if (timeObj) {
      if (type === 'adversary') {
        selecionarTimeAdversario(timeObj);
      } else {
        selecionarTime(timeObj);
      }
    }
  };

  // --- NOVO: LÓGICA DO ANÚNCIO PREMIADO ---
  // Os listeners são registrados uma vez só (antes, cada mudança de estado registrava de novo
  // e pedia outro anúncio ao AdMob).
  useEffect(() => {
    if (isPremium) return; // Premium não carrega anúncios

    let tentativas = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      tentativas = 0;
      setRewardedLoaded(true);
    });

    const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
      setRewardedLoaded(false);
      try { analytics().logEvent('ad_load_error', { ad_type: 'rewarded', code: String((error as any)?.code ?? '') }); } catch (e) { }
      if (tentativas < ESPERAS_RECARGA_MS.length) {
        timer = setTimeout(() => rewardedAd.load(), ESPERAS_RECARGA_MS[tentativas]);
        tentativas++;
      }
    });

    const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, async () => {
      const alvo = timeToUnlockRef.current;
      if (!alvo) return;
      timeToUnlockRef.current = null;
      setTimeToUnlock(null);
      falhasVideoRef.current = 0;
      try { analytics().logEvent('team_unlocked_ad', { time_id: alvo.id }); } catch (e) { }
      await liberarTime(alvo.id, alvo.type);
      Alert.alert("Sucesso! 🔓", "Time desbloqueado e selecionado.");
    });

    const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      setRewardedLoaded(false);
      rewardedAd.load(); // Carrega o próximo
      // Limpa a seleção se fechou sem assistir tudo (com folga, caso a recompensa chegue logo depois)
      setTimeout(() => {
        timeToUnlockRef.current = null;
        setTimeToUnlock(null);
      }, 1000);
    });

    rewardedAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeEarned();
      unsubscribeClosed();
      if (timer) clearTimeout(timer);
    };
  }, [isPremium]);

  // Preço do Premium vindo da loja (muda sozinho quando o preço muda no Play Console)
  const precoPremium = pacoteRemoverAnuncios?.product.priceString ?? '';

  // Função: Comprar Premium (sem anúncios + todos os times)
  const comprarRemocaoAnuncios = async () => {
    if (!pacoteRemoverAnuncios) {
      Alert.alert('Erro', 'Produto não carregado. Verifique conexão ou Play Store.');
      return;
    }
    try {
      const { customerInfo } = await Purchases.purchasePackage(pacoteRemoverAnuncios);
      if (typeof customerInfo.entitlements.active['premium'] !== "undefined" && !premiumAtivoRef.current) {
        premiumAtivoRef.current = true;
        setIsPremium(true);
        Alert.alert("Premium Ativado", "Obrigado! Anúncios removidos e todos os times liberados.");
        try { analytics().logEvent('premium_purchased'); } catch (e) { }
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Erro na compra', e.message);
      }
    }
  };

  // Função: Restaurar Compras
  const restaurarCompras = async () => {
    try {
      const info = await Purchases.restorePurchases();
      if (typeof info.entitlements.active['premium'] !== "undefined") {
        premiumAtivoRef.current = true;
        setIsPremium(true);
        Alert.alert('Restaurado', 'Sua compra foi restaurada.');
      } else {
        Alert.alert('Aviso', 'Nenhuma compra ativa encontrada.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao restaurar.');
    }
  };

  // Oferece o Premium no lugar do 2º intersticial da sessão (no máximo 1 vez por dia).
  // Recusou: segue com o anúncio. Quis comprar: segue sem anúncio, comprando ou não.
  const oferecerPremium = async (comAnuncio: () => void, semAnuncio: () => void) => {
    const hoje = new Date().toDateString();
    try {
      if ((await AsyncStorage.getItem(OFERTA_PREMIUM_KEY)) === hoje) {
        comAnuncio();
        return;
      }
      await AsyncStorage.setItem(OFERTA_PREMIUM_KEY, hoje);
    } catch (e) { }
    try { analytics().logEvent('premium_offer_shown'); } catch (e) { }
    Alert.alert(
      'Cansou dos anúncios? ⭐',
      `Com o Premium você monta seus times sem nenhum anúncio e com todos os times liberados, para sempre.${precoPremium ? ` Por ${precoPremium}, pagando uma vez só.` : ''}`,
      [
        { text: 'Agora não', style: 'cancel', onPress: comAnuncio },
        {
          text: 'Quero o Premium',
          onPress: async () => {
            try { analytics().logEvent('premium_offer_accepted'); } catch (e) { }
            await comprarRemocaoAnuncios();
            semAnuncio();
          },
        },
      ],
      { cancelable: false },
    );
  };

  // Mostra um intersticial (se houver) e depois segue com `depois`.
  // Nunca para Premium e no máximo 1 a cada INTERSTICIAL_INTERVALO_MS, em qualquer ponto do app.
  const mostrarIntersticial = (local: string, depois: () => void = () => { }) => {
    if (isPremium || !interstitialLoaded || Date.now() - ultimoIntersticialRef.current < INTERSTICIAL_INTERVALO_MS) {
      depois();
      return;
    }
    const exibir = () => {
      ultimoIntersticialRef.current = Date.now();
      intersticiaisNaSessaoRef.current += 1;
      try { analytics().logEvent('ad_show', { ad_type: 'interstitial', local }); } catch (e) { }
      const unsubscribeAction = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        unsubscribeAction();
        depois();
      });
      // Se o anúncio não abrir, o app segue normalmente em vez de travar a ação da pessoa
      interstitial.show().catch(() => {
        unsubscribeAction();
        setInterstitialLoaded(false);
        interstitial.load();
        depois();
      });
    };
    if (intersticiaisNaSessaoRef.current === 1 && pacoteRemoverAnuncios) {
      oferecerPremium(exibir, () => {
        ultimoIntersticialRef.current = Date.now(); // conta como a vez do anúncio
        depois();
      });
    } else {
      exibir();
    }
  };

  // --- NOVA FUNÇÃO: TENTAR SELECIONAR TIME (COM BLOQUEIO) ---
  const handleSelectTimeCheck = (time: Time, type: 'primary' | 'adversary') => {
    // Se for Premium OU o time já estiver na lista de desbloqueados: Libera direto
    if (isPremium || unlockedTeams.includes(time.id)) {
      if (type === 'adversary') selecionarTimeAdversario(time);
      else selecionarTime(time);
      return;
    }

    // Time Bloqueado
    Alert.alert(
      "Time Bloqueado 🔒",
      `Assista a um vídeo curto para desbloquear o ${time.nome} permanentemente!`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Assistir (Desbloquear)",
          onPress: () => {
            if (rewardedLoaded) {
              timeToUnlockRef.current = { id: time.id, type };
              setTimeToUnlock({ id: time.id, type });
              try { analytics().logEvent('ad_show', { ad_type: 'rewarded', local: 'desbloquear_time' }); } catch (e) { }
              rewardedAd.show().catch(() => {
                timeToUnlockRef.current = null;
                setRewardedLoaded(false);
                rewardedAd.load();
                Alert.alert('Vídeo indisponível', 'Não foi possível abrir o vídeo. Tente de novo em alguns segundos.');
              });
              return;
            }

            // Vídeo indisponível (sem internet ou sem anúncio no momento)
            falhasVideoRef.current += 1;
            rewardedAd.load();
            if (falhasVideoRef.current >= FALHAS_VIDEO_PARA_LIBERAR) {
              falhasVideoRef.current = 0;
              try { analytics().logEvent('team_unlocked_fallback', { time_id: time.id }); } catch (e) { }
              liberarTime(time.id, type);
              Alert.alert('Time liberado 🔓', `Não conseguimos carregar o vídeo, então liberamos o ${time.nome} para você mesmo assim.`);
            } else {
              Alert.alert('Vídeo indisponível', 'O vídeo precisa de internet. Confira sua conexão e tente de novo em alguns segundos.');
            }
          }
        }
      ]
    );
  };

  // --- 0. LÓGICA DE UNIFORMES (CORES ALTERNATIVAS) ---
  useEffect(() => {
    if (timeSelecionado) {
      setCorTime(timeSelecionado.cor);
    }
    if (timeAdversario) {
      if (modoConfronto && timeSelecionado && coresSimilares(timeSelecionado.cor, timeAdversario.cor)) {
        setCorTimeAdversario(timeAdversario.corSecundaria);
      } else {
        setCorTimeAdversario(timeAdversario.cor);
      }
    } else {
      setCorTimeAdversario('#1E90FF');
    }
  }, [timeSelecionado, timeAdversario, modoConfronto]);

  // --- 1. CARREGAR DADOS AO INICIAR ---
  useEffect(() => {
    const carregarDoDisco = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          setEscalacoesSalvas(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error("Erro ao carregar escalações", e);
      }
    }
    carregarDoDisco();
  }, []);

  // Conta uma ação bem-sucedida (salvar/compartilhar) e, se for a hora, abre a janela de avaliação
  // do Google Play dentro do app, sem pergunta antes. Devolve true se pediu: nesse caso não
  // mostramos anúncio logo em seguida.
  const talvezPedirAvaliacao = async (): Promise<boolean> => {
    try {
      const acoes = Number((await AsyncStorage.getItem(ACOES_POSITIVAS_KEY)) || '0') + 1;
      await AsyncStorage.setItem(ACOES_POSITIVAS_KEY, String(acoes));
      if (acoes < AVALIACAO_APOS_ACOES) return false;
      const ultimaVez = Number((await AsyncStorage.getItem(AVALIACAO_PEDIDA_KEY)) || '0');
      if (Date.now() - ultimaVez < AVALIACAO_INTERVALO_DIAS * 24 * 60 * 60 * 1000) return false;
      if (!(await StoreReview.hasAction())) return false;
      await AsyncStorage.setItem(AVALIACAO_PEDIDA_KEY, String(Date.now()));
      try { analytics().logEvent('review_requested', { acoes }); } catch (e) { }
      await StoreReview.requestReview();
      return true;
    } catch (e) {
      return false;
    }
  };

  // --- 2. PREPARAR PARA SALVAR ---
  const prepararSalvar = () => {
    if (!timeSelecionado && !modoConfronto) {
      Alert.alert('Vazio', 'Selecione um time ou monte um confronto para salvar.');
      return;
    }
    let sugestao = '';
    if (modoConfronto) {
      const t1 = timeSelecionado?.nome || 'Time A';
      const t2 = timeAdversario?.nome || 'Time B';
      sugestao = `${t1} x ${t2}`;
    } else {
      const t = timeSelecionado?.nome || 'Meu Time';
      sugestao = `${t} (${esquema})`;
    }

    // Sem anúncio antes de salvar: o anúncio só aparece depois que a escalação já está gravada
    setNomeEscalacao(sugestao);
    setModalSalvarVisible(true);
  };

  // --- 3. CONFIRMAR E SALVAR NO DISCO ---
  const confirmarSalvar = async () => {
    if (!nomeEscalacao.trim()) {
      Alert.alert('Erro', 'O nome não pode ficar vazio.');
      return;
    }
    const novaEscalacao = {
      id: Date.now(),
      nome: nomeEscalacao,
      data: new Date().toLocaleDateString(),
      modoConfronto,
      divisao,
      timeSelecionado,
      timeAdversario,
      esquema,
      esquemaAdversario,
      jogadoresCampo,
      jogadoresAdversario,
      posicoes,
      posicoesAdversario,
      corTime,
      corTimeAdversario,
    };
    try {
      const novaLista = [novaEscalacao, ...escalacoesSalvas];
      setEscalacoesSalvas(novaLista);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
      setModalSalvarVisible(false);
      try { analytics().logEvent('lineup_saved', { modo_confronto: modoConfronto, esquema: esquema }); } catch (e) { }
      // A escalação já está gravada; depois do OK vem o pedido de avaliação ou, se não for a hora,
      // o anúncio (se for a vez dele)
      Alert.alert('Sucesso', 'Escalação salva!', [
        {
          text: 'OK',
          onPress: async () => {
            if (await talvezPedirAvaliacao()) return;
            if (await talvezMostrarPromoMilhao()) return;       // de vez em quando, o Milhão no lugar do anúncio
            mostrarIntersticial('salvar');
          },
        },
      ]);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

  // --- 3.1 COMPARTILHAR ESCALAÇÃO ---
  // A imagem leva a faixa "Monte a sua no Você Escala" e vai junto com um texto com o link da loja
  // (no WhatsApp, o link fica clicável embaixo da imagem)
  const compartilharEscalacao = async () => {
    let uri = '';
    try {
      setCapturandoImagem(true);
      await new Promise((r) => setTimeout(r, 120));          // espera a faixa aparecer antes da captura
      uri = await captureRef(campoRef, { format: 'png', quality: 0.9, result: 'tmpfile' });
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível compartilhar a escalação.');
      return;
    } finally {
      setCapturandoImagem(false);
    }

    const nomeEscalacao = modoConfronto
      ? `${timeSelecionado?.nome || 'Time 1'} x ${timeAdversario?.nome || 'Time 2'}`
      : `do ${timeSelecionado?.nome || 'meu time'}`;
    const texto = modoConfronto
      ? `Olha o meu confronto ${nomeEscalacao}! ⚽ Monte o seu no Você Escala: ${linkLoja(PACOTE_VOCE_ESCALA, 'compartilhar', 'escalacao')}`
      : `Olha a minha escalação ${nomeEscalacao}! ⚽ Monte a sua no Você Escala: ${linkLoja(PACOTE_VOCE_ESCALA, 'compartilhar', 'escalacao')}`;

    try {
      const resultado = await Share.open({ url: uri.startsWith('file://') ? uri : `file://${uri}`, type: 'image/png', message: texto, failOnCancel: false });
      if (resultado?.dismissedAction) return;
    } catch (e) {
      // Se a biblioteca falhar, ainda compartilha só a imagem, como antes
      try {
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert('Erro', 'O compartilhamento não está disponível no seu dispositivo.');
          return;
        }
        await Sharing.shareAsync(uri);
      } catch (e2) {
        Alert.alert('Erro', 'Não foi possível compartilhar a escalação.');
        return;
      }
    }
    try { analytics().logEvent('lineup_shared', { modo_confronto: modoConfronto, esquema: esquema }); } catch (e) { }
    talvezPedirAvaliacao();
  };

  // --- PROMOÇÃO CRUZADA: JOGO DO MILHÃO DO FUTEBOL ---
  const abrirMilhao = async (origem: 'cartao' | 'menu') => {
    setPromoMilhaoVisivel(false);
    setMenuVisible(false);
    try { analytics().logEvent('cross_promo_clicked', { destino: 'milhao', origem }); } catch (e) { }
    try {
      const estado = JSON.parse((await AsyncStorage.getItem(PROMO_MILHAO_KEY)) || '{}');
      await AsyncStorage.setItem(PROMO_MILHAO_KEY, JSON.stringify({ ...estado, clicou: true }));
    } catch (e) { }
    const referrer = utm(origem, 'promo_cruzada');
    Linking.openURL(`market://details?id=${PACOTE_MILHAO}&referrer=${referrer}`)
      .catch(() => Linking.openURL(linkLoja(PACOTE_MILHAO, origem, 'promo_cruzada')).catch(() => { }));
  };

  // --- PROMOÇÃO CRUZADA: FOOTBALL DRAFT (só o item fixo do menu) ---
  const abrirFootballDraft = () => {
    setMenuVisible(false);
    try { analytics().logEvent('cross_promo_clicked', { destino: 'football_draft', origem: 'menu' }); } catch (e) { }
    const referrer = utm('menu', 'promo_cruzada');
    Linking.openURL(`market://details?id=${PACOTE_FOOTBALL_DRAFT}&referrer=${referrer}`)
      .catch(() => Linking.openURL(linkLoja(PACOTE_FOOTBALL_DRAFT, 'menu', 'promo_cruzada')).catch(() => { }));
  };

  // Mostra o cartão do Milhão se for a hora (devolve true se mostrou: aí não vem intersticial em seguida)
  const talvezMostrarPromoMilhao = async (): Promise<boolean> => {
    if (isPremium) return false;
    try {
      const acoes = Number((await AsyncStorage.getItem(ACOES_POSITIVAS_KEY)) || '0');
      if (acoes < 2) return false;
      const estado = JSON.parse((await AsyncStorage.getItem(PROMO_MILHAO_KEY)) || '{}');
      if (estado.clicou || (estado.vezes || 0) >= PROMO_MILHAO_MAX_VEZES) return false;
      if (Date.now() - (estado.ultima || 0) < PROMO_MILHAO_INTERVALO_DIAS * 24 * 60 * 60 * 1000) return false;
      await AsyncStorage.setItem(PROMO_MILHAO_KEY, JSON.stringify({ ...estado, vezes: (estado.vezes || 0) + 1, ultima: Date.now() }));
      try { analytics().logEvent('cross_promo_shown', { destino: 'milhao' }); } catch (e) { }
      setPromoMilhaoVisivel(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  // --- 4. CARREGAR ESCALAÇÃO ---
  const carregarEscalacao = (item: any) => {
    Alert.alert(
      'Carregar',
      `Substituir a tela atual por "${item.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim',
          onPress: () => {
            isRestoring.current = true;
            setDivisao(item.divisao || 'Série A');
            buscarTimesPlanilha(item.divisao || 'Série A');
            setModoConfronto(item.modoConfronto);
            setTimeSelecionado(item.timeSelecionado);
            if (item.timeSelecionado) buscarElenco(item.timeSelecionado.id);
            setTimeAdversario(item.timeAdversario);
            if (item.timeAdversario) buscarElencoAdversario(item.timeAdversario.id);
            setEsquema(item.esquema);
            setEsquemaAdversario(item.esquemaAdversario);
            setJogadoresCampo(item.jogadoresCampo);
            setJogadoresAdversario(item.jogadoresAdversario);
            setPosicoes(item.posicoes);
            setPosicoesAdversario(item.posicoesAdversario);
            setCorTime(item.corTime);
            setCorTimeAdversario(item.corTimeAdversario);
            setModalMinhasEscalacoesVisible(false);
            setMenuVisible(false);
            setTimeout(() => {
              isRestoring.current = false;
            }, 500);
          }
        }
      ]
    );
  };

  // --- 5. DELETAR ESCALAÇÃO ---
  const deletarEscalacao = async (id: number) => {
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim', style: 'destructive',
        onPress: async () => {
          const novaLista = escalacoesSalvas.filter(i => i.id !== id);
          setEscalacoesSalvas(novaLista);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
        }
      }
    ]);
  };

  // Buscar times da Wikipedia
  const buscarTimesPlanilha = useCallback(async (div: string) => {
    setLoading(true);
    // LÓGICA ESPECIAL PARA COPA DO MUNDO
    if (div === 'Copa do Mundo') {
      const timesCopaIds = Object.keys(MAPA_IDS_COPA).map(id => parseInt(id));
      const timesCopa = DB_TIMES.filter(t => timesCopaIds.includes(t.id));
      timesCopa.sort((a, b) => a.nome.localeCompare(b.nome));
      setTimes(timesCopa);
      setLoading(false);
      return;
    }
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQRrionyAwO3n3GxvyKC4Yb4iSGt7JdmuJez7_8eMPh2gwOM8f0d7aI-bSvJyC-RgJ9B5K8WIBnJcpI/pub?output=csv';

    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const linhas = csvText.split('\n').map(linha => linha.trim()).filter(linha => linha);
      const serieA: string[] = [];
      const serieB: string[] = [];

      for (let i = 1; i < linhas.length; i++) {
        const colunas = linhas[i].split(',').map(col => col.trim());
        if (colunas[0]) serieA.push(colunas[0]);
        if (colunas[1]) serieB.push(colunas[1]);
      }

      const nomesTimes = div === 'Série A' ? serieA : serieB;
      const timesFinais: Time[] = [];
      for (const nomeTime of nomesTimes) {
        const nClean = removeAccents(nomeTime.toLowerCase().trim());
        for (const timeDb of DB_TIMES) {
          const dbClean = removeAccents(timeDb.nome.toLowerCase().trim());
          if (dbClean === nClean) {
            if (!timesFinais.find(t => t.id === timeDb.id)) {
              timesFinais.push(timeDb);
            }
            break;
          }
        }
      }
      timesFinais.sort((a, b) => a.nome.localeCompare(b.nome));
      setTimes(timesFinais.length > 0 ? timesFinais : DB_TIMES.slice(0, 20));
    } catch (error) {
      const fallbackTimes = DB_TIMES.slice(0, 20);
      setTimes(fallbackTimes);
    }
    setLoading(false);
  }, []);

  // Buscar elenco do GitHub
  const buscarElencoGitHub = async (timeId: number): Promise<Jogador[]> => {
    try {
      if (MAPA_IDS_COPA[timeId]) {
        const response = await fetch(ELENCOS_COPA_URL);
        const data = await response.json();
        const nomeTimeIngles = MAPA_IDS_COPA[timeId];

        const timeData = data.teams.find((t: any) => t.team === nomeTimeIngles);
        if (!timeData || !timeData.players) return [];

        const elenco: Jogador[] = timeData.players.map((j: any, index: number) => {
          let pos = j.position;
          if (pos === 'goleiro') pos = 'Goleiro';
          else if (pos === 'defensor') pos = 'Defensor';
          else if (pos === 'meia') pos = 'Meio-Campo';
          else if (pos === 'atacante') pos = 'Atacante';

          return {
            id: parseInt(`${timeId}${index}`),
            nome: j.name,
            posicao: pos,
            numero: j.number,
          };
        });
        return elenco;
      } else {
        const response = await fetch(ELENCOS_JSON_URL);
        const data = await response.json();
        const elencoRaw = data.elencos[timeId.toString()];
        if (!elencoRaw) return [];
        const elenco: Jogador[] = elencoRaw.map((j: any) => ({
          id: j.id,
          nome: j.nome,
          posicao: traduzirPosicao(j.posicao),
          numero: j.numero,
        }));
        return elenco;
      }
    } catch (error) {
      return [];
    }
  };

  // Junta ao elenco oficial os jogadores personalizados salvos para esse time
  // (também funciona sem internet: aí o elenco mostra só os personalizados)
  const comPersonalizados = (chave: number | 'sem_time', jogadores: Jogador[]) => {
    const extras = jogadoresPersonalizadosRef.current[String(chave)] || [];
    const ids = new Set(jogadores.map(j => j.id));
    return [...jogadores, ...extras.filter(j => !ids.has(j.id))];
  };

  // Buscar elenco da API
  const buscarElenco = useCallback(async (timeId: number) => {
    setLoading(true);
    try {
      const jogadores = comPersonalizados(timeId, await buscarElencoGitHub(timeId));
      if (jogadores.length > 0) {
        jogadores.sort((a, b) => a.nome.localeCompare(b.nome));
        setElenco(jogadores);
        setElencoFiltrado(jogadores);
      } else {
        setElenco([]);
        setElencoFiltrado([]);
      }
    } catch (error) {
      setElenco([]);
      setElencoFiltrado([]);
    }
    setLoading(false);
  }, []);

  const buscarElencoAdversario = useCallback(async (timeId: number) => {
    setLoading(true);
    try {
      const jogadores = comPersonalizados(timeId, await buscarElencoGitHub(timeId));
      if (jogadores.length > 0) {
        jogadores.sort((a, b) => a.nome.localeCompare(b.nome));
        setElencoAdversario(jogadores);
        setElencoAdversarioFiltrado(jogadores);
      } else {
        setElencoAdversario([]);
        setElencoAdversarioFiltrado([]);
      }
    } catch (error) {
      setElencoAdversario([]);
      setElencoAdversarioFiltrado([]);
    }
    setLoading(false);
  }, []);

  // Inicialização
  useEffect(() => {
    buscarTimesPlanilha('Série A');
  }, [buscarTimesPlanilha]);

  // Recalcular posições quando modo confronto é ativado/desativado
  useEffect(() => {
    if (isRestoring.current) return;
    if (modoConfronto) {
      const p1 = ESQUEMAS_TATICOS[esquema].map(p => [...p] as [number, number]);
      const p2 = gerarPosicoesAdversario(esquemaAdversario).map(p => [...p] as [number, number]);

      p2[0][1] = Math.max(0.05, p2[0][1] - 0.05);

      const DISTANCIA_SEGURANCA_Y = 0.09;
      const DISTANCIA_SEGURANCA_X = 0.09;

      for (let i = 0; i < p2.length; i++) {
        const azul = p2[i];
        for (let j = 0; j < p1.length; j++) {
          const vermelho = p1[j];
          const dy = azul[1] - vermelho[1];
          const dx = azul[0] - vermelho[0];
          if (Math.abs(dx) < DISTANCIA_SEGURANCA_X && Math.abs(dy) < DISTANCIA_SEGURANCA_Y) {
            if (azul[1] <= vermelho[1]) {
              azul[1] = Math.max(0.02, vermelho[1] - DISTANCIA_SEGURANCA_Y);
            } else {
              azul[1] = Math.min(0.98, vermelho[1] + DISTANCIA_SEGURANCA_Y);
            }
          }
        }
      }
      setPosicoes(p1);
      setPosicoesAdversario(p2);
    } else {
      setPosicoes([...ESQUEMAS_TATICOS[esquema]]);
      setPosicoesAdversario(gerarPosicoesAdversario(esquemaAdversario));
    }
  }, [modoConfronto, esquema, esquemaAdversario]);

  // Filtrar jogadores
  useEffect(() => {
    if (buscaTexto.trim() === '') {
      setElencoFiltrado(elenco);
      setElencoAdversarioFiltrado(elencoAdversario);
    } else {
      const textoBusca = removeAccents(buscaTexto.toLowerCase());
      setElencoFiltrado(
        elenco.filter(j =>
          removeAccents(j.nome.toLowerCase()).includes(textoBusca),
        ),
      );
      setElencoAdversarioFiltrado(
        elencoAdversario.filter(j =>
          removeAccents(j.nome.toLowerCase()).includes(textoBusca),
        ),
      );
    }
  }, [buscaTexto, elenco, elencoAdversario]);

  const mudarEsquema = (novoEsquema: string) => {
    setEsquema(novoEsquema);
    setPosicoes([...ESQUEMAS_TATICOS[novoEsquema]]);
  };

  const mudarEsquemaAdversario = (novoEsquema: string) => {
    setEsquemaAdversario(novoEsquema);
    setPosicoesAdversario(gerarPosicoesAdversario(novoEsquema));
  };

  const mudarDivisao = (novaDivisao: string) => {
    setDivisao(novaDivisao);
    buscarTimesPlanilha(novaDivisao);
    setTimeSelecionado(null);
    setTimeAdversario(null);
    const semTime = comPersonalizados('sem_time', []);
    setElenco(semTime);
    setElencoFiltrado(semTime);
    setElencoAdversario([]);
    setElencoAdversarioFiltrado([]);
    setJogadoresCampo(Array(11).fill(null));
    setJogadoresAdversario(Array(11).fill(null));
  };

  const selecionarTime = (time: Time) => {
    setTimeSelecionado(time);
    setJogadoresCampo(Array(11).fill(null));
    setIndiceSelecionado(null);
    buscarElenco(time.id);
    setShowTimeModal(false);
  };

  const selecionarTimeAdversario = (time: Time) => {
    setTimeAdversario(time);
    setJogadoresAdversario(Array(11).fill(null));
    setIndiceAdversarioSelecionado(null);
    buscarElencoAdversario(time.id);
    setShowTimeAdversarioModal(false);
  };

  const selecionarSlot = (index: number) => {
    if (modoMover) return;
    setIndiceSelecionado(index);
    setIndiceAdversarioSelecionado(null);
    setElencoVisible(true);
  };

  const selecionarSlotAdversario = (index: number) => {
    if (modoMover) return;
    setIndiceAdversarioSelecionado(index);
    setIndiceSelecionado(null);
    setElencoVisible(true);
  };

  const escalarJogador = (jogador: Jogador) => {
    if (indiceAdversarioSelecionado !== null) {
      if (jogadoresAdversario.some(j => j?.id === jogador.id)) {
        Alert.alert('Erro', `${jogador.nome} já está escalado no time adversário!`);
        return;
      }
      const novoJogadores = [...jogadoresAdversario];
      novoJogadores[indiceAdversarioSelecionado] = jogador;
      setJogadoresAdversario(novoJogadores);
      setIndiceAdversarioSelecionado(null);
      setElencoVisible(false);
      return;
    }

    if (indiceSelecionado === null) {
      Alert.alert('Atenção', 'Selecione uma posição no campo primeiro!');
      return;
    }

    if (jogadoresCampo.some(j => j?.id === jogador.id)) {
      Alert.alert('Erro', `${jogador.nome} já está escalado!`);
      return;
    }

    const novoJogadores = [...jogadoresCampo];
    novoJogadores[indiceSelecionado] = jogador;
    setJogadoresCampo(novoJogadores);
    setIndiceSelecionado(null);
    setElencoVisible(false);
  };

  const removerJogador = (index: number) => {
    const novoJogadores = [...jogadoresCampo];
    novoJogadores[index] = null;
    setJogadoresCampo(novoJogadores);
    setIndiceSelecionado(null);
  };

  const removerJogadorAdversario = (index: number) => {
    const novoJogadores = [...jogadoresAdversario];
    novoJogadores[index] = null;
    setJogadoresAdversario(novoJogadores);
    setIndiceAdversarioSelecionado(null);
  };

  const atualizarPosicao = (index: number, x: number, y: number) => {
    const novasPosicoes = [...posicoes];
    novasPosicoes[index] = [x, y];
    setPosicoes(novasPosicoes);
  };

  const atualizarPosicaoAdversario = (index: number, x: number, y: number) => {
    const novasPosicoes = [...posicoesAdversario];
    novasPosicoes[index] = [x, y];
    setPosicoesAdversario(novasPosicoes);
  };

  const desselecionarTudo = () => {
    setIndiceSelecionado(null);
    setIndiceAdversarioSelecionado(null);
  };

  const adicionarJogadorCustomizado = () => {
    if (!novoJogadorNome.trim()) {
      Alert.alert('Erro', 'Digite o nome do jogador');
      return;
    }
    const numero = novoJogadorNumero.trim() ? parseInt(novoJogadorNumero) : null;
    const novoJogador: Jogador = {
      id: Date.now(),
      nome: novoJogadorNome.trim(),
      posicao: 'Personalizado',
      numero: numero,
    };

    // Grava no aparelho, ligado ao time: o jogador continua lá ao trocar de time ou fechar o app
    const timeDoJogador = indiceAdversarioSelecionado !== null ? timeAdversario : timeSelecionado;
    const chave = String(timeDoJogador?.id ?? 'sem_time');
    const mapa = { ...jogadoresPersonalizadosRef.current };
    mapa[chave] = [...(mapa[chave] || []), novoJogador];
    jogadoresPersonalizadosRef.current = mapa;
    AsyncStorage.setItem(JOGADORES_PERSONALIZADOS_KEY, JSON.stringify(mapa)).catch(() => { });

    if (indiceAdversarioSelecionado !== null) {
      const novoElenco = [...elencoAdversario, novoJogador];
      novoElenco.sort((a, b) => a.nome.localeCompare(b.nome));
      setElencoAdversario(novoElenco);
      setElencoAdversarioFiltrado(novoElenco);
    } else {
      const novoElenco = [...elenco, novoJogador];
      novoElenco.sort((a, b) => a.nome.localeCompare(b.nome));
      setElenco(novoElenco);
      setElencoFiltrado(novoElenco);
    }
    setNovoJogadorNome('');
    setNovoJogadorNumero('');
    setShowAdicionarJogadorModal(false);
    Alert.alert('Sucesso', `${novoJogador.nome} foi adicionado ao elenco!`);
    try { analytics().logEvent('custom_player_created'); } catch (e) { }
  };

  const limparCampo = () => {
    Alert.alert(
      'Limpar Campo',
      modoConfronto
        ? 'Deseja remover todos os jogadores de ambos os times?'
        : 'Deseja remover todos os jogadores do campo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            try { analytics().logEvent('field_cleared'); } catch (e) { }
            setJogadoresCampo(Array(11).fill(null));
            setJogadoresAdversario(Array(11).fill(null));
            setIndiceSelecionado(null);
            setIndiceAdversarioSelecionado(null);
          },
        },
      ]
    );
  };

  // --- RENDERIZADOR DE ITEM PARA FLATLIST (Otimização) ---
  const renderJogadorItem = ({ item: j }: { item: Jogador }) => {
    const isAdversarioContext = indiceAdversarioSelecionado !== null;
    const listaParaChecar = isAdversarioContext ? jogadoresAdversario : jogadoresCampo;
    const jaEscalado = listaParaChecar.some(p => p?.id === j.id);

    return (
      <View
        key={j.id}
        style={[
          styles.jogadorCard,
          jaEscalado && { opacity: 0.5, backgroundColor: '#0f172a' }
        ]}>
        <View style={styles.jogadorInfo}>
          <Text style={[
            styles.jogadorNumeroCard,
            jaEscalado && { color: '#888' }
          ]}>
            {j.numero || '-'}
          </Text>
          <View style={styles.jogadorDetalhes}>
            <Text style={[
              styles.jogadorNomeCard,
              jaEscalado && { color: '#aaa' }
            ]}>
              {j.nome}
            </Text>
            <Text style={styles.jogadorPosicao}>
              {j.posicao?.substring(0, 3).toUpperCase() || '?'}
              {jaEscalado ? ' • SELECIONADO' : ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.botaoEscalar,
            jaEscalado && { backgroundColor: '#444' }
          ]}
          disabled={jaEscalado}
          onPress={() => escalarJogador(j)}>
          <Text style={[
            styles.botaoEscalarTexto,
            jaEscalado && { color: '#888' }
          ]}>
            {jaEscalado ? '✓' : '+'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTutorialOverlay = () => {
    if (!tutorialVisible) return null;
    const stepText = TUTORIAL_STEPS_CONFIG[tutorialStep]?.texto || "";

    return (
      <View style={StyleSheet.absoluteFill}>
        {/* Top mask */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: tutorialPos.y, backgroundColor: 'rgba(0,0,0,0.8)' }} />
        {/* Bottom mask */}
        <View style={{ position: 'absolute', top: tutorialPos.y + tutorialPos.height, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)' }} />
        {/* Left mask */}
        <View style={{ position: 'absolute', top: tutorialPos.y, left: 0, width: tutorialPos.x, height: tutorialPos.height, backgroundColor: 'rgba(0,0,0,0.8)' }} />
        {/* Right mask */}
        <View style={{ position: 'absolute', top: tutorialPos.y, left: tutorialPos.x + tutorialPos.width, right: 0, height: tutorialPos.height, backgroundColor: 'rgba(0,0,0,0.8)' }} />

        {/* Highlight border */}
        <View style={{
          position: 'absolute',
          top: tutorialPos.y - 4,
          left: tutorialPos.x - 4,
          width: tutorialPos.width + 8,
          height: tutorialPos.height + 8,
          borderWidth: 2,
          borderColor: '#4CAF50',
          borderRadius: 8,
        }} />

        {/* Tooltip */}
        <View style={{
          position: 'absolute',
          top: TUTORIAL_STEPS_CONFIG[tutorialStep]?.inside
            ? tutorialPos.y + (tutorialPos.height / 2) - 80
            : (tutorialPos.y > Dimensions.get('window').height / 2
              ? Math.max(50, tutorialPos.y - 150)
              : tutorialPos.y + tutorialPos.height + 20),
          left: 20,
          right: 20,
          backgroundColor: '#16213e',
          padding: 20,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#4CAF50',
          alignItems: 'center',
        }}>
          <Text style={{ color: 'white', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            {stepText}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <TouchableOpacity onPress={finishTutorial}>
              <Text style={{ color: '#888', fontSize: 14, padding: 10 }}>Pular tutorial</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextTutorialStep} style={{ backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{tutorialStep === TUTORIAL_STEPS_CONFIG.length - 1 ? "Concluir" : "Próximo"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            ref={tutorialMenuRef}
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>

          <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }} pointerEvents="none">
            <Image
              source={require('./assets/logo.png')}
              style={styles.logoApp}
              resizeMode="contain"
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={startTutorial} style={{ marginRight: 15 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>?</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              ref={tutorialElencoRef}
              style={styles.elencoButton}
              onPress={() => setElencoVisible(true)}>
              <View style={styles.camisetaIcon}>
                <View style={styles.camisetaCorpo} />
                <View style={styles.camisetaGolaV} />
                <View style={styles.camisetaMangaEsq} />
                <View style={styles.camisetaMangaDir} />
                <Text style={styles.camisetaNumero}>10</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Campo */}
        <View style={styles.campoWrapper}>
          <View ref={campoRef} collapsable={false} style={{ flex: 1 }}>
            <CampoFutebol
              esquema={esquema}
              jogadores={jogadoresCampo}
              corTime={corTime}
              indiceSelecionado={indiceSelecionado}
              modoEdicao={modoMover}
              posicoes={posicoes}
              onSelectSlot={selecionarSlot}
              onRemovePlayer={removerJogador}
              onUpdatePosition={atualizarPosicao}
              onDeselectAll={desselecionarTudo}
              modoConfronto={modoConfronto}
              jogadoresAdversario={jogadoresAdversario}
              posicoesAdversario={posicoesAdversario}
              indiceAdversarioSelecionado={indiceAdversarioSelecionado}
              onSelectSlotAdversario={selecionarSlotAdversario}
              onRemovePlayerAdversario={removerJogadorAdversario}
              onUpdatePositionAdversario={atualizarPosicaoAdversario}
              corTimeAdversario={corTimeAdversario}
              timeSelecionado={timeSelecionado} // Passando objeto do time principal
              timeAdversario={timeAdversario}   // Passando objeto do adversário
            />
            {/* Faixa que só aparece na imagem compartilhada */}
            {capturandoImagem && (
              <View style={styles.faixaCompartilharLinha} pointerEvents="none">
                <View style={styles.faixaCompartilhar}>
                  <Text style={styles.faixaCompartilharTexto}>⚽ Monte a sua no Você Escala</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Info bar */}
        <View style={styles.infoBar}>
          <View style={styles.infoTextos}>
            {modoConfronto ? (
              (timeSelecionado && timeAdversario) ? (
                <Text style={styles.infoText} numberOfLines={2}>
                  {timeSelecionado.nome} x {timeAdversario.nome}
                </Text>
              ) : null
            ) : (
              timeSelecionado ? (
                <Text style={styles.infoText} numberOfLines={2}>
                  {timeSelecionado.nome} • {esquema}
                </Text>
              ) : null
            )}
          </View>

          <View style={styles.infoBotoes}>
            <TouchableOpacity
              ref={tutorialSalvarRef}
              style={styles.botaoSalvar}
              onPress={prepararSalvar}>
              <Text style={styles.botaoSalvarTexto}>💾 Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              ref={tutorialCompartilharRef}
              style={[styles.botaoSalvar, { backgroundColor: '#4CAF50', paddingHorizontal: 12 }]}
              onPress={compartilharEscalacao}>
              <Ionicons name="share-social" size={16} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoLimpar}
              onPress={limparCampo}>
              <Text style={styles.botaoLimparTexto}>🗑️ Limpar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal Menu Lateral */}
        <Modal
          visible={menuVisible}
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          onRequestClose={() => setMenuVisible(false)}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}>
              <TouchableOpacity activeOpacity={1} style={styles.menuLateral}>
                {/* Rola em telas baixas: com os itens de divulgação o menu passa da altura da tela */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.menuTitulo}>Configurações</Text>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setModalMinhasEscalacoesVisible(true)}>
                  <Text style={styles.menuItemLabel}>📂 Minhas Escalações</Text>
                  <Text style={styles.menuItemValue}>{escalacoesSalvas.length}</Text>
                </TouchableOpacity>

                <View ref={tutorialMenuConfigRef} collapsable={false}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setShowDivisaoModal(true)}>
                    <Text style={styles.menuItemLabel}>Divisão</Text>
                    <Text style={styles.menuItemValue}>{divisao}</Text>
                  </TouchableOpacity>

                  {!modoConfronto ? (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => setShowTimeModal(true)}>
                      <Text style={styles.menuItemLabel}>Time</Text>
                      <Text style={styles.menuItemValue}>
                        {timeSelecionado?.nome || 'Selecione'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setShowTimeModal(true)}>
                        <Text style={styles.menuItemLabel}>Time 1 (Vermelho)</Text>
                        <Text style={styles.menuItemValue}>
                          {timeSelecionado?.nome || 'Selecione'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setShowTimeAdversarioModal(true)}>
                        <Text style={styles.menuItemLabel}>Time 2 (Azul)</Text>
                        <Text style={styles.menuItemValue}>
                          {timeAdversario?.nome || 'Selecione'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {!modoConfronto ? (
                    <TouchableOpacity
                      ref={tutorialMenuEsquemaRef}
                      style={styles.menuItem}
                      onPress={() => setShowEsquemaModal(true)}>
                      <Text style={styles.menuItemLabel}>Esquema Tático</Text>
                      <Text style={styles.menuItemValue}>{esquema}</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        ref={tutorialMenuEsquemaRef}
                        style={styles.menuItem}
                        onPress={() => setShowEsquemaModal(true)}>
                        <Text style={styles.menuItemLabel}>Esquema Time 1</Text>
                        <Text style={styles.menuItemValue}>{esquema}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setShowEsquemaAdversarioModal(true)}>
                        <Text style={styles.menuItemLabel}>Esquema Time 2</Text>
                        <Text style={styles.menuItemValue}>{esquemaAdversario}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                <TouchableOpacity
                  ref={tutorialMoverJogadoresRef}
                  style={styles.menuItem}
                  onPress={() => setModoMover(!modoMover)}>
                  <Text style={styles.menuItemLabel}>Mover Jogadores</Text>
                  <View
                    style={[
                      styles.toggle,
                      modoMover && styles.toggleAtivo,
                    ]}>
                    <Text style={styles.toggleTexto}>
                      {modoMover ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  ref={tutorialMenuConfrontoRef}
                  style={styles.menuItem}
                  onPress={() => {
                    // LÓGICA DO ANÚNCIO RESTAURADA AQUI
                    if (!modoConfronto) {
                      // Se for ligar, mostra anúncio (se tiver carregado e não for premium)
                      mostrarIntersticial('confronto', () => setModoConfronto(true));
                    } else {
                      // Se for desligar, é direto
                      setModoConfronto(false);
                    }
                  }}>
                  <Text style={styles.menuItemLabel}>Modo Confronto</Text>
                  <View
                    style={[
                      styles.toggle,
                      modoConfronto && styles.toggleAtivo,
                    ]}>
                    <Text style={styles.toggleTexto}>
                      {modoConfronto ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Promoção cruzada fixa (para todos, inclusive Premium: só abre se a pessoa tocar) */}
                <TouchableOpacity style={styles.menuItem} onPress={() => abrirMilhao('menu')}>
                  <Text style={styles.menuItemLabel}>🏆 Jogo do Milhão do Futebol</Text>
                  <Text style={styles.menuItemValue}>Jogar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={abrirFootballDraft}>
                  <Text style={styles.menuItemLabel}>⚽ Football Draft</Text>
                  <Text style={styles.menuItemValue}>Jogar</Text>
                </TouchableOpacity>

                {/* === PREMIUM (sem anúncios + todos os times) === */}
                {!isPremium && (
                  <TouchableOpacity style={[styles.menuItem, { backgroundColor: '#2a2a40' }]} onPress={comprarRemocaoAnuncios}>
                    <Text style={[styles.menuItemLabel, { color: '#FFD700', fontWeight: 'bold' }]}>⭐ Premium sem anúncios</Text>
                    <Text style={styles.menuItemValue}>{precoPremium}</Text>
                  </TouchableOpacity>
                )}

                {/* === RESTAURAR COMPRA === */}
                {!isPremium && (
                  <TouchableOpacity style={styles.menuItem} onPress={restaurarCompras}>
                    <Text style={styles.menuItemLabel}>Restaurar Compras</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.menuFechar}
                  onPress={() => setMenuVisible(false)}>
                  <Text style={styles.menuFecharTexto}>Fechar</Text>
                </TouchableOpacity>

                {/* BANNER EXTRA NO MENU */}
                {!isPremium && (
                  <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <BannerAd
                      unitId={adUnitIdBanner}
                      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    />
                  </View>
                )}
                </ScrollView>

              </TouchableOpacity>
            </TouchableOpacity>

            {/* Tutorial Overlay quando Menu está aberto */}
            {tutorialVisible && renderTutorialOverlay()}
          </View>
        </Modal>

        {/* Modal Divisão */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showDivisaoModal}
          onRequestClose={() => setShowDivisaoModal(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDivisaoModal(false)}>
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitulo}>Selecione a Divisão</Text>
              {['Série A', 'Série B', 'Copa do Mundo'].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.pickerItem,
                    divisao === d && styles.pickerItemSelecionado,
                    // Estilo especial centralizado para o botão da Copa
                    d === 'Copa do Mundo' && {
                      backgroundColor: divisao === d ? '#D4AF37' : '#2a2a40',
                      marginTop: 15,
                      borderWidth: 1,
                      borderColor: '#D4AF37',
                      justifyContent: 'center'
                    }
                  ]}
                  onPress={() => {
                    mudarDivisao(d);
                    setShowDivisaoModal(false);
                  }}>

                  {/* Imagem renderizada APENAS se o botão for o da Copa do Mundo */}
                  {d === 'Copa do Mundo' && (
                    <Image
                      source={require('./assets/logo_copa.png')}
                      style={{ width: 24, height: 24, marginRight: 8 }}
                      resizeMode="contain"
                    />
                  )}

                  <Text
                    style={[
                      styles.pickerItemTexto,
                      divisao === d && styles.pickerItemTextoSelecionado,
                      d === 'Copa do Mundo' && {
                        color: divisao === d ? '#000' : '#D4AF37',
                        fontWeight: 'bold'
                      }
                    ]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Time (COM BLOQUEIO) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showTimeModal}
          onRequestClose={() => setShowTimeModal(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimeModal(false)}>
            <View style={styles.pickerModalGrande}>
              <Text style={styles.pickerTitulo}>
                {modoConfronto ? 'Selecione Time 1 (Vermelho)' : 'Selecione o Time'}
              </Text>
              {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
              ) : (
                <ScrollView style={styles.listaTimesScroll}>
                  {times.map(t => {
                    const isLocked = !isPremium && !unlockedTeams.includes(t.id);
                    return (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.pickerItem,
                          timeSelecionado?.id === t.id && styles.pickerItemSelecionado,
                          isLocked && { opacity: 0.7, backgroundColor: '#222' } // Estilo visual bloqueado
                        ]}
                        onPress={() => handleSelectTimeCheck(t, 'primary')}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <View
                            style={[styles.corIndicador, { backgroundColor: t.cor }]}
                          />
                          <Text
                            style={[
                              styles.pickerItemTexto,
                              timeSelecionado?.id === t.id && styles.pickerItemTextoSelecionado,
                              isLocked && { color: '#aaa' }
                            ]}>
                            {t.nome}
                          </Text>
                        </View>
                        {/* Cadeado */}
                        {isLocked && (
                          <Text style={{ fontSize: 16 }}>🔒</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Time Adversário (COM BLOQUEIO) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showTimeAdversarioModal}
          onRequestClose={() => setShowTimeAdversarioModal(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimeAdversarioModal(false)}>
            <View style={styles.pickerModalGrande}>
              <Text style={styles.pickerTitulo}>Selecione Time 2 (Azul)</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
              ) : (
                <ScrollView style={styles.listaTimesScroll}>
                  {times.map(t => {
                    const isLocked = !isPremium && !unlockedTeams.includes(t.id);
                    return (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.pickerItem,
                          timeAdversario?.id === t.id && styles.pickerItemSelecionado,
                          isLocked && { opacity: 0.7, backgroundColor: '#222' }
                        ]}
                        onPress={() => handleSelectTimeCheck(t, 'adversary')}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <View
                            style={[styles.corIndicador, { backgroundColor: t.cor }]}
                          />
                          <Text
                            style={[
                              styles.pickerItemTexto,
                              timeAdversario?.id === t.id && styles.pickerItemTextoSelecionado,
                              isLocked && { color: '#aaa' }
                            ]}>
                            {t.nome}
                          </Text>
                        </View>
                        {/* Cadeado */}
                        {isLocked && (
                          <Text style={{ fontSize: 16 }}>🔒</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Esquema */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showEsquemaModal}
          onRequestClose={() => setShowEsquemaModal(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowEsquemaModal(false)}>
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitulo}>
                {modoConfronto ? 'Esquema Time 1 (Vermelho)' : 'Selecione o Esquema'}
              </Text>
              {Object.keys(ESQUEMAS_TATICOS).map(e => (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.pickerItem,
                    esquema === e && styles.pickerItemSelecionado,
                  ]}
                  onPress={() => {
                    mudarEsquema(e);
                    setShowEsquemaModal(false);
                  }}>
                  <Text
                    style={[
                      styles.pickerItemTexto,
                      esquema === e && styles.pickerItemTextoSelecionado,
                    ]}>
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Esquema Adversário */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showEsquemaAdversarioModal}
          onRequestClose={() => setShowEsquemaAdversarioModal(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowEsquemaAdversarioModal(false)}>
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitulo}>Esquema Time 2 (Azul)</Text>
              {Object.keys(ESQUEMAS_TATICOS).map(e => (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.pickerItem,
                    esquemaAdversario === e && styles.pickerItemSelecionado,
                  ]}
                  onPress={() => {
                    mudarEsquemaAdversario(e);
                    setShowEsquemaAdversarioModal(false);
                  }}>
                  <Text
                    style={[
                      styles.pickerItemTexto,
                      esquemaAdversario === e && styles.pickerItemTextoSelecionado,
                    ]}>
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Elenco (AGORA COM FLATLIST PARA PERFORMANCE) */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={elencoVisible}
          onRequestClose={() => setElencoVisible(false)}>
          <SafeAreaView style={styles.elencoModal} edges={['bottom']}>
            <View style={styles.elencoHeader}>
              <Text style={styles.elencoTitulo}>
                Elenco {indiceAdversarioSelecionado !== null
                  ? (timeAdversario?.nome || 'Time 2')
                  : (timeSelecionado?.nome || 'Time 1')}
              </Text>
              <TouchableOpacity
                style={styles.elencoFechar}
                onPress={() => setElencoVisible(false)}>
                <Text style={styles.elencoFecharTexto}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.buscaInput}
              placeholder="Pesquisar jogador..."
              placeholderTextColor="#888"
              value={buscaTexto}
              onChangeText={setBuscaTexto}
            />

            <TouchableOpacity
              style={styles.botaoAdicionarJogador}
              onPress={() => {
                mostrarIntersticial('adicionar_jogador', () => {
                  setShowAdicionarJogadorModal(true);
                });
              }}>
              <Text style={styles.botaoAdicionarJogadorTexto}>
                + Adicionar Jogador Personalizado
              </Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#4CAF50"
                style={{ marginTop: 40 }}
              />
            ) : ((indiceAdversarioSelecionado !== null ? elencoAdversarioFiltrado : elencoFiltrado).length === 0) ? (
              <Text style={styles.elencoVazio}>
                {(indiceAdversarioSelecionado !== null ? elencoAdversario : elenco).length === 0
                  ? 'Selecione um time para ver o elenco'
                  : 'Nenhum jogador encontrado'}
              </Text>
            ) : (
              // AQUI ESTÁ A MUDANÇA PRINCIPAL DE PERFORMANCE:
              <FlatList
                data={indiceAdversarioSelecionado !== null ? elencoAdversarioFiltrado : elencoFiltrado}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderJogadorItem}
                contentContainerStyle={styles.elencoLista}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
              />
            )}
          </SafeAreaView>
        </Modal>

        {/* Modal Adicionar Jogador Customizado */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showAdicionarJogadorModal}
          onRequestClose={() => setShowAdicionarJogadorModal(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAdicionarJogadorModal(false)}>
            <View style={styles.adicionarJogadorModal}>
              <Text style={styles.adicionarJogadorTitulo}>
                Adicionar Jogador Personalizado
              </Text>

              <Text style={styles.labelInput}>Nome do Jogador:</Text>
              <TextInput
                style={styles.inputJogador}
                placeholder="Ex: Neymar Jr"
                placeholderTextColor="#888"
                value={novoJogadorNome}
                onChangeText={setNovoJogadorNome}
                maxLength={30}
              />

              <Text style={styles.labelInput}>Número da Camisa (opcional):</Text>
              <TextInput
                style={styles.inputJogador}
                placeholder="Ex: 10"
                placeholderTextColor="#888"
                value={novoJogadorNumero}
                onChangeText={setNovoJogadorNumero}
                keyboardType="numeric"
                maxLength={3}
              />

              <View style={styles.botoesAdicionarJogador}>
                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={() => {
                    setNovoJogadorNome('');
                    setNovoJogadorNumero('');
                    setShowAdicionarJogadorModal(false);
                  }}>
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoConfirmar}
                  onPress={adicionarJogadorCustomizado}>
                  <Text style={styles.botaoConfirmarTexto}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* --- MODAL PARA DAR NOME (SALVAR) --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalSalvarVisible}
          onRequestClose={() => setModalSalvarVisible(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalSalvarVisible(false)}>
            <View style={styles.adicionarJogadorModal}>
              <Text style={styles.adicionarJogadorTitulo}>Salvar Escalação</Text>

              <Text style={styles.labelInput}>Nome:</Text>
              <TextInput
                style={styles.inputJogador}
                value={nomeEscalacao}
                onChangeText={setNomeEscalacao}
                placeholder="Ex: Time Ideal"
                placeholderTextColor="#888"
                autoFocus={true}
              />

              <View style={styles.botoesAdicionarJogador}>
                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={() => setModalSalvarVisible(false)}>
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botaoConfirmar}
                  onPress={confirmarSalvar}>
                  <Text style={styles.botaoConfirmarTexto}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* --- MODAL LISTA DE ESCALAÇÕES --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalMinhasEscalacoesVisible}
          onRequestClose={() => setModalMinhasEscalacoesVisible(false)}>
          <View style={styles.elencoModal}>
            <View style={styles.elencoHeader}>
              <Text style={styles.elencoTitulo}>Minhas Escalações</Text>
              <TouchableOpacity
                style={styles.elencoFechar}
                onPress={() => setModalMinhasEscalacoesVisible(false)}>
                <Text style={styles.elencoFecharTexto}>✕</Text>
              </TouchableOpacity>
            </View>

            {escalacoesSalvas.length === 0 ? (
              <Text style={styles.elencoVazio}>Nenhuma escalação salva.</Text>
            ) : (
              <ScrollView style={styles.elencoLista}>
                {escalacoesSalvas.map((item) => (
                  <View key={item.id} style={styles.jogadorCard}>
                    <TouchableOpacity
                      style={[styles.jogadorInfo, { flexDirection: 'column', alignItems: 'flex-start' }]}
                      onPress={() => carregarEscalacao(item)}>
                      <Text style={[styles.jogadorNomeCard, { fontSize: 16, color: '#4CAF50' }]}>
                        {item.nome}
                      </Text>
                      <Text style={styles.jogadorPosicao}>
                        {item.data} • {item.modoConfronto ? 'Confronto' : 'Simples'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.botaoRemover, { position: 'relative', top: 0, right: 0, backgroundColor: '#FF6B6B' }]}
                      onPress={() => deletarEscalacao(item.id)}>
                      <Text style={styles.botaoRemoverTexto}>X</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </Modal>

        {/* Sem banner na tela do campo: rendia muito pouco e ocupava a prancheta (o do menu continua) */}

        {/* Tutorial Overlay Principal */}
        <Modal visible={tutorialVisible && !menuVisible} transparent animationType="fade" statusBarTranslucent={true}>
          {renderTutorialOverlay()}
        </Modal>

        {/* Promoção cruzada: Jogo do Milhão do Futebol */}
        <Modal visible={promoMilhaoVisivel} transparent animationType="fade" statusBarTranslucent={true} onRequestClose={() => setPromoMilhaoVisivel(false)}>
          <View style={styles.promoFundo}>
            <View style={styles.promoCartao}>
              <Image source={require('../assets/images/promo_milhao.png')} style={styles.promoIcone} />
              <Text style={styles.promoTitulo}>Quanto você sabe de futebol? 🏆</Text>
              <Text style={styles.promoTexto}>
                No Jogo do Milhão do Futebol, cada pergunta certa vale mais. Chegue ao milhão sem errar!
              </Text>
              <TouchableOpacity style={styles.promoBotao} onPress={() => abrirMilhao('cartao')}>
                <Text style={styles.promoBotaoTexto}>Jogar grátis</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPromoMilhaoVisivel(false)} style={{ padding: 10 }}>
                <Text style={styles.promoAgoraNao}>Agora não</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// --- ESTILOS ---
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  faixaCompartilharLinha: { position: 'absolute', left: 0, right: 0, bottom: 8, alignItems: 'center' },
  faixaCompartilhar: { backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  faixaCompartilharTexto: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  promoFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  promoCartao: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center' },
  promoIcone: { width: 96, height: 96, borderRadius: 20, marginBottom: 14 },
  promoTitulo: { fontSize: 20, fontWeight: 'bold', color: '#1b5e20', textAlign: 'center', marginBottom: 8 },
  promoTexto: { fontSize: 15, color: '#444', textAlign: 'center', marginBottom: 18 },
  promoBotao: { backgroundColor: '#2e7d32', borderRadius: 26, paddingVertical: 12, paddingHorizontal: 40 },
  promoBotaoTexto: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  promoAgoraNao: { color: '#777', fontSize: 14 },
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  menuButton: {
    padding: 8,
    width: 40,
    justifyContent: 'center',
  },
  menuLine: {
    width: 24,
    height: 3,
    backgroundColor: '#fff',
    marginVertical: 2,
    borderRadius: 2,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  logoApp: {
    width: 200,
    height: 70,
    tintColor: '#fff',
  },
  elencoButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  camisetaIcon: {
    width: 32,
    height: 32,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camisetaCorpo: {
    position: 'absolute',
    top: 8,
    left: 6,
    width: 20,
    height: 20,
    backgroundColor: 'transparent',
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  camisetaGolaV: {
    position: 'absolute',
    top: 8,
    left: 13,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1a1a2e',
    zIndex: 2,
  },
  camisetaMangaEsq: {
    position: 'absolute',
    top: 8,
    left: 2,
    width: 8,
    height: 12,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#fff',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 3,
  },
  camisetaMangaDir: {
    position: 'absolute',
    top: 8,
    right: 2,
    width: 8,
    height: 12,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#fff',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 3,
  },
  camisetaNumero: {
    position: 'absolute',
    top: 14,
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    zIndex: 3,
  },
  campoWrapper: {
    flex: 1,
    padding: 8,
    paddingBottom: 30,
  },
  campoContainer: {
    flex: 1,
    backgroundColor: '#2E8B57',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  faixaGramado: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  linhaMeio: {
    position: 'absolute',
    backgroundColor: 'white',
  },
  circuloCentral: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  pontoCentral: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  bordaCampo: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'white',
  },
  grandeArea: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  pequenaArea: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  marcaPenalti: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  meiaLua: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  gol: {
    position: 'absolute',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
  },
  jogadorContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selecaoBorda: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#FFFF00',
  },
  jogadorCirculo: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  jogadorNumero: {
    fontWeight: 'bold',
  },
  jogadorMais: {
    fontWeight: 'bold',
  },
  jogadorNome: {
    position: 'absolute',
    bottom: -18,
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    width: 80,
  },
  botaoRemover: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  botaoRemoverTexto: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#16213e',
  },
  infoTextos: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuLateral: {
    width: screenWidth * 0.75,
    height: '100%',
    backgroundColor: '#1a1a2e',
    padding: 20,
    paddingTop: 50,
  },
  menuTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
    paddingBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  menuItemLabel: {
    color: '#fff',
    fontSize: 16,
  },
  menuItemValue: {
    color: '#4CAF50',
    fontSize: 14,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#555',
  },
  toggleAtivo: {
    backgroundColor: '#FFA500',
  },
  toggleTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuFechar: {
    marginTop: 30,
    paddingVertical: 14,
    backgroundColor: '#0f3460',
    borderRadius: 8,
    alignItems: 'center',
  },
  menuFecharTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerModal: {
    marginTop: 100,
    marginHorizontal: 30,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    maxHeight: screenHeight * 0.6,
  },
  pickerModalGrande: {
    marginTop: 80,
    marginHorizontal: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    maxHeight: screenHeight * 0.7,
  },
  pickerTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  pickerItemSelecionado: {
    backgroundColor: '#0f3460',
  },
  pickerItemTexto: {
    color: '#fff',
    fontSize: 16,
  },
  pickerItemTextoSelecionado: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  corIndicador: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  listaTimesScroll: {
    maxHeight: screenHeight * 0.5,
  },
  elencoModal: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  elencoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  elencoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  elencoFechar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0f3460',
    alignItems: 'center',
    justifyContent: 'center',
  },
  elencoFecharTexto: {
    color: '#fff',
    fontSize: 18,
  },
  buscaInput: {
    backgroundColor: '#16213e',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
  },
  elencoVazio: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  elencoLista: {
    flexGrow: 1, // Importante para FlatList funcionar bem
    paddingHorizontal: 16,
  },
  jogadorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  jogadorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jogadorNumeroCard: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    width: 35,
    textAlign: 'center',
  },
  jogadorDetalhes: {
    marginLeft: 10,
    flex: 1,
  },
  jogadorNomeCard: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  jogadorPosicao: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  botaoEscalar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoEscalarTexto: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  botaoAdicionarJogador: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 12,
    backgroundColor: '#FFA500',
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoAdicionarJogadorTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  adicionarJogadorModal: {
    marginTop: 150,
    marginHorizontal: 30,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
  },
  adicionarJogadorTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  labelInput: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 10,
  },
  inputJogador: {
    backgroundColor: '#16213e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  botoesAdicionarJogador: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  botaoCancelar: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#555',
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoCancelarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoConfirmar: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoConfirmarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  infoBotoes: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  botaoSalvarTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  botaoLimpar: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  botaoLimparTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default App;