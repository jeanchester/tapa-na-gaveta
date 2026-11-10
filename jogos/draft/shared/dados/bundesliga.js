// Football Draft: Bundesliga (2025/26 e históricos)
// Formato: ver shared/dez-dados.js. Notas na escala única (docs/PROMPT_DADOS_REAIS.md, seção 3).
(function (root) {
  'use strict';
  const D = {
    id: 'bundesliga', origem: 'de',
    times: `
augsburg|Augsburg|||FCA|#FFFFFF|#BA3733|png
bayern|Bayern de Munique|Bayern Munich|Bayern de Múnich|FCB|#DC052D|#FFFFFF|png
bremen|Werder Bremen|||SVW|#1D9053|#FFFFFF|png
dortmund|Borussia Dortmund|||BVB|#FDE100|#111111|png
eintracht|Eintracht Frankfurt|||SGE|#E1000F|#111111|png
freiburg|Freiburg|||SCF|#E2001A|#111111|png
gladbach|Borussia M'gladbach|||BMG|#FFFFFF|#111111|png
hamburger|Hamburgo|Hamburg|Hamburgo|HSV|#FFFFFF|#0A3F86|png
heidenheim|Heidenheim|||FCH|#E2001A|#003A79|png
hoffenheim|Hoffenheim|||TSG|#1C63B7|#FFFFFF|png
koln|Colônia|Köln|Colonia|KOE|#FFFFFF|#ED1C24|png
leipzig|RB Leipzig|||RBL|#FFFFFF|#DD0741|png
leverkusen|Bayer Leverkusen|||B04|#E32221|#111111|png
mainz|Mainz|||M05|#C3141E|#FFFFFF|png
pauli|St. Pauli|||STP|#624839|#FFFFFF|png
stuttgart|Stuttgart|||VFB|#FFFFFF|#E32219|png
union_berlim|Union Berlin|||FCU|#EB1923|#FFFFFF|png
wolfsburg|Wolfsburg|||WOB|#65B32E|#FFFFFF|png`,
    elencos: `
// ======================================================== 2025/26
= bayern 2025 4-2-3-1
Manuel Neuer|Neuer|GK|1|84|39|de
Jonas Urbig|Urbig|GK|40|75|22|de
Konrad Laimer|Laimer|RB|27|83|28|at
Josip Stanišić|Stanišić|RB|44|81|25|hr
Sacha Boey|Boey|RB|23|75|25|fr
Dayot Upamecano|Upamecano|CB|2|84|27|fr
Jonathan Tah|Tah|CB|4|84|29|de
Kim Min-jae|Kim Min-jae|CB|3|84|28|kr
Hiroki Ito|Hiroki Ito|CB|21|79|26|jp
Alphonso Davies|Davies|LB|19|83|24|ca
Raphaël Guerreiro|Guerreiro|LB|22|77|31|pt
Joshua Kimmich|Kimmich|DM|6|86|30|de
Aleksandar Pavlović|Pavlović|DM|45|83|21|de
Leon Goretzka|Goretzka|CM|8|81|30|de
Jamal Musiala|Musiala|AM|42|85|22|de
Michael Olise|Olise|RW|17|87|23|fr
Serge Gnabry|Gnabry|RW|7|81|30|de
Lennart Karl|Karl|RW|42|76|17|de
Luis Díaz|Luis Díaz|LW|14|87|28|co
Harry Kane|Kane|ST|9|89|32|en
Nicolas Jackson|Jackson|ST|11|79|24|sn
= dortmund 2025 3-4-2-1
Gregor Kobel|Kobel|GK|1|85|27|ch
Alexander Meyer|Meyer|GK|33|70|34|de
Nico Schlotterbeck|Schlotterbeck|CB|4|84|25|de
Niklas Süle|Süle|CB|25|77|30|de
Waldemar Anton|Anton|CB|3|77|29|de
Ramy Bensebaini|Bensebaini|CB|5|77|30|dz
Julian Ryerson|Ryerson|RB|26|78|27|no
Yan Couto|Yan Couto|RB|2|77|23|br
Daniel Svensson|D. Svensson|LB|24|73|23|se
Felix Nmecha|Nmecha|CM|8|80|24|de
Marcel Sabitzer|Sabitzer|CM|20|81|31|at
Pascal Groß|Groß|CM|13|77|34|de
Emre Can|Can|DM|23|76|31|de
Jobe Bellingham|J. Bellingham|CM|7|76|20|en
Carney Chukwuemeka|Chukwuemeka|CM|17|74|21|at
Julian Brandt|Brandt|AM|10|79|29|de
Karim Adeyemi|Adeyemi|LW|27|80|23|de
Maximilian Beier|Beier|ST|14|78|22|de
Serhou Guirassy|Guirassy|ST|9|84|29|gn
Fábio Silva|Fábio Silva|ST|21|75|23|pt
= leverkusen 2025 3-4-2-1
Mark Flekken|Flekken|GK|1|77|32|nl
Janis Blaswich|Blaswich|GK|28|70|34|de
Edmond Tapsoba|Tapsoba|CB|12|82|26|bf
Jarell Quansah|Quansah|CB|4|77|22|en
Loïc Badé|Badé|CB|5|75|25|fr
Arthur|Arthur|RB|13|73|22|br
Álex Grimaldo|Grimaldo|LB|20|83|29|es
Robert Andrich|Andrich|DM|8|80|31|de
Exequiel Palacios|Palacios|CM|25|80|27|ar
Aleix García|Aleix García|CM|24|81|28|es
Malik Tillman|Tillman|AM|10|77|23|us
Ibrahim Maza|Maza|AM|30|76|19|dz
Jonas Hofmann|Hofmann|AM|7|77|33|de
Amine Adli|Adli|AM|21|75|25|ma
Ernest Poku|Poku|RW|19|77|21|nl
Nathan Tella|Tella|RW|19|74|26|ng
Martin Terrier|Terrier|LW|11|77|28|fr
Patrik Schick|Schick|ST|14|82|29|cz
Christian Kofane|Kofane|ST|35|73|19|cm
= leipzig 2025 4-2-3-1
Péter Gulácsi|Gulácsi|GK|1|79|35|hu
Maarten Vandevoordt|Vandevoordt|GK|26|75|23|be
Ridle Baku|Baku|RB|17|75|27|de
Castello Lukeba|Lukeba|CB|23|80|22|fr
Willi Orbán|Orbán|CB|4|78|32|hu
Lukas Klostermann|Klostermann|CB|16|75|29|de
El Chadaille Bitshiabu|Bitshiabu|CB|5|73|20|fr
David Raum|Raum|LB|22|80|27|de
Nicolas Seiwald|Seiwald|DM|13|79|24|at
Xaver Schlager|X. Schlager|CM|24|83|27|at
Assan Ouédraogo|Ouédraogo|CM|20|77|19|de
Christoph Baumgartner|Baumgartner|AM|14|81|26|at
Brajan Gruda|Gruda|AM|10|75|21|de
Johan Bakayoko|Bakayoko|RW|9|77|22|be
Antonio Nusa|Nusa|LW|7|79|20|no
Yan Diomande|Y. Diomande|LW|49|80|19|ci
Conrad Harder|Harder|ST|11|75|20|dk
Rômulo|Rômulo|ST|40|75|23|br
Kevin Kampl|Kampl|CM|44|73|35|si
= stuttgart 2025 4-2-3-1
Alexander Nübel|Nübel|GK|33|79|29|de
Fabian Bredlow|Bredlow|GK|1|65|30|de
Josha Vagnoman|Vagnoman|RB|4|73|24|de
Lorenz Assignon|Assignon|RB|22|75|25|fr
Jeff Chabot|Chabot|CB|24|76|27|de
Finn Jeltsch|Jeltsch|CB|29|73|19|de
Ramon Hendriks|Hendriks|CB|3|73|24|nl
Maximilian Mittelstädt|Mittelstädt|LB|7|78|28|de
Angelo Stiller|Stiller|CM|6|81|24|de
Atakan Karazor|Karazor|DM|16|75|29|de
Chema Andrés|Chema|CM|30|75|21|es
Bilal El Khannouss|El Khannouss|AM|11|77|21|ma
Jamie Leweling|Leweling|RW|18|78|24|de
Badredine Bouanani|Bouanani|RW|27|70|20|fr
Chris Führich|Führich|LW|27|77|27|de
Tiago Tomás|Tiago Tomás|LW|10|73|23|pt
Deniz Undav|Undav|ST|26|80|29|de
Ermedin Demirović|Demirović|ST|9|79|27|ba
Nikolas Nartey|Nartey|CM|28|70|25|dk
= eintracht 2025 4-2-3-1
Michael Zetterer|Zetterer|GK|23|75|30|de
Kauã Santos|Kauã Santos|GK|40|70|22|br
Rasmus Kristensen|Kristensen|RB|13|75|28|dk
Robin Koch|Koch|CB|4|77|29|de
Arthur Theate|Theate|CB|3|78|25|be
Aurèle Amenda|Amenda|CB|5|70|22|ch
Nnamdi Collins|N. Collins|CB|33|73|21|de
Nathaniel Brown|Brown|LB|21|78|22|de
Ellyes Skhiri|Skhiri|DM|15|77|30|tn
Hugo Larsson|Larsson|CM|16|77|21|se
Oscar Højlund|O. Højlund|CM|17|70|20|dk
Farès Chaïbi|Chaïbi|AM|8|76|23|dz
Can Uzun|Can Uzun|AM|11|77|19|tr
Mario Götze|Götze|AM|27|75|33|de
Ritsu Doan|Doan|RW|20|82|27|jp
Ansgar Knauff|Knauff|RW|36|76|23|de
Jean-Mattéo Bahoya|Bahoya|LW|19|73|20|fr
Jonathan Burkardt|Burkardt|ST|7|78|25|de
Elye Wahi|Wahi|ST|9|73|22|fr
Michy Batshuayi|Batshuayi|ST|23|70|32|be
= freiburg 2025 4-2-3-1
Noah Atubolu|Atubolu|GK|1|78|23|de
Florian Müller|F. Müller|GK|21|65|27|de
Lukas Kübler|Kübler|RB|17|75|33|de
Matthias Ginter|Ginter|CB|28|77|31|de
Philipp Lienhart|Lienhart|CB|3|78|29|at
Max Rosenfelder|Rosenfelder|CB|37|73|22|de
Christian Günter|Günter|LB|30|73|32|de
Jordy Makengo|Makengo|LB|33|73|24|fr
Nicolas Höfler|Höfler|DM|27|73|35|de
Maximilian Eggestein|Eggestein|CM|8|75|28|de
Patrick Osterhage|Osterhage|CM|6|73|25|de
Johan Manzambi|Manzambi|CM|44|79|20|ch
Vincenzo Grifo|Grifo|LW|32|77|32|it
Jan-Niklas Beste|Beste|LW|19|75|26|de
Yuito Suzuki|Yuito Suzuki|LW|14|76|23|jp
Derry Scherhant|Scherhant|RW|11|70|23|de
Junior Adamu|Adamu|ST|9|73|24|at
Lucas Höler|Höler|ST|9|73|31|de
Igor Matanović|Matanović|ST|21|68|22|hr
= mainz 2025 3-4-2-1
Robin Zentner|Zentner|GK|27|75|31|de
Lasse Rieß|Rieß|GK|1|67|24|de
Andreas Hanche-Olsen|Hanche-Olsen|CB|25|75|28|no
Moritz Jenz|Jenz|CB|3|73|26|de
Stefan Bell|Bell|CB|16|70|34|de
Dominik Kohr|Kohr|CB|31|73|31|de
Anthony Caci|Caci|RB|19|73|28|fr
Silvan Widmer|Widmer|RB|30|73|32|ch
Phillipp Mwene|Mwene|LB|2|71|31|at
Kaishu Sano|Sano|DM|6|79|24|jp
Nadiem Amiri|Amiri|AM|10|78|28|de
Lee Jae-sung|Lee Jae-sung|AM|7|75|33|kr
Paul Nebel|Nebel|AM|8|75|22|de
Sota Kawasaki|Kawasaki|CM|24|70|24|jp
Benedict Hollerbach|Hollerbach|ST|9|73|24|de
Phillip Tietz|Tietz|ST|20|73|28|de
Armindo Sieb|Sieb|ST|11|70|22|de
Nelson Weiper|Weiper|ST|44|70|20|de
= gladbach 2025 4-2-3-1
Moritz Nicolas|Nicolas|GK|33|77|28|de
Jonas Omlin|Omlin|GK|1|73|31|ch
Joe Scally|Scally|RB|29|73|22|us
Nico Elvedi|Elvedi|CB|30|76|29|ch
Kevin Diks|Diks|CB|4|74|29|nl
Marvin Friedrich|Friedrich|CB|5|71|29|de
Luca Netz|Netz|LB|20|74|22|de
Lukas Ullrich|Ullrich|LB|26|71|21|de
Rocco Reitz|Reitz|DM|27|77|23|de
Julian Weigl|Weigl|DM|8|73|29|de
Philipp Sander|Sander|CM|16|71|27|de
Jens Castrop|Castrop|CM|17|74|22|kr
Kevin Stöger|Stöger|AM|7|77|32|at
Florian Neuhaus|Neuhaus|AM|10|73|28|de
Franck Honorat|Honorat|RW|9|80|29|fr
Nathan Ngoumou|Ngoumou|RW|19|68|25|fr
Robin Hack|Hack|LW|25|73|27|de
Tim Kleindienst|Kleindienst|ST|11|77|30|de
Haris Tabaković|Tabaković|ST|14|73|31|ba
Shuto Machino|Machino|ST|18|71|26|jp
= augsburg 2025 3-4-2-1
Finn Dahmen|Dahmen|GK|1|77|27|de
Nediljko Labrović|Labrović|GK|22|65|26|hr
Jeffrey Gouweleeuw|Gouweleeuw|CB|6|70|34|nl
Keven Schlotterbeck|K. Schlotterbeck|CB|31|70|28|de
Chrislain Matsima|Matsima|CB|5|67|23|fr
Cédric Zesiger|Zesiger|CB|3|67|27|ch
Marius Wolf|Wolf|RB|20|70|30|de
Kevin Mbabu|Mbabu|RB|43|67|30|ch
Dimitrios Giannoulis|Giannoulis|LB|13|70|30|gr
Kristijan Jakić|Jakić|DM|17|74|28|hr
Elvis Rexhbeçaj|Rexhbeçaj|CM|8|67|28|de
Han-Noah Massengo|Massengo|CM|10|67|24|fr
Fabian Rieder|Rieder|AM|32|70|23|ch
Alexis Claude-Maurice|Claude-Maurice|AM|7|75|27|fr
Mert Kömür|Kömür|AM|36|67|20|de
Anton Kade|Kade|RW|11|70|21|de
Samuel Essende|Essende|ST|9|75|27|cd
Steve Mounié|Mounié|ST|14|67|31|bj
= wolfsburg 2025 4-2-3-1
Kamil Grabara|Grabara|GK|1|77|26|pl
Pavao Pervan|Pervan|GK|12|65|38|at
Kilian Fischer|Fischer|RB|2|73|25|de
Konstantinos Koulierakis|Koulierakis|CB|4|75|22|gr
Denis Vavro|Vavro|CB|3|73|29|sk
Sebastiaan Bornauw|Bornauw|CB|5|70|26|be
Joakim Mæhle|Mæhle|LB|21|73|28|dk
Vinícius Souza|Vinícius Souza|DM|6|75|26|br
Maximilian Arnold|Arnold|CM|27|77|31|de
Mattias Svanberg|Svanberg|CM|32|75|26|se
Christian Eriksen|Eriksen|CM|24|77|33|dk
Lovro Majer|Majer|AM|19|75|27|hr
Yannick Gerhardt|Gerhardt|CM|31|73|31|de
Andreas Skov Olsen|Skov Olsen|RW|7|77|26|dk
Patrick Wimmer|Wimmer|RW|39|75|24|at
Mohamed Amoura|Amoura|LW|9|81|25|dz
Dzenan Pejčinović|Pejčinović|ST|23|70|20|de
Jonas Wind|Wind|ST|23|76|26|dk
Kevin Paredes|Paredes|LW|17|70|22|us
= hoffenheim 2025 4-2-3-1
Oliver Baumann|Baumann|GK|1|79|35|de
Luca Philipp|Philipp|GK|37|65|24|de
Pavel Kadeřábek|Kadeřábek|RB|3|75|33|cz
Vladimír Coufal|Coufal|RB|34|73|33|cz
Robin Hranáč|Hranáč|CB|5|75|25|cz
Ozan Kabak|Kabak|CB|15|73|25|tr
Kevin Akpoguma|Akpoguma|CB|25|73|30|de
Albian Hajdari|Hajdari|CB|21|70|22|ch
Alexander Prass|Prass|LB|22|77|24|at
Leon Avdullahu|Avdullahu|DM|6|73|21|ch
Grischa Prömel|Prömel|CM|8|75|30|de
Wouter Burger|Burger|CM|18|75|24|nl
Bazoumana Touré|B. Touré|LW|29|70|19|ci
Andrej Kramarić|Kramarić|AM|27|78|34|hr
Adam Hložek|Hložek|LW|23|76|23|cz
Fisnik Asllani|Asllani|ST|11|77|23|xk
Tim Lemperle|Lemperle|ST|9|73|23|de
Ihlas Bebou|Bebou|ST|9|70|31|tg
Marius Bülter|Bülter|LW|21|73|32|de
= union_berlim 2025 3-5-2
Frederik Rønnow|Rønnow|GK|1|79|33|dk
Carl Klaus|Klaus|GK|37|65|31|de
Danilho Doekhi|Doekhi|CB|5|77|27|nl
Diogo Leite|Leite|CB|4|75|26|pt
Leopold Querfeld|Querfeld|CB|14|75|21|at
Christopher Trimmel|Trimmel|RB|28|70|38|at
Josip Juranović|Juranović|RB|18|73|30|hr
Tom Rothe|Rothe|LB|15|73|20|de
Derrick Köhn|Köhn|LB|23|70|26|de
Rani Khedira|Khedira|DM|8|75|31|de
András Schäfer|Schäfer|CM|13|73|26|hu
Janik Haberer|Haberer|CM|19|73|31|de
Aljoscha Kemlein|Kemlein|CM|6|70|21|de
Alex Král|Král|CM|33|70|27|cz
Jeong Woo-yeong|Jeong|RW|10|73|26|kr
Andrej Ilić|Ilić|ST|9|75|25|rs
Tim Skarke|Skarke|RW|11|70|28|de
Oliver Burke|Burke|ST|7|73|28|sc
Ilyas Ansah|Ansah|ST|27|73|20|de
= bremen 2025 4-2-3-1
Mio Backhaus|Backhaus|GK|30|75|21|de
Markus Kolke|Kolke|GK|1|65|35|de
Yukinari Sugawara|Sugawara|RB|3|75|25|jp
Felix Agu|Agu|RB|27|71|26|de
Marco Friedl|Friedl|CB|32|75|27|at
Niklas Stark|Stark|CB|4|75|30|de
Amos Pieper|Pieper|CB|5|71|27|de
Julián Malatini|Malatini|CB|31|68|24|ar
Olivier Deman|Deman|LB|2|70|25|be
Senne Lynen|Lynen|DM|14|73|26|be
Jens Stage|Stage|CM|6|77|28|dk
Romano Schmid|Schmid|AM|20|79|25|at
Isak Hansen-Aarøen|Hansen-Aarøen|AM|10|68|21|no
Marco Grüll|Grüll|RW|17|73|27|at
Justin Njinmah|Njinmah|LW|11|73|25|de
Samuel Mbangula|Mbangula|LW|7|71|21|be
Keke Topp|Topp|ST|19|71|21|de
Victor Boniface|Boniface|ST|9|77|24|ng
= heidenheim 2025 4-2-3-1
Diant Ramaj|Ramaj|GK|1|75|24|de
Frank Feller|Feller|GK|41|62|21|de
Marnon Busch|Busch|RB|2|67|30|de
Patrick Mainka|Mainka|CB|6|73|31|de
Benedikt Gimber|Gimber|CB|5|67|28|de
Tim Siersleben|Siersleben|CB|4|64|25|de
Jonas Föhrenbach|Föhrenbach|LB|19|67|29|de
Omar Traoré|O. Traoré|RB|23|64|27|de
Jan Schöppner|Schöppner|CM|3|67|26|de
Lennard Maloney|Maloney|DM|33|67|26|us
Niklas Dorsch|Dorsch|CM|39|64|27|de
Marvin Pieringer|Pieringer|ST|18|67|26|de
Budu Zivzivadze|Zivzivadze|ST|9|64|31|ge
Mathias Honsak|Honsak|LW|21|67|29|at
Arijon Ibrahimović|Ibrahimović|AM|10|67|20|de
Eren Dinkçi|Dinkçi|RW|7|67|24|de
Adrian Beck|Beck|AM|10|64|28|de
Sirlord Conteh|Conteh|LW|11|64|29|de
= koln 2025 4-2-3-1
Marvin Schwäbe|Schwäbe|GK|1|77|30|de
Ron-Robert Zieler|Zieler|GK|20|64|36|de
Kristoffer Lund|Lund|LB|32|70|23|us
Sebastian Sebulonsen|Sebulonsen|RB|2|70|25|no
Timo Hübers|Hübers|CB|4|70|29|de
Cenk Özkacar|Özkacar|CB|3|70|25|tr
Rav van den Berg|R. van den Berg|CB|5|66|21|nl
Eric Martel|Martel|DM|6|73|23|de
Tom Krauß|Krauß|CM|8|70|24|de
Isak Johannesson|Johannesson|CM|17|66|22|is
Denis Huseinbašić|Huseinbašić|CM|29|66|24|de
Florian Kainz|Kainz|AM|11|73|33|at
Jakub Kamiński|Kamiński|LW|16|68|23|pl
Said El Mala|El Mala|LW|13|75|19|de
Linton Maina|Maina|RW|37|70|26|de
Ragnar Ache|Ache|ST|9|73|27|de
Luca Waldschmidt|Waldschmidt|ST|10|68|29|de
= hamburger 2025 4-2-3-1
Daniel Heuer Fernandes|Heuer Fernandes|GK|1|73|32|pt
Sander Tangvik|Tangvik|GK|12|64|23|no
Giorgi Gocholeishvili|Gocholeishvili|RB|2|70|24|ge
William Mikelbrencis|Mikelbrencis|RB|25|68|21|fr
Luka Vušković|Vušković|CB|44|77|18|hr
Daniel Elfadli|Elfadli|CB|8|73|28|de
Jordan Torunarigha|Torunarigha|CB|4|68|27|de
Miro Muheim|Muheim|LB|28|73|27|ch
Nicolai Remberg|Remberg|DM|5|73|25|de
Albert Sambi Lokonga|Sambi Lokonga|CM|6|73|25|be
Jonas Meffert|Meffert|CM|23|68|30|de
Nicolás Capaldo|Capaldo|CM|16|68|26|ar
Fábio Vieira|Fábio Vieira|AM|10|75|25|pt
Jean-Luc Dompé|Dompé|LW|19|73|30|fr
Ransford Königsdörffer|Königsdörffer|ST|11|73|24|gh
Rayan Philippe|Philippe|ST|9|71|25|fr
Robert Glatzel|Glatzel|ST|9|68|31|de
Bakéry Jatta|Jatta|RW|18|70|27|gm
= pauli 2025 3-4-2-1
Nikola Vasilj|Vasilj|GK|22|77|29|ba
Ben Voll|Voll|GK|1|64|24|de
Hauke Wahl|Wahl|CB|5|73|31|de
Eric Smith|Eric Smith|CB|8|73|28|se
Karol Mets|Mets|CB|3|68|32|ee
Adam Dźwigała|Dźwigała|CB|25|66|29|pl
Manolis Saliakas|Saliakas|RB|2|70|29|gr
Lars Ritzka|Ritzka|LB|21|70|27|de
Jackson Irvine|Irvine|CM|7|73|32|au
Joel Chima Fujita|Fujita|CM|16|73|23|jp
Connor Metcalfe|Metcalfe|CM|24|67|26|au
James Sands|Sands|DM|6|70|25|us
Danel Sinani|Sinani|AM|10|73|28|lu
Louis Oppie|Oppie|AM|19|66|23|de
Andréas Hountondji|Hountondji|ST|9|73|23|bj
Mathias Pereira Lage|Pereira Lage|AM|11|71|28|fr
Martijn Kaars|Kaars|ST|14|68|26|nl
Oladapo Afolayan|Afolayan|RW|17|73|28|en
// FIM ATUAIS
// ======================================================== históricos
= bayern 1973 4-3-3
Sepp Maier|Maier|GK|1|87|29|de
Manfred Seifert|Seifert|GK|12|67|24|de
Johnny Hansen|Hansen|RB|2|77|30|dk
Franz Beckenbauer|Beckenbauer|CB|5|91|28|de
Georg Schwarzenbeck|Schwarzenbeck|CB|4|81|25|de
Paul Breitner|Breitner|LB|3|87|22|de
Franz Roth|Roth|DM|6|79|27|de
Rainer Zobel|Zobel|CM|8|77|25|de
Uli Hoeneß|Hoeneß|CM|14|84|21|de
Jupp Kapellmann|Kapellmann|CM|7|79|24|de
Conny Torstensson|Torstensson|RW|11|79|24|se
Bernd Dürnberger|Dürnberger|LW|16|75|20|de
Gerd Müller|Gerd Müller|ST|9|91|28|de
Klaus Wunder|Wunder|ST|17|75|23|de
Wilhelm Hoffmann|Hoffmann|CB|13|72|23|de
Viggo Jensen|Jensen|RB|15|72|25|dk
Edgar Schneider|Schneider|ST|18|72|24|de
Sepp Weiß|Weiß|CM|19|69|21|de
= bayern 2019 4-2-3-1
Manuel Neuer|Neuer|GK|1|88|34|de
Sven Ulreich|Ulreich|GK|26|75|31|de
Joshua Kimmich|Kimmich|DM|32|88|25|de
Benjamin Pavard|Pavard|RB|5|81|24|fr
Jérôme Boateng|Boateng|CB|17|81|31|de
David Alaba|Alaba|CB|27|86|28|at
Niklas Süle|Süle|CB|4|81|24|de
Lucas Hernández|L. Hernández|CB|21|81|24|fr
Alphonso Davies|Davies|LB|19|84|19|ca
Leon Goretzka|Goretzka|CM|18|84|25|de
Thiago Alcântara|Thiago|CM|6|87|29|es
Corentin Tolisso|Tolisso|CM|24|77|25|fr
Javi Martínez|Javi Martínez|DM|8|75|31|es
Thomas Müller|Müller|AM|25|87|30|de
Philippe Coutinho|Coutinho|AM|10|81|28|br
Serge Gnabry|Gnabry|RW|22|86|25|de
Kingsley Coman|Coman|LW|29|84|24|fr
Ivan Perišić|Perišić|LW|14|81|31|hr
Robert Lewandowski|Lewandowski|ST|9|91|31|pl
Joshua Zirkzee|Zirkzee|ST|39|65|19|nl
= dortmund 1996 3-5-2
Stefan Klos|Klos|GK|1|81|25|de
Wolfgang de Beer|De Beer|GK|12|67|33|de
Matthias Sammer|Sammer|CB|6|89|29|de
Jürgen Kohler|Kohler|CB|4|84|31|de
Martin Kree|Kree|CB|5|77|31|de
Wolfgang Feiersinger|Feiersinger|CB|14|77|31|at
Stefan Reuter|Reuter|RB|7|83|30|de
Jörg Heinrich|Heinrich|LB|17|81|27|de
Paul Lambert|Lambert|DM|16|81|27|sc
Paulo Sousa|Paulo Sousa|CM|8|84|26|pt
Steffen Freund|Freund|CM|19|79|26|de
Michael Zorc|Zorc|CM|18|79|34|de
Andreas Möller|Möller|AM|10|87|29|de
Lars Ricken|Ricken|AM|11|81|20|de
René Tretschok|Tretschok|CM|20|73|28|de
Karl-Heinz Riedle|Riedle|ST|13|83|31|de
Stéphane Chapuisat|Chapuisat|ST|9|84|27|ch
Heiko Herrlich|Herrlich|ST|23|81|25|de
Júlio César|Júlio César|CB|3|77|33|br
= dortmund 2012 4-2-3-1
Roman Weidenfeller|Weidenfeller|GK|1|83|32|de
Mitchell Langerak|Langerak|GK|20|73|24|au
Łukasz Piszczek|Piszczek|RB|26|84|27|pl
Mats Hummels|Hummels|CB|15|87|24|de
Neven Subotić|Subotić|CB|4|83|24|rs
Felipe Santana|Felipe Santana|CB|2|77|26|br
Marcel Schmelzer|Schmelzer|LB|29|81|25|de
Sven Bender|S. Bender|DM|6|83|24|de
İlkay Gündoğan|Gündoğan|CM|8|85|22|de
Sebastian Kehl|Kehl|DM|5|77|33|de
Nuri Şahin|Şahin|CM|18|79|24|tr
Moritz Leitner|Leitner|CM|7|73|20|de
Mario Götze|Götze|AM|10|86|20|de
Jakub Błaszczykowski|Błaszczykowski|RW|16|83|27|pl
Kevin Großkreutz|Großkreutz|RW|19|79|24|de
Marco Reus|Reus|LW|11|87|24|de
Robert Lewandowski|Lewandowski|ST|9|87|24|pl
Julian Schieber|Schieber|ST|23|73|24|de
Patrick Owomoyela|Owomoyela|RB|25|70|33|de
= leverkusen 2001 4-4-2
Hans-Jörg Butt|Butt|GK|1|83|27|de
Frank Juric|Juric|GK|12|70|28|au
Zoltán Sebescen|Sebescen|RB|2|75|26|de
Lúcio|Lúcio|CB|3|84|23|br
Jens Nowotny|Nowotny|CB|4|83|28|de
Boris Živković|Živković|CB|6|77|26|hr
Diego Placente|Placente|LB|5|79|24|ar
Carsten Ramelow|Ramelow|DM|28|81|27|de
Michael Ballack|Ballack|CM|13|89|25|de
Bernd Schneider|Schneider|RW|25|84|28|de
Yıldıray Baştürk|Baştürk|AM|8|83|23|tr
Zé Roberto|Zé Roberto|LW|11|84|27|br
Oliver Neuville|Neuville|ST|7|83|28|de
Dimitar Berbatov|Berbatov|ST|9|79|20|bg
Ulf Kirsten|Kirsten|ST|9|81|36|de
Thomas Brdarić|Brdarić|ST|19|73|26|de
Jurica Vranješ|Vranješ|CM|17|75|21|hr
Marko Babić|Babić|LW|18|75|20|hr
= leverkusen 2023 3-4-2-1
Lukáš Hrádecký|Hrádecký|GK|1|83|34|fi
Matěj Kovář|Kovář|GK|17|75|23|cz
Jonathan Tah|Tah|CB|4|84|28|de
Edmond Tapsoba|Tapsoba|CB|12|81|25|bf
Piero Hincapié|Hincapié|CB|3|80|22|ec
Odilon Kossounou|Kossounou|CB|6|77|23|ci
Jeremie Frimpong|Frimpong|RB|30|84|23|nl
Josip Stanišić|Stanišić|RB|2|77|24|hr
Álex Grimaldo|Grimaldo|LB|20|86|28|es
Granit Xhaka|Xhaka|DM|34|86|31|ch
Robert Andrich|Andrich|DM|8|81|29|de
Exequiel Palacios|Palacios|CM|25|82|25|ar
Florian Wirtz|Wirtz|AM|10|89|21|de
Jonas Hofmann|Hofmann|AM|7|81|31|de
Amine Adli|Adli|AM|21|77|24|ma
Nathan Tella|Tella|RW|19|77|24|ng
Victor Boniface|Boniface|ST|22|83|23|ng
Patrik Schick|Schick|ST|14|81|28|cz
Borja Iglesias|Borja Iglesias|ST|9|73|31|es
= augsburg 2014 4-2-3-1
Marwin Hitz|Hitz|GK|35|77|27|ch
Alexander Manninger|Manninger|GK|1|70|37|at
Paul Verhaegh|Verhaegh|RB|2|77|31|nl
Ragnar Klavan|Klavan|CB|5|77|29|ee
Jan-Ingwer Callsen-Bracker|Callsen-Bracker|CB|18|73|30|de
Jeffrey Gouweleeuw|Gouweleeuw|CB|6|73|23|nl
Abdul Rahman Baba|Baba|LB|17|77|20|gh
Daniel Baier|Baier|DM|10|79|30|de
Dominik Kohr|Kohr|DM|31|73|20|de
Markus Feulner|Feulner|CM|8|73|32|de
Halil Altıntop|Altıntop|AM|11|77|32|tr
Tobias Werner|Werner|LW|27|77|29|de
Hong Jeong-ho|Hong|CB|20|73|25|kr
Jan Morávek|Morávek|CM|14|73|25|cz
Raúl Bobadilla|Bobadilla|ST|25|77|27|py
Alexander Esswein|Esswein|RW|7|75|24|de
Tim Matavž|Matavž|ST|9|73|25|si
Ji Dong-won|Ji Dong-won|ST|22|73|23|kr
Caiuby|Caiuby|LW|19|73|25|br
= bremen 2003 4-4-2
Andreas Reinke|Reinke|GK|1|81|34|de
Pascal Borel|Borel|GK|12|67|25|de
Paul Stalteri|Stalteri|RB|2|79|26|ca
Valérien Ismaël|Ismaël|CB|5|83|28|fr
Mladen Krstajić|Krstajić|CB|4|81|29|rs
Christian Schulz|Schulz|CB|3|75|20|de
Ludovic Magnin|Magnin|LB|17|77|24|ch
Frank Baumann|Baumann|DM|6|81|28|de
Fabian Ernst|Ernst|CM|8|81|24|de
Krisztián Lisztes|Lisztes|CM|7|79|27|hu
Tim Borowski|Borowski|CM|24|79|23|de
Johan Micoud|Micoud|AM|10|87|30|fr
Ümit Davala|Davala|RW|16|75|30|tr
Ivan Klasnić|Klasnić|ST|17|81|23|hr
Aílton|Aílton|ST|32|87|30|br
Angelos Charisteas|Charisteas|ST|9|75|23|gr
Nelson Valdez|Valdez|ST|19|70|19|py
Holger Wehlage|Wehlage|CM|20|67|27|de
= eintracht 2021 3-4-2-1
Kevin Trapp|Trapp|GK|1|83|31|de
Diant Ramaj|Ramaj|GK|21|65|20|de
Tuta|Tuta|CB|35|77|22|br
Martin Hinteregger|Hinteregger|CB|13|81|29|at
Evan Ndicka|Ndicka|CB|2|79|22|fr
Almamy Touré|Touré|CB|18|73|25|ml
Ansgar Knauff|Knauff|RB|36|77|20|de
Danny da Costa|Da Costa|RB|24|73|28|de
Filip Kostić|Kostić|LB|10|84|29|rs
Christopher Lenz|Lenz|LB|25|73|27|de
Djibril Sow|Sow|CM|8|79|25|ch
Kristijan Jakić|Jakić|DM|6|77|24|hr
Sebastian Rode|Rode|CM|17|77|31|de
Daichi Kamada|Kamada|AM|15|83|25|jp
Jesper Lindstrøm|Lindstrøm|AM|29|79|22|dk
Jens Petter Hauge|Hauge|LW|23|73|22|no
Ajdin Hrustić|Hrustić|AM|20|73|25|au
Rafael Borré|Borré|ST|19|79|26|co
Gonçalo Paciência|Paciência|ST|39|70|27|pt
= freiburg 2021 4-4-2
Mark Flekken|Flekken|GK|26|79|28|nl
Benjamin Uphoff|Uphoff|GK|1|65|28|de
Lukas Kübler|Kübler|RB|17|75|29|de
Nico Schlotterbeck|Schlotterbeck|CB|4|83|22|de
Philipp Lienhart|Lienhart|CB|3|79|25|at
Manuel Gulde|Gulde|CB|5|73|30|de
Kiliann Sildillia|Sildillia|RB|25|73|19|fr
Christian Günter|Günter|LB|30|79|29|de
Nicolas Höfler|Höfler|DM|27|77|31|de
Maximilian Eggestein|Eggestein|CM|8|77|25|de
Yannik Keitel|Keitel|CM|14|70|21|de
Janik Haberer|Haberer|CM|19|73|27|de
Vincenzo Grifo|Grifo|LW|32|81|28|it
Roland Sallai|Sallai|RW|22|79|24|hu
Woo-yeong Jeong|Jeong|RW|29|73|22|kr
Lucas Höler|Höler|ST|9|77|27|de
Nils Petersen|Petersen|ST|18|75|33|de
Michael Gregoritsch|Gregoritsch|ST|38|75|27|at
Ermedin Demirović|Demirović|ST|11|75|23|ba
= gladbach 1976 4-3-3
Wolfgang Kleff|Kleff|GK|1|81|30|de
Wolfgang Kneib|Kneib|GK|12|67|24|de
Berti Vogts|Vogts|RB|2|85|29|de
Hans-Jürgen Wittkamp|Wittkamp|CB|4|79|29|de
Uli Stielike|Stielike|CB|5|84|21|de
Hans Klinkhammer|Klinkhammer|LB|3|75|23|de
Frank Schäffer|Schäffer|CB|13|73|22|de
Rainer Bonhof|Bonhof|CM|8|86|24|de
Herbert Wimmer|Wimmer|CM|6|79|31|de
Christian Kulik|Kulik|CM|14|75|23|de
Dietmar Danner|Danner|AM|10|79|25|de
Horst Köppel|Köppel|RW|7|75|28|de
Allan Simonsen|Simonsen|LW|11|90|24|dk
Jupp Heynckes|Heynckes|ST|9|84|31|de
Henning Jensen|Jensen|ST|18|81|27|dk
Wilfried Hannes|Hannes|CB|15|73|19|de
Ewald Lienen|Lienen|LW|17|77|22|de
Kalle Del'Haye|Del'Haye|RW|19|73|20|de
= hamburger 1982 4-4-2
Uli Stein|Stein|GK|1|83|28|de
Uwe Hain|Hain|GK|12|65|30|de
Manfred Kaltz|Kaltz|RB|2|86|29|de
Holger Hieronymus|Hieronymus|CB|5|79|23|de
Ditmar Jakobs|Jakobs|CB|4|81|29|de
Bernd Wehmeyer|Wehmeyer|LB|3|75|30|de
Jürgen Groh|Groh|DM|6|77|26|de
Wolfgang Rolff|Rolff|CM|8|79|23|de
Felix Magath|Magath|AM|10|86|29|de
Jürgen Milewski|Milewski|RW|7|81|25|de
Lars Bastrup|Bastrup|LW|11|81|27|dk
Horst Hrubesch|Hrubesch|ST|9|86|31|de
Thomas von Heesen|Von Heesen|CM|14|75|21|de
Caspar Memering|Memering|CM|16|75|29|de
William Hartwig|Hartwig|ST|17|75|28|de
Wolfgang Schröder|Schröder|ST|18|70|23|de
Dietmar Beiersdorfer|Beiersdorfer|CB|15|70|19|de
= heidenheim 2023 4-2-3-1
Kevin Müller|K. Müller|GK|1|77|32|de
Vitus Eicher|Eicher|GK|12|65|33|de
Marnon Busch|Busch|RB|2|73|29|de
Patrick Mainka|Mainka|CB|6|75|29|de
Benedikt Gimber|Gimber|CB|5|73|26|de
Tim Siersleben|Siersleben|CB|4|70|23|de
Jonas Föhrenbach|Föhrenbach|LB|19|73|27|de
Omar Traoré|O. Traoré|RB|23|70|25|de
Lennard Maloney|Maloney|DM|33|73|24|us
Jan Schöppner|Schöppner|CM|3|73|24|de
Norman Theuerkauf|Theuerkauf|CM|30|70|36|de
Adrian Beck|Beck|AM|10|73|26|de
Jan-Niklas Beste|Beste|LW|37|79|25|de
Eren Dinkçi|Dinkçi|RW|7|77|22|de
Kevin Sessa|Sessa|AM|16|73|23|de
Tim Kleindienst|Kleindienst|ST|11|79|28|de
Marvin Pieringer|Pieringer|ST|18|73|24|de
Nikola Dovedan|Dovedan|ST|9|67|29|at
= hoffenheim 2017 3-5-2
Oliver Baumann|Baumann|GK|1|81|27|de
Alexander Stolz|Stolz|GK|12|65|34|de
Kevin Vogt|Vogt|CB|22|79|26|de
Benjamin Hübner|Hübner|CB|21|77|28|de
Kevin Akpoguma|Akpoguma|CB|25|75|22|de
Havard Nordtveit|Nordtveit|CB|4|73|27|no
Pavel Kadeřábek|Kadeřábek|RB|3|79|25|cz
Nico Schulz|Schulz|LB|16|79|24|de
Steven Zuber|Zuber|LW|17|79|26|ch
Kerem Demirbay|Demirbay|CM|10|83|24|de
Florian Grillitsch|Grillitsch|DM|11|77|22|at
Nadiem Amiri|Amiri|AM|18|77|21|de
Dennis Geiger|Geiger|CM|8|73|19|de
Andrej Kramarić|Kramarić|ST|27|84|26|hr
Serge Gnabry|Gnabry|RW|29|83|22|de
Mark Uth|Uth|ST|9|81|26|de
Sandro Wagner|Wagner|ST|14|77|30|de
Ádám Szalai|Szalai|ST|28|73|29|hu
Stefan Posch|Posch|CB|38|67|20|at
= koln 1977 4-4-2
Harald Schumacher|Schumacher|GK|1|83|23|de
Herbert Zimmermann|Zimmermann|RB|2|79|23|de
Harald Konopka|Konopka|LB|3|77|25|de
Gerd Strack|Strack|CB|4|77|22|de
Roland Gerber|Gerber|CB|5|75|24|de
Herbert Neumann|Neumann|CM|8|79|24|de
Heinz Flohe|Flohe|AM|10|86|29|de
Bernd Cullmann|Cullmann|CB|6|79|28|de
Roger van Gool|Van Gool|RW|7|81|27|be
Dieter Müller|D. Müller|ST|9|86|23|de
Yasuhiko Okudera|Okudera|LW|11|79|25|jp
Dieter Prestin|Prestin|LB|13|73|21|de
Holger Willmer|Willmer|LW|17|73|19|de
Jürgen Glowacz|Glowacz|CM|14|73|25|de
Preben Elkjær|Elkjær|ST|18|73|20|dk
Hans Simmet|Simmet|CM|16|70|25|de
Gerhard Welz|Welz|GK|12|65|28|de
= leipzig 2016 4-2-2-2
Péter Gulácsi|Gulácsi|GK|1|81|26|hu
Fabio Coltorti|Coltorti|GK|21|67|36|ch
Lukas Klostermann|Klostermann|RB|16|77|20|de
Benno Schmitz|Schmitz|RB|3|73|22|de
Willi Orbán|Orbán|CB|4|79|24|hu
Marvin Compper|Compper|CB|19|77|31|de
Dayot Upamecano|Upamecano|CB|17|77|18|fr
Bernardo|Bernardo|CB|5|75|21|br
Marcel Halstenberg|Halstenberg|LB|23|79|25|de
Naby Keïta|Keïta|CM|8|86|22|gn
Diego Demme|Demme|DM|31|79|25|de
Stefan Ilsanker|Ilsanker|DM|13|75|27|at
Kevin Kampl|Kampl|CM|44|79|26|si
Emil Forsberg|Forsberg|AM|10|86|25|se
Marcel Sabitzer|Sabitzer|AM|7|83|23|at
Timo Werner|Werner|ST|11|86|21|de
Yussuf Poulsen|Poulsen|ST|9|79|23|dk
Oliver Burke|Burke|RW|14|73|20|sc
Davie Selke|Selke|ST|27|75|22|de
= mainz 2010 4-3-1-2
Heinz Müller|H. Müller|GK|33|77|32|de
Christian Wetklo|Wetklo|GK|1|65|31|de
Zdeněk Pospěch|Pospěch|RB|2|73|32|cz
Bo Svensson|Svensson|CB|4|75|31|dk
Nikolče Noveski|Noveski|CB|5|75|31|mk
Jan Kirchhoff|Kirchhoff|CB|20|73|20|de
Radoslav Zabavník|Zabavník|LB|3|70|30|sk
Eugen Polanski|Polanski|DM|6|75|24|pl
Marco Caligiuri|Caligiuri|CM|8|73|26|de
Elkin Soto|Soto|CM|10|77|30|co
Lewis Holtby|Holtby|AM|14|81|20|de
Andreas Ivanschitz|Ivanschitz|AM|21|77|26|at
André Schürrle|Schürrle|LW|9|83|19|de
Ádám Szalai|Szalai|ST|28|77|22|hu
Sami Allagui|Allagui|ST|11|77|24|tn
Eric Maxim Choupo-Moting|Choupo-Moting|ST|13|73|21|cm
Malik Fathi|Fathi|LB|17|70|26|de
Niko Bungert|Bungert|CB|26|73|23|de
= pauli 2024 3-4-3
Nikola Vasilj|Vasilj|GK|22|77|28|ba
Sascha Burchert|Burchert|GK|30|64|34|de
Hauke Wahl|Wahl|CB|5|75|30|de
Eric Smith|Eric Smith|CB|8|75|27|se
Karol Mets|Mets|CB|3|73|31|ee
David Nemeth|Nemeth|CB|4|68|23|at
Manolis Saliakas|Saliakas|RB|2|73|28|gr
Philipp Treu|Treu|RB|23|68|23|de
Lars Ritzka|Ritzka|LB|21|70|26|de
Jackson Irvine|Irvine|CM|7|75|31|au
Carlo Boukhalfa|Boukhalfa|CM|11|70|25|de
Connor Metcalfe|Metcalfe|CM|24|68|25|au
Robert Wagner|Wagner|CM|19|68|21|de
Oladapo Afolayan|Afolayan|LW|17|73|27|en
Elias Saad|Saad|LW|26|73|24|tn
Morgan Guilavogui|Guilavogui|ST|9|73|26|fr
Danel Sinani|Sinani|AM|10|71|27|lu
Johannes Eggestein|J. Eggestein|ST|11|68|26|de
Noah Weißhaupt|Weißhaupt|RW|16|66|23|de
= stuttgart 2006 4-4-2
Timo Hildebrand|Hildebrand|GK|1|84|28|de
Raphael Schäfer|Schäfer|GK|12|70|28|de
Ricardo Osorio|Osorio|RB|2|79|26|mx
Fernando Meira|Meira|CB|5|81|29|pt
Matthieu Delpierre|Delpierre|CB|4|79|26|fr
Serdar Taşçı|Taşçı|CB|14|73|19|de
Ludovic Magnin|Magnin|LB|3|79|27|ch
Pável Pardo|Pardo|DM|6|81|30|mx
Thomas Hitzlsperger|Hitzlsperger|CM|11|83|24|de
Sami Khedira|Khedira|CM|28|77|20|de
Roberto Hilbert|Hilbert|RW|7|79|22|de
Antônio da Silva|Da Silva|AM|10|79|28|br
Christian Gentner|Gentner|CM|20|77|21|de
Silvio Meißner|Meißner|CM|8|73|33|de
Mario Gómez|Gómez|ST|33|86|21|de
Cacau|Cacau|ST|18|81|26|de
Ciprian Marica|Marica|ST|9|75|21|ro
Andreas Beck|Beck|RB|32|73|20|de
= union_berlim 2022 3-5-2
Frederik Rønnow|Rønnow|GK|1|81|30|dk
Lennart Grill|Grill|GK|37|65|23|de
Robin Knoche|Knoche|CB|31|79|30|de
Danilho Doekhi|Doekhi|CB|5|77|24|nl
Diogo Leite|Leite|CB|4|75|23|pt
Paul Jaeckel|Jaeckel|CB|3|70|24|de
Christopher Trimmel|Trimmel|RB|28|79|35|at
Josip Juranović|Juranović|RB|18|75|27|hr
Niko Gießelmann|Gießelmann|LB|23|75|30|de
Jérôme Roussillon|Roussillon|LB|19|73|29|fr
Rani Khedira|Khedira|DM|8|79|28|de
Janik Haberer|Haberer|CM|19|75|28|de
Aïssa Laïdouni|Laïdouni|CM|13|75|26|tn
Genki Haraguchi|Haraguchi|AM|24|73|31|jp
Paul Seguin|Seguin|CM|6|73|27|de
Sheraldo Becker|Becker|RW|27|79|27|sr
Kevin Behrens|Behrens|ST|17|77|31|de
Jordan Siebatcheu|Siebatcheu|ST|10|75|26|us
Jamie Leweling|Leweling|RW|20|73|21|de
= wolfsburg 2008 4-4-2
Diego Benaglio|Benaglio|GK|1|81|25|ch
André Lenz|Lenz|GK|12|67|35|de
Sascha Riether|Riether|RB|7|77|25|de
Andrea Barzagli|Barzagli|CB|15|83|27|it
Jan Šimůnek|Šimůnek|CB|4|75|21|cz
Ricardo Costa|Ricardo Costa|CB|3|75|27|pt
Marcel Schäfer|Schäfer|LB|26|79|24|de
Cristian Zaccardo|Zaccardo|RB|2|75|26|it
Josué|Josué|DM|6|79|29|br
Christian Gentner|Gentner|CM|20|79|23|de
Makoto Hasebe|Hasebe|CM|13|77|25|jp
Zvjezdan Misimović|Misimović|AM|10|86|26|ba
Ashkan Dejagah|Dejagah|RW|24|75|22|de
Jacek Krzynówek|Krzynówek|LW|8|73|32|pl
Grafite|Grafite|ST|23|88|30|br
Edin Džeko|Džeko|ST|9|86|23|ba
Marcelinho|Marcelinho|AM|14|75|33|br
Alexander Madlung|Madlung|CB|5|73|26|de
// FIM
`,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
  else (root.DEZ_BRUTO = root.DEZ_BRUTO || []).push(D);
})(typeof window !== 'undefined' ? window : this);
