// Football Draft: seleções da Copa 2026 (atual) e históricas
// Formato: ver shared/dez-dados.js. Notas na escala única (docs/PROMPT_DADOS_REAIS.md, seção 3).
(function (root) {
  'use strict';
  const D = {
    id: 'selecoes', origem: 'en',
    times: `
africa_do_sul|África do Sul|South Africa|Sudáfrica|RSA|#FFB612|#007A4D|png
alemanha|Alemanha|Germany|Alemania|GER|#FFFFFF|#111111|png
arabia|Arábia Saudita|Saudi Arabia|Arabia Saudita|KSA|#006C35|#FFFFFF|png
argelia|Argélia|Algeria|Argelia|ALG|#FFFFFF|#006233|png
argentina|Argentina|Argentina|Argentina|ARG|#75AADB|#FFFFFF|png
australia|Austrália|Australia|Australia|AUS|#FFCD00|#00843D|
austria|Áustria|Austria|Austria|AUT|#ED2939|#FFFFFF|png
belgica|Bélgica|Belgium|Bélgica|BEL|#E30613|#111111|png
bosnia|Bósnia|Bosnia|Bosnia|BIH|#002395|#FECB00|png
brasil|Brasil|Brazil|Brasil|BRA|#FFDC02|#0B5CA8|png
cabo_verde|Cabo Verde|Cape Verde|Cabo Verde|CPV|#003893|#FFFFFF|png
canada|Canadá|Canada|Canadá|CAN|#D80621|#FFFFFF|png
catar|Catar|Qatar|Catar|QAT|#8A1538|#FFFFFF|png
colombia|Colômbia|Colombia|Colombia|COL|#FCD116|#003893|png
congo|RD Congo|DR Congo|RD Congo|COD|#00A3E0|#E21C1C|
coreia|Coreia do Sul|South Korea|Corea del Sur|KOR|#C60C30|#FFFFFF|png
croacia|Croácia|Croatia|Croacia|CRO|#FFFFFF|#E30613|png
curacao|Curaçao|Curaçao|Curazao|CUW|#0033A0|#F9E814|png
egito|Egito|Egypt|Egipto|EGY|#C8102E|#FFFFFF|png
equador|Equador|Ecuador|Ecuador|ECU|#FFDD00|#034EA2|png
escocia|Escócia|Scotland|Escocia|SCO|#1B2A6B|#FFFFFF|png
espanha|Espanha|Spain|España|ESP|#C8102E|#FFD100|png
eua|Estados Unidos|United States|Estados Unidos|USA|#FFFFFF|#0A3161|png
franca|França|France|Francia|FRA|#1B2A6B|#FFFFFF|png
gana|Gana|Ghana|Ghana|GHA|#FFFFFF|#111111|png
haiti|Haiti|Haiti|Haití|HAI|#00209F|#D21034|png
holanda|Holanda|Netherlands|Países Bajos|NED|#FF6C00|#FFFFFF|png
inglaterra|Inglaterra|England|Inglaterra|ENG|#FFFFFF|#1B2A6B|png
ira|Irã|Iran|Irán|IRN|#FFFFFF|#DA0000|png
iraque|Iraque|Iraq|Irak|IRQ|#FFFFFF|#007A3D|png
japao|Japão|Japan|Japón|JPN|#0B2A8F|#FFFFFF|png
jordania|Jordânia|Jordan|Jordania|JOR|#FFFFFF|#CE1126|png
marfim|Costa do Marfim|Ivory Coast|Costa de Marfil|CIV|#FF8200|#FFFFFF|png
marrocos|Marrocos|Morocco|Marruecos|MAR|#C1272D|#006233|png
mexico|México|Mexico|México|MEX|#006847|#FFFFFF|png
noruega|Noruega|Norway|Noruega|NOR|#EF2B2D|#002868|png
nova_zelandia|Nova Zelândia|New Zealand|Nueva Zelanda|NZL|#FFFFFF|#111111|png
panama|Panamá|Panama|Panamá|PAN|#DA121A|#FFFFFF|png
paraguai|Paraguai|Paraguay|Paraguay|PAR|#D52B1E|#FFFFFF|png
portugal|Portugal|Portugal|Portugal|POR|#C8102E|#046A38|png
senegal|Senegal|Senegal|Senegal|SEN|#FFFFFF|#00853F|png
suecia|Suécia|Sweden|Suecia|SWE|#FECC00|#006AA7|png
suica|Suíça|Switzerland|Suiza|SUI|#D52B1E|#FFFFFF|png
tcheca|Tchéquia|Czechia|Chequia|CZE|#D7141A|#FFFFFF|png
tunisia|Tunísia|Tunisia|Túnez|TUN|#E70013|#FFFFFF|png
turquia|Turquia|Turkey|Turquía|TUR|#E30A17|#FFFFFF|png
uruguai|Uruguai|Uruguay|Uruguay|URU|#5CBFEB|#111111|png
uzbequistao|Uzbequistão|Uzbekistan|Uzbekistán|UZB|#FFFFFF|#0099B5|png`,
    elencos: `
// ======================================================== Copa 2026 (convocações oficiais, 23 de 26)
= africa_do_sul 2026 4-2-3-1
Ronwen Williams|Williams|GK|1|75|34|za
Sipho Chaine|Chaine|GK|16|65|29|za
Khuliso Mudau|Mudau|RB|20|67|31|za
Thabang Matuludi|Matuludi|RB|2|64|28|za
Nkosinathi Sibisi|Sibisi|CB|19|66|30|za
Khulumani Ndamane|Ndamane|CB|3|66|22|za
Ime Okon|Okon|CB|21|64|22|za
Mbekezeli Mbokazi|Mbokazi|CB|14|66|20|za
Aubrey Modiba|Modiba|LB|6|67|30|za
Teboho Mokoena|Mokoena|DM|4|73|29|za
Thalente Mbatha|Mbatha|CM|5|67|26|za
Sphephelo Sithole|Sithole|CM|13|65|27|za
Jayden Adams|Adams|CM|23|65|25|za
Themba Zwane|Zwane|AM|11|66|36|za
Oswin Appollis|Appollis|RW|7|70|24|za
Kamogelo Sebelebele|Sebelebele|RW|25|63|23|za
Relebohile Mofokeng|Mofokeng|LW|10|71|21|za
Thapelo Maseko|Maseko|LW|12|65|22|za
Tshepang Moremi|Moremi|ST|8|65|25|za
Lyle Foster|Foster|ST|9|73|25|za
Iqraam Rayners|Rayners|ST|15|66|30|za
Evidence Makgopa|Makgopa|ST|17|63|26|za
= alemanha 2026 4-2-3-1
Manuel Neuer|Neuer|GK|1|84|40|de
Oliver Baumann|Baumann|GK|12|79|36|de
Joshua Kimmich|Kimmich|RB|6|87|31|de
Antonio Rüdiger|Rüdiger|CB|2|82|33|de
Jonathan Tah|Tah|CB|4|84|30|de
Nico Schlotterbeck|Schlotterbeck|CB|15|84|26|de
Waldemar Anton|Anton|CB|3|77|29|de
Malick Thiaw|Thiaw|CB|24|79|24|de
David Raum|Raum|LB|22|80|28|de
Nathaniel Brown|Brown|LB|18|78|22|de
Aleksandar Pavlović|Pavlović|DM|5|83|22|de
Angelo Stiller|Stiller|DM|16|80|25|de
Leon Goretzka|Goretzka|CM|8|81|31|de
Felix Nmecha|Nmecha|CM|23|80|25|de
Jamal Musiala|Musiala|AM|10|85|23|de
Florian Wirtz|Wirtz|AM|17|85|23|de
Leroy Sané|Sané|RW|19|81|30|de
Jamie Leweling|Leweling|RW|9|78|25|de
Lennart Karl|Karl|RW|25|76|18|de
Maximilian Beier|Beier|LW|14|78|23|de
Nick Woltemade|Woltemade|ST|11|82|24|de
Kai Havertz|Havertz|ST|7|81|27|de
Deniz Undav|Undav|ST|26|80|29|de
= arabia 2026 4-2-3-1
Nawaf Al-Aqidi|Al-Aqidi|GK|1|70|26|sa
Mohammed Al-Owais|Al-Owais|GK|21|67|34|sa
Saud Abdulhamid|Abdulhamid|RB|12|73|26|sa
Ali Majrashi|Majrashi|RB|2|64|26|sa
Hassan Tambakti|Tambakti|CB|5|70|27|sa
Abdulelah Al-Amri|Al-Amri|CB|4|70|29|sa
Ali Lajami|Lajami|CB|3|65|30|sa
Hassan Kadesh|Kadesh|CB|14|65|33|sa
Moteb Al-Harbi|Al-Harbi|LB|24|66|25|sa
Nawaf Boushal|Boushal|LB|13|65|26|sa
Abdullah Al-Khaibari|Al-Khaibari|DM|15|67|29|sa
Mohamed Kanno|Kanno|CM|23|71|31|sa
Nasser Al-Dawsari|N. Al-Dawsari|CM|6|68|27|sa
Ziyad Al-Johani|Al-Johani|CM|16|65|24|sa
Ala Al-Hajji|Al-Hajji|CM|18|63|28|sa
Musab Al-Juwayr|Al-Juwayr|AM|7|73|22|sa
Ayman Yahya|Ayman Yahya|RW|8|68|25|sa
Sultan Mandash|Mandash|RW|20|64|32|sa
Salem Al-Dawsari|Salem|LW|10|77|34|sa
Khalid Al-Ghannam|Al-Ghannam|LW|17|64|25|sa
Feras Al-Brikan|Al-Brikan|ST|9|70|25|sa
Saleh Al-Shehri|Al-Shehri|ST|11|67|32|sa
Abdullah Al-Hamdan|Al-Hamdan|ST|19|66|26|sa
= argelia 2026 4-3-3
Luca Zidane|L. Zidane|GK|23|71|28|dz
Melvin Mastil|Mastil|GK|1|66|26|dz
Rafik Belghali|Belghali|RB|17|70|24|dz
Aïssa Mandi|Mandi|CB|2|73|34|dz
Mohamed Amine Tougai|Tougai|CB|4|73|26|dz
Zineddine Belaïd|Belaïd|CB|5|66|27|dz
Achraf Abada|Abada|CB|3|64|26|dz
Rayan Aït-Nouri|Aït-Nouri|LB|15|81|25|dz
Ramy Bensebaini|Bensebaini|LB|21|77|31|dz
Jaouen Hadjam|Hadjam|LB|13|71|23|dz
Ramiz Zerrouki|Zerrouki|DM|6|73|28|dz
Nabil Bentaleb|Bentaleb|DM|19|71|31|dz
Houssem Aouar|Aouar|CM|8|75|27|dz
Hicham Boudaoui|Boudaoui|CM|14|74|26|dz
Farès Chaïbi|Chaïbi|AM|10|76|23|dz
Ibrahim Maza|Maza|AM|22|76|20|dz
Riyad Mahrez|Mahrez|RW|7|79|35|dz
Farès Ghedjemis|Ghedjemis|RW|25|64|23|dz
Anis Hadj Moussa|Hadj Moussa|LW|11|75|24|dz
Mohamed Amoura|Amoura|LW|18|79|26|dz
Amine Gouiri|Gouiri|ST|9|78|26|dz
Nadhir Benbouali|Benbouali|ST|12|65|26|dz
Adil Boulbina|Boulbina|ST|20|64|23|dz
= argentina 2026 4-4-2
Emiliano Martínez|Dibu Martínez|GK|23|85|33|ar
Gerónimo Rulli|Rulli|GK|12|81|34|ar
Nahuel Molina|Molina|RB|26|80|28|ar
Gonzalo Montiel|Montiel|RB|4|78|29|ar
Cristian Romero|Cuti Romero|CB|13|85|28|ar
Lisandro Martínez|Lisandro|CB|6|82|28|ar
Leonardo Balerdi|Balerdi|CB|2|79|27|ar
Nicolás Otamendi|Otamendi|CB|19|76|38|ar
Facundo Medina|Medina|CB|25|77|27|ar
Nicolás Tagliafico|Tagliafico|LB|3|79|33|ar
Valentín Barco|Barco|LB|8|75|21|ar
Leandro Paredes|Paredes|DM|5|79|31|ar
Alexis Mac Allister|Mac Allister|CM|20|85|27|ar
Enzo Fernández|Enzo|CM|24|85|25|ar
Rodrigo De Paul|De Paul|CM|7|81|32|ar
Exequiel Palacios|Palacios|CM|14|80|27|ar
Nico Paz|Nico Paz|AM|18|83|21|ar
Thiago Almada|Almada|AM|16|79|25|ar
Lionel Messi|Messi|RW|10|86|39|ar
Giuliano Simeone|Giuliano|RW|17|79|23|ar
Nicolás González|Nico González|LW|15|79|28|ar
Lautaro Martínez|Lautaro|ST|22|87|28|ar
Julián Álvarez|Julián|ST|9|87|26|ar
= australia 2026 4-2-3-1
Mathew Ryan|Ryan|GK|1|74|34|au
Paul Izzo|Izzo|GK|12|63|31|au
Jacob Italiano|Italiano|RB|4|64|24|au
Jason Geria|Geria|RB|6|63|33|au
Harry Souttar|Souttar|CB|19|73|27|au
Alessandro Circati|Circati|CB|3|73|22|au
Miloš Degenek|Degenek|CB|2|64|32|au
Cameron Burgess|Burgess|CB|21|65|30|au
Kai Trewin|Trewin|CB|15|64|24|au
Jordan Bos|Bos|LB|5|74|23|au
Aziz Behich|Behich|LB|16|63|35|au
Aiden O'Neill|O'Neill|DM|13|70|27|au
Jackson Irvine|Irvine|CM|22|73|33|au
Connor Metcalfe|Metcalfe|CM|8|68|26|au
Cameron Devlin|Devlin|CM|14|64|28|au
Ajdin Hrustić|Hrustić|AM|10|68|29|au
Cristian Volpato|Volpato|AM|20|66|22|au
Nestory Irankunda|Irankunda|RW|17|70|20|au
Mathew Leckie|Leckie|RW|7|64|35|au
Awer Mabil|Mabil|LW|11|64|30|au
Nishan Velupillay|Velupillay|LW|23|63|25|au
Mohamed Touré|Touré|ST|9|70|22|au
Tete Yengi|Yengi|ST|26|64|25|au
= austria 2026 4-2-3-1
Patrick Pentz|Pentz|GK|13|75|29|at
Alexander Schlager|A. Schlager|GK|1|75|30|at
Stefan Posch|Posch|RB|5|77|29|at
Konrad Laimer|Laimer|RB|20|83|29|at
Kevin Danso|Danso|CB|3|81|27|at
Philipp Lienhart|Lienhart|CB|15|78|29|at
David Alaba|Alaba|CB|8|77|34|at
David Affengruber|Affengruber|CB|2|74|25|at
Marco Friedl|Friedl|CB|23|75|28|at
Alexander Prass|Prass|LB|22|77|25|at
Phillipp Mwene|Mwene|LB|16|71|32|at
Nicolas Seiwald|Seiwald|DM|6|79|25|at
Florian Grillitsch|Grillitsch|DM|10|74|30|at
Xaver Schlager|X. Schlager|CM|4|81|28|at
Marcel Sabitzer|Sabitzer|CM|9|81|32|at
Carney Chukwuemeka|Chukwuemeka|CM|17|74|22|at
Christoph Baumgartner|Baumgartner|AM|19|81|26|at
Romano Schmid|Schmid|AM|18|78|26|at
Paul Wanner|Wanner|AM|24|74|20|at
Patrick Wimmer|Wimmer|RW|21|75|25|at
Marko Arnautović|Arnautović|ST|7|75|37|at
Michael Gregoritsch|Gregoritsch|ST|11|74|32|at
Saša Kalajdžić|Kalajdžić|ST|14|71|28|at
= belgica 2026 4-2-3-1
Thibaut Courtois|Courtois|GK|1|88|34|be
Senne Lammens|Lammens|GK|12|79|24|be
Timothy Castagne|Castagne|RB|21|77|30|be
Thomas Meunier|Meunier|RB|15|73|34|be
Arthur Theate|Theate|CB|3|78|26|be
Koni De Winter|De Winter|CB|16|77|24|be
Zeno Debast|Debast|CB|2|75|22|be
Brandon Mechele|Mechele|CB|4|75|33|be
Maxim De Cuyper|De Cuyper|LB|5|78|25|be
Amadou Onana|Onana|DM|24|81|24|be
Axel Witsel|Witsel|DM|6|74|37|be
Youri Tielemans|Tielemans|CM|8|82|29|be
Hans Vanaken|Vanaken|CM|20|77|33|be
Nicolas Raskin|Raskin|CM|23|74|25|be
Kevin De Bruyne|De Bruyne|AM|7|84|35|be
Charles De Ketelaere|De Ketelaere|AM|17|81|25|be
Jérémy Doku|Doku|RW|11|84|24|be
Alexis Saelemaekers|Saelemaekers|RW|22|80|27|be
Dodi Lukebakio|Lukebakio|RW|14|78|28|be
Leandro Trossard|Trossard|LW|10|81|31|be
Diego Moreira|Moreira|LW|19|71|22|be
Romelu Lukaku|Lukaku|ST|9|78|33|be
Matías Fernández-Pardo|Fernández-Pardo|ST|26|73|21|be
= bosnia 2026 4-2-3-1
Nikola Vasilj|Vasilj|GK|1|75|30|ba
Mladen Jurkas|Jurkas|GK|12|61|28|ba
Amar Dedić|Dedić|RB|7|78|23|ba
Nihad Mujakić|Mujakić|CB|2|66|28|ba
Dennis Hadžikadunić|Hadžikadunić|CB|3|70|27|ba
Tarik Muharemović|Muharemović|CB|4|74|23|ba
Nikola Katić|Katić|CB|18|70|29|ba
Stjepan Radeljić|Radeljić|CB|21|64|28|ba
Sead Kolašinac|Kolašinac|LB|5|76|32|ba
Benjamin Tahirović|Tahirović|DM|6|73|23|ba
Ivan Šunjić|Šunjić|DM|14|68|29|ba
Amir Hadžiahmetović|Hadžiahmetović|CM|16|67|29|ba
Armin Gigović|Gigović|CM|8|73|24|ba
Ivan Bašić|Bašić|CM|13|66|24|ba
Dženis Burnić|Burnić|CM|17|65|27|ba
Amar Memić|Memić|AM|15|67|25|ba
Esmir Bajraktarević|Bajraktarević|RW|20|73|21|ba
Kerim Alajbegović|Alajbegović|LW|19|74|18|ba
Ermedin Demirović|Demirović|ST|10|79|28|ba
Edin Džeko|Džeko|ST|11|75|40|ba
Haris Tabaković|Tabaković|ST|23|74|31|ba
Samed Baždar|Baždar|ST|9|67|22|ba
Jovo Lukić|Lukić|ST|25|63|27|ba
= brasil 2026 4-2-3-1
Alisson Becker|Alisson|GK|1|86|33|br
Ederson Moraes|Ederson|GK|23|84|32|br
Roger Ibañez|Ibañez|RB|24|78|27|br
Danilo Luiz|Danilo|RB|13|74|34|br
Gabriel Magalhães|Gabriel|CB|3|86|28|br
Marquinhos|Marquinhos|CB|4|84|32|br
Gleison Bremer|Bremer|CB|14|83|29|br
Léo Pereira|Léo Pereira|CB|15|79|30|br
Douglas Santos|Douglas Santos|LB|16|77|32|br
Alex Sandro|Alex Sandro|LB|6|74|35|br
Casemiro|Casemiro|DM|5|80|34|br
Fabinho|Fabinho|DM|17|76|32|br
Bruno Guimarães|Bruno Guimarães|CM|8|85|28|br
Ederson dos Santos|Ederson|CM|2|81|26|br
Lucas Paquetá|Paquetá|AM|20|81|28|br
Neymar Jr.|Neymar|AM|10|81|34|br
Raphinha|Raphinha|RW|11|86|29|br
Luiz Henrique|Luiz Henrique|RW|21|79|25|br
Vinícius Júnior|Vini Jr.|LW|7|87|25|br
Gabriel Martinelli|Martinelli|LW|22|81|24|br
Matheus Cunha|Cunha|ST|9|84|27|br
Igor Thiago|Igor Thiago|ST|25|81|25|br
Endrick|Endrick|ST|19|77|19|br
= cabo_verde 2026 4-3-3
Vozinha|Vozinha|GK|1|66|40|cv
Márcio Rosa|Márcio Rosa|GK|12|60|28|cv
Steven Moreira|Moreira|RB|22|67|31|cv
Wagner Pina|Wagner Pina|RB|24|63|23|cv
Logan Costa|Logan Costa|CB|5|74|25|cv
Pico Lopes|Pico Lopes|CB|4|65|34|cv
Diney Borges|Diney|CB|3|61|30|cv
Stopira|Stopira|CB|2|59|37|cv
Sidny Lopes Cabral|Sidny Cabral|LB|13|65|23|cv
Kevin Pina|Kevin Pina|DM|6|67|29|cv
Laros Duarte|Laros Duarte|DM|15|62|29|cv
Jamiro Monteiro|Jamiro|CM|10|67|32|cv
Deroy Duarte|Deroy Duarte|CM|14|62|27|cv
João Paulo|João Paulo|CM|8|61|28|cv
Telmo Arcanjo|Telmo Arcanjo|AM|18|65|25|cv
Willy Semedo|Willy Semedo|RW|17|66|32|cv
Ryan Mendes|Ryan Mendes|RW|20|66|36|cv
Hélio Varela|Hélio Varela|RW|26|60|23|cv
Jovane Cabral|Jovane|LW|7|67|27|cv
Garry Rodrigues|Garry Rodrigues|LW|11|63|35|cv
Dailon Livramento|Livramento|ST|19|70|25|cv
Gilson Benchimol|Benchimol|ST|9|63|25|cv
Nuno da Costa|Nuno da Costa|ST|21|60|35|cv
= canada 2026 4-4-2
Dayne St. Clair|St. Clair|GK|1|73|29|ca
Maxime Crépeau|Crépeau|GK|16|70|32|ca
Alistair Johnston|Johnston|RB|2|77|27|ca
Richie Laryea|Laryea|RB|22|70|31|ca
Niko Sigur|Sigur|RB|23|67|22|ca
Moïse Bombito|Bombito|CB|15|76|26|ca
Derek Cornelius|Cornelius|CB|13|73|28|ca
Luc de Fougerolles|De Fougerolles|CB|4|70|20|ca
Alfie Jones|Alfie Jones|CB|3|68|28|ca
Alphonso Davies|Davies|LB|19|83|25|ca
Stephen Eustáquio|Eustáquio|DM|7|78|29|ca
Ismaël Koné|Koné|CM|8|77|24|ca
Mathieu Choinière|Choinière|CM|6|70|27|ca
Jonathan Osorio|Osorio|CM|21|67|34|ca
Nathan Saliba|Saliba|CM|25|67|22|ca
Tajon Buchanan|Buchanan|RW|17|75|27|ca
Jacob Shaffelburg|Shaffelburg|LW|14|70|26|ca
Liam Millar|Millar|LW|11|70|26|ca
Ali Ahmed|Ali Ahmed|LW|20|67|25|ca
Jonathan David|J. David|ST|10|83|26|ca
Cyle Larin|Larin|ST|9|73|31|ca
Tani Oluwaseyi|Oluwaseyi|ST|12|70|26|ca
Promise David|P. David|ST|24|70|24|ca
= catar 2026 4-3-3
Meshaal Barsham|Barsham|GK|22|66|28|qa
Mahmoud Abunada|Abunada|GK|1|64|26|qa
Pedro Miguel|Pedro Miguel|RB|2|66|36|qa
Boualem Khoukhi|Khoukhi|CB|16|67|35|qa
Lucas Mendes|Lucas Mendes|CB|3|66|35|qa
Issa Laye|Issa Laye|CB|4|63|26|qa
Ayoub Aloui|Aloui|CB|13|62|25|qa
Al-Hashmi Al-Hussein|Al-Hussein|CB|25|61|25|qa
Homam Ahmed|Homam|LB|14|65|26|qa
Sultan Al-Brake|Al-Brake|LB|18|62|29|qa
Karim Boudiaf|Boudiaf|DM|12|64|35|qa
Ahmed Fathy|Ahmed Fathy|DM|20|65|33|qa
Assim Madibo|Madibo|DM|23|64|29|qa
Abdulaziz Hatem|Hatem|CM|6|66|35|qa
Jassem Gaber|Jassem Gaber|CM|5|63|24|qa
Ahmed Al-Ganehi|Al-Ganehi|CM|17|62|25|qa
Hassan Al-Haydos|Al-Haydos|AM|10|66|35|qa
Ahmed Alaaeldin|Alaaeldin|RW|7|65|33|qa
Yusuf Abdurisag|Abdurisag|RW|15|65|26|qa
Akram Afif|Afif|LW|11|77|29|qa
Edmilson Junior|Edmilson|LW|8|70|31|qa
Almoez Ali|Almoez Ali|ST|19|73|29|qa
Mohammed Muntari|Muntari|ST|9|64|32|qa
= colombia 2026 4-2-3-1
Camilo Vargas|Vargas|GK|12|77|37|co
David Ospina|Ospina|GK|1|70|37|co
Daniel Muñoz|Muñoz|RB|2|82|30|co
Santiago Arias|Arias|RB|4|71|34|co
Jhon Lucumí|Lucumí|CB|3|81|27|co
Davinson Sánchez|Davinson|CB|23|78|30|co
Yerry Mina|Mina|CB|13|73|31|co
Willer Ditta|Ditta|CB|18|73|29|co
Johan Mojica|Mojica|LB|17|75|33|co
Deiver Machado|Machado|LB|22|73|32|co
Jefferson Lerma|Lerma|DM|16|78|31|co
Kevin Castaño|Castaño|DM|5|76|25|co
Richard Ríos|Richard Ríos|CM|6|81|26|co
Gustavo Puerta|Puerta|CM|14|73|23|co
Jorge Carrascal|Carrascal|AM|8|77|28|co
James Rodríguez|James|AM|10|78|34|co
Juan Fernando Quintero|Quintero|AM|20|75|33|co
Jhon Arias|Jhon Arias|RW|11|80|28|co
Luis Díaz|Luis Díaz|LW|7|87|29|co
Jaminton Campaz|Campaz|LW|21|73|26|co
Luis Suárez|Luis Suárez|ST|25|78|28|co
Jhon Córdoba|Córdoba|ST|9|79|33|co
Cucho Hernández|Cucho|ST|19|77|27|co
= congo 2026 4-2-3-1
Lionel Mpasi|Mpasi|GK|1|67|31|cd
Timothy Fayulu|Fayulu|GK|16|65|26|cd
Aaron Wan-Bissaka|Wan-Bissaka|RB|2|79|28|cd
Gédéon Kalulu|Kalulu|RB|24|65|28|cd
Chancel Mbemba|Mbemba|CB|22|75|31|cd
Axel Tuanzebe|Tuanzebe|CB|4|70|28|cd
Steve Kapuadi|Kapuadi|CB|3|67|28|cd
Dylan Batubinsika|Batubinsika|CB|5|66|30|cd
Arthur Masuaku|Masuaku|LB|26|73|32|cd
Joris Kayembe|Kayembe|LB|12|67|31|cd
Noah Sadiki|Sadiki|DM|14|71|21|cd
Charles Pickel|Pickel|DM|18|70|29|cd
Samuel Moutoussamy|Moutoussamy|CM|8|68|29|cd
Ngal'ayel Mukau|Mukau|CM|6|70|21|cd
Edo Kayembe|E. Kayembe|CM|25|67|28|cd
Gaël Kakuta|Kakuta|AM|11|67|34|cd
Meschack Elia|Elia|RW|13|70|28|cd
Nathanaël Mbuku|Mbuku|RW|7|67|24|cd
Théo Bongonda|Bongonda|LW|10|73|30|cd
Yoane Wissa|Wissa|ST|20|80|29|cd
Fiston Mayele|Mayele|ST|19|74|31|cd
Cédric Bakambu|Bakambu|ST|17|71|35|cd
Simon Banza|Banza|ST|23|73|29|cd
= coreia 2026 4-2-3-1
Jo Hyeon-woo|Jo Hyeon-woo|GK|21|73|34|kr
Kim Seung-gyu|Kim Seung-gyu|GK|1|71|35|kr
Seol Young-woo|Seol Young-woo|RB|22|73|27|kr
Kim Moon-hwan|Kim Moon-hwan|RB|15|66|30|kr
Kim Min-jae|Kim Min-jae|CB|4|84|29|kr
Lee Han-beom|Lee Han-beom|CB|2|73|23|kr
Kim Tae-hyeon|Kim Tae-hyeon|CB|5|67|25|kr
Park Jin-seob|Park Jin-seob|CB|16|67|30|kr
Cho Wi-je|Cho Wi-je|CB|14|65|24|kr
Lee Tae-seok|Lee Tae-seok|LB|13|70|23|kr
Hwang In-beom|Hwang In-beom|DM|6|79|29|kr
Paik Seung-ho|Paik Seung-ho|CM|8|70|29|kr
Jens Castrop|Castrop|CM|23|75|22|kr
Kim Jin-gyu|Kim Jin-gyu|CM|24|67|29|kr
Lee Kang-in|Lee Kang-in|AM|19|81|25|kr
Lee Jae-sung|Lee Jae-sung|AM|10|75|33|kr
Hwang Hee-chan|Hwang Hee-chan|RW|11|74|30|kr
Bae Jun-ho|Bae Jun-ho|RW|17|73|22|kr
Yang Hyun-jun|Yang Hyun-jun|RW|20|71|24|kr
Son Heung-min|Son|LW|7|83|33|kr
Eom Ji-sung|Eom Ji-sung|LW|25|65|24|kr
Oh Hyeon-gyu|Oh Hyeon-gyu|ST|18|73|25|kr
Cho Gue-sung|Cho Gue-sung|ST|9|73|28|kr
= croacia 2026 4-3-3
Dominik Livaković|Livaković|GK|1|80|31|hr
Dominik Kotarski|Kotarski|GK|23|74|26|hr
Josip Stanišić|Stanišić|RB|2|81|26|hr
Joško Gvardiol|Gvardiol|LB|4|85|24|hr
Josip Šutalo|Šutalo|CB|6|79|26|hr
Marin Pongračić|Pongračić|CB|3|77|28|hr
Luka Vušković|Vušković|CB|22|77|19|hr
Duje Ćaleta-Car|Ćaleta-Car|CB|5|73|29|hr
Martin Erlić|Erlić|CB|25|73|28|hr
Kristijan Jakić|Jakić|DM|18|74|29|hr
Mateo Kovačić|Kovačić|CM|8|83|32|hr
Luka Modrić|Modrić|CM|10|83|40|hr
Mario Pašalić|Pašalić|CM|15|78|31|hr
Petar Sučić|P. Sučić|CM|17|77|22|hr
Nikola Moro|Moro|CM|7|74|28|hr
Martin Baturina|Baturina|AM|16|80|23|hr
Nikola Vlašić|Vlašić|AM|13|78|28|hr
Luka Sučić|L. Sučić|AM|21|76|23|hr
Marco Pašalić|Marco Pašalić|RW|24|71|25|hr
Ivan Perišić|Perišić|LW|14|77|37|hr
Andrej Kramarić|Kramarić|ST|9|78|35|hr
Ante Budimir|Budimir|ST|11|77|34|hr
Petar Musa|Musa|ST|26|71|28|hr
= curacao 2026 4-3-3
Eloy Room|Room|GK|1|65|37|cw
Tyrick Bodak|Bodak|GK|25|59|24|cw
Shurandy Sambo|Sambo|RB|2|65|24|cw
Joshua Brenet|Brenet|RB|20|64|32|cw
Sherel Floranus|Floranus|RB|5|62|27|cw
Armando Obispo|Obispo|CB|18|67|27|cw
Riechedly Bazoer|Bazoer|CB|23|65|29|cw
Jurien Gaari|Gaari|CB|3|61|33|cw
Roshon van Eijma|Van Eijma|CB|4|61|27|cw
Deveron Fonville|Fonville|LB|24|60|26|cw
Godfried Roemeratoe|Roemeratoe|DM|6|63|26|cw
Juninho Bacuna|Juninho Bacuna|CM|7|67|28|cw
Leandro Bacuna|L. Bacuna|CM|10|64|34|cw
Livano Comenencia|Comenencia|CM|8|64|22|cw
Kevin Felida|Felida|CM|22|61|26|cw
Tahith Chong|Chong|AM|21|71|26|cw
Sontje Hansen|Hansen|RW|12|67|24|cw
Brandley Kuwas|Kuwas|RW|17|63|33|cw
Kenji Gorré|Gorré|RW|14|62|31|cw
Jeremy Antonisse|Antonisse|LW|11|64|24|cw
Tyrese Noslin|Noslin|ST|13|64|26|cw
Jürgen Locadia|Locadia|ST|9|62|32|cw
Jearl Margaritha|Margaritha|ST|16|62|26|cw
= egito 2026 4-3-3
Mohamed El-Shenawy|El-Shenawy|GK|1|73|37|eg
Mostafa Shoubir|Shoubir|GK|23|65|26|eg
Mohamed Hany|Mohamed Hany|RB|3|68|30|eg
Tarek Alaa|Tarek Alaa|RB|24|63|25|eg
Mohamed Abdelmonem|Abdelmonem|CB|6|75|27|eg
Ramy Rabia|Rabia|CB|5|70|32|eg
Yasser Ibrahim|Yasser Ibrahim|CB|2|70|33|eg
Hossam Abdelmaguid|Abdelmaguid|CB|4|68|25|eg
Ahmed Fatouh|Fatouh|LB|13|67|28|eg
Karim Hafez|Karim Hafez|LB|15|64|29|eg
Hamdy Fathy|Hamdy Fathy|DM|14|67|31|eg
Marawan Attia|Marawan Attia|DM|19|66|27|eg
Mohanad Lashin|Lashin|DM|17|66|30|eg
Nabil Donga|Donga|DM|18|65|29|eg
Emam Ashour|Emam Ashour|CM|8|75|28|eg
Mahmoud Saber|Mahmoud Saber|CM|21|63|25|eg
Zizo|Zizo|AM|25|74|30|eg
Mohamed Salah|Salah|RW|10|86|34|eg
Haissem Hassan|Haissem|RW|12|68|24|eg
Trézéguet|Trézéguet|LW|7|73|31|eg
Ibrahim Adel|Ibrahim Adel|LW|20|70|25|eg
Mostafa Zico|Zico|LW|11|66|28|eg
Omar Marmoush|Marmoush|ST|22|82|27|eg
= equador 2026 4-3-3
Hernán Galíndez|Galíndez|GK|1|74|39|ec
Moisés Ramírez|M. Ramírez|GK|12|73|25|ec
Angelo Preciado|Preciado|RB|17|75|28|ec
Willian Pacho|Pacho|CB|6|84|24|ec
Piero Hincapié|Hincapié|CB|3|81|24|ec
Joel Ordóñez|Ordóñez|CB|4|79|22|ec
Félix Torres|Félix Torres|CB|2|74|29|ec
Jackson Porozo|Porozo|CB|25|70|25|ec
Pervis Estupiñán|Estupiñán|LB|7|79|28|ec
Moisés Caicedo|Caicedo|DM|23|87|24|ec
Alan Franco|Alan Franco|DM|21|74|27|ec
Pedro Vite|Vite|CM|15|73|24|ec
Denil Castillo|Castillo|CM|18|70|22|ec
Jordy Alcívar|Alcívar|CM|5|68|26|ec
Kendry Páez|Kendry Páez|AM|10|76|19|ec
Gonzalo Plata|Plata|RW|19|76|25|ec
John Yeboah|Yeboah|RW|9|74|26|ec
Alan Minda|Minda|RW|14|73|22|ec
Nilson Angulo|Angulo|LW|20|73|22|ec
Enner Valencia|Enner Valencia|ST|13|71|36|ec
Kevin Rodríguez|K. Rodríguez|ST|11|73|26|ec
Jeremy Arévalo|Arévalo|ST|24|70|20|ec
Jordy Caicedo|J. Caicedo|ST|16|66|28|ec
= escocia 2026 4-2-3-1
Angus Gunn|Gunn|GK|1|73|30|sc
Liam Kelly|Kelly|GK|12|66|30|sc
Aaron Hickey|Hickey|RB|2|75|24|sc
Nathan Patterson|Patterson|RB|22|70|24|sc
Anthony Ralston|Ralston|RB|24|66|27|sc
Scott McKenna|McKenna|CB|26|70|29|sc
John Souttar|Souttar|CB|15|71|29|sc
Grant Hanley|Hanley|CB|5|68|34|sc
Jack Hendry|Hendry|CB|13|68|31|sc
Dominic Hyam|Hyam|CB|16|67|30|sc
Andy Robertson|Robertson|LB|3|80|32|sc
Kieran Tierney|Tierney|LB|6|75|29|sc
Scott McTominay|McTominay|CM|4|85|29|sc
John McGinn|McGinn|CM|7|80|31|sc
Lewis Ferguson|Ferguson|CM|19|79|26|sc
Kenny McLean|McLean|CM|23|71|34|sc
Tyler Fletcher|Fletcher|CM|8|66|19|sc
Ryan Christie|Christie|AM|11|75|31|sc
Ben Gannon-Doak|Gannon-Doak|RW|17|73|21|sc
Findlay Curtis|Curtis|LW|25|64|19|sc
Che Adams|Adams|ST|10|74|29|sc
Lyndon Dykes|Dykes|ST|9|66|30|sc
Lawrence Shankland|Shankland|ST|20|65|30|sc
= espanha 2026 4-3-3
Unai Simón|Unai Simón|GK|23|84|29|es
David Raya|Raya|GK|1|85|30|es
Pedro Porro|Porro|RB|12|82|26|es
Marcos Llorente|Llorente|RB|5|81|31|es
Pau Cubarsí|Cubarsí|CB|22|84|19|es
Eric García|Eric García|CB|4|79|25|es
Aymeric Laporte|Laporte|CB|14|78|32|es
Marc Pubill|Pubill|CB|2|76|23|es
Marc Cucurella|Cucurella|LB|24|84|27|es
Álex Grimaldo|Grimaldo|LB|3|83|30|es
Rodri|Rodri|DM|16|86|30|es
Martín Zubimendi|Zubimendi|DM|18|85|27|es
Pedri|Pedri|CM|20|88|23|es
Fabián Ruiz|Fabián|CM|8|84|30|es
Mikel Merino|Merino|CM|6|81|29|es
Gavi|Gavi|CM|9|80|21|es
Dani Olmo|Olmo|AM|10|83|28|es
Álex Baena|Baena|AM|15|81|24|es
Lamine Yamal|Lamine Yamal|RW|19|90|18|es
Yeremy Pino|Yeremy Pino|RW|11|77|23|es
Nico Williams|Nico Williams|LW|17|83|23|es
Mikel Oyarzabal|Oyarzabal|ST|21|83|29|es
Ferran Torres|Ferran|ST|7|81|26|es
= eua 2026 4-2-3-1
Matt Turner|Turner|GK|1|73|31|us
Matt Freese|Freese|GK|24|73|27|us
Sergiño Dest|Dest|RB|2|78|25|us
Joe Scally|Scally|RB|23|73|23|us
Alex Freeman|Freeman|RB|16|70|21|us
Chris Richards|Richards|CB|3|78|26|us
Auston Trusty|Trusty|CB|6|73|27|us
Mark McKenzie|McKenzie|CB|22|71|27|us
Miles Robinson|M. Robinson|CB|12|70|29|us
Tim Ream|Ream|CB|13|67|38|us
Antonee Robinson|Jedi Robinson|LB|5|80|28|us
Max Arfsten|Arfsten|LB|18|67|25|us
Tyler Adams|Adams|DM|4|79|27|us
Weston McKennie|McKennie|CM|8|78|27|us
Sebastian Berhalter|Berhalter|CM|14|67|25|us
Malik Tillman|Tillman|AM|17|77|24|us
Giovanni Reyna|Reyna|AM|7|74|23|us
Brenden Aaronson|Aaronson|AM|11|74|25|us
Christian Pulisic|Pulisic|RW|10|84|27|us
Timothy Weah|Weah|RW|21|76|26|us
Folarin Balogun|Balogun|ST|20|77|24|us
Ricardo Pepi|Pepi|ST|9|75|23|us
Haji Wright|Wright|ST|19|74|28|us
= franca 2026 4-3-3
Mike Maignan|Maignan|GK|16|86|30|fr
Brice Samba|Samba|GK|1|81|32|fr
Jules Koundé|Koundé|RB|5|84|27|fr
Malo Gusto|Gusto|RB|2|81|23|fr
William Saliba|Saliba|CB|17|88|25|fr
Dayot Upamecano|Upamecano|CB|4|84|27|fr
Ibrahima Konaté|Konaté|CB|15|83|27|fr
Lucas Hernández|L. Hernández|CB|21|78|30|fr
Théo Hernández|Théo|LB|19|80|28|fr
Lucas Digne|Digne|LB|3|78|32|fr
Aurélien Tchouaméni|Tchouaméni|DM|8|84|26|fr
N'Golo Kanté|Kanté|DM|13|77|35|fr
Manu Koné|Koné|CM|6|84|25|fr
Adrien Rabiot|Rabiot|CM|14|82|31|fr
Warren Zaïre-Emery|Zaïre-Emery|CM|18|79|20|fr
Rayan Cherki|Cherki|AM|24|82|22|fr
Ousmane Dembélé|Dembélé|RW|7|88|29|fr
Michael Olise|Olise|RW|11|87|24|fr
Désiré Doué|Doué|LW|20|84|21|fr
Bradley Barcola|Barcola|LW|12|83|23|fr
Kylian Mbappé|Mbappé|ST|10|91|27|fr
Marcus Thuram|Thuram|ST|9|84|28|fr
Jean-Philippe Mateta|Mateta|ST|22|80|28|fr
= gana 2026 4-2-3-1
Lawrence Ati-Zigi|Ati-Zigi|GK|1|70|29|gh
Joseph Anang|Anang|GK|12|65|25|gh
Alidu Seidu|Seidu|RB|2|70|25|gh
Marvin Senaya|Senaya|RB|26|65|25|gh
Kojo Oppong|Oppong|CB|21|70|21|gh
Abdul Mumin|Mumin|CB|6|70|27|gh
Jonas Adjetey|Adjetey|CB|4|67|22|gh
Jerome Opoku|Opoku|CB|18|66|27|gh
Gideon Mensah|Mensah|LB|14|68|27|gh
Baba Rahman|Baba Rahman|LB|17|65|31|gh
Thomas Partey|Partey|DM|5|79|32|gh
Elisha Owusu|Owusu|DM|15|68|28|gh
Kwasi Sibo|Sibo|CM|8|68|27|gh
Caleb Yirenkyi|Yirenkyi|CM|3|67|20|gh
Augustine Boakye|Boakye|CM|20|65|25|gh
Abdul Fatawu|Fatawu|RW|7|77|22|gh
Ernest Nuamah|Nuamah|RW|24|73|22|gh
Christopher Bonsu Baah|Bonsu Baah|RW|13|70|21|gh
Antoine Semenyo|Semenyo|LW|11|84|26|gh
Kamaldeen Sulemana|Sulemana|LW|22|73|24|gh
Iñaki Williams|Iñaki Williams|ST|19|77|31|gh
Jordan Ayew|J. Ayew|ST|9|73|34|gh
Brandon Thomas-Asante|Thomas-Asante|ST|10|70|27|gh
= haiti 2026 4-3-3
Johny Placide|Placide|GK|1|66|38|ht
Alexandre Pierre|A. Pierre|GK|12|63|25|ht
Carlens Arcus|Arcus|RB|2|70|29|ht
Jean-Kévin Duverne|Duverne|RB|22|65|28|ht
Wilguens Paugain|Paugain|RB|24|61|23|ht
Ricardo Adé|Adé|CB|4|67|35|ht
Hannes Delcroix|Delcroix|CB|5|67|27|ht
Martin Expérience|Expérience|CB|8|65|27|ht
Markhus Lacroix|Lacroix|CB|13|62|24|ht
Keeto Thermoncy|Thermoncy|LB|3|63|23|ht
Leverton Pierre|L. Pierre|DM|14|64|28|ht
Carl Fred Sainté|Sainté|DM|6|63|23|ht
Danley Jean Jacques|Jean Jacques|CM|17|66|25|ht
Dominique Simon|Simon|CM|25|61|26|ht
Jean-Ricner Bellegarde|Bellegarde|AM|10|75|27|ht
Louicius Deedson|Deedson|RW|11|65|24|ht
Josué Casimir|Casimir|RW|21|65|24|ht
Derrick Etienne|Etienne|LW|7|67|29|ht
Ruben Providence|Providence|LW|15|63|24|ht
Wilson Isidor|Isidor|ST|18|77|25|ht
Duckens Nazon|Nazon|ST|9|67|32|ht
Frantzdy Pierrot|Pierrot|ST|20|67|31|ht
Lenny Joseph|Joseph|ST|16|63|25|ht
= holanda 2026 4-3-3
Bart Verbruggen|Verbruggen|GK|1|81|23|nl
Mark Flekken|Flekken|GK|23|77|32|nl
Jurriën Timber|Timber|RB|2|84|24|nl
Denzel Dumfries|Dumfries|RB|22|82|30|nl
Virgil van Dijk|Van Dijk|CB|4|86|34|nl
Micky van de Ven|Van de Ven|CB|15|84|25|nl
Jan Paul van Hecke|Van Hecke|CB|6|80|26|nl
Nathan Aké|Aké|CB|5|79|31|nl
Jorrel Hato|Hato|LB|25|80|20|nl
Ryan Gravenberch|Gravenberch|DM|8|85|24|nl
Marten de Roon|De Roon|DM|3|77|35|nl
Mats Wieffer|Wieffer|DM|12|76|26|nl
Frenkie de Jong|F. de Jong|CM|21|85|29|nl
Tijjani Reijnders|Reijnders|CM|14|84|27|nl
Teun Koopmeiners|Koopmeiners|CM|20|78|28|nl
Justin Kluivert|Kluivert|AM|7|79|27|nl
Donyell Malen|Malen|RW|18|80|27|nl
Cody Gakpo|Gakpo|LW|11|84|27|nl
Noa Lang|Lang|LW|17|77|27|nl
Crysencio Summerville|Summerville|LW|24|77|24|nl
Memphis Depay|Memphis|ST|10|79|32|nl
Brian Brobbey|Brobbey|ST|19|75|24|nl
Wout Weghorst|Weghorst|ST|9|70|33|nl
= inglaterra 2026 4-2-3-1
Jordan Pickford|Pickford|GK|1|84|32|en
Dean Henderson|D. Henderson|GK|13|81|29|en
Reece James|Reece James|RB|24|84|26|en
Tino Livramento|Livramento|RB|12|80|23|en
Djed Spence|Spence|RB|25|77|25|en
Marc Guéhi|Guéhi|CB|6|84|25|en
Ezri Konsa|Konsa|CB|2|81|28|en
John Stones|Stones|CB|5|80|32|en
Jarell Quansah|Quansah|CB|26|77|23|en
Nico O'Reilly|O'Reilly|LB|3|80|21|en
Declan Rice|Rice|DM|4|88|27|en
Elliot Anderson|Anderson|CM|8|84|23|en
Kobbie Mainoo|Mainoo|CM|16|78|21|en
Jordan Henderson|J. Henderson|CM|14|75|35|en
Jude Bellingham|Bellingham|AM|10|86|22|en
Morgan Rogers|Rogers|AM|17|84|23|en
Eberechi Eze|Eze|AM|21|84|27|en
Bukayo Saka|Saka|RW|7|88|24|en
Noni Madueke|Madueke|RW|20|80|24|en
Anthony Gordon|Gordon|LW|18|82|25|en
Marcus Rashford|Rashford|LW|11|81|28|en
Harry Kane|Kane|ST|9|89|32|en
Ollie Watkins|Watkins|ST|19|81|30|en
= ira 2026 4-2-3-1
Alireza Beiranvand|Beiranvand|GK|1|73|33|ir
Payam Niazmand|Niazmand|GK|12|67|31|ir
Ramin Rezaeian|Rezaeian|RB|23|67|36|ir
Saleh Hardani|Hardani|RB|2|67|27|ir
Arya Yousefi|Yousefi|RB|17|64|23|ir
Shojae Khalilzadeh|Khalilzadeh|CB|4|67|37|ir
Hossein Kanani|Kanani|CB|13|68|31|ir
Ali Nemati|Nemati|CB|19|65|29|ir
Milad Mohammadi|Mohammadi|LB|5|67|32|ir
Ehsan Hajsafi|Hajsafi|LB|3|66|36|ir
Saeid Ezatolahi|Ezatolahi|DM|6|70|29|ir
Roozbeh Cheshmi|Cheshmi|DM|15|67|32|ir
Mehdi Torabi|Torabi|CM|16|67|31|ir
Mohammad Ghorbani|Ghorbani|CM|21|65|24|ir
Saman Ghoddos|Ghoddos|AM|14|70|32|ir
Mohammad Mohebbi|Mohebbi|RW|8|73|27|ir
Alireza Jahanbakhsh|Jahanbakhsh|RW|7|70|32|ir
Mehdi Ghayedi|Ghayedi|LW|10|70|27|ir
Amirhossein Hosseinzadeh|Hosseinzadeh|LW|18|67|25|ir
Mehdi Taremi|Taremi|ST|9|79|33|ir
Ali Alipour|Alipour|ST|11|70|30|ir
Shahriyar Moghanloo|Moghanloo|ST|20|65|31|ir
Dennis Dargahi|Dargahi|ST|24|63|22|ir
= iraque 2026 4-2-3-1
Jalal Hassan|Jalal Hassan|GK|12|65|35|iq
Fahad Talib|Fahad Talib|GK|1|64|31|iq
Hussein Ali|Hussein Ali|RB|3|65|24|iq
Mustafa Saadoon|Saadoon|RB|25|61|25|iq
Zaid Tahseen|Zaid Tahseen|CB|4|65|25|iq
Akam Hashim|Akam Hashim|CB|5|65|27|iq
Frans Putros|Putros|CB|26|65|32|iq
Munaf Younus|Munaf Younus|CB|6|63|29|iq
Merchas Doski|Doski|LB|23|65|27|iq
Rebin Ghareeb|Rebin Ghareeb|LB|2|63|33|iq
Ahmed Yahya|Ahmed Yahya|LB|15|62|25|iq
Amir Al-Ammari|Al-Ammari|DM|16|70|28|iq
Zidane Iqbal|Zidane Iqbal|CM|14|71|23|iq
Ibrahim Bayesh|Bayesh|CM|8|66|25|iq
Youssef Amyn|Amyn|CM|7|65|23|iq
Aimar Sher|Aimar Sher|CM|20|65|23|iq
Kevin Yakob|Yakob|AM|19|63|25|iq
Ahmed Qasim|Ahmed Qasim|RW|11|63|22|iq
Ali Jasim|Ali Jasim|LW|17|67|22|iq
Marko Farji|Farji|LW|21|62|22|iq
Ali Al-Hamadi|Al-Hamadi|ST|9|73|24|iq
Aymen Hussein|Aymen Hussein|ST|18|68|30|iq
Mohanad Ali|Mohanad Ali|ST|10|67|25|iq
= japao 2026 4-2-3-1
Zion Suzuki|Zion Suzuki|GK|1|77|23|jp
Keisuke Osako|Osako|GK|12|66|26|jp
Yukinari Sugawara|Sugawara|RB|2|75|25|jp
Kou Itakura|Itakura|CB|4|76|29|jp
Hiroki Ito|Hiroki Ito|CB|21|79|27|jp
Takehiro Tomiyasu|Tomiyasu|CB|22|73|27|jp
Tsuyoshi Watanabe|Watanabe|CB|16|73|29|jp
Shogo Taniguchi|Taniguchi|CB|3|71|34|jp
Ayumu Seko|Seko|CB|20|70|25|jp
Yuto Nagatomo|Nagatomo|LB|5|64|39|jp
Wataru Endo|Endo|DM|6|77|33|jp
Kaishu Sano|Sano|DM|24|78|25|jp
Ao Tanaka|Ao Tanaka|CM|7|77|27|jp
Daichi Kamada|Kamada|AM|15|79|29|jp
Takefusa Kubo|Kubo|RW|8|83|25|jp
Ritsu Doan|Doan|RW|10|81|27|jp
Junya Ito|Junya Ito|RW|14|76|33|jp
Daizen Maeda|Maeda|LW|11|80|28|jp
Keito Nakamura|Keito Nakamura|LW|13|77|25|jp
Yuito Suzuki|Yuito Suzuki|LW|17|76|24|jp
Ayase Ueda|Ueda|ST|18|79|27|jp
Koki Ogawa|Ogawa|ST|19|70|28|jp
Kento Shiogai|Shiogai|ST|26|70|21|jp
= jordania 2026 4-2-3-1
Yazeed Abulaila|Abulaila|GK|1|65|33|jo
Nour Bani Attiah|Bani Attiah|GK|12|59|29|jo
Saed Al-Rosan|Al-Rosan|RB|19|63|29|jo
Ehsan Haddad|Haddad|RB|23|62|32|jo
Yazan Al-Arab|Al-Arab|CB|5|65|30|jo
Abdallah Nasib|Nasib|CB|3|63|32|jo
Mohammad Abu Hashish|Abu Hashish|CB|2|63|30|jo
Husam Abu Dahab|Abu Dahab|CB|4|61|25|jo
Mohammad Abualnadi|Abualnadi|CB|16|60|26|jo
Anas Badawi|Badawi|CB|26|60|26|jo
Saleem Obaid|Obaid|LB|17|61|25|jo
Nizar Al-Rashdan|Al-Rashdan|DM|21|65|27|jo
Amer Jamous|Jamous|DM|6|61|25|jo
Noor Al-Rawabdeh|Al-Rawabdeh|CM|8|63|29|jo
Rajaei Ayed|Ayed|CM|14|63|32|jo
Ibrahim Sadeh|Sadeh|CM|15|61|25|jo
Mohannad Abu Taha|Abu Taha|CM|20|61|23|jo
Mousa Al-Taamari|Al-Taamari|RW|10|76|28|jo
Mohammad Abu Zraiq|Abu Zraiq|RW|7|63|28|jo
Mahmoud Al-Mardi|Al-Mardi|RW|13|63|32|jo
Ibrahim Sabra|Sabra|LW|18|61|23|jo
Ali Olwan|Olwan|ST|9|67|26|jo
Ali Azaizeh|Azaizeh|ST|24|63|24|jo
= marfim 2026 4-3-3
Yahia Fofana|Y. Fofana|GK|1|74|25|ci
Alban Lafont|Lafont|GK|23|73|27|ci
Wilfried Singo|Singo|RB|5|77|25|ci
Guéla Doué|G. Doué|RB|17|74|23|ci
Ousmane Diomande|O. Diomande|CB|2|82|22|ci
Evan Ndicka|Ndicka|CB|21|81|26|ci
Odilon Kossounou|Kossounou|CB|7|77|25|ci
Emmanuel Agbadou|Agbadou|CB|20|75|28|ci
Ghislain Konan|Konan|LB|3|70|30|ci
Christopher Operi|Operi|LB|13|66|29|ci
Ibrahim Sangaré|Sangaré|DM|18|77|28|ci
Jean Michaël Seri|Seri|DM|4|70|34|ci
Franck Kessié|Kessié|CM|8|79|29|ci
Seko Fofana|S. Fofana|CM|6|77|31|ci
Christ Inao Oulaï|Oulaï|CM|26|73|20|ci
Amad Diallo|Amad|RW|15|81|23|ci
Nicolas Pépé|Pépé|RW|19|75|31|ci
Yan Diomande|Y. Diomande|LW|11|80|19|ci
Simon Adingra|Adingra|LW|10|75|24|ci
Ange-Yoan Bonny|Bonny|ST|9|79|22|ci
Evann Guessand|Guessand|ST|22|76|24|ci
Elye Wahi|Wahi|ST|12|73|23|ci
Oumar Diakité|Diakité|ST|14|70|22|ci
= marrocos 2026 4-3-3
Yassine Bounou|Bono|GK|1|83|35|ma
Munir El Kajoui|El Kajoui|GK|12|70|37|ma
Achraf Hakimi|Hakimi|RB|2|87|27|ma
Zakaria El Ouahdi|El Ouahdi|RB|13|73|24|ma
Nayef Aguerd|Aguerd|CB|5|80|30|ma
Chadi Riad|Riad|CB|18|74|22|ma
Issa Diop|Diop|CB|14|73|29|ma
Noussair Mazraoui|Mazraoui|LB|3|81|28|ma
Anass Salah-Eddine|Salah-Eddine|LB|26|73|24|ma
Youssef Belammari|Belammari|LB|19|65|27|ma
Sofyan Amrabat|Amrabat|DM|4|78|29|ma
Ayyoub Bouaddi|Bouaddi|DM|6|75|18|ma
Samir El Mourabet|El Mourabet|DM|15|67|20|ma
Azzedine Ounahi|Ounahi|CM|8|77|26|ma
Neil El Aynaoui|El Aynaoui|CM|24|76|24|ma
Brahim Díaz|Brahim|AM|10|83|26|ma
Ismael Saibari|Saibari|AM|11|80|25|ma
Bilal El Khannouss|El Khannouss|AM|23|77|22|ma
Chemsdine Talbi|Talbi|RW|7|73|21|ma
Abde Ezzalzouli|Abde|LW|17|78|24|ma
Soufiane Rahimi|Rahimi|LW|9|75|30|ma
Ayoub El Kaabi|El Kaabi|ST|20|79|32|ma
Ayoub Amaimouni|Amaimouni|ST|21|68|21|ma
= mexico 2026 4-3-3
Raúl Rangel|Rangel|GK|1|73|26|mx
Guillermo Ochoa|Ochoa|GK|13|65|40|mx
Jorge Sánchez|J. Sánchez|RB|2|68|28|mx
Israel Reyes|Reyes|CB|15|68|26|mx
Johan Vásquez|Vásquez|CB|5|79|27|mx
César Montes|Montes|CB|3|73|29|mx
Mateo Chávez|Mateo Chávez|LB|20|67|22|mx
Jesús Gallardo|Gallardo|LB|23|66|31|mx
Edson Álvarez|Edson Álvarez|DM|4|78|28|mx
Erik Lira|Lira|DM|6|73|26|mx
Álvaro Fidalgo|Fidalgo|CM|8|75|29|mx
Luis Chávez|L. Chávez|CM|24|70|30|mx
Luis Romo|Romo|CM|7|67|31|mx
Obed Vargas|Obed Vargas|CM|18|68|20|mx
Orbelín Pineda|Pineda|AM|17|73|30|mx
Gilberto Mora|Gilberto Mora|AM|19|67|17|mx
Julián Quiñones|Quiñones|RW|16|73|29|mx
Roberto Alvarado|Piojo Alvarado|RW|25|70|27|mx
César Huerta|Huerta|RW|21|68|25|mx
Alexis Vega|Vega|LW|10|75|28|mx
Santiago Giménez|Santi Giménez|ST|11|77|25|mx
Raúl Jiménez|Raúl Jiménez|ST|9|76|35|mx
Armando González|Hormiga González|ST|14|66|23|mx
= noruega 2026 4-3-3
Ørjan Nyland|Nyland|GK|1|73|35|no
Egil Selvik|Selvik|GK|13|66|28|no
Julian Ryerson|Ryerson|RB|26|78|28|no
Marcus Holmgren Pedersen|Holmgren|RB|16|73|25|no
Kristoffer Ajer|Ajer|CB|3|75|28|no
Leo Østigård|Østigård|CB|4|75|26|no
Torbjørn Heggem|Heggem|CB|17|73|27|no
David Møller Wolfe|Møller Wolfe|LB|5|73|24|no
Fredrik Bjørkan|Bjørkan|LB|15|67|27|no
Patrick Berg|Berg|DM|6|76|28|no
Sander Berge|Berge|CM|8|77|28|no
Fredrik Aursnes|Aursnes|CM|14|77|30|no
Morten Thorsby|Thorsby|CM|2|70|30|no
Kristian Thorstvedt|Thorstvedt|CM|18|73|27|no
Martin Ødegaard|Ødegaard|AM|10|85|27|no
Thelo Aasgaard|Aasgaard|AM|19|70|24|no
Oscar Bobb|Bobb|RW|22|77|22|no
Antonio Nusa|Nusa|LW|20|79|21|no
Andreas Schjelderup|Schjelderup|LW|21|75|22|no
Jens Petter Hauge|Hauge|LW|23|70|26|no
Erling Haaland|Haaland|ST|9|90|25|no
Alexander Sørloth|Sørloth|ST|7|83|30|no
Jørgen Strand Larsen|Strand Larsen|ST|11|77|26|no
= nova_zelandia 2026 4-4-2
Alex Paulsen|Paulsen|GK|12|65|23|nz
Max Crocombe|Crocombe|GK|1|63|32|nz
Tim Payne|Payne|RB|2|65|32|nz
Tyler Bindon|Bindon|CB|4|67|21|nz
Michael Boxall|Boxall|CB|5|63|37|nz
Nando Pijnaker|Pijnaker|CB|15|63|27|nz
Finn Surman|Surman|CB|16|63|22|nz
Tommy Smith|T. Smith|CB|26|60|36|nz
Liberato Cacace|Cacace|LB|13|73|25|nz
Francis de Vries|De Vries|LB|3|61|31|nz
Joe Bell|Bell|DM|6|67|27|nz
Alex Rufer|Rufer|DM|14|63|29|nz
Marko Stamenić|Stamenić|CM|8|68|24|nz
Matthew Garbett|Garbett|CM|7|65|24|nz
Ryan Thomas|R. Thomas|CM|23|63|31|nz
Sarpreet Singh|Sarpreet|AM|10|64|27|nz
Elijah Just|Just|RW|11|65|26|nz
Callum McCowatt|McCowatt|RW|20|63|27|nz
Kosta Barbarouses|Barbarouses|RW|17|62|36|nz
Ben Old|Old|LW|19|62|23|nz
Chris Wood|Wood|ST|9|81|34|nz
Ben Waine|Waine|ST|18|61|24|nz
Jesse Randall|Randall|ST|21|62|22|nz
= panama 2026 4-4-2
Luis Mejía|Mejía|GK|1|66|35|pa
Orlando Mosquera|Mosquera|GK|22|62|31|pa
Amir Murillo|Murillo|RB|23|71|30|pa
César Blackman|Blackman|RB|2|66|28|pa
José Córdoba|Córdoba|CB|3|70|25|pa
Fidel Escobar|Escobar|CB|4|66|31|pa
Edgardo Fariña|Fariña|CB|5|66|24|pa
Andrés Andrade|Andrade|CB|16|63|27|pa
Jiovany Ramos|J. Ramos|CB|13|61|29|pa
Roderick Miller|Miller|CB|25|61|34|pa
Eric Davis|Davis|LB|15|65|35|pa
Aníbal Godoy|Godoy|DM|20|64|36|pa
Cristian Martínez|C. Martínez|DM|6|63|29|pa
Carlos Harvey|Harvey|DM|14|63|26|pa
Adalberto Carrasquilla|Carrasquilla|CM|8|74|27|pa
José Luis Rodríguez|J. L. Rodríguez|RW|7|67|27|pa
César Yanis|Yanis|RW|21|63|29|pa
Ismael Díaz|Ismael Díaz|RW|10|68|29|pa
Édgar Bárcenas|Bárcenas|LW|11|67|32|pa
Alberto Quintero|Quintero|LW|19|60|38|pa
José Fajardo|Fajardo|ST|17|65|32|pa
Cecilio Waterman|Waterman|ST|18|62|35|pa
Tomás Rodríguez|T. Rodríguez|ST|9|61|26|pa
= paraguai 2026 4-4-2
Roberto Fernández|Gatito|GK|1|73|38|py
Orlando Gill|Gill|GK|12|70|26|py
Juan José Cáceres|Cáceres|RB|4|70|26|py
Gustavo Velázquez|Velázquez|RB|2|67|35|py
Gustavo Gómez|Gustavo Gómez|CB|15|78|33|py
Omar Alderete|Alderete|CB|3|77|29|py
Fabián Balbuena|Balbuena|CB|5|70|34|py
Júnior Alonso|Júnior Alonso|LB|6|73|33|py
José Canale|Canale|LB|13|65|29|py
Andrés Cubas|Cubas|DM|14|74|30|py
Damián Bobadilla|Bobadilla|CM|16|73|24|py
Diego Gómez|Diego Gómez|CM|8|79|23|py
Matías Galarza|Galarza|CM|23|70|24|py
Braian Ojeda|Ojeda|CM|20|68|26|py
Mauricio|Maurício|AM|11|73|24|py
Alejandro Romero Gamarra|Kaku|AM|17|70|31|py
Miguel Almirón|Almirón|RW|10|75|32|py
Ramón Sosa|Ramón Sosa|LW|7|73|26|py
Julio Enciso|Enciso|LW|19|77|22|py
Antonio Sanabria|Sanabria|ST|9|73|30|py
Gabriel Ávalos|Ávalos|ST|21|67|35|py
Isidro Pitta|Pitta|ST|25|67|26|py
Álex Arce|Arce|ST|18|65|30|py
= portugal 2026 4-3-3
Diogo Costa|Diogo Costa|GK|1|85|26|pt
José Sá|José Sá|GK|12|79|33|pt
Diogo Dalot|Dalot|RB|5|80|27|pt
João Cancelo|Cancelo|RB|20|79|32|pt
Nélson Semedo|Semedo|RB|2|78|32|pt
Rúben Dias|Rúben Dias|CB|3|85|29|pt
Gonçalo Inácio|Inácio|CB|14|81|24|pt
Tomás Araújo|Tomás Araújo|CB|4|79|24|pt
Renato Veiga|Veiga|CB|13|77|22|pt
Nuno Mendes|Nuno Mendes|LB|25|86|24|pt
Rúben Neves|Rúben Neves|DM|21|80|29|pt
Vitinha|Vitinha|CM|23|88|26|pt
João Neves|João Neves|CM|15|86|21|pt
Matheus Nunes|Matheus Nunes|CM|6|81|27|pt
Bruno Fernandes|Bruno Fernandes|AM|8|86|31|pt
João Félix|João Félix|AM|11|79|26|pt
Bernardo Silva|Bernardo|RW|10|84|31|pt
Pedro Neto|Pedro Neto|RW|18|81|26|pt
Francisco Conceição|Chico Conceição|RW|26|81|23|pt
Francisco Trincão|Trincão|RW|16|80|26|pt
Rafael Leão|Leão|LW|17|83|26|pt
Cristiano Ronaldo|C. Ronaldo|ST|7|81|41|pt
Gonçalo Ramos|Gonçalo Ramos|ST|9|78|25|pt
= senegal 2026 4-3-3
Édouard Mendy|É. Mendy|GK|16|77|34|sn
Yehvann Diouf|Y. Diouf|GK|1|73|26|sn
Krépin Diatta|Diatta|RB|15|73|27|sn
Antoine Mendy|A. Mendy|RB|24|70|22|sn
Kalidou Koulibaly|Koulibaly|CB|3|78|34|sn
Moussa Niakhaté|Niakhaté|CB|19|76|30|sn
Mamadou Sarr|M. Sarr|CB|2|73|20|sn
Abdoulaye Seck|Seck|CB|4|70|34|sn
El Hadji Malick Diouf|M. Diouf|LB|25|76|21|sn
Ismail Jakobs|Jakobs|LB|14|73|26|sn
Idrissa Gana Gueye|Gana Gueye|DM|5|75|36|sn
Pathé Ciss|Ciss|DM|6|73|32|sn
Pape Matar Sarr|P. M. Sarr|CM|17|80|23|sn
Lamine Camara|Camara|CM|8|77|22|sn
Habib Diarra|Diarra|CM|21|77|22|sn
Pape Gueye|P. Gueye|CM|26|76|27|sn
Ismaïla Sarr|I. Sarr|RW|18|80|28|sn
Ibrahim Mbaye|Mbaye|RW|20|70|18|sn
Iliman Ndiaye|Iliman Ndiaye|LW|13|82|26|sn
Sadio Mané|Mané|LW|10|78|34|sn
Assane Diao|Diao|LW|7|73|20|sn
Nicolas Jackson|Jackson|ST|11|79|25|sn
Bamba Dieng|Dieng|ST|9|67|26|sn
= suecia 2026 4-4-2
Viktor Johansson|V. Johansson|GK|12|73|27|se
Jacob Widell Zetterström|Zetterström|GK|1|70|27|se
Herman Johansson|H. Johansson|RB|6|65|28|se
Isak Hien|Hien|CB|4|79|27|se
Victor Lindelöf|Lindelöf|CB|3|75|31|se
Gustaf Lagerbielke|Lagerbielke|CB|2|73|26|se
Carl Starfelt|Starfelt|CB|15|67|31|se
Hjalmar Ekdal|Ekdal|CB|14|65|27|se
Gabriel Gudmundsson|Gudmundsson|LB|5|75|27|se
Daniel Svensson|D. Svensson|LB|8|73|23|se
Eric Smith|Eric Smith|DM|20|73|29|se
Jesper Karlström|Karlström|DM|16|70|30|se
Lucas Bergvall|Bergvall|CM|7|80|20|se
Mattias Svanberg|Svanberg|CM|19|75|27|se
Yasin Ayari|Ayari|CM|18|73|22|se
Benjamin Nygren|Nygren|AM|10|73|24|se
Anthony Elanga|Elanga|RW|11|79|24|se
Ken Sema|Sema|LW|13|65|32|se
Alexander Bernhardsson|Bernhardsson|LW|21|67|27|se
Taha Ali|Taha Ali|LW|26|65|27|se
Alexander Isak|Isak|ST|9|85|26|se
Viktor Gyökeres|Gyökeres|ST|17|84|28|se
Gustaf Nilsson|G. Nilsson|ST|25|66|29|se
= suica 2026 4-2-3-1
Gregor Kobel|Kobel|GK|1|85|28|ch
Yvon Mvogo|Mvogo|GK|12|73|32|ch
Silvan Widmer|Widmer|RB|3|73|33|ch
Manuel Akanji|Akanji|CB|5|84|30|ch
Nico Elvedi|Elvedi|CB|4|76|29|ch
Eray Cömert|Cömert|CB|18|70|28|ch
Aurèle Amenda|Amenda|CB|24|70|22|ch
Ricardo Rodríguez|R. Rodríguez|LB|13|73|33|ch
Miro Muheim|Muheim|LB|2|73|28|ch
Granit Xhaka|Xhaka|DM|10|83|33|ch
Denis Zakaria|Zakaria|DM|6|80|29|ch
Remo Freuler|Freuler|CM|8|77|34|ch
Johan Manzambi|Manzambi|CM|9|79|20|ch
Ardon Jashari|Jashari|CM|14|77|23|ch
Michel Aebischer|Aebischer|CM|20|73|29|ch
Djibril Sow|Sow|CM|15|73|29|ch
Fabian Rieder|Rieder|AM|22|73|24|ch
Dan Ndoye|Ndoye|RW|11|79|25|ch
Ruben Vargas|Vargas|LW|17|75|27|ch
Noah Okafor|Okafor|LW|19|76|26|ch
Breel Embolo|Embolo|ST|7|75|29|ch
Zeki Amdouni|Amdouni|ST|23|74|25|ch
Cedric Itten|Itten|ST|26|68|29|ch
= tcheca 2026 4-2-3-1
Matěj Kovář|Kovář|GK|1|75|26|cz
Jindřich Staněk|Staněk|GK|16|70|30|cz
Vladimír Coufal|Coufal|RB|5|73|33|cz
David Doudera|Doudera|RB|21|67|28|cz
Ladislav Krejčí|Krejčí|CB|7|77|27|cz
Robin Hranáč|Hranáč|CB|4|75|26|cz
David Zima|Zima|CB|2|73|25|cz
Tomáš Holeš|Holeš|CB|3|73|33|cz
Štěpán Chaloupek|Chaloupek|CB|6|68|23|cz
David Jurásek|Jurásek|LB|14|70|26|cz
Jaroslav Zelený|Zelený|LB|20|65|33|cz
Tomáš Souček|Souček|CM|22|79|31|cz
Lukáš Červ|Červ|CM|12|73|25|cz
Michal Sadílek|Sadílek|CM|18|70|27|cz
Alexandr Sojka|Sojka|CM|24|67|27|cz
Vladimír Darida|Darida|CM|8|66|35|cz
Pavel Šulc|Šulc|AM|15|77|25|cz
Lukáš Provod|Provod|LW|17|75|29|cz
Adam Hložek|Hložek|LW|9|76|23|cz
Patrik Schick|Schick|ST|10|82|30|cz
Tomáš Chorý|Chorý|ST|19|73|31|cz
Jan Kuchta|Kuchta|ST|11|70|29|cz
Mojmír Chytil|Chytil|ST|13|68|27|cz
= tunisia 2026 4-3-3
Aymen Dahmen|Dahmen|GK|16|67|29|tn
Mouhib Chamakh|Chamakh|GK|1|63|24|tn
Yan Valery|Valery|RB|20|70|27|tn
Mohamed Amine Ben Hmida|Ben Hmida|RB|21|65|30|tn
Mortadha Ben Ouanes|Ben Ouanes|RB|12|63|31|tn
Montassar Talbi|Talbi|CB|3|75|28|tn
Dylan Bronn|Bronn|CB|6|70|30|tn
Omar Rekik|Rekik|CB|4|65|24|tn
Adam Arous|Arous|CB|5|63|22|tn
Ali Abdi|Abdi|LB|2|73|32|tn
Ellyes Skhiri|Skhiri|DM|17|77|31|tn
Rani Khedira|Khedira|DM|13|75|32|tn
Hannibal Mejbri|Mejbri|CM|10|73|23|tn
Mohamed Hadj Mahmoud|Hadj Mahmoud|CM|15|67|25|tn
Anis Ben Slimane|Ben Slimane|CM|25|67|25|tn
Khalil Ayari|Ayari|CM|14|65|21|tn
Ismaël Gharbi|Gharbi|AM|11|70|22|tn
Sebastian Tounekti|Tounekti|RW|26|70|24|tn
Elias Achouri|Achouri|LW|7|73|27|tn
Elias Saad|Saad|LW|8|70|26|tn
Hazem Mastouri|Mastouri|ST|9|67|29|tn
Firas Chaouat|Chaouat|ST|19|65|30|tn
Rayan Elloumi|Elloumi|ST|18|63|20|tn
= turquia 2026 4-2-3-1
Uğurcan Çakır|Uğurcan|GK|23|81|30|tr
Mert Günok|Günok|GK|1|73|37|tr
Zeki Çelik|Zeki Çelik|RB|2|75|29|tr
Mert Müldür|Müldür|RB|18|75|27|tr
Merih Demiral|Demiral|CB|3|79|28|tr
Abdülkerim Bardakcı|Bardakcı|CB|14|77|31|tr
Çağlar Söyüncü|Söyüncü|CB|4|75|30|tr
Ozan Kabak|Kabak|CB|15|73|26|tr
Ferdi Kadıoğlu|Ferdi|LB|20|80|26|tr
Eren Elmalı|Elmalı|LB|13|73|25|tr
Hakan Çalhanoğlu|Çalhanoğlu|DM|10|85|32|tr
Salih Özcan|Salih Özcan|DM|5|75|28|tr
Orkun Kökçü|Kökçü|CM|6|81|25|tr
İsmail Yüksek|Yüksek|CM|16|75|27|tr
Kaan Ayhan|Kaan Ayhan|CM|22|71|31|tr
Arda Güler|Arda Güler|AM|8|85|21|tr
Can Uzun|Can Uzun|AM|26|77|20|tr
Barış Alper Yılmaz|Barış Alper|RW|21|79|26|tr
Yunus Akgün|Yunus Akgün|RW|19|77|25|tr
İrfan Can Kahveci|İrfan Can|RW|17|75|30|tr
Kenan Yıldız|Kenan Yıldız|LW|11|84|21|tr
Kerem Aktürkoğlu|Kerem|LW|7|79|27|tr
Deniz Gül|Deniz Gül|ST|9|70|21|tr
= uruguai 2026 4-3-3
Sergio Rochet|Rochet|GK|1|78|33|uy
Fernando Muslera|Muslera|GK|23|70|40|uy
Guillermo Varela|Varela|RB|13|75|33|uy
Ronald Araujo|Araujo|CB|4|83|27|uy
José María Giménez|Giménez|CB|2|81|31|uy
Sebastián Cáceres|Cáceres|CB|3|75|26|uy
Santiago Bueno|Bueno|CB|24|73|27|uy
Mathías Olivera|Olivera|LB|16|77|28|uy
Joaquín Piquerez|Piquerez|LB|22|77|27|uy
Manuel Ugarte|Ugarte|DM|5|79|25|uy
Emiliano Martínez|E. Martínez|DM|15|70|26|uy
Federico Valverde|Valverde|CM|8|86|27|uy
Rodrigo Bentancur|Bentancur|CM|6|81|28|uy
Nicolás de la Cruz|De la Cruz|CM|7|78|29|uy
Giorgian de Arrascaeta|Arrascaeta|AM|10|84|32|uy
Rodrigo Zalazar|Zalazar|AM|26|78|26|uy
Facundo Pellistri|Pellistri|RW|11|75|24|uy
Agustín Canobbio|Canobbio|RW|14|73|27|uy
Maximiliano Araújo|Maxi Araújo|LW|20|78|26|uy
Brian Rodríguez|B. Rodríguez|LW|18|73|26|uy
Darwin Núñez|Darwin|ST|9|80|26|uy
Rodrigo Aguirre|Aguirre|ST|19|73|31|uy
Federico Viñas|Viñas|ST|21|70|27|uy
= uzbequistao 2026 4-2-3-1
Utkir Yusupov|Yusupov|GK|1|67|35|uz
Abduvohid Nematov|Nematov|GK|12|63|24|uz
Khojiakbar Alijonov|Alijonov|RB|3|65|28|uz
Abdukodir Khusanov|Khusanov|CB|2|77|22|uz
Rustam Ashurmatov|Ashurmatov|CB|5|65|29|uz
Umar Eshmurodov|Eshmurodov|CB|15|64|33|uz
Abdulla Abdullaev|Abdullaev|CB|18|63|28|uz
Sherzod Nasrullaev|Nasrullaev|LB|13|63|27|uz
Farrukh Sayfiev|Sayfiev|LB|4|63|34|uz
Behruzjon Karimov|Karimov|LB|24|61|24|uz
Odiljon Xamrobekov|Xamrobekov|DM|9|63|29|uz
Otabek Shukurov|Shukurov|CM|7|67|29|uz
Akmal Mozgovoy|Mozgovoy|CM|6|65|26|uz
Jamshid Iskanderov|Iskanderov|CM|8|63|32|uz
Azizjon Ganiev|Ganiev|CM|19|63|27|uz
Jaloliddin Masharipov|Masharipov|AM|10|73|32|uz
Abbosbek Fayzullaev|Fayzullaev|AM|22|73|22|uz
Dostonbek Khamdamov|Khamdamov|RW|17|65|29|uz
Sherzod Esanov|Esanov|RW|23|63|26|uz
Oston Urunov|Urunov|LW|11|67|25|uz
Eldor Shomurodov|Shomurodov|ST|14|73|30|uz
Igor Sergeev|Sergeev|ST|21|65|32|uz
Azizbek Amonov|Amonov|ST|20|63|28|uz
// ======================================================== históricas
= brasil 1970 4-2-3-1
Félix|Félix|GK|1|73|32|br
Leão|Leão|GK|22|75|20|br
Ado|Ado|GK|12|67|23|br
Carlos Alberto Torres|Carlos Alberto|RB|4|86|25|br
Zé Maria|Zé Maria|RB|21|74|21|br
Brito|Brito|CB|2|78|30|br
Wilson Piazza|Piazza|CB|3|80|27|br
Fontana|Fontana|CB|15|71|29|br
Baldocchi|Baldocchi|CB|14|70|24|br
Joel Camargo|Joel Camargo|CB|17|71|23|br
Everaldo|Everaldo|LB|16|76|25|br
Marco Antônio|Marco Antônio|LB|6|75|19|br
Clodoaldo|Clodoaldo|DM|5|83|20|br
Gérson|Gérson|CM|8|87|29|br
Pelé|Pelé|AM|10|95|29|br
Rivellino|Rivellino|LW|11|88|24|br
Paulo Cézar Caju|Paulo Cézar|LW|18|81|20|br
Jairzinho|Jairzinho|RW|7|89|25|br
Edu|Edu|LW|19|76|20|br
Tostão|Tostão|ST|9|87|23|br
Roberto Miranda|Roberto Miranda|ST|13|76|26|br
Dadá Maravilha|Dadá|ST|20|74|24|br
= brasil 1982 4-4-2
Waldir Peres|Waldir Peres|GK|1|73|31|br
Paulo Sérgio|Paulo Sérgio|GK|12|70|28|br
Leandro|Leandro|RB|2|84|23|br
Edevaldo|Edevaldo|RB|13|73|24|br
Oscar|Oscar|CB|3|82|28|br
Luizinho|Luizinho|CB|4|81|24|br
Edinho|Edinho|CB|15|77|27|br
Juninho Fonseca|Juninho|CB|14|73|24|br
Júnior|Júnior|LB|6|86|28|br
Pedrinho|Pedrinho|LB|16|75|25|br
Toninho Cerezo|Cerezo|DM|5|85|27|br
Batista|Batista|DM|17|77|27|br
Falcão|Falcão|CM|15|89|28|br
Renato|Renato|CM|18|75|25|br
Sócrates|Sócrates|AM|8|89|28|br
Zico|Zico|AM|10|91|29|br
Paulo Isidoro|Paulo Isidoro|RW|19|80|28|br
Éder|Éder|LW|11|84|25|br
Dirceu|Dirceu|LW|20|78|30|br
Serginho Chulapa|Serginho|ST|9|75|28|br
Roberto Dinamite|Roberto Dinamite|ST|21|79|28|br
Careca|Careca|ST|22|77|21|br
= brasil 1994 4-4-2
Cláudio Taffarel|Taffarel|GK|1|83|28|br
Zetti|Zetti|GK|12|76|29|br
Jorginho|Jorginho|RB|2|84|29|br
Cafu|Cafu|RB|14|79|24|br
Aldair|Aldair|CB|13|84|28|br
Márcio Santos|Márcio Santos|CB|15|80|24|br
Ricardo Rocha|Ricardo Rocha|CB|3|77|31|br
Ronaldão|Ronaldão|CB|4|73|29|br
Leonardo|Leonardo|LB|16|82|24|br
Branco|Branco|LB|6|77|30|br
Mauro Silva|Mauro Silva|DM|5|84|26|br
Dunga|Dunga|DM|8|84|30|br
Mazinho|Mazinho|CM|17|80|28|br
Zinho|Zinho|CM|9|80|27|br
Raí|Raí|AM|10|82|29|br
Paulo Sérgio|Paulo Sérgio|RW|18|74|25|br
Romário|Romário|ST|11|92|28|br
Bebeto|Bebeto|ST|7|87|30|br
Müller|Müller|ST|19|78|28|br
Viola|Viola|ST|21|76|25|br
Ronaldo|Ronaldo|ST|20|71|17|br
= brasil 2002 3-5-2
Marcos|Marcos|GK|1|83|28|br
Dida|Dida|GK|12|81|28|br
Cafu|Cafu|RB|2|85|32|br
Belletti|Belletti|RB|14|78|26|br
Lúcio|Lúcio|CB|3|84|24|br
Edmílson|Edmílson|CB|5|81|25|br
Roque Júnior|Roque Júnior|CB|4|80|25|br
Anderson Polga|Polga|CB|13|73|23|br
Roberto Carlos|Roberto Carlos|LB|6|87|29|br
Júnior|Júnior|LB|16|76|29|br
Gilberto Silva|Gilberto Silva|DM|8|83|25|br
Kléberson|Kléberson|CM|15|79|23|br
Vampeta|Vampeta|CM|18|76|28|br
Juninho Paulista|Juninho Paulista|AM|19|79|29|br
Ricardinho|Ricardinho|AM|17|77|26|br
Rivaldo|Rivaldo|AM|10|89|30|br
Ronaldinho Gaúcho|Ronaldinho|AM|11|86|22|br
Kaká|Kaká|AM|23|73|20|br
Denílson|Denílson|LW|20|78|24|br
Ronaldo|Ronaldo|ST|9|92|25|br
Edílson|Edílson|ST|21|78|31|br
Luizão|Luizão|ST|7|77|26|br
= argentina 1978 4-3-3
Ubaldo Fillol|Fillol|GK|5|85|28|ar
Héctor Baley|Baley|GK|3|67|28|ar
Jorge Olguín|Olguín|RB|15|78|26|ar
Rubén Pagnanini|Pagnanini|RB|14|70|29|ar
Daniel Passarella|Passarella|CB|19|87|25|ar
Luis Galván|Galván|CB|7|81|30|ar
Daniel Killer|Killer|CB|11|70|29|ar
Alberto Tarantini|Tarantini|LB|20|79|22|ar
Miguel Oviedo|Oviedo|LB|16|70|28|ar
Américo Gallego|Gallego|DM|6|81|23|ar
Osvaldo Ardiles|Ardiles|CM|2|84|25|ar
Omar Larrosa|Larrosa|CM|12|75|31|ar
Ricardo Villa|Villa|CM|22|73|25|ar
José Daniel Valencia|Valencia|AM|21|79|22|ar
Norberto Alonso|Beto Alonso|AM|1|77|25|ar
René Houseman|Houseman|RW|9|81|24|ar
Daniel Bertoni|Bertoni|RW|4|82|23|ar
Oscar Ortiz|Ortiz|LW|17|77|24|ar
Mario Kempes|Kempes|ST|10|90|23|ar
Leopoldo Luque|Luque|ST|14|83|28|ar
Norberto Outes|Outes|ST|13|67|25|ar
= argentina 1986 3-5-2
Nery Pumpido|Pumpido|GK|18|78|28|ar
Luis Islas|Islas|GK|15|70|20|ar
José Luis Cuciuffo|Cuciuffo|CB|9|76|25|ar
José Luis Brown|Brown|CB|5|79|29|ar
Oscar Ruggeri|Ruggeri|CB|19|83|24|ar
Néstor Clausen|Clausen|RB|4|73|24|ar
Julio Olarticoechea|Olarticoechea|LB|16|77|27|ar
Oscar Garré|Garré|LB|8|73|29|ar
Ricardo Giusti|Giusti|RB|14|79|29|ar
Sergio Batista|Batista|DM|2|81|23|ar
Héctor Enrique|Enrique|CM|12|78|24|ar
Marcelo Trobbiani|Trobbiani|CM|21|71|31|ar
Carlos Tapia|Tapia|CM|20|73|24|ar
Jorge Burruchaga|Burruchaga|AM|7|84|23|ar
Diego Maradona|Maradona|AM|10|95|25|ar
Claudio Borghi|Borghi|AM|6|75|21|ar
Ricardo Bochini|Bochini|AM|3|73|32|ar
Jorge Valdano|Valdano|ST|11|86|30|ar
Pedro Pasculli|Pasculli|ST|17|75|26|ar
Sergio Almirón|Almirón|ST|1|70|28|ar
Marcelo Gallego|M. Gallego|RW|13|67|26|ar
= argentina 2022 4-4-2
Emiliano Martínez|Dibu Martínez|GK|23|86|30|ar
Franco Armani|Armani|GK|1|75|35|ar
Nahuel Molina|Molina|RB|26|80|24|ar
Gonzalo Montiel|Montiel|RB|4|77|25|ar
Cristian Romero|Cuti Romero|CB|13|85|24|ar
Nicolás Otamendi|Otamendi|CB|19|81|34|ar
Lisandro Martínez|Lisandro|CB|25|82|24|ar
Germán Pezzella|Pezzella|CB|6|75|31|ar
Nicolás Tagliafico|Tagliafico|LB|3|80|30|ar
Marcos Acuña|Acuña|LB|8|80|31|ar
Leandro Paredes|Paredes|DM|5|79|28|ar
Guido Rodríguez|Guido Rodríguez|DM|18|77|28|ar
Enzo Fernández|Enzo|CM|24|83|21|ar
Rodrigo De Paul|De Paul|CM|7|83|28|ar
Alexis Mac Allister|Mac Allister|CM|20|83|23|ar
Exequiel Palacios|Palacios|CM|14|77|24|ar
Paulo Dybala|Dybala|AM|21|83|29|ar
Lionel Messi|Messi|RW|10|91|35|ar
Ángel Correa|Correa|RW|15|79|27|ar
Ángel Di María|Di María|LW|11|85|34|ar
Alejandro Gómez|Papu Gómez|LW|17|78|34|ar
Lautaro Martínez|Lautaro|ST|22|84|25|ar
Julián Álvarez|Julián|ST|9|84|22|ar
= alemanha 1974 4-3-3 | Alemanha Ocidental | West Germany | Alemania Occidental
Sepp Maier|Maier|GK|1|87|30|de
Norbert Nigbur|Nigbur|GK|21|70|26|de
Berti Vogts|Vogts|RB|2|84|27|de
Horst-Dieter Höttges|Höttges|RB|6|75|30|de
Franz Beckenbauer|Beckenbauer|CB|5|91|28|de
Georg Schwarzenbeck|Schwarzenbeck|CB|4|81|26|de
Bernhard Cullmann|Cullmann|CB|7|77|24|de
Paul Breitner|Breitner|LB|3|87|22|de
Rainer Bonhof|Bonhof|DM|16|83|22|de
Herbert Wimmer|Wimmer|CM|8|75|29|de
Wolfgang Overath|Overath|CM|12|85|30|de
Uli Hoeneß|Hoeneß|CM|14|83|22|de
Heinz Flohe|Flohe|CM|20|75|26|de
Helmut Kremers|Kremers|LB|15|70|25|de
Günter Netzer|Netzer|AM|10|84|29|de
Jürgen Grabowski|Grabowski|RW|9|82|30|de
Bernd Hölzenbein|Hölzenbein|LW|17|81|28|de
Dieter Herzog|Herzog|LW|18|75|27|de
Gerd Müller|Gerd Müller|ST|13|89|28|de
Jupp Heynckes|Heynckes|ST|11|81|29|de
Jupp Kapellmann|Kapellmann|CM|19|73|24|de
= alemanha 1990 3-5-2 | Alemanha Ocidental | West Germany | Alemania Occidental
Bodo Illgner|Illgner|GK|1|83|23|de
Raimond Aumann|Aumann|GK|12|73|26|de
Jürgen Kohler|Kohler|CB|4|84|24|de
Klaus Augenthaler|Augenthaler|CB|5|84|32|de
Guido Buchwald|Buchwald|CB|6|83|29|de
Thomas Berthold|Berthold|RB|14|82|25|de
Stefan Reuter|Reuter|RB|2|81|23|de
Andreas Brehme|Brehme|LB|3|86|29|de
Hans Pflügler|Pflügler|LB|15|75|30|de
Lothar Matthäus|Matthäus|CM|10|91|29|de
Olaf Thon|Thon|CM|20|79|24|de
Günter Hermann|Hermann|CM|16|73|29|de
Thomas Häßler|Häßler|AM|8|84|24|de
Pierre Littbarski|Littbarski|AM|7|82|30|de
Uwe Bein|Bein|AM|17|77|29|de
Andreas Möller|Möller|AM|19|79|22|de
Rudi Völler|Völler|ST|9|86|30|de
Jürgen Klinsmann|Klinsmann|ST|18|86|25|de
Karl-Heinz Riedle|Riedle|ST|13|81|24|de
Frank Mill|Mill|ST|11|73|32|de
Paul Steiner|Steiner|CB|21|73|33|de
= alemanha 2014 4-3-3
Manuel Neuer|Neuer|GK|1|90|28|de
Roman Weidenfeller|Weidenfeller|GK|22|77|33|de
Philipp Lahm|Lahm|RB|16|88|30|de
Kevin Großkreutz|Großkreutz|RB|2|73|25|de
Jérôme Boateng|Boateng|CB|20|85|25|de
Mats Hummels|Hummels|CB|5|86|25|de
Per Mertesacker|Mertesacker|CB|17|83|29|de
Shkodran Mustafi|Mustafi|CB|21|73|22|de
Matthias Ginter|Ginter|CB|3|71|20|de
Benedikt Höwedes|Höwedes|LB|4|81|26|de
Erik Durm|Durm|LB|15|70|22|de
Bastian Schweinsteiger|Schweinsteiger|CM|7|87|29|de
Toni Kroos|Kroos|CM|18|87|24|de
Sami Khedira|Khedira|CM|6|84|27|de
Christoph Kramer|Kramer|DM|23|74|23|de
Mesut Özil|Özil|AM|8|86|25|de
Mario Götze|Götze|AM|19|84|22|de
Julian Draxler|Draxler|AM|14|79|20|de
Thomas Müller|Müller|RW|13|88|24|de
André Schürrle|Schürrle|LW|9|83|23|de
Lukas Podolski|Podolski|LW|10|79|29|de
Miroslav Klose|Klose|ST|11|81|36|de
= uruguai 1950 4-3-3
Roque Máspoli|Máspoli|GK|1|83|33|uy
Aníbal Paz|Paz|GK|12|70|33|uy
Eusebio Tejera|Tejera|RB|3|77|28|uy
Matías González|Matías González|CB|2|81|25|uy
William Martínez|W. Martínez|CB|13|74|22|uy
Juan Carlos González|J. C. González|CB|14|73|26|uy
Schubert Gambetta|Gambetta|LB|6|79|30|uy
Héctor Vilches|Vilches|LB|15|70|24|uy
Obdulio Varela|Obdulio Varela|DM|5|87|32|uy
Víctor Rodríguez Andrade|R. Andrade|DM|4|83|23|uy
Rodolfo Pini|Pini|DM|16|71|23|uy
Julio Pérez|Julio Pérez|CM|8|80|24|uy
Washington Ortuño|Ortuño|CM|17|71|22|uy
Juan Alberto Schiaffino|Schiaffino|AM|10|88|24|uy
Alcides Ghiggia|Ghiggia|RW|7|85|23|uy
Ernesto Vidal|Vidal|LW|11|77|29|uy
Rubén Morán|Morán|LW|18|77|19|uy
Óscar Míguez|Míguez|ST|9|84|23|uy
Juan Burgueño|Burgueño|ST|19|74|26|uy
Julio César Britos|Britos|ST|20|74|24|uy
= uruguai 2010 4-4-2
Fernando Muslera|Muslera|GK|1|79|24|uy
Juan Castillo|Castillo|GK|12|67|32|uy
Maxi Pereira|Maxi Pereira|RB|16|80|26|uy
Jorge Fucile|Fucile|RB|4|77|25|uy
Diego Lugano|Lugano|CB|2|82|29|uy
Diego Godín|Godín|CB|3|80|24|uy
Mauricio Victorino|Victorino|CB|6|77|27|uy
Andrés Scotti|Scotti|CB|19|70|35|uy
Álvaro Pereira|Álvaro Pereira|LB|22|79|24|uy
Martín Cáceres|Cáceres|LB|22|77|23|uy
Egidio Arévalo Ríos|Arévalo Ríos|DM|17|80|28|uy
Diego Pérez|Diego Pérez|DM|15|78|30|uy
Walter Gargano|Gargano|CM|5|77|25|uy
Álvaro Fernández|Álvaro Fernández|LW|8|73|24|uy
Nicolás Lodeiro|Lodeiro|AM|14|73|21|uy
Ignacio González|Nacho González|AM|20|68|28|uy
Edinson Cavani|Cavani|RW|7|83|23|uy
Sebastián Fernández|Seba Fernández|RW|21|68|25|uy
Diego Forlán|Forlán|ST|10|89|31|uy
Luis Suárez|Suárez|ST|9|85|23|uy
Sebastián Abreu|Abreu|ST|13|75|33|uy
= uruguai 2018 4-4-2
Fernando Muslera|Muslera|GK|1|81|32|uy
Martín Silva|M. Silva|GK|12|70|35|uy
Martín Cáceres|Cáceres|RB|22|78|31|uy
Guillermo Varela|Varela|RB|4|74|25|uy
Diego Godín|Godín|CB|3|86|32|uy
José María Giménez|Giménez|CB|2|83|23|uy
Sebastián Coates|Coates|CB|19|78|27|uy
Diego Laxalt|Laxalt|LB|17|78|25|uy
Gastón Silva|G. Silva|LB|16|70|24|uy
Lucas Torreira|Torreira|DM|14|81|22|uy
Rodrigo Bentancur|Bentancur|CM|6|80|21|uy
Matías Vecino|Vecino|CM|15|80|26|uy
Nahitan Nández|Nández|CM|8|78|22|uy
Giorgian de Arrascaeta|Arrascaeta|AM|10|77|24|uy
Cristian Rodríguez|Cebolla|LW|7|78|32|uy
Carlos Sánchez|Carlos Sánchez|RW|5|74|33|uy
Jonathan Urretaviscaya|Urretaviscaya|RW|20|70|28|uy
Luis Suárez|Suárez|ST|9|87|31|uy
Edinson Cavani|Cavani|ST|21|86|31|uy
Cristhian Stuani|Stuani|ST|11|77|31|uy
Maxi Gómez|Maxi Gómez|ST|18|76|21|uy
= franca 1986 4-4-2
Joël Bats|Bats|GK|1|83|29|fr
Albert Rust|Rust|GK|21|70|33|fr
Manuel Amoros|Amoros|RB|2|83|24|fr
William Ayache|Ayache|RB|3|73|25|fr
Maxime Bossis|Bossis|CB|6|84|31|fr
Patrick Battiston|Battiston|CB|4|80|29|fr
Yvon Le Roux|Le Roux|CB|5|75|26|fr
Michel Bibard|Bibard|CB|7|70|28|fr
Thierry Tusseau|Tusseau|LB|8|73|28|fr
Luis Fernández|Fernández|DM|9|84|26|fr
Jean Tigana|Tigana|CM|14|86|31|fr
Alain Giresse|Giresse|CM|12|86|33|fr
Philippe Vercruysse|Vercruysse|AM|16|75|24|fr
Jean-Marc Ferreri|Ferreri|AM|11|76|23|fr
Michel Platini|Platini|AM|10|90|31|fr
Bruno Bellone|Bellone|LW|13|77|24|fr
Dominique Rocheteau|Rocheteau|RW|18|80|31|fr
Yannick Stopyra|Stopyra|ST|19|78|25|fr
Jean-Pierre Papin|Papin|ST|17|78|22|fr
Daniel Xuereb|Xuereb|ST|20|73|27|fr
= franca 1998 4-3-3
Fabien Barthez|Barthez|GK|16|85|27|fr
Bernard Lama|Lama|GK|1|78|35|fr
Lilian Thuram|Thuram|RB|15|86|26|fr
Marcel Desailly|Desailly|CB|8|87|29|fr
Laurent Blanc|Blanc|CB|5|86|32|fr
Frank Leboeuf|Leboeuf|CB|18|80|30|fr
Bixente Lizarazu|Lizarazu|LB|3|85|28|fr
Vincent Candela|Candela|LB|2|75|24|fr
Didier Deschamps|Deschamps|DM|7|85|29|fr
Christian Karembeu|Karembeu|CM|19|82|27|fr
Emmanuel Petit|Petit|CM|17|84|27|fr
Patrick Vieira|Vieira|CM|4|83|22|fr
Alain Boghossian|Boghossian|CM|14|76|27|fr
Zinedine Zidane|Zidane|AM|10|92|26|fr
Youri Djorkaeff|Djorkaeff|AM|6|85|30|fr
Robert Pirès|Pirès|LW|11|80|24|fr
Thierry Henry|Henry|LW|12|83|20|fr
Bernard Diomède|Diomède|RW|13|73|24|fr
Stéphane Guivarc'h|Guivarc'h|ST|9|75|27|fr
David Trezeguet|Trezeguet|ST|20|79|20|fr
Christophe Dugarry|Dugarry|ST|21|78|26|fr
= franca 2018 4-2-3-1
Hugo Lloris|Lloris|GK|1|85|31|fr
Steve Mandanda|Mandanda|GK|16|79|33|fr
Benjamin Pavard|Pavard|RB|2|80|22|fr
Djibril Sidibé|Sidibé|RB|22|76|25|fr
Raphaël Varane|Varane|CB|4|87|25|fr
Samuel Umtiti|Umtiti|CB|5|84|24|fr
Presnel Kimpembe|Kimpembe|CB|3|80|22|fr
Adil Rami|Rami|CB|17|75|32|fr
Lucas Hernández|L. Hernández|LB|21|82|22|fr
Benjamin Mendy|Mendy|LB|22|78|23|fr
N'Golo Kanté|Kanté|DM|13|88|27|fr
Steven N'Zonzi|N'Zonzi|DM|15|79|29|fr
Paul Pogba|Pogba|CM|6|86|25|fr
Blaise Matuidi|Matuidi|CM|14|83|31|fr
Corentin Tolisso|Tolisso|CM|12|80|23|fr
Antoine Griezmann|Griezmann|AM|7|89|27|fr
Nabil Fekir|Fekir|AM|18|81|24|fr
Thomas Lemar|Lemar|AM|8|79|22|fr
Kylian Mbappé|Mbappé|RW|10|88|19|fr
Florian Thauvin|Thauvin|RW|20|79|25|fr
Ousmane Dembélé|Dembélé|LW|11|81|21|fr
Olivier Giroud|Giroud|ST|9|81|31|fr
= espanha 1986 4-4-2
Andoni Zubizarreta|Zubizarreta|GK|1|83|25|es
Luis Arconada|Arconada|GK|13|79|31|es
Tomás Reñones|Tomás|RB|2|76|26|es
Chendo|Chendo|RB|12|74|25|es
Andoni Goikoetxea|Goikoetxea|CB|5|80|29|es
Antonio Maceda|Maceda|CB|4|79|29|es
Ricardo Gallego|Gallego|CB|6|77|27|es
José Antonio Camacho|Camacho|LB|3|82|31|es
Julio Alberto|Julio Alberto|LB|17|75|28|es
Víctor Muñoz|Víctor|DM|8|79|29|es
Juan Antonio Señor|Señor|CM|14|79|28|es
Ramón Calderé|Calderé|CM|16|78|27|es
Francisco López|Francisco|CM|15|73|24|es
Míchel|Míchel|RW|21|83|23|es
Rafael Gordillo|Gordillo|LW|11|81|29|es
Eloy Olaya|Eloy|LW|18|75|22|es
Emilio Butragueño|Butragueño|ST|9|87|22|es
Julio Salinas|Salinas|ST|19|77|23|es
Hipólito Rincón|Rincón|ST|10|73|29|es
Manu Sarabia|Sarabia|ST|20|73|28|es
= espanha 2002 4-2-3-1
Iker Casillas|Casillas|GK|1|85|21|es
José Francisco Molina|Molina|GK|13|73|31|es
Carles Puyol|Puyol|RB|5|83|24|es
Curro Torres|Curro Torres|RB|2|73|25|es
Fernando Hierro|Hierro|CB|6|84|34|es
Iván Helguera|Helguera|CB|4|81|27|es
Miguel Ángel Nadal|Nadal|CB|20|80|35|es
Juanfran|Juanfran|LB|3|76|25|es
Enrique Romero|Romero|LB|12|75|30|es
Rubén Baraja|Baraja|CM|8|83|26|es
Xavi Hernández|Xavi|CM|16|81|22|es
Sergio González|Sergio|CM|14|77|25|es
Juan Carlos Valerón|Valerón|AM|21|84|27|es
Luis Enrique|Luis Enrique|AM|21|83|32|es
Gaizka Mendieta|Mendieta|RW|11|81|28|es
Joaquín Sánchez|Joaquín|RW|17|81|20|es
Francisco de Pedro|De Pedro|LW|18|80|28|es
Raúl González|Raúl|ST|7|89|24|es
Fernando Morientes|Morientes|ST|9|84|26|es
Diego Tristán|Tristán|ST|10|81|26|es
= espanha 2010 4-2-3-1
Iker Casillas|Casillas|GK|1|88|29|es
Víctor Valdés|Valdés|GK|12|83|28|es
Sergio Ramos|Sergio Ramos|RB|15|86|24|es
Álvaro Arbeloa|Arbeloa|RB|17|78|27|es
Gerard Piqué|Piqué|CB|3|86|23|es
Carles Puyol|Puyol|CB|5|86|32|es
Carlos Marchena|Marchena|CB|4|80|30|es
Raúl Albiol|Albiol|CB|2|79|24|es
Joan Capdevila|Capdevila|LB|11|81|32|es
Sergio Busquets|Busquets|DM|16|85|21|es
Javi Martínez|Javi Martínez|DM|20|77|21|es
Xabi Alonso|Xabi Alonso|CM|14|88|28|es
Xavi Hernández|Xavi|CM|8|91|30|es
Andrés Iniesta|Iniesta|AM|6|91|26|es
Cesc Fàbregas|Fàbregas|AM|10|85|23|es
David Silva|Silva|RW|21|85|24|es
Jesús Navas|Navas|RW|22|81|24|es
Pedro Rodríguez|Pedro|LW|18|83|22|es
Juan Mata|Mata|LW|13|81|22|es
David Villa|Villa|ST|7|89|28|es
Fernando Torres|Torres|ST|9|84|26|es
Fernando Llorente|Llorente|ST|19|79|25|es
= inglaterra 1966 4-4-2
Gordon Banks|Banks|GK|1|88|28|en
Peter Bonetti|Bonetti|GK|13|79|24|en
George Cohen|Cohen|RB|2|81|26|en
Jimmy Armfield|Armfield|RB|12|73|30|en
Jack Charlton|J. Charlton|CB|5|81|31|en
Bobby Moore|Moore|CB|6|89|25|en
Ron Flowers|Flowers|CB|17|73|31|en
Norman Hunter|Hunter|CB|18|76|22|en
Ray Wilson|Wilson|LB|3|80|31|en
Gerry Byrne|Byrne|LB|14|67|28|en
Nobby Stiles|Stiles|DM|4|81|24|en
George Eastham|Eastham|CM|19|73|29|en
Bobby Charlton|Bobby Charlton|AM|9|91|28|en
Alan Ball|Ball|RW|7|84|21|en
Martin Peters|Peters|LW|16|83|22|en
Ian Callaghan|Callaghan|RW|20|75|24|en
Terry Paine|Paine|RW|11|73|27|en
John Connelly|Connelly|LW|11|73|27|en
Geoff Hurst|Hurst|ST|10|84|24|en
Roger Hunt|Hunt|ST|21|83|27|en
Jimmy Greaves|Greaves|ST|8|86|26|en
= inglaterra 1990 4-4-2
Peter Shilton|Shilton|GK|1|86|40|en
Chris Woods|Woods|GK|13|77|30|en
Gary Stevens|Stevens|RB|2|80|27|en
Paul Parker|Parker|RB|12|80|26|en
Des Walker|Walker|CB|5|83|24|en
Terry Butcher|Butcher|CB|6|81|31|en
Mark Wright|Wright|CB|14|81|26|en
Stuart Pearce|Pearce|LB|3|83|28|en
Tony Dorigo|Dorigo|LB|15|77|24|en
Bryan Robson|Robson|CM|4|84|33|en
Steve McMahon|McMahon|CM|7|76|28|en
Neil Webb|Webb|CM|16|75|27|en
Paul Gascoigne|Gascoigne|AM|19|88|23|en
David Platt|Platt|AM|17|82|24|en
Chris Waddle|Waddle|RW|8|84|29|en
Trevor Steven|Steven|RW|18|79|26|en
John Barnes|Barnes|LW|11|84|26|en
Gary Lineker|Lineker|ST|10|87|29|en
Peter Beardsley|Beardsley|ST|20|84|29|en
Steve Bull|Bull|ST|21|77|25|en
= inglaterra 2006 4-4-2
Paul Robinson|Robinson|GK|1|81|26|en
David James|James|GK|13|79|35|en
Gary Neville|G. Neville|RB|2|82|31|en
Jamie Carragher|Carragher|RB|15|83|28|en
John Terry|Terry|CB|6|87|25|en
Rio Ferdinand|Ferdinand|CB|5|87|27|en
Sol Campbell|Campbell|CB|20|81|31|en
Ashley Cole|A. Cole|LB|3|85|25|en
Wayne Bridge|Bridge|LB|12|77|25|en
Owen Hargreaves|Hargreaves|DM|16|83|25|en
Michael Carrick|Carrick|DM|18|80|24|en
Steven Gerrard|Gerrard|CM|4|89|26|en
Frank Lampard|Lampard|CM|8|88|28|en
David Beckham|Beckham|RW|7|84|31|en
Aaron Lennon|Lennon|RW|19|78|19|en
Theo Walcott|Walcott|RW|23|68|17|en
Joe Cole|J. Cole|LW|11|84|24|en
Stewart Downing|Downing|LW|14|76|21|en
Wayne Rooney|Rooney|ST|9|87|20|en
Michael Owen|Owen|ST|10|83|26|en
Peter Crouch|Crouch|ST|21|79|25|en
= holanda 1974 4-3-3
Jan Jongbloed|Jongbloed|GK|8|75|33|nl
Eddy Treijtel|Treijtel|GK|18|73|28|nl
Wim Suurbier|Suurbier|RB|20|81|29|nl
Arie Haan|Haan|CB|2|83|25|nl
Wim Rijsbergen|Rijsbergen|CB|17|80|22|nl
Rinus Israël|Israël|CB|5|75|32|nl
Pleun Strik|Strik|CB|19|73|30|nl
Ruud Krol|Krol|LB|12|87|25|nl
Wim Jansen|Jansen|DM|6|81|27|nl
Johan Neeskens|Neeskens|CM|13|87|22|nl
Wim van Hanegem|Van Hanegem|CM|3|85|30|nl
Willy van de Kerkhof|W. v.d. Kerkhof|CM|11|77|22|nl
Theo de Jong|Theo de Jong|CM|10|75|27|nl
Johan Cruyff|Cruyff|AM|14|94|27|nl
Johnny Rep|Rep|RW|16|83|22|nl
René van de Kerkhof|R. v.d. Kerkhof|RW|7|77|22|nl
Rob Rensenbrink|Rensenbrink|LW|15|86|27|nl
Piet Keizer|Keizer|LW|4|79|31|nl
Ruud Geels|Geels|ST|9|77|26|nl
Harry Vos|Vos|CB|1|70|28|nl
= holanda 1988 4-4-2
Hans van Breukelen|Van Breukelen|GK|1|84|31|nl
Joop Hiele|Hiele|GK|16|73|29|nl
Berry van Aerle|Van Aerle|RB|2|78|25|nl
Ronald Koeman|R. Koeman|CB|4|86|25|nl
Frank Rijkaard|Rijkaard|CB|3|88|25|nl
Adri van Tiggelen|Van Tiggelen|CB|6|80|31|nl
Sjaak Troost|Troost|CB|15|73|29|nl
Wim Koevermans|Koevermans|CB|14|70|28|nl
John Bosman|Bosman|ST|17|79|23|nl
Jan Wouters|Wouters|DM|7|81|27|nl
Arnold Mühren|Mühren|CM|8|82|37|nl
Erwin Koeman|E. Koeman|CM|13|79|26|nl
Gerald Vanenburg|Vanenburg|RW|11|80|24|nl
John van 't Schip|Van 't Schip|RW|18|78|24|nl
Ruud Gullit|Gullit|AM|10|91|25|nl
Rob Witschge|Witschge|LW|19|77|21|nl
Marco van Basten|Van Basten|ST|12|91|23|nl
Wim Kieft|Kieft|ST|9|78|25|nl
Hendrie Krüzen|Krüzen|CM|20|73|24|nl
Danny Blind|Blind|RB|5|76|26|nl
= holanda 1998 4-4-2
Edwin van der Sar|Van der Sar|GK|1|85|27|nl
Ed de Goey|De Goey|GK|13|79|31|nl
Michael Reiziger|Reiziger|RB|2|81|25|nl
Aron Winter|Winter|RB|6|80|31|nl
Jaap Stam|Stam|CB|3|86|25|nl
Frank de Boer|F. de Boer|CB|4|85|28|nl
André Ooijer|Ooijer|CB|20|75|23|nl
Arthur Numan|Numan|LB|5|81|28|nl
Winston Bogarde|Bogarde|LB|15|77|27|nl
Wim Jonk|Jonk|DM|14|79|31|nl
Edgar Davids|Davids|CM|16|87|25|nl
Clarence Seedorf|Seedorf|CM|10|85|22|nl
Phillip Cocu|Cocu|CM|11|84|27|nl
Ronald de Boer|R. de Boer|AM|7|84|28|nl
Boudewijn Zenden|Zenden|LW|17|79|21|nl
Marc Overmars|Overmars|LW|21|86|25|nl
Dennis Bergkamp|Bergkamp|ST|8|90|29|nl
Patrick Kluivert|Kluivert|ST|9|85|22|nl
Jimmy Floyd Hasselbaink|Hasselbaink|ST|18|81|26|nl
Pierre van Hooijdonk|Van Hooijdonk|ST|19|80|28|nl
= holanda 2010 4-2-3-1
Maarten Stekelenburg|Stekelenburg|GK|1|83|27|nl
Michel Vorm|Vorm|GK|16|75|26|nl
Gregory van der Wiel|Van der Wiel|RB|2|80|22|nl
Khalid Boulahrouz|Boulahrouz|RB|12|75|28|nl
John Heitinga|Heitinga|CB|3|80|26|nl
Joris Mathijsen|Mathijsen|CB|4|80|30|nl
André Ooijer|Ooijer|CB|13|75|35|nl
Giovanni van Bronckhorst|Van Bronckhorst|LB|5|81|35|nl
Edson Braafheid|Braafheid|LB|15|73|27|nl
Mark van Bommel|Van Bommel|DM|6|83|33|nl
Nigel de Jong|N. de Jong|DM|8|83|25|nl
Demy de Zeeuw|De Zeeuw|CM|14|76|27|nl
Wesley Sneijder|Sneijder|AM|10|90|26|nl
Rafael van der Vaart|Van der Vaart|AM|23|84|27|nl
Ibrahim Afellay|Afellay|AM|20|77|24|nl
Arjen Robben|Robben|RW|11|89|26|nl
Dirk Kuyt|Kuyt|RW|7|83|29|nl
Eljero Elia|Elia|LW|17|78|23|nl
Ryan Babel|Babel|LW|22|75|23|nl
Robin van Persie|Van Persie|ST|9|85|26|nl
Klaas-Jan Huntelaar|Huntelaar|ST|19|83|26|nl
= africa_do_sul 1998 4-4-2
Hans Vonk|Vonk|GK|1|73|28|za
Brian Baloyi|Baloyi|GK|16|65|24|za
Alfred Phiri|Phiri|RB|2|67|23|za
Lucas Radebe|Radebe|CB|4|81|29|za
Mark Fish|Fish|CB|5|80|24|za
Pierre Issa|Issa|CB|3|70|22|za
Willem Jackson|Jackson|CB|18|66|26|za
Sizwe Motaung|Motaung|CB|13|66|28|za
David Nyathi|Nyathi|LB|14|73|29|za
Eric Tinkler|Tinkler|DM|6|73|28|za
John Moshoeu|Moshoeu|CM|8|75|32|za
Doctor Khumalo|Khumalo|AM|10|77|31|za
Brendan Augustine|Augustine|RW|7|70|26|za
Helman Mkhalele|Mkhalele|RW|11|75|28|za
Quinton Fortune|Fortune|LW|15|77|21|za
Delron Buckley|Buckley|LW|19|70|20|za
Benni McCarthy|McCarthy|ST|17|79|20|za
Shaun Bartlett|Bartlett|ST|9|77|25|za
Phil Masinga|Masinga|ST|12|76|29|za
Jerry Sikhosana|Sikhosana|ST|20|67|29|za
= africa_do_sul 2010 4-2-3-1
Itumeleng Khune|Khune|GK|16|75|22|za
Moeneeb Josephs|Josephs|GK|1|67|30|za
Siboniso Gaxa|Gaxa|RB|2|67|26|za
Anele Ngcongca|Ngcongca|RB|22|65|22|za
Aaron Mokoena|Mokoena|CB|4|73|29|za
Bongani Khumalo|Khumalo|CB|20|70|23|za
Matthew Booth|Booth|CB|15|67|33|za
Tsepo Masilela|Masilela|LB|3|70|25|za
Lucas Thwala|Thwala|LB|21|64|29|za
MacBeth Sibaya|Sibaya|DM|13|67|32|za
Kagisho Dikgacoi|Dikgacoi|CM|5|70|25|za
Reneilwe Letsholonyane|Letsholonyane|CM|12|70|27|za
Steven Pienaar|Pienaar|AM|10|80|28|za
Surprise Moriri|Moriri|RW|19|67|30|za
Siphiwe Tshabalala|Tshabalala|LW|8|75|25|za
Teko Modise|Modise|LW|11|73|27|za
Katlego Mphela|Mphela|ST|9|73|25|za
Bernard Parker|Parker|ST|17|70|24|za
Siyabonga Nomvethe|Nomvethe|ST|18|66|32|za
Thembinkosi Fanteni|Fanteni|ST|14|64|25|za
= arabia 2022 4-2-3-1
Mohammed Al-Owais|Al-Owais|GK|21|75|30|sa
Mohammed Al-Rubaie|Al-Rubaie|GK|1|64|25|sa
Saud Abdulhamid|Abdulhamid|RB|12|70|23|sa
Sultan Al-Ghannam|Al-Ghannam|RB|2|70|28|sa
Ali Al-Bulaihi|Al-Bulaihi|CB|5|70|33|sa
Abdulelah Al-Amri|Al-Amri|CB|4|70|25|sa
Hassan Tambakti|Tambakti|CB|17|67|23|sa
Yasser Al-Shahrani|Al-Shahrani|LB|13|73|30|sa
Abdulelah Al-Malki|Al-Malki|DM|8|70|28|sa
Riyadh Sharahili|Sharahili|DM|15|65|29|sa
Mohamed Kanno|Kanno|CM|23|73|28|sa
Salman Al-Faraj|Al-Faraj|CM|7|73|33|sa
Ali Al-Hassan|Al-Hassan|CM|14|67|25|sa
Nasser Al-Dawsari|N. Al-Dawsari|CM|16|65|23|sa
Sami Al-Najei|Al-Najei|AM|18|67|25|sa
Hattan Bahebri|Bahebri|AM|6|70|30|sa
Abdulrahman Al-Aboud|Al-Aboud|RW|20|65|27|sa
Salem Al-Dawsari|Salem|LW|10|79|31|sa
Saleh Al-Shehri|Al-Shehri|ST|11|73|29|sa
Firas Al-Buraikan|Al-Buraikan|ST|9|70|22|sa
Haitham Asiri|Asiri|ST|19|63|21|sa
= argelia 1982 4-4-2
Mehdi Cerbah|Cerbah|GK|1|75|28|dz
Mourad Amara|Amara|GK|21|65|23|dz
Chaabane Merzekane|Merzekane|RB|2|75|23|dz
Mahmoud Guendouz|Guendouz|CB|5|75|29|dz
Nourredine Kourichi|Kourichi|CB|4|75|27|dz
Salah Larbès|Larbès|CB|12|70|30|dz
Faouzi Mansouri|Mansouri|LB|3|73|26|dz
Ali Fergani|Fergani|DM|6|77|29|dz
Mohamed Kaci-Saïd|Kaci-Saïd|CM|14|73|23|dz
Djamel Zidane|Djamel Zidane|AM|13|73|26|dz
Mustapha Dahleb|Dahleb|AM|8|81|29|dz
Lakhdar Belloumi|Belloumi|AM|10|84|23|dz
Hocine Yahi|Yahi|RW|19|67|22|dz
Salah Assad|Assad|LW|11|83|24|dz
Abdelmajid Bourebbou|Bourebbou|LW|17|70|30|dz
Rabah Madjer|Madjer|ST|9|83|23|dz
Tedj Bensaoula|Bensaoula|ST|7|77|27|dz
Djamel Tlemçani|Tlemçani|ST|16|70|26|dz
Abdelkader Horr|Horr|ST|15|68|28|dz
= argelia 2014 4-2-3-1
Raïs M'Bolhi|M'Bolhi|GK|23|78|28|dz
Mohamed Zemmamouche|Zemmamouche|GK|1|67|29|dz
Aïssa Mandi|Mandi|RB|20|73|22|dz
Mehdi Mostefa|Mostefa|RB|3|70|31|dz
Madjid Bougherra|Bougherra|CB|2|75|31|dz
Rafik Halliche|Halliche|CB|5|74|27|dz
Carl Medjani|Medjani|CB|4|70|28|dz
Essaïd Belkalem|Belkalem|CB|12|70|25|dz
Faouzi Ghoulam|Ghoulam|LB|21|77|23|dz
Djamel Mesbah|Mesbah|LB|17|70|29|dz
Medhi Lacen|Lacen|DM|19|74|30|dz
Nabil Bentaleb|Bentaleb|CM|14|75|19|dz
Saphir Taïder|Taïder|CM|22|74|22|dz
Hassan Yebda|Yebda|CM|16|70|30|dz
Yacine Brahimi|Brahimi|AM|11|79|24|dz
Sofiane Feghouli|Feghouli|RW|10|81|24|dz
Abdelmoumene Djabou|Djabou|LW|7|74|27|dz
Islam Slimani|Slimani|ST|13|78|26|dz
El Arbi Hillel Soudani|Soudani|ST|15|75|26|dz
Nabil Ghilas|Ghilas|ST|9|73|24|dz
= australia 2006 4-4-2
Mark Schwarzer|Schwarzer|GK|1|83|33|au
Željko Kalac|Kalac|GK|18|75|33|au
Brett Emerton|Emerton|RB|7|79|27|au
Luke Wilkshire|Wilkshire|RB|17|73|24|au
Lucas Neill|Neill|CB|2|78|28|au
Craig Moore|Moore|CB|3|75|30|au
Tony Popovic|Popovic|CB|6|70|32|au
Tony Vidmar|Vidmar|CB|8|70|36|au
Scott Chipperfield|Chipperfield|LB|11|75|30|au
Stan Lazaridis|Lazaridis|LB|14|70|33|au
Vince Grella|Grella|DM|13|77|26|au
Jason Culina|Culina|CM|5|75|25|au
Josip Skoko|Skoko|CM|19|73|30|au
Mark Bresciano|Bresciano|AM|23|79|26|au
Tim Cahill|Cahill|AM|4|81|26|au
Mile Sterjovski|Sterjovski|RW|16|73|27|au
Harry Kewell|Kewell|LW|10|83|27|au
Ante Milicic|Milicic|AM|21|67|32|au
Mark Viduka|Viduka|ST|9|81|30|au
John Aloisi|Aloisi|ST|15|75|30|au
Josh Kennedy|Kennedy|ST|20|71|23|au
= australia 2022 4-4-2
Mathew Ryan|Ryan|GK|1|77|30|au
Andrew Redmayne|Redmayne|GK|12|67|33|au
Nathaniel Atkinson|Atkinson|RB|2|67|23|au
Fran Karačić|Karačić|RB|5|67|26|au
Harry Souttar|Souttar|CB|19|73|24|au
Kye Rowles|Rowles|CB|4|70|24|au
Miloš Degenek|Degenek|CB|3|67|28|au
Bailey Wright|Wright|CB|20|65|30|au
Aziz Behich|Behich|LB|16|70|31|au
Aaron Mooy|Mooy|CM|13|77|32|au
Jackson Irvine|Irvine|CM|22|75|29|au
Keanu Baccus|Baccus|CM|26|67|24|au
Cameron Devlin|Devlin|CM|21|65|24|au
Riley McGree|McGree|AM|14|73|24|au
Ajdin Hrustić|Hrustić|AM|10|70|26|au
Mathew Leckie|Leckie|RW|7|75|31|au
Garang Kuol|Kuol|RW|24|65|18|au
Craig Goodwin|Goodwin|LW|23|73|30|au
Awer Mabil|Mabil|LW|11|67|27|au
Mitchell Duke|Duke|ST|15|70|31|au
Jamie Maclaren|Maclaren|ST|9|67|29|au
Jason Cummings|Cummings|ST|25|64|27|au
= austria 1978 4-4-2
Friedrich Koncilia|Koncilia|GK|1|84|30|at
Hubert Baumgartner|Baumgartner|GK|21|70|23|at
Robert Sara|Sara|RB|2|79|31|at
Bruno Pezzey|Pezzey|CB|5|83|23|at
Erich Obermayer|Obermayer|CB|3|75|25|at
Heinrich Strasser|Strasser|CB|4|73|29|at
Gerhard Breitenberger|Breitenberger|LB|6|73|23|at
Josef Hickersberger|Hickersberger|CM|8|78|30|at
Roland Hattenberger|Hattenberger|DM|7|73|30|at
Herbert Prohaska|Prohaska|CM|10|86|22|at
Kurt Jara|Jara|AM|11|81|27|at
Eduard Krieger|Krieger|LW|12|75|31|at
Günther Happich|Happich|CM|14|70|26|at
Wilhelm Kreuz|Kreuz|ST|13|75|29|at
Hans Krankl|Krankl|ST|9|87|25|at
Walter Schachner|Schachner|ST|19|79|21|at
Hans Pirkner|Pirkner|ST|18|70|31|at
Franz Oberacher|Oberacher|RW|16|68|24|at
Ernst Baumeister|Baumeister|CM|15|70|21|at
= austria 1998 4-4-2
Michael Konsel|Konsel|GK|1|79|36|at
Franz Wohlfahrt|Wohlfahrt|GK|12|73|33|at
Harald Cerny|Cerny|RB|2|73|24|at
Peter Schöttel|Schöttel|CB|5|73|30|at
Wolfgang Feiersinger|Feiersinger|CB|4|77|32|at
Anton Pfeffer|Pfeffer|CB|3|73|32|at
Walter Kogler|Kogler|CB|6|73|30|at
Markus Schopp|Schopp|LB|14|73|24|at
Roman Mählich|Mählich|DM|8|75|26|at
Dietmar Kühbauer|Kühbauer|CM|7|77|27|at
Andreas Heraf|Heraf|CM|15|73|30|at
Peter Stöger|Stöger|AM|17|77|32|at
Andreas Herzog|Herzog|AM|10|83|29|at
Arnold Wetl|Wetl|LW|11|75|27|at
Herfried Sabitzer|Sabitzer|RW|16|70|29|at
Ivica Vastić|Vastić|AM|9|81|28|at
Toni Polster|Polster|ST|20|81|34|at
Mario Haas|Haas|ST|18|73|23|at
Eduard Glieder|Glieder|ST|19|73|29|at
= belgica 1986 4-4-2
Jean-Marie Pfaff|Pfaff|GK|1|86|32|be
Gilbert Bodart|Bodart|GK|12|75|24|be
Eric Gerets|Gerets|RB|2|84|32|be
Georges Grün|Grün|CB|4|79|24|be
Michel Renquin|Renquin|CB|5|77|31|be
Stéphane Demol|Demol|CB|19|77|20|be
Leo Clijsters|Clijsters|CB|14|75|29|be
Hugo Broos|Broos|CB|3|75|34|be
Patrick Vervoort|Vervoort|LB|17|75|21|be
René Vandereycken|Vandereycken|DM|6|79|33|be
Franky Van der Elst|Van der Elst|CM|16|77|25|be
Raymond Mommens|Mommens|CM|8|75|28|be
Enzo Scifo|Scifo|AM|10|83|20|be
Jan Ceulemans|Ceulemans|AM|11|84|29|be
Frank Vercauteren|Vercauteren|LW|7|80|29|be
Philippe Desmet|Desmet|RW|20|73|28|be
Nico Claesen|Claesen|ST|9|80|23|be
Danny Veyt|Veyt|ST|18|75|29|be
Erwin Vandenbergh|Vandenbergh|ST|15|79|27|be
= belgica 2018 3-5-2
Thibaut Courtois|Courtois|GK|1|88|26|be
Simon Mignolet|Mignolet|GK|12|78|30|be
Toby Alderweireld|Alderweireld|CB|2|85|29|be
Vincent Kompany|Kompany|CB|4|84|32|be
Jan Vertonghen|Vertonghen|CB|5|84|31|be
Thomas Vermaelen|Vermaelen|CB|3|77|32|be
Dedryck Boyata|Boyata|CB|20|75|27|be
Thomas Meunier|Meunier|RB|15|81|26|be
Yannick Carrasco|Carrasco|LB|11|81|24|be
Axel Witsel|Witsel|DM|6|83|29|be
Leander Dendoncker|Dendoncker|DM|23|73|23|be
Kevin De Bruyne|De Bruyne|CM|7|91|27|be
Mousa Dembélé|Dembélé|CM|19|81|30|be
Marouane Fellaini|Fellaini|CM|8|79|30|be
Youri Tielemans|Tielemans|CM|17|78|21|be
Eden Hazard|Hazard|LW|10|90|27|be
Nacer Chadli|Chadli|LW|22|77|28|be
Dries Mertens|Mertens|RW|14|84|31|be
Adnan Januzaj|Januzaj|RW|18|75|23|be
Thorgan Hazard|T. Hazard|RW|16|73|25|be
Romelu Lukaku|Lukaku|ST|9|86|25|be
Michy Batshuayi|Batshuayi|ST|21|77|24|be
= bosnia 2014 4-2-3-1
Asmir Begović|Begović|GK|1|83|27|ba
Jasmin Fejzić|Fejzić|GK|12|63|28|ba
Mensur Mujdža|Mujdža|RB|2|70|30|ba
Avdija Vršajević|Vršajević|RB|6|67|28|ba
Emir Spahić|Spahić|CB|4|77|33|ba
Ermin Bičakčić|Bičakčić|CB|15|75|24|ba
Toni Šunjić|Šunjić|CB|5|70|25|ba
Sead Kolašinac|Kolašinac|LB|5|75|20|ba
Senad Lulić|Lulić|LB|7|79|28|ba
Muhamed Bešić|Bešić|DM|3|75|21|ba
Haris Medunjanin|Medunjanin|CM|18|73|29|ba
Anel Hadžić|Hadžić|CM|14|67|24|ba
Miralem Pjanić|Pjanić|CM|8|85|24|ba
Zvjezdan Misimović|Misimović|AM|10|77|32|ba
Senijad Ibričić|Ibričić|AM|16|70|28|ba
Izet Hajrović|Hajrović|RW|20|73|22|ba
Edin Višća|Višća|RW|19|73|24|ba
Sejad Salihović|Salihović|LW|17|75|29|ba
Tino-Sven Sušić|Sušić|AM|21|67|22|ba
Edin Džeko|Džeko|ST|11|85|28|ba
Vedad Ibišević|Ibišević|ST|9|78|29|ba
= canada 1986 4-4-2
Tino Lettieri|Lettieri|GK|22|75|28|ca
Paul Dolan|Dolan|GK|1|65|20|ca
Bob Lenarduzzi|Lenarduzzi|RB|2|73|31|ca
Randy Samuel|Samuel|CB|5|73|22|ca
Ian Bridge|Bridge|CB|4|68|26|ca
Terry Moore|Moore|CB|6|67|28|ca
Bruce Wilson|Wilson|LB|3|76|35|ca
Randy Ragan|Ragan|LB|13|68|26|ca
Colin Miller|Miller|CB|20|65|21|ca
Paul James|James|DM|8|67|22|ca
Mike Sweeney|Sweeney|CM|7|70|26|ca
David Norman|Norman|CM|16|67|24|ca
Jamie Lowery|Lowery|CM|18|65|25|ca
Pasquale De Luca|De Luca|CM|19|65|24|ca
Carl Valentine|Valentine|RW|11|75|28|ca
Branko Segota|Segota|LW|10|68|25|ca
Dale Mitchell|Mitchell|ST|9|73|28|ca
Igor Vrablic|Vrablic|ST|14|68|21|ca
George Pakos|Pakos|ST|17|65|33|ca
= canada 2022 4-4-2
Milan Borjan|Borjan|GK|18|75|35|ca
Dayne St. Clair|St. Clair|GK|22|67|25|ca
Alistair Johnston|Johnston|RB|2|75|23|ca
Richie Laryea|Laryea|RB|22|70|27|ca
Steven Vitória|Vitória|CB|5|73|35|ca
Kamal Miller|Miller|CB|4|70|25|ca
Derek Cornelius|Cornelius|CB|13|67|25|ca
Alphonso Davies|Davies|LB|19|83|22|ca
Sam Adekugbe|Adekugbe|LB|3|70|27|ca
Atiba Hutchinson|Hutchinson|DM|13|70|39|ca
Samuel Piette|Piette|DM|6|65|28|ca
Stephen Eustáquio|Eustáquio|CM|7|77|26|ca
Jonathan Osorio|Osorio|CM|21|70|30|ca
Ismaël Koné|Koné|CM|8|70|20|ca
Mark-Anthony Kaye|Kaye|CM|14|67|28|ca
Tajon Buchanan|Buchanan|RW|11|77|23|ca
Junior Hoilett|Hoilett|LW|10|73|32|ca
Liam Millar|Millar|LW|23|67|23|ca
Jonathan David|J. David|ST|20|81|22|ca
Cyle Larin|Larin|ST|17|75|27|ca
Lucas Cavallini|Cavallini|ST|9|65|29|ca
Ike Ugbo|Ugbo|ST|12|65|24|ca
= catar 2019 4-3-3
Saad Al-Sheeb|Al-Sheeb|GK|1|70|29|qa
Yousef Hassan|Yousef Hassan|GK|22|63|22|qa
Pedro Miguel|Ró-Ró|RB|2|70|28|qa
Hamid Ismaeil|Hamid Ismaeil|RB|14|65|31|qa
Bassam Al-Rawi|Al-Rawi|CB|15|73|21|qa
Boualem Khoukhi|Khoukhi|CB|16|73|28|qa
Tarek Salman|Tarek Salman|CB|5|67|21|qa
Abdelkarim Hassan|Abdelkarim|LB|3|73|25|qa
Karim Boudiaf|Boudiaf|DM|12|70|28|qa
Assim Madibo|Madibo|DM|23|67|22|qa
Salem Al-Hajri|Al-Hajri|DM|13|63|23|qa
Abdulaziz Hatem|Hatem|CM|6|73|28|qa
Abdullah Al-Ahrak|Al-Ahrak|CM|18|63|21|qa
Hassan Al-Haydos|Al-Haydos|AM|10|73|28|qa
Ali Assadalla|Assadalla|AM|8|65|26|qa
Ahmed Alaaeldin|Alaaeldin|RW|7|67|25|qa
Akram Afif|Afif|LW|11|78|22|qa
Almoez Ali|Almoez Ali|ST|19|78|22|qa
Mohammed Muntari|Muntari|ST|9|65|25|qa
= colombia 1998 4-4-2
Farid Mondragón|Mondragón|GK|1|81|27|co
Miguel Calero|Calero|GK|12|70|27|co
Wilmer Cabrera|Cabrera|RB|2|75|30|co
Iván Córdoba|Iván Córdoba|CB|3|79|21|co
Jorge Bermúdez|Bermúdez|CB|4|79|27|co
Éver Palacios|Éver Palacios|CB|5|73|29|co
Luis Antonio Moreno|L. A. Moreno|LB|15|70|28|co
Mauricio Serna|Serna|DM|6|79|29|co
Harold Lozano|Lozano|DM|14|75|25|co
John Wilmar Pérez|Pérez|CM|18|73|27|co
Freddy Rincón|Rincón|CM|19|83|31|co
Carlos Valderrama|Valderrama|AM|10|84|36|co
Néider Morantes|Morantes|AM|16|70|22|co
Faustino Asprilla|Asprilla|ST|11|84|28|co
Adolfo Valencia|Tren Valencia|ST|7|77|30|co
Víctor Aristizábal|Aristizábal|ST|9|77|26|co
Antony de Ávila|De Ávila|ST|20|75|35|co
Hamilton Ricard|Ricard|ST|21|77|24|co
Léider Preciado|Preciado|ST|17|73|21|co
= colombia 2014 4-2-3-1
David Ospina|Ospina|GK|1|83|25|co
Faryd Mondragón|Mondragón|GK|22|67|43|co
Juan Camilo Zúñiga|Zúñiga|RB|18|79|28|co
Santiago Arias|Arias|RB|4|75|22|co
Cristián Zapata|Zapata|CB|2|78|27|co
Mario Yepes|Yepes|CB|3|77|38|co
Carlos Valdés|Valdés|CB|23|73|28|co
Éder Álvarez Balanta|Balanta|CB|16|73|21|co
Pablo Armero|Armero|LB|7|77|27|co
Carlos Sánchez|Carlos Sánchez|DM|6|78|28|co
Alexander Mejía|Mejía|DM|15|73|26|co
Abel Aguilar|Aguilar|CM|8|77|29|co
Fredy Guarín|Guarín|CM|13|79|28|co
Juan Fernando Quintero|Quintero|AM|20|76|21|co
James Rodríguez|James|AM|10|88|22|co
Juan Guillermo Cuadrado|Cuadrado|RW|11|85|26|co
Víctor Ibarbo|Ibarbo|LW|14|75|24|co
Jackson Martínez|Jackson Martínez|ST|21|81|27|co
Carlos Bacca|Bacca|ST|9|80|27|co
Teófilo Gutiérrez|Teo Gutiérrez|ST|9|77|29|co
Adrián Ramos|Adrián Ramos|ST|19|77|28|co
= congo 1974 4-4-2 | Zaire | Zaire | Zaire
Kazadi Mwamba|Kazadi|GK|1|70|27|cd
Tubilandu Ndimbi|Tubilandu|GK|12|61|26|cd
Mwepu Ilunga|Ilunga|RB|2|65|24|cd
Bwanga Tshimen|Bwanga|CB|4|67|24|cd
Lobilo Boba|Lobilo|CB|5|65|23|cd
Ntumba Kalala|Kalala|CB|14|61|24|cd
Mukombo Mwanza|Mukombo|LB|3|63|28|cd
Kilasu Massamba|Kilasu|DM|8|63|24|cd
Mana Mamuwene|Mana|CM|6|63|26|cd
Kibonge Mafu|Kibonge|CM|10|65|28|cd
Mavuba Mafuila|Mavuba|CM|15|65|25|cd
Kakoko Etepé|Kakoko|AM|7|70|24|cd
Kidumu Mantantu|Kidumu|RW|16|63|27|cd
Tshinabu Wa Munda|Tshinabu|RW|18|61|25|cd
Kembo Uba Kembo|Kembo|LW|11|67|26|cd
Mayanga Maku|Mayanga|ST|9|70|25|cd
Ndaye Mulamba|Ndaye|ST|13|73|25|cd
Kabasu Babo|Kabasu|ST|17|61|24|cd
= coreia 2002 3-5-2
Lee Woon-jae|Lee Woon-jae|GK|1|79|29|kr
Kim Byung-ji|Kim Byung-ji|GK|12|70|32|kr
Hong Myung-bo|Hong Myung-bo|CB|20|81|33|kr
Choi Jin-cheul|Choi Jin-cheul|CB|4|75|31|kr
Kim Tae-young|Kim Tae-young|CB|7|75|32|kr
Lee Min-sung|Lee Min-sung|CB|5|70|29|kr
Song Chong-gug|Song Chong-gug|RB|22|78|23|kr
Lee Young-pyo|Lee Young-pyo|LB|13|79|25|kr
Hyun Young-min|Hyun Young-min|LB|16|67|23|kr
Kim Nam-il|Kim Nam-il|DM|6|77|25|kr
Yoo Sang-chul|Yoo Sang-chul|CM|6|79|31|kr
Lee Eul-yong|Lee Eul-yong|CM|8|73|27|kr
Choi Tae-uk|Choi Tae-uk|AM|17|70|21|kr
Yoon Jong-hwan|Yoon Jong-hwan|CM|15|70|29|kr
Park Ji-sung|Park Ji-sung|RW|21|80|21|kr
Lee Chun-soo|Lee Chun-soo|RW|14|75|20|kr
Seol Ki-hyeon|Seol Ki-hyeon|LW|9|78|23|kr
Ahn Jung-hwan|Ahn Jung-hwan|ST|19|79|26|kr
Hwang Sun-hong|Hwang Sun-hong|ST|18|77|33|kr
Cha Du-ri|Cha Du-ri|ST|11|73|21|kr
Choi Yong-soo|Choi Yong-soo|ST|10|73|28|kr
= coreia 2010 4-4-2
Jung Sung-ryong|Jung Sung-ryong|GK|18|75|25|kr
Lee Woon-jae|Lee Woon-jae|GK|1|70|37|kr
Cha Du-ri|Cha Du-ri|RB|11|75|30|kr
Oh Beom-seok|Oh Beom-seok|RB|2|70|26|kr
Lee Jung-soo|Lee Jung-soo|CB|14|75|30|kr
Cho Yong-hyung|Cho Yong-hyung|CB|4|73|26|kr
Kang Min-soo|Kang Min-soo|CB|22|67|24|kr
Kim Hyung-il|Kim Hyung-il|CB|5|67|26|kr
Lee Young-pyo|Lee Young-pyo|LB|12|77|33|kr
Kim Dong-jin|Kim Dong-jin|LB|3|67|28|kr
Kim Jung-woo|Kim Jung-woo|DM|8|73|28|kr
Kim Nam-il|Kim Nam-il|DM|5|73|33|kr
Ki Sung-yueng|Ki Sung-yueng|CM|16|79|21|kr
Kim Bo-kyung|Kim Bo-kyung|AM|19|67|20|kr
Lee Chung-yong|Lee Chung-yong|RW|17|81|21|kr
Kim Jae-sung|Kim Jae-sung|RW|21|67|27|kr
Park Ji-sung|Park Ji-sung|LW|7|84|29|kr
Yeom Ki-hun|Yeom Ki-hun|LW|13|73|27|kr
Park Chu-young|Park Chu-young|ST|10|78|24|kr
Lee Dong-gook|Lee Dong-gook|ST|20|73|31|kr
Ahn Jung-hwan|Ahn Jung-hwan|ST|9|70|34|kr
Lee Seung-yeoul|Lee Seung-yeoul|ST|15|67|21|kr
= croacia 1998 3-5-2
Dražen Ladić|Ladić|GK|1|81|35|hr
Marjan Mrmić|Mrmić|GK|12|70|32|hr
Slaven Bilić|Bilić|CB|6|81|29|hr
Igor Štimac|Štimac|CB|5|80|30|hr
Dario Šimić|Šimić|CB|4|77|22|hr
Goran Jurić|Jurić|CB|13|73|35|hr
Igor Tudor|Tudor|CB|20|73|20|hr
Mario Stanić|Stanić|RB|8|80|26|hr
Robert Jarni|Jarni|LB|3|82|29|hr
Zvonimir Soldo|Soldo|DM|14|79|30|hr
Krunoslav Jurčić|Jurčić|CM|15|73|28|hr
Aljoša Asanović|Asanović|CM|11|83|32|hr
Zvonimir Boban|Boban|AM|10|85|29|hr
Robert Prosinečki|Prosinečki|AM|7|84|29|hr
Silvio Marić|Marić|RW|16|75|22|hr
Petar Krpan|Krpan|LW|18|73|23|hr
Davor Šuker|Šuker|ST|9|89|30|hr
Goran Vlaović|Vlaović|ST|17|80|26|hr
Ardian Kozniku|Kozniku|ST|19|70|30|hr
= croacia 2018 4-2-3-1
Danijel Subašić|Subašić|GK|23|83|33|hr
Lovre Kalinić|Kalinić|GK|1|75|28|hr
Šime Vrsaljko|Vrsaljko|RB|2|81|26|hr
Tin Jedvaj|Jedvaj|RB|22|73|22|hr
Dejan Lovren|Lovren|CB|6|83|29|hr
Domagoj Vida|Vida|CB|21|81|29|hr
Vedran Ćorluka|Ćorluka|CB|5|77|32|hr
Duje Ćaleta-Car|Ćaleta-Car|CB|15|73|21|hr
Ivan Strinić|Strinić|LB|3|77|30|hr
Josip Pivarić|Pivarić|LB|13|73|29|hr
Marcelo Brozović|Brozović|DM|11|83|25|hr
Milan Badelj|Badelj|DM|19|78|29|hr
Luka Modrić|Modrić|CM|10|91|32|hr
Ivan Rakitić|Rakitić|CM|7|87|30|hr
Mateo Kovačić|Kovačić|CM|8|81|24|hr
Filip Bradarić|Bradarić|CM|14|73|26|hr
Andrej Kramarić|Kramarić|AM|9|81|27|hr
Ante Rebić|Rebić|RW|18|81|24|hr
Ivan Perišić|Perišić|LW|4|85|29|hr
Marko Pjaca|Pjaca|LW|20|75|23|hr
Mario Mandžukić|Mandžukić|ST|17|84|32|hr
= egito 1990 4-4-2
Ahmed Shobair|Shobair|GK|1|77|29|eg
Ayman Taher|Ayman Taher|GK|22|65|24|eg
Ibrahim Hassan|Ibrahim Hassan|RB|2|75|23|eg
Hany Ramzy|Hany Ramzy|CB|6|77|21|eg
Hesham Yakan|Yakan|CB|5|73|28|eg
Ashraf Kasem|Ashraf Kasem|CB|4|73|24|eg
Rabie Yassin|Rabie Yassin|LB|3|73|30|eg
Ahmed Ramzy|Ahmed Ramzy|DM|8|70|25|eg
Ismail Youssef|Ismail Youssef|CM|14|73|25|eg
Magdi Abdelghani|Abdelghani|AM|10|77|31|eg
Gamal Abdel Hamid|Abdel Hamid|AM|11|73|32|eg
Taher Abouzeid|Abouzeid|LW|17|75|28|eg
Alaa Maihoub|Maihoub|RW|15|65|28|eg
Ayman Shawky|Shawky|CM|16|65|28|eg
Hossam Hassan|Hossam Hassan|ST|9|79|24|eg
Ahmed El-Kass|El-Kass|ST|7|70|24|eg
Osama Orabi|Orabi|CB|12|65|28|eg
Mohamed Ramadan|Ramadan|RB|13|63|20|eg
= egito 2018 4-2-3-1
Essam El-Hadary|El-Hadary|GK|1|73|45|eg
Mohamed El-Shenawy|El-Shenawy|GK|23|73|29|eg
Ahmed Elmohamady|Elmohamady|RB|7|75|30|eg
Ahmed Fathy|Ahmed Fathy|RB|14|70|33|eg
Omar Gaber|Omar Gaber|RB|3|70|26|eg
Ahmed Hegazi|Hegazi|CB|6|77|27|eg
Ali Gabr|Gabr|CB|2|73|29|eg
Saad Samir|Saad Samir|CB|20|65|29|eg
Mohamed Abdel-Shafy|Abdel-Shafy|LB|13|70|32|eg
Ayman Ashraf|Ayman Ashraf|LB|12|65|27|eg
Tarek Hamed|Tarek Hamed|DM|8|75|29|eg
Sam Morsy|Morsy|DM|5|73|26|eg
Mohamed Elneny|Elneny|CM|17|78|25|eg
Abdallah Said|Abdallah Said|AM|19|75|32|eg
Shikabala|Shikabala|AM|15|70|32|eg
Mohamed Salah|Salah|RW|10|89|26|eg
Amr Warda|Warda|RW|22|70|24|eg
Trézéguet|Trézéguet|LW|21|77|23|eg
Ramadan Sobhi|Ramadan Sobhi|LW|11|75|21|eg
Mahmoud Kahraba|Kahraba|LW|16|73|24|eg
Marwan Mohsen|Marwan Mohsen|ST|9|70|29|eg
Ahmed Hassan Koka|Kouka|ST|18|73|25|eg
= equador 2006 4-4-2
Cristian Mora|Mora|GK|12|73|26|ec
Edwin Villafuerte|Villafuerte|GK|1|65|27|ec
Ulises de la Cruz|De la Cruz|RB|4|77|32|ec
Iván Hurtado|Hurtado|CB|3|78|31|ec
Giovanny Espinoza|Espinoza|CB|2|75|29|ec
Jorge Guagua|Guagua|CB|17|70|24|ec
Neicer Reasco|Reasco|LB|18|73|28|ec
Paul Ambrosi|Ambrosi|LB|13|65|25|ec
Edwin Tenorio|E. Tenorio|DM|20|75|30|ec
Segundo Castillo|Castillo|CM|14|75|24|ec
Patricio Urrutia|Urrutia|CM|7|70|28|ec
Franklin Salas|Salas|AM|19|70|24|ec
Luis Antonio Valencia|Antonio Valencia|RW|16|77|20|ec
Christian Lara|Lara|RW|21|70|26|ec
Edison Méndez|Méndez|LW|8|79|27|ec
Marlon Ayoví|Ayoví|LW|15|70|34|ec
Agustín Delgado|Tin Delgado|ST|11|78|32|ec
Carlos Tenorio|C. Tenorio|ST|9|77|27|ec
Félix Borja|Borja|ST|23|73|23|ec
Iván Kaviedes|Kaviedes|ST|10|73|28|ec
= equador 2014 4-4-2
Alexander Domínguez|Domínguez|GK|22|75|27|ec
Máximo Banguera|Banguera|GK|1|67|28|ec
Juan Carlos Paredes|Paredes|RB|4|75|26|ec
Frickson Erazo|Erazo|CB|3|73|26|ec
Jorge Guagua|Guagua|CB|2|70|32|ec
Gabriel Achilier|Achilier|CB|21|70|29|ec
Walter Ayoví|W. Ayoví|LB|10|75|34|ec
Óscar Bagüí|Bagüí|LB|15|65|32|ec
Carlos Gruezo|Gruezo|DM|23|70|19|ec
Oswaldo Minda|Minda|DM|20|67|31|ec
Christian Noboa|Noboa|CM|6|77|29|ec
Segundo Castillo|Castillo|CM|7|73|32|ec
Michael Arroyo|Arroyo|AM|11|73|26|ec
Antonio Valencia|Antonio Valencia|RW|16|83|28|ec
Renato Ibarra|Ibarra|RW|18|70|23|ec
Joao Rojas|Rojas|RW|19|70|24|ec
Jefferson Montero|Montero|LW|7|80|24|ec
Fidel Martínez|Fidel Martínez|LW|17|70|24|ec
Enner Valencia|Enner Valencia|ST|13|80|24|ec
Felipe Caicedo|Caicedo|ST|11|77|25|ec
Jaime Ayoví|J. Ayoví|ST|9|70|26|ec
= escocia 1974 4-4-2
David Harvey|Harvey|GK|1|77|26|sc
Thomson Allan|Allan|GK|12|67|27|sc
Sandy Jardine|Jardine|RB|2|81|25|sc
Danny McGrain|McGrain|RB|3|83|24|sc
Jim Holton|Holton|CB|5|77|23|sc
Martin Buchan|Buchan|CB|13|79|25|sc
John Blackley|Blackley|CB|6|73|26|sc
Gordon McQueen|McQueen|CB|14|75|21|sc
Willie Donachie|Donachie|LB|15|75|22|sc
Erich Schaedler|Schaedler|LB|16|67|24|sc
Billy Bremner|Bremner|CM|4|85|31|sc
David Hay|Hay|CM|8|79|26|sc
Kenny Dalglish|Dalglish|AM|7|84|23|sc
Peter Lorimer|Lorimer|RW|11|83|27|sc
Jimmy Johnstone|Johnstone|RW|17|79|29|sc
Willie Morgan|Morgan|RW|18|77|29|sc
Tommy Hutchison|Hutchison|LW|19|75|26|sc
Joe Jordan|Jordan|ST|9|81|22|sc
Denis Law|Law|ST|10|79|34|sc
Donald Ford|Ford|ST|20|70|29|sc
= escocia 1998 3-5-2
Jim Leighton|Leighton|GK|1|77|39|sc
Neil Sullivan|Sullivan|GK|12|73|28|sc
Colin Hendry|Hendry|CB|5|81|32|sc
Colin Calderwood|Calderwood|CB|4|75|33|sc
Tom Boyd|Boyd|CB|3|75|32|sc
Matt Elliott|Elliott|CB|15|73|29|sc
Christian Dailly|Dailly|CB|6|75|24|sc
David Weir|Weir|CB|16|73|28|sc
Jackie McNamara|McNamara|RB|22|73|24|sc
Tosh McKinlay|T. McKinlay|LB|21|67|33|sc
Craig Burley|Burley|CM|8|79|26|sc
Paul Lambert|Lambert|CM|14|81|28|sc
John Collins|Collins|CM|11|81|30|sc
Scot Gemmill|Gemmill|CM|18|73|27|sc
Billy McKinlay|B. McKinlay|CM|19|70|29|sc
Allan Johnston|Johnston|LW|20|70|24|sc
Kevin Gallacher|Gallacher|ST|9|77|31|sc
Gordon Durie|Durie|ST|10|75|32|sc
Darren Jackson|Jackson|ST|7|73|31|sc
Simon Donnelly|Donnelly|ST|17|70|23|sc
= eua 1994 4-4-2
Tony Meola|Meola|GK|1|77|25|us
Brad Friedel|Friedel|GK|18|70|23|us
Paul Caligiuri|Caligiuri|RB|2|71|30|us
Marcelo Balboa|Balboa|CB|17|77|26|us
Alexi Lalas|Lalas|CB|22|77|24|us
Cle Kooiman|Kooiman|CB|21|65|31|us
Fernando Clavijo|Clavijo|LB|3|70|37|us
Mike Lapper|Lapper|LB|4|65|24|us
Thomas Dooley|Dooley|DM|20|77|33|us
Mike Sorber|Sorber|CM|10|70|23|us
John Harkes|Harkes|CM|6|77|27|us
Claudio Reyna|Reyna|CM|14|70|20|us
Tab Ramos|Tab Ramos|AM|9|79|27|us
Hugo Pérez|Hugo Pérez|AM|13|73|30|us
Cobi Jones|Cobi Jones|RW|13|74|24|us
Earnie Stewart|Stewart|RW|8|74|25|us
Frank Klopas|Klopas|LW|16|67|28|us
Eric Wynalda|Wynalda|ST|11|79|25|us
Roy Wegerle|Wegerle|ST|19|74|30|us
Joe-Max Moore|Joe-Max Moore|ST|7|70|23|us
= eua 2002 4-4-2
Brad Friedel|Friedel|GK|1|83|31|us
Kasey Keller|Keller|GK|18|77|32|us
Tony Sanneh|Sanneh|RB|22|75|30|us
Frankie Hejduk|Hejduk|RB|2|73|27|us
Eddie Pope|Pope|CB|23|77|28|us
Gregg Berhalter|Berhalter|CB|12|73|28|us
Jeff Agoos|Agoos|CB|3|73|34|us
Carlos Llamosa|Llamosa|CB|5|67|33|us
Pablo Mastroeni|Mastroeni|DM|4|73|25|us
John O'Brien|O'Brien|CM|5|77|24|us
Claudio Reyna|Reyna|CM|10|80|28|us
Landon Donovan|Donovan|AM|21|80|20|us
Earnie Stewart|Stewart|RW|8|73|33|us
Cobi Jones|Cobi Jones|RW|13|70|32|us
DaMarcus Beasley|Beasley|LW|7|75|20|us
Eddie Lewis|Lewis|LW|11|73|28|us
Brian McBride|McBride|ST|20|77|30|us
Clint Mathis|Mathis|ST|9|75|25|us
Josh Wolff|Wolff|ST|16|70|25|us
Joe-Max Moore|Joe-Max Moore|ST|17|70|31|us
= gana 2006 4-4-2
Richard Kingson|Kingson|GK|22|75|28|gh
Sammy Adjei|Adjei|GK|1|65|25|gh
John Paintsil|Paintsil|RB|15|75|25|gh
John Mensah|Mensah|CB|5|77|23|gh
Samuel Kuffour|Kuffour|CB|4|78|29|gh
Shilla Illiasu|Illiasu|CB|7|70|23|gh
Hans Sarpei|Sarpei|LB|2|70|30|gh
Emmanuel Pappoe|Pappoe|LB|6|67|25|gh
Derek Boateng|D. Boateng|DM|19|73|23|gh
Eric Addo|Addo|DM|17|70|27|gh
Michael Essien|Essien|CM|8|87|23|gh
Stephen Appiah|Appiah|CM|10|81|25|gh
Sulley Muntari|Muntari|CM|11|79|21|gh
Otto Addo|Otto Addo|AM|9|73|31|gh
Haminu Draman|Draman|RW|12|75|20|gh
Laryea Kingston|L. Kingston|LW|20|75|26|gh
Asamoah Gyan|Gyan|ST|3|77|20|gh
Matthew Amoah|Amoah|ST|14|75|25|gh
Alex Tachie-Mensah|Tachie-Mensah|ST|18|67|28|gh
= gana 2010 4-2-3-1
Richard Kingson|Kingson|GK|22|77|32|gh
Daniel Agyei|Agyei|GK|1|63|21|gh
John Paintsil|Paintsil|RB|4|75|29|gh
Samuel Inkoom|Inkoom|RB|2|70|21|gh
John Mensah|Mensah|CB|5|78|27|gh
Isaac Vorsah|Vorsah|CB|15|73|22|gh
Jonathan Mensah|J. Mensah|CB|19|73|20|gh
Lee Addy|Addy|CB|7|65|24|gh
Hans Sarpei|Sarpei|LB|3|70|34|gh
Anthony Annan|Annan|DM|6|76|23|gh
Kwadwo Asamoah|Asamoah|CM|13|78|21|gh
Sulley Muntari|Muntari|CM|11|78|25|gh
Stephen Appiah|Appiah|CM|10|73|29|gh
Kevin-Prince Boateng|K.-P. Boateng|AM|23|80|23|gh
Quincy Owusu-Abeyie|Owusu-Abeyie|RW|17|70|24|gh
André Ayew|André Ayew|LW|13|78|20|gh
Asamoah Gyan|Gyan|ST|3|82|24|gh
Prince Tagoe|Tagoe|ST|9|70|23|gh
Matthew Amoah|Amoah|ST|14|70|29|gh
Dominic Adiyiah|Adiyiah|ST|20|67|20|gh
= haiti 1974 4-3-3
Henri Françillon|Françillon|GK|1|70|28|ht
Wilner Piquant|Piquant|GK|12|59|23|ht
Fritz André|André|RB|2|61|28|ht
Arsène Auguste|Auguste|CB|5|65|23|ht
Wilner Nazaire|Nazaire|CB|4|63|24|ht
Serge Racine|Racine|CB|13|61|23|ht
Pierre Bayonne|Bayonne|LB|3|61|24|ht
Ernst Jean-Joseph|Jean-Joseph|DM|6|61|25|ht
Jean-Claude Désir|Désir|CM|8|63|28|ht
Philippe Vorbe|Vorbe|CM|10|67|27|ht
Guy François|François|CM|14|61|26|ht
Eddy Antoine|Antoine|RW|7|63|25|ht
Guy Saint-Vil|G. Saint-Vil|LW|11|65|27|ht
Emmanuel Sanon|Sanon|ST|9|73|22|ht
Roger Saint-Vil|R. Saint-Vil|ST|15|63|25|ht
Fritz Leandré|Leandré|ST|16|61|26|ht
Claude Barthélemy|Barthélemy|CB|17|59|28|ht
Jean-Herbert Austin|Austin|CM|18|59|24|ht
= ira 1998 3-5-2
Ahmad Reza Abedzadeh|Abedzadeh|GK|1|75|32|ir
Nima Nakisa|Nakisa|GK|12|65|23|ir
Mehdi Pashazadeh|Pashazadeh|CB|5|70|25|ir
Mohammad Khakpour|Khakpour|CB|4|70|28|ir
Naeem Saadavi|Saadavi|CB|3|67|29|ir
Javad Zarincheh|Zarincheh|RB|2|67|31|ir
Afshin Peyrovani|Peyrovani|LB|13|67|27|ir
Hamid Estili|Estili|DM|6|73|30|ir
Reza Shahroudi|Shahroudi|CM|14|67|26|ir
Karim Bagheri|Bagheri|CM|8|77|24|ir
Alireza Mansourian|Mansourian|AM|11|70|27|ir
Mehdi Mahdavikia|Mahdavikia|RW|2|80|21|ir
Sattar Hamedani|Hamedani|LW|17|65|24|ir
Khodadad Azizi|Azizi|ST|10|78|27|ir
Ali Daei|Daei|ST|9|80|29|ir
Ali Latifi|Latifi|ST|19|65|22|ir
Nader Mohammadkhani|Mohammadkhani|CB|15|66|35|ir
Mohammad Peyravani|M. Peyravani|CB|16|65|31|ir
= ira 2018 4-2-3-1
Alireza Beiranvand|Beiranvand|GK|1|77|25|ir
Rashid Mazaheri|Mazaheri|GK|12|63|29|ir
Ramin Rezaeian|Rezaeian|RB|23|73|28|ir
Pejman Montazeri|Montazeri|CB|4|70|34|ir
Morteza Pouraliganji|Pouraliganji|CB|8|73|26|ir
Majid Hosseini|Hosseini|CB|19|70|22|ir
Roozbeh Cheshmi|Cheshmi|CB|5|70|24|ir
Ehsan Hajsafi|Hajsafi|LB|3|73|28|ir
Milad Mohammadi|Mohammadi|LB|5|70|24|ir
Saeid Ezatolahi|Ezatolahi|DM|6|73|21|ir
Omid Ebrahimi|Ebrahimi|DM|9|73|30|ir
Masoud Shojaei|Shojaei|CM|7|70|34|ir
Mehdi Torabi|Torabi|CM|17|65|23|ir
Ashkan Dejagah|Dejagah|AM|21|70|31|ir
Saman Ghoddos|Ghoddos|AM|14|73|24|ir
Alireza Jahanbakhsh|Jahanbakhsh|RW|18|77|24|ir
Vahid Amiri|Amiri|LW|11|70|30|ir
Sardar Azmoun|Azmoun|ST|20|79|23|ir
Karim Ansarifard|Ansarifard|ST|10|70|28|ir
Mehdi Taremi|Taremi|ST|16|75|25|ir
Reza Ghoochannejhad|Gucci|ST|16|67|30|ir
= iraque 1986 4-4-2
Raad Hammoudi|Hammoudi|GK|1|70|33|iq
Fatah Nsaief|Nsaief|GK|21|63|35|iq
Khalil Allawi|Allawi|RB|2|67|28|iq
Nadhim Shaker|Nadhim Shaker|CB|4|70|28|iq
Adnan Dirjal|Dirjal|CB|5|70|26|iq
Samir Shaker|Samir Shaker|CB|6|67|28|iq
Ghanim Oraibi|Oraibi|LB|3|65|25|iq
Natiq Hashim|Natiq Hashim|DM|8|70|26|iq
Basil Gorgis|Gorgis|CM|10|73|25|iq
Haris Mohammed|Haris Mohammed|CM|14|73|28|iq
Ali Hussein Shihab|Shihab|AM|11|70|24|iq
Basim Qasim|Basim Qasim|RW|7|67|27|iq
Rahim Hameed|Rahim Hameed|LW|15|65|23|iq
Ahmed Radhi|Ahmed Radhi|ST|9|79|22|iq
Hussein Saeed|Hussein Saeed|ST|10|77|28|iq
Karim Saddam|Karim Saddam|ST|17|73|26|iq
Shaker Mahmoud|Shaker Mahmoud|CM|16|63|27|iq
Anad Abid|Anad Abid|DM|18|64|31|iq
= iraque 2007 4-4-2
Noor Sabri|Noor Sabri|GK|12|75|23|iq
Mohammed Gassid|Gassid|GK|1|63|20|iq
Jassim Mohammed Ghulam|Jassim Ghulam|RB|2|65|27|iq
Ali Hussein Rehema|Rehema|CB|14|70|22|iq
Haidar Abdul-Amir|Abdul-Amir|CB|3|67|25|iq
Haitham Kadhim|Haitham Kadhim|CB|15|65|26|iq
Bassim Abbas|Bassim Abbas|LB|4|70|25|iq
Salih Sadir|Salih Sadir|DM|8|70|26|iq
Nashat Akram|Nashat Akram|CM|5|77|23|iq
Qusay Munir|Qusay Munir|CM|13|73|26|iq
Karrar Jassim|Karrar Jassim|AM|17|70|20|iq
Mahdi Karim|Mahdi Karim|RW|11|73|23|iq
Hawar Mulla Mohammed|Hawar|LW|7|75|25|iq
Younis Mahmoud|Younis Mahmoud|ST|10|80|24|iq
Emad Mohammed|Emad Mohammed|ST|9|73|25|iq
Ahmad Mnajed|Mnajed|ST|18|65|25|iq
Hussein Alaa|Hussein Alaa|CM|16|64|23|iq
Nabeel Sabah|Nabeel Sabah|RB|19|63|25|iq
= japao 2002 3-5-2
Seigo Narazaki|Narazaki|GK|12|77|26|jp
Yoshikatsu Kawaguchi|Kawaguchi|GK|1|73|26|jp
Tsuneyasu Miyamoto|Miyamoto|CB|16|75|25|jp
Ryuzo Morioka|Morioka|CB|4|73|26|jp
Naoki Matsuda|Matsuda|CB|3|73|25|jp
Kōji Nakata|Kōji Nakata|CB|2|73|22|jp
Daisuke Ichikawa|Ichikawa|RB|22|67|22|jp
Alessandro Santos|Alex|LB|14|73|24|jp
Toshihiro Hattori|Hattori|LB|17|67|29|jp
Kazuyuki Toda|Toda|DM|21|75|24|jp
Junichi Inamoto|Inamoto|CM|5|78|22|jp
Shinji Ono|Ono|CM|18|80|22|jp
Mitsuo Ogasawara|Ogasawara|AM|8|73|23|jp
Hidetoshi Nakata|Nakata|AM|7|84|25|jp
Hiroaki Morishima|Morishima|AM|8|73|30|jp
Takayuki Suzuki|Suzuki|ST|11|73|25|jp
Atsushi Yanagisawa|Yanagisawa|ST|13|73|25|jp
Akinori Nishizawa|Nishizawa|ST|19|70|25|jp
Masashi Nakayama|Nakayama|ST|10|70|34|jp
= japao 2018 4-2-3-1
Eiji Kawashima|Kawashima|GK|1|75|35|jp
Masaaki Higashiguchi|Higashiguchi|GK|12|70|32|jp
Hiroki Sakai|H. Sakai|RB|19|78|28|jp
Gotoku Sakai|G. Sakai|RB|21|73|27|jp
Maya Yoshida|Yoshida|CB|22|79|29|jp
Gen Shoji|Shoji|CB|3|75|25|jp
Tomoaki Makino|Makino|CB|20|70|31|jp
Yuto Nagatomo|Nagatomo|LB|5|78|31|jp
Makoto Hasebe|Hasebe|DM|17|79|34|jp
Hotaru Yamaguchi|Yamaguchi|DM|16|73|27|jp
Gaku Shibasaki|Shibasaki|CM|7|77|26|jp
Ryota Oshima|Oshima|CM|6|67|25|jp
Shinji Kagawa|Kagawa|AM|10|82|29|jp
Keisuke Honda|Honda|AM|4|78|32|jp
Genki Haraguchi|Haraguchi|RW|8|77|27|jp
Takashi Inui|Inui|LW|14|78|30|jp
Takashi Usami|Usami|LW|11|73|26|jp
Yuya Osako|Osako|ST|15|76|28|jp
Shinji Okazaki|Okazaki|ST|9|76|32|jp
Yoshinori Muto|Muto|ST|13|73|26|jp
= jordania 2023 4-2-3-1
Yazeed Abulaila|Abulaila|GK|1|70|30|jo
Abdallah Al-Fakhouri|Al-Fakhouri|GK|22|61|23|jo
Ehsan Haddad|Haddad|RB|23|65|29|jo
Yazan Al-Arab|Al-Arab|CB|5|67|27|jo
Abdallah Nasib|Nasib|CB|3|65|29|jo
Salem Al-Ajalin|Al-Ajalin|CB|4|65|35|jo
Anas Bani Yaseen|Bani Yaseen|CB|19|64|35|jo
Mohammad Abu Hashish|Abu Hashish|LB|2|63|28|jo
Nizar Al-Rashdan|Al-Rashdan|DM|21|67|24|jo
Rajaei Ayed|Ayed|CM|14|65|30|jo
Noor Al-Rawabdeh|Al-Rawabdeh|CM|8|65|26|jo
Ibrahim Saadeh|Saadeh|CM|15|63|23|jo
Mahmoud Al-Mardi|Al-Mardi|RW|13|67|30|jo
Mousa Al-Taamari|Al-Taamari|RW|10|78|26|jo
Mohammad Abu Zraiq|Abu Zraiq|LW|7|65|26|jo
Yazan Al-Naimat|Al-Naimat|ST|11|75|24|jo
Ali Olwan|Olwan|ST|9|70|23|jo
Hamza Al-Dardour|Al-Dardour|ST|17|63|32|jo
= marfim 2006 4-4-2
Jean-Jacques Tizié|Tizié|GK|1|75|33|ci
Boubacar Barry|Copa Barry|GK|23|73|26|ci
Emmanuel Eboué|Eboué|RB|21|79|23|ci
Guy Demel|Demel|RB|17|70|24|ci
Kolo Touré|Kolo Touré|CB|4|83|25|ci
Abdoulaye Méïté|Méïté|CB|12|75|25|ci
Cyrille Domoraud|Domoraud|CB|3|73|35|ci
Blaise Kouassi|Kouassi|CB|5|70|30|ci
Marc Zoro|Zoro|CB|6|70|22|ci
Arthur Boka|Boka|LB|3|77|23|ci
Didier Zokora|Zokora|DM|5|81|25|ci
Yaya Touré|Yaya Touré|CM|19|79|23|ci
Romaric|Romaric|CM|20|75|23|ci
Gilles Yapi Yapo|Yapi Yapo|CM|13|73|24|ci
Emerse Faé|Faé|CM|18|73|22|ci
Kanga Akalé|Akalé|RW|16|73|25|ci
Bonaventure Kalou|B. Kalou|LW|8|78|28|ci
Didier Drogba|Drogba|ST|11|87|28|ci
Aruna Dindane|Dindane|ST|15|78|25|ci
Arouna Koné|Arouna Koné|ST|9|77|22|ci
Bakary Koné|Bakary Koné|ST|14|73|24|ci
= marfim 2014 4-2-3-1
Boubacar Barry|Copa Barry|GK|1|75|34|ci
Sylvain Gbohouo|Gbohouo|GK|16|65|25|ci
Serge Aurier|Aurier|RB|17|80|21|ci
Jean-Daniel Akpa-Akpro|Akpa-Akpro|RB|21|67|22|ci
Kolo Touré|Kolo Touré|CB|4|77|33|ci
Sol Bamba|Bamba|CB|22|73|29|ci
Didier Zokora|Zokora|CB|5|75|33|ci
Arthur Boka|Boka|LB|3|75|31|ci
Constant Djakpa|Djakpa|LB|6|70|27|ci
Cheick Tioté|Tioté|DM|9|80|27|ci
Serey Dié|Serey Dié|DM|20|75|29|ci
Ismaël Diomandé|Diomandé|CM|13|70|21|ci
Yaya Touré|Yaya Touré|CM|19|88|31|ci
Salomon Kalou|Kalou|RW|8|80|28|ci
Mathis Bolly|Bolly|RW|23|67|23|ci
Gervinho|Gervinho|LW|10|83|27|ci
Max Gradel|Gradel|LW|15|77|26|ci
Wilfried Bony|Bony|ST|12|83|25|ci
Didier Drogba|Drogba|ST|11|81|36|ci
Giovanni Sio|Sio|ST|18|70|25|ci
= marrocos 1986 4-4-2
Badou Zaki|Zaki|GK|1|84|27|ma
Salaheddine Hmied|Hmied|GK|12|65|25|ma
Labid Khalifa|Khalifa|RB|2|73|30|ma
Noureddine Bouyahyaoui|Bouyahyaoui|CB|5|75|30|ma
Mustapha El Biyaz|El Biyaz|CB|4|73|26|ma
Lahcen Ouadani|Ouadani|CB|3|70|27|ma
Abdelmajid Lamriss|Lamriss|LB|6|73|27|ma
Abderrazak Khairi|Khairi|CM|8|77|24|ma
Mustapha El Haddaoui|El Haddaoui|AM|7|77|25|ma
Mohamed Timoumi|Timoumi|AM|10|83|26|ma
Aziz Bouderbala|Bouderbala|RW|11|81|26|ma
Abdelkrim Merry Krimau|Krimau|ST|9|79|30|ma
Abdelaziz Souleimani|Souleimani|ST|17|70|28|ma
Abdellah Bidane|Bidane|LW|14|70|28|ma
Driss Mouhoub|Mouhoub|DM|15|70|28|ma
Mohamed Hazzaz|Hazzaz|CM|16|70|33|ma
Abdelfettah Rhiati|Rhiati|ST|18|67|22|ma
Fadel Jilal|Jilal|CB|13|67|22|ma
= marrocos 2022 4-3-3
Yassine Bounou|Bono|GK|1|84|31|ma
Munir El Kajoui|El Kajoui|GK|12|70|33|ma
Achraf Hakimi|Hakimi|RB|2|86|24|ma
Romain Saïss|Saïss|CB|6|80|32|ma
Nayef Aguerd|Aguerd|CB|5|81|26|ma
Jawad El Yamiq|El Yamiq|CB|18|73|30|ma
Achraf Dari|Dari|CB|20|73|23|ma
Noussair Mazraoui|Mazraoui|LB|3|81|25|ma
Yahia Attiat-Allah|Attiat-Allah|LB|25|73|27|ma
Sofyan Amrabat|Amrabat|DM|4|84|26|ma
Azzedine Ounahi|Ounahi|CM|8|80|22|ma
Selim Amallah|Amallah|CM|15|77|26|ma
Abdelhamid Sabiri|Sabiri|AM|11|75|26|ma
Bilal El Khannouss|El Khannouss|AM|26|67|18|ma
Hakim Ziyech|Ziyech|RW|7|84|29|ma
Zakaria Aboukhlal|Aboukhlal|RW|14|75|22|ma
Sofiane Boufal|Boufal|LW|17|81|29|ma
Abde Ezzalzouli|Abde|LW|16|73|21|ma
Youssef En-Nesyri|En-Nesyri|ST|19|80|25|ma
Abderrazak Hamdallah|Hamdallah|ST|9|76|32|ma
Walid Cheddira|Cheddira|ST|10|70|24|ma
= mexico 1986 4-4-2
Pablo Larios|Larios|GK|1|77|26|mx
Olaf Heredia|Heredia|GK|12|65|29|mx
Mario Trejo|Trejo|RB|2|73|30|mx
Fernando Quirarte|Quirarte|CB|3|77|29|mx
Félix Cruz|Félix Cruz|CB|5|73|25|mx
Rafael Amador|Amador|CB|4|70|26|mx
Raúl Servín|Servín|LB|17|73|23|mx
Carlos Muñoz|Muñoz|DM|6|70|26|mx
Miguel España|España|DM|14|73|22|mx
Javier Aguirre|Aguirre|CM|7|77|27|mx
Cristóbal Ortega|Ortega|CM|8|73|30|mx
Carlos de los Cobos|De los Cobos|CM|15|70|27|mx
Tomás Boy|Boy|AM|10|79|33|mx
Manuel Negrete|Negrete|AM|22|81|26|mx
Luis Flores|Luis Flores|ST|11|75|25|mx
Hugo Sánchez|Hugo Sánchez|ST|9|88|28|mx
Carlos Hermosillo|Hermosillo|ST|20|73|21|mx
Francisco Javier Cruz|F. J. Cruz|ST|19|70|20|mx
= mexico 2018 4-3-3
Guillermo Ochoa|Ochoa|GK|13|83|32|mx
José de Jesús Corona|Corona|GK|1|73|37|mx
Miguel Layún|Layún|RB|21|75|30|mx
Edson Álvarez|Edson Álvarez|RB|4|75|20|mx
Héctor Moreno|Moreno|CB|15|79|30|mx
Carlos Salcedo|Salcedo|CB|3|75|24|mx
Hugo Ayala|Ayala|CB|2|73|31|mx
Jesús Gallardo|Gallardo|LB|23|73|23|mx
Rafael Márquez|Márquez|DM|4|75|39|mx
Héctor Herrera|Herrera|CM|16|81|28|mx
Andrés Guardado|Guardado|CM|18|80|31|mx
Jonathan dos Santos|J. dos Santos|CM|6|75|28|mx
Erick Gutiérrez|Gutiérrez|CM|17|73|23|mx
Marco Fabián|Fabián|AM|10|73|28|mx
Giovani dos Santos|Gio dos Santos|AM|10|75|29|mx
Carlos Vela|Vela|RW|11|82|29|mx
Jesús Corona|Tecatito|RW|17|80|25|mx
Hirving Lozano|Chucky Lozano|LW|22|83|22|mx
Javier Aquino|Aquino|LW|20|70|28|mx
Javier Hernández|Chicharito|ST|14|80|30|mx
Raúl Jiménez|Raúl Jiménez|ST|9|78|27|mx
Oribe Peralta|Peralta|ST|19|73|34|mx
= noruega 1998 4-5-1
Frode Grodås|Grodås|GK|1|77|33|no
Thomas Myhre|Myhre|GK|12|73|24|no
Gunnar Halle|Halle|RB|2|73|32|no
Vegard Heggem|Heggem|RB|14|75|23|no
Henning Berg|Berg|CB|5|81|28|no
Ronny Johnsen|Johnsen|CB|4|81|29|no
Dan Eggen|Eggen|CB|3|75|28|no
Stig Inge Bjørnebye|Bjørnebye|LB|6|77|28|no
Vidar Riseth|Riseth|LB|15|73|25|no
Ståle Solbakken|Solbakken|DM|7|75|30|no
Erik Mykland|Mykland|CM|8|77|26|no
Kjetil Rekdal|Rekdal|CM|10|79|29|no
Øyvind Leonhardsen|Leonhardsen|CM|11|79|27|no
Roar Strand|Strand|CM|16|73|28|no
Jahn Ivar Jakobsen|Mini Jakobsen|RW|17|73|32|no
Håvard Flo|H. Flo|LW|19|75|27|no
Tore André Flo|Tore André Flo|ST|9|83|25|no
Ole Gunnar Solskjær|Solskjær|ST|20|81|25|no
Egil Østenstad|Østenstad|ST|18|75|26|no
Jostein Flo|J. Flo|ST|21|75|33|no
= nova_zelandia 1982 4-4-2
Richard Wilson|Wilson|GK|1|67|26|nz
Frank van Hattum|Van Hattum|GK|12|61|23|nz
John Hill|Hill|RB|2|61|25|nz
Bobby Almond|Almond|CB|5|63|30|nz
Glenn Dods|Dods|CB|4|61|23|nz
Sam Malcolmson|Malcolmson|CB|13|59|33|nz
Adrian Elrick|Elrick|CB|14|59|32|nz
Ricki Herbert|Herbert|LB|3|65|21|nz
Allan Boath|Boath|DM|6|63|24|nz
Duncan Cole|Cole|CM|8|63|23|nz
Kenny Cresswell|Cresswell|CM|15|59|23|nz
Steve Sumner|Sumner|CM|10|70|26|nz
Brian Turner|B. Turner|AM|11|65|32|nz
Peter Simonsen|Simonsen|RW|7|61|23|nz
Keith Mackay|Mackay|LW|16|59|25|nz
Steve Wooddin|Wooddin|ST|9|70|26|nz
Wynton Rufer|Rufer|ST|17|65|19|nz
Grant Turner|G. Turner|ST|18|61|23|nz
= nova_zelandia 2010 3-5-2
Mark Paston|Paston|GK|1|70|33|nz
Glen Moss|Moss|GK|12|63|27|nz
Ryan Nelsen|Nelsen|CB|6|77|32|nz
Winston Reid|Reid|CB|2|75|22|nz
Tommy Smith|T. Smith|CB|4|67|20|nz
Ben Sigmund|Sigmund|CB|5|65|29|nz
Ivan Vicelich|Vicelich|CB|8|65|33|nz
Tony Lochhead|Lochhead|LB|3|65|28|nz
Leo Bertos|Bertos|RB|11|65|28|nz
Tim Brown|Brown|DM|7|65|29|nz
Simon Elliott|Elliott|CM|14|65|36|nz
Andrew Barron|Barron|CM|15|61|30|nz
Jeremy Christie|Christie|CM|18|61|26|nz
Michael McGlinchey|McGlinchey|AM|16|63|23|nz
Shane Smeltz|Smeltz|ST|9|70|28|nz
Chris Killen|Killen|ST|14|67|28|nz
Rory Fallon|Fallon|ST|10|65|28|nz
Chris Wood|Wood|ST|20|63|18|nz
Jeremy Brockie|Brockie|ST|13|61|22|nz
= panama 2018 4-4-2
Jaime Penedo|Penedo|GK|1|70|36|pa
José Calderón|Calderón|GK|12|61|32|pa
Michael Murillo|Murillo|RB|23|67|22|pa
Adolfo Machado|Machado|RB|2|59|33|pa
Román Torres|Román Torres|CB|5|73|32|pa
Felipe Baloy|Baloy|CB|4|65|37|pa
Fidel Escobar|Escobar|CB|25|65|23|pa
Harold Cummings|Cummings|CB|3|61|26|pa
Eric Davis|Davis|LB|15|65|27|pa
Luis Ovalle|Ovalle|LB|13|59|29|pa
Aníbal Godoy|Godoy|DM|20|67|28|pa
Gabriel Gómez|Gabriel Gómez|CM|6|65|34|pa
Armando Cooper|Cooper|CM|8|65|30|pa
Ricardo Ávila|Ávila|CM|14|61|21|pa
Édgar Bárcenas|Bárcenas|RW|10|67|24|pa
Alberto Quintero|Quintero|RW|19|63|30|pa
José Luis Rodríguez|J. L. Rodríguez|LW|11|61|19|pa
Blas Pérez|Blas Pérez|ST|9|65|37|pa
Gabriel Torres|Gabriel Torres|ST|18|65|29|pa
Luis Tejada|Tejada|ST|7|63|36|pa
Ismael Díaz|Ismael Díaz|ST|17|61|21|pa
= paraguai 1998 4-4-2
José Luis Chilavert|Chilavert|GK|1|84|32|py
Ricardo Tavarelli|Tavarelli|GK|12|67|27|py
Francisco Arce|Arce|RB|2|79|26|py
Denis Caniza|Caniza|RB|15|73|23|py
Carlos Gamarra|Gamarra|CB|4|84|27|py
Celso Ayala|Ayala|CB|5|81|27|py
Pedro Sarabia|Sarabia|CB|3|70|23|py
Arístides Rojas|A. Rojas|LB|6|70|29|py
Carlos Paredes|Paredes|DM|13|75|21|py
Roberto Acuña|Acuña|CM|8|78|26|py
Julio César Enciso|Enciso|CM|16|77|24|py
Jorge Luis Campos|Campos|AM|10|73|27|py
Miguel Ángel Benítez|Benítez|ST|19|75|27|py
José Cardozo|Cardozo|ST|9|78|27|py
Hugo Brizuela|Brizuela|ST|11|70|29|py
Derlis Soto|Soto|RW|18|67|24|py
Aureliano Torres|A. Torres|LB|21|67|26|py
Ricardo Rojas|R. Rojas|CM|14|70|26|py
= paraguai 2010 4-4-2
Justo Villar|Villar|GK|1|81|33|py
Aldo Bobadilla|Bobadilla|GK|12|67|34|py
Carlos Bonet|Bonet|RB|6|73|33|py
Darío Verón|Verón|CB|2|75|31|py
Paulo da Silva|Da Silva|CB|14|78|30|py
Antolín Alcaraz|Alcaraz|CB|21|77|27|py
Julio César Cáceres|J. C. Cáceres|CB|4|70|30|py
Claudio Morel|Morel|LB|3|75|32|py
Aureliano Torres|A. Torres|LB|5|70|38|py
Víctor Cáceres|V. Cáceres|DM|13|75|25|py
Enrique Vera|Vera|CM|15|75|30|py
Cristian Riveros|Riveros|CM|16|76|27|py
Néstor Ortigoza|Ortigoza|CM|20|73|25|py
Édgar Barreto|Barreto|CM|8|73|26|py
Jonathan Santana|Santana|AM|11|73|28|py
Édgar Benítez|É. Benítez|RW|17|73|22|py
Lucas Barrios|Barrios|ST|10|80|25|py
Óscar Cardozo|Tacuara Cardozo|ST|7|80|27|py
Nelson Haedo Valdez|Haedo Valdez|ST|18|78|26|py
Roque Santa Cruz|Santa Cruz|ST|9|77|28|py
= portugal 1966 4-3-3
José Pereira|José Pereira|GK|3|75|34|pt
Joaquim Carvalho|Carvalho|GK|1|67|29|pt
João Morais|Morais|RB|2|73|30|pt
Alexandre Baptista|Baptista|CB|5|75|25|pt
José Carlos|José Carlos|CB|4|73|25|pt
Vicente Lucas|Vicente|CB|20|73|30|pt
Hilário|Hilário|LB|6|75|26|pt
Alberto Festa|Festa|LB|17|70|27|pt
Germano de Figueiredo|Germano|CB|21|73|33|pt
Jaime Graça|Graça|CM|16|78|24|pt
Mário Coluna|Coluna|CM|10|84|31|pt
Fernando Peres|Peres|CM|8|73|23|pt
Custódio Pinto|Custódio Pinto|CM|14|70|24|pt
José Augusto|José Augusto|RW|12|83|28|pt
António Simões|Simões|LW|11|83|22|pt
Eusébio|Eusébio|ST|13|90|24|pt
José Torres|Torres|ST|18|81|27|pt
Ernesto Figueiredo|Figueiredo|ST|15|70|29|pt
= portugal 2006 4-2-3-1
Ricardo|Ricardo|GK|1|83|30|pt
Quim|Quim|GK|12|75|30|pt
Miguel|Miguel|RB|13|81|26|pt
Paulo Ferreira|Paulo Ferreira|RB|2|80|27|pt
Ricardo Carvalho|Ricardo Carvalho|CB|16|86|28|pt
Fernando Meira|Meira|CB|5|80|28|pt
Ricardo Costa|Ricardo Costa|CB|4|75|25|pt
Nuno Valente|Nuno Valente|LB|14|78|31|pt
Marco Caneira|Caneira|LB|15|73|27|pt
Costinha|Costinha|DM|6|79|31|pt
Petit|Petit|DM|8|78|29|pt
Maniche|Maniche|CM|18|83|28|pt
Tiago|Tiago|CM|19|80|25|pt
Hugo Viana|Hugo Viana|CM|21|73|23|pt
Deco|Deco|AM|20|87|28|pt
Luís Figo|Figo|RW|7|85|33|pt
Cristiano Ronaldo|C. Ronaldo|LW|17|86|21|pt
Simão Sabrosa|Simão|LW|11|83|26|pt
Luís Boa Morte|Boa Morte|LW|10|75|28|pt
Pauleta|Pauleta|ST|9|81|33|pt
Nuno Gomes|Nuno Gomes|ST|21|78|29|pt
Hélder Postiga|Postiga|ST|23|75|23|pt
= senegal 2002 4-4-2
Tony Sylva|Sylva|GK|1|75|27|sn
Omar Diallo|Diallo|GK|16|63|29|sn
Ferdinand Coly|Coly|RB|2|75|29|sn
Habib Beye|Beye|RB|17|73|24|sn
Lamine Diatta|Diatta|CB|13|77|26|sn
Pape Malick Diop|P. M. Diop|CB|4|75|27|sn
Omar Daf|Daf|LB|3|73|25|sn
Aliou Cissé|Cissé|CB|6|75|26|sn
Sylvain N'Diaye|S. N'Diaye|DM|21|70|26|sn
Salif Diao|Diao|CM|15|76|25|sn
Papa Bouba Diop|Bouba Diop|CM|19|79|24|sn
Pape Sarr|Sarr|CM|18|73|25|sn
Khalilou Fadiga|Fadiga|LW|10|80|27|sn
Moussa N'Diaye|M. N'Diaye|RW|7|73|23|sn
El Hadji Diouf|El Hadji Diouf|ST|11|82|21|sn
Henri Camara|Henri Camara|ST|9|76|25|sn
Amara Traoré|Traoré|ST|14|70|36|sn
Souleymane Camara|S. Camara|ST|20|70|19|sn
Pape Thiaw|Thiaw|ST|22|70|21|sn
= senegal 2018 4-4-2
Khadim N'Diaye|K. N'Diaye|GK|16|73|33|sn
Alfred Gomis|Gomis|GK|1|70|24|sn
Moussa Wagué|Wagué|RB|22|70|19|sn
Lamine Gassama|Gassama|RB|2|70|28|sn
Kalidou Koulibaly|Koulibaly|CB|3|86|27|sn
Salif Sané|Sané|CB|6|78|27|sn
Kara Mbodji|Mbodji|CB|21|73|28|sn
Youssouf Sabaly|Sabaly|LB|12|75|25|sn
Saliou Ciss|Ciss|LB|20|70|28|sn
Idrissa Gana Gueye|Gana Gueye|DM|5|83|28|sn
Alfred N'Diaye|A. N'Diaye|DM|17|73|28|sn
Cheikhou Kouyaté|Kouyaté|CM|8|77|28|sn
Badou Ndiaye|B. Ndiaye|CM|13|75|27|sn
Cheikh N'Doye|N'Doye|CM|14|73|32|sn
Ismaïla Sarr|I. Sarr|RW|18|77|20|sn
Keita Baldé|Keita Baldé|LW|11|77|23|sn
Sadio Mané|Mané|LW|10|87|26|sn
M'Baye Niang|Niang|ST|19|75|23|sn
Mame Biram Diouf|M. B. Diouf|ST|15|73|30|sn
Moussa Konaté|Konaté|ST|9|70|25|sn
Diafra Sakho|Sakho|ST|10|70|28|sn
= suecia 1994 4-4-2
Thomas Ravelli|Ravelli|GK|1|81|34|se
Lars Eriksson|L. Eriksson|GK|12|70|28|se
Roland Nilsson|R. Nilsson|RB|2|80|30|se
Pontus Kåmark|Kåmark|RB|13|70|25|se
Patrik Andersson|P. Andersson|CB|3|81|23|se
Joachim Björklund|Björklund|CB|4|77|23|se
Jan Eriksson|J. Eriksson|CB|14|73|27|se
Roger Ljung|Ljung|LB|5|75|28|se
Mikael Nilsson|M. Nilsson|LB|15|70|25|se
Stefan Schwarz|Schwarz|CM|6|81|25|se
Jonas Thern|Thern|CM|9|80|27|se
Klas Ingesson|Ingesson|CM|8|79|26|se
Håkan Mild|Mild|CM|16|73|23|se
Magnus Erlingmark|Erlingmark|CM|17|70|26|se
Tomas Brolin|Brolin|AM|11|84|24|se
Henrik Larsson|H. Larsson|RW|7|78|22|se
Anders Limpar|Limpar|LW|10|80|28|se
Jesper Blomqvist|Blomqvist|LW|18|75|20|se
Martin Dahlin|Dahlin|ST|9|83|26|se
Kennet Andersson|K. Andersson|ST|19|81|26|se
= suecia 2018 4-4-2
Robin Olsen|Olsen|GK|1|79|28|se
Karl-Johan Johnsson|Johnsson|GK|12|67|28|se
Mikael Lustig|Lustig|RB|2|76|31|se
Emil Krafth|Krafth|RB|16|70|23|se
Andreas Granqvist|Granqvist|CB|4|80|33|se
Victor Lindelöf|Lindelöf|CB|3|81|23|se
Pontus Jansson|Jansson|CB|18|75|27|se
Filip Helander|Helander|CB|14|70|25|se
Ludwig Augustinsson|Augustinsson|LB|6|77|24|se
Martin Olsson|Olsson|LB|5|70|30|se
Gustav Svensson|G. Svensson|DM|13|70|31|se
Albin Ekdal|Ekdal|CM|8|76|28|se
Sebastian Larsson|S. Larsson|CM|7|76|33|se
Oscar Hiljemark|Hiljemark|CM|15|70|25|se
Viktor Claesson|Claesson|RW|17|75|26|se
Jimmy Durmaz|Durmaz|RW|21|70|29|se
Emil Forsberg|Forsberg|LW|10|82|26|se
Marcus Berg|Berg|ST|9|75|31|se
Ola Toivonen|Toivonen|ST|20|75|31|se
John Guidetti|Guidetti|ST|11|73|26|se
Isaac Kiese Thelin|Kiese Thelin|ST|22|67|26|se
= suica 1994 4-4-2
Marco Pascolo|Pascolo|GK|1|75|28|ch
Stephan Lehmann|Lehmann|GK|12|67|31|ch
Marc Hottiger|Hottiger|RB|2|77|27|ch
Alain Geiger|Geiger|CB|5|77|34|ch
Dominique Herr|Herr|CB|4|73|29|ch
Yvan Quentin|Quentin|LB|3|70|24|ch
Ciriaco Sforza|Sforza|CM|8|81|24|ch
Georges Bregy|Bregy|CM|10|77|36|ch
Christophe Ohrel|Ohrel|CM|6|73|26|ch
Sébastien Fournier|Fournier|CM|15|70|23|ch
Thomas Bickel|Bickel|AM|14|73|30|ch
Alain Sutter|Sutter|LW|11|79|26|ch
Marco Grassi|Grassi|ST|17|75|26|ch
Adrian Knup|Knup|ST|9|77|25|ch
Stéphane Chapuisat|Chapuisat|ST|7|83|24|ch
Nestor Subiat|Subiat|ST|18|70|28|ch
Régis Rothenbühler|Rothenbühler|CB|13|67|24|ch
Patrick Sylvestre|Sylvestre|CM|16|67|26|ch
= suica 2014 4-2-3-1
Diego Benaglio|Benaglio|GK|1|81|30|ch
Yann Sommer|Sommer|GK|21|77|25|ch
Stephan Lichtsteiner|Lichtsteiner|RB|2|83|30|ch
Michael Lang|Lang|RB|6|73|23|ch
Johan Djourou|Djourou|CB|20|77|27|ch
Fabian Schär|Schär|CB|22|77|22|ch
Steve von Bergen|Von Bergen|CB|5|75|31|ch
Philippe Senderos|Senderos|CB|4|73|29|ch
Ricardo Rodríguez|R. Rodríguez|LB|13|81|21|ch
Reto Ziegler|Ziegler|LB|3|70|28|ch
Valon Behrami|Behrami|DM|11|79|29|ch
Gelson Fernandes|Gelson|DM|16|73|27|ch
Gökhan Inler|Inler|CM|8|81|29|ch
Blerim Džemaili|Džemaili|CM|15|77|28|ch
Granit Xhaka|Xhaka|CM|10|79|21|ch
Xherdan Shaqiri|Shaqiri|RW|23|83|22|ch
Tranquillo Barnetta|Barnetta|RW|17|73|29|ch
Valentin Stocker|Stocker|LW|14|75|25|ch
Admir Mehmedi|Mehmedi|LW|18|77|23|ch
Josip Drmić|Drmić|ST|19|75|21|ch
Haris Seferović|Seferović|ST|9|75|22|ch
Mario Gavranović|Gavranović|ST|12|73|24|ch
= tcheca 1990 4-4-2 | Tchecoslováquia | Czechoslovakia | Checoslovaquia
Jan Stejskal|Stejskal|GK|1|77|27|cz
Luděk Mikloško|Mikloško|GK|21|75|28|cz
Július Bielik|Bielik|RB|2|70|27|cz
Miroslav Kadlec|Kadlec|CB|4|79|25|cz
Ján Kocian|Kocian|CB|5|77|31|cz
Jozef Chovanec|Chovanec|DM|8|79|30|cz
František Straka|Straka|LB|3|75|31|cz
Vladimír Kinier|Kinier|LB|6|67|32|cz
Michal Bílek|Bílek|CM|9|79|25|cz
Ivan Hašek|Hašek|CM|17|81|26|cz
Václav Němeček|Němeček|CM|11|75|23|cz
Vladimír Weiss|Weiss|CM|16|73|25|cz
Luboš Kubík|Kubík|AM|14|81|25|cz
Ľubomír Moravčík|Moravčík|LW|7|81|25|cz
Ivo Knoflíček|Knoflíček|LW|10|77|28|cz
Tomáš Skuhravý|Skuhravý|ST|12|84|24|cz
Milan Luhový|Luhový|ST|15|73|26|cz
Stanislav Griga|Griga|ST|18|73|29|cz
Peter Fieber|Fieber|CB|13|67|25|cz
= tcheca 2006 4-4-1-1
Petr Čech|Čech|GK|1|89|24|cz
Jaromír Blažek|Blažek|GK|16|73|33|cz
Zdeněk Grygera|Grygera|RB|2|79|26|cz
Tomáš Ujfaluši|Ujfaluši|CB|21|81|28|cz
David Rozehnal|Rozehnal|CB|22|78|25|cz
Radoslav Kováč|R. Kováč|CB|6|73|26|cz
Marek Jankulovski|Jankulovski|LB|6|82|29|cz
Tomáš Galásek|Galásek|DM|5|79|33|cz
Jan Polák|Polák|CM|20|75|25|cz
Jaroslav Plašil|Plašil|CM|8|77|24|cz
David Jarolím|Jarolím|CM|14|75|27|cz
Pavel Nedvěd|Nedvěd|CM|11|87|33|cz
Tomáš Rosický|Rosický|AM|10|85|25|cz
Karel Poborský|Poborský|RW|8|79|34|cz
Libor Sionko|Sionko|RW|19|73|29|cz
Jiří Štajner|Štajner|LW|17|70|30|cz
Jan Koller|Koller|ST|9|81|33|cz
Milan Baroš|Baroš|ST|15|83|24|cz
Vratislav Lokvenc|Lokvenc|ST|12|73|33|cz
Marek Heinz|Heinz|ST|18|73|28|cz
= tunisia 2006 4-4-2
Ali Boumnijel|Boumnijel|GK|1|73|40|tn
Hamdi Kasraoui|Kasraoui|GK|16|65|23|tn
Hatem Trabelsi|Trabelsi|RB|6|77|29|tn
Radhi Jaïdi|Jaïdi|CB|15|77|30|tn
Karim Haggui|Haggui|CB|19|75|22|tn
Alaeddine Yahia|Yahia|CB|4|70|24|tn
José Clayton|Clayton|LB|3|70|32|tn
Anis Ayari|Ayari|LB|2|67|23|tn
Riadh Bouazizi|Bouazizi|DM|18|73|33|tn
Mehdi Nafti|Nafti|DM|12|70|27|tn
Adel Chedli|Chedli|CM|8|70|29|tn
Kaies Ghodhbane|Ghodhbane|CM|13|73|30|tn
Jawhar Mnari|Mnari|CM|7|73|29|tn
Sélim Benachour|Benachour|AM|20|70|24|tn
Chaouki Ben Saada|Ben Saada|AM|10|70|22|tn
Ziad Jaziri|Jaziri|ST|9|75|27|tn
Francileudo Santos|Santos|ST|5|75|27|tn
Haykel Guemamdia|Guemamdia|ST|17|67|24|tn
Issam Jomaa|Jomaa|ST|11|70|22|tn
= tunisia 2018 4-2-3-1
Mouez Hassen|Hassen|GK|1|70|23|tn
Farouk Ben Mustapha|Ben Mustapha|GK|16|65|29|tn
Dylan Bronn|Bronn|RB|2|73|22|tn
Hamdi Nagguez|Nagguez|RB|20|67|25|tn
Yassine Meriah|Meriah|CB|4|73|25|tn
Syam Ben Youssef|S. Ben Youssef|CB|5|70|29|tn
Yohan Benalouane|Benalouane|CB|6|73|31|tn
Ali Maâloul|Maâloul|LB|12|75|28|tn
Oussama Haddadi|Haddadi|LB|3|67|26|tn
Ellyes Skhiri|Skhiri|DM|17|75|23|tn
Mohamed Amine Ben Amor|Ben Amor|DM|14|70|26|tn
Ferjani Sassi|Sassi|CM|13|75|26|tn
Ghaylane Chaalali|Chaalali|CM|18|70|24|tn
Wahbi Khazri|Khazri|AM|10|79|27|tn
Saîf-Eddine Khaoui|Khaoui|AM|15|70|23|tn
Naïm Sliti|Sliti|RW|23|77|25|tn
Anice Badri|Badri|RW|7|73|27|tn
Bassem Srarfi|Srarfi|RW|19|67|20|tn
Fakhreddine Ben Youssef|F. Ben Youssef|LW|8|73|27|tn
Saber Khalifa|Khalifa|ST|9|67|31|tn
Ahmed Khalil|Ahmed Khalil|ST|11|65|23|tn
= turquia 2002 4-4-2
Rüştü Reçber|Rüştü|GK|1|86|29|tr
Ömer Çatkıç|Ömer|GK|12|70|28|tr
Fatih Akyel|Fatih Akyel|RB|2|75|24|tr
Alpay Özalan|Alpay|CB|4|81|29|tr
Bülent Korkmaz|Bülent|CB|5|81|34|tr
Emre Aşık|Emre Aşık|CB|15|73|28|tr
Ergün Penbe|Ergün|LB|3|77|30|tr
Hakan Ünsal|Hakan Ünsal|LB|13|75|29|tr
Tugay Kerimoğlu|Tugay|DM|8|83|31|tr
Tayfur Havutçu|Tayfur|CM|14|73|32|tr
Emre Belözoğlu|Emre|CM|21|81|21|tr
Okan Buruk|Okan|CM|7|75|28|tr
Muzzy Izzet|Izzet|CM|18|73|27|tr
Yıldıray Baştürk|Baştürk|AM|10|81|23|tr
Ümit Davala|Ümit Davala|RW|22|79|29|tr
Hasan Şaş|Hasan Şaş|LW|11|83|26|tr
Hakan Şükür|Hakan Şükür|ST|9|83|30|tr
İlhan Mansız|İlhan|ST|17|80|27|tr
Nihat Kahveci|Nihat|ST|16|77|22|tr
Arif Erdem|Arif|ST|19|75|30|tr
= turquia 2008 4-4-2
Rüştü Reçber|Rüştü|GK|1|81|35|tr
Volkan Demirel|Volkan|GK|23|77|26|tr
Hamit Altıntop|Hamit|RB|8|81|25|tr
Sabri Sarıoğlu|Sabri|RB|2|75|24|tr
Gökhan Zan|Gökhan Zan|CB|15|75|26|tr
Servet Çetin|Servet|CB|4|75|27|tr
Emre Aşık|Emre Aşık|CB|13|73|34|tr
Hakan Balta|Hakan Balta|LB|3|73|25|tr
Mehmet Aurélio|Aurélio|DM|17|77|30|tr
Mehmet Topal|Topal|DM|5|73|22|tr
Emre Belözoğlu|Emre|CM|21|81|27|tr
Ayhan Akman|Ayhan|CM|10|70|31|tr
Kazım Kazım|Kazım|RW|19|75|21|tr
Gökdeniz Karadeniz|Gökdeniz|RW|11|75|28|tr
Arda Turan|Arda Turan|LW|14|81|21|tr
Uğur Boral|Uğur Boral|LW|7|73|26|tr
Tuncay Şanlı|Tuncay|ST|17|80|26|tr
Nihat Kahveci|Nihat|ST|9|81|28|tr
Semih Şentürk|Semih|ST|22|77|25|tr
Mevlüt Erdinç|Mevlüt|ST|16|75|21|tr
= cabo_verde 2023 4-3-3
Vozinha|Vozinha|GK|1|73|37|cv
Márcio Rosa|Márcio Rosa|GK|12|61|26|cv
Steven Moreira|Moreira|RB|22|70|29|cv
Roberto Lopes|Pico Lopes|CB|4|70|31|cv
Logan Costa|Logan Costa|CB|5|73|23|cv
Diney Borges|Diney|CB|3|65|28|cv
Stopira|Stopira|LB|2|67|35|cv
Kevin Pina|Kevin Pina|DM|6|70|27|cv
Jamiro Monteiro|Jamiro|CM|10|70|30|cv
Deroy Duarte|Deroy Duarte|CM|14|65|25|cv
João Paulo|João Paulo|CM|8|65|26|cv
Patrick Andrade|Patrick Andrade|CM|16|65|30|cv
Ryan Mendes|Ryan Mendes|RW|20|75|34|cv
Bebé|Bebé|RW|7|70|33|cv
Willy Semedo|Willy Semedo|RW|17|67|29|cv
Garry Rodrigues|Garry Rodrigues|LW|11|70|33|cv
Jovane Cabral|Jovane|LW|19|70|25|cv
Bryan Teixeira|Bryan Teixeira|LW|18|65|23|cv
Gilson Tavares|Gilson Tavares|ST|9|65|22|cv
Gilson Benchimol|Benchimol|ST|21|65|23|cv
// FIM
`,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
  else (root.DEZ_BRUTO = root.DEZ_BRUTO || []).push(D);
})(typeof window !== 'undefined' ? window : this);
