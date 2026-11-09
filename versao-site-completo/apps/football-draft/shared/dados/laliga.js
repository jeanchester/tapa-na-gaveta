// Football Draft: LaLiga (2025/26 e históricos)
// Formato: ver shared/dez-dados.js. Notas na escala única (docs/PROMPT_DADOS_REAIS.md, seção 3).
(function (root) {
  'use strict';
  const D = {
    id: 'laliga', origem: 'es',
    times: `
alaves|Alavés|||ALA|#0067B1|#FFFFFF|png
athletic|Athletic Bilbao|||ATH|#EE2523|#FFFFFF|png
atletico|Atlético de Madrid|Atlético Madrid|Atlético de Madrid|ATM|#CB3524|#FFFFFF|png
barcelona|Barcelona|||BAR|#A50044|#004D98|png
betis|Real Betis|||BET|#00954C|#FFFFFF|png
celta|Celta|||CEL|#8AC3EE|#FFFFFF|png
elche|Elche|||ELC|#FFFFFF|#05642C|png
espanyol|Espanyol|||ESP|#007FC8|#FFFFFF|png
getafe|Getafe|||GET|#005999|#FFFFFF|png
girona|Girona|||GIR|#CD2534|#FFFFFF|png
levante|Levante|||LEV|#B4053F|#004D98|png
mallorca|Mallorca|||MLL|#E20613|#111111|png
osasuna|Osasuna|||OSA|#D91A21|#0A346F|png
oviedo|Real Oviedo|||OVI|#0035A0|#FFFFFF|png
rayo|Rayo Vallecano|||RAY|#FFFFFF|#E53027|png
real_madrid|Real Madrid|||RMA|#FFFFFF|#1E2A5A|png
sevilla|Sevilla|||SEV|#FFFFFF|#D4021D|png
sociedad|Real Sociedad|||RSO|#0067B1|#FFFFFF|png
valencia|Valencia|||VAL|#FFFFFF|#111111|png
villarreal|Villarreal|||VIL|#FFE667|#005187|png`,
    elencos: `
// ======================================================== 2025/26
= real_madrid 2025 4-3-3
Thibaut Courtois|Courtois|GK|1|88|33|be
Andriy Lunin|Lunin|GK|13|77|26|ua
Trent Alexander-Arnold|Alexander-Arnold|RB|12|84|27|en
Dani Carvajal|Carvajal|RB|2|80|33|es
Éder Militão|Militão|CB|3|84|27|br
Dean Huijsen|Huijsen|CB|24|83|20|es
Antonio Rüdiger|Rüdiger|CB|22|82|32|de
Raúl Asencio|Asencio|CB|17|78|22|es
Álvaro Carreras|Carreras|LB|18|83|22|es
Ferland Mendy|Mendy|LB|23|78|30|fr
Aurélien Tchouaméni|Tchouaméni|DM|14|84|25|fr
Federico Valverde|Valverde|CM|8|86|27|uy
Eduardo Camavinga|Camavinga|CM|6|83|22|fr
Dani Ceballos|Ceballos|CM|19|77|29|es
Jude Bellingham|Bellingham|AM|5|86|22|en
Arda Güler|Arda Güler|AM|15|85|20|tr
Brahim Díaz|Brahim|AM|21|83|26|ma
Franco Mastantuono|Mastantuono|RW|30|78|18|ar
Rodrygo|Rodrygo|RW|11|82|24|br
Vinícius Júnior|Vini Jr.|LW|7|87|25|br
Kylian Mbappé|Mbappé|ST|10|91|26|fr
Gonzalo García|Gonzalo|ST|16|75|21|es
= barcelona 2025 4-2-3-1
Joan García|Joan García|GK|13|84|24|es
Wojciech Szczęsny|Szczęsny|GK|25|79|35|pl
Jules Koundé|Koundé|RB|23|84|26|fr
Pau Cubarsí|Cubarsí|CB|5|84|18|es
Ronald Araujo|Araujo|CB|4|83|26|uy
Eric García|Eric García|CB|24|79|24|es
Andreas Christensen|Christensen|CB|15|78|29|dk
Alejandro Balde|Balde|LB|3|81|22|es
Gerard Martín|Gerard Martín|LB|18|77|23|es
Frenkie de Jong|F. de Jong|DM|21|85|28|nl
Marc Casadó|Casadó|DM|17|77|22|es
Marc Bernal|Bernal|DM|22|76|18|es
Pedri|Pedri|CM|8|88|22|es
Gavi|Gavi|CM|6|80|21|es
Dani Olmo|Olmo|AM|20|83|27|es
Fermín López|Fermín|AM|16|82|22|es
Lamine Yamal|Lamine Yamal|RW|10|90|18|es
Roony Bardghji|Bardghji|RW|28|73|19|se
Raphinha|Raphinha|LW|11|86|28|br
Marcus Rashford|Rashford|LW|14|81|27|en
Robert Lewandowski|Lewandowski|ST|9|84|37|pl
Ferran Torres|Ferran|ST|7|81|25|es
= atletico 2025 4-4-2
Jan Oblak|Oblak|GK|13|84|32|si
Juan Musso|Musso|GK|1|76|31|ar
Marcos Llorente|Llorente|RB|14|81|30|es
Nahuel Molina|Molina|RB|16|78|27|ar
Robin Le Normand|Le Normand|CB|24|81|29|es
José María Giménez|Giménez|CB|2|81|30|uy
Dávid Hancko|Hancko|CB|17|78|27|sk
Clément Lenglet|Lenglet|CB|15|75|30|fr
Marc Pubill|Pubill|CB|18|74|22|es
Matteo Ruggeri|Ruggeri|LB|3|78|23|it
Koke|Koke|DM|6|80|33|es
Pablo Barrios|Barrios|CM|8|82|22|es
Conor Gallagher|Gallagher|CM|4|79|25|en
Johnny Cardoso|Cardoso|CM|5|78|24|us
Álex Baena|Baena|AM|10|79|24|es
Thiago Almada|Almada|AM|11|77|24|ar
Giuliano Simeone|Giuliano|RW|20|79|23|ar
Nicolás González|Nico González|LW|23|79|27|ar
Antoine Griezmann|Griezmann|ST|7|84|34|fr
Julián Álvarez|Julián|ST|19|87|25|ar
Alexander Sørloth|Sørloth|ST|9|81|29|no
Giacomo Raspadori|Raspadori|ST|22|76|25|it
= villarreal 2025 4-4-2
Luiz Júnior|Luiz Júnior|GK|1|77|24|br
Arnau Tenas|Tenas|GK|25|75|24|es
Juan Foyth|Foyth|RB|8|77|27|ar
Santiago Mouriño|Mouriño|RB|15|76|23|uy
Renato Veiga|Veiga|CB|12|77|22|pt
Rafa Marín|Rafa Marín|CB|4|77|23|es
Willy Kambwala|Kambwala|CB|5|75|21|fr
Sergi Cardona|Cardona|LB|23|77|26|es
Alfonso Pedraza|Pedraza|LB|24|77|29|es
Thomas Partey|Partey|DM|16|79|32|gh
Santi Comesaña|Comesaña|CM|14|78|29|es
Dani Parejo|Parejo|CM|10|79|36|es
Pape Gueye|Pape Gueye|CM|18|76|26|sn
Alberto Moleiro|Moleiro|AM|20|79|22|es
Tajon Buchanan|Buchanan|RW|17|75|26|ca
Nicolas Pépé|Pépé|RW|19|75|30|ci
Ilias Akhomach|Akhomach|RW|11|73|21|ma
Ayoze Pérez|Ayoze|LW|22|83|32|es
Georges Mikautadze|Mikautadze|ST|9|78|25|ge
Gerard Moreno|Gerard Moreno|ST|7|80|33|es
Tani Oluwaseyi|Oluwaseyi|ST|21|70|25|ca
= betis 2025 4-2-3-1
Álvaro Valles|Valles|GK|1|77|28|es
Adrián|Adrián|GK|13|68|38|es
Héctor Bellerín|Bellerín|RB|2|76|30|es
Aitor Ruibal|Ruibal|RB|24|74|29|es
Natan|Natan|CB|4|77|24|br
Diego Llorente|Diego Llorente|CB|3|77|32|es
Marc Bartra|Bartra|CB|5|73|34|es
Junior Firpo|Junior Firpo|LB|23|76|29|do
Ricardo Rodríguez|R. Rodríguez|LB|12|71|33|ch
Sergi Altimira|Altimira|DM|6|77|24|es
Marc Roca|Marc Roca|CM|21|77|29|es
Nelson Deossa|Deossa|CM|18|74|25|co
Pablo Fornals|Fornals|AM|8|77|29|es
Isco|Isco|AM|22|82|33|es
Giovani Lo Celso|Lo Celso|AM|20|78|29|ar
Antony|Antony|RW|7|83|25|br
Abde Ezzalzouli|Abde|LW|10|78|24|ma
Rodrigo Riquelme|Riquelme|LW|17|75|25|es
Cucho Hernández|Cucho|ST|19|77|26|co
Cédric Bakambu|Bakambu|ST|11|70|34|cd
= sociedad 2025 4-3-3
Álex Remiro|Remiro|GK|1|82|30|es
Unai Marrero|Marrero|GK|13|70|24|es
Jon Aramburu|Aramburu|RB|2|77|23|ve
Álvaro Odriozola|Odriozola|RB|19|73|29|es
Igor Zubeldia|Zubeldia|CB|5|78|28|es
Duje Ćaleta-Car|Ćaleta-Car|CB|16|73|29|hr
Jon Martín|Jon Martín|CB|31|73|19|es
Sergio Gómez|Sergio Gómez|LB|17|77|25|es
Javi López|Javi López|LB|12|73|23|es
Jon Gorrotxategi|Gorrotxategi|DM|4|76|22|es
Beñat Turrientes|Turrientes|CM|22|76|23|es
Brais Méndez|Brais Méndez|AM|23|79|28|es
Luka Sučić|L. Sučić|AM|24|76|23|hr
Arsen Zakharyan|Zakharyan|AM|21|75|22|ru
Takefusa Kubo|Kubo|RW|14|83|24|jp
Ander Barrenetxea|Barrenetxea|LW|7|78|23|es
Gonçalo Guedes|Guedes|LW|11|76|28|pt
Mikel Oyarzabal|Oyarzabal|ST|10|83|28|es
Orri Óskarsson|Óskarsson|ST|9|76|21|is
= athletic 2025 4-2-3-1
Unai Simón|Unai Simón|GK|1|84|28|es
Álex Padilla|Padilla|GK|27|73|22|mx
Óscar de Marcos|De Marcos|RB|18|75|36|es
Andoni Gorosabel|Gorosabel|RB|2|74|29|es
Dani Vivian|Vivian|CB|3|80|26|es
Aymeric Laporte|Laporte|CB|14|78|31|es
Aitor Paredes|Paredes|CB|4|77|25|es
Yeray Álvarez|Yeray|CB|5|76|30|es
Yuri Berchiche|Yuri|LB|17|75|35|es
Adama Boiro|Boiro|LB|19|73|23|es
Mikel Jauregizar|Jauregizar|DM|23|78|22|es
Mikel Vesga|Vesga|DM|6|74|32|es
Iñigo Ruiz de Galarreta|Galarreta|CM|16|77|32|es
Beñat Prados|Prados|CM|24|75|24|es
Oihan Sancet|Sancet|AM|8|81|25|es
Unai Gómez|Unai Gómez|AM|20|73|22|es
Iñaki Williams|Iñaki Williams|RW|9|77|31|gh
Nico Williams|Nico Williams|LW|10|83|23|es
Álex Berenguer|Berenguer|LW|7|77|30|es
Gorka Guruzeta|Guruzeta|ST|12|77|29|es
Robert Navarro|Navarro|ST|11|73|23|es
= celta 2025 4-3-3
Ionuț Radu|Radu|GK|13|75|28|ro
Iván Villar|Villar|GK|1|71|28|es
Óscar Mingueza|Mingueza|RB|3|78|26|es
Javi Rodríguez|Javi Rodríguez|CB|32|73|22|es
Carl Starfelt|Starfelt|CB|2|66|30|se
Marcos Alonso|Marcos Alonso|CB|20|75|34|es
Sergio Carreira|Carreira|RB|5|71|25|es
Mihailo Ristić|Ristić|LB|21|73|29|rs
Fran Beltrán|Beltrán|CM|8|77|26|es
Ilaix Moriba|Moriba|CM|6|75|22|gn
Matías Vecino|Vecino|CM|15|74|34|uy
Hugo Sotelo|Sotelo|CM|28|71|22|es
Iago Aspas|Aspas|AM|10|79|38|es
Williot Swedberg|Swedberg|RW|19|75|21|se
Pablo Durán|Pablo Durán|RW|18|71|24|es
Bryan Zaragoza|Zaragoza|LW|17|75|24|es
Franco Cervi|Cervi|LW|11|68|31|ar
Borja Iglesias|Borja Iglesias|ST|7|77|32|es
Ferran Jutglà|Jutglà|ST|9|71|26|es
= espanyol 2025 4-4-2
Marko Dmitrović|Dmitrović|GK|1|79|33|rs
Ángel Fortuño|Fortuño|GK|13|65|24|es
Omar El Hilali|El Hilali|RB|23|73|22|ma
Rubén Sánchez|Rubén Sánchez|RB|2|70|24|es
Leandro Cabrera|Cabrera|CB|6|75|34|uy
Fernando Calero|Calero|CB|5|75|30|es
Clemens Riedel|Riedel|CB|4|70|22|de
Carlos Romero|Carlos Romero|LB|22|73|23|es
Urko González|Urko|DM|20|73|24|es
Edu Expósito|Edu Expósito|CM|8|75|29|es
Pol Lozano|Pol Lozano|CM|10|73|25|es
Charles Pickel|Pickel|DM|12|70|28|cd
Tyrhys Dolan|Dolan|RW|24|74|23|en
Jofre Carreras|Jofre|RW|17|70|24|es
Pere Milla|Pere Milla|LW|11|73|33|es
Javi Puado|Puado|ST|7|75|27|es
Roberto Fernández|R. Fernández|ST|9|75|23|es
Kike García|Kike García|ST|19|73|36|es
= getafe 2025 4-4-2
David Soria|Soria|GK|13|77|32|es
Jiří Letáček|Letáček|GK|1|65|26|cz
Juan Iglesias|Juan Iglesias|RB|21|73|27|es
Allan Nyom|Nyom|RB|12|67|37|cm
Djené Dakonam|Djené|CB|2|77|34|tg
Domingos Duarte|Domingos Duarte|CB|22|75|30|pt
Abdel Abqar|Abqar|CB|3|73|26|ma
Zaid Romero|Zaid Romero|CB|15|70|26|ar
Diego Rico|Diego Rico|LB|16|70|32|es
Mauro Arambarri|Arambarri|DM|8|75|30|uy
Luis Milla|Luis Milla|CM|5|75|31|es
Mario Martín|Mario Martín|CM|6|70|21|es
Yvan Neyou|Neyou|CM|4|70|28|cm
Adrián Liso|Liso|RW|23|73|20|es
Coba da Costa|Coba|RW|11|67|22|pt
Juanmi|Juanmi|LW|7|70|32|es
Borja Mayoral|Mayoral|ST|19|75|28|es
Christantus Uche|Uche|ST|9|73|22|ng
= girona 2025 4-2-3-1
Dominik Livaković|Livaković|GK|1|81|30|hr
Paulo Gazzaniga|Gazzaniga|GK|13|75|33|ar
Arnau Martínez|Arnau Martínez|RB|4|75|22|es
Hugo Rincón|Hugo Rincón|RB|2|70|22|es
Vitor Reis|Vitor Reis|CB|12|75|19|br
David López|David López|CB|5|73|36|es
Daley Blind|Blind|CB|17|70|35|nl
Àlex Moreno|Àlex Moreno|LB|24|73|32|es
Axel Witsel|Witsel|DM|20|71|36|be
Azzedine Ounahi|Ounahi|CM|18|77|25|ma
Iván Martín|Iván Martín|CM|23|77|26|es
Thomas Lemar|Lemar|AM|11|75|29|fr
Claudio Echeverri|Echeverri|AM|10|73|19|ar
Viktor Tsygankov|Tsygankov|RW|15|77|27|ua
Yáser Asprilla|Asprilla|RW|7|73|21|co
Bryan Gil|Bryan Gil|LW|21|75|24|es
Portu|Portu|RW|8|67|33|es
Vladyslav Vanat|Vanat|ST|19|76|23|ua
Cristhian Stuani|Stuani|ST|9|70|38|uy
= osasuna 2025 4-2-3-1
Sergio Herrera|Sergio Herrera|GK|1|79|32|es
Aitor Fernández|Aitor Fernández|GK|13|71|34|es
Jorge Herrando|Herrando|CB|5|71|24|es
Alejandro Catena|Catena|CB|24|76|31|es
Enzo Boyomo|Boyomo|CB|22|75|24|cm
Valentin Rosier|Rosier|RB|19|73|28|fr
Jon Areso|Areso|RB|20|71|26|es
Abel Bretones|Bretones|LB|23|73|25|es
Juan Cruz|Juan Cruz|LB|3|71|33|es
Lucas Torró|Torró|DM|6|75|31|es
Jon Moncayola|Moncayola|CM|7|75|27|es
Iker Muñoz|Iker Muñoz|CM|21|68|23|es
Aimar Oroz|Aimar Oroz|AM|10|75|23|es
Moi Gómez|Moi Gómez|AM|16|71|31|es
Rubén García|Rubén García|RW|14|75|32|es
Víctor Muñoz|Víctor Muñoz|LW|17|76|22|es
Ante Budimir|Budimir|ST|17|77|34|hr
Raúl García de Haro|Raúl García|ST|9|71|25|es
= mallorca 2025 4-4-2
Leo Román|Leo Román|GK|1|75|25|es
Lucas Bergström|Bergström|GK|13|68|23|fi
Pablo Maffeo|Maffeo|RB|23|75|28|ar
Antonio Raíllo|Raíllo|CB|21|74|34|es
Martin Valjent|Valjent|CB|24|75|30|sk
Marash Kumbulla|Kumbulla|CB|4|73|25|al
David López|Copete|CB|6|71|26|es
Johan Mojica|Mojica|LB|22|75|33|co
Toni Lato|Lato|LB|3|68|28|es
Samú Costa|Samú Costa|DM|12|79|25|pt
Omar Mascarell|Mascarell|DM|5|68|32|es
Sergi Darder|Darder|CM|10|75|31|es
Manu Morlanes|Morlanes|CM|8|71|26|es
Antonio Sánchez|Antonio Sánchez|AM|18|71|28|es
Pablo Torre|Pablo Torre|AM|20|71|22|es
Takuma Asano|Asano|RW|11|73|31|jp
Jan Virgili|Virgili|LW|17|73|19|es
Vedat Muriqi|Muriqi|ST|7|77|31|xk
Cyle Larin|Larin|ST|9|73|30|ca
Mateo Joseph|Mateo Joseph|ST|19|68|22|es
= alaves 2025 4-4-2
Antonio Sivera|Sivera|GK|1|77|29|es
Raúl Fernández|Raúl Fernández|GK|13|68|37|es
Nahuel Tenaglia|Tenaglia|RB|14|70|29|ar
Jonny Otto|Jonny|RB|2|68|31|es
Facundo Garcés|Garcés|CB|4|70|26|ar
Jon Pacheco|Pacheco|CB|5|75|24|es
Víctor Parada|Parada|CB|22|68|23|es
Moussa Diarra|Diarra|LB|3|70|25|fr
Antonio Blanco|Antonio Blanco|DM|8|75|25|es
Ander Guevara|Guevara|CM|6|75|28|es
Carles Aleñá|Aleñá|CM|10|68|27|es
Denis Suárez|Denis Suárez|AM|4|68|31|es
Calebe|Calebe|AM|17|68|25|br
Carlos Vicente|Carlos Vicente|RW|7|75|26|es
Abderrahman Rebbach|Rebbach|LW|21|70|27|dz
Lucas Boyé|Boyé|ST|15|75|29|ar
Toni Martínez|Toni Martínez|ST|11|75|28|es
Mariano Díaz|Mariano|ST|9|68|32|do
= rayo 2025 4-2-3-1
Augusto Batalla|Batalla|GK|13|80|29|ar
Dani Cárdenas|Cárdenas|GK|1|70|28|es
Andrei Rațiu|Rațiu|RB|2|77|27|ro
Iván Balliu|Balliu|RB|20|70|33|al
Florian Lejeune|Lejeune|CB|24|77|34|fr
Abdul Mumin|Mumin|CB|16|75|27|gh
Pathé Ciss|Ciss|CB|6|73|31|sn
Pep Chavarría|Chavarría|LB|3|75|27|es
Jorge de Frutos|De Frutos|RW|19|77|28|es
Óscar Valentín|Óscar Valentín|DM|23|75|31|es
Unai López|Unai López|CM|17|75|30|es
Pedro Díaz|Pedro Díaz|CM|4|74|27|es
Óscar Trejo|Trejo|AM|8|70|37|ar
Isi Palazón|Isi|AM|7|78|30|es
Fran Pérez|Fran Pérez|RW|11|73|23|es
Álvaro García|Álvaro García|LW|18|77|33|es
Sergio Camello|Camello|ST|10|73|24|es
Alemão|Alemão|ST|9|74|27|br
Randy Nteka|Nteka|ST|21|70|28|fr
= elche 2025 4-2-3-1
Matías Dituro|Dituro|GK|1|70|38|ar
Iñaki Peña|Iñaki Peña|GK|13|67|26|es
Álvaro Núñez|Álvaro Núñez|RB|15|70|25|es
David Affengruber|Affengruber|CB|22|74|24|at
Pedro Bigas|Bigas|CB|6|70|35|es
Víctor Chust|Chust|CB|23|67|25|es
Adrià Pedrosa|Pedrosa|LB|3|70|27|es
Marc Aguado|Aguado|DM|8|70|25|es
Aleix Febas|Febas|CM|14|70|29|es
Martim Neto|Martim Neto|CM|16|67|22|pt
Germán Valera|Valera|RW|11|77|23|es
Josan|Josan|RW|17|67|35|es
Yago Santiago|Yago Santiago|LW|10|70|22|es
Rafa Mir|Rafa Mir|ST|9|75|28|es
André Silva|André Silva|ST|19|75|29|pt
Álvaro Rodríguez|Álvaro Rodríguez|ST|20|67|21|uy
John Donald|Donald|CB|4|63|25|nl
Héctor Fort|Fort|RB|39|67|19|es
= levante 2025 4-4-2
Mathew Ryan|Ryan|GK|1|74|33|au
Pablo Cuñat|Cuñat|GK|13|67|25|es
Jeremy Toljan|Toljan|RB|22|70|31|de
Víctor García|Víctor García|RB|2|65|28|es
Adrián de la Fuente|De la Fuente|CB|4|73|26|es
Unai Elgezabal|Elgezabal|CB|5|73|32|es
Matías Moreno|Matías Moreno|CB|14|67|22|ar
Manu Sánchez|Manu Sánchez|LB|3|73|25|es
Oriol Rey|Oriol Rey|DM|6|73|27|es
Unai Vencedor|Vencedor|CM|8|70|24|es
Pablo Martínez|Pablo Martínez|CM|10|70|27|es
Kervin Arriaga|Arriaga|CM|20|70|27|hn
Carlos Álvarez|Carlos Álvarez|AM|24|79|22|es
Roger Brugué|Brugué|RW|7|73|29|es
Iker Losada|Losada|LW|11|70|24|es
Iván Romero|Iván Romero|ST|9|75|24|es
Karl Etta Eyong|Etta Eyong|ST|19|75|22|cm
José Luis Morales|Morales|ST|11|67|38|es
= oviedo 2025 4-2-3-1
Aarón Escandell|Escandell|GK|13|77|30|es
Horațiu Moldovan|Moldovan|GK|1|70|27|ro
Lucas Ahijado|Ahijado|RB|2|65|30|es
Nacho Vidal|Nacho Vidal|RB|22|70|30|es
Eric Bailly|Bailly|CB|4|73|31|ci
David Carmo|Carmo|CB|16|73|26|ao
David Costas|Costas|CB|3|67|30|es
Rahim Alhassane|Rahim|LB|12|70|23|ne
Santiago Colombatto|Colombatto|DM|11|75|28|ar
Leander Dendoncker|Dendoncker|CM|8|73|30|be
Kwasi Sibo|Sibo|CM|5|66|27|gh
Alberto Reina|Alberto Reina|AM|6|67|27|es
Santi Cazorla|Cazorla|AM|8|75|40|es
Ilyas Chaira|Chaira|LW|10|73|24|ma
Haissem Hassan|Haissem|RW|7|68|23|eg
Josip Brekalo|Brekalo|LW|17|70|27|hr
Salomón Rondón|Rondón|ST|23|75|36|ve
Federico Viñas|Viñas|ST|9|67|27|uy
= sevilla 2025 4-2-3-1
Odysseas Vlachodimos|Vlachodimos|GK|1|77|31|gr
Ørjan Nyland|Nyland|GK|13|68|35|no
Juanlu Sánchez|Juanlu|RB|16|75|22|es
José Ángel Carmona|Carmona|RB|2|68|23|es
Marcão|Marcão|CB|23|75|29|br
Kike Salas|Kike Salas|CB|4|70|23|es
César Azpilicueta|Azpilicueta|CB|3|68|36|es
Tanguy Nianzou|Nianzou|CB|24|68|23|fr
Gabriel Suazo|Suazo|LB|12|70|28|cl
Lucien Agoumé|Agoumé|DM|18|75|23|fr
Nemanja Gudelj|Gudelj|DM|6|68|34|rs
Djibril Sow|Sow|CM|20|70|28|ch
Batista Mendy|Batista Mendy|CM|19|68|25|fr
Alexis Sánchez|Alexis|AM|10|70|36|cl
Chidera Ejuke|Ejuke|RW|21|75|27|ng
Peque Fernández|Peque|RW|17|68|23|es
Ruben Vargas|Vargas|LW|11|75|27|ch
Isaac Romero|Isaac Romero|ST|7|75|25|es
Akor Adams|Akor Adams|ST|9|74|25|ng
Kelechi Iheanacho|Iheanacho|ST|14|68|28|ng
= valencia 2025 4-4-2
Stole Dimitrievski|Dimitrievski|GK|1|73|31|mk
Julen Agirrezabala|Agirrezabala|GK|25|71|25|es
Dimitri Foulquier|Foulquier|RB|20|73|32|fr
Thierry Correia|Correia|RB|12|68|26|pt
César Tárrega|Tárrega|CB|5|79|23|es
Mouctar Diakhaby|Diakhaby|CB|4|73|28|gn
Eray Cömert|Cömert|CB|24|68|27|ch
José Gayà|Gayà|LB|14|77|30|es
Jesús Vázquez|Jesús Vázquez|LB|21|71|22|es
Pepelu|Pepelu|DM|18|76|27|es
Javi Guerra|Javi Guerra|CM|8|77|22|es
Guido Rodríguez|G. Rodríguez|DM|5|71|31|ar
Baptiste Santamaria|Santamaria|CM|22|71|30|fr
André Almeida|André Almeida|AM|10|71|25|pt
Diego López|Diego López|RW|16|77|23|es
Luis Rioja|Rioja|RW|11|71|31|es
Arnaut Danjuma|Danjuma|LW|7|73|28|nl
Largie Ramazani|Ramazani|LW|17|71|24|be
Hugo Duro|Hugo Duro|ST|9|76|26|es
Lucas Beltrán|Lucas Beltrán|ST|15|73|24|ar
Umar Sadiq|Sadiq|ST|19|68|28|ng
// FIM ATUAIS
// ======================================================== históricos
= real_madrid 2001 4-4-2
Iker Casillas|Casillas|GK|1|84|20|es
César Sánchez|César|GK|13|77|30|es
Míchel Salgado|Salgado|RB|2|81|26|es
Fernando Hierro|Hierro|CB|4|85|33|es
Iván Helguera|Helguera|CB|6|83|26|es
Francisco Pavón|Pavón|CB|22|75|21|es
Aitor Karanka|Karanka|CB|18|75|28|es
Roberto Carlos|Roberto Carlos|LB|3|88|28|br
Claude Makélélé|Makélélé|DM|24|86|28|fr
Flávio Conceição|Flávio|CM|15|77|27|br
Steve McManaman|McManaman|CM|8|81|29|en
Iván Campo|Iván Campo|DM|16|73|27|es
Zinedine Zidane|Zidane|AM|5|91|29|fr
Guti|Guti|AM|14|81|25|es
Luís Figo|Figo|RW|10|89|29|pt
Pedro Munitis|Munitis|RW|17|75|26|es
Santiago Solari|Solari|LW|21|79|25|ar
Raúl González|Raúl|ST|7|89|24|es
Fernando Morientes|Morientes|ST|9|84|25|es
Javier Portillo|Portillo|ST|19|73|19|es
= real_madrid 2016 4-3-3
Keylor Navas|Navas|GK|1|85|30|cr
Kiko Casilla|Casilla|GK|13|77|30|es
Dani Carvajal|Carvajal|RB|2|84|25|es
Danilo|Danilo|RB|23|77|25|br
Sergio Ramos|Sergio Ramos|CB|4|88|31|es
Raphaël Varane|Varane|CB|5|86|24|fr
Pepe|Pepe|CB|3|84|34|pt
Nacho Fernández|Nacho|CB|6|79|27|es
Marcelo|Marcelo|LB|12|86|29|br
Fábio Coentrão|Coentrão|LB|15|75|29|pt
Casemiro|Casemiro|DM|14|86|25|br
Toni Kroos|Kroos|CM|8|89|27|de
Luka Modrić|Modrić|CM|19|89|31|hr
Mateo Kovačić|Kovačić|CM|16|79|23|hr
Isco|Isco|AM|22|85|25|es
James Rodríguez|James|AM|10|83|25|co
Gareth Bale|Bale|RW|11|86|27|wal
Lucas Vázquez|Lucas Vázquez|RW|17|79|26|es
Marco Asensio|Asensio|LW|20|81|21|es
Cristiano Ronaldo|C. Ronaldo|ST|7|91|32|pt
Karim Benzema|Benzema|ST|9|85|29|fr
Álvaro Morata|Morata|ST|21|83|24|es
= barcelona 1991 4-3-3
Andoni Zubizarreta|Zubizarreta|GK|1|84|30|es
Carles Busquets|C. Busquets|GK|13|67|24|es
Albert Ferrer|Ferrer|RB|2|79|21|es
Ronald Koeman|Koeman|CB|4|87|29|nl
Nando|Nando|CB|5|77|24|es
José Ramón Alexanko|Alexanko|CB|3|75|35|es
Miguel Ángel Nadal|Nadal|CB|15|75|25|es
Juan Carlos Rodríguez|Juan Carlos|LB|12|77|26|es
Pep Guardiola|Guardiola|DM|6|83|21|es
Eusebio Sacristán|Eusebio|CM|8|78|28|es
José Mari Bakero|Bakero|CM|11|83|28|es
Guillermo Amor|Amor|CM|16|79|24|es
Richard Witschge|Witschge|CM|17|77|22|nl
Michael Laudrup|Laudrup|AM|10|89|27|dk
Jon Andoni Goikoetxea|Goikoetxea|RW|7|80|26|es
Txiki Begiristain|Begiristain|LW|14|82|27|es
Hristo Stoichkov|Stoichkov|ST|8|89|25|bg
Julio Salinas|Salinas|ST|9|79|29|es
= barcelona 2010 4-3-3
Víctor Valdés|Valdés|GK|1|86|28|es
José Manuel Pinto|Pinto|GK|13|73|35|es
Dani Alves|Dani Alves|RB|2|87|27|br
Carles Puyol|Puyol|CB|5|86|32|es
Gerard Piqué|Piqué|CB|3|88|23|es
Gabriel Milito|Milito|CB|18|75|30|ar
Éric Abidal|Abidal|LB|22|83|31|fr
Adriano Correia|Adriano|LB|21|79|26|br
Maxwell|Maxwell|LB|19|79|29|br
Sergio Busquets|Busquets|DM|16|87|22|es
Javier Mascherano|Mascherano|DM|14|84|26|ar
Seydou Keita|Keita|CM|15|81|30|ml
Xavi Hernández|Xavi|CM|6|91|30|es
Andrés Iniesta|Iniesta|CM|8|91|26|es
Thiago Alcântara|Thiago|AM|30|75|19|es
Pedro Rodríguez|Pedro|RW|17|84|23|es
Lionel Messi|Messi|RW|10|94|23|ar
David Villa|Villa|LW|7|87|29|es
Ibrahim Afellay|Afellay|LW|20|79|25|nl
Bojan Krkić|Bojan|ST|9|77|20|es
= atletico 1995 4-4-2
José Francisco Molina|Molina|GK|1|83|25|es
Abel Resino|Abel|GK|13|70|35|es
Delfí Geli|Geli|RB|2|75|26|es
Santi Denia|Santi|CB|5|77|21|es
Roberto Solozábal|Solozábal|CB|4|77|25|es
Juanma López|Juanma López|CB|3|75|26|es
Toni Muñoz|Toni|LB|6|77|27|es
José Luis Pérez Caminero|Caminero|DM|8|84|28|es
Diego Simeone|Simeone|CM|14|84|25|ar
Juan Vizcaíno|Vizcaíno|CM|15|77|29|es
Roberto Fresnedoso|Fresnedoso|CM|16|73|22|es
Milinko Pantić|Pantić|AM|10|84|29|rs
Carlos Aguilera|Aguilera|RW|11|75|26|es
Juan Manuel López|Juan López|RW|17|70|25|es
Kiko|Kiko|ST|9|84|23|es
Lyuboslav Penev|Penev|ST|7|81|29|bg
Javier Prieto|Prieto|ST|19|67|22|es
Biagini|Biagini|ST|18|73|19|ar
= atletico 2013 4-4-2
Thibaut Courtois|Courtois|GK|13|87|21|be
Daniel Aranzubia|Aranzubia|GK|1|70|33|es
Juanfran|Juanfran|RB|20|83|29|es
Diego Godín|Godín|CB|2|87|28|uy
João Miranda|Miranda|CB|23|84|29|br
Toby Alderweireld|Alderweireld|CB|4|79|25|be
Filipe Luís|Filipe Luís|LB|3|84|28|br
Emiliano Insúa|Insúa|LB|15|75|25|ar
Gabi|Gabi|DM|14|84|30|es
Tiago Mendes|Tiago|CM|5|81|33|pt
Mario Suárez|Mario Suárez|CM|4|79|27|es
José Sosa|Sosa|CM|8|77|28|ar
Koke|Koke|CM|6|85|22|es
Arda Turan|Arda Turan|LW|10|84|27|tr
Raúl García|Raúl García|AM|8|81|27|es
Diego Ribas|Diego|AM|22|81|29|br
Cristian Rodríguez|Cebolla|LW|11|77|28|uy
Adrián López|Adrián|ST|7|77|26|es
David Villa|Villa|ST|9|83|32|es
Diego Costa|Diego Costa|ST|19|87|25|es
= sevilla 2005 4-4-2
Andrés Palop|Palop|GK|1|81|32|es
Antonio Notario|Notario|GK|13|67|33|es
Dani Alves|Dani Alves|RB|20|85|22|br
Javi Navarro|Javi Navarro|CB|2|81|31|es
Julien Escudé|Escudé|CB|4|79|26|fr
Aitor Ocio|Ocio|CB|5|75|29|es
David Castedo|Castedo|LB|3|73|31|es
Christian Poulsen|Poulsen|DM|15|80|26|dk
Martí|Martí|CM|8|79|25|es
Renato|Renato|CM|11|79|26|br
Enzo Maresca|Maresca|AM|10|81|26|it
Jesús Navas|Navas|RW|16|81|20|es
Adriano Correia|Adriano|LW|17|79|21|br
Javier Saviola|Saviola|ST|7|79|24|ar
Frédéric Kanouté|Kanouté|ST|12|84|28|ml
Luís Fabiano|Luís Fabiano|ST|9|84|25|br
Kepa Blanco|Kepa|ST|19|73|21|es
Fernando Sales|Sales|RW|18|73|28|es
= sevilla 2019 4-3-3
Yassine Bounou|Bono|GK|13|83|29|ma
Tomáš Vaclík|Vaclík|GK|1|77|31|cz
Jesús Navas|Navas|RB|16|83|34|es
Jules Koundé|Koundé|CB|12|83|21|fr
Diego Carlos|Diego Carlos|CB|20|85|27|br
Daniel Carriço|Carriço|CB|6|77|31|pt
Sergio Reguilón|Reguilón|LB|3|83|23|es
Sergio Escudero|Escudero|LB|18|75|30|es
Fernando|Fernando|DM|25|83|32|br
Nemanja Gudelj|Gudelj|DM|22|77|28|rs
Joan Jordán|Jordán|CM|8|81|25|es
Éver Banega|Banega|CM|10|84|31|ar
Óliver Torres|Óliver|AM|21|77|25|es
Franco Vázquez|Franco Vázquez|AM|22|77|31|ar
Suso|Suso|RW|7|79|26|es
Lucas Ocampos|Ocampos|LW|5|84|25|ar
Munir El Haddadi|Munir|LW|11|77|24|ma
Youssef En-Nesyri|En-Nesyri|ST|15|80|23|ma
Luuk de Jong|De Jong|ST|9|77|29|nl
= valencia 2003 4-4-2
Santiago Cañizares|Cañizares|GK|1|84|33|es
Andrés Palop|Palop|GK|13|73|29|es
Curro Torres|Curro Torres|RB|2|77|26|es
Roberto Ayala|Ayala|CB|4|86|30|ar
Carlos Marchena|Marchena|CB|5|83|24|es
David Navarro|Navarro|CB|15|75|23|es
Fábio Aurélio|Fábio Aurélio|LB|3|79|24|br
Amedeo Carboni|Carboni|LB|17|77|38|it
David Albelda|Albelda|DM|6|84|26|es
Rubén Baraja|Baraja|CM|8|85|28|es
Mohamed Sissoko|Sissoko|DM|22|73|18|ml
Francisco Rufete|Rufete|RW|7|79|27|es
Miguel Ángel Angulo|Angulo|RW|11|78|26|es
Pablo Aimar|Aimar|AM|21|87|24|ar
Vicente Rodríguez|Vicente|LW|14|86|22|es
Mista|Mista|ST|9|83|25|es
Ricardo Oliveira|Oliveira|ST|19|80|23|br
Xisco|Xisco|ST|18|70|23|es
= valencia 2018 4-4-2
Neto|Neto|GK|1|83|29|br
Jaume Doménech|Doménech|GK|13|70|28|es
Daniel Wass|Wass|RB|18|78|29|dk
Cristiano Piccini|Piccini|RB|2|77|26|it
Ezequiel Garay|Garay|CB|24|83|32|ar
Gabriel Paulista|Gabriel Paulista|CB|5|81|28|br
Mouctar Diakhaby|Diakhaby|CB|12|77|22|fr
José Gayà|Gayà|LB|14|85|24|es
Dani Parejo|Parejo|CM|10|84|29|es
Geoffrey Kondogbia|Kondogbia|DM|7|81|26|cf
Francis Coquelin|Coquelin|DM|6|79|27|fr
Carlos Soler|Soler|RW|8|81|22|es
Ferran Torres|Ferran|RW|20|73|19|es
Gonçalo Guedes|Guedes|LW|7|83|22|pt
Denis Cheryshev|Cheryshev|LW|21|78|28|ru
Rodrigo Moreno|Rodrigo|ST|19|84|28|es
Kevin Gameiro|Gameiro|ST|9|80|32|fr
Santi Mina|Mina|ST|22|77|23|es
Michy Batshuayi|Batshuayi|ST|23|77|25|be
= athletic 2023 4-2-3-1
Unai Simón|Unai Simón|GK|1|84|27|es
Julen Agirrezabala|Agirrezabala|GK|13|75|23|es
Óscar de Marcos|De Marcos|RB|18|78|35|es
Íñigo Lekue|Lekue|RB|15|73|31|es
Dani Vivian|Vivian|CB|3|81|24|es
Yeray Álvarez|Yeray|CB|5|79|29|es
Aitor Paredes|Paredes|CB|4|78|24|es
Yuri Berchiche|Yuri|LB|17|78|34|es
Adama Boiro|Boiro|LB|19|70|22|es
Iñigo Ruiz de Galarreta|Galarreta|CM|16|80|30|es
Mikel Vesga|Vesga|DM|6|75|31|es
Beñat Prados|Prados|CM|24|76|23|es
Dani García|Dani García|DM|14|74|33|es
Oihan Sancet|Sancet|AM|8|83|24|es
Unai Gómez|Unai Gómez|AM|20|73|21|es
Iñaki Williams|Iñaki Williams|RW|9|82|30|gh
Nico Williams|Nico Williams|LW|11|84|21|es
Álex Berenguer|Berenguer|LW|7|79|29|es
Gorka Guruzeta|Guruzeta|ST|12|80|27|es
Asier Villalibre|Villalibre|ST|20|70|26|es
= sociedad 2002 4-4-2
Sander Westerveld|Westerveld|GK|1|81|28|nl
Alberto López|Alberto|GK|13|70|31|es
Aitor López Rekarte|López Rekarte|RB|2|75|27|es
Igor Jauregi|Jauregi|CB|4|75|29|es
Gabriel Schürrer|Schürrer|CB|5|75|31|ar
Mikel Labaka|Labaka|CB|15|70|22|es
Agustín Aranzabal|Aranzabal|LB|3|77|29|es
Xabi Alonso|Xabi Alonso|CM|14|84|21|es
Mikel Aranburu|Aranburu|CM|8|75|23|es
Javier de Pedro|De Pedro|LW|10|83|29|es
Valeri Karpin|Karpin|RW|7|83|34|ru
Dmitri Khokhlov|Khokhlov|AM|20|79|27|ru
Bittor Alkiza|Alkiza|CM|6|77|32|es
Tayfun Korkut|Tayfun|CM|16|75|28|tr
Gabilondo|Gabilondo|RW|17|73|23|es
Darko Kovačević|Kovačević|ST|9|84|29|rs
Nihat Kahveci|Nihat|ST|11|86|23|tr
Sergio Boris|Boris|ST|19|67|22|es
= betis 2004 4-4-2
Toni Prats|Prats|GK|1|77|33|es
Pedro Contreras|Contreras|GK|13|77|32|es
Melli|Melli|RB|2|73|20|es
Juanito|Juanito|CB|4|79|28|es
Rivas|Rivas|CB|5|75|30|es
Luis Fernández|Luis Fernández|LB|3|75|24|es
Juan Gutiérrez Moreno|J. Gutiérrez|CB|15|70|29|es
Marcos Assunção|Assunção|DM|6|83|28|br
Arzu|Arzu|CM|8|77|23|es
Fernando Fernández|Fernando|CM|16|75|28|es
Rivera|Rivera|AM|17|77|28|es
Edu|Edu|AM|10|81|25|br
Joaquín|Joaquín|RW|17|85|23|es
Capi|Capi|LW|11|75|27|es
Ricardo Oliveira|Oliveira|ST|9|84|24|br
Dani|Dani|ST|7|79|30|es
Xisco|Xisco|LW|18|70|24|es
Ismael Urzaiz|Urzaiz|ST|19|70|33|es
= villarreal 2005 4-4-2
Mariano Barbosa|Barbosa|GK|1|75|21|ar
Sebastián Viera|Viera|GK|13|77|22|uy
Javi Venta|Javi Venta|RB|2|77|29|es
Gonzalo Rodríguez|Gonzalo|CB|4|79|21|ar
Juan Manuel Peña|Peña|CB|5|77|32|bo
Quique Álvarez|Quique Álvarez|CB|6|77|30|es
Rodolfo Arruabarrena|Arruabarrena|LB|3|77|30|ar
Juan Pablo Sorín|Sorín|LB|11|80|29|ar
Marcos Senna|Senna|DM|19|83|29|es
Alessio Tacchinardi|Tacchinardi|CM|8|79|29|it
Josico|Josico|CM|15|75|30|es
Juan Román Riquelme|Riquelme|AM|8|89|27|ar
Santi Cazorla|Cazorla|AM|20|75|21|es
Héctor Font|Font|RW|17|73|21|es
Diego Forlán|Forlán|ST|5|85|26|uy
Guillermo Franco|Franco|ST|9|80|29|ar
José Mari|José Mari|ST|7|77|27|es
Luciano Figueroa|Figueroa|ST|10|75|24|ar
= celta 2002 4-4-2
José Manuel Pinto|Pinto|GK|13|79|27|es
Pablo Cavallero|Cavallero|GK|1|77|28|ar
Velasco|Velasco|RB|2|75|28|es
Eduardo Berizzo|Berizzo|CB|4|79|33|ar
Fernando Cáceres|Cáceres|CB|5|79|33|ar
Sergio Fernández|Sergio|CB|6|73|25|es
Juanfran García|Juanfran|LB|3|79|26|es
Peter Luccin|Luccin|DM|15|78|23|fr
Everton Giovanella|Giovanella|CM|8|77|32|br
José Ignacio|José Ignacio|CM|16|75|30|es
Aleksandr Mostovoi|Mostovoi|AM|10|86|34|ru
Jandro|Jandro|AM|17|73|28|es
Edu|Edu|RW|7|79|23|br
Jesuli|Jesuli|RW|18|75|23|es
Gustavo López|Gustavo López|LW|11|81|29|ar
Savo Milošević|Milošević|ST|9|79|29|rs
Catanha|Catanha|ST|19|77|30|br
Benni McCarthy|McCarthy|ST|20|75|25|za
= espanyol 2006 4-4-2
Carlos Kameni|Kameni|GK|1|81|22|cm
Iñaki Lafuente|Lafuente|GK|13|73|30|es
Pablo Zabaleta|Zabaleta|RB|2|79|21|ar
Francisco Chica|Chica|RB|15|73|21|es
Marc Torrejón|Torrejón|CB|5|75|20|es
Jesús Lacruz|Lacruz|CB|4|73|28|es
Moisés Hurtado|Moisés|CB|6|75|25|es
David García|David García|LB|3|73|25|es
Francisco Rufete|Rufete|CM|8|75|30|es
Iván de la Peña|De la Peña|AM|10|83|30|es
Jónatas|Jónatas|AM|17|73|24|br
Ángel Martínez|Ángel|CM|16|70|20|es
Albert Riera|Riera|LW|11|81|24|es
Luis García|Luis García|ST|7|80|25|es
Raúl Tamudo|Tamudo|ST|23|84|29|es
Walter Pandiani|Pandiani|ST|9|79|30|uy
Ferran Corominas|Corominas|ST|19|73|23|es
Moha|Moha|RW|18|67|20|ma
= getafe 2019 4-4-2
David Soria|Soria|GK|13|81|26|es
Rubén Yáñez|Yáñez|GK|1|67|26|es
Damián Suárez|Damián Suárez|RB|22|77|31|uy
Allan Nyom|Nyom|RB|12|73|31|cm
Djené Dakonam|Djené|CB|2|81|28|tg
Leandro Cabrera|Cabrera|CB|3|79|28|uy
Xabier Etxeita|Etxeita|CB|4|75|32|es
Marc Cucurella|Cucurella|LB|15|79|21|es
Mathías Olivera|Olivera|LB|17|75|22|uy
Mauro Arambarri|Arambarri|DM|18|79|24|uy
Nemanja Maksimović|Maksimović|CM|20|79|25|rs
David Timor|Timor|CM|5|73|30|es
Kenedy|Kenedy|LW|21|73|24|br
Portu|Portu|RW|24|75|28|es
Faycal Fajr|Fajr|AM|8|73|31|ma
Ángel Rodríguez|Ángel|ST|9|79|32|es
Jaime Mata|Jaime Mata|ST|7|79|31|es
Jorge Molina|Molina|ST|10|75|37|es
Deyverson|Deyverson|ST|19|70|28|br
= girona 2023 4-2-3-1
Paulo Gazzaniga|Gazzaniga|GK|13|81|32|ar
Juan Carlos|Juan Carlos|GK|1|70|35|es
Yan Couto|Yan Couto|RB|20|80|21|br
Arnau Martínez|Arnau Martínez|RB|4|77|21|es
Eric García|Eric García|CB|25|80|23|es
Daley Blind|Blind|CB|17|77|34|nl
David López|David López|CB|5|77|34|es
Juanpe|Juanpe|CB|15|73|32|es
Miguel Gutiérrez|Miguel Gutiérrez|LB|3|81|22|es
Aleix García|Aleix García|CM|14|83|26|es
Oriol Romeu|Romeu|DM|18|75|32|es
Iván Martín|Iván Martín|CM|23|79|25|es
Yangel Herrera|Yangel Herrera|CM|21|77|26|ve
Savinho|Savinho|RW|11|82|19|br
Viktor Tsygankov|Tsygankov|RW|8|80|26|ua
Portu|Portu|RW|24|77|31|es
Valery Fernández|Valery|LW|16|73|24|es
Artem Dovbyk|Dovbyk|ST|9|83|26|ua
Cristhian Stuani|Stuani|ST|7|77|37|uy
= osasuna 2005 4-4-2
Ricardo López|Ricardo|GK|1|81|34|es
Juan Elía|Elía|GK|13|70|30|es
César Cruchaga|Cruchaga|CB|5|77|31|es
Josetxo|Josetxo|CB|4|75|29|es
Miguel Flaño|Flaño|CB|15|73|21|es
Ignacio Izquierdo|Izquierdo|RB|2|73|29|es
Javier Corrales|Corrales|LB|3|73|30|es
Patxi Puñal|Puñal|CM|8|77|30|es
Raúl García|Raúl García|CM|16|77|19|es
Pablo García|Pablo García|DM|6|75|28|uy
Ludovic Delporte|Delporte|AM|10|75|25|fr
David López|David López|RW|7|77|23|es
Valdo|Valdo|LW|11|79|24|es
Juanfran|Juanfran|LW|17|75|20|es
Pierre Webó|Webó|ST|9|78|23|cm
Savo Milošević|Milošević|ST|19|77|32|rs
Ion Pérez|Ion Pérez|ST|18|67|23|es
Javi García|Javi García|CM|20|70|23|es
= mallorca 1998 4-4-2
Carlos Roa|Roa|GK|13|83|29|ar
César Gálvez|Gálvez|GK|1|67|28|es
Javier Olaizola|Olaizola|RB|14|75|29|es
Gustavo Siviero|Siviero|CB|4|77|29|ar
Marcelino Elena|Marcelino|CB|5|78|27|es
Lluís Carreras|Carreras|CB|7|73|26|es
Fernando Niño|Niño|CB|26|70|24|es
Miquel Soler|Miquel Soler|LB|3|75|33|es
Vicente Engonga|Engonga|DM|23|77|33|es
Paco Soler|Paco Soler|CM|15|73|28|es
Lauren|Lauren|CM|12|77|21|cm
Mauricio Pineda|Pineda|CM|2|73|23|ar
Ariel Ibagaza|Ibagaza|AM|10|81|22|ar
Jovan Stanković|Stanković|LW|11|80|27|rs
Óscar Arpón|Arpón|RW|16|73|23|es
Dani García|Dani|ST|9|81|24|es
Leonardo Biagini|Biagini|ST|22|78|21|ar
Ariel López|Ariel López|ST|24|73|24|ar
Carlitos|Carlitos|ST|8|70|24|es
= alaves 2000 3-5-2
Martín Herrera|Herrera|GK|1|79|30|ar
Kike Burgos|Kike|GK|13|70|29|es
Antonio Karmona|Karmona|CB|5|77|31|es
Óscar Téllez|Téllez|CB|4|77|25|es
Dan Eggen|Eggen|CB|6|75|30|no
Cosmin Contra|Contra|RB|2|81|25|ro
Delfí Geli|Geli|LB|3|75|31|es
Martín Astudillo|Astudillo|DM|8|77|23|ar
Hermes Desio|Desio|CM|15|77|30|ar
Ivan Tomić|Tomić|CM|16|77|25|rs
Jordi Cruyff|Jordi Cruyff|AM|14|79|27|nl
Ibon Begoña|Begoña|CM|17|73|27|es
Iván Alonso|Iván Alonso|ST|9|77|21|uy
Javi Moreno|Javi Moreno|ST|7|83|26|es
Magno Mocelin|Magno|LW|11|75|26|br
Pablo Gómez|Pablo Gómez|RW|18|73|25|es
Raúl Llorente|Llorente|CB|19|70|24|es
Rodolfo Vucetich|Vucetich|ST|20|67|24|ar
= rayo 2024 4-2-3-1
Augusto Batalla|Batalla|GK|13|78|28|ar
Dani Cárdenas|Cárdenas|GK|1|70|27|es
Andrei Rațiu|Rațiu|RB|2|77|26|ro
Iván Balliu|Balliu|RB|20|70|32|al
Florian Lejeune|Lejeune|CB|24|78|33|fr
Abdul Mumin|Mumin|CB|16|75|26|gh
Aridane Hernández|Aridane|CB|5|73|35|es
Pep Chavarría|Chavarría|LB|3|75|26|es
Pathé Ciss|Ciss|DM|6|75|30|sn
Óscar Valentín|Óscar Valentín|DM|23|75|30|es
Unai López|Unai López|CM|17|77|29|es
Pedro Díaz|Pedro Díaz|CM|4|75|26|es
Isi Palazón|Isi|AM|7|81|29|es
Óscar Trejo|Trejo|AM|8|73|36|ar
Jorge de Frutos|De Frutos|RW|19|77|27|es
Álvaro García|Álvaro García|LW|18|77|32|es
Sergio Camello|Camello|ST|10|75|23|es
Randy Nteka|Nteka|ST|21|70|27|fr
Raúl de Tomás|RDT|ST|11|73|29|es
= elche 2020 4-4-2
Edgar Badía|Badía|GK|13|79|28|es
Kiko Casilla|Casilla|GK|1|71|34|es
Josema Sánchez|Josema|RB|2|70|24|es
Diego González|Diego González|CB|5|73|26|es
Gonzalo Verdú|Verdú|CB|4|73|32|es
Enzo Roco|Roco|CB|6|71|28|cl
Johan Mojica|Mojica|LB|22|77|28|co
Helibelton Palacios|Palacios|RB|15|68|27|co
Raúl Guti|Raúl Guti|CM|8|77|23|es
Iván Marcone|Marcone|DM|16|75|30|ar
Fidel Chaves|Fidel|RW|10|75|31|es
Pere Milla|Pere Milla|LW|11|75|28|es
Tete Morente|Tete Morente|RW|7|71|24|es
Emiliano Rigoni|Rigoni|RW|17|71|28|ar
Josan|Josan|LW|18|68|31|es
Lucas Boyé|Boyé|ST|9|77|25|ar
Guido Carrillo|Carrillo|ST|19|70|29|ar
Darwin Benítez|Darwin|LW|20|66|26|py
= levante 2011 4-4-2
Gustavo Munúa|Munúa|GK|1|77|33|uy
Keylor Navas|Navas|GK|13|77|24|cr
Javi Venta|Javi Venta|RB|2|75|35|es
Sergio Ballesteros|Ballesteros|CB|5|77|36|es
Héctor Rodas|Rodas|CB|4|73|23|es
Nano|Nano|CB|15|70|26|es
Juanfran|Juanfran|LB|3|75|35|es
Pedro López|Pedro López|RB|16|70|27|es
Vicente Iborra|Iborra|DM|6|77|23|es
Xavi Torres|Xavi Torres|CM|8|73|25|es
Juanlu|Juanlu|RW|7|75|31|es
Valdo|Valdo|LW|11|77|30|es
Iván Barkero|Barkero|AM|10|77|31|es
Juan Francisco Moreno|Juanfran Moreno|LW|17|70|23|es
Arouna Koné|Koné|ST|9|81|27|ci
Felipe Caicedo|Caicedo|ST|19|77|23|ec
Rubén Suárez|Rubén Suárez|ST|18|73|32|es
Gustavo Cabral|Cabral|CB|14|70|26|ar
// FIM
`,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
  else (root.DEZ_BRUTO = root.DEZ_BRUTO || []).push(D);
})(typeof window !== 'undefined' ? window : this);
