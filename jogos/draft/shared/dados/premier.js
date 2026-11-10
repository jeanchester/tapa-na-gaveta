// Football Draft: Premier League (2025/26 e históricos)
// Formato: ver shared/dez-dados.js. Notas na escala única (docs/PROMPT_DADOS_REAIS.md, seção 3).
(function (root) {
  'use strict';
  const D = {
    id: 'premier', origem: 'en',
    times: `
arsenal|Arsenal|||ARS|#EF0107|#FFFFFF|png
bournemouth|Bournemouth|||BOU|#DA291C|#111111|png
brentford|Brentford|||BRE|#E30613|#FFFFFF|png
brighton|Brighton|||BHA|#0057B8|#FFFFFF|png
burnley|Burnley|||BUR|#6C1D45|#99D6EA|png
chelsea|Chelsea|||CHE|#034694|#FFFFFF|png
city|Man City|||MCI|#6CABDD|#FFFFFF|png
crystal|Crystal Palace|||CRY|#1B458F|#C4122E|png
everton|Everton|||EVE|#003399|#FFFFFF|png
forest|Nott. Forest|||NFO|#DD0000|#FFFFFF|png
fulham|Fulham|||FUL|#FFFFFF|#111111|png
leeds|Leeds United|||LEE|#FFFFFF|#1D428A|png
liverpool|Liverpool|||LIV|#C8102E|#FFFFFF|png
man_united|Man United|||MUN|#DA291C|#FFFFFF|png
newcastle|Newcastle|||NEW|#241F20|#FFFFFF|png
sunderland|Sunderland|||SUN|#EB172B|#FFFFFF|png
tottenham|Tottenham|||TOT|#FFFFFF|#132257|png
villa|Aston Villa|||AVL|#670E36|#95BFE5|png
west_ham|West Ham|||WHU|#7A263A|#1BB1E7|png
wolves|Wolverhampton|||WOL|#FDB913|#231F20|png`,
    elencos: `
// ======================================================== 2025/26
= arsenal 2025 4-3-3
David Raya|Raya|GK|1|85|30|es
Kepa Arrizabalaga|Kepa|GK|13|78|31|es
Ben White|White|RB|4|81|28|en
Jurriën Timber|Timber|RB|12|84|24|nl
William Saliba|Saliba|CB|2|88|24|fr
Gabriel Magalhães|Gabriel|CB|6|86|27|br
Piero Hincapié|Hincapié|CB|5|81|23|ec
Cristhian Mosquera|Mosquera|CB|3|76|21|es
Riccardo Calafiori|Calafiori|LB|33|81|23|it
Myles Lewis-Skelly|Lewis-Skelly|LB|49|78|19|en
Martín Zubimendi|Zubimendi|DM|36|85|26|es
Christian Nørgaard|Nørgaard|DM|16|75|31|dk
Declan Rice|Rice|CM|41|88|26|en
Mikel Merino|Merino|CM|23|81|29|es
Martin Ødegaard|Ødegaard|AM|8|85|26|no
Eberechi Eze|Eze|AM|10|84|27|en
Ethan Nwaneri|Nwaneri|AM|22|77|18|en
Bukayo Saka|Saka|RW|7|88|24|en
Noni Madueke|Madueke|RW|20|80|23|en
Leandro Trossard|Trossard|LW|19|81|30|be
Gabriel Martinelli|Martinelli|LW|11|81|24|br
Viktor Gyökeres|Gyökeres|ST|14|84|27|se
Kai Havertz|Havertz|ST|29|82|26|de
= liverpool 2025 4-2-3-1
Alisson Becker|Alisson|GK|1|87|32|br
Giorgi Mamardashvili|Mamardashvili|GK|25|79|24|ge
Jeremie Frimpong|Frimpong|RB|30|80|24|nl
Conor Bradley|Bradley|RB|12|78|22|nir
Virgil van Dijk|Van Dijk|CB|4|86|34|nl
Ibrahima Konaté|Konaté|CB|5|81|26|fr
Joe Gomez|Gomez|CB|2|77|28|en
Giovanni Leoni|Leoni|CB|15|73|18|it
Milos Kerkez|Kerkez|LB|6|79|21|hu
Andy Robertson|Robertson|LB|26|79|31|sc
Ryan Gravenberch|Gravenberch|DM|38|84|23|nl
Wataru Endo|Endo|DM|3|75|32|jp
Alexis Mac Allister|Mac Allister|CM|10|84|26|ar
Dominik Szoboszlai|Szoboszlai|CM|8|85|24|hu
Curtis Jones|Jones|CM|17|79|24|en
Florian Wirtz|Wirtz|AM|7|84|22|de
Mohamed Salah|Salah|RW|11|86|33|eg
Federico Chiesa|Chiesa|RW|14|75|27|it
Cody Gakpo|Gakpo|LW|18|83|26|nl
Rio Ngumoha|Ngumoha|LW|73|70|17|en
Alexander Isak|Isak|ST|9|84|25|se
Hugo Ekitiké|Ekitiké|ST|22|81|23|fr
= city 2025 4-2-3-1
Gianluigi Donnarumma|Donnarumma|GK|25|87|26|it
James Trafford|Trafford|GK|1|78|22|en
Matheus Nunes|Matheus Nunes|RB|27|81|26|pt
Rico Lewis|Lewis|RB|82|78|20|en
Rúben Dias|Rúben Dias|CB|3|85|28|pt
Joško Gvardiol|Gvardiol|CB|24|85|23|hr
John Stones|Stones|CB|5|80|31|en
Abdukodir Khusanov|Khusanov|CB|45|77|21|uz
Nathan Aké|Aké|CB|6|79|30|nl
Rayan Aït-Nouri|Aït-Nouri|LB|21|81|24|dz
Nico O'Reilly|O'Reilly|LB|33|80|20|en
Rodri|Rodri|DM|16|86|29|es
Nico González|Nico González|DM|14|80|23|es
Tijjani Reijnders|Reijnders|CM|4|84|27|nl
Mateo Kovačić|Kovačić|CM|8|81|31|hr
Bernardo Silva|Bernardo|AM|20|84|31|pt
Phil Foden|Foden|AM|47|84|25|en
Rayan Cherki|Cherki|AM|10|82|22|fr
Savinho|Savinho|RW|26|79|21|br
Jérémy Doku|Doku|LW|11|84|23|be
Oscar Bobb|Bobb|RW|52|77|22|no
Erling Haaland|Haaland|ST|9|90|25|no
Omar Marmoush|Marmoush|ST|7|82|26|eg
= chelsea 2025 4-2-3-1
Robert Sánchez|Sánchez|GK|1|81|27|es
Filip Jörgensen|Jörgensen|GK|12|75|23|dk
Reece James|Reece James|RB|24|84|25|en
Malo Gusto|Gusto|RB|27|81|22|fr
Levi Colwill|Colwill|CB|6|81|22|en
Trevoh Chalobah|Chalobah|CB|23|81|26|en
Wesley Fofana|Fofana|CB|29|79|24|fr
Benoît Badiashile|Badiashile|CB|5|77|24|fr
Tosin Adarabioyo|Adarabioyo|CB|4|76|27|en
Marc Cucurella|Cucurella|LB|3|84|27|es
Jorrel Hato|Hato|LB|21|80|19|nl
Moisés Caicedo|Caicedo|DM|25|87|23|ec
Roméo Lavia|Lavia|DM|45|80|21|be
Enzo Fernández|Enzo|CM|8|85|24|ar
Andrey Santos|Andrey Santos|CM|17|78|21|br
Cole Palmer|Palmer|AM|10|85|23|en
Estêvão|Estêvão|RW|41|83|18|br
Pedro Neto|Pedro Neto|RW|7|81|25|pt
Alejandro Garnacho|Garnacho|LW|49|80|21|ar
Jamie Gittens|Gittens|LW|11|77|21|en
João Pedro|João Pedro|ST|20|83|24|br
Liam Delap|Delap|ST|9|78|22|en
= man_united 2025 3-4-2-1
Senne Lammens|Lammens|GK|31|79|23|be
Altay Bayındır|Bayındır|GK|1|70|27|tr
Noussair Mazraoui|Mazraoui|RB|3|81|28|ma
Diogo Dalot|Dalot|RB|2|80|26|pt
Matthijs de Ligt|De Ligt|CB|4|81|26|nl
Lisandro Martínez|Lisandro|CB|6|82|27|ar
Leny Yoro|Yoro|CB|15|78|19|fr
Harry Maguire|Maguire|CB|5|78|32|en
Ayden Heaven|Heaven|CB|26|70|19|en
Patrick Dorgu|Dorgu|LB|13|77|21|dk
Luke Shaw|Shaw|LB|23|78|30|en
Casemiro|Casemiro|DM|18|80|33|br
Manuel Ugarte|Ugarte|DM|25|79|24|uy
Kobbie Mainoo|Mainoo|CM|37|78|20|en
Bruno Fernandes|Bruno Fernandes|AM|8|86|31|pt
Matheus Cunha|Cunha|AM|10|84|26|br
Mason Mount|Mount|AM|7|77|26|en
Bryan Mbeumo|Mbeumo|RW|19|84|26|cm
Amad Diallo|Amad|RW|16|81|23|ci
Benjamin Šeško|Šeško|ST|30|81|22|si
Joshua Zirkzee|Zirkzee|ST|11|75|24|nl
= tottenham 2025 4-3-3
Guglielmo Vicario|Vicario|GK|1|81|29|it
Antonín Kinský|Kinský|GK|31|73|22|cz
Pedro Porro|Porro|RB|23|82|26|es
Djed Spence|Spence|RB|24|77|25|en
Cristian Romero|Cuti Romero|CB|17|86|27|ar
Micky van de Ven|Van de Ven|CB|37|84|24|nl
Kevin Danso|Danso|CB|4|81|27|at
Radu Drăgușin|Drăgușin|CB|6|75|23|ro
Destiny Udogie|Udogie|LB|13|79|22|it
Rodrigo Bentancur|Bentancur|DM|30|81|28|uy
João Palhinha|Palhinha|DM|6|81|30|pt
Yves Bissouma|Bissouma|DM|8|77|29|ml
Pape Matar Sarr|Sarr|CM|29|80|23|sn
Lucas Bergvall|Bergvall|CM|15|80|19|se
Archie Gray|Gray|CM|14|76|19|en
Xavi Simons|Simons|AM|7|83|22|nl
James Maddison|Maddison|AM|10|81|28|en
Mohammed Kudus|Kudus|RW|20|83|25|gh
Brennan Johnson|B. Johnson|RW|22|80|24|wal
Mathys Tel|Tel|LW|11|75|20|fr
Randal Kolo Muani|Kolo Muani|ST|39|79|26|fr
Dominic Solanke|Solanke|ST|19|78|28|en
Richarlison|Richarlison|ST|9|77|28|br
= newcastle 2025 4-3-3
Nick Pope|Pope|GK|22|83|33|en
Aaron Ramsdale|Ramsdale|GK|32|77|27|en
Tino Livramento|Livramento|RB|21|80|22|en
Kieran Trippier|Trippier|RB|2|78|35|en
Sven Botman|Botman|CB|4|80|25|nl
Fabian Schär|Schär|CB|5|79|33|ch
Malick Thiaw|Thiaw|CB|12|79|24|de
Dan Burn|Burn|CB|33|77|33|en
Lewis Hall|Hall|LB|3|80|20|en
Sandro Tonali|Tonali|DM|8|84|25|it
Bruno Guimarães|Bruno Guimarães|CM|39|85|27|br
Joelinton|Joelinton|CM|7|81|29|br
Jacob Ramsey|Ramsey|CM|41|75|24|en
Joe Willock|Willock|CM|28|74|26|en
Lewis Miley|Miley|CM|67|73|19|en
Anthony Elanga|Elanga|RW|20|79|23|se
Jacob Murphy|Murphy|RW|23|76|30|en
Anthony Gordon|Gordon|LW|10|82|24|en
Harvey Barnes|Barnes|LW|11|78|27|en
Nick Woltemade|Woltemade|ST|27|82|23|de
Yoane Wissa|Wissa|ST|9|80|28|cd
William Osula|Osula|ST|18|73|22|dk
= villa 2025 4-2-3-1
Emiliano Martínez|Dibu Martínez|GK|23|85|33|ar
Marco Bizot|Bizot|GK|40|75|34|nl
Matty Cash|Cash|RB|2|80|28|pl
Ezri Konsa|Konsa|CB|4|81|27|en
Pau Torres|Pau Torres|CB|14|79|28|es
Tyrone Mings|Mings|CB|5|77|32|en
Victor Lindelöf|Lindelöf|CB|3|75|31|se
Lucas Digne|Digne|LB|12|78|32|fr
Ian Maatsen|Maatsen|LB|22|78|23|nl
Boubacar Kamara|Kamara|DM|44|80|25|fr
Amadou Onana|Onana|DM|24|81|24|be
Youri Tielemans|Tielemans|CM|8|82|28|be
John McGinn|McGinn|CM|7|80|31|sc
Ross Barkley|Barkley|CM|6|75|31|en
Morgan Rogers|Rogers|AM|27|84|23|en
Emiliano Buendía|Buendía|AM|10|77|28|ar
Harvey Elliott|Elliott|AM|9|77|22|en
Jadon Sancho|Sancho|RW|19|77|25|en
Leon Bailey|Bailey|RW|31|77|28|jm
Donyell Malen|Malen|RW|17|80|26|nl
Ollie Watkins|Watkins|ST|11|81|29|en
Evann Guessand|Guessand|ST|29|76|24|ci
= crystal 2025 3-4-2-1
Dean Henderson|Henderson|GK|1|81|28|en
Walter Benítez|Benítez|GK|44|73|32|ar
Daniel Muñoz|Muñoz|RB|2|82|29|co
Nathaniel Clyne|Clyne|RB|17|70|34|en
Marc Guéhi|Guéhi|CB|6|84|25|en
Maxence Lacroix|Lacroix|CB|5|78|25|fr
Chris Richards|Richards|CB|26|78|25|us
Jaydee Canvot|Canvot|CB|23|73|19|fr
Tyrick Mitchell|Mitchell|LB|3|78|26|en
Borna Sosa|Sosa|LB|24|71|27|hr
Adam Wharton|Wharton|CM|20|80|21|en
Jefferson Lerma|Lerma|DM|8|78|30|co
Will Hughes|Hughes|CM|19|73|30|en
Daichi Kamada|Kamada|AM|18|79|29|jp
Justin Devenny|Devenny|AM|55|70|21|nir
Romain Esse|Esse|AM|21|73|20|en
Ismaïla Sarr|Sarr|RW|7|80|27|sn
Yeremy Pino|Pino|RW|10|77|22|es
Jean-Philippe Mateta|Mateta|ST|14|80|28|fr
Eddie Nketiah|Nketiah|ST|9|75|26|en
Jørgen Strand Larsen|Strand Larsen|ST|22|77|25|no
= brighton 2025 4-2-3-1
Bart Verbruggen|Verbruggen|GK|1|81|23|nl
Jason Steele|Steele|GK|23|73|35|en
Joël Veltman|Veltman|RB|34|75|33|nl
Mats Wieffer|Wieffer|RB|27|76|26|nl
Jan Paul van Hecke|Van Hecke|CB|29|80|25|nl
Lewis Dunk|Dunk|CB|5|77|34|en
Adam Webster|Webster|CB|4|74|30|en
Olivier Boscagli|Boscagli|CB|21|73|28|fr
Ferdi Kadıoğlu|Kadıoğlu|LB|24|80|26|tr
Maxim De Cuyper|De Cuyper|LB|29|78|24|be
Carlos Baleba|Baleba|DM|17|82|21|cm
Diego Gómez|Diego Gómez|CM|8|79|22|py
Yasin Ayari|Ayari|CM|26|73|22|se
Jack Hinshelwood|Hinshelwood|CM|13|75|20|en
James Milner|Milner|CM|20|68|39|en
Georginho Rutter|Rutter|AM|10|77|23|fr
Yankuba Minteh|Minteh|RW|11|77|21|gm
Solly March|March|RW|7|75|31|en
Kaoru Mitoma|Mitoma|LW|22|80|28|jp
Danny Welbeck|Welbeck|ST|18|76|34|en
Stefanos Tzimas|Tzimas|ST|19|73|19|gr
Charalampos Kostoulas|Kostoulas|ST|9|71|18|gr
= bournemouth 2025 4-2-3-1
Đorđe Petrović|Petrović|GK|1|78|26|rs
Will Dennis|Dennis|GK|40|65|25|en
Adam Smith|A. Smith|RB|15|73|34|en
Álex Jiménez|Jiménez|RB|20|74|20|es
Marcos Senesi|Senesi|CB|5|79|28|ar
Bafodé Diakité|Diakité|CB|18|75|24|fr
James Hill|Hill|CB|23|71|23|en
Adrien Truffert|Truffert|LB|3|77|23|fr
Tyler Adams|Adams|DM|12|79|26|us
Alex Scott|Scott|CM|8|78|22|en
Lewis Cook|Cook|DM|4|75|28|en
Ryan Christie|Christie|CM|10|75|30|sc
Marcus Tavernier|Tavernier|AM|16|78|26|en
Justin Kluivert|Kluivert|AM|19|79|26|nl
Antoine Semenyo|Semenyo|RW|24|84|25|gh
David Brooks|Brooks|RW|7|75|28|wal
Amine Adli|Adli|LW|21|75|25|ma
Evanilson|Evanilson|ST|9|78|26|br
Eli Junior Kroupi|Kroupi|ST|22|77|19|fr
Enes Ünal|Ünal|ST|26|70|28|tr
= brentford 2025 4-2-3-1
Caoimhín Kelleher|Kelleher|GK|1|79|27|ie
Hákon Valdimarsson|Valdimarsson|GK|12|63|24|is
Michael Kayode|Kayode|RB|33|75|21|it
Aaron Hickey|Hickey|RB|2|75|23|sc
Kristoffer Ajer|Ajer|CB|20|75|27|no
Nathan Collins|Collins|CB|22|76|24|ie
Sepp van den Berg|Van den Berg|CB|4|76|23|nl
Ethan Pinnock|Pinnock|CB|5|73|32|jm
Rico Henry|Henry|LB|3|70|28|en
Jordan Henderson|Henderson|CM|6|75|35|en
Mathias Jensen|Jensen|CM|8|75|29|dk
Vitaly Janelt|Janelt|DM|27|73|27|de
Yehor Yarmolyuk|Yarmolyuk|CM|18|71|21|ua
Mikkel Damsgaard|Damsgaard|AM|24|77|25|dk
Kevin Schade|Schade|LW|7|75|23|de
Dango Ouattara|Ouattara|RW|19|75|23|bf
Keane Lewis-Potter|Lewis-Potter|LW|23|70|24|en
Igor Thiago|Igor Thiago|ST|9|81|24|br
Fábio Carvalho|Carvalho|ST|14|70|23|pt
= everton 2025 4-2-3-1
Jordan Pickford|Pickford|GK|1|84|31|en
Mark Travers|Travers|GK|12|70|26|ie
Jake O'Brien|O'Brien|RB|15|75|24|ie
Nathan Patterson|Patterson|RB|2|70|24|sc
Seamus Coleman|Coleman|RB|23|66|37|ie
James Tarkowski|Tarkowski|CB|6|78|32|en
Jarrad Branthwaite|Branthwaite|CB|32|78|23|en
Michael Keane|Keane|CB|5|75|32|en
Vitaliy Mykolenko|Mykolenko|LB|16|76|26|ua
Idrissa Gana Gueye|Gana Gueye|DM|27|75|35|sn
Tim Iroegbunam|Iroegbunam|DM|42|70|22|en
James Garner|Garner|CM|37|77|24|en
Kiernan Dewsbury-Hall|Dewsbury-Hall|CM|22|76|26|en
Jack Grealish|Grealish|AM|18|80|29|en
Carlos Alcaraz|Alcaraz|AM|24|73|22|ar
Tyler Dibling|Dibling|RW|20|73|19|en
Iliman Ndiaye|Iliman Ndiaye|LW|10|82|25|sn
Dwight McNeil|McNeil|LW|7|75|25|en
Thierno Barry|Barry|ST|11|74|22|fr
Beto|Beto|ST|9|74|27|pt
= fulham 2025 4-2-3-1
Bernd Leno|Leno|GK|1|81|33|de
Benjamin Lecomte|Lecomte|GK|23|67|34|fr
Timothy Castagne|Castagne|RB|21|77|29|be
Kenny Tete|Tete|RB|2|75|29|nl
Joachim Andersen|Andersen|CB|5|78|29|dk
Calvin Bassey|Bassey|CB|3|75|25|ng
Jorge Cuenca|Cuenca|CB|15|73|25|es
Antonee Robinson|Jedi Robinson|LB|33|80|27|us
Ryan Sessegnon|Sessegnon|LB|30|73|25|en
Sander Berge|Berge|DM|16|77|27|no
Saša Lukić|Lukić|CM|20|75|29|rs
Tom Cairney|Cairney|CM|10|71|34|sc
Emile Smith Rowe|Smith Rowe|AM|32|77|25|en
Alex Iwobi|Iwobi|AM|17|78|29|ng
Josh King|King|AM|24|71|18|en
Harry Wilson|Wilson|RW|8|76|28|wal
Samuel Chukwueze|Chukwueze|RW|11|75|26|ng
Adama Traoré|Traoré|RW|11|74|29|es
Kevin|Kevin|LW|7|73|22|br
Raúl Jiménez|Raúl Jiménez|ST|7|76|34|mx
Rodrigo Muniz|Muniz|ST|9|73|24|br
= forest 2025 4-2-3-1
Matz Sels|Sels|GK|26|80|33|be
John Victor|John Victor|GK|13|73|29|br
Ola Aina|Aina|RB|34|77|29|ng
Nicolò Savona|Savona|RB|37|73|22|it
Murillo|Murillo|CB|5|81|23|br
Nikola Milenković|Milenković|CB|31|80|28|rs
Morato|Morato|CB|4|73|24|br
Neco Williams|N. Williams|LB|3|75|24|wal
Elliot Anderson|Anderson|CM|8|84|23|en
Ibrahim Sangaré|Sangaré|DM|6|77|28|ci
Nicolás Domínguez|Domínguez|CM|16|75|27|ar
Morgan Gibbs-White|Gibbs-White|AM|10|82|25|en
James McAtee|McAtee|AM|24|75|23|en
Dan Ndoye|Ndoye|RW|14|79|25|ch
Omari Hutchinson|Hutchinson|RW|21|75|22|jm
Callum Hudson-Odoi|Hudson-Odoi|LW|7|77|25|en
Arnaud Kalimuendo|Kalimuendo|ST|15|75|23|fr
Chris Wood|Wood|ST|11|81|33|nz
Igor Jesus|Igor Jesus|ST|19|75|24|br
Taiwo Awoniyi|Awoniyi|ST|9|70|28|ng
= west_ham 2025 4-2-3-1
Alphonse Areola|Areola|GK|23|77|32|fr
Mads Hermansen|Hermansen|GK|1|75|25|dk
Aaron Wan-Bissaka|Wan-Bissaka|RB|29|79|27|cd
Kyle Walker-Peters|Walker-Peters|RB|2|75|28|en
Max Kilman|Kilman|CB|3|77|28|en
Jean-Clair Todibo|Todibo|CB|25|76|25|fr
Konstantinos Mavropanos|Mavropanos|CB|15|75|27|gr
El Hadji Malick Diouf|M. Diouf|LB|12|76|20|sn
Tomáš Souček|Souček|CM|28|79|30|cz
Guido Rodríguez|G. Rodríguez|DM|24|75|31|ar
James Ward-Prowse|Ward-Prowse|CM|7|75|30|en
Mateus Fernandes|M. Fernandes|CM|18|75|21|pt
Lucas Paquetá|Paquetá|AM|10|81|28|br
Jarrod Bowen|Bowen|RW|20|81|28|en
Crysencio Summerville|Summerville|LW|7|77|23|nl
Callum Wilson|Wilson|ST|9|77|33|en
Niclas Füllkrug|Füllkrug|ST|11|75|32|de
Soungoutou Magassa|Magassa|DM|27|71|22|fr
= leeds 2025 4-3-3
Lucas Perri|Perri|GK|1|75|28|br
Karl Darlow|Darlow|GK|26|65|35|wal
Jayden Bogle|Bogle|RB|2|73|25|en
Joe Rodon|Rodon|CB|6|74|27|wal
Pascal Struijk|Struijk|CB|21|74|26|nl
Jaka Bijol|Bijol|CB|15|80|26|si
Gabriel Gudmundsson|Gudmundsson|LB|3|75|26|se
Sam Byram|Byram|LB|25|65|32|en
Ethan Ampadu|Ampadu|DM|4|76|25|wal
Anton Stach|Stach|CM|18|78|27|de
Ao Tanaka|Ao Tanaka|CM|22|77|27|jp
Ilia Gruev|Gruev|CM|44|70|25|bg
Sean Longstaff|Longstaff|CM|8|70|28|en
Brenden Aaronson|Aaronson|AM|11|74|25|us
Daniel James|James|RW|7|74|28|wal
Wilfried Gnonto|Gnonto|RW|29|73|22|it
Noah Okafor|Okafor|LW|19|76|25|ch
Dominic Calvert-Lewin|Calvert-Lewin|ST|9|74|28|en
Lukas Nmecha|Nmecha|ST|14|71|26|de
Joël Piroe|Piroe|ST|10|70|26|nl
= burnley 2025 4-2-3-1
Martin Dúbravka|Dúbravka|GK|1|75|36|sk
Max Weiß|Weiß|GK|12|63|21|de
Kyle Walker|Walker|RB|2|78|35|en
Oliver Sonne|Sonne|RB|21|64|24|pe
Maxime Estève|Estève|CB|5|73|23|fr
Axel Tuanzebe|Tuanzebe|CB|6|70|27|cd
Hjalmar Ekdal|Ekdal|CB|18|63|27|se
Joe Worrall|Worrall|CB|4|65|28|en
Quilindschy Hartman|Hartman|LB|3|70|24|nl
Lucas Pires|Lucas Pires|LB|23|66|24|br
Florentino Luís|Florentino|DM|16|75|26|pt
Lesley Ugochukwu|Ugochukwu|DM|8|73|21|fr
Josh Cullen|Cullen|CM|24|73|29|ie
Josh Laurent|Laurent|CM|29|67|30|en
Hannibal Mejbri|Hannibal|CM|28|73|22|tn
Loum Tchaouna|Tchaouna|RW|11|67|22|fr
Marcus Edwards|Edwards|RW|10|67|27|en
Jaidon Anthony|Anthony|LW|7|75|26|en
Lyle Foster|Foster|ST|9|73|25|za
Zeki Amdouni|Amdouni|ST|25|74|24|ch
Armando Broja|Broja|ST|27|70|24|al
Zian Flemming|Flemming|ST|19|70|27|nl
= sunderland 2025 4-2-3-1
Robin Roefs|Roefs|GK|22|76|22|nl
Anthony Patterson|Patterson|GK|1|67|25|en
Nordi Mukiele|Mukiele|RB|20|76|27|fr
Trai Hume|Hume|RB|32|73|23|nir
Lutsharel Geertruida|Geertruida|CB|5|75|25|nl
Omar Alderete|Alderete|CB|15|77|28|py
Dan Ballard|Ballard|CB|5|73|26|nir
Reinildo Mandava|Reinildo|LB|17|75|31|mz
Granit Xhaka|Xhaka|DM|34|83|33|ch
Noah Sadiki|Sadiki|DM|27|71|20|cd
Habib Diarra|Diarra|CM|19|77|21|sn
Enzo Le Fée|Le Fée|CM|28|75|25|fr
Chris Rigg|Rigg|CM|11|70|18|en
Chemsdine Talbi|Talbi|RW|7|73|20|ma
Simon Adingra|Adingra|LW|24|75|23|ci
Nilson Angulo|Angulo|LW|10|73|22|ec
Bertrand Traoré|B. Traoré|RW|25|73|30|bf
Wilson Isidor|Isidor|ST|18|77|25|fr
Brian Brobbey|Brobbey|ST|9|75|23|nl
Eliezer Mayenda|Mayenda|ST|12|70|20|es
= wolves 2025 3-4-2-1
José Sá|José Sá|GK|1|79|32|pt
Sam Johnstone|Johnstone|GK|31|73|32|en
Matt Doherty|Doherty|RB|2|73|33|ie
Jackson Tchatchoua|Tchatchoua|RB|38|73|24|cm
Ladislav Krejčí|Krejčí|CB|37|77|26|cz
Emmanuel Agbadou|Agbadou|CB|18|75|28|ci
Santiago Bueno|Santi Bueno|CB|4|73|26|uy
Toti Gomes|Toti|CB|24|73|26|pt
Yerson Mosquera|Mosquera|CB|14|73|24|co
Hugo Bueno|H. Bueno|LB|3|73|22|es
André|André|DM|7|77|24|br
João Gomes|João Gomes|CM|8|78|24|br
Marshall Munetsi|Munetsi|CM|5|73|29|zw
Jean-Ricner Bellegarde|Bellegarde|AM|27|75|27|ht
Fer López|Fer López|AM|10|73|21|es
Jhon Arias|Jhon Arias|RW|11|80|28|co
Hwang Hee-chan|Hwang Hee-chan|RW|11|74|29|kr
Mateus Mané|Mateus Mané|RW|36|70|18|pt
Jørgen Strand Larsen|Strand Larsen|ST|9|77|25|no
Tolu Arokodare|Arokodare|ST|19|70|25|ng
// FIM ATUAIS
// ======================================================== históricos
= arsenal 1988 4-4-2
John Lukic|Lukic|GK|1|79|28|en
Alan Miller|Miller|GK|13|65|19|en
Lee Dixon|Dixon|RB|2|81|25|en
David O'Leary|O'Leary|CB|5|79|30|ie
Tony Adams|Adams|CB|6|84|22|en
Steve Bould|Bould|CB|12|79|26|en
Gus Caesar|Caesar|CB|14|67|22|en
Nigel Winterburn|Winterburn|LB|3|80|25|en
Michael Thomas|Thomas|CM|4|79|21|en
Paul Davis|Davis|CM|8|77|27|en
Kevin Richardson|Richardson|CM|10|77|26|en
David Rocastle|Rocastle|RW|7|84|21|en
Paul Merson|Merson|AM|11|81|20|en
Brian Marwood|Marwood|LW|11|78|28|en
Perry Groves|Groves|LW|17|73|23|en
Alan Smith|Alan Smith|ST|9|84|26|en
Martin Hayes|Hayes|ST|10|73|22|en
Niall Quinn|Quinn|ST|16|70|22|ie
= arsenal 2003 4-4-2
Jens Lehmann|Lehmann|GK|1|84|34|de
Graham Stack|Stack|GK|13|65|22|ie
Lauren|Lauren|RB|12|81|26|cm
Sol Campbell|Campbell|CB|23|86|29|en
Kolo Touré|Kolo Touré|CB|28|83|22|ci
Martin Keown|Keown|CB|5|79|37|en
Pascal Cygan|Cygan|CB|18|75|29|fr
Ashley Cole|A. Cole|LB|3|85|22|en
Gaël Clichy|Clichy|LB|22|73|18|fr
Patrick Vieira|Vieira|CM|4|89|27|fr
Gilberto Silva|Gilberto Silva|DM|19|83|27|br
Edu|Edu|CM|17|78|25|br
Ray Parlour|Parlour|CM|15|77|30|en
Freddie Ljungberg|Ljungberg|RW|8|83|26|se
Robert Pirès|Pirès|LW|7|87|30|fr
José Antonio Reyes|Reyes|LW|9|79|20|es
Dennis Bergkamp|Bergkamp|ST|10|86|34|nl
Thierry Henry|Henry|ST|14|91|26|fr
Sylvain Wiltord|Wiltord|ST|11|79|29|fr
Kanu|Kanu|ST|25|75|27|ng
= man_united 1998 4-4-2
Peter Schmeichel|Schmeichel|GK|1|88|35|dk
Raimond van der Gouw|Van der Gouw|GK|17|73|35|nl
Gary Neville|G. Neville|RB|2|83|23|en
Jaap Stam|Stam|CB|6|87|26|nl
Ronny Johnsen|Johnsen|CB|5|81|29|no
Henning Berg|Berg|CB|21|77|29|no
Wes Brown|Brown|CB|24|75|19|en
Denis Irwin|Irwin|LB|3|83|33|ie
Phil Neville|P. Neville|LB|12|75|21|en
Roy Keane|Keane|CM|16|88|27|ie
Paul Scholes|Scholes|CM|18|86|23|en
Nicky Butt|Butt|CM|8|79|23|en
David Beckham|Beckham|RW|7|87|23|en
Ryan Giggs|Giggs|LW|11|86|25|wal
Jesper Blomqvist|Blomqvist|LW|15|75|24|se
Dwight Yorke|Yorke|ST|19|86|26|tt
Andy Cole|Cole|ST|9|85|27|en
Teddy Sheringham|Sheringham|ST|10|81|32|en
Ole Gunnar Solskjær|Solskjær|ST|20|81|25|no
= man_united 2007 4-4-2
Edwin van der Sar|Van der Sar|GK|1|86|37|nl
Tomasz Kuszczak|Kuszczak|GK|29|73|25|pl
Wes Brown|Brown|RB|6|78|28|en
John O'Shea|O'Shea|RB|22|76|26|ie
Rio Ferdinand|Ferdinand|CB|5|88|29|en
Nemanja Vidić|Vidić|CB|15|87|26|rs
Gerard Piqué|Piqué|CB|3|70|20|es
Patrice Evra|Evra|LB|3|85|26|fr
Michael Carrick|Carrick|CM|16|84|26|en
Paul Scholes|Scholes|CM|18|85|33|en
Owen Hargreaves|Hargreaves|DM|4|81|26|en
Anderson|Anderson|CM|8|78|19|br
Darren Fletcher|Fletcher|CM|24|77|23|sc
Cristiano Ronaldo|C. Ronaldo|RW|7|92|22|pt
Park Ji-sung|Park Ji-sung|RW|13|79|26|kr
Nani|Nani|LW|17|80|20|pt
Ryan Giggs|Giggs|LW|11|81|34|wal
Wayne Rooney|Rooney|ST|10|87|22|en
Carlos Tevez|Tevez|ST|32|86|23|ar
Louis Saha|Saha|ST|9|75|29|fr
= liverpool 1983 4-4-2
Bruce Grobbelaar|Grobbelaar|GK|1|81|26|zw
Bob Bolder|Bolder|GK|12|65|25|en
Phil Neal|Neal|RB|2|83|32|en
Steve Nicol|Nicol|RB|12|73|21|sc
Mark Lawrenson|Lawrenson|CB|4|84|26|ie
Alan Hansen|Hansen|CB|6|86|28|sc
Gary Gillespie|Gillespie|CB|14|73|23|sc
Alan Kennedy|Kennedy|LB|3|79|29|en
Graeme Souness|Souness|CM|11|88|30|sc
Sammy Lee|Lee|CM|5|81|24|en
Ronnie Whelan|Whelan|CM|5|81|22|ie
Craig Johnston|Johnston|RW|10|79|23|au
Kenny Dalglish|Dalglish|AM|7|89|32|sc
Ian Rush|Rush|ST|9|89|22|wal
Michael Robinson|Robinson|ST|8|79|25|ie
David Hodgson|Hodgson|ST|17|67|23|en
John Wark|Wark|CM|15|79|26|sc
Steve McMahon|McMahon|CM|16|70|22|en
= liverpool 2019 4-3-3
Alisson Becker|Alisson|GK|1|88|27|br
Adrián|Adrián|GK|13|73|32|es
Trent Alexander-Arnold|Alexander-Arnold|RB|66|86|21|en
Joe Gomez|Gomez|CB|12|79|22|en
Virgil van Dijk|Van Dijk|CB|4|90|28|nl
Joël Matip|Matip|CB|32|83|28|cm
Dejan Lovren|Lovren|CB|6|77|30|hr
Andy Robertson|Robertson|LB|26|86|25|sc
Fabinho|Fabinho|DM|3|85|26|br
Jordan Henderson|Henderson|CM|14|84|29|en
Georginio Wijnaldum|Wijnaldum|CM|5|84|29|nl
James Milner|Milner|CM|7|79|33|en
Naby Keïta|Keïta|CM|8|79|24|gn
Alex Oxlade-Chamberlain|Chamberlain|AM|15|78|26|en
Mohamed Salah|Salah|RW|11|89|27|eg
Xherdan Shaqiri|Shaqiri|RW|23|77|28|ch
Sadio Mané|Mané|LW|10|89|27|sn
Takumi Minamino|Minamino|AM|18|75|25|jp
Roberto Firmino|Firmino|ST|9|86|28|br
Divock Origi|Origi|ST|27|75|24|be
= chelsea 2004 4-3-3
Petr Čech|Čech|GK|1|89|22|cz
Carlo Cudicini|Cudicini|GK|23|79|31|it
Paulo Ferreira|Paulo Ferreira|RB|20|81|25|pt
Glen Johnson|Johnson|RB|2|75|20|en
John Terry|Terry|CB|26|88|24|en
Ricardo Carvalho|Carvalho|CB|6|86|26|pt
William Gallas|Gallas|CB|13|83|27|fr
Robert Huth|Huth|CB|29|73|20|de
Wayne Bridge|Bridge|LB|18|79|24|en
Claude Makélélé|Makélélé|DM|4|86|31|fr
Frank Lampard|Lampard|CM|8|89|26|en
Tiago Mendes|Tiago|CM|30|80|23|pt
Alexey Smertin|Smertin|CM|5|75|29|ru
Joe Cole|J. Cole|AM|10|83|23|en
Arjen Robben|Robben|RW|16|87|20|nl
Damien Duff|Duff|LW|11|84|25|ie
Geremi|Geremi|RB|7|75|26|cm
Didier Drogba|Drogba|ST|15|84|26|ci
Eiður Guðjohnsen|Guðjohnsen|ST|22|81|26|is
Mateja Kežman|Kežman|ST|9|77|25|rs
= chelsea 2020 3-4-2-1
Édouard Mendy|Mendy|GK|16|83|28|sn
Kepa Arrizabalaga|Kepa|GK|1|77|26|es
Reece James|Reece James|RB|24|83|21|en
César Azpilicueta|Azpilicueta|CB|28|81|31|es
Antonio Rüdiger|Rüdiger|CB|2|84|28|de
Thiago Silva|Thiago Silva|CB|6|85|36|br
Andreas Christensen|Christensen|CB|4|80|25|dk
Kurt Zouma|Zouma|CB|15|80|26|fr
Ben Chilwell|Chilwell|LB|21|82|24|en
Marcos Alonso|Alonso|LB|3|79|30|es
N'Golo Kanté|Kanté|DM|7|88|30|fr
Jorginho|Jorginho|CM|5|84|29|it
Mateo Kovačić|Kovačić|CM|17|82|27|hr
Mason Mount|Mount|AM|19|84|22|en
Kai Havertz|Havertz|AM|29|83|21|de
Hakim Ziyech|Ziyech|RW|22|81|28|ma
Callum Hudson-Odoi|Hudson-Odoi|RW|20|77|20|en
Christian Pulisic|Pulisic|LW|10|81|22|us
Timo Werner|Werner|ST|11|80|25|de
Olivier Giroud|Giroud|ST|18|79|34|fr
Tammy Abraham|Abraham|ST|9|79|23|en
= city 2011 4-2-3-1
Joe Hart|Hart|GK|25|84|24|en
Costel Pantilimon|Pantilimon|GK|30|67|24|ro
Pablo Zabaleta|Zabaleta|RB|5|81|27|ar
Micah Richards|Richards|RB|2|80|23|en
Vincent Kompany|Kompany|CB|4|87|25|be
Joleon Lescott|Lescott|CB|6|81|29|en
Stefan Savić|Savić|CB|15|73|20|me
Gaël Clichy|Clichy|LB|22|79|26|fr
Aleksandar Kolarov|Kolarov|LB|13|79|26|rs
Gareth Barry|Barry|DM|18|80|30|en
Nigel de Jong|De Jong|DM|34|81|27|nl
Yaya Touré|Yaya Touré|CM|42|88|28|ci
James Milner|Milner|CM|7|80|25|en
David Silva|Silva|AM|21|88|25|es
Samir Nasri|Nasri|AM|19|83|24|fr
Adam Johnson|Johnson|LW|11|77|24|en
Sergio Agüero|Agüero|ST|16|88|23|ar
Edin Džeko|Džeko|ST|10|83|25|ba
Mario Balotelli|Balotelli|ST|45|82|21|it
Carlos Tevez|Tevez|ST|32|83|27|ar
= city 2022 4-3-3
Ederson Moraes|Ederson|GK|31|87|29|br
Stefan Ortega|Ortega|GK|18|77|30|de
Kyle Walker|Walker|RB|2|84|33|en
Rico Lewis|Lewis|RB|82|75|18|en
Rúben Dias|Rúben Dias|CB|3|87|26|pt
John Stones|Stones|CB|5|85|29|en
Manuel Akanji|Akanji|CB|25|84|28|ch
Nathan Aké|Aké|CB|6|83|28|nl
Aymeric Laporte|Laporte|CB|14|81|29|es
Rodri|Rodri|DM|16|89|27|es
Kalvin Phillips|Phillips|DM|4|75|27|en
İlkay Gündoğan|Gündoğan|CM|8|86|32|de
Kevin De Bruyne|De Bruyne|AM|17|90|32|be
Bernardo Silva|Bernardo|AM|20|87|28|pt
Cole Palmer|Palmer|AM|80|73|21|en
Riyad Mahrez|Mahrez|RW|26|84|32|dz
Phil Foden|Foden|LW|47|85|23|en
Jack Grealish|Grealish|LW|10|84|27|en
Erling Haaland|Haaland|ST|9|91|22|no
Julián Álvarez|Julián|ST|19|82|23|ar
= tottenham 2018 4-2-3-1
Hugo Lloris|Lloris|GK|1|85|32|fr
Paulo Gazzaniga|Gazzaniga|GK|22|73|26|ar
Kieran Trippier|Trippier|RB|2|81|28|en
Serge Aurier|Aurier|RB|24|77|26|ci
Toby Alderweireld|Alderweireld|CB|4|85|29|be
Jan Vertonghen|Vertonghen|CB|5|84|31|be
Davinson Sánchez|Davinson|CB|6|81|22|co
Juan Foyth|Foyth|CB|25|73|20|ar
Danny Rose|Rose|LB|3|78|28|en
Ben Davies|Davies|LB|33|77|25|wal
Eric Dier|Dier|DM|15|80|24|en
Victor Wanyama|Wanyama|DM|12|78|27|ke
Moussa Sissoko|Sissoko|CM|17|80|29|fr
Harry Winks|Winks|CM|8|77|22|en
Christian Eriksen|Eriksen|AM|23|87|26|dk
Dele Alli|Alli|AM|20|83|22|en
Lucas Moura|Lucas Moura|RW|27|81|26|br
Erik Lamela|Lamela|RW|11|79|26|ar
Son Heung-min|Son|LW|7|85|26|kr
Harry Kane|Kane|ST|10|89|25|en
Fernando Llorente|Llorente|ST|18|77|33|es
= newcastle 1995 4-4-2
Pavel Srníček|Srníček|GK|1|79|27|cz
Shaka Hislop|Hislop|GK|15|77|26|tt
Warren Barton|Barton|RB|2|77|26|en
Steve Watson|Watson|RB|12|73|21|en
Darren Peacock|Peacock|CB|5|78|27|en
Steve Howey|Howey|CB|6|79|24|en
Philippe Albert|Albert|CB|27|81|27|be
John Beresford|Beresford|LB|3|78|29|en
Robbie Elliott|Elliott|LB|21|73|22|en
David Batty|Batty|DM|4|81|27|en
Rob Lee|Lee|CM|37|83|29|en
Lee Clark|Clark|CM|20|77|23|en
Peter Beardsley|Beardsley|AM|8|84|34|en
Keith Gillespie|Gillespie|RW|7|80|20|nir
Ruel Fox|Fox|RW|11|77|27|en
David Ginola|Ginola|LW|14|86|28|fr
Les Ferdinand|Ferdinand|ST|9|86|29|en
Faustino Asprilla|Asprilla|ST|11|84|26|co
Paul Kitson|Kitson|ST|10|73|24|en
= villa 1981 4-4-2
Jimmy Rimmer|Rimmer|GK|1|79|33|en
Nigel Spink|Spink|GK|12|73|23|en
Kenny Swain|Swain|RB|2|77|29|en
Ken McNaught|McNaught|CB|5|79|26|sc
Allan Evans|Evans|CB|4|79|25|sc
Brendan Ormsby|Ormsby|CB|14|70|21|en
Gary Williams|Williams|LB|3|75|21|en
Colin Gibson|Gibson|LB|15|73|21|en
Dennis Mortimer|Mortimer|CM|6|83|29|en
Des Bremner|Bremner|CM|7|79|29|sc
Gordon Cowans|Cowans|CM|8|83|23|en
Pat Heard|Heard|CM|16|70|21|en
David Geddis|Geddis|ST|17|70|23|en
Tony Morley|Morley|LW|11|83|27|en
Eamonn Deacy|Deacy|LB|13|67|22|ie
Gary Shaw|Shaw|ST|10|83|20|en
Peter Withe|Withe|ST|9|83|30|en
Andy Blair|Blair|CM|18|70|22|sc
= everton 1984 4-4-2
Neville Southall|Southall|GK|1|86|26|wal
Jim Arnold|Arnold|GK|12|65|34|en
Gary Stevens|Stevens|RB|2|83|21|en
Alan Harper|Harper|CB|14|73|24|en
Kevin Ratcliffe|Ratcliffe|CB|6|83|24|wal
Derek Mountfield|Mountfield|CB|5|78|22|en
Pat Van den Hauwe|Van den Hauwe|LB|3|79|24|wal
John Bailey|Bailey|LB|15|73|27|en
Peter Reid|Reid|CM|4|85|28|en
Paul Bracewell|Bracewell|CM|10|81|22|en
Kevin Richardson|Richardson|CM|16|75|21|en
Trevor Steven|Steven|RW|7|83|21|en
Kevin Sheedy|Sheedy|LW|11|83|25|ie
Adrian Heath|Heath|ST|8|81|23|en
Graeme Sharp|Sharp|ST|9|83|24|sc
Andy Gray|Gray|ST|17|80|28|sc
Terry Curran|Curran|RW|18|67|29|en
Ian Atkins|Atkins|CM|19|70|27|en
Paul Wilkinson|Wilkinson|ST|20|70|20|en
= west_ham 2022 4-2-3-1
Alphonse Areola|Areola|GK|23|79|30|fr
Łukasz Fabiański|Fabiański|GK|1|79|38|pl
Vladimír Coufal|Coufal|RB|5|75|30|cz
Thilo Kehrer|Kehrer|RB|24|75|26|de
Kurt Zouma|Zouma|CB|4|78|28|fr
Nayef Aguerd|Aguerd|CB|27|79|27|ma
Craig Dawson|Dawson|CB|15|75|32|en
Angelo Ogbonna|Ogbonna|CB|21|73|35|it
Aaron Cresswell|Cresswell|LB|3|75|33|en
Emerson Palmieri|Emerson|LB|33|75|28|it
Declan Rice|Rice|DM|41|86|24|en
Tomáš Souček|Souček|CM|28|79|28|cz
Flynn Downes|Downes|CM|12|73|24|en
Lucas Paquetá|Paquetá|AM|11|82|25|br
Pablo Fornals|Fornals|AM|8|75|27|es
Manuel Lanzini|Lanzini|AM|10|73|30|ar
Jarrod Bowen|Bowen|RW|20|81|26|en
Saïd Benrahma|Benrahma|LW|22|77|27|dz
Michail Antonio|Antonio|ST|9|75|33|jm
Gianluca Scamacca|Scamacca|ST|7|77|24|it
Danny Ings|Ings|ST|18|73|31|en
= forest 1978 4-4-2
Peter Shilton|Shilton|GK|1|88|29|en
Chris Woods|Woods|GK|12|70|19|en
Viv Anderson|Anderson|RB|2|81|22|en
Frank Clark|Clark|LB|3|78|35|en
Larry Lloyd|Lloyd|CB|5|81|30|en
Kenny Burns|Burns|CB|6|83|25|sc
David Needham|Needham|CB|14|75|29|en
Colin Barrett|Barrett|LB|15|75|26|en
John McGovern|McGovern|CM|4|81|29|sc
Archie Gemmill|Gemmill|CM|8|83|31|sc
Ian Bowyer|Bowyer|CM|10|79|27|en
Martin O'Neill|O'Neill|RW|7|81|26|nir
John Robertson|Robertson|LW|11|86|25|sc
Trevor Francis|Francis|ST|9|86|24|en
Garry Birtles|Birtles|ST|9|81|22|en
Tony Woodcock|Woodcock|ST|10|83|23|en
Peter Withe|Withe|ST|16|77|27|en
John O'Hare|O'Hare|ST|17|70|31|sc
= leeds 2000 4-4-2
Nigel Martyn|Martyn|GK|1|84|34|en
Paul Robinson|Robinson|GK|13|77|21|en
Danny Mills|Mills|RB|18|79|23|en
Gary Kelly|Kelly|RB|2|73|26|ie
Rio Ferdinand|Ferdinand|CB|29|87|22|en
Lucas Radebe|Radebe|CB|5|81|31|za
Jonathan Woodgate|Woodgate|CB|6|81|20|en
Dominic Matteo|Matteo|CB|21|77|26|sc
Ian Harte|Harte|LB|3|79|23|ie
David Batty|Batty|DM|23|77|32|en
Olivier Dacourt|Dacourt|CM|4|81|26|fr
Eirik Bakke|Bakke|CM|19|75|22|no
Lee Bowyer|Bowyer|CM|11|83|23|en
Harry Kewell|Kewell|LW|10|84|22|au
Jason Wilcox|Wilcox|LW|7|75|29|en
Mark Viduka|Viduka|ST|9|84|25|au
Alan Smith|Smith|ST|17|81|20|en
Robbie Keane|Keane|ST|14|79|20|ie
Michael Bridges|Bridges|ST|8|70|22|en
= crystal 2024 3-4-2-1
Dean Henderson|Henderson|GK|1|81|27|en
Matt Turner|Turner|GK|30|67|30|us
Daniel Muñoz|Muñoz|RB|12|81|28|co
Nathaniel Clyne|Clyne|RB|17|70|33|en
Marc Guéhi|Guéhi|CB|6|83|24|en
Maxence Lacroix|Lacroix|CB|5|79|24|fr
Trevoh Chalobah|Chalobah|CB|15|78|25|en
Chris Richards|Richards|CB|26|76|24|us
Tyrick Mitchell|Mitchell|LB|3|78|25|en
Adam Wharton|Wharton|CM|20|80|20|en
Jefferson Lerma|Lerma|DM|8|78|30|co
Cheick Doucouré|Doucouré|DM|28|75|25|ml
Will Hughes|Hughes|CM|19|73|29|en
Eberechi Eze|Eze|AM|10|84|26|en
Daichi Kamada|Kamada|AM|18|78|28|jp
Romain Esse|Esse|AM|21|70|19|en
Ismaïla Sarr|Sarr|RW|7|80|27|sn
Jean-Philippe Mateta|Mateta|ST|14|81|27|fr
Eddie Nketiah|Nketiah|ST|9|75|25|en
= brighton 2022 4-2-3-1
Robert Sánchez|Sánchez|GK|1|81|25|es
Jason Steele|Steele|GK|23|75|32|en
Joël Veltman|Veltman|RB|34|76|31|nl
Tariq Lamptey|Lamptey|RB|2|73|22|gh
Lewis Dunk|Dunk|CB|5|81|31|en
Adam Webster|Webster|CB|4|77|28|en
Levi Colwill|Colwill|CB|26|78|20|en
Jan Paul van Hecke|Van Hecke|CB|29|73|23|nl
Pervis Estupiñán|Estupiñán|LB|30|80|25|ec
Moisés Caicedo|Caicedo|DM|25|84|21|ec
Alexis Mac Allister|Mac Allister|CM|10|84|24|ar
Pascal Groß|Groß|CM|13|81|32|de
Billy Gilmour|Gilmour|CM|11|73|22|sc
Adam Lallana|Lallana|AM|14|75|35|en
Julio Enciso|Enciso|AM|20|76|19|py
Solly March|March|RW|7|80|29|en
Facundo Buonanotte|Buonanotte|RW|40|70|18|ar
Kaoru Mitoma|Mitoma|LW|22|81|26|jp
Danny Welbeck|Welbeck|ST|18|77|32|en
Evan Ferguson|Ferguson|ST|28|76|18|ie
Deniz Undav|Undav|ST|21|75|27|de
= fulham 2009 4-4-2
Mark Schwarzer|Schwarzer|GK|1|83|37|au
Pascal Zuberbühler|Zuberbühler|GK|12|67|39|ch
Chris Baird|Baird|RB|6|73|27|nir
John Pantsil|Pantsil|RB|4|73|28|gh
Brede Hangeland|Hangeland|CB|5|81|28|no
Aaron Hughes|Hughes|CB|18|77|30|nir
Chris Smalling|Smalling|CB|21|67|20|en
Paul Konchesky|Konchesky|LB|3|75|28|en
Danny Murphy|Murphy|CM|13|79|32|en
Dickson Etuhu|Etuhu|DM|20|75|27|ng
Jonathan Greening|Greening|CM|14|73|30|en
Zoltán Gera|Gera|AM|11|77|30|hu
Clint Dempsey|Dempsey|AM|23|79|26|us
Simon Davies|Davies|RW|29|76|30|wal
Damien Duff|Duff|LW|16|80|30|ie
Bobby Zamora|Zamora|ST|25|80|28|en
Erik Nevland|Nevland|ST|9|73|32|no
Diomansy Kamara|Kamara|ST|19|73|29|sn
Stefano Okaka|Okaka|ST|33|70|20|it
= bournemouth 2016 4-4-2
Artur Boruc|Boruc|GK|1|77|36|pl
Adam Federici|Federici|GK|12|70|31|au
Simon Francis|Francis|RB|2|75|31|en
Adam Smith|A. Smith|RB|15|73|25|en
Steve Cook|Cook|CB|3|76|25|en
Tyrone Mings|Mings|CB|26|73|23|en
Nathan Aké|Aké|CB|5|78|21|nl
Charlie Daniels|Daniels|LB|11|75|30|en
Andrew Surman|Surman|CM|6|76|30|en
Harry Arter|Arter|CM|8|77|26|ie
Dan Gosling|Gosling|CM|4|70|26|en
Jack Wilshere|Wilshere|CM|19|77|24|en
Ryan Fraser|Fraser|RW|24|77|22|sc
Jordon Ibe|Ibe|RW|10|71|21|en
Junior Stanislas|Stanislas|LW|19|76|27|en
Marc Pugh|Pugh|LW|7|67|29|en
Joshua King|King|ST|17|81|24|no
Callum Wilson|Wilson|ST|13|77|24|en
Benik Afobe|Afobe|ST|9|75|23|cd
= brentford 2021 3-5-2
David Raya|Raya|GK|1|80|26|es
Álvaro Fernández|Fernández|GK|12|67|23|es
Mads Roerslev|Roerslev|RB|30|70|22|dk
Kristoffer Ajer|Ajer|CB|20|76|23|no
Pontus Jansson|Jansson|CB|18|77|30|se
Ethan Pinnock|Pinnock|CB|5|76|28|jm
Mads Bech Sørensen|Sørensen|CB|29|70|22|dk
Rico Henry|Henry|LB|3|75|24|en
Sergi Canós|Canós|RW|7|75|24|es
Christian Nørgaard|Nørgaard|DM|6|77|27|dk
Vitaly Janelt|Janelt|CM|27|75|23|de
Mathias Jensen|Jensen|CM|8|76|25|dk
Christian Eriksen|Eriksen|AM|21|83|29|dk
Frank Onyeka|Onyeka|CM|15|70|23|ng
Shandon Baptiste|Baptiste|CM|26|70|23|gd
Saman Ghoddos|Ghoddos|AM|14|70|28|ir
Bryan Mbeumo|Mbeumo|RW|19|80|22|cm
Yoane Wissa|Wissa|LW|11|78|25|cd
Ivan Toney|Toney|ST|17|81|25|en
= burnley 2017 4-4-2
Nick Pope|Pope|GK|29|81|25|en
Tom Heaton|Heaton|GK|1|77|31|en
Matthew Lowton|Lowton|RB|2|75|28|en
Phil Bardsley|Bardsley|RB|26|70|32|sc
James Tarkowski|Tarkowski|CB|5|79|25|en
Ben Mee|Mee|CB|6|78|28|en
Kevin Long|Long|CB|28|73|27|ie
Stephen Ward|Ward|LB|23|73|32|ie
Charlie Taylor|Taylor|LB|3|70|24|en
Jack Cork|Cork|DM|4|78|28|en
Steven Defour|Defour|CM|8|75|29|be
Jeff Hendrick|Hendrick|CM|13|75|25|ie
Ashley Westwood|Westwood|CM|18|76|27|en
Scott Arfield|Arfield|CM|37|75|29|ca
Jóhann Berg Guðmundsson|Guðmundsson|RW|7|77|27|is
Robbie Brady|Brady|LW|12|75|25|ie
Aaron Lennon|Lennon|RW|25|73|30|en
Ashley Barnes|Barnes|ST|10|77|28|en
Chris Wood|Wood|ST|9|77|25|nz
Sam Vokes|Vokes|ST|9|73|27|wal
= sunderland 1999 4-4-2
Thomas Sørensen|Sørensen|GK|1|79|23|dk
Andy Marriott|Marriott|GK|13|65|29|wal
Chris Makin|Makin|RB|2|73|26|en
Darren Williams|Williams|CB|4|73|22|en
Jody Craddock|Craddock|CB|6|75|24|en
Paul Butler|Butler|CB|5|73|26|ie
Steve Bould|Bould|CB|12|73|36|en
Michael Gray|Gray|LB|3|75|25|en
Gavin McCann|McCann|CM|8|77|21|en
Stefan Schwarz|Schwarz|CM|15|77|30|se
Alex Rae|Rae|CM|14|75|30|sc
Nicky Summerbee|Summerbee|RW|7|77|28|en
Kevin Kilbane|Kilbane|LW|11|75|22|ie
Allan Johnston|Johnston|LW|17|73|26|sc
Kevin Phillips|Phillips|ST|10|84|26|en
Niall Quinn|Quinn|ST|9|81|33|ie
Danny Dichio|Dichio|ST|19|70|25|en
Michael Reddy|Reddy|ST|20|65|20|ie
= wolves 2019 3-4-3
Rui Patrício|Patrício|GK|11|83|31|pt
John Ruddy|Ruddy|GK|21|70|33|en
Matt Doherty|Doherty|RB|2|80|27|ie
Jonny Otto|Jonny|LB|19|77|25|es
Willy Boly|Boly|CB|15|79|28|ci
Conor Coady|Coady|CB|16|80|26|en
Romain Saïss|Saïss|CB|27|78|29|ma
Ryan Bennett|Bennett|CB|5|75|29|en
Max Kilman|Kilman|CB|23|70|22|en
Rúben Vinagre|Vinagre|LB|29|73|20|pt
Rúben Neves|Rúben Neves|DM|8|83|22|pt
João Moutinho|Moutinho|CM|28|83|33|pt
Leander Dendoncker|Dendoncker|DM|32|77|24|be
Morgan Gibbs-White|Gibbs-White|AM|17|73|19|en
Adama Traoré|Traoré|RW|37|83|23|es
Pedro Neto|Pedro Neto|RW|7|79|19|pt
Raúl Jiménez|Raúl Jiménez|ST|9|83|28|mx
Patrick Cutrone|Cutrone|ST|10|73|21|it
// FIM
`,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
  else (root.DEZ_BRUTO = root.DEZ_BRUTO || []).push(D);
})(typeof window !== 'undefined' ? window : this);
