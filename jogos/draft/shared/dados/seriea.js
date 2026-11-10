// Football Draft: Serie A (2025/26 e históricos)
// Formato: ver shared/dez-dados.js. Notas na escala única (docs/PROMPT_DADOS_REAIS.md, seção 3).
(function (root) {
  'use strict';
  const D = {
    id: 'seriea', origem: 'it',
    times: `
atalanta|Atalanta|||ATA|#1E71B8|#111111|png
bologna|Bologna|||BOL|#1A2F48|#A21C26|png
cagliari|Cagliari|||CAG|#A6192E|#002350|png
como|Como|||COM|#1B4D9B|#FFFFFF|png
cremonese|Cremonese|||CRE|#A6192E|#A0A0A0|png
fiorentina|Fiorentina|||FIO|#5B2C83|#FFFFFF|png
genoa|Genoa|||GEN|#A6192E|#002350|png
inter|Inter de Milão|Inter|Inter de Milán|INT|#0057A8|#111111|png
juventus|Juventus|||JUV|#FFFFFF|#111111|png
lazio|Lazio|||LAZ|#87D8F7|#FFFFFF|png
lecce|Lecce|||LEC|#FFD100|#C8102E|png
milan|Milan|||MIL|#FB090B|#111111|png
napoli|Napoli|||NAP|#12A0D7|#FFFFFF|png
parma|Parma|||PAR|#FFFFFF|#111111|png
pisa|Pisa|||PIS|#1C3F94|#111111|png
roma|Roma|||ROM|#8E1F2F|#F0BC42|png
sassuolo|Sassuolo|||SAS|#00A752|#111111|png
torino|Torino|||TOR|#8A1E03|#FFFFFF|png
udinese|Udinese|||UDI|#FFFFFF|#111111|png
verona|Hellas Verona|||VER|#1C3F94|#FFD100|png`,
    elencos: `
// ======================================================== 2025/26
= napoli 2025 4-3-3
Alex Meret|Meret|GK|1|81|28|it
Vanja Milinković-Savić|V. Milinković|GK|32|77|28|rs
Giovanni Di Lorenzo|Di Lorenzo|RB|22|81|32|it
Pasquale Mazzocchi|Mazzocchi|RB|30|70|30|it
Amir Rrahmani|Rrahmani|CB|13|81|31|xk
Alessandro Buongiorno|Buongiorno|CB|4|82|26|it
Sam Beukema|Beukema|CB|31|79|27|nl
Juan Jesus|Juan Jesus|CB|5|73|34|br
Mathías Olivera|Olivera|LB|17|77|28|uy
Leonardo Spinazzola|Spinazzola|LB|37|75|32|it
Miguel Gutiérrez|Miguel Gutiérrez|LB|3|77|24|es
Stanislav Lobotka|Lobotka|DM|68|83|30|sk
André-Frank Zambo Anguissa|Anguissa|CM|99|82|29|cm
Scott McTominay|McTominay|CM|8|85|28|sc
Billy Gilmour|Gilmour|CM|6|76|24|sc
Kevin De Bruyne|De Bruyne|AM|11|84|34|be
Eljif Elmas|Elmas|AM|7|75|26|mk
Matteo Politano|Politano|RW|21|78|32|it
David Neres|Neres|RW|7|78|28|br
Noa Lang|Lang|LW|70|77|26|nl
Rasmus Højlund|Højlund|ST|19|80|22|dk
Romelu Lukaku|Lukaku|ST|9|78|32|be
Lorenzo Lucca|Lucca|ST|27|75|25|it
= inter 2025 3-5-2
Yann Sommer|Sommer|GK|1|83|36|ch
Josep Martínez|Josep Martínez|GK|13|77|27|es
Denzel Dumfries|Dumfries|RB|2|82|29|nl
Matteo Darmian|Darmian|RB|36|73|35|it
Alessandro Bastoni|Bastoni|CB|95|85|26|it
Manuel Akanji|Akanji|CB|25|84|30|ch
Stefan de Vrij|De Vrij|CB|6|78|33|nl
Yann Bisseck|Bisseck|CB|31|78|24|de
Francesco Acerbi|Acerbi|CB|15|77|37|it
Federico Dimarco|Dimarco|LB|32|83|27|it
Carlos Augusto|Carlos Augusto|LB|30|77|26|br
Hakan Çalhanoğlu|Çalhanoğlu|DM|20|85|31|tr
Nicolò Barella|Barella|CM|23|85|28|it
Henrikh Mkhitaryan|Mkhitaryan|CM|22|80|36|am
Piotr Zieliński|Zieliński|CM|7|79|31|pl
Davide Frattesi|Frattesi|CM|16|78|26|it
Petar Sučić|P. Sučić|CM|8|77|22|hr
Luis Henrique|Luis Henrique|RW|11|77|23|br
Lautaro Martínez|Lautaro|ST|10|87|28|ar
Marcus Thuram|Thuram|ST|9|84|28|fr
Ange-Yoan Bonny|Bonny|ST|14|79|21|ci
Francesco Pio Esposito|Pio Esposito|ST|94|77|20|it
= milan 2025 3-5-2
Mike Maignan|Maignan|GK|16|86|30|fr
Pietro Terracciano|Terracciano|GK|1|70|35|it
Matteo Gabbia|Gabbia|CB|46|78|26|it
Fikayo Tomori|Tomori|CB|23|78|27|en
Strahinja Pavlović|Pavlović|CB|31|77|24|rs
Koni De Winter|De Winter|CB|5|77|23|be
Zachary Athekame|Athekame|RB|24|73|21|ch
Alexis Saelemaekers|Saelemaekers|RB|56|80|26|be
Pervis Estupiñán|Estupiñán|LB|2|79|27|ec
Davide Bartesaghi|Bartesaghi|LB|33|73|19|it
Samuele Ricci|Ricci|DM|4|77|24|it
Luka Modrić|Modrić|CM|14|83|40|hr
Adrien Rabiot|Rabiot|CM|12|82|30|fr
Youssouf Fofana|Fofana|CM|19|79|26|fr
Ruben Loftus-Cheek|Loftus-Cheek|CM|8|77|29|en
Ardon Jashari|Jashari|CM|30|77|23|ch
Christian Pulisic|Pulisic|RW|11|84|27|us
Rafael Leão|Leão|LW|10|83|26|pt
Christopher Nkunku|Nkunku|ST|18|78|28|fr
Santiago Giménez|Santi Giménez|ST|7|77|24|mx
Niclas Füllkrug|Füllkrug|ST|9|75|32|de
= juventus 2025 4-2-3-1
Michele Di Gregorio|Di Gregorio|GK|16|81|28|it
Mattia Perin|Perin|GK|1|77|32|it
Pierre Kalulu|Kalulu|RB|15|78|25|fr
João Mário|João Mário|RB|25|70|25|pt
Gleison Bremer|Bremer|CB|3|83|28|br
Federico Gatti|Gatti|CB|4|78|27|it
Lloyd Kelly|Kelly|CB|6|76|27|en
Daniele Rugani|Rugani|CB|24|70|31|it
Andrea Cambiaso|Cambiaso|LB|27|81|25|it
Juan Cabal|Cabal|LB|32|73|24|co
Manuel Locatelli|Locatelli|DM|5|81|27|it
Khéphren Thuram|K. Thuram|CM|19|81|24|fr
Teun Koopmeiners|Koopmeiners|CM|8|78|27|nl
Weston McKennie|McKennie|CM|22|78|27|us
Vasilije Adžić|Adžić|AM|17|70|19|me
Francisco Conceição|Chico Conceição|RW|7|81|22|pt
Edon Zhegrova|Zhegrova|RW|11|79|26|xk
Kenan Yıldız|Kenan Yıldız|LW|10|85|20|tr
Jonathan David|J. David|ST|30|83|25|ca
Dušan Vlahović|Vlahović|ST|9|81|25|rs
Loïs Openda|Openda|ST|20|79|25|be
= roma 2025 3-4-2-1
Mile Svilar|Svilar|GK|99|84|26|rs
Pierluigi Gollini|Gollini|GK|95|70|30|it
Gianluca Mancini|Mancini|CB|23|81|29|it
Evan Ndicka|Ndicka|CB|5|81|26|ci
Mario Hermoso|Hermoso|CB|22|78|30|es
Zeki Çelik|Çelik|RB|19|77|28|tr
Wesley França|Wesley|RB|43|80|22|br
Devyne Rensch|Rensch|RB|2|73|22|nl
Angeliño|Angeliño|LB|3|78|28|es
Manu Koné|Koné|CM|17|84|24|fr
Bryan Cristante|Cristante|DM|4|78|30|it
Neil El Aynaoui|El Aynaoui|CM|8|76|24|ma
Niccolò Pisilli|Pisilli|CM|61|73|21|it
Lorenzo Pellegrini|Pellegrini|AM|7|78|29|it
Paulo Dybala|Dybala|AM|21|81|31|ar
Tommaso Baldanzi|Baldanzi|AM|35|73|22|it
Matías Soulé|Soulé|RW|18|81|22|ar
Stephan El Shaarawy|El Shaarawy|LW|92|73|33|it
Donyell Malen|Malen|ST|14|80|27|nl
Artem Dovbyk|Dovbyk|ST|11|79|28|ua
Evan Ferguson|Ferguson|ST|9|75|21|ie
= lazio 2025 4-3-3
Ivan Provedel|Provedel|GK|94|82|31|it
Christos Mandas|Mandas|GK|35|75|24|gr
Manuel Lazzari|Lazzari|RB|29|76|32|it
Adam Marušić|Marušić|RB|77|75|33|me
Mario Gila|Gila|CB|34|81|25|es
Alessio Romagnoli|Romagnoli|CB|13|80|30|it
Patric|Patric|CB|4|73|32|es
Oliver Provstgaard|Provstgaard|CB|25|70|22|dk
Nuno Tavares|Nuno Tavares|LB|30|78|25|pt
Luca Pellegrini|L. Pellegrini|LB|3|73|26|it
Nicolò Rovella|Rovella|DM|6|80|24|it
Danilo Cataldi|Cataldi|DM|32|75|31|it
Mattéo Guendouzi|Guendouzi|CM|8|79|26|fr
Toma Bašić|Bašić|CM|26|73|29|hr
Fisayo Dele-Bashiru|Dele-Bashiru|CM|7|73|24|ng
Gustav Isaksen|Isaksen|RW|18|76|24|dk
Pedro Rodríguez|Pedro|RW|9|75|38|es
Matteo Cancellieri|Cancellieri|RW|22|73|23|it
Mattia Zaccagni|Zaccagni|LW|10|80|30|it
Taty Castellanos|Castellanos|ST|11|78|27|ar
Boulaye Dia|Dia|ST|19|76|29|sn
Tijjani Noslin|Noslin|ST|14|65|26|nl
= atalanta 2025 3-4-2-1
Marco Carnesecchi|Carnesecchi|GK|29|81|25|it
Marco Sportiello|Sportiello|GK|57|73|33|it
Berat Djimsiti|Djimsiti|CB|19|77|32|al
Isak Hien|Hien|CB|4|79|26|se
Giorgio Scalvini|Scalvini|CB|42|78|21|it
Odilon Kossounou|Kossounou|CB|3|77|24|ci
Sead Kolašinac|Kolašinac|CB|23|76|32|ba
Raoul Bellanova|Bellanova|RB|16|77|25|it
Davide Zappacosta|Zappacosta|RB|77|75|33|it
Nicola Zalewski|Zalewski|LB|59|75|23|pl
Lorenzo Bernasconi|Bernasconi|LB|47|73|22|it
Marten de Roon|De Roon|DM|15|77|34|nl
Éderson|Éderson|CM|13|81|26|br
Mario Pašalić|Pašalić|CM|8|78|30|hr
Yunus Musah|Musah|CM|6|75|22|us
Lazar Samardžić|Samardžić|AM|24|77|23|rs
Charles De Ketelaere|De Ketelaere|AM|17|81|24|be
Ademola Lookman|Lookman|LW|11|83|28|ng
Kamaldeen Sulemana|Sulemana|LW|7|73|23|gh
Gianluca Scamacca|Scamacca|ST|9|78|26|it
Nikola Krstović|Krstović|ST|90|77|25|me
Daniel Maldini|Maldini|ST|10|73|23|it
= bologna 2025 4-2-3-1
Łukasz Skorupski|Skorupski|GK|1|79|34|pl
Federico Ravaglia|Ravaglia|GK|34|73|26|it
Emil Holm|Holm|RB|2|77|25|se
Nadir Zortea|Zortea|RB|20|75|26|it
Jhon Lucumí|Lucumí|CB|26|81|27|co
Torbjørn Heggem|Heggem|CB|14|73|26|no
Martin Vitík|Vitík|CB|41|73|22|cz
Nicolò Casale|Casale|CB|16|75|27|it
Juan Miranda|Miranda|LB|33|77|25|es
Charalampos Lykogiannis|Lykogiannis|LB|22|73|31|gr
Remo Freuler|Freuler|DM|8|77|33|ch
Lewis Ferguson|Ferguson|CM|19|79|26|sc
Tommaso Pobega|Pobega|CM|4|75|26|it
Nikola Moro|Moro|CM|6|74|27|hr
Jens Odgaard|Odgaard|AM|21|77|26|dk
Giovanni Fabbian|Fabbian|AM|80|73|22|it
Riccardo Orsolini|Orsolini|RW|7|81|28|it
Federico Bernardeschi|Bernardeschi|RW|10|76|31|it
Nicolò Cambiaghi|Cambiaghi|LW|28|75|25|it
Jonathan Rowe|Rowe|LW|11|75|22|en
Santiago Castro|Castro|ST|9|80|21|ar
Ciro Immobile|Immobile|ST|17|73|35|it
Thijs Dallinga|Dallinga|ST|24|73|25|nl
= como 2025 4-2-3-1
Jean Butez|Butez|GK|1|78|30|fr
Mauro Vigorito|Vigorito|GK|22|66|35|it
Ivan Smolčić|Smolčić|RB|2|73|24|hr
Ignace Van der Brempt|Van der Brempt|RB|28|71|23|be
Marc-Oliver Kempf|Kempf|CB|5|75|30|de
Jacobo Ramón|Jacobo Ramón|CB|14|71|20|es
Diego Carlos|Diego Carlos|CB|34|75|32|br
Álex Valle|Valle|LB|3|75|21|es
Alberto Moreno|Alberto Moreno|LB|18|71|33|es
Máximo Perrone|Perrone|DM|23|77|22|ar
Lucas Da Cunha|Da Cunha|CM|33|76|24|fr
Maxence Caqueret|Caqueret|CM|8|74|25|fr
Sergi Roberto|Sergi Roberto|CM|20|71|33|es
Nico Paz|Nico Paz|AM|10|83|21|ar
Martin Baturina|Baturina|AM|7|80|22|hr
Jesús Rodríguez|Jesús Rodríguez|LW|17|75|19|es
Assane Diao|Diao|LW|38|71|20|sn
Jayden Addai|Addai|RW|19|71|20|nl
Nicolas Kühn|Kühn|RW|11|75|25|de
Álvaro Morata|Morata|ST|7|77|32|es
Anastasios Douvikas|Douvikas|ST|9|76|26|gr
= fiorentina 2025 3-5-2
David de Gea|De Gea|GK|43|83|34|es
Tommaso Martinelli|Martinelli|GK|1|65|19|it
Marin Pongračić|Pongračić|CB|5|77|27|hr
Luca Ranieri|Ranieri|CB|6|76|26|it
Pietro Comuzzo|Comuzzo|CB|15|77|20|it
Pablo Marí|Pablo Marí|CB|22|73|32|es
Dodô|Dodô|RB|2|79|27|br
Niccolò Fortini|Fortini|RB|30|70|19|it
Robin Gosens|Gosens|LB|21|77|31|de
Fabiano Parisi|Parisi|LB|65|73|24|it
Nicolò Fagioli|Fagioli|CM|44|77|24|it
Rolando Mandragora|Mandragora|CM|8|77|28|it
Cher Ndour|Ndour|CM|27|73|21|it
Simon Sohm|Sohm|CM|7|73|24|ch
Hans Nicolussi Caviglia|Caviglia|DM|14|73|25|it
Albert Gudmundsson|Gudmundsson|AM|10|80|28|is
Jacopo Fazzini|Fazzini|AM|22|73|22|it
Christian Kouamé|Kouamé|LW|99|70|27|ci
Moise Kean|Kean|ST|20|82|25|it
Roberto Piccoli|Piccoli|ST|91|76|24|it
Edin Džeko|Džeko|ST|9|75|39|ba
= genoa 2025 3-5-2
Nicola Leali|Leali|GK|1|75|32|it
Daniel Siegrist|Siegrist|GK|99|66|28|ch
Leo Østigård|Østigård|CB|5|75|25|no
Alessandro Marcandalli|Marcandalli|CB|27|70|22|it
Sebastian Otoa|Otoa|CB|4|70|21|dk
Brooke Norton-Cuffy|Norton-Cuffy|RB|15|73|21|en
Alessandro Zanoli|Zanoli|RB|59|68|24|it
Aarón Martín|Aarón Martín|LB|3|75|28|es
Mikael Ellertsson|Ellertsson|LB|77|68|23|is
Morten Frendrup|Frendrup|DM|32|79|24|dk
Patrizio Masini|Masini|CM|73|73|24|it
Morten Thorsby|Thorsby|CM|2|68|29|no
Ruslan Malinovskyi|Malinovskyi|AM|17|77|32|ua
Nicolae Stanciu|Stanciu|AM|10|75|32|ro
Mikkel Grønbæk|Grønbæk|AM|8|71|24|dk
Valentín Carboni|Carboni|RW|11|71|20|ar
Vitinha|Vitinha|LW|9|74|25|pt
Junior Messias|Messias|RW|7|71|34|br
Lorenzo Colombo|Colombo|ST|29|73|23|it
Jeff Ekhator|Ekhator|ST|21|68|18|it
Caleb Ekuban|Ekuban|ST|18|66|31|gh
= verona 2025 3-5-2
Lorenzo Montipò|Montipò|GK|1|77|29|it
Simone Perilli|Perilli|GK|34|64|30|it
Victor Nelsson|Nelsson|CB|5|73|26|dk
Armel Bella-Kotchap|Bella-Kotchap|CB|4|73|23|de
Nicolás Valentini|Valentini|CB|3|70|24|ar
Rafik Belghali|Belghali|RB|7|70|23|dz
Martin Frese|Frese|LB|3|70|27|dk
Abdou Harroui|Harroui|AM|21|71|27|ma
Suat Serdar|Serdar|CM|25|73|28|de
Roberto Gagliardini|Gagliardini|CM|8|68|31|it
Antoine Bernede|Bernede|CM|24|68|26|fr
Ali Al-Musrati|Al-Musrati|DM|6|73|29|ly
Grigoris Kastanos|Kastanos|AM|20|68|27|cy
Tomáš Suslov|Suslov|AM|31|75|23|sk
Darko Lazović|Lazović|LW|8|68|35|rs
Gift Orban|Orban|ST|16|75|23|ng
Amin Sarr|Sarr|ST|9|73|24|se
Giovane|Giovane|ST|10|68|22|br
Daniel Mosquera|Mosquera|ST|11|68|26|co
= lecce 2025 4-3-3
Wladimiro Falcone|Falcone|GK|30|77|30|it
Christian Früchtl|Früchtl|GK|1|67|25|de
Danilo Veiga|Danilo Veiga|RB|17|70|23|pt
Frédéric Guilbert|Guilbert|RB|12|67|31|fr
Kialonda Gaspar|Gaspar|CB|4|75|28|ao
Jean Siebert|Siebert|CB|5|65|23|de
Tiago Gabriel|Tiago Gabriel|CB|44|73|21|pt
Antonino Gallo|Gallo|LB|25|75|25|it
Ylber Ramadani|Ramadani|DM|20|73|29|al
Lassana Coulibaly|L. Coulibaly|CM|29|73|29|ml
Medon Berisha|Berisha|CM|19|70|22|al
Thórir Helgason|Helgason|CM|8|70|25|is
Balthazar Pierret|Pierret|CM|75|70|25|fr
Tete Morente|Tete Morente|RW|7|73|29|es
Lameck Banda|Banda|LW|19|73|24|zm
Konan N'Dri|N'Dri|RW|11|70|25|be
Santiago Pierotti|Pierotti|RW|50|70|24|ar
Riccardo Sottil|Sottil|LW|23|70|26|it
Francesco Camarda|Camarda|ST|9|73|17|it
Nikola Štulić|Štulić|ST|18|70|24|rs
= parma 2025 3-5-2
Zion Suzuki|Zion Suzuki|GK|31|79|23|jp
Edoardo Corvi|Corvi|GK|40|64|24|it
Alessandro Circati|Circati|CB|39|73|22|au
Enrico Delprato|Delprato|CB|15|73|26|it
Lautaro Valenti|Valenti|CB|5|73|26|ar
Simon Britschgi|Britschgi|RB|29|70|22|ch
Emanuele Valeri|Valeri|LB|14|73|27|it
Mandela Keita|Keita|DM|16|75|23|be
Adrián Bernabé|Bernabé|CM|10|77|24|es
Oliver Sørensen|Sørensen|CM|8|70|23|dk
Nahuel Estévez|Estévez|CM|8|68|30|ar
Hernani|Hernani|CM|27|68|31|br
Gabriel Strefezza|Strefezza|AM|7|71|28|br
Mateo Pellegrino|Pellegrino|ST|9|75|24|ar
Patrick Cutrone|Cutrone|ST|10|73|27|it
Milan Djurić|Djurić|ST|18|66|35|ba
Adrian Benedyczak|Benedyczak|LW|17|71|24|pl
Jacob Ondrejka|Ondrejka|LW|23|68|23|se
Pontus Almqvist|Almqvist|RW|11|68|26|se
Antoine Hainaut|Hainaut|RB|2|68|23|fr
= pisa 2025 3-5-2
Adrian Šemper|Šemper|GK|1|67|27|hr
Simone Scuffet|Scuffet|GK|22|65|29|it
Antonio Caracciolo|Caracciolo|CB|4|67|35|it
Simone Canestrelli|Canestrelli|CB|5|67|25|it
Giovanni Bonfanti|Bonfanti|CB|6|65|22|it
Arturo Calabresi|Calabresi|RB|33|67|29|it
Idrissa Touré|Touré|LB|15|67|27|de
Samuele Angori|Angori|LB|3|65|22|it
Michel Aebischer|Aebischer|CM|20|75|28|ch
Marius Marin|Marin|DM|6|73|26|ro
Ebenezer Akinsanmiro|Akinsanmiro|CM|14|65|21|ng
Gabriele Piccinini|Piccinini|CM|36|65|24|it
Calvin Stengs|Stengs|AM|10|73|27|nl
Matteo Tramoni|Tramoni|AM|11|73|25|fr
Mehdi Léris|Léris|RW|7|65|27|dz
Juan Cuadrado|Cuadrado|RW|11|65|37|co
M'Bala Nzola|Nzola|ST|18|73|29|ao
Stefano Moreo|Moreo|ST|32|65|32|it
Henrik Meister|Meister|ST|9|65|22|dk
= sassuolo 2025 4-3-3
Arijanet Muric|Muric|GK|49|75|27|xk
Giacomo Satalino|Satalino|GK|1|67|26|it
Sebastian Walukiewicz|Walukiewicz|RB|6|70|25|pl
Tarik Muharemović|Muharemović|CB|80|74|23|ba
Jay Idzes|Idzes|CB|21|73|25|id
Filippo Romagna|Romagna|CB|19|70|28|it
Josh Doig|Doig|LB|3|73|23|sc
Yeferson Paz|Paz|LB|17|67|21|co
Nemanja Matić|Matić|DM|18|75|37|rs
Kristian Thorstvedt|Thorstvedt|CM|42|73|26|no
Ismaël Koné|Koné|CM|90|77|23|ca
Daniel Boloca|Boloca|CM|11|70|27|ro
Luca Lipani|Lipani|CM|35|67|20|it
Domenico Berardi|Berardi|RW|10|80|31|it
Armand Laurienté|Laurienté|LW|45|78|27|fr
Cristian Volpato|Volpato|AM|7|66|22|au
Edoardo Iannoni|Iannoni|CM|44|67|24|it
Andrea Pinamonti|Pinamonti|ST|99|75|26|it
Walid Cheddira|Cheddira|ST|9|70|27|ma
Luca Moro|Moro|ST|24|70|24|it
= torino 2025 3-5-2
Franco Israel|Israel|GK|1|75|25|uy
Alberto Paleari|Paleari|GK|91|65|33|it
Saúl Coco|Coco|CB|23|75|26|gq
Ardian Ismajli|Ismajli|CB|44|73|28|al
Adrien Tameze|Tameze|CB|61|73|31|fr
Adam Masina|Masina|CB|5|67|31|ma
Valentino Lazaro|Lazaro|RB|20|73|29|at
Cristiano Biraghi|Biraghi|LB|34|70|33|it
Rafael Obrador|Obrador|LB|33|67|21|es
Kristjan Asllani|Asllani|DM|32|73|23|al
Ivan Ilić|Ilić|CM|8|75|24|rs
Cesare Casadei|Casadei|CM|22|70|22|it
Gvidas Gineitis|Gineitis|CM|66|67|21|lt
Nikola Vlašić|Vlašić|AM|10|79|28|hr
Cyril Ngonge|Ngonge|RW|26|73|25|be
Zakaria Aboukhlal|Aboukhlal|RW|7|73|25|ma
Giovanni Simeone|Simeone|ST|18|75|30|ar
Che Adams|Adams|ST|19|71|29|sc
Duván Zapata|Zapata|ST|91|75|34|co
= udinese 2025 3-5-2
Maduka Okoye|Okoye|GK|40|75|26|ng
Răzvan Sava|Sava|GK|90|70|23|ro
Thomas Kristensen|Kristensen|CB|31|73|23|dk
Oumar Solet|Solet|CB|28|77|25|fr
Saba Goglichidze|Goglichidze|CB|27|70|21|ge
Christian Kabasele|Kabasele|CB|27|70|34|be
Kingsley Ehizibue|Ehizibue|RB|19|70|30|ng
Hassane Kamara|Kamara|LB|11|73|31|ci
Jordan Zemura|Zemura|LB|33|70|25|zw
Jesper Karlström|Karlström|DM|25|70|30|se
Jurgen Ekkelenkamp|Ekkelenkamp|CM|32|75|25|nl
Sandi Lovrić|Lovrić|CM|8|73|27|si
Jakub Piotrowski|Piotrowski|CM|5|70|28|pl
Oier Zarraga|Zarraga|CM|6|70|26|es
Arthur Atta|Atta|AM|14|75|22|fr
Nicolò Zaniolo|Zaniolo|RW|10|77|26|it
Keinan Davis|Davis|ST|9|75|27|en
Iker Bravo|Iker Bravo|ST|15|67|20|es
Adam Buksa|Buksa|ST|18|70|29|pl
= cagliari 2025 4-3-3
Elia Caprile|Caprile|GK|1|79|24|it
Giuseppe Ciocci|Ciocci|GK|31|63|23|it
Gabriele Zappa|Zappa|RB|28|73|26|it
Marco Palestra|Palestra|RB|2|70|20|it
Yerry Mina|Mina|CB|26|73|31|co
Sebastiano Luperto|Luperto|CB|6|73|29|it
Zé Pedro|Zé Pedro|CB|4|67|28|pt
Adam Obert|Obert|LB|33|70|23|sk
Riyad Idrissi|Idrissi|LB|3|65|20|ma
Michel Adopo|Adopo|CM|8|73|25|fr
Alessandro Deiola|Deiola|CM|14|67|30|it
Matteo Prati|Prati|DM|16|70|22|it
Antoine Makoumbou|Makoumbou|CM|29|67|27|cg
Michael Folorunsho|Folorunsho|CM|90|73|27|it
Gianluca Gaetano|Gaetano|AM|10|70|25|it
Zito Luvumbo|Luvumbo|RW|77|73|23|ao
Mattia Felici|Felici|LW|17|70|24|it
Sebastiano Esposito|Esposito|ST|94|75|23|it
Gennaro Borrelli|Borrelli|ST|9|70|25|it
Semih Kılıçsoy|Kılıçsoy|ST|19|70|20|tr
Leonardo Pavoletti|Pavoletti|ST|30|65|36|it
= cremonese 2025 3-5-2
Emil Audero|Audero|GK|1|77|28|it
Marco Silvestri|Silvestri|GK|16|66|34|it
Federico Baschirotto|Baschirotto|CB|6|73|29|it
Matteo Bianchetti|Bianchetti|CB|15|70|32|it
Federico Ceccherini|Ceccherini|CB|4|70|33|it
Francesco Folino|Folino|CB|5|66|23|it
Tommaso Barbieri|Barbieri|RB|2|70|23|it
Romano Floriani Mussolini|Floriani M.|RB|29|66|22|it
Giuseppe Pezzella|Pezzella|LB|3|73|28|it
Leonardo Sernicola|Sernicola|LB|17|68|28|it
Warren Bondo|Bondo|DM|38|73|22|fr
Jari Vandeputte|Vandeputte|CM|27|73|29|be
Martín Payero|Payero|CM|32|68|27|ar
Michele Collocolo|Collocolo|CM|18|68|26|it
Franco Vázquez|Franco Vázquez|AM|20|75|36|ar
Alessio Zerbin|Zerbin|LW|24|68|26|it
Dennis Johnsen|Johnsen|RW|7|68|27|no
Jamie Vardy|Vardy|ST|10|75|38|en
Antonio Sanabria|Sanabria|ST|9|73|29|py
Federico Bonazzoli|Bonazzoli|ST|90|71|28|it
// FIM ATUAIS
// ======================================================== históricos
= milan 1988 4-4-2
Giovanni Galli|Galli|GK|1|83|30|it
Andrea Pazzagli|Pazzagli|GK|12|73|28|it
Mauro Tassotti|Tassotti|RB|2|84|28|it
Franco Baresi|Baresi|CB|6|91|28|it
Alessandro Costacurta|Costacurta|CB|5|83|22|it
Filippo Galli|F. Galli|CB|14|77|25|it
Paolo Maldini|Maldini|LB|3|87|20|it
Frank Rijkaard|Rijkaard|DM|8|89|26|nl
Carlo Ancelotti|Ancelotti|CM|4|83|29|it
Alberigo Evani|Evani|CM|16|77|25|it
Angelo Colombo|Colombo|CM|7|79|27|it
Roberto Donadoni|Donadoni|RW|11|86|25|it
Ruud Gullit|Gullit|AM|10|91|26|nl
Marco van Basten|Van Basten|ST|9|91|24|nl
Pietro Paolo Virdis|Virdis|ST|17|79|31|it
Daniele Massaro|Massaro|ST|19|77|27|it
Stefano Borgonovo|Borgonovo|ST|18|73|24|it
Giovanni Stroppa|Stroppa|AM|15|73|20|it
= milan 2006 4-3-2-1
Dida|Dida|GK|1|85|33|br
Željko Kalac|Kalac|GK|16|73|34|au
Massimo Oddo|Oddo|RB|44|80|30|it
Cafu|Cafu|RB|2|79|36|br
Alessandro Nesta|Nesta|CB|13|87|30|it
Paolo Maldini|Maldini|CB|3|84|38|it
Kakha Kaladze|Kaladze|CB|4|81|29|ge
Marek Jankulovski|Jankulovski|LB|18|82|30|cz
Serginho|Serginho|LB|27|75|35|br
Andrea Pirlo|Pirlo|DM|21|89|27|it
Gennaro Gattuso|Gattuso|CM|8|85|29|it
Massimo Ambrosini|Ambrosini|CM|23|80|29|it
Clarence Seedorf|Seedorf|AM|10|87|31|nl
Kaká|Kaká|AM|22|91|25|br
Yoann Gourcuff|Gourcuff|AM|20|75|20|fr
Filippo Inzaghi|Inzaghi|ST|9|84|33|it
Alberto Gilardino|Gilardino|ST|11|81|24|it
Ronaldo|Ronaldo|ST|99|81|30|br
Marco Borriello|Borriello|ST|17|73|24|it
= inter 1988 4-4-2
Walter Zenga|Zenga|GK|1|87|28|it
Astutillo Malgioglio|Malgioglio|GK|12|70|30|it
Giuseppe Bergomi|Bergomi|RB|2|84|24|it
Riccardo Ferri|Ferri|CB|5|81|25|it
Andrea Mandorlini|Mandorlini|CB|6|79|28|it
Giuseppe Baresi|G. Baresi|CB|4|77|30|it
Andreas Brehme|Brehme|LB|3|86|28|de
Lothar Matthäus|Matthäus|CM|10|90|27|de
Nicola Berti|Berti|CM|8|81|21|it
Gianfranco Matteoli|Matteoli|CM|14|79|29|it
Alessandro Bianchi|Bianchi|RW|7|77|21|it
Pietro Fanna|Fanna|RW|16|75|30|it
Aldo Serena|Serena|ST|9|84|28|it
Ramón Díaz|Ramón Díaz|ST|11|83|29|ar
Alessandro Altobelli|Altobelli|ST|18|75|33|it
Massimo Ciocci|Ciocci|ST|17|70|20|it
Fausto Rossini|Rossini|CM|15|67|22|it
Alberto Rivolta|Rivolta|RB|13|70|21|it
= inter 2009 4-2-3-1
Júlio César|Júlio César|GK|12|88|30|br
Francesco Toldo|Toldo|GK|1|75|38|it
Maicon|Maicon|RB|13|88|28|br
Lúcio|Lúcio|CB|6|87|31|br
Walter Samuel|Samuel|CB|25|85|31|ar
Marco Materazzi|Materazzi|CB|23|77|36|it
Iván Córdoba|Córdoba|CB|2|79|33|co
Cristian Chivu|Chivu|LB|26|81|29|ro
Javier Zanetti|Zanetti|DM|4|86|36|ar
Esteban Cambiasso|Cambiasso|DM|19|86|29|ar
Thiago Motta|Thiago Motta|CM|8|83|27|br
Dejan Stanković|Stanković|CM|5|83|31|rs
Wesley Sneijder|Sneijder|AM|10|90|26|nl
Goran Pandev|Pandev|LW|27|81|26|mk
Samuel Eto'o|Eto'o|RW|9|87|29|cm
Mancini|Mancini|RW|7|75|29|br
Sulley Muntari|Muntari|CM|11|77|25|gh
Diego Milito|Milito|ST|22|89|30|ar
Mario Balotelli|Balotelli|ST|45|79|19|it
= juventus 1984 4-4-2
Stefano Tacconi|Tacconi|GK|1|84|27|it
Luciano Bodini|Bodini|GK|12|70|30|it
Luciano Favero|Favero|RB|2|77|27|it
Sergio Brio|Brio|CB|5|81|28|it
Gaetano Scirea|Scirea|CB|6|88|31|it
Antonio Cabrini|Cabrini|LB|3|86|27|it
Massimo Bonini|Bonini|DM|4|81|25|sm
Marco Tardelli|Tardelli|CM|8|85|30|it
Beniamino Vignola|Vignola|AM|16|79|25|it
Michel Platini|Platini|AM|10|91|29|fr
Massimo Briaschi|Briaschi|RW|7|79|26|it
Zbigniew Boniek|Boniek|LW|11|86|28|pl
Paolo Rossi|Rossi|ST|9|85|27|it
Nicola Caricola|Caricola|CB|14|73|21|it
Cesare Prandelli|Prandelli|CM|15|73|27|it
Bruno Limido|Limido|LW|17|70|23|it
Aldo Pellegrini|Pellegrini|ST|18|67|22|it
Massimo Mauro|Mauro|RW|19|73|22|it
= juventus 2016 4-2-3-1
Gianluigi Buffon|Buffon|GK|1|89|38|it
Neto|Neto|GK|25|75|27|br
Dani Alves|Dani Alves|RB|23|84|33|br
Stephan Lichtsteiner|Lichtsteiner|RB|26|79|32|ch
Leonardo Bonucci|Bonucci|CB|19|87|29|it
Giorgio Chiellini|Chiellini|CB|3|87|32|it
Andrea Barzagli|Barzagli|CB|15|83|35|it
Medhi Benatia|Benatia|CB|4|81|29|ma
Alex Sandro|Alex Sandro|LB|12|85|26|br
Miralem Pjanić|Pjanić|DM|5|86|27|ba
Sami Khedira|Khedira|CM|6|84|30|de
Claudio Marchisio|Marchisio|CM|8|81|31|it
Stefano Sturaro|Sturaro|CM|27|73|24|it
Paulo Dybala|Dybala|AM|21|87|23|ar
Juan Cuadrado|Cuadrado|RW|7|83|29|co
Mario Mandžukić|Mandžukić|LW|17|84|31|hr
Marko Pjaca|Pjaca|LW|20|75|22|hr
Gonzalo Higuaín|Higuaín|ST|9|88|29|ar
Moise Kean|Kean|ST|34|65|17|it
= napoli 1986 4-4-2
Claudio Garella|Garella|GK|1|81|31|it
Raffaele Di Fusco|Di Fusco|GK|12|67|25|it
Giuseppe Bruscolotti|Bruscolotti|RB|2|77|35|it
Ciro Ferrara|Ferrara|CB|4|81|19|it
Alessandro Renica|Renica|CB|6|79|24|it
Moreno Ferrario|Ferrario|CB|5|75|27|it
Giovanni Francini|Francini|LB|3|77|23|it
Salvatore Bagni|Bagni|DM|8|83|30|it
Fernando De Napoli|De Napoli|CM|10|81|22|it
Francesco Romano|Romano|CM|16|79|26|it
Diego Maradona|Maradona|AM|10|93|26|ar
Bruno Giordano|Giordano|ST|9|84|30|it
Andrea Carnevale|Carnevale|ST|11|81|25|it
Massimo Filardi|Filardi|RW|17|70|20|it
Luciano Sola|Sola|CM|15|70|26|it
Ciro Muro|Muro|LW|18|70|22|it
Tebaldo Bigliardi|Bigliardi|CB|14|70|23|it
Raimondo Marino|Marino|ST|19|67|25|it
= napoli 2022 4-3-3
Alex Meret|Meret|GK|1|81|25|it
Pierluigi Gollini|Gollini|GK|95|70|27|it
Giovanni Di Lorenzo|Di Lorenzo|RB|22|84|29|it
Kim Min-jae|Kim Min-jae|CB|3|87|26|kr
Amir Rrahmani|Rrahmani|CB|13|83|29|xk
Juan Jesus|Juan Jesus|CB|5|75|31|br
Mário Rui|Mário Rui|LB|6|79|31|pt
Mathías Olivera|Olivera|LB|17|77|25|uy
Stanislav Lobotka|Lobotka|DM|68|86|28|sk
André-Frank Zambo Anguissa|Anguissa|CM|99|84|27|cm
Piotr Zieliński|Zieliński|CM|20|83|28|pl
Eljif Elmas|Elmas|CM|7|77|23|mk
Tanguy Ndombele|Ndombele|CM|91|75|26|fr
Matteo Politano|Politano|RW|21|81|29|it
Hirving Lozano|Lozano|RW|11|79|27|mx
Khvicha Kvaratskhelia|Kvaratskhelia|LW|77|88|22|ge
Victor Osimhen|Osimhen|ST|9|89|24|ng
Giacomo Raspadori|Raspadori|ST|81|79|23|it
Giovanni Simeone|Simeone|ST|18|77|28|ar
= roma 1982 4-4-2
Franco Tancredi|Tancredi|GK|1|81|27|it
Astutillo Malgioglio|Malgioglio|GK|12|69|24|it
Sebastiano Nela|Nela|RB|2|79|21|it
Pietro Vierchowod|Vierchowod|CB|5|84|23|it
Aldo Maldera|Maldera|LB|3|81|29|it
Ubaldo Righetti|Righetti|CB|6|77|19|it
Agostino Di Bartolomei|Di Bartolomei|CB|10|84|28|it
Paulo Roberto Falcão|Falcão|CM|5|90|29|br
Carlo Ancelotti|Ancelotti|CM|8|81|23|it
Herbert Prohaska|Prohaska|AM|11|84|27|at
Bruno Conti|Conti|RW|7|87|27|it
Odoacre Chierico|Chierico|LW|16|77|23|it
Roberto Pruzzo|Pruzzo|ST|9|85|27|it
Maurizio Iorio|Iorio|ST|19|75|23|it
Emidio Faccini|Faccini|RB|13|69|25|it
Domenico Valigi|Valigi|CM|14|72|25|it
Paolo Giovannelli|Giovannelli|CM|15|69|22|it
Francesco Graziani|Graziani|ST|18|75|30|it
= roma 2000 3-4-1-2
Francesco Antonioli|Antonioli|GK|1|79|31|it
Ivan Pelizzoli|Pelizzoli|GK|12|73|20|it
Walter Samuel|Samuel|CB|19|84|23|ar
Aldair|Aldair|CB|6|83|35|br
Jonathan Zebina|Zebina|CB|15|79|22|fr
Antônio Carlos Zago|Zago|CB|5|77|31|br
Cafu|Cafu|RB|2|87|30|br
Vincent Candela|Candela|LB|32|83|27|fr
Emerson|Emerson|DM|11|86|24|br
Damiano Tommasi|Tommasi|CM|17|83|26|it
Cristiano Zanetti|C. Zanetti|CM|8|79|23|it
Hidetoshi Nakata|Nakata|AM|8|83|23|jp
Francesco Totti|Totti|AM|10|90|24|it
Marcos Assunção|Assunção|CM|18|75|24|br
Gabriel Batistuta|Batistuta|ST|18|88|31|ar
Vincenzo Montella|Montella|ST|9|84|26|it
Marco Delvecchio|Delvecchio|ST|24|81|27|it
Eusebio Di Francesco|Di Francesco|CM|20|73|30|it
= lazio 1999 4-4-2
Luca Marchegiani|Marchegiani|GK|22|83|33|it
Marco Ballotta|Ballotta|GK|1|73|35|it
Giuseppe Pancaro|Pancaro|RB|11|79|28|it
Alessandro Nesta|Nesta|CB|13|88|23|it
Siniša Mihajlović|Mihajlović|CB|11|84|30|rs
Fernando Couto|Couto|CB|2|81|30|pt
Paolo Negro|Negro|CB|6|77|27|it
Néstor Sensini|Sensini|LB|14|79|33|ar
Juan Sebastián Verón|Verón|CM|23|89|24|ar
Diego Simeone|Simeone|CM|14|84|29|ar
Matías Almeyda|Almeyda|DM|5|81|25|ar
Dejan Stanković|Stanković|CM|18|81|21|rs
Pavel Nedvěd|Nedvěd|LW|18|86|27|cz
Sérgio Conceição|Conceição|RW|7|83|24|pt
Roberto Mancini|Mancini|AM|10|81|35|it
Marcelo Salas|Salas|ST|9|85|24|cl
Alen Bokšić|Bokšić|ST|20|83|30|hr
Simone Inzaghi|S. Inzaghi|ST|21|79|23|it
Fabrizio Ravanelli|Ravanelli|ST|30|77|31|it
= lazio 2022 4-3-3
Ivan Provedel|Provedel|GK|94|83|28|it
Luís Maximiano|Maximiano|GK|1|73|24|pt
Manuel Lazzari|Lazzari|RB|29|78|29|it
Adam Marušić|Marušić|RB|77|77|30|me
Alessio Romagnoli|Romagnoli|CB|13|81|27|it
Nicolò Casale|Casale|CB|15|79|24|it
Patric|Patric|CB|4|73|29|es
Elseid Hysaj|Hysaj|LB|23|75|28|al
Sergej Milinković-Savić|Milinković-Savić|CM|21|86|27|rs
Danilo Cataldi|Cataldi|DM|32|77|28|it
Luis Alberto|Luis Alberto|CM|10|84|30|es
Matías Vecino|Vecino|CM|5|77|31|uy
Toma Bašić|Bašić|CM|88|73|26|hr
Felipe Anderson|Felipe Anderson|RW|7|81|29|br
Pedro Rodríguez|Pedro|RW|9|79|35|es
Mattia Zaccagni|Zaccagni|LW|20|81|27|it
Ciro Immobile|Immobile|ST|17|84|32|it
Taty Castellanos|Castellanos|ST|11|75|24|ar
= atalanta 2023 3-4-2-1
Juan Musso|Musso|GK|1|79|29|ar
Marco Carnesecchi|Carnesecchi|GK|29|79|23|it
Berat Djimsiti|Djimsiti|CB|19|79|30|al
Isak Hien|Hien|CB|4|78|24|se
Giorgio Scalvini|Scalvini|CB|42|79|20|it
Sead Kolašinac|Kolašinac|CB|23|77|30|ba
Rafael Tolói|Tolói|CB|2|75|33|it
Davide Zappacosta|Zappacosta|RB|77|77|31|it
Hans Hateboer|Hateboer|RB|33|73|30|nl
Matteo Ruggeri|Ruggeri|LB|22|76|21|it
Emil Holm|Holm|LB|3|73|23|se
Marten de Roon|De Roon|DM|15|79|32|nl
Éderson|Éderson|CM|13|82|24|br
Teun Koopmeiners|Koopmeiners|CM|7|85|26|nl
Mario Pašalić|Pašalić|CM|8|79|29|hr
Charles De Ketelaere|De Ketelaere|AM|17|81|22|be
Aleksey Miranchuk|Miranchuk|AM|59|75|28|ru
Ademola Lookman|Lookman|LW|11|84|26|ng
Gianluca Scamacca|Scamacca|ST|90|81|25|it
El Bilal Touré|Touré|ST|10|73|22|ml
= bologna 2024 4-2-3-1
Łukasz Skorupski|Skorupski|GK|28|81|33|pl
Federico Ravaglia|Ravaglia|GK|34|73|25|it
Emil Holm|Holm|RB|2|77|24|se
Lorenzo De Silvestri|De Silvestri|RB|29|73|36|it
Sam Beukema|Beukema|CB|31|80|26|nl
Jhon Lucumí|Lucumí|CB|26|81|26|co
Nicolò Casale|Casale|CB|16|75|26|it
Martin Erlić|Erlić|CB|4|73|27|hr
Juan Miranda|Miranda|LB|33|77|25|es
Charalampos Lykogiannis|Lykogiannis|LB|22|73|30|gr
Remo Freuler|Freuler|DM|8|79|32|ch
Lewis Ferguson|Ferguson|CM|19|80|25|sc
Tommaso Pobega|Pobega|CM|4|75|25|it
Michel Aebischer|Aebischer|CM|20|75|28|ch
Jens Odgaard|Odgaard|AM|21|77|25|dk
Riccardo Orsolini|Orsolini|RW|7|83|28|it
Dan Ndoye|Ndoye|LW|11|81|24|ch
Nicolò Cambiaghi|Cambiaghi|LW|28|75|24|it
Santiago Castro|Castro|ST|9|79|20|ar
Thijs Dallinga|Dallinga|ST|24|73|24|nl
= cagliari 1969 4-3-3
Enrico Albertosi|Albertosi|GK|1|84|30|it
Adriano Reginato|Reginato|GK|12|70|32|it
Mario Martiradonna|Martiradonna|RB|2|77|31|it
Comunardo Niccolai|Niccolai|CB|5|77|23|it
Pierluigi Cera|Cera|CB|6|81|28|it
Giuseppe Tomasini|Tomasini|CB|4|75|23|it
Giulio Zignoli|Zignoli|LB|3|75|23|it
Eraldo Mancin|Mancin|LB|13|70|25|it
Ricciotti Greatti|Greatti|CM|8|79|30|it
Nené|Nené|CM|10|81|27|br
Mario Brugnera|Brugnera|CM|16|77|23|it
Cesare Poli|Poli|CM|14|70|24|it
Angelo Domenghini|Domenghini|RW|7|84|28|it
Gigi Riva|Riva|LW|11|90|25|it
Sergio Gori|Gori|ST|9|81|23|it
Corrado Nastasio|Nastasio|ST|17|67|23|it
Roberto Sulis|Sulis|CB|15|65|22|it
Claudio Taddeini|Taddeini|ST|18|65|22|it
= como 2024 4-2-3-1
Pepe Reina|Reina|GK|25|73|42|es
Jean Butez|Butez|GK|1|77|29|fr
Ivan Smolčić|Smolčić|RB|2|73|23|hr
Marc-Oliver Kempf|Kempf|CB|5|75|29|de
Edoardo Goldaniga|Goldaniga|CB|6|73|31|it
Alberto Dossena|Dossena|CB|13|70|26|it
Álex Valle|Valle|LB|3|75|20|es
Alberto Moreno|Alberto Moreno|LB|18|73|32|es
Máximo Perrone|Perrone|DM|23|77|22|ar
Lucas Da Cunha|Da Cunha|CM|33|77|23|fr
Sergi Roberto|Sergi Roberto|CM|20|73|32|es
Maxence Caqueret|Caqueret|CM|8|73|24|fr
Nico Paz|Nico Paz|AM|79|81|20|ar
Gabriel Strefezza|Strefezza|RW|7|75|27|br
Assane Diao|Diao|LW|38|75|19|sn
Alieu Fadera|Fadera|LW|17|70|23|gm
Patrick Cutrone|Cutrone|ST|10|75|26|it
Andrea Belotti|Belotti|ST|11|70|31|it
Anastasios Douvikas|Douvikas|ST|9|73|25|gr
= cremonese 2022 3-5-2
Marco Carnesecchi|Carnesecchi|GK|12|79|22|it
Marco Sarr|Sarr|GK|1|63|24|fr
Vlad Chiricheș|Chiricheș|CB|21|73|33|ro
Matteo Bianchetti|Bianchetti|CB|15|70|29|it
Luka Lochoshvili|Lochoshvili|CB|44|70|24|ge
Johan Vásquez|Vásquez|CB|5|75|24|mx
Leonardo Sernicola|Sernicola|RB|17|73|25|it
Emanuele Valeri|Valeri|LB|3|73|24|it
Charles Pickel|Pickel|DM|6|73|25|cd
Michele Castagnetti|Castagnetti|CM|19|73|33|it
Soualiho Meïté|Meïté|CM|20|73|28|fr
Santiago Ascacíbar|Ascacíbar|CM|8|73|25|ar
Cristian Buonaiuto|Buonaiuto|AM|10|73|30|it
David Okereke|Okereke|RW|77|75|25|ng
Cyriel Dessers|Dessers|ST|90|75|27|ng
Daniel Ciofani|Ciofani|ST|9|70|37|it
Frank Tsadjout|Tsadjout|ST|74|67|23|it
Felix Afena-Gyan|Afena-Gyan|ST|16|70|19|gh
= fiorentina 1998 4-3-1-2
Francesco Toldo|Toldo|GK|1|86|27|it
Fabrizio Lorieri|Lorieri|GK|12|70|34|it
Tomáš Řepka|Řepka|CB|5|81|24|cz
Pasquale Padalino|Padalino|CB|6|77|26|it
Aldo Firicano|Firicano|CB|4|75|31|it
Moreno Torricelli|Torricelli|RB|2|79|28|it
Jörg Heinrich|Heinrich|LB|3|81|29|de
Sandro Cois|Cois|DM|8|79|26|it
Guillermo Amor|Amor|CM|14|79|31|es
Luís Oliveira|Oliveira|LW|11|81|29|be
Manuel Rui Costa|Rui Costa|AM|10|88|26|pt
Edmundo|Edmundo|ST|7|85|27|br
Gabriel Batistuta|Batistuta|ST|9|90|29|ar
Anselmo Robbiati|Robbiati|RW|17|75|28|it
Daniele Adani|Adani|CB|15|75|24|it
Mauro Bressan|Bressan|CM|16|73|27|it
Domenico Morfeo|Morfeo|AM|18|77|22|it
Christian Amoroso|Amoroso|CM|20|70|23|it
= genoa 1990 4-4-2
Simone Braglia|Braglia|GK|1|79|28|it
Fabio Berti|Berti|GK|12|65|27|it
Vincenzo Torrente|Torrente|RB|2|77|24|it
Gianluca Signorini|Signorini|CB|6|79|30|it
Stefano Caricola|Caricola|CB|5|77|27|it
Fulvio Collovati|Collovati|CB|4|75|33|it
Branco|Branco|LB|3|83|26|br
Stefano Eranio|Eranio|RW|7|81|24|it
Mario Bortolazzi|Bortolazzi|CM|8|77|25|it
Gennaro Ruotolo|Ruotolo|CM|16|77|23|it
Claudio Onorati|Onorati|CM|14|75|30|it
Carlos Aguilera|Aguilera|ST|11|84|26|uy
Tomáš Skuhravý|Skuhravý|ST|9|84|25|cz
Roberto Fiorin|Fiorin|LW|17|70|25|it
Marco Ferroni|Ferroni|CB|13|73|27|it
Davide Fontolan|Fontolan|CM|18|70|24|it
Roberto Pacione|Pacione|ST|19|70|25|it
Paolo Urbano|Urbano|CM|15|67|24|it
= verona 1984 4-4-2
Claudio Garella|Garella|GK|1|81|29|it
Sergio Spuri|Spuri|GK|12|65|28|it
Mauro Ferroni|Ferroni|RB|2|75|28|it
Roberto Tricella|Tricella|CB|6|81|25|it
Silvano Fontolan|Fontolan|CB|5|75|29|it
Luciano Marangon|Marangon|LB|3|77|28|it
Hans-Peter Briegel|Briegel|CM|4|86|29|de
Domenico Volpati|Volpati|DM|8|77|33|it
Antonio Di Gennaro|Di Gennaro|AM|10|83|26|it
Pietro Fanna|Fanna|RW|7|81|26|it
Giuseppe Galderisi|Galderisi|ST|11|81|21|it
Preben Elkjær|Elkjær|ST|9|86|27|dk
Luigi Sacchetti|Sacchetti|CM|16|73|28|it
Franco Turchetta|Turchetta|LW|17|70|26|it
Dario Donà|Donà|CM|15|70|23|it
Luciano Bruni|Bruni|ST|18|70|26|it
Fabio Marangon|F. Marangon|CB|14|67|21|it
= lecce 2003 4-3-3
Vincenzo Sicignano|Sicignano|GK|1|75|29|it
Vukašin Poleksić|Poleksić|GK|12|67|21|me
Marco Cassetti|Cassetti|RB|2|77|26|it
Sebastiano Siviglia|Siviglia|CB|5|77|30|it
Lorenzo Stovini|Stovini|CB|4|75|26|it
Cesare Bovo|Bovo|CB|6|73|20|it
Giuseppe Abruzzese|Abruzzese|CB|15|70|28|it
Philippe Billy|Billy|RB|13|67|27|fr
Max Tonetto|Tonetto|LB|3|77|29|it
Erminio Rullo|Rullo|LB|14|67|19|it
Cristian Ledesma|Ledesma|DM|10|79|21|ar
Guillermo Giacomazzi|Giacomazzi|CM|8|75|26|uy
Jorge Bolaño|Bolaño|CM|16|75|26|co
Daniele Franceschini|Franceschini|CM|17|73|27|it
Drissa Diarra|Diarra|CM|18|70|18|ml
Mirko Vučinić|Vučinić|LW|9|79|20|me
Axel Cédric Konan|Konan|RW|7|73|20|ci
Wilfried Dalmat|Dalmat|RW|19|70|21|fr
Javier Chevantón|Chevantón|ST|11|83|23|uy
Valeri Bojinov|Bojinov|ST|20|77|17|bg
= parma 1998 3-5-2
Gianluigi Buffon|Buffon|GK|1|86|20|it
Alessandro Nista|Nista|GK|12|70|33|it
Lilian Thuram|Thuram|CB|21|87|26|fr
Fabio Cannavaro|Cannavaro|CB|2|86|25|it
Roberto Sensini|Sensini|CB|6|81|32|ar
Antonio Benarrivo|Benarrivo|RB|3|81|30|it
Paolo Vanoli|Vanoli|LB|5|77|26|it
Diego Fuser|Fuser|RW|8|81|30|it
Dino Baggio|D. Baggio|CM|4|83|27|it
Alain Boghossian|Boghossian|CM|14|79|28|fr
Juan Sebastián Verón|Verón|AM|23|88|23|ar
Enrico Chiesa|Chiesa|ST|7|84|27|it
Hernán Crespo|Crespo|ST|9|87|23|ar
Abel Balbo|Balbo|ST|18|81|32|ar
Mario Stanić|Stanić|CM|10|79|26|hr
Stefano Fiore|Fiore|CM|16|77|23|it
Faustino Asprilla|Asprilla|ST|11|77|29|co
Lamberto Zauli|Zauli|AM|20|73|27|it
= sassuolo 2015 4-3-3
Andrea Consigli|Consigli|GK|47|79|28|it
Gianluca Pegolo|Pegolo|GK|1|70|34|it
Šime Vrsaljko|Vrsaljko|RB|11|79|23|hr
Federico Peluso|Peluso|LB|13|73|31|it
Francesco Acerbi|Acerbi|CB|15|81|27|it
Paolo Cannavaro|P. Cannavaro|CB|28|75|34|it
Luca Antei|Antei|CB|20|73|23|it
Alberto Gazzola|Gazzola|RB|17|70|28|it
Francesco Magnanelli|Magnanelli|DM|4|75|31|it
Lorenzo Pellegrini|Pellegrini|CM|8|75|19|it
Alfred Duncan|Duncan|CM|32|75|22|gh
Simone Missiroli|Missiroli|CM|7|75|30|it
Davide Biondini|Biondini|CM|16|70|32|it
Domenico Berardi|Berardi|RW|25|83|21|it
Matteo Politano|Politano|RW|16|77|22|it
Nicola Sansone|Sansone|LW|17|79|24|it
Grégoire Defrel|Defrel|ST|92|77|24|fr
Diego Falcinelli|Falcinelli|ST|9|73|25|it
Sergio Floccari|Floccari|ST|99|70|34|it
= torino 1975 4-4-2
Luciano Castellini|Castellini|GK|1|83|30|it
Giuseppe Cazzaniga|Cazzaniga|GK|12|65|26|it
Nello Santin|Santin|RB|2|77|29|it
Roberto Salvadori|Salvadori|LB|3|77|25|it
Roberto Mozzini|Mozzini|CB|5|77|24|it
Vittorio Caporale|Caporale|CB|6|77|28|it
Patrizio Sala|P. Sala|CM|4|83|20|it
Eraldo Pecci|Pecci|CM|8|83|20|it
Renato Zaccarelli|Zaccarelli|CM|10|81|24|it
Claudio Sala|C. Sala|RW|7|86|28|it
Francesco Graziani|Graziani|ST|9|86|23|it
Paolo Pulici|Pulici|ST|11|88|25|it
Fabrizio Gorin|Gorin|DM|14|70|26|it
Salvatore Garritano|Garritano|ST|17|70|21|it
Marino Lombardo|Lombardo|CM|16|67|25|it
Silvano Lanzi|Lanzi|CB|15|67|25|it
Giuseppe Bui|Bui|CM|18|65|25|it
= udinese 1997 3-4-3
Luigi Turci|Turci|GK|1|77|27|it
Massimo Taibi|Taibi|GK|12|73|27|it
Valerio Bertotto|Bertotto|CB|2|79|24|it
Alessandro Calori|Calori|CB|5|79|31|it
Fabio Pierini|Pierini|CB|6|75|24|it
Thomas Helveg|Helveg|RB|3|79|26|dk
Jonathan Bachini|Bachini|LB|17|75|22|it
Giuliano Giannichedda|Giannichedda|CM|8|79|23|it
Johan Walem|Walem|CM|10|79|25|be
Raffaele Sergio|Sergio|CM|14|73|31|it
Paolo Poggi|Poggi|RW|7|81|26|it
Márcio Amoroso|Amoroso|LW|11|86|23|br
Oliver Bierhoff|Bierhoff|ST|20|87|29|de
Tomas Locatelli|Locatelli|AM|16|75|21|it
Mohammed Gargo|Gargo|CM|15|73|22|gh
Andrea Sottil|Sottil|CB|13|73|23|it
Massimo Zanchi|Zanchi|LB|18|70|22|it
Stefano Fiore|Fiore|AM|19|75|22|it
// FIM
`,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
  else (root.DEZ_BRUTO = root.DEZ_BRUTO || []).push(D);
})(typeof window !== 'undefined' ? window : this);
