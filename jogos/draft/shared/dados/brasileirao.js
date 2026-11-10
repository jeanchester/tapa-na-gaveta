// Football Draft: Brasileirão (Série A 2026 e históricos)
// Formato: ver shared/dez-dados.js. Notas na escala única (docs/PROMPT_DADOS_REAIS.md, seção 3).
(function (root) {
  'use strict';
  const D = {
    id: 'brasileirao', origem: 'br',
    times: `
athletico|Athletico-PR|||CAP|#C8102E|#111111|png
atleticomg|Atlético-MG|||CAM|#111111|#FFFFFF|png
bahia|Bahia|||BAH|#FFFFFF|#00316B|png
botafogo|Botafogo|||BOT|#111111|#FFFFFF|png
bragantino|RB Bragantino|||RBB|#FFFFFF|#D2003C|png
chapecoense|Chapecoense|||CHA|#00873E|#FFFFFF|png
corinthians|Corinthians|||COR|#FFFFFF|#111111|png
coritiba|Coritiba|||CFC|#FFFFFF|#00543C|png
cruzeiro|Cruzeiro|||CRU|#0047AB|#FFFFFF|png
flamengo|Flamengo|||FLA|#C8102E|#111111|png
fluminense|Fluminense|||FLU|#8A1538|#FFFFFF|png
gremio|Grêmio|||GRE|#0097D7|#111111|png
internacional|Internacional|||INT|#E30613|#FFFFFF|png
mirassol|Mirassol|||MIR|#FFD200|#006B3F|png
palmeiras|Palmeiras|||PAL|#006437|#FFFFFF|png
remo|Remo|||REM|#0B1F4B|#FFFFFF|png
santos|Santos|||SAN|#FFFFFF|#111111|png
sp|São Paulo|||SAO|#FFFFFF|#E30613|png
vasco|Vasco|||VAS|#111111|#FFFFFF|png
vitoria|Vitória|||VIT|#E30613|#111111|png`,
    elencos: `
// ======================================================== Série A 2026 (elencos do Você Escala, 20-23 mais relevantes)
= palmeiras 2026 4-2-3-1
Carlos Miguel|Carlos Miguel|GK|1|79|27|br
Marcelo Lomba|Lomba|GK|14|66|39|br
Agustín Giay|Giay|RB|4|75|22|ar
Khellven|Khellven|RB|12|71|25|br
Gustavo Gómez|Gustavo Gómez|CB|15|78|33|py
Murilo|Murilo|CB|26|77|29|br
Bruno Fuchs|Bruno Fuchs|CB|3|74|27|br
Benedetti|Benedetti|CB|43|67|20|br
Joaquín Piquerez|Piquerez|LB|22|77|27|uy
Jefté|Jefté|LB|6|70|22|br
Marlon Freitas|Marlon Freitas|DM|17|76|31|br
Emiliano Martínez|E. Martínez|DM|32|70|26|uy
Andreas Pereira|Andreas|CM|8|78|30|br
Lucas Evangelista|Evangelista|CM|30|74|31|br
Allan|Allan|CM|40|70|21|br
Paulinho|Paulinho|AM|10|77|25|br
Maurício|Maurício|AM|18|73|24|br
Jhon Arias|Jhon Arias|RW|11|80|28|co
Felipe Anderson|Felipe Anderson|RW|7|76|33|br
Ramón Sosa|Ramón Sosa|LW|19|73|26|py
Vitor Roque|Vitor Roque|ST|9|81|21|br
José Manuel López|Flaco López|ST|42|75|25|ar
Luighi|Luighi|ST|31|65|20|br
= flamengo 2026 4-3-3
Agustín Rossi|Rossi|GK|1|79|30|ar
Andrew|Andrew|GK|42|67|25|br
Guillermo Varela|Varela|RB|2|75|33|uy
Emerson Royal|Emerson Royal|RB|22|74|27|br
Léo Ortiz|Léo Ortiz|CB|3|79|30|br
Léo Pereira|Léo Pereira|CB|4|79|30|br
Vitão|Vitão|CB|44|75|26|br
Danilo|Danilo|CB|13|74|34|br
Alex Sandro|Alex Sandro|LB|26|74|35|br
Ayrton Lucas|Ayrton Lucas|LB|6|74|28|br
Erick Pulgar|Pulgar|DM|5|76|32|cl
Jorginho|Jorginho|DM|21|79|34|it
Saúl Ñíguez|Saúl|CM|8|77|31|es
Nicolás de la Cruz|De la Cruz|CM|18|78|29|uy
Giorgian de Arrascaeta|Arrascaeta|AM|10|84|32|uy
Lucas Paquetá|Paquetá|AM|20|81|28|br
Jorge Carrascal|Carrascal|AM|15|77|28|co
Gonzalo Plata|Plata|RW|19|76|25|ec
Luiz Araújo|Luiz Araújo|RW|7|75|29|br
Samuel Lino|Samuel Lino|LW|16|78|26|br
Bruno Henrique|Bruno Henrique|LW|27|75|35|br
Pedro|Pedro|ST|9|81|29|br
Wallace Yan|Wallace Yan|ST|64|70|21|br
= botafogo 2026 4-2-3-1
Raul|Raul|GK|1|71|29|br
Léo Linck|Léo Linck|GK|24|70|25|br
Vitinho|Vitinho|RB|2|73|26|br
Mateo Ponte|Ponte|RB|4|70|22|uy
Bastos|Bastos|CB|15|74|34|ao
Nahuel Ferraresi|Ferraresi|CB|5|71|27|ve
Marquinhos|Marquinhos|CB|16|66|23|br
Gabriel Justino|Justino|CB|34|64|21|br
Alex Telles|Alex Telles|LB|13|74|33|br
Marçal|Marçal|LB|21|68|37|br
Allan|Allan|DM|25|71|35|br
Newton|Newton|DM|28|68|26|br
Danilo Santos|Danilo|CM|8|78|25|br
Cristian Medina|Medina|CM|6|74|24|ar
Santiago Rodríguez|Santi Rodríguez|AM|23|79|26|uy
Álvaro Montoro|Montoro|AM|10|73|19|ar
Jordan Barrera|Barrera|AM|14|70|22|co
Júnior Santos|Júnior Santos|RW|7|74|31|br
Nathan Fernandes|Nathan Fernandes|RW|16|68|21|br
Matheus Martins|Matheus Martins|LW|11|73|22|br
Arthur Cabral|Arthur Cabral|ST|19|74|28|br
Joaquín Correa|Correa|ST|30|74|31|ar
Chris Ramos|Chris Ramos|ST|9|71|29|es
= internacional 2026 4-2-3-1
Sergio Rochet|Rochet|GK|1|78|33|uy
Anthoni|Anthoni|GK|12|71|24|br
Braian Aguirre|Aguirre|RB|35|73|25|ar
Victor Gabriel|Victor Gabriel|RB|41|65|20|br
Guillermo Maripán|Maripán|CB|13|77|31|cl
Félix Torres|Félix Torres|CB|4|74|29|ec
Gabriel Mercado|Mercado|CB|25|70|39|ar
Juninho|Juninho|CB|18|68|29|br
Alexandro Bernabei|Bernabei|LB|26|77|25|ar
Matheus Bahia|Matheus Bahia|LB|6|68|26|br
Thiago Maia|Thiago Maia|DM|29|75|29|br
Rodrigo Villagra|Villagra|DM|5|73|25|ar
Bruno Henrique|Bruno Henrique|CM|8|74|36|br
Bruno Gomes|Bruno Gomes|CM|15|73|25|br
Ronaldo|Ronaldo|CM|16|70|29|br
Alan Patrick|Alan Patrick|AM|10|80|34|br
Alan Rodríguez|A. Rodríguez|AM|14|73|26|py
Johan Carbonero|Carbonero|RW|7|73|26|co
Bruno Tabata|Tabata|RW|17|71|29|br
Vitinho|Vitinho|RW|28|71|27|br
Kayky|Kayky|LW|11|68|23|br
Alerrandro|Alerrandro|ST|9|76|25|br
= sp 2026 4-2-3-1
Rafael|Rafael|GK|23|77|36|br
Carlos Coronel|Coronel|GK|31|70|29|py
Cédric Soares|Cédric|RB|21|71|34|pt
João Moreira|João Moreira|RB|15|65|21|br
Robert Arboleda|Arboleda|CB|5|76|34|ec
Rafael Tolói|Tolói|CB|2|74|35|br
Alan Sabino|Sabino|CB|35|70|29|br
Wendell|Wendell|LB|18|73|32|br
Enzo Díaz|Enzo Díaz|LB|13|73|30|ar
Pablo Maia|Pablo Maia|DM|29|77|24|br
Luan|Luan|DM|33|65|26|br
Marcos Antônio|Marcos Antônio|CM|8|74|26|br
Damián Bobadilla|Bobadilla|CM|16|73|24|py
Danielzinho|Danielzinho|CM|94|63|21|br
Lucas Moura|Lucas Moura|AM|7|79|33|br
Cauly|Cauly|AM|80|70|30|br
Gonzalo Tapia|Tapia|RW|14|73|24|cl
Ferreirinha|Ferreira|LW|11|74|28|br
Victor Sá|Victor Sá|LW|7|67|26|br
Jonathan Calleri|Calleri|ST|9|76|32|ar
Luciano|Luciano|ST|10|75|33|br
André Silva|André Silva|ST|17|70|28|br
= corinthians 2026 4-2-3-1
Hugo Souza|Hugo Souza|GK|1|78|27|br
Felipe Longo|Felipe Longo|GK|40|65|21|br
Matheuzinho|Matheuzinho|RB|2|74|25|br
Pedro Milans|Milans|RB|20|67|24|uy
Gustavo Henrique|Gustavo Henrique|CB|13|75|33|br
André Ramalho|André Ramalho|CB|5|75|34|br
Gabriel Paulista|Gabriel Paulista|CB|3|74|35|br
Matheus Bidu|Bidu|LB|21|73|27|br
Fabrizio Angileri|Angileri|LB|26|73|32|ar
Raniele|Raniele|DM|14|73|29|br
Allan|Allan|DM|29|70|35|br
Breno Bidon|Breno Bidon|CM|7|73|21|br
Charles|Charles|CM|35|70|30|br
Alex Santana|Alex Santana|CM|80|70|30|br
Rodrigo Garro|Garro|AM|8|79|28|ar
Jesse Lingard|Lingard|AM|77|75|33|en
Zakaria Labyad|Labyad|AM|52|71|33|ma
André Carrillo|Carrillo|RW|19|74|35|pe
Vitinho|Vitinho|RW|11|67|26|br
Memphis Depay|Memphis|LW|10|79|32|nl
Yuri Alberto|Yuri Alberto|ST|9|77|25|br
Pedro Raul|Pedro Raul|ST|18|70|29|br
Dieguinho|Dieguinho|ST|61|63|19|br
= bahia 2026 4-2-3-1
Ronaldo|Ronaldo|GK|1|70|29|br
Léo Vieira|Léo Vieira|GK|22|63|24|br
Santiago Arias|Arias|RB|21|71|34|co
Zé Guilherme|Zé Guilherme|RB|66|63|21|br
David Duarte|David Duarte|CB|33|73|30|br
Kanu|Kanu|CB|4|71|28|br
Marcos Victor|Marcos Victor|CB|44|68|23|br
Luciano Juba|Juba|LB|46|78|26|br
Iago Borduchi|Iago|LB|25|67|28|br
Caio Alexandre|Caio Alexandre|DM|8|75|27|br
Nicolás Acevedo|Acevedo|DM|5|71|26|uy
Jean Lucas|Jean Lucas|CM|6|75|27|br
Rodrigo Nestor|Nestor|CM|11|71|25|br
Erick|Erick|CM|14|67|26|br
Everton Ribeiro|Everton Ribeiro|AM|10|75|37|br
Michel Araújo|Michel Araújo|AM|15|71|29|uy
Ademir|Ademir|RW|7|71|31|br
Erick Pulga|Erick Pulga|RW|16|71|25|br
Cristian Olivera|Olivera|LW|99|74|24|uy
Willian José|Willian José|ST|12|75|34|br
Alejo Véliz|Véliz|ST|9|67|22|ar
Everaldo|Everaldo|ST|27|66|34|br
= cruzeiro 2026 4-2-3-1
Cássio|Cássio|GK|1|75|39|br
Matheus Cunha|Matheus Cunha|GK|31|70|24|br
William|William|RB|12|73|30|br
Fágner|Fágner|RB|23|71|37|br
Fabrício Bruno|Fabrício Bruno|CB|15|78|30|br
Lucas Villalba|Villalba|CB|25|73|25|ar
Jonathan Jesus|Jonathan|CB|34|71|26|br
João Marcelo|João Marcelo|CB|43|68|25|br
Kauã Prates|Kauã Prates|LB|36|67|20|br
Lucas Silva|Lucas Silva|DM|16|74|33|br
Lucas Romero|Lucas Romero|DM|29|75|32|ar
Gerson|Gerson|CM|11|81|28|br
Matheus Henrique|Matheus Henrique|CM|8|76|28|br
Matheus Pereira|Matheus Pereira|AM|10|81|30|br
Rhuan Gabriel|Rhuan Gabriel|AM|10|65|19|br
Keny Arroyo|Arroyo|RW|99|73|20|ec
Wanderson|Wanderson|RW|94|71|31|br
Bruno Rodrigues|Bruno Rodrigues|RW|9|70|29|br
Luis Sinisterra|Sinisterra|LW|17|77|27|co
Marquinhos|Marquinhos|LW|7|68|26|br
Kaio Jorge|Kaio Jorge|ST|19|80|24|br
= vasco 2026 4-2-3-1
Léo Jardim|Léo Jardim|GK|1|78|31|br
Daniel Fuzato|Fuzato|GK|13|64|29|br
Paulo Henrique|Paulo Henrique|RB|96|71|29|br
Puma Rodríguez|Puma Rodríguez|RB|2|71|29|uy
Carlos Cuesta|Cuesta|CB|46|75|27|co
Robert Renan|Robert Renan|CB|30|71|22|br
Alan Saldivia|Saldivia|CB|4|71|23|cl
Lucas Freitas|Lucas Freitas|CB|43|65|24|br
Lucas Piton|Piton|LB|6|75|25|br
Cuiabano|Cuiabano|LB|66|66|23|br
Hugo Moura|Hugo Moura|DM|25|71|28|br
Thiago Mendes|Thiago Mendes|DM|23|70|34|br
Tchê Tchê|Tchê Tchê|CM|3|70|33|br
Jair|Jair|CM|8|71|21|br
Nuno Moreira|Nuno Moreira|AM|17|75|27|pt
Marino Hinestroza|Hinestroza|RW|18|74|23|co
Adson|Adson|RW|28|71|25|br
Andrés Gómez|Andrés Gómez|RW|11|70|23|co
David|David|LW|7|67|30|br
Claudio Spinelli|Spinelli|ST|77|73|28|ar
Brenner|Brenner|ST|20|66|26|br
= vitoria 2026 4-2-3-1
Lucas Arcanjo|Lucas Arcanjo|GK|1|73|27|br
Fintelman|Fintelman|GK|35|63|24|br
Mateusinho|Mateusinho|RB|98|67|28|br
Fabiano|Fabiano|RB|70|63|25|br
Camutanga|Camutanga|CB|4|70|31|br
Zé Marcos|Zé Marcos|CB|4|67|31|br
Edu|Edu|CB|43|66|27|br
Cacá|Cacá|CB|25|66|26|br
Jamerson|Jamerson|LB|83|67|27|br
Ramon|Ramon|LB|13|64|24|br
Gabriel Baralhas|Baralhas|DM|44|70|26|br
Caíque|Caíque|DM|95|65|24|br
Dudu|Dudu|CM|21|67|27|br
Edenilson|Edenilson|CM|26|67|36|br
Matheuzinho|Matheuzinho|AM|10|73|30|br
Aitor Cantalapiedra|Cantalapiedra|AM|17|70|29|es
Erick|Erick|RW|33|70|28|br
Marinho|Marinho|RW|7|70|36|br
Osvaldo|Osvaldo|LW|11|66|38|br
Renato Kayzer|Renato Kayzer|ST|79|75|30|br
Anderson|Anderson|ST|28|65|25|br
= atleticomg 2026 4-2-3-1
Everson|Everson|GK|22|76|35|br
Gabriel Delfim|Delfim|GK|1|63|24|br
Natanael|Natanael|RB|2|70|24|br
Angelo Preciado|Preciado|RB|23|75|28|ec
Lyanco|Lyanco|CB|13|75|29|br
Iván Román|Román|CB|3|75|22|cl
Vitor Hugo|Vitor Hugo|CB|14|70|35|br
Ruan Tressoldi|Ruan|CB|4|70|27|br
Renan Lodi|Renan Lodi|LB|16|74|28|br
Alan Franco|Alan Franco|DM|21|74|27|ec
Alexsander|Alexsander|DM|5|75|23|br
Gustavo Scarpa|Scarpa|CM|10|79|32|br
Igor Gomes|Igor Gomes|CM|17|70|27|br
Maycon|Maycon|CM|8|70|28|br
Bernard|Bernard|AM|11|74|33|br
Reinier|Reinier|AM|19|70|24|br
Alan Minda|Minda|RW|27|73|22|ec
Tomás Cuello|Cuello|LW|28|73|26|ar
Dudu|Dudu|LW|92|70|34|br
Mateo Cassierra|Cassierra|ST|9|75|29|co
Cauã|Cauã|ST|29|61|19|br
= fluminense 2026 4-2-3-1
Fábio|Fábio|GK|1|76|45|br
Vitor Eudes|Vitor Eudes|GK|98|65|28|br
Samuel Xavier|Samuel Xavier|RB|2|70|35|br
Guga|Guga|RB|23|71|27|br
Thiago Silva|Thiago Silva|CB|3|79|41|br
Juan Pablo Freytes|Freytes|CB|22|75|25|ar
Ignácio|Ignácio|CB|4|71|29|br
Igor Rabello|Igor Rabello|CB|21|67|31|br
Guilherme Arana|Arana|LB|13|77|29|br
Renê|Renê|LB|6|66|33|br
Martinelli|Martinelli|DM|8|77|24|br
Hércules|Hércules|DM|35|77|25|br
Otávio|Otávio|DM|94|67|31|br
Nonato|Nonato|CM|16|67|27|br
Lucho Acosta|Lucho Acosta|AM|32|77|31|ar
Paulo Henrique Ganso|Ganso|AM|10|70|36|br
Jefferson Savarino|Savarino|RW|11|77|29|ve
Agustín Canobbio|Canobbio|RW|17|70|27|uy
Kevin Serna|Serna|RW|90|70|28|co
Yeferson Soteldo|Soteldo|LW|30|75|28|ve
Hulk|Hulk|ST|7|79|40|br
Germán Cano|Cano|ST|14|73|38|ar
John Kennedy|John Kennedy|ST|9|67|24|br
= gremio 2026 4-2-3-1
Weverton|Weverton|GK|1|77|38|br
Gabriel Grando|Grando|GK|12|63|25|br
Marcos Rocha|Marcos Rocha|RB|14|68|37|br
João Pedro|João Pedro|RB|18|65|29|br
Walter Kannemann|Kannemann|CB|4|71|35|ar
Wagner Leonardo|Wagner Leonardo|CB|3|73|26|br
Fabián Balbuena|Balbuena|CB|2|68|34|py
Gustavo Martins|Gustavo Martins|CB|6|67|23|br
Marlon|Marlon|LB|23|68|29|br
Caio Paulista|Caio Paulista|LB|38|67|28|br
Mathías Villasanti|Villasanti|DM|20|77|29|py
Dodi|Dodi|DM|17|71|30|br
Erick Noriega|Noriega|CM|19|71|25|pe
Juan Nardoni|Nardoni|CM|5|71|23|ar
Miguel Monsalve|Monsalve|AM|11|71|21|co
Willian|Willian|AM|10|70|37|br
Cristian Pavón|Pavón|RW|7|71|30|ar
Francis Amuzu|Amuzu|RW|9|71|26|be
Tetê|Tetê|RW|21|70|26|br
Jhonatan Enamorado|Enamorado|LW|99|67|27|co
Martin Braithwaite|Braithwaite|ST|22|78|35|dk
Carlos Vinícius|Carlos Vinícius|ST|95|70|31|br
= bragantino 2026 4-2-3-1
Cleiton|Cleiton|GK|1|76|28|br
Tiago Volpi|Volpi|GK|18|70|35|br
Agustín Sant'Anna|Sant'Anna|RB|23|68|25|uy
Andrés Hurtado|Hurtado|RB|34|66|26|co
Alix Vinicius|Alix|CB|4|73|25|br
Pedro Henrique|Pedro Henrique|CB|14|67|31|br
Guzmán Rodríguez|Guzmán Rodríguez|CB|2|68|27|uy
Eduardo Santos|Eduardo Santos|CB|3|67|28|br
Juninho Capixaba|Juninho Capixaba|LB|29|74|28|br
Vanderlan|Vanderlan|LB|12|73|23|br
Matheus Fernandes|M. Fernandes|DM|35|73|27|br
Fabinho|Fabinho|DM|5|65|29|br
Eric Ramires|Eric Ramires|CM|7|75|26|br
Gabriel|Gabriel|CM|6|67|27|br
Ignacio Sosa|Ignacio Sosa|CM|15|67|25|ar
Gustavinho|Gustavinho|AM|22|68|23|br
Rodriguinho|Rodriguinho|AM|20|65|22|br
Henry Mosquera|Henry Mosquera|RW|30|75|23|co
Lucas Barbosa|Lucas Barbosa|LW|21|74|25|br
Eduardo Sasha|Sasha|ST|8|73|34|br
Isidro Pitta|Pitta|ST|9|67|26|py
José Herrera|Herrera|ST|32|65|23|ve
= athletico 2026 4-2-3-1
Santos|Santos|GK|23|73|36|br
Mycael|Mycael|GK|1|63|22|br
Gastón Benavídez|Benavídez|RB|29|70|29|ar
Gilberto|Gilberto|RB|2|63|25|br
Arthur Dias|Arthur Dias|CB|4|70|25|br
Carlos Terán|Terán|CB|22|70|26|co
Juan Aguirre|Aguirre|CB|33|65|23|ar
Léo|Léo|CB|3|64|27|br
Lucas Esquivel|Esquivel|LB|37|70|24|py
Felipinho|Felipinho|DM|5|70|23|br
Luiz Gustavo|Luiz Gustavo|DM|14|67|28|br
Juan Portilla|Portilla|CM|27|70|28|co
Jádson|Jádson|CM|16|65|31|br
Bruno Zapelli|Zapelli|AM|10|75|24|ar
Lucas Marezi|Marezi|AM|10|63|22|br
Stiven Mendoza|Mendoza|RW|7|70|33|co
Leozinho|Leozinho|RW|21|63|22|br
Isaac|Isaac|LW|11|63|21|br
Kevin Viveros|Viveros|ST|9|76|26|co
Renan Peixoto|Renan Peixoto|ST|70|65|28|br
= santos 2026 4-2-3-1
Gabriel Brazão|Brazão|GK|77|76|25|br
Diógenes|Diógenes|GK|1|65|31|br
Mayke|Mayke|RB|12|70|33|br
Igor Vinícius|Igor Vinícius|RB|18|70|29|br
Lucas Veríssimo|Veríssimo|CB|4|75|30|br
Zé Ivaldo|Zé Ivaldo|CB|2|73|29|br
Adonis Frías|Frías|CB|98|73|28|ar
Luan Peres|Luan Peres|CB|14|70|31|br
Gonzalo Escobar|Escobar|LB|31|70|28|ar
João Schmidt|João Schmidt|DM|5|73|33|br
Zé Rafael|Zé Rafael|DM|6|75|33|br
Willian Arão|Arão|CM|15|73|34|br
Gabriel Menino|Gabriel Menino|CM|25|73|25|br
Neymar Jr.|Neymar|AM|10|81|34|br
Benjamín Rollheiser|Rollheiser|AM|32|75|26|ar
Thaciano|Thaciano|AM|16|70|31|br
Rony|Rony|RW|11|70|31|br
Álvaro Barreal|Barreal|LW|22|73|26|ar
Gabriel Barbosa|Gabigol|ST|9|75|29|br
Lautaro Díaz|Lautaro Díaz|ST|19|70|27|ar
Moisés|Moisés|ST|21|65|25|br
= mirassol 2026 4-2-3-1
Walter|Walter|GK|22|73|38|br
Alex Muralha|Muralha|GK|23|63|36|br
Daniel Borges|Daniel Borges|RB|20|70|33|br
Igor Formiga|Igor Formiga|RB|32|65|28|br
João Victor|João Victor|CB|34|70|27|br
Willian Machado|Willian Machado|CB|3|66|31|br
Gabriel|Gabriel|CB|44|63|26|br
Elias|Elias|CB|18|63|29|br
Reinaldo|Reinaldo|LB|6|76|36|br
Victor Luís|Victor Luís|LB|12|65|32|br
José Aldo|José Aldo|DM|21|66|29|br
Neto Moura|Neto Moura|DM|25|70|28|br
Gabriel Pires|Gabriel Pires|CM|18|65|32|br
Chico|Chico|CM|10|68|31|br
Shaylon|Shaylon|AM|7|73|29|br
Negueba|Negueba|RW|11|73|33|br
Everton Galdino|Galdino|RW|17|67|29|br
Alesson|Alesson|LW|77|73|29|br
Fernandinho|Fernandinho|LW|17|65|25|br
Tiquinho Soares|Tiquinho|ST|29|73|35|br
André Luís|André Luís|ST|9|67|28|br
= coritiba 2026 4-2-3-1
Pedro Rangel|Pedro Rangel|GK|22|70|23|br
Keiller|Keiller|GK|13|63|28|br
João Pedro Chermont|Chermont|RB|44|70|26|br
Tinga|Tinga|RB|2|63|23|br
Maicon|Maicon|CB|3|68|37|br
Rodrigo Moledo|Moledo|CB|4|67|38|br
Jacy|Jacy|CB|55|66|24|br
Thiago Santos|Thiago Santos|CB|21|63|36|br
Felipe Jonatan|Felipe Jonatan|LB|6|70|28|br
Bruno Melo|Bruno Melo|LB|26|65|33|br
Willian Oliveira|Willian Oliveira|DM|29|70|32|br
Wallisson|Wallisson|DM|8|63|26|br
Sebastián Gómez|Sebastián Gómez|CM|19|70|28|co
Fernando Sobral|Sobral|CM|88|67|31|br
Josué|Josué|AM|10|74|36|br
Joaquín Lavega|Lavega|RW|7|65|22|uy
Breno Lopes|Breno Lopes|LW|77|75|30|br
Keno|Keno|LW|20|67|36|br
Pedro Rocha|Pedro Rocha|ST|32|68|31|br
Renato Marques|Renato Marques|ST|78|65|23|br
Lucas Ronier|Lucas Ronier|ST|11|64|21|br
= chapecoense 2026 4-4-2
Anderson|Anderson|GK|98|67|35|br
Rafael Santos|Rafael Santos|GK|1|60|30|br
Marcos Vinícius|Marcos Vinícius|RB|2|63|26|br
Everton|Everton|RB|26|59|27|br
Bruno Leonardo|Bruno Leonardo|CB|33|65|31|br
Rafael Thyere|Rafael Thyere|CB|15|65|32|br
Doma|Doma|CB|3|63|27|br
Victor Caetano|Victor Caetano|CB|25|60|25|br
Bruno Pacheco|Bruno Pacheco|LB|91|65|32|br
Mancha|Mancha|LB|6|60|24|br
Camilo|Camilo|DM|27|65|30|br
Robert Santos|Robert Santos|DM|8|61|26|br
Giovanni Augusto|Giovanni Augusto|CM|10|68|36|br
Bruno Matias|Bruno Matias|CM|16|61|28|br
Marcinho|Marcinho|AM|7|70|30|br
Ênio|Ênio|AM|97|62|28|br
Italo|Italo|RW|77|64|26|br
Yannick Bolasie|Bolasie|LW|11|65|37|cd
Neto Pessoa|Neto Pessoa|ST|18|65|32|br
Garcez|Garcez|ST|31|61|26|br
Mário Milani|Milani|ST|8|61|24|br
= remo 2026 4-2-3-1
Marcelo Rangel|Marcelo Rangel|GK|88|67|38|br
Ivan|Ivan|GK|97|61|29|br
Marcelinho|Marcelinho|RB|79|63|29|br
João Lucas|João Lucas|RB|2|61|28|br
Marllon|Marllon|CB|13|65|34|br
Kayky Almeida|Kayky Almeida|CB|27|61|22|br
Léo Andrade|Léo Andrade|CB|5|62|28|br
Dilan Tchamba|Tchamba|CB|18|63|26|br
Mayk|Mayk|LB|98|63|26|br
Bruno Cufré|Cufré|LB|24|61|29|ar
Patrick de Paula|Patrick de Paula|DM|12|68|26|br
José Welison|José Welison|DM|28|61|31|br
Zé Ricardo|Zé Ricardo|DM|55|61|29|br
Lucas Picco|Picco|CM|14|65|25|ar
Facundo Catarozzi|Catarozzi|CM|23|61|26|ar
Vitor Bueno|Vitor Bueno|AM|15|67|31|br
Jáderson|Jáderson|AM|10|63|25|br
Yago Pikachu|Pikachu|RW|22|70|34|br
Alef Manga|Alef Manga|LW|11|65|31|br
Jaja Silva|Jaja|LW|37|61|28|br
Gabriel Taliari|Taliari|ST|19|65|24|br
Gabriel Poveda|Poveda|ST|99|61|23|br
// FIM ATUAIS
// ======================================================== históricos
= flamengo 1981 4-3-3
Raul Plassmann|Raul|GK|1|81|36|br
Cantarele|Cantarele|GK|12|70|28|br
Leandro|Leandro|RB|2|84|22|br
Nei Dias|Nei Dias|RB|13|70|24|br
Marinho|Marinho|CB|3|78|26|br
Mozer|Mozer|CB|4|80|21|br
Rondinelli|Rondinelli|CB|14|77|26|br
Figueiredo|Figueiredo|CB|15|73|25|br
Júnior|Júnior|LB|6|86|27|br
Andrade|Andrade|DM|5|83|24|br
Vítor|Vítor|DM|16|70|26|br
Adílio|Adílio|CM|8|84|25|br
Zico|Zico|AM|10|91|28|br
Tita|Tita|RW|7|83|23|br
Lico|Lico|LW|11|79|30|br
Baroninho|Baroninho|LW|17|75|25|br
Nunes|Nunes|ST|9|81|27|br
Anselmo|Anselmo|ST|19|73|23|br
Peu|Peu|ST|18|73|22|br
= palmeiras 1999 4-4-2
Marcos|Marcos|GK|12|84|25|br
Sérgio|Sérgio|GK|1|70|28|br
Francisco Arce|Arce|RB|2|81|29|py
Neném|Neném|RB|13|70|26|br
Júnior Baiano|Júnior Baiano|CB|3|79|29|br
Roque Júnior|Roque Júnior|CB|4|80|22|br
Cléber|Cléber|CB|14|77|30|br
Júnior|Júnior|LB|6|79|26|br
César Sampaio|César Sampaio|DM|5|81|31|br
Galeano|Galeano|DM|15|73|27|br
Rogério|Rogério|CM|8|75|26|br
Zinho|Zinho|CM|7|80|32|br
Alex|Alex|AM|10|84|21|br
Jackson|Jackson|AM|16|70|24|br
Euller|Euller|RW|17|78|28|br
Paulo Nunes|Paulo Nunes|LW|11|79|28|br
Evair|Evair|ST|9|79|34|br
Oséas|Oséas|ST|19|75|27|br
Agnaldo|Agnaldo|ST|18|70|25|br
= palmeiras 2021 4-2-3-1
Weverton|Weverton|GK|21|83|33|br
Jailson|Jailson|GK|42|70|40|br
Marcos Rocha|Marcos Rocha|RB|2|75|33|br
Mayke|Mayke|RB|12|73|29|br
Gustavo Gómez|Gustavo Gómez|CB|15|81|28|py
Luan|Luan|CB|13|77|28|br
Renan|Renan|CB|26|73|19|br
Joaquín Piquerez|Piquerez|LB|22|75|22|uy
Matías Viña|Viña|LB|17|75|24|uy
Danilo|Danilo|DM|28|79|20|br
Felipe Melo|Felipe Melo|DM|30|75|38|br
Zé Rafael|Zé Rafael|CM|8|77|28|br
Patrick de Paula|Patrick de Paula|CM|5|70|22|br
Raphael Veiga|Veiga|AM|23|83|26|br
Gustavo Scarpa|Scarpa|AM|14|79|27|br
Rony|Rony|RW|10|77|26|br
Gabriel Veron|Veron|RW|27|73|19|br
Dudu|Dudu|LW|7|81|29|br
Wesley|Wesley|LW|11|73|21|br
Breno Lopes|Breno Lopes|LW|19|70|25|br
Luiz Adriano|Luiz Adriano|ST|10|75|34|br
Deyverson|Deyverson|ST|18|73|30|br
= sp 1992 4-4-2
Zetti|Zetti|GK|1|81|27|br
Gilmar Rinaldi|Gilmar|GK|12|73|33|br
Cafu|Cafu|RB|2|83|22|br
Vítor|Vítor|RB|13|73|26|br
Antônio Carlos|Antônio Carlos|CB|3|79|23|br
Ronaldão|Ronaldão|CB|4|77|27|br
Adílson|Adílson|CB|14|75|25|br
Ronaldo Luís|Ronaldo Luís|LB|6|75|26|br
Pintado|Pintado|DM|5|78|27|br
Dinho|Dinho|DM|15|75|26|br
Toninho Cerezo|Cerezo|CM|8|79|37|br
Raí|Raí|AM|10|86|27|br
Palhinha|Palhinha|AM|16|79|25|br
Müller|Müller|ST|7|83|26|br
Elivélton|Elivélton|LW|11|79|21|br
Macedo|Macedo|ST|9|75|26|br
Catê|Catê|RW|17|73|19|br
Sídnei|Sídnei|ST|18|70|25|br
= sp 2005 3-5-2
Rogério Ceni|Rogério Ceni|GK|1|86|32|br
Bosco|Bosco|GK|12|70|30|br
Diego Lugano|Lugano|CB|5|83|24|uy
Fabão|Fabão|CB|4|77|28|br
Edcarlos|Edcarlos|CB|3|75|20|br
Alex Bruno|Alex Bruno|CB|14|70|23|br
Cicinho|Cicinho|RB|2|81|25|br
Júnior|Júnior|LB|6|78|32|br
Mineiro|Mineiro|DM|8|81|30|br
Josué|Josué|DM|15|79|26|br
Danilo|Danilo|AM|10|81|26|br
Souza|Souza|AM|16|73|29|br
Hernanes|Hernanes|CM|17|70|20|br
Richarlyson|Richarlyson|CM|19|73|23|br
Amoroso|Amoroso|ST|11|83|31|br
Luizão|Luizão|ST|9|79|30|br
Grafite|Grafite|ST|18|77|26|br
Aloísio|Aloísio|ST|7|77|30|br
Diego Tardelli|Diego Tardelli|ST|20|73|20|br
= santos 1962 4-4-2
Gilmar|Gilmar|GK|1|83|32|br
Laércio|Laércio|GK|12|67|27|br
Lima|Lima|RB|2|77|20|br
Mauro Ramos|Mauro|CB|3|81|31|br
Calvet|Calvet|CB|4|77|28|br
Olavo|Olavo|CB|13|73|27|br
Dalmo|Dalmo|LB|6|77|29|br
Zito|Zito|DM|5|84|30|br
Formiga|Formiga|DM|15|73|32|br
Mengálvio|Mengálvio|CM|8|81|23|br
Pelé|Pelé|AM|10|93|21|br
Dorval|Dorval|RW|7|81|27|br
Pepe|Pepe|LW|11|85|27|br
Tite|Tite|LW|17|73|32|br
Coutinho|Coutinho|ST|9|86|19|br
Pagão|Pagão|ST|18|73|28|br
Lalá|Lalá|ST|19|70|22|br
Ismael|Ismael|CB|14|70|25|br
= santos 2011 4-2-3-1
Rafael Cabral|Rafael|GK|1|77|21|br
Aranha|Aranha|GK|12|70|30|br
Danilo|Danilo|RB|2|75|19|br
Pará|Pará|RB|13|70|25|br
Edu Dracena|Edu Dracena|CB|4|77|29|br
Durval|Durval|CB|3|73|30|br
Bruno Rodrigo|Bruno Rodrigo|CB|14|67|26|br
Léo|Léo|LB|6|75|35|br
Alex Sandro|Alex Sandro|LB|16|75|20|br
Arouca|Arouca|DM|5|77|24|br
Adriano|Adriano|DM|15|73|26|br
Elano|Elano|CM|8|78|29|br
Ibson|Ibson|CM|17|73|27|br
Paulo Henrique Ganso|Ganso|AM|10|83|21|br
Alan Patrick|Alan Patrick|AM|18|70|19|br
Neymar|Neymar|LW|11|86|19|br
Zé Love|Zé Love|ST|9|75|23|br
Borges|Borges|ST|19|77|30|br
Keirrison|Keirrison|ST|20|70|22|br
= corinthians 1999 4-4-2
Dida|Dida|GK|1|83|25|br
Maurício|Maurício|GK|12|67|27|br
Índio|Índio|RB|2|73|24|br
Fábio Luciano|Fábio Luciano|CB|4|75|23|br
João Carlos|João Carlos|CB|3|75|26|br
Adílson|Adílson|CB|14|73|32|br
Kléber|Kléber|LB|6|77|19|br
Gilmar Fubá|Gilmar|DM|5|73|24|br
Vampeta|Vampeta|CM|8|81|25|br
Freddy Rincón|Rincón|CM|17|81|32|co
Edu Gaspar|Edu|CM|15|75|21|br
Ricardinho|Ricardinho|AM|11|81|23|br
Marcelinho Carioca|Marcelinho|AM|7|85|27|br
Edílson|Edílson|ST|10|83|28|br
Luizão|Luizão|ST|9|83|23|br
Fernando Baiano|Fernando Baiano|ST|18|75|19|br
Dinei|Dinei|ST|19|73|29|br
Batata|Batata|RW|16|70|25|br
= corinthians 2012 4-2-3-1
Cássio|Cássio|GK|12|81|25|br
Júlio César|Júlio César|GK|1|70|32|br
Alessandro|Alessandro|RB|2|75|35|br
Edenílson|Edenílson|RB|22|70|22|br
Chicão|Chicão|CB|3|75|31|br
Paulo André|Paulo André|CB|13|77|28|br
Leandro Castán|Castán|CB|4|77|25|br
Wallace|Wallace|CB|14|67|24|br
Fábio Santos|Fábio Santos|LB|6|77|27|br
Ralf|Ralf|DM|5|78|28|br
Paulinho|Paulinho|CM|8|83|23|br
Danilo|Danilo|AM|20|77|33|br
Alex|Alex|AM|11|77|29|br
Douglas|Douglas|AM|10|75|30|br
Jorge Henrique|Jorge Henrique|RW|23|75|30|br
Emerson Sheik|Emerson|LW|11|80|33|br
Paolo Guerrero|Guerrero|ST|9|81|28|pe
Liédson|Liédson|ST|19|75|34|br
Romarinho|Romarinho|ST|30|73|21|br
= vasco 1997 4-4-2
Carlos Germano|Carlos Germano|GK|1|81|27|br
Márcio|Márcio|GK|12|70|26|br
Maricá|Maricá|RB|2|73|28|br
Odvan|Odvan|CB|3|77|23|br
Mauro Galvão|Mauro Galvão|CB|4|79|35|br
Alex Pinho|Alex Pinho|CB|14|70|22|br
Felipe|Felipe|LB|6|81|20|br
Luisinho|Luisinho|DM|5|75|30|br
Nasa|Nasa|DM|15|75|28|br
Juninho Pernambucano|Juninho|CM|8|83|22|br
Ramon|Ramon|AM|10|79|24|br
Pedrinho|Pedrinho|AM|16|77|20|br
Edmundo|Edmundo|ST|7|89|26|br
Evair|Evair|ST|9|79|32|br
Donizete|Donizete|ST|11|77|29|br
Mauricinho|Mauricinho|RW|17|73|21|br
Válber|Válber|CB|13|73|30|br
Luís Carlos Goiano|Goiano|DM|18|70|27|br
= vasco 2000 4-4-2
Hélton|Hélton|GK|1|79|22|br
Carlos Germano|Carlos Germano|GK|12|75|30|br
Jorginho|Jorginho|RB|2|77|36|br
Clébson|Clébson|RB|13|70|25|br
Odvan|Odvan|CB|3|77|26|br
Júnior Baiano|Júnior Baiano|CB|4|79|30|br
Mauro Galvão|Mauro Galvão|CB|14|75|38|br
Fabiano Eller|Fabiano Eller|CB|15|73|22|br
Felipe|Felipe|LB|6|81|23|br
Jorginho Paulista|J. Paulista|LB|16|75|20|br
Nasa|Nasa|DM|5|73|31|br
Paulo Miranda|Paulo Miranda|DM|17|70|26|br
Juninho Pernambucano|Juninho|CM|8|85|25|br
Juninho Paulista|Juninho Paulista|AM|10|81|27|br
Pedrinho|Pedrinho|AM|18|77|23|br
Euller|Euller|RW|7|79|29|br
Romário|Romário|ST|11|89|34|br
Viola|Viola|ST|9|75|31|br
Donizete|Donizete|ST|19|75|32|br
= gremio 1983 4-3-3
Mazaropi|Mazaropi|GK|1|79|29|br
Remi|Remi|GK|12|67|26|br
Paulo Roberto|Paulo Roberto|RB|2|77|25|br
Baidek|Baidek|CB|4|75|27|br
Hugo De León|De León|CB|3|83|25|uy
Paulo César Magalhães|Paulo César|LB|6|75|29|br
Casemiro Mior|Casemiro|LB|13|70|28|br
China|China|DM|5|77|25|br
Bonamigo|Bonamigo|DM|15|77|30|br
Osvaldo|Osvaldo|CM|8|77|27|br
Mário Sérgio|Mário Sérgio|AM|10|83|33|br
Tita|Tita|AM|16|81|25|br
Paulo César Caju|Caju|AM|17|77|34|br
Renato Gaúcho|Renato Gaúcho|RW|7|86|21|br
Tarciso|Tarciso|LW|11|81|32|br
Caio|Caio|ST|9|77|25|br
Kita|Kita|ST|18|70|25|br
Newmar|Newmar|CB|14|70|25|br
= gremio 1995 4-4-2
Danrlei|Danrlei|GK|1|81|22|br
Murilo|Murilo|GK|12|65|23|br
Francisco Arce|Arce|RB|2|81|25|py
Rivarola|Rivarola|CB|4|77|27|uy
Adílson|Adílson|CB|3|79|28|br
Luciano|Luciano|CB|14|73|25|br
Roger|Roger|LB|6|75|20|br
Dinho|Dinho|DM|5|79|29|br
Luís Carlos Goiano|Goiano|DM|15|77|25|br
Émerson|Émerson|CM|8|77|19|br
Arílson|Arílson|CM|16|77|22|br
Carlos Miguel|Carlos Miguel|AM|10|81|23|br
Magno|Magno|RW|17|73|22|br
Paulo Nunes|Paulo Nunes|LW|7|83|24|br
Jardel|Jardel|ST|9|86|21|br
Nildo|Nildo|ST|11|73|26|br
Alexandre|Alexandre|ST|19|70|23|br
Gélson|Gélson|RB|13|70|24|br
= internacional 1979 4-3-3
Manga|Manga|GK|1|79|42|br
Benítez|Benítez|GK|12|81|31|py
João Carlos|João Carlos|RB|2|75|25|br
Mauro Pastor|Mauro Pastor|CB|4|77|24|br
Mauro Galvão|Mauro Galvão|CB|3|79|17|br
Cláudio Mineiro|Cláudio Mineiro|LB|6|77|25|br
Batista|Batista|DM|5|79|24|br
Falcão|Falcão|CM|8|89|25|br
Jair|Jair|AM|10|83|26|br
Valdomiro|Valdomiro|RW|7|81|33|br
Mário Sérgio|Mário Sérgio|LW|11|83|29|br
Bira|Bira|ST|9|79|27|br
Chico Spina|Chico Spina|ST|17|73|23|br
Adílson|Adílson|CM|16|70|23|br
Toninho|Toninho|RW|18|70|25|br
Marinho Peres|Marinho Peres|CB|14|75|32|br
Vacaria|Vacaria|DM|15|70|26|br
Paulinho|Paulinho|ST|19|70|24|br
= internacional 2006 4-4-2
Clemer|Clemer|GK|1|77|38|br
Renan|Renan|GK|12|70|22|br
Ceará|Ceará|RB|2|75|26|br
Índio|Índio|CB|4|77|31|br
Fabiano Eller|Fabiano Eller|CB|3|77|28|br
Bolívar|Bolívar|CB|14|75|26|br
Rubens Cardoso|Rubens Cardoso|LB|6|75|29|br
Jorge Wagner|Jorge Wagner|LB|16|77|28|br
Edinho|Edinho|DM|5|75|24|br
Wellington Monteiro|W. Monteiro|DM|15|73|25|br
Tinga|Tinga|CM|8|79|28|br
Fernandão|Fernandão|AM|9|84|28|br
Alex|Alex|AM|10|79|24|br
Adriano Gabiru|Gabiru|AM|17|73|29|br
Iarley|Iarley|ST|7|79|32|br
Rafael Sóbis|Sóbis|ST|11|81|21|br
Alexandre Pato|Pato|ST|19|75|17|br
Luiz Adriano|Luiz Adriano|ST|20|70|19|br
Michel|Michel|CM|18|70|25|br
= cruzeiro 1976 4-3-3
Raul Plassmann|Raul|GK|1|81|31|br
Hélio|Hélio|GK|12|67|27|br
Nelinho|Nelinho|RB|2|84|25|br
Morais|Morais|CB|4|75|27|br
Darci Menezes|Darci Menezes|CB|3|75|26|br
Ozires|Ozires|CB|14|70|25|br
Vanderlei Lázaro|Vanderlei|LB|6|75|26|br
Wilson Piazza|Piazza|DM|5|80|33|br
Zé Carlos|Zé Carlos|CM|8|77|29|br
Eduardo Amorim|Eduardo|CM|15|75|26|br
Dirceu Lopes|Dirceu Lopes|AM|10|81|30|br
Jairzinho|Jairzinho|RW|7|83|31|br
Joãozinho|Joãozinho|LW|11|84|22|br
Palhinha|Palhinha|ST|9|83|26|br
Roberto Batata|Roberto Batata|RW|17|77|27|br
Ronaldo Drummond|Ronaldo|ST|19|73|21|br
Nelson|Nelson|LB|13|70|23|br
Mário Ferreira|Mário|CM|16|70|24|br
= cruzeiro 2003 4-4-2
Gomes|Gomes|GK|1|81|22|br
Rogério Fidélis|Fidélis|GK|12|67|27|br
Maicon|Maicon|RB|2|79|22|br
Cris|Cris|CB|3|79|26|br
Luisão|Luisão|CB|4|81|22|br
Edu Dracena|Edu Dracena|CB|14|75|22|br
Leandro|Leandro|LB|6|75|25|br
Augusto Recife|Augusto Recife|DM|5|75|24|br
Maldonado|Maldonado|DM|15|77|24|cl
Felipe Melo|Felipe Melo|DM|16|73|20|br
Wendell|Wendell|CM|8|75|23|br
Alex|Alex|AM|10|88|26|br
Jussiê|Jussiê|LW|17|73|20|br
Martinez|Martinez|RW|7|75|23|br
Deivid|Deivid|ST|9|79|23|br
Aristizábal|Aristizábal|ST|11|79|31|co
Mota|Mota|ST|19|73|23|br
Márcio Nobre|Márcio Nobre|ST|18|73|23|br
= atleticomg 2013 4-2-3-1
Victor|Victor|GK|1|83|30|br
Giovanni|Giovanni|GK|12|65|25|br
Marcos Rocha|Marcos Rocha|RB|2|77|25|br
Michel|Michel|RB|13|67|23|br
Réver|Réver|CB|4|81|28|br
Leonardo Silva|Leonardo Silva|CB|3|78|34|br
Gilberto Silva|Gilberto Silva|CB|14|75|36|br
Richarlyson|Richarlyson|LB|6|73|30|br
Júnior César|Júnior César|LB|16|70|30|br
Pierre|Pierre|DM|5|75|30|br
Josué|Josué|DM|15|75|33|br
Leandro Donizete|Leandro Donizete|CM|8|75|30|br
Rosinei|Rosinei|CM|17|70|30|br
Ronaldinho|Ronaldinho|AM|10|86|33|br
Guilherme|Guilherme|AM|18|73|24|br
Bernard|Bernard|RW|11|83|20|br
Luan|Luan|RW|27|77|23|br
Diego Tardelli|Diego Tardelli|LW|9|81|28|br
Jô|Jô|ST|7|80|26|br
Alecsandro|Alecsandro|ST|19|70|32|br
= atleticomg 2021 4-2-3-1
Everson|Everson|GK|22|79|30|br
Rafael|Rafael|GK|1|70|31|br
Mariano|Mariano|RB|25|73|35|br
Guga|Guga|RB|2|73|23|br
Júnior Alonso|Júnior Alonso|CB|3|79|28|py
Nathan Silva|Nathan Silva|CB|16|75|24|br
Réver|Réver|CB|4|73|36|br
Igor Rabello|Igor Rabello|CB|14|73|26|br
Guilherme Arana|Arana|LB|13|81|24|br
Allan|Allan|DM|29|78|24|br
Jair|Jair|DM|8|75|26|br
Tchê Tchê|Tchê Tchê|CM|5|75|28|br
Matías Zaracho|Zaracho|AM|15|79|23|ar
Nacho Fernández|Nacho|AM|26|81|31|ar
Hyoran|Hyoran|AM|20|70|28|br
Jefferson Savarino|Savarino|RW|10|79|24|ve
Keno|Keno|LW|11|78|32|br
Hulk|Hulk|ST|7|85|35|br
Diego Costa|Diego Costa|ST|19|77|32|br
Eduardo Vargas|Vargas|ST|9|75|31|cl
= fluminense 2010 4-4-2
Ricardo Berna|Ricardo Berna|GK|1|75|30|br
Rafael|Rafael|GK|12|65|27|br
Mariano|Mariano|RB|2|75|24|br
Gum|Gum|CB|3|75|24|br
Leandro Euzébio|Leandro Euzébio|CB|4|75|29|br
André Luís|André Luís|CB|14|70|31|br
Carlinhos|Carlinhos|LB|6|75|23|br
Júlio César|Júlio César|LB|16|70|30|br
Diguinho|Diguinho|DM|5|73|27|br
Edwin Valencia|Valencia|DM|15|75|25|co
Diogo|Diogo|DM|17|70|22|br
Marquinho|Marquinho|CM|8|75|24|br
Darío Conca|Conca|AM|11|86|27|ar
Deco|Deco|AM|20|81|32|pt
Emerson Sheik|Emerson|ST|10|81|31|br
Fred|Fred|ST|9|83|26|br
Washington|Washington|ST|19|75|35|br
Tartá|Tartá|LW|18|70|21|br
Rodriguinho|Rodriguinho|ST|7|70|22|br
= fluminense 2023 4-2-3-1
Fábio|Fábio|GK|1|79|42|br
Vitor Eudes|Vitor Eudes|GK|98|65|25|br
Samuel Xavier|Samuel Xavier|RB|2|75|33|br
Guga|Guga|RB|23|73|25|br
Nino|Nino|CB|33|79|26|br
Felipe Melo|Felipe Melo|CB|30|75|40|br
Manoel|Manoel|CB|26|73|33|br
Marlon|Marlon|CB|25|73|27|br
Marcelo|Marcelo|LB|12|79|35|br
Diogo Barbosa|Diogo Barbosa|LB|16|70|31|br
André|André|DM|7|81|22|br
Martinelli|Martinelli|CM|8|77|22|br
Alexsander|Alexsander|CM|29|75|20|br
Lima|Lima|AM|45|73|27|br
Paulo Henrique Ganso|Ganso|AM|10|81|34|br
Jhon Arias|Jhon Arias|RW|21|81|26|co
Keno|Keno|LW|11|75|34|br
Lelê|Lelê|ST|19|70|26|br
Germán Cano|Cano|ST|14|81|35|ar
John Kennedy|John Kennedy|ST|9|75|21|br
= botafogo 1995 4-4-2
Wágner|Wágner|GK|1|77|26|br
Carlão|Carlão|GK|12|65|28|br
Wilson Goiano|Wilson Goiano|RB|2|73|26|br
Guto|Guto|RB|13|65|24|br
Gonçalves|Gonçalves|CB|3|78|29|br
Wilson Gottardo|Gottardo|CB|4|77|32|br
Márcio Theodoro|Márcio Theodoro|CB|14|67|26|br
Ezequiel Grotto|Grotto|CB|15|65|24|br
André Silva|André Silva|LB|6|73|25|br
Wilson Mineiro|Wilson Mineiro|LB|16|65|25|br
Jamir|Jamir|DM|5|75|26|br
Leandro Ávila|Leandro Ávila|DM|8|75|24|br
Beto|Beto|CM|17|75|25|br
Sérgio Manoel|Sérgio Manoel|AM|10|81|23|br
Iranildo|Iranildo|AM|18|73|19|br
Moisés|Moisés|AM|19|70|24|br
Marcelo Alves|Marcelo Alves|CM|20|67|26|br
Donizete Pantera|Donizete|ST|11|79|27|br
Túlio Maravilha|Túlio|ST|7|84|26|br
Dauri|Dauri|ST|21|65|22|br
= botafogo 2024 4-2-3-1
John|John|GK|12|81|28|br
Gatito Fernández|Gatito|GK|1|70|36|py
Vitinho|Vitinho|RB|2|75|24|br
Damián Suárez|Damián Suárez|RB|13|70|36|uy
Alexander Barboza|Barboza|CB|20|79|29|ar
Bastos|Bastos|CB|15|78|33|ao
Adryelson|Adryelson|CB|4|75|26|br
Alex Telles|Alex Telles|LB|13|77|31|br
Cuiabano|Cuiabano|LB|66|73|21|br
Marlon Freitas|Marlon Freitas|DM|17|79|29|br
Gregore|Gregore|DM|26|77|30|br
Danilo Barbosa|Danilo Barbosa|DM|5|73|28|br
Allan|Allan|CM|25|73|33|br
Thiago Almada|Almada|AM|23|83|23|ar
Eduardo|Eduardo|AM|10|75|35|br
Jefferson Savarino|Savarino|RW|10|81|27|ve
Luiz Henrique|Luiz Henrique|RW|7|83|23|br
Júnior Santos|Júnior Santos|LW|11|79|29|br
Matheus Martins|Matheus Martins|LW|9|73|21|br
Igor Jesus|Igor Jesus|ST|99|81|23|br
Tiquinho Soares|Tiquinho|ST|9|77|33|br
= athletico 2001 3-5-2
Flávio|Flávio|GK|1|77|28|br
Adriano Basso|Adriano Basso|GK|12|65|26|br
Nem|Nem|CB|3|77|28|br
Gustavo|Gustavo|CB|4|79|27|br
Rogério Corrêa|Rogério Corrêa|CB|14|75|22|br
Igor|Igor|CB|15|70|23|br
Alessandro|Alessandro|RB|2|75|24|br
Fabiano|Fabiano|LB|6|73|23|br
Cocito|Cocito|DM|5|75|27|br
Pires|Pires|DM|16|67|24|br
Kléberson|Kléberson|CM|8|81|22|br
Adriano Gabiru|Gabiru|AM|10|77|24|br
Souza|Souza|AM|17|73|26|br
Kelly|Kelly|AM|18|67|25|br
Alex Mineiro|Alex Mineiro|ST|9|83|26|br
Kléber|Kléber|ST|11|81|25|br
Ilan|Ilan|ST|7|77|20|br
Dagoberto|Dagoberto|ST|19|70|18|br
= athletico 2018 4-2-3-1
Santos|Santos|GK|1|77|28|br
Caio|Caio|GK|12|67|32|br
Jonathan|Jonathan|RB|2|75|32|br
Thiago Heleno|Thiago Heleno|CB|44|77|30|br
Léo Pereira|Léo Pereira|CB|4|75|22|br
Paulo André|Paulo André|CB|13|75|35|br
Renan Lodi|Renan Lodi|LB|6|77|20|br
Wellington|Wellington|DM|5|75|27|br
Camacho|Camacho|DM|15|73|24|br
Bruno Guimarães|Bruno Guimarães|CM|8|81|20|br
Lucho González|Lucho González|CM|20|75|37|ar
Matheus Rossetto|Rossetto|CM|17|70|22|br
Raphael Veiga|Veiga|AM|23|77|23|br
Nikão|Nikão|RW|11|79|26|br
Marcelo Cirino|Cirino|LW|7|73|26|br
Rony|Rony|LW|7|77|23|br
Pablo|Pablo|ST|9|79|26|br
Bergson|Bergson|ST|19|70|27|br
Marcinho|Marcinho|RW|18|70|23|br
= bahia 1988 4-3-3
Ronaldo|Ronaldo|GK|1|77|25|br
Sidmar|Sidmar|GK|12|65|25|br
Tarantini|Tarantini|RB|2|75|28|br
Maílson|Maílson|RB|13|65|19|br
João Marcelo|João Marcelo|CB|3|77|28|br
Claudir|Claudir|CB|4|75|26|br
Pereira|Pereira|CB|14|70|27|br
Newmar|Newmar|CB|15|70|30|br
Paulo Róbson|Paulo Róbson|LB|6|75|26|br
Edinho Jacaré|Edinho|LB|16|73|28|br
Paulo Rodrigues|Paulo Rodrigues|DM|5|77|26|br
Zé Carlos|Zé Carlos|CM|8|77|27|br
Gil Sergipano|Gil|CM|17|73|24|br
Bobô|Bobô|AM|10|84|26|br
Marquinhos|Marquinhos|LW|11|79|24|br
Osmar|Osmar|RW|7|75|27|br
Charles Fabian|Charles|ST|9|83|20|br
Sandro|Sandro|ST|19|70|23|br
Renato|Renato|AM|18|70|25|br
= bahia 2025 4-2-3-1
Marcos Felipe|Marcos Felipe|GK|1|77|29|br
Ronaldo|Ronaldo|GK|22|67|28|br
Gilberto|Gilberto|RB|2|73|32|br
Santiago Arias|Arias|RB|13|73|33|co
David Duarte|David Duarte|CB|3|75|29|br
Kanu|Kanu|CB|4|73|27|br
Gabriel Xavier|Gabriel Xavier|CB|5|73|25|br
Santiago Ramos Mingo|Ramos Mingo|CB|21|73|23|ar
Luciano Juba|Juba|LB|46|78|25|br
Caio Alexandre|Caio Alexandre|DM|19|77|26|br
Jean Lucas|Jean Lucas|CM|6|77|26|br
Rodrigo Nestor|Nestor|CM|11|74|24|br
Erick|Erick|CM|14|70|25|br
Everton Ribeiro|Everton Ribeiro|AM|10|79|36|br
Cauly|Cauly|AM|8|75|29|br
Michel Araújo|Michel Araújo|AM|15|73|28|uy
Ademir|Ademir|RW|7|74|30|br
Erick Pulga|Erick Pulga|RW|16|73|24|br
Kayky|Kayky|LW|18|70|22|br
Willian José|Willian José|ST|12|77|33|br
Lucho Rodríguez|Lucho Rodríguez|ST|9|73|21|uy
Tiago|Tiago|ST|20|67|25|br
= vitoria 1993 4-4-2
Dida|Dida|GK|1|79|20|br
Ronaldo|Ronaldo|GK|12|63|24|br
Rodrigo|Rodrigo|RB|2|73|20|br
João Marcelo|João Marcelo|CB|3|73|33|br
China|China|CB|4|70|35|br
Evandro|Evandro|CB|13|65|24|br
Renato Martins|Renato Martins|LB|6|67|26|br
Gil Sergipano|Gil|DM|5|70|29|br
Roberto Cavalo|Roberto Cavalo|DM|8|73|30|br
Vampeta|Vampeta|DM|15|70|19|br
Fabinho Santos|Fabinho|CM|16|65|24|br
Paulo Isidoro|Paulo Isidoro|AM|10|75|40|br
Pichetti|Pichetti|AM|7|73|24|br
Claudinho|Claudinho|ST|9|77|25|br
Alex Alves|Alex Alves|ST|11|77|18|br
Gerônimo|Gerônimo|ST|17|65|25|br
Nei Santos|Nei Santos|ST|18|65|23|br
= coritiba 1985 4-4-2
Rafael Cammarota|Rafael|GK|1|79|29|br
Jairo|Jairo|GK|12|67|24|br
André|André|RB|2|73|25|br
Hélcio|Hélcio|RB|13|65|24|br
Gomes|Gomes|CB|3|75|26|br
Heraldo|Heraldo|CB|4|77|26|br
Vavá|Vavá|CB|14|73|25|br
Gardel|Gardel|CB|15|65|23|br
Dida|Dida|LB|6|73|26|br
Almir|Almir|DM|5|75|27|br
Marildo|Marildo|CM|8|75|27|br
Marco Aurélio|Marco Aurélio|CM|16|70|24|br
Aragonez|Aragonez|CM|17|65|24|br
Tóbi|Tóbi|AM|10|79|25|br
Lela|Lela|RW|7|79|23|br
Édson|Édson|LW|11|75|24|br
Índio|Índio|ST|9|79|24|br
Eliseu|Eliseu|ST|19|67|23|br
Gil|Gil|ST|18|65|22|br
= bragantino 2021 4-3-3
Cleiton|Cleiton|GK|1|77|23|br
Julio César|Julio César|GK|12|67|32|br
Aderlan|Aderlan|RB|2|73|30|br
Léo Ortiz|Léo Ortiz|CB|3|77|25|br
Fabrício Bruno|Fabrício Bruno|CB|4|75|25|br
Natan|Natan|CB|14|75|20|br
Edimar|Edimar|LB|6|70|34|br
Luan Cândido|Luan Cândido|LB|16|73|20|br
Jadsom Silva|Jadsom|DM|5|73|20|br
Eric Ramires|Eric Ramires|CM|8|75|21|br
Lucas Evangelista|Evangelista|CM|17|75|26|br
Praxedes|Praxedes|CM|15|73|19|br
Claudinho|Claudinho|AM|10|83|24|br
Artur|Artur|RW|7|81|23|br
Helinho|Helinho|RW|18|75|20|br
Tomás Cuello|Cuello|LW|11|75|21|ar
Ytalo|Ytalo|ST|9|75|33|br
Alerrandro|Alerrandro|ST|19|73|21|br
Leandrinho|Leandrinho|RW|20|70|22|br
= mirassol 2025 4-2-3-1
Walter|Walter|GK|22|75|37|br
Alex Muralha|Muralha|GK|23|65|35|br
Lucas Ramon|Lucas Ramon|RB|2|73|31|br
Daniel Borges|Daniel Borges|RB|20|70|32|br
João Victor|João Victor|CB|34|73|26|br
Jemmes|Jemmes|CB|4|73|31|br
Luiz Otávio|Luiz Otávio|CB|3|70|28|br
Reinaldo|Reinaldo|LB|6|77|35|br
Victor Luís|Victor Luís|LB|12|67|31|br
Neto Moura|Neto Moura|DM|25|73|27|br
José Aldo|José Aldo|DM|21|70|28|br
Danielzinho|Danielzinho|CM|8|73|29|br
Gabriel Pires|Gabriel Pires|CM|18|67|31|br
Shaylon|Shaylon|AM|7|73|28|br
Negueba|Negueba|RW|11|75|32|br
Alesson|Alesson|LW|77|73|28|br
Chico da Costa|Chico|ST|10|70|30|br
André Luís|André Luís|ST|9|70|27|br
Edson Carioca|Edson Carioca|ST|95|67|27|br
= flamengo 2019 4-4-2
Diego Alves|Diego Alves|GK|1|80|34|br
César|César|GK|48|67|27|br
Gabriel Batista|Gabriel Batista|GK|22|63|21|br
Rafinha|Rafinha|RB|13|79|34|br
Rodinei|Rodinei|RB|2|70|27|br
Rodrigo Caio|Rodrigo Caio|CB|3|80|26|br
Pablo Marí|Pablo Marí|CB|4|79|26|es
Rhodolfo|Rhodolfo|CB|44|70|33|br
Thuler|Thuler|CB|33|67|20|br
Filipe Luís|Filipe Luís|LB|16|81|34|br
Renê|Renê|LB|6|73|27|br
Willian Arão|Arão|DM|5|80|27|br
Piris da Motta|Piris da Motta|DM|8|69|25|py
Gerson|Gerson|CM|8|81|22|br
Diego Ribas|Diego|AM|10|76|34|br
Reinier|Reinier|AM|19|73|17|br
Giorgian de Arrascaeta|Arrascaeta|AM|14|84|25|uy
Everton Ribeiro|Everton Ribeiro|RW|7|82|30|br
Orlando Berrío|Berrío|RW|28|68|28|co
Vitinho|Vitinho|LW|11|76|26|br
Bruno Henrique|Bruno Henrique|LW|27|84|28|br
Gabriel Barbosa|Gabigol|ST|9|85|23|br
Lincoln|Lincoln|ST|29|64|18|br
`,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
  else (root.DEZ_BRUTO = root.DEZ_BRUTO || []).push(D);
})(typeof window !== 'undefined' ? window : this);
