// Football Draft: Ligue 1 (2025/26 e históricos)
// Formato: ver shared/dez-dados.js. Notas na escala única (docs/PROMPT_DADOS_REAIS.md, seção 3).
(function (root) {
  'use strict';
  const D = {
    id: 'ligue1', origem: 'fr',
    times: `
angers|Angers|||SCO|#FFFFFF|#111111|png
auxerre|Auxerre|||AJA|#FFFFFF|#0055A4|png
brest|Brest|||SB29|#E4002B|#FFFFFF|png
le_havre|Le Havre|||HAC|#6CABDD|#0B1F4B|png
lens|Lens|||RCL|#FFD100|#E2001A|png
lille|Lille|||LOSC|#E01E13|#1A2B4C|png
lorient|Lorient|||FCL|#F58220|#111111|png
lyon|Lyon|||OL|#FFFFFF|#DA001A|png
marseille|Olympique de Marseille|Marseille|Olympique de Marsella|OM|#FFFFFF|#2FAEE0|png
metz|Metz|||FCM|#7A1F2B|#FFFFFF|png
monaco|Monaco|||ASM|#E2001A|#FFFFFF|png
nantes|Nantes|||FCN|#FCD116|#00843D|png
nice|Nice|||OGCN|#E2001A|#111111|png
paris|PSG|||PSG|#004170|#DA291C|png
paris_fc|Paris FC|||PFC|#0B2A5B|#5CBFEB|png
rennes|Rennes|||SRFC|#E2001A|#111111|png
strasbourg|Strasbourg|||RCSA|#009FE3|#FFFFFF|png
toulouse|Toulouse|||TFC|#5B2C83|#FFFFFF|png`,
    elencos: `
// ======================================================== 2025/26
= paris 2025 4-3-3
Lucas Chevalier|Chevalier|GK|30|83|24|fr
Matvey Safonov|Safonov|GK|39|79|26|ru
Achraf Hakimi|Hakimi|RB|2|87|26|ma
Warren Zaïre-Emery|Zaïre-Emery|RB|33|79|19|fr
Marquinhos|Marquinhos|CB|5|84|31|br
Willian Pacho|Pacho|CB|51|84|24|ec
Illia Zabarnyi|Zabarnyi|CB|6|81|23|ua
Lucas Beraldo|Beraldo|CB|35|77|22|br
Nuno Mendes|Nuno Mendes|LB|25|86|23|pt
Lucas Hernández|L. Hernández|LB|21|78|29|fr
Vitinha|Vitinha|CM|17|89|25|pt
João Neves|João Neves|CM|87|86|21|pt
Fabián Ruiz|Fabián|CM|8|84|29|es
Senny Mayulu|Mayulu|CM|24|73|19|fr
Lee Kang-in|Lee Kang-in|AM|19|81|24|kr
Ousmane Dembélé|Dembélé|RW|10|88|28|fr
Ibrahim Mbaye|Mbaye|RW|49|70|17|sn
Désiré Doué|Doué|LW|14|84|20|fr
Khvicha Kvaratskhelia|Kvaratskhelia|LW|7|87|24|ge
Bradley Barcola|Barcola|LW|29|83|23|fr
Gonçalo Ramos|Gonçalo Ramos|ST|9|78|24|pt
= marseille 2025 3-4-2-1
Gerónimo Rulli|Rulli|GK|1|81|33|ar
Jeffrey de Lange|De Lange|GK|12|65|27|nl
Leonardo Balerdi|Balerdi|CB|5|79|26|ar
Nayef Aguerd|Aguerd|CB|21|80|29|ma
Benjamin Pavard|Pavard|CB|28|79|29|fr
Facundo Medina|Medina|CB|32|77|26|ar
Amir Murillo|Murillo|RB|62|71|29|pa
Timothy Weah|Weah|RB|22|76|25|us
Emerson Palmieri|Emerson|LB|33|77|31|it
Pierre-Emile Højbjerg|Højbjerg|DM|23|80|30|dk
Geoffrey Kondogbia|Kondogbia|DM|19|75|32|cf
Matt O'Riley|O'Riley|CM|17|77|24|dk
Arthur Vermeeren|Vermeeren|CM|18|73|20|be
Angel Gomes|Angel Gomes|AM|8|75|25|en
Bilal Nadir|Nadir|AM|26|73|21|ma
Mason Greenwood|Greenwood|RW|10|83|24|en
Igor Paixão|Paixão|LW|14|77|25|br
Hamed Junior Traorè|Traorè|AM|20|73|25|ci
Pierre-Emerick Aubameyang|Aubameyang|ST|97|79|36|ga
Amine Gouiri|Gouiri|ST|9|78|25|dz
Robinio Vaz|Vaz|ST|34|70|18|fr
= lyon 2025 4-2-3-1
Dominik Greif|Greif|GK|1|81|28|sk
Rémy Descamps|Descamps|GK|40|65|29|fr
Ainsley Maitland-Niles|Maitland-Niles|RB|98|75|28|en
Nicolás Tagliafico|Tagliafico|LB|3|79|33|ar
Abner|Abner|LB|16|73|25|br
Clinton Mata|Mata|CB|22|75|32|ao
Moussa Niakhaté|Niakhaté|CB|19|76|29|sn
Hans Hateboer|Hateboer|RB|2|70|31|nl
Tanner Tessmann|Tessmann|DM|6|75|24|us
Tyler Morton|Morton|DM|23|76|23|en
Corentin Tolisso|Tolisso|CM|8|78|31|fr
Pavel Šulc|Šulc|AM|10|77|25|cz
Adam Karabec|Karabec|AM|21|73|22|cz
Malick Fofana|Fofana|LW|11|79|20|be
Afonso Moreira|Afonso Moreira|LW|17|75|20|pt
Ernest Nuamah|Nuamah|RW|37|73|22|gh
Rachid Ghezzal|Ghezzal|RW|18|70|33|dz
Martín Satriano|Satriano|ST|7|75|24|uy
Endrick|Endrick|ST|9|77|19|br
Steve Kapuadi|Kapuadi|CB|26|67|27|cd
= monaco 2025 4-2-3-1
Philipp Köhn|Köhn|GK|1|76|27|ch
Lukáš Hrádecký|Hrádecký|GK|16|75|35|fi
Vanderson|Vanderson|RB|2|79|24|br
Krépin Diatta|Diatta|RB|27|71|26|sn
Mohammed Salisu|Salisu|CB|22|76|26|gh
Thilo Kehrer|Kehrer|CB|5|76|29|de
Eric Dier|Dier|CB|3|75|31|en
Christian Mawissa|Mawissa|CB|13|71|20|fr
Caio Henrique|Caio Henrique|LB|12|75|28|br
Kassoum Ouattara|Ouattara|LB|20|71|21|bf
Denis Zakaria|Zakaria|DM|6|82|28|ch
Lamine Camara|Camara|CM|15|78|21|sn
Paul Pogba|Pogba|CM|8|74|32|fr
Aleksandr Golovin|Golovin|AM|10|78|29|ru
Takumi Minamino|Minamino|AM|18|79|30|jp
Maghnes Akliouche|Akliouche|AM|11|77|23|fr
Ansu Fati|Ansu Fati|LW|31|78|22|es
Mika Biereth|Biereth|ST|14|76|22|dk
Folarin Balogun|Balogun|ST|9|75|24|us
George Ilenikhena|Ilenikhena|ST|29|71|19|fr
= lille 2025 4-2-3-1
Berke Özer|Özer|GK|1|77|25|tr
Arnaud Bodart|Bodart|GK|30|67|27|be
Thomas Meunier|Meunier|RB|12|73|34|be
Alexsandro Ribeiro|Alexsandro|CB|4|79|26|br
Aïssa Mandi|Mandi|CB|23|73|34|dz
Nathan Ngoy|Ngoy|CB|3|71|22|be
Romain Perraud|Perraud|LB|15|73|28|fr
Calvin Verdonk|Verdonk|LB|5|70|28|nl
Benjamin André|André|DM|21|77|35|fr
Ayyoub Bouaddi|Bouaddi|DM|32|75|18|fr
Nabil Bentaleb|Bentaleb|DM|6|71|30|dz
Ngal'ayel Mukau|Mukau|CM|8|70|21|cd
Hákon Arnar Haraldsson|Haraldsson|AM|10|77|22|is
Osame Sahraoui|Sahraoui|RW|11|75|24|no
Félix Correia|Félix Correia|LW|7|73|24|pt
Olivier Giroud|Giroud|ST|9|75|39|fr
Hamza Igamane|Igamane|ST|27|75|23|ma
Matías Fernández-Pardo|Fernández-Pardo|ST|29|73|20|be
= lens 2025 3-4-2-1
Robin Risser|Risser|GK|40|79|21|fr
Régis Gurtner|Gurtner|GK|1|64|39|fr
Jonathan Gradit|Gradit|CB|24|75|33|fr
Malang Sarr|Sarr|CB|20|73|26|fr
Ismaëlo Ganiou|Ganiou|CB|5|68|20|bf
Samson Baidoo|Baidoo|CB|4|73|21|at
Saud Abdulhamid|Abdulhamid|RB|2|73|26|sa
Ruben Aguilar|Aguilar|RB|3|71|32|fr
Matthieu Udol|Udol|LB|25|70|29|fr
Adrien Thomasson|Thomasson|CM|28|75|32|fr
Mamadou Sangaré|Sangaré|DM|8|73|23|ml
Andy Diouf|Diouf|CM|18|73|22|fr
Nidal Čelik|Čelik|CB|14|62|19|ba
Florian Thauvin|Thauvin|RW|10|74|32|fr
Abdallah Sima|Sima|RW|11|74|24|sn
Wesley Saïd|Saïd|LW|22|74|30|fr
Odsonne Édouard|Édouard|ST|9|75|27|fr
Morgan Guilavogui|Guilavogui|ST|7|73|27|fr
= rennes 2025 3-4-2-1
Brice Samba|Samba|GK|1|81|31|fr
Mathys Silistrie|Silistrie|GK|30|65|20|fr
Anthony Rouault|Rouault|CB|4|75|24|fr
Jérémy Jacquet|Jacquet|CB|97|75|20|fr
Lilian Brassier|Brassier|CB|5|73|26|fr
Abdelhamid Ait Boudlal|Ait Boudlal|CB|26|70|19|ma
Przemysław Frankowski|Frankowski|RB|29|75|30|pl
Alidu Seidu|Seidu|RB|36|70|25|gh
Quentin Merlin|Merlin|LB|3|73|23|fr
Seko Fofana|S. Fofana|CM|8|77|30|ci
Valentin Rongier|Rongier|CM|21|75|30|fr
Mahdi Camara|Mahdi Camara|DM|45|75|27|fr
Glen Kamara|Kamara|CM|6|73|30|fi
Ludovic Blas|Blas|AM|10|76|28|fr
Arnaud Nordin|Nordin|AM|11|73|27|fr
Mousa Al-Taamari|Al-Taamari|RW|7|76|28|jo
Breel Embolo|Embolo|ST|19|75|28|ch
Esteban Lepaul|Lepaul|ST|9|75|25|fr
= nice 2025 3-4-2-1
Yehvann Diouf|Y. Diouf|GK|80|73|26|sn
Maxime Dupé|Dupé|GK|1|71|32|fr
Mohamed Abdelmonem|Abdelmonem|CB|4|75|26|eg
Dante|Dante|CB|31|70|42|br
Kojo Oppong|Oppong|CB|21|68|21|gh
Juma Bah|Bah|CB|6|68|19|sl
Jonathan Clauss|Clauss|RB|92|75|33|fr
Antoine Mendy|A. Mendy|RB|33|68|21|sn
Melvin Bard|Bard|LB|26|75|25|fr
Ali Abdi|Abdi|LB|25|71|32|tn
Hicham Boudaoui|Boudaoui|CM|28|74|26|dz
Morgan Sanson|Sanson|CM|11|75|31|fr
Tanguy Ndombele|Ndombele|CM|19|71|28|fr
Sofiane Diop|Diop|AM|10|79|25|ma
Mohamed-Ali Cho|Cho|RW|11|73|21|fr
Jérémie Boga|Boga|LW|7|75|28|ci
Gaëtan Laborde|Laborde|ST|24|75|31|fr
Terem Moffi|Moffi|ST|9|71|26|ng
Kevin Carlos|Kevin Carlos|ST|14|68|24|br
= strasbourg 2025 3-4-2-1
Mike Penders|Penders|GK|39|70|20|be
Karl-Johan Johnsson|Johnsson|GK|1|64|35|se
Ismaël Doukouré|Doukouré|CB|4|73|22|fr
Mamadou Sarr|M. Sarr|CB|13|73|20|fr
Lucas Høgsberg|Høgsberg|CB|22|70|19|dk
Guéla Doué|G. Doué|RB|29|74|23|ci
Ben Chilwell|Chilwell|LB|3|75|28|en
Valentín Barco|Barco|CM|32|75|21|ar
Félix Lemaréchal|Lemaréchal|CM|24|68|22|fr
Samuel Amo-Ameyaw|Amo-Ameyaw|RW|17|68|19|en
Julio Enciso|Enciso|AM|19|79|21|py
Sebastian Nanasi|Nanasi|RW|11|74|23|se
Diego Moreira|Moreira|LW|7|74|21|be
Joaquín Panichelli|Panichelli|ST|9|75|23|ar
Emanuel Emegha|Emegha|ST|10|75|22|nl
Martial Godo|Godo|LW|20|68|22|ci
Kendry Páez|Kendry Páez|AM|14|76|18|ec
= toulouse 2025 3-4-3
Guillaume Restes|Restes|GK|50|77|20|fr
Kjetil Haug|Haug|GK|1|65|27|no
Rasmus Nicolaisen|Nicolaisen|CB|2|73|28|dk
Charlie Cresswell|Cresswell|CB|4|73|23|en
Mark McKenzie|McKenzie|CB|3|71|26|us
Djibril Sidibé|Sidibé|RB|19|70|33|fr
Warren Kamanzi|Kamanzi|RB|17|70|24|no
Aron Dønnum|Dønnum|LW|15|73|27|no
Cristian Cásseres|Cásseres|CM|23|75|25|ve
Niklas Schmidt|Schmidt|CM|10|70|27|de
Abu Francis|Francis|CM|8|70|24|gh
Yann Gboho|Gboho|AM|7|73|24|fr
Santiago Hidalgo|Hidalgo|RW|11|70|20|ar
Frank Magri|Magri|ST|9|70|26|fr
Emersonn|Emersonn|ST|20|73|24|br
Rafik Messali|Messali|AM|26|67|22|fr
Dayann Methalie|Methalie|LB|25|65|20|fr
Ilyas Azizi|Azizi|CM|18|65|20|ma
= auxerre 2025 4-4-2
Donovan Léon|Léon|GK|16|76|33|gf
Théo De Percin|De Percin|GK|1|64|24|fr
Paul Joly|Joly|RB|2|67|24|fr
Gideon Mensah|Mensah|LB|14|68|27|gh
Gabriel Osho|Osho|CB|5|70|27|ng
Sinaly Diomandé|S. Diomandé|CB|4|73|24|ci
Clément Akpa|Akpa|CB|3|68|24|ci
Elisha Owusu|Owusu|DM|6|68|28|gh
Kévin Danois|Danois|CM|8|70|21|fr
Oussama El Azzouzi|El Azzouzi|CM|23|68|24|ma
Marvin Senaya|Senaya|RB|26|64|25|gh
Lassine Sinayoko|Sinayoko|RW|7|75|26|ml
Danny Namaso|Namaso|LW|11|70|25|en
Sékou Mara|Mara|ST|9|70|23|fr
Lasso Coulibaly|Coulibaly|AM|20|66|23|ci
Josué Casimir|Casimir|RW|17|64|24|ht
Ado Onaiwu|Onaiwu|ST|19|67|30|jp
Romain Faivre|Faivre|AM|21|68|27|fr
= angers 2025 4-2-3-1
Hervé Koffi|Koffi|GK|1|75|29|bf
Melvin Zinga|Zinga|GK|30|63|21|fr
Florent Hanin|Hanin|LB|3|67|35|fr
Jordan Lefort|Lefort|CB|4|70|31|fr
Ousmane Camara|O. Camara|CB|5|70|22|ml
Emmanuel Biumla|Biumla|CB|6|67|21|fr
Yan Valery|Valery|RB|2|70|27|tn
Haris Belkebla|Belkebla|DM|8|70|31|dz
Pierrick Capelle|Capelle|CM|15|67|38|fr
Jim Allevinah|Allevinah|RW|7|67|30|ga
Himad Abdelli|Abdelli|AM|10|73|26|dz
Yassin Belkhdim|Belkhdim|CM|18|70|23|fr
Louis Mouton|Mouton|CM|12|67|23|fr
Loïs Diony|Diony|ST|11|70|33|fr
Guédé Nadje|Nadje|ST|22|65|21|fr
Lilian Raolisoa|Raolisoa|RB|20|65|25|fr
Sidiki Chérif|Chérif|ST|19|70|18|fr
Prosper Peter|Peter|RW|17|67|21|ng
= brest 2025 4-3-3
Grégoire Coudert|Coudert|GK|1|70|26|fr
Radosław Majecki|Majecki|GK|30|67|26|pl
Kenny Lala|Lala|RB|27|70|34|fr
Soumaïla Coulibaly|Coulibaly|CB|5|70|21|fr
Brendan Chardonnet|Chardonnet|CB|44|70|31|fr
Julien Le Cardinal|Le Cardinal|CB|25|67|28|fr
Bradley Locko|Locko|LB|3|70|23|fr
Hugo Magnetti|Magnetti|CM|8|70|27|fr
Pierre Lees-Melou|Lees-Melou|CM|20|70|32|fr
Kamory Doumbia|Doumbia|AM|26|67|22|ml
Romain Del Castillo|Del Castillo|RW|10|77|29|fr
Mama Baldé|Baldé|LW|29|70|30|gw
Ludovic Ajorque|Ajorque|ST|19|75|31|fr
Remy Labeau Lascary|Labeau|ST|9|67|22|fr
Eric Junior Dina Ebimbe|Dina Ebimbe|AM|14|67|25|fr
Joris Chotard|Chotard|DM|6|70|24|fr
Daouda Guindo|Guindo|LB|23|65|23|ml
= le_havre 2025 4-3-3
Mory Diaw|Diaw|GK|1|64|32|sn
Lionel M'Pasi|M'Pasi|GK|30|67|31|cd
Arouna Sangante|Sangante|CB|5|70|23|sn
Gautier Lloris|G. Lloris|CB|4|66|30|fr
Étienne Youté Kinkoué|Youté|CB|3|66|23|fr
Loïc Nego|Nego|RB|2|67|34|hu
Christopher Operi|Operi|LB|13|66|29|ci
Abdoulaye Touré|A. Touré|DM|6|70|31|gn
Ayumu Seko|Seko|CB|20|70|24|jp
Yassine Kechta|Kechta|CM|8|70|23|ma
Daler Kuziev|Kuziev|CM|18|66|26|uz
Rassoul Ndiaye|Ndiaye|CM|17|66|23|fr
Issa Soumaré|Soumaré|LW|11|70|24|sn
Josué Casimir|Casimir|RW|7|64|24|ht
André Ayew|A. Ayew|AM|10|75|35|gh
Abdoulaye Kanté|Kanté|ST|9|67|25|fr
Sofiane Boufal|Boufal|LW|19|70|32|ma
Simon Ebonog|Ebonog|CM|26|64|21|cm
= lorient 2025 3-4-3
Yvon Mvogo|Mvogo|GK|38|73|31|ch
Benjamin Leroy|Leroy|GK|1|65|36|fr
Montassar Talbi|Talbi|CB|3|77|27|tn
Bamo Meïté|Meïté|CB|5|70|24|ci
Formose Mendy|Mendy|CB|4|67|24|sn
Igor Silva|Igor Silva|RB|2|70|29|br
Darlin Yongwa|Yongwa|LB|17|70|25|cm
Laurent Abergel|Abergel|DM|6|70|32|fr
Arthur Avom|Avom|CM|8|70|21|cm
Noah Cadiou|Cadiou|CM|14|67|23|fr
Pablo Pagis|Pagis|LW|11|73|22|fr
Jean-Victor Makengo|Makengo|CM|10|70|27|fr
Théo Le Bris|Le Bris|RW|7|70|23|fr
Mohamed Bamba|Bamba|ST|9|73|24|ci
Aiyegun Tosin|Tosin|LW|19|70|27|bj
Bandiougou Fadiga|Fadiga|CM|18|65|24|fr
Panos Katseris|Katseris|RB|23|67|24|gr
= metz 2025 4-2-3-1
Jonathan Fischer|Fischer|GK|16|70|25|dk
Pape Sy|Sy|GK|1|63|21|sn
Maxime Colin|Colin|RB|2|65|34|fr
Koffi Kouao|Kouao|RB|29|67|27|ci
Sadibou Sané|Sané|CB|4|67|21|sn
Terry Yegbe|Yegbe|CB|5|67|24|ci
Michel Mboula|Mboula|CB|3|65|21|fr
Cléo Mélières|Mélières|CB|15|63|21|fr
Fodé Ballo-Touré|Ballo-Touré|LB|23|67|28|sn
Benjamin Stambouli|Stambouli|DM|6|65|35|fr
Jean-Philippe Gbamin|Gbamin|DM|25|67|30|ci
Boubacar Traoré|B. Traoré|CM|8|67|24|ml
Jessy Deminguet|Deminguet|CM|14|67|27|fr
Alpha Touré|A. Touré|CM|18|65|20|fr
Gauthier Hein|Hein|AM|10|75|29|fr
Cheikh Sabaly|Sabaly|RW|7|70|26|sn
Giorgi Tsitaishvili|Tsitaishvili|LW|11|70|25|ge
Giorgi Abuashvili|Abuashvili|RW|17|67|22|ge
Joel Asoro|Asoro|LW|19|67|26|se
Habib Diallo|H. Diallo|ST|9|73|30|sn
Ibou Sané|I. Sané|ST|20|65|21|sn
= paris_fc 2025 4-2-3-1
Kevin Trapp|Trapp|GK|35|79|35|de
Obed Nkambadio|Nkambadio|GK|16|64|22|fr
Hamari Traoré|H. Traoré|RB|14|70|33|ml
Tuomas Ollila|Ollila|LB|2|67|25|fi
Moustapha Mbow|Mbow|CB|5|73|25|sn
Otávio|Otávio|CB|6|73|31|br
Diego Coppola|Coppola|CB|42|68|21|it
Timothée Kolodziejczak|Kolodziejczak|CB|15|66|34|fr
Samir Chergui|Chergui|LB|31|64|27|dz
Thibault De Smet|De Smet|RB|28|66|27|be
Vincent Marchetti|Marchetti|DM|4|70|28|fr
Maxime Lopez|Maxime Lopez|CM|21|75|27|fr
Pierre Lees-Melou|Lees-Melou|CM|33|71|32|fr
Marshall Munetsi|Munetsi|CM|18|71|29|zw
Ilan Kebbal|Kebbal|AM|10|77|27|dz
Jonathan Ikoné|Ikoné|RW|93|75|27|fr
Moses Simon|Moses Simon|LW|27|75|30|ng
Luca Koleosho|Koleosho|LW|24|68|21|it
Willem Geubbels|Geubbels|ST|9|73|24|fr
Jean-Philippe Krasso|Krasso|ST|11|71|28|ci
Ciro Immobile|Immobile|ST|36|71|35|it
= nantes 2025 4-2-3-1
Anthony Lopes|Lopes|GK|1|77|34|pt
Patrik Carlgren|Carlgren|GK|16|68|33|se
Kelvin Amian|Amian|RB|98|72|27|fr
Jean-Kévin Duverne|Duverne|CB|5|67|28|ht
Chidozie Awaziem|Awaziem|CB|4|72|28|ng
Tylel Tati|Tati|CB|24|70|20|fr
Uroš Radaković|Radaković|CB|3|70|31|rs
Nicolas Cozza|Cozza|LB|3|71|26|fr
Francis Coquelin|Coquelin|DM|22|73|34|fr
Johann Lepenant|Lepenant|CM|6|73|22|fr
Louis Leroux|Leroux|CM|8|70|25|fr
Kwon Hyeok-kyu|Kwon Hyeok-kyu|CM|14|69|24|kr
Dehmaine Tabibou|Tabibou|AM|10|70|19|fr
Sorba Thomas|Sorba Thomas|RW|7|72|26|wal
Yassine Benhattab|Benhattab|LW|11|70|27|fr
Herba Guirassy|H. Guirassy|LW|17|66|21|fr
Matthis Abline|Abline|ST|9|76|22|fr
Mostafa Mohamed|Mostafa Mohamed|ST|31|72|28|eg
Ignatius Ganago|Ganago|ST|19|68|26|cm
// FIM ATUAIS
// ======================================================== históricos
= paris 1993 4-4-2
Bernard Lama|Lama|GK|1|84|30|fr
Luc Borrelli|Borrelli|GK|16|70|28|fr
Alain Roche|Roche|CB|5|83|26|fr
Ricardo Gomes|Ricardo|CB|4|84|29|br
Antoine Kombouaré|Kombouaré|CB|14|77|30|fr
Patrick Colleter|Colleter|LB|3|79|28|fr
Jean-Luc Sassus|Sassus|RB|2|75|31|fr
Paul Le Guen|Le Guen|DM|6|81|29|fr
Vincent Guérin|Guérin|CM|8|81|28|fr
Valdo|Valdo|CM|7|81|29|br
Raí|Raí|AM|10|84|28|br
Daniel Bravo|Bravo|AM|15|77|30|fr
David Ginola|Ginola|LW|11|86|26|fr
Laurent Fournier|Fournier|CM|17|77|29|fr
George Weah|Weah|ST|14|88|27|lr
Patrice Loko|Loko|ST|9|77|23|fr
Francis Llacer|Llacer|RB|13|73|22|fr
Pascal Nouma|Nouma|ST|18|73|21|fr
= paris 2019 4-3-3
Keylor Navas|Navas|GK|1|86|33|cr
Sergio Rico|Rico|GK|16|75|26|es
Thilo Kehrer|Kehrer|RB|4|79|23|de
Thomas Meunier|Meunier|RB|12|79|28|be
Marquinhos|Marquinhos|CB|5|87|25|br
Thiago Silva|Thiago Silva|CB|2|86|35|br
Presnel Kimpembe|Kimpembe|CB|3|83|24|fr
Juan Bernat|Bernat|LB|14|81|27|es
Layvin Kurzawa|Kurzawa|LB|20|75|27|fr
Marco Verratti|Verratti|CM|6|88|27|it
Idrissa Gana Gueye|Gana Gueye|DM|27|83|30|sn
Ander Herrera|Herrera|CM|21|80|30|es
Leandro Paredes|Paredes|DM|8|81|25|ar
Pablo Sarabia|Sarabia|RW|19|80|27|es
Julian Draxler|Draxler|AM|23|79|26|de
Ángel Di María|Di María|RW|11|87|32|ar
Neymar|Neymar|LW|10|91|28|br
Kylian Mbappé|Mbappé|ST|7|91|21|fr
Mauro Icardi|Icardi|ST|18|84|27|ar
Edinson Cavani|Cavani|ST|9|81|33|uy
= marseille 1992 4-4-2
Fabien Barthez|Barthez|GK|16|83|21|fr
Pascal Olmeta|Olmeta|GK|1|75|31|fr
Jocelyn Angloma|Angloma|RB|2|81|27|fr
Basile Boli|Boli|CB|4|83|26|fr
Marcel Desailly|Desailly|CB|6|84|24|fr
Bernard Casoni|Casoni|CB|5|79|31|fr
Éric Di Meco|Di Meco|LB|3|79|29|fr
Didier Deschamps|Deschamps|DM|7|84|24|fr
Jean-Philippe Durand|Durand|CM|8|79|32|fr
Franck Sauzée|Sauzée|CM|10|84|27|fr
Jean-Jacques Eydelie|Eydelie|CM|14|75|26|fr
Rafael Martín Vázquez|Martín Vázquez|AM|15|81|27|es
Abedi Pelé|Abedi Pelé|RW|11|86|28|gh
Alen Bokšić|Bokšić|ST|9|86|23|hr
Rudi Völler|Völler|ST|13|84|33|de
Jean-Christophe Thomas|Thomas|LW|17|73|28|fr
Marc Libbra|Libbra|ST|18|70|20|fr
Jean-Marc Ferreri|Ferreri|AM|19|75|30|fr
= marseille 2009 4-3-3
Steve Mandanda|Mandanda|GK|30|83|25|fr
Elinton Andrade|Andrade|GK|1|67|30|br
Laurent Bonnart|Bonnart|RB|2|77|30|fr
Souleymane Diawara|Diawara|CB|21|79|31|sn
Stéphane Mbia|Mbia|CB|17|79|24|cm
Gabriel Heinze|Heinze|CB|24|81|32|ar
Taye Taiwo|Taiwo|LB|3|79|24|ng
César Azpilicueta|Azpilicueta|RB|20|75|20|es
Édouard Cissé|Cissé|DM|6|77|31|fr
Benoît Cheyrou|Cheyrou|CM|7|79|29|fr
Lucho González|Lucho|CM|8|84|29|ar
Fabrice Abriel|Abriel|CM|18|75|30|fr
Mathieu Valbuena|Valbuena|AM|28|81|25|fr
Hatem Ben Arfa|Ben Arfa|RW|10|81|23|fr
Mamadou Niang|Niang|ST|11|84|30|sn
Brandão|Brandão|ST|9|77|29|br
Bakari Koné|Koné|LW|14|77|28|ci
Charles Kaboré|Kaboré|CM|29|75|21|bf
= lyon 2004 4-3-3
Grégory Coupet|Coupet|GK|1|86|32|fr
Rémy Vercoutre|Vercoutre|GK|30|70|24|fr
Anthony Réveillère|Réveillère|RB|29|79|25|fr
Cris|Cris|CB|3|84|27|br
Claudio Caçapa|Caçapa|CB|4|81|28|br
Éric Abidal|Abidal|LB|20|81|25|fr
Jérémy Berthod|Berthod|LB|24|73|20|fr
Mahamadou Diarra|Diarra|DM|15|84|23|ml
Michael Essien|Essien|CM|5|86|21|gh
Juninho Pernambucano|Juninho|CM|8|89|29|br
Florent Malouda|Malouda|LW|10|84|24|fr
Sidney Govou|Govou|RW|14|81|25|fr
Sylvain Wiltord|Wiltord|ST|11|83|30|fr
Pierre-Alain Frau|Frau|ST|9|77|24|fr
Nilmar|Nilmar|ST|19|77|20|br
Bryan Bergougnoux|Bergougnoux|AM|17|73|21|fr
Jérémie Clément|Clément|CM|22|73|20|fr
Patrick Müller|Müller|CB|2|79|28|ch
= lyon 2019 3-5-2
Anthony Lopes|Lopes|GK|1|83|29|pt
Ciprian Tătărușanu|Tătărușanu|GK|30|73|34|ro
Jason Denayer|Denayer|CB|5|81|25|be
Marcelo|Marcelo|CB|6|79|33|br
Joachim Andersen|Andersen|CB|3|79|24|dk
Léo Dubois|Dubois|RB|2|79|25|fr
Kenny Tete|Tete|RB|20|73|24|nl
Maxwel Cornet|Cornet|LB|27|77|23|ci
Fernando Marçal|Marçal|LB|21|75|31|br
Bruno Guimarães|Bruno Guimarães|DM|39|81|22|br
Thiago Mendes|Thiago Mendes|DM|23|77|28|br
Houssem Aouar|Aouar|CM|8|83|22|fr
Maxence Caqueret|Caqueret|CM|25|75|20|fr
Lucas Tousart|Tousart|CM|29|77|23|fr
Memphis Depay|Memphis|ST|11|84|26|nl
Moussa Dembélé|Dembélé|ST|9|83|24|fr
Karl Toko Ekambi|Toko Ekambi|LW|7|79|27|cm
Rayan Cherki|Cherki|AM|18|73|16|fr
Bertrand Traoré|B. Traoré|RW|10|77|24|bf
= monaco 2003 4-4-2
Flavio Roma|Roma|GK|30|83|29|it
Tony Sylva|Sylva|GK|1|73|28|sn
Hugo Ibarra|Ibarra|RB|2|79|29|ar
Julien Rodríguez|Rodríguez|CB|4|79|25|fr
Sébastien Squillaci|Squillaci|CB|5|81|23|fr
Gaël Givet|Givet|CB|26|77|22|fr
Patrice Evra|Evra|LB|3|81|23|fr
Akis Zikos|Zikos|DM|6|81|29|gr
Lucas Bernardi|Bernardi|CM|8|79|26|ar
Édouard Cissé|Cissé|CM|18|75|25|fr
Jaroslav Plašil|Plašil|CM|14|73|21|cz
Ludovic Giuly|Giuly|RW|8|86|27|fr
Jérôme Rothen|Rothen|LW|25|84|26|fr
Fernando Morientes|Morientes|ST|9|86|28|es
Dado Pršo|Pršo|ST|11|83|29|hr
Shabani Nonda|Nonda|ST|10|79|26|cd
Emmanuel Adebayor|Adebayor|ST|17|75|20|tg
= monaco 2016 4-4-2
Danijel Subašić|Subašić|GK|1|84|32|hr
Morgan De Sanctis|De Sanctis|GK|30|70|40|it
Djibril Sidibé|Sidibé|RB|19|83|24|fr
Kamil Glik|Glik|CB|25|83|29|pl
Jemerson|Jemerson|CB|5|81|24|br
Andrea Raggi|Raggi|CB|24|77|33|it
Benjamin Mendy|Mendy|LB|23|83|22|fr
Fabinho|Fabinho|DM|2|84|23|br
Tiémoué Bakayoko|Bakayoko|DM|14|83|22|fr
João Moutinho|Moutinho|CM|8|83|30|pt
Bernardo Silva|Bernardo|RW|10|89|22|pt
Thomas Lemar|Lemar|LW|27|84|21|fr
Nabil Dirar|Dirar|RW|7|75|31|ma
Kylian Mbappé|Mbappé|ST|29|86|18|fr
Radamel Falcao|Falcao|ST|9|86|31|co
Valère Germain|Germain|ST|18|77|27|fr
Almamy Touré|Touré|RB|38|70|20|ml
Gabriel Boschilia|Boschilia|AM|11|73|20|br
Guido Carrillo|Carrillo|ST|17|73|25|ar
= lille 2010 4-3-3
Mickaël Landreau|Landreau|GK|1|83|31|fr
Ludovic Butelle|Butelle|GK|30|67|27|fr
Mathieu Debuchy|Debuchy|RB|2|81|25|fr
Adil Rami|Rami|CB|23|83|25|fr
Aurélien Chedjou|Chedjou|CB|22|79|25|cm
David Rozehnal|Rozehnal|CB|4|77|30|cz
Franck Béria|Béria|LB|18|75|27|fr
Rio Mavuba|Mavuba|DM|24|81|27|fr
Yohan Cabaye|Cabaye|CM|7|84|25|fr
Florent Balmont|Balmont|CM|4|79|31|fr
Ludovic Obraniak|Obraniak|AM|8|77|26|pl
Eden Hazard|Hazard|LW|26|86|20|be
Gervinho|Gervinho|RW|27|84|24|ci
Moussa Sow|Sow|ST|14|84|25|sn
Pierre-Alain Frau|Frau|ST|11|75|30|fr
Túlio de Melo|De Melo|ST|9|70|26|br
Emerson|Emerson|LB|25|73|23|br
Stéphane Dumont|Dumont|CM|17|70|28|fr
= lens 2022 3-4-3
Brice Samba|Samba|GK|30|83|28|fr
Jean-Louis Leca|Leca|GK|16|70|37|fr
Jonathan Gradit|Gradit|CB|24|77|30|fr
Kevin Danso|Danso|CB|4|81|24|at
Facundo Medina|Medina|CB|14|79|23|ar
Przemysław Frankowski|Frankowski|RB|29|79|27|pl
Massadio Haïdara|Haïdara|LB|21|75|30|ml
Deiver Machado|Machado|LB|3|75|29|co
Seko Fofana|Fofana|CM|8|84|27|ci
Salis Abdul Samed|Abdul Samed|DM|26|79|22|gh
Adrien Thomasson|Thomasson|CM|28|77|29|fr
Florian Sotoca|Sotoca|RW|7|79|32|fr
Lois Openda|Openda|ST|11|83|22|be
Alexis Claude-Maurice|Claude-Maurice|LW|10|75|24|fr
Angelo Fulgini|Fulgini|AM|17|75|26|fr
Wesley Saïd|Saïd|LW|22|75|27|fr
David Pereira da Costa|Da Costa|AM|20|73|21|pt
Adam Buksa|Buksa|ST|9|70|26|pl
= nantes 1994 4-4-2
Dominique Casagrande|Casagrande|GK|1|77|23|fr
David Marraud|Marraud|GK|16|65|29|fr
Jean-Michel Ferri|Ferri|CB|5|79|25|fr
Christian Karembeu|Karembeu|RB|2|81|24|fr
Éric Decroix|Decroix|CB|4|75|25|fr
Serge Le Dizet|Le Dizet|LB|3|77|28|fr
Claude Makélélé|Makélélé|DM|6|81|21|fr
Benoît Cauet|Cauet|CM|8|79|25|fr
Reynald Pedros|Pedros|AM|10|84|23|fr
Japhet N'Doram|N'Doram|AM|14|84|28|td
Patrice Loko|Loko|ST|9|84|24|fr
Nicolas Ouédec|Ouédec|ST|11|84|23|fr
Jean-Louis Capron|Capron|CB|13|73|28|fr
Christophe Pignol|Pignol|RB|15|73|25|fr
Laurent Guyot|Guyot|CM|17|75|25|fr
Philippe Renou|Renou|CM|18|70|25|fr
Pierre-Yves André|André|ST|20|70|20|fr
= nice 2016 4-3-3
Yoan Cardinale|Cardinale|GK|30|77|22|fr
Walter Benítez|Benítez|GK|40|67|23|ar
Ricardo Pereira|Ricardo Pereira|RB|2|79|23|pt
Dante|Dante|CB|31|81|33|br
Maxime Le Marchand|Le Marchand|CB|4|75|27|fr
Paul Baysse|Baysse|CB|5|73|28|fr
Malang Sarr|Sarr|LB|23|73|17|fr
Dalbert|Dalbert|LB|29|79|23|br
Jean Michaël Seri|Seri|CM|6|84|25|ci
Wylan Cyprien|Cyprien|CM|8|81|21|fr
Vincent Koziello|Koziello|CM|26|75|21|fr
Mathieu Bodmer|Bodmer|DM|10|73|34|fr
Younès Belhanda|Belhanda|AM|10|81|26|ma
Arnaud Souquet|Souquet|RB|22|73|24|fr
Alassane Pléa|Pléa|ST|14|81|23|fr
Mario Balotelli|Balotelli|ST|9|83|26|it
Rémi Walter|Walter|CM|18|73|21|fr
Anastasios Donis|Donis|RW|19|70|20|gr
= rennes 2018 4-3-3
Tomáš Koubek|Koubek|GK|1|77|25|cz
Abdoulaye Diallo|Diallo|GK|16|70|26|sn
Hamari Traoré|H. Traoré|RB|27|77|26|ml
Mexer|Mexer|CB|4|77|30|mz
Damien Da Silva|Da Silva|CB|3|77|30|fr
Jérémy Gélin|Gélin|CB|5|70|21|fr
Rami Bensebaini|Bensebaini|LB|25|77|23|dz
Benjamin André|André|DM|21|79|28|fr
Benjamin Bourigeaud|Bourigeaud|CM|14|79|24|fr
Clément Grenier|Grenier|CM|7|77|27|fr
James Léa Siliki|Léa Siliki|CM|22|73|22|cm
Hatem Ben Arfa|Ben Arfa|AM|18|83|31|fr
Ismaïla Sarr|Sarr|RW|17|81|20|sn
M'Baye Niang|Niang|ST|11|79|23|sn
Adrien Hunou|Hunou|ST|9|77|24|fr
Romain Del Castillo|Del Castillo|RW|20|73|22|fr
Jordan Siebatcheu|Siebatcheu|ST|19|73|22|us
Joris Gnagnon|Gnagnon|CB|6|73|21|fr
= strasbourg 2024 3-4-2-1
Đorđe Petrović|Petrović|GK|1|77|25|rs
Karl-Johan Johnsson|Johnsson|GK|30|65|34|se
Ismaël Doukouré|Doukouré|CB|4|73|21|fr
Mamadou Sarr|M. Sarr|CB|13|73|19|fr
Andrew Omobamidele|Omobamidele|CB|5|73|22|ie
Guéla Doué|G. Doué|RB|29|75|22|ci
Diego Moreira|Moreira|LW|7|75|20|be
Abakar Sylla|Sylla|CB|6|70|22|ci
Andrey Santos|Andrey Santos|CM|8|79|21|br
Habib Diarra|Diarra|CM|19|77|21|sn
Félix Lemaréchal|Lemaréchal|CM|24|70|21|fr
Dilane Bakwa|Bakwa|RW|17|77|22|fr
Sebastian Nanasi|Nanasi|RW|11|75|22|se
Emanuel Emegha|Emegha|ST|10|77|22|nl
Abdoul Ouattara|Ouattara|LW|20|70|19|bf
Saïdou Sow|Sow|CB|3|70|23|gn
Pape Diong|Diong|DM|22|67|20|sn
Moïse Sahi|Sahi|ST|9|67|20|ci
= toulouse 2022 4-3-3
Maxime Dupé|Dupé|GK|1|75|29|fr
Kjetil Haug|Haug|GK|16|65|24|no
Mikkel Desler|Desler|RB|2|75|27|dk
Rasmus Nicolaisen|Nicolaisen|CB|2|75|25|dk
Logan Costa|Logan Costa|CB|4|75|21|cv
Anthony Rouault|Rouault|CB|3|75|21|fr
Moussa Diarra|Diarra|LB|23|70|21|fr
Stijn Spierings|Spierings|DM|6|75|26|nl
Branco van den Boomen|Van den Boomen|CM|8|81|27|nl
Vincent Sierro|Sierro|CM|10|75|27|ch
Brecht Dejaegere|Dejaegere|AM|17|75|31|be
Zakaria Aboukhlal|Aboukhlal|RW|7|77|22|ma
Fares Chaïbi|Chaïbi|RW|11|77|20|dz
Thijs Dallinga|Dallinga|ST|9|79|22|nl
Rhys Healey|Healey|ST|19|70|28|en
Ado Onaiwu|Onaiwu|ST|14|70|27|jp
Gabriel Suazo|Suazo|LB|17|73|25|cl
Warren Kamanzi|Kamanzi|RB|29|70|22|no
= auxerre 1995 4-4-2
Lionel Charbonnier|Charbonnier|GK|1|81|29|fr
Fabien Cool|Cool|GK|16|67|23|fr
Franck Rabarivony|Rabarivony|RB|2|75|25|fr
Laurent Blanc|Blanc|CB|5|84|30|fr
Alain Goma|Goma|CB|4|79|23|fr
Taribo West|West|CB|6|79|22|ng
Franck Silvestre|Silvestre|CB|13|75|28|fr
Frédéric Danjou|Danjou|LB|3|73|21|fr
Philippe Violeau|Violeau|DM|8|77|25|fr
Sabri Lamouchi|Lamouchi|CM|14|79|24|fr
Corentin Martins|Martins|AM|10|83|26|fr
Moussa Saïb|Saïb|CM|15|79|26|dz
Christophe Cocard|Cocard|RW|7|77|28|fr
Bernard Diomède|Diomède|LW|11|77|21|fr
Yann Lachuer|Lachuer|CM|17|73|23|fr
Lilian Laslandes|Laslandes|ST|9|81|24|fr
Stéphane Guivarc'h|Guivarc'h|ST|19|81|25|fr
Abdelhafid Tasfaout|Tasfaout|ST|18|75|26|dz
Christian Henna|Henna|RB|20|67|21|fr
= angers 2018 4-3-3
Ludovic Butelle|Butelle|GK|1|75|35|fr
Alexandre Letellier|Letellier|GK|16|65|28|fr
Vincent Manceau|Manceau|RB|2|73|29|fr
Ismaël Traoré|I. Traoré|CB|5|75|32|ci
Romain Thomas|Thomas|CB|4|75|30|fr
Mateo Pavlović|Pavlović|CB|6|73|28|hr
Rayan Aït-Nouri|Aït-Nouri|LB|20|70|17|fr
Baptiste Santamaria|Santamaria|DM|8|79|23|fr
Thomas Mangani|Mangani|CM|25|77|31|fr
Pierrick Capelle|Capelle|CM|15|75|31|fr
Jeff Reine-Adélaïde|Reine-Adélaïde|AM|10|79|20|fr
Stéphane Bahoken|Bahoken|ST|9|75|26|cm
Flavien Tait|Tait|LW|7|77|25|fr
Angelo Fulgini|Fulgini|AM|17|75|22|fr
Enzo Crivelli|Crivelli|ST|19|73|23|fr
Ibrahim Amadou|Amadou|CM|14|73|25|fr
Cheikh N'Doye|N'Doye|CM|22|73|32|sn
= brest 2023 4-3-3
Marco Bizot|Bizot|GK|40|81|32|nl
Grégoire Coudert|Coudert|GK|1|67|24|fr
Kenny Lala|Lala|RB|27|77|32|fr
Brendan Chardonnet|Chardonnet|CB|5|77|29|fr
Lilian Brassier|Brassier|CB|3|77|24|fr
Bradley Locko|Locko|LB|22|75|21|fr
Jordan Amavi|Amavi|LB|23|70|29|fr
Mahdi Camara|Mahdi Camara|DM|45|79|25|fr
Pierre Lees-Melou|Lees-Melou|CM|20|79|30|fr
Hugo Magnetti|Magnetti|CM|8|75|25|fr
Romain Faivre|Faivre|AM|21|73|25|fr
Romain Del Castillo|Del Castillo|RW|10|79|27|fr
Kamory Doumbia|Doumbia|AM|26|75|20|ml
Jérémy Le Douaron|Le Douaron|LW|17|77|25|fr
Mathias Pereira Lage|Pereira Lage|LW|11|73|27|fr
Martín Satriano|Satriano|ST|9|75|22|uy
Steve Mounié|Mounié|ST|15|73|29|bj
Ludovic Ajorque|Ajorque|ST|19|75|29|fr
Achraf Dari|Dari|CB|4|73|24|ma
// FIM
`,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
  else (root.DEZ_BRUTO = root.DEZ_BRUTO || []).push(D);
})(typeof window !== 'undefined' ? window : this);
