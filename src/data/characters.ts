import { CHARACTER_IMAGES } from './characterImages.ts';

export interface Character {
  id: string;
  name: string;
  category: 'Cine de Terror' | 'Series & TV' | 'Animación & Fantasía' | 'Videojuegos & Pop';
  source: string;
  quote: string;
  description: string;
  imageUrl: string;
  fallbackImageUrl?: string;
  difficulty: 'Fácil (15 min)' | 'Medio (30 min)' | 'Creativo Low-Cost';
  estimatedCost: string;
  costumeBreakdown: {
    faceAndHair: string;
    clothing: string;
    signatureProp: string;
    zeroEuroHack: string;
  };
  diyTips: {
    material: string;
    instructions: string;
  }[];
  secretMission: string;
}

const BASE_HALLOWEEN_CHARACTERS: Character[] = [
  {
    id: 'ghostface',
    name: 'Ghostface',
    category: 'Cine de Terror',
    source: 'Scream (1996 - 2023)',
    quote: '¿Cuál es tu película de terror favorita?',
    description: 'El asesino telefónico más icónico del slasher de los 90. Manto negro con capucha holgada, máscara espectral alargada y afición por las llamadas inquietantes.',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=900&q=80',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Máscara alargada en plato de cartón o cartulina blanca con ojos y boca negra.',
      clothing: 'Sudadera negra XL con capucha muy ancha o túnica con una bolsa de basura negra recortada.',
      signatureProp: 'Cuchillo de cocina de cartón forrado en papel de aluminio.',
      zeroEuroHack: 'Lleva un móvil viejo en la oreja fingiendo llamar a la gente de la fiesta.'
    },
    diyTips: [
      { material: 'Máscara casera', instructions: 'Dibuja la clásica cara alargada con rotulador permanente negro en un plato de cartón blanco o cartulina y recorta los ojos.' },
      { material: 'Túnica espectral', instructions: 'Una sudadera negra con capucha muy grande o una sábana/bolsa de basura negra recortada con flecos en las mangas.' },
      { material: 'Cuchillo de atrezzo', instructions: 'Cartón forrado con papel de aluminio de cocina y mango envuelto en cinta aislante negra.' },
      { material: 'Llamada telefónica', instructions: 'Lleva en la mano un teléfono móvil fingiendo que llamas a los demás invitados de Casa de Nico.' }
    ],
    secretMission: 'Acércate sigilosamente por detrás de 3 personas durante la noche y susúrrale al oído su pregunta célebre.'
  },
  {
    id: 'beetlejuice',
    name: 'Beetlejuice',
    category: 'Cine de Terror',
    source: 'Beetlejuice (Tim Burton)',
    quote: '¡Es la hora del show!',
    description: 'El bioexorcista más caótico y descarado del inframundo. Traje a rayas verticales blancas y negras, pelo verde electrificado y maquillaje cadavérico.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 4€',
    costumeBreakdown: {
      faceAndHair: 'Pelo verde alborotado hacia arriba, cara pálida y ojeras moradas/verdosas.',
      clothing: 'Pantalón y chaqueta oscuros con rayas verticales de cinta carrocero blanca.',
      signatureProp: 'Corbata negra fina torcida y un folleto doblado de bioexorcista.',
      zeroEuroHack: 'Harina + tiza verde para el pelo; cinta adhesiva para crear las rayas del traje.'
    },
    diyTips: [
      { material: 'Traje a rayas', instructions: 'Pantalón y chaqueta negros o grises a los que pegas cinta carrocero o cinta aislante blanca formando rayas verticales.' },
      { material: 'Pelo loco', instructions: 'Péinate hacia arriba con gomina y aplica un toque de harina o polvos de talco mezclados con sombra de ojos verde o tiza verde.' },
      { material: 'Maquillaje cadavérico', instructions: 'Base blanca muy pálida (harina o pintura al agua), ojeras moradas y toques de verde musgo alrededor de la boca.' },
      { material: 'Corbata', instructions: 'Cinta negra o tira de tela atada con un nudo flojo y descuidado.' }
    ],
    secretMission: 'Si alguien dice tu nombre tres veces seguidas, debes soltar una carcajada demoníaca y bailar como un poseso.'
  },
  {
    id: 'wednesday-addams',
    name: 'Miércoles Addams',
    category: 'Series & TV',
    source: 'Wednesday (Netflix) / La Familia Addams',
    quote: 'No me interesan los finales felices. Prefiero los finales sangrientos.',
    description: 'La gótica más despiadada y sarcástica. Mirada imperturbable sin parpadear, dos trenzas oscuras impecables, cuello blanco triangular y alergia total al color.',
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€',
    costumeBreakdown: {
      faceAndHair: 'Dos trenzas simétricas oscuras con raya al centro y mirada fría sin parpadear.',
      clothing: 'Vestido negro o jersey negro sacando el cuello blanco puntiagudo de una camisa.',
      signatureProp: 'La mano "Cosas" en el hombro hecha con un guante relleno.',
      zeroEuroHack: 'Cero maquillaje de color: solo labios mate oscuros o naturales y expresión neutra.'
    },
    diyTips: [
      { material: 'Peinado', instructions: 'Dos trenzas laterales bien peinadas y raya al centro. Si tienes flequillo o pelo oscuro, peinado liso total.' },
      { material: 'Vestimenta', instructions: 'Vestido negro o jersey negro sobre el que sacas el cuello de una camisa blanca de botones.' },
      { material: 'Expresión', instructions: 'Cero sonrisas toda la noche. Mantén contacto visual fijo sin pestañear durante 5 segundos cada vez que saludes.' },
      { material: 'Accesorio Cosas ("Thing")', instructions: 'Un guante de fregar relleno de calcetines con costuras dibujadas puesto en el hombro.' }
    ],
    secretMission: 'Baila en algún momento de la noche el icónico baile espasmódico de la serie al sonar la música.'
  },
  {
    id: 'chucky',
    name: 'Chucky el Muñeco Diabólico',
    category: 'Cine de Terror',
    source: 'Child\'s Play (1988 - Presente)',
    quote: '¡Hola, soy Chucky! ¿Quieres ser mi amigo hasta la muerte?',
    description: 'El muñeco Good Guy poseído por el asesino Charles Lee Ray. Peto vaquero, camiseta de rayas multicolor, pelo pelirrojo despeinado y costuras faciales.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Medio (30 min)',
    estimatedCost: '0€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Pelo alborotado con gomina rojiza y cicatrices dibujadas con costuras cruzadas.',
      clothing: 'Peto vaquero (o vaqueros con tirantes) y camiseta o jersey a rayas de colores.',
      signatureProp: 'Cuchillo de plástico o cartón plateado.',
      zeroEuroHack: 'Pega un letrero de "Good Guys" en el peto con un rotulador en papel blanco.'
    },
    diyTips: [
      { material: 'Ropa', instructions: 'Peto vaquero (o pantalón tejano con tirantes) y una camiseta o jersey de rayas de colores.' },
      { material: 'Cicatrices', instructions: 'Con lápiz de ojos marrón/negro y pintalabios rojo dibuja costuras y cortes simulando piel cosida en la mejilla.' },
      { material: 'Pelo pelirrojo', instructions: 'Pelo alborotado con gomina. Si no eres pelirrojo, un poco de colorete o spray temporal color naranja.' },
      { material: 'Zapatillas', instructions: 'Lleva unas zapatillas rojas o con cordones llamativos y una mirada traviesa.' }
    ],
    secretMission: 'Hazte el muñeco inmóvil cada vez que alguien te enfoque con la cámara antes de saltar de golpe.'
  },
  {
    id: 'michael-myers',
    name: 'Michael Myers',
    category: 'Cine de Terror',
    source: 'Halloween (John Carpenter)',
    quote: '...',
    description: 'La forma pura del mal. El hombre del saco de Haddonfield que camina despacio pero siempre te alcanza con su mono azul marino y su máscara blanca inexpresiva.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Máscara blanca lisa fría con pelo oscuro alborotado hacia atrás.',
      clothing: 'Mono de trabajo azul oscuro o camisa de manga larga azul con pantalón a juego.',
      signatureProp: 'Gran cuchillo de chef de cartón forrado en aluminio.',
      zeroEuroHack: 'Paso lento y pausado: nunca corras, Michael Myers jamás corre y siempre llega.'
    },
    diyTips: [
      { material: 'Máscara', instructions: 'Pinta tu cara con base blanca muy lisa y neutra, o usa una máscara blanca barata recortándole la expresión para que parezca fría y sin vida.' },
      { material: 'Mono azul marino', instructions: 'Mono de trabajo o camisa de manga larga azul oscura/gris combinada con pantalón del mismo tono.' },
      { material: 'El andar', instructions: 'Paso lento, respiración audible y cuello ligeramente inclinado cuando mires a tus víctimas.' },
      { material: 'Cuchillo', instructions: 'Cuchillo grande de chef hecho de cartón forrado con papel aluminio.' }
    ],
    secretMission: 'Quédate totalmente quieto al fondo de una habitación mirando a alguien fijamente hasta que se dé cuenta.'
  },
  {
    id: 'freddy-krueger',
    name: 'Freddy Krueger',
    category: 'Cine de Terror',
    source: 'A Nightmare on Elm Street',
    quote: 'Uno, dos, Freddy viene por ti...',
    description: 'El señor del mundo de los sueños con jersey a rayas rojas y verdes, sombrero fedora marrón desgastado, rostro con quemaduras y el letal guante de cuchillas.',
    imageUrl: 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '2€ - 5€',
    costumeBreakdown: {
      faceAndHair: 'Quemaduras simuladas con miel, cacao y toques rojos; sombrero marrón gastado.',
      clothing: 'Jersey de rayas horizontales rojas y oscuras/verdes.',
      signatureProp: 'Guante de lana con 4 cuchillos de plástico o cartón plateado en los dedos.',
      zeroEuroHack: 'Rascar las cuchillas contra mesas o paredes metálicas para hacer ruido chirriante.'
    },
    diyTips: [
      { material: 'Guante de garras', instructions: 'Guante de lana o cuero marrón. Pega 4 cuchillos de plástico o tubos de cartón/pajitas pintados de plateado en los dedos.' },
      { material: 'Jersey a rayas', instructions: 'Jersey de rayas rojas y verdes u oscuras. Si no tienes, pinta rayas con rotulador o tempera sobre un jersey viejo.' },
      { material: 'Sombrero fedora', instructions: 'Cualquier sombrero oscuro tipo panamá o fedora de abuelo.' },
      { material: 'Quemaduras faciales', instructions: 'Gelatina líquida o miel con un toque de cacao en polvo y pintalabios rojo aplicada en toques sobre la piel.' }
    ],
    secretMission: 'Rasca las "garras" contra alguna mesa o superficie metálica para hacer sonido chirriante.'
  },
  {
    id: 'pennywise',
    name: 'Pennywise el Payaso Bailarín',
    category: 'Cine de Terror',
    source: 'IT (Stephen King)',
    quote: 'Todos flotan... ¡y tú también flotarás!',
    description: 'El devorador de mundos metamorfo de Derry. Rostro blanco con las dos icónicas líneas rojas verticales sobre los ojos, cuello de volantes y un solitario globo rojo.',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Líneas rojas desde las comisuras cruzando ojos hasta la frente con nariz roja.',
      clothing: 'Camisa beige o gris con dos pompones rojos en el pecho y cuello de volantes.',
      signatureProp: 'Globo rojo hinchado con hilo blanco.',
      zeroEuroHack: 'Cuello de lechuguilla hecho doblando papel de cocina o blondas en zigzag.'
    },
    diyTips: [
      { material: 'Líneas rojas', instructions: 'Con pintalabios rojo dibuja las dos icónicas líneas verticales curvadas que van desde los extremos de la boca, pasando por las mejillas y cruzando los ojos hasta la frente.' },
      { material: 'Globo rojo', instructions: 'Un simple globo rojo hinchado atado con una cuerda de lana blanca. ¡El accesorio estrella!' },
      { material: 'Cuello victoriano', instructions: 'Papel higiénico o blondas de tarta dobladas en abanico y grapadas alrededor del cuello.' },
      { material: 'Ropa clara', instructions: 'Camisa o sudadera gris/beige con dos pompones rojos (o círculos de fieltro/papel rojo) pegados en el pecho.' }
    ],
    secretMission: 'Ofrece amablemente tu globo rojo a alguien mientras sonríes con la cabeza agachada y los ojos mirando hacia arriba.'
  },
  {
    id: 'jack-skellington',
    name: 'Jack Skellington',
    category: 'Animación & Fantasía',
    source: 'Pesadilla antes de Navidad (Tim Burton)',
    quote: '¿Qué es? ¿Qué es? ¡Hay luces de color!',
    description: 'El Rey Calabaza de Halloween Town. Traje negro de raya fina, pajarita murciélago puntiaguda y sonrisa esquelética cosida.',
    imageUrl: 'https://images.unsplash.com/photo-1508341591423-4347099e1f19?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Medio (30 min)',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Cara blanca con cuencas negras y sonrisa esquelética con costuras verticales.',
      clothing: 'Chaqueta y pantalón negros con líneas finas de tiza blanca.',
      signatureProp: 'Pajarita murciélago de cartulina negra.',
      zeroEuroHack: 'La tiza de pizarra dibuja rayas perfectas en ropa negra y se quita lavando con agua.'
    },
    diyTips: [
      { material: 'Pajarita murciélago', instructions: 'Recorta en cartulina negra la silueta de un murciélago con alas puntiagudas y ponle dos ojos blancos con típex.' },
      { material: 'Traje de rayas finas', instructions: 'Chaqueta y pantalón negros marcados con tiza blanca trazando rayas verticales finas.' },
      { material: 'Maquillaje de calavera', instructions: 'Cara blanca con sombra negra rodeando completamente las cuencas de los ojos y líneas verticales cosidas sobre los labios alargados.' }
    ],
    secretMission: 'Examina cualquier objeto de la fiesta con genuina fascinación científica como si nunca antes lo hubieras visto.'
  },
  {
    id: 'sally',
    name: 'Sally la Muñeca de Trapo',
    category: 'Animación & Fantasía',
    source: 'Pesadilla antes de Navidad',
    quote: 'Tengo un mal presentimiento sobre esto...',
    description: 'La creación de retales del Dr. Finkelstein. Vestido multicolor cosido a parches, cabello cobrizo y costuras en cuello, brazos y muñecas.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Costuras negras dibujadas en cuello y mejilla, pelo largo liso cobrizo o suelto.',
      clothing: 'Vestido o camiseta con retales y formas geométricas unidas con imperdibles.',
      signatureProp: 'Hojas secas en las manos o aguja e hilo grande de plástico.',
      zeroEuroHack: 'Lápiz de ojos negro waterproof para trazar costuras en brazos y cuello que no se borren con el sudor.'
    },
    diyTips: [
      { material: 'Costuras dibujadas', instructions: 'Usa lápiz de ojos negro resistente al agua para dibujarte costuras estilo frankenstein en brazos, cuello y alrededor del ojo.' },
      { material: 'Vestido patchwork', instructions: 'Pega retales de telas de colores o bolsas de papel estampadas con imperdibles sobre una camiseta vieja.' },
      { material: 'Pelo rojizo', instructions: 'Pelo suelto liso peinado a los lados con sombra rojiza o un gorro rojo suave.' }
    ],
    secretMission: 'Advierte en tono místico a alguien de que algo terrible o fascinante pasará antes de las doce.'
  },
  {
    id: 'coraline-jones',
    name: 'Coraline Jones',
    category: 'Animación & Fantasía',
    source: 'Los Mundos de Coraline (Laika Studios)',
    quote: 'No quiero que me concedan todo lo que deseo. Nadie lo desea.',
    description: 'La valiente exploradora con pelo azul cobalto, chubasquero amarillo brillante, botas de lluvia y su piedra con agujero para descubrir secretos.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Pelo azul con una horquilla de mariposa o libélula en el flequillo.',
      clothing: 'Chubasquero o sudadera amarillo chillón con vaqueros oscuros.',
      signatureProp: 'Piedra triangular verde con un agujero central colgada al cuello.',
      zeroEuroHack: 'Un trozo de cartón pintado de verde con un agujero hace de piedra mágica.'
    },
    diyTips: [
      { material: 'Chubasquero amarillo', instructions: 'Un chubasquero amarillo o un jersey/sudadera amarillo brillante con capucha.' },
      { material: 'Pelo azul', instructions: 'Spray temporal azul o laca con purpurina azulada con una horquilla de libélula o mariposa en el flequillo.' },
      { material: 'Piedra con agujero', instructions: 'Un trozo de cartón recortado como un triángulo con un agujero en el centro colgado del cuello con un cordel verde.' },
      { material: 'Botas de agua', instructions: 'Cualquier bota oscura o de lluvia y tejanos enrollados.' }
    ],
    secretMission: 'Mira a través de tu piedra con agujero a los demás invitados para comprobar si son "los otros padres".'
  },
  {
    id: 'la-otra-madre',
    name: 'La Otra Madre (Beldam)',
    category: 'Animación & Fantasía',
    source: 'Los Mundos de Coraline',
    quote: 'Pronto lo verás a nuestra manera... solo tenemos que coserte los botones.',
    description: 'La temible araña del otro mundo disfrazada de madre perfecta con grandes ojos de botón negro azabache, labios rojos y dedos alargados.',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Medio (30 min)',
    estimatedCost: '1€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Dos botones negros gigantes sobre los ojos o párpados pintados con 4 puntos de hilo.',
      clothing: 'Vestido negro ceñido con cuello alto y zapatos de tacón oscuro.',
      signatureProp: 'Caja pequeña de costura con dos botones negros grandes.',
      zeroEuroHack: 'Pintar dos círculos negros en los párpados: al cerrar los ojos eres idéntica.'
    },
    diyTips: [
      { material: 'Ojos de botón', instructions: 'Dibuja con delineador negro dos círculos gigantes en los párpados con 4 puntos blancos de típex.' },
      { material: 'Traje elegante', instructions: 'Vestido negro o camisa negra ajustada con cuello alto.' },
      { material: 'Labios y uñas', instructions: 'Pintalabios rojo sangre impecable y uñas largas afiladas hechas con pajitas negras o cartulina.' }
    ],
    secretMission: 'Lleva dos botones negros grandes en el bolsillo y ofréceselos a alguien diciendo con cariño: "Te sentarían genial".'
  },
  {
    id: 'jason-voorhees',
    name: 'Jason Voorhees',
    category: 'Cine de Terror',
    source: 'Viernes 13 (Crystal Lake)',
    quote: 'Ch-ch-ch, ah-ah-ah...',
    description: 'La leyenda de Crystal Lake. La máscara de hockey desgastada con triángulos rojos, chaqueta oscura de leñador y machete ensangrentado.',
    imageUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Máscara de hockey blanca agujereada con los 3 triángulos rojos en frente y mejillas.',
      clothing: 'Chaqueta militar verde oliva o camisa de cuadros vieja con manchas de tierra/café.',
      signatureProp: 'Machete de cartón forrado en aluminio.',
      zeroEuroHack: 'Un plato de cartón perforado con un bolígrafo imita la máscara de hockey al instante.'
    },
    diyTips: [
      { material: 'Máscara de hockey', instructions: 'Plato de cartón blanco perforado con un lápiz haciendo agujeritos en triángulo y pintando los tres triángulos rojos característicos.' },
      { material: 'Chaqueta militar', instructions: 'Chaqueta verde oliva desgastada o camisa de cuadros vieja con toques de tierra/café para parecer sucia de pantano.' },
      { material: 'Machete de cartón', instructions: 'Machete recortado en cartón de caja de cereales, forrado con papel aluminio y salpicaduras de ketchup o sirope rojo.' }
    ],
    secretMission: 'Cada vez que te sirvan una copa, haz sonar con la garganta el famoso "Ki-ki-ki, ma-ma-ma".'
  },
  {
    id: 'samara-morgan',
    name: 'Samara Morgan',
    category: 'Cine de Terror',
    source: 'The Ring (La Señal / La Llamada)',
    quote: 'Siete días...',
    description: 'La niña espectral que surge reptando del pozo a través de la televisión. Melena negra húmeda cubriendo el rostro y camisón blanco sucio.',
    imageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e60b?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€',
    costumeBreakdown: {
      faceAndHair: 'Pelo largo completamente echado hacia adelante cubriendo toda la cara.',
      clothing: 'Camisón blanco largo o sábana con manchas de barro, ceniza y agua.',
      signatureProp: 'Cinta de vídeo VHS vieja o teléfono sonando.',
      zeroEuroHack: 'Agua con acondicionador para mantener el pelo apelmazado hacia adelante.'
    },
    diyTips: [
      { material: 'Camisón blanco', instructions: 'Camisón, sábana blanca con agujero o vestido blanco manchado de café húmedo y ceniza en el dobladillo.' },
      { material: 'Melena al frente', instructions: 'Tira todo el pelo hacia adelante tapando por completo el rostro y humedécelo con un poco de agua con acondicionador para que se quede en mechones oscuros.' },
      { material: 'Pies descalzos o desaliñados', instructions: 'Camina despacio arrastrando los pies y haciendo movimientos espasmódicos con los dedos de las manos.' }
    ],
    secretMission: 'Llama por teléfono a alguien que esté al otro lado del salón y susúrrale: "Siete días...".'
  },
  {
    id: 'edward-scissorhands',
    name: 'Eduardo Manostijeras',
    category: 'Cine de Terror',
    source: 'Edward Scissorhands (Tim Burton)',
    quote: 'Si no me hubiera conocido, seguiría vivo.',
    description: 'El alma sensible de corazón puro con cuchillas afiladas en lugar de dedos, cuero negro con cinturones cruzados, tez pálida y cabello electrizado.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Pelo alborotado con laca, cara pálida y pequeñas cicatrices finas.',
      clothing: 'Ropa negra total con varios cinturones viejos cruzados sobre el pecho y cintura.',
      signatureProp: 'Guantes negros con cucharas/cuchillos de plástico o tiras de cartón plateado.',
      zeroEuroHack: 'Cubiertos de plástico pegados a guantes con cinta aislante negra.'
    },
    diyTips: [
      { material: 'Dedos de tijera', instructions: 'Pega cubiertos de plástico (cuchillos/tenedores) o tiras de cartón plateado a unos guantes negros usando cinta adhesiva negra.' },
      { material: 'Cinturones cruzados', instructions: 'Vístete de negro total y ponte varios cinturones viejos cruzados por el pecho y cintura.' },
      { material: 'Cicatrices y rostro', instructions: 'Cara pálida con polvos de talco y rayitas delgadas moradas en los pómulos y frente.' },
      { material: 'Pelo electrizado', instructions: 'Carda el pelo a lo loco con laca o gomina seca.' }
    ],
    secretMission: 'Finge intentar coger comida o una bebida con extrema dificultad y delicadeza debido a tus tijeras.'
  },
  {
    id: 'art-the-clown',
    name: 'Art the Clown',
    category: 'Cine de Terror',
    source: 'Terrifier (1, 2 y 3)',
    quote: '(Silencio absoluto con bocinazo burlón)',
    description: 'El mimo asesino silencioso más sanguinario del terror moderno. Traje holgado blanco y negro, sombrerito diminuto en la coronilla y mímica desquiciada.',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 4€',
    costumeBreakdown: {
      faceAndHair: 'Cara blanca de payaso mimo con boca negra alargada y mini sombrerito negro ladeado.',
      clothing: 'Mono holgado blanco y negro o sudadera blanca con botones gigantes negros.',
      signatureProp: 'Bolsa de basura negra al hombro y una pequeña bocina.',
      zeroEuroHack: 'Cero palabras en toda la noche: solo gestos exagerados de mimo y sonrisas congeladas.'
    },
    diyTips: [
      { material: 'Sombrerito diminuto', instructions: 'Cilindro pequeño de cartón negro o vaso de chupito de plástico pintado de negro sujeto con una gomita a la cabeza.' },
      { material: 'Mono blanco y negro', instructions: 'Ropa blanca holgada con botones negros grandes dibujados con rotulador.' },
      { material: 'Mímica muda', instructions: 'No hables absolutamente NADA durante al menos 15 minutos de la fiesta; comunícate solo con gestos exagerados de mimo y una bocina pequeña.' },
      { material: 'Bolsa de basura', instructions: 'Lleva una bolsa de basura negra colgada al hombro con tus pertenencias dentro.' }
    ],
    secretMission: 'Toca una pequeña bocina o haz ruido con las llaves detrás de la gente y sonríe sin pestañear cuando se giren.'
  },
  {
    id: 'vecna',
    name: 'Vecna (Henry Creel)',
    category: 'Series & TV',
    source: 'Stranger Things (Temporada 4)',
    quote: 'Tu tiempo ha llegado a su fin.',
    description: 'El soberano del Mundo del Revés. Piel de enredaderas carnosas rojas y moradas, una gran garra izquierda y el tic-tac de un reloj siniestro.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Venas y tentáculos morados y rojizos dibujados sobre el rostro y cuello.',
      clothing: 'Camiseta y pantalón oscuros con cuerdas y lanas pegadas como enredaderas carnosas.',
      signatureProp: 'Dedos alargados en la mano izquierda con canutillos de papel.',
      zeroEuroHack: 'Lana de tejer vieja teñida o pintada pegada a la ropa simulando las venas del Upside Down.'
    },
    diyTips: [
      { material: 'Tentáculos y venas', instructions: 'Pega cuerdas, lana gruesa o tiras de papel maché sobre una camiseta vieja pintadas de rojo oscuro y morado simulando enredaderas carnosas.' },
      { material: 'Garra izquierda', instructions: 'Alarga los dedos de tu mano izquierda enrollando tubos de papel marrón o cartón en las puntas.' },
      { material: 'Efecto reloj', instructions: 'Haz con la boca el sonido de "TIC... TOC... TIC... TOC..." cada vez que alguien tarde en responder.' }
    ],
    secretMission: 'Pregúntale a tus amigos cuál es su canción favorita de los 80 para "salvarse de tu trance".'
  },
  {
    id: 'dracula',
    name: 'Conde Drácula',
    category: 'Cine de Terror',
    source: 'Drácula (Bram Stoker)',
    quote: 'Entrad por vuestra propia voluntad y dejad algo de la alegría que traéis.',
    description: 'El inmortal de Transilvania. Aristócrata con cabello engominado, capa negra de forro carmesí, chaleco victoriano y colmillos sedientos.',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Pelo engominado hacia atrás con pico de viuda negro y gotas de sangre en los labios.',
      clothing: 'Camisa blanca de botones con chaleco o chaqueta oscura y capa negra con cuello alto.',
      signatureProp: 'Copa de vino tinto misteriosa.',
      zeroEuroHack: 'Sábana o tela negra sujeta con un imperdible y cuello alzado de cartón rojo.'
    },
    diyTips: [
      { material: 'Capa con cuello', instructions: 'Sábana o tela negra atada al cuello con un forro interior rojo (o cartulina roja plegada para alzar el cuello).' },
      { material: 'Gominas engominadas', instructions: 'Pelo engominado hacia atrás impecable con pico de viuda en la frente hecho con sombra de ojos negra.' },
      { material: 'Gotas de sangre', instructions: 'Una gota roja de mermelada de fresa o pintalabios cayendo de la comisura de los labios.' },
      { material: 'Copa misteriosa', instructions: 'Lleva tu bebida en una copa de vino tinto o vaso elegante brindando por la eternidad.' }
    ],
    secretMission: 'Niega rotundamente comer cualquier aperitivo que contenga ajo y di que "no bebes... vino común".'
  },
  {
    id: 'frankenstein-monster',
    name: 'El Monstruo de Frankenstein',
    category: 'Cine de Terror',
    source: 'Frankenstein (Mary Shelley)',
    quote: '¡Está vivo! ¡Está VIVO!',
    description: 'La creación titánica de retales humanos. Frente cuadrada, tornillos a los lados del cuello, chaqueta dos tallas pequeña y pasos mecánicos pesados.',
    imageUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Medio (30 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Tono verdoso o grisáceo con grapas horizontales en la frente y dos tornillos en el cuello.',
      clothing: 'Chaqueta de traje que te quede pequeña para que los brazos parezcan gigantes.',
      signatureProp: 'Tornillos de corcho de botella envueltos en papel aluminio.',
      zeroEuroHack: 'Dos tapones de corcho envueltos en papel plata y pegados con cinta de doble cara.'
    },
    diyTips: [
      { material: 'Tornillos del cuello', instructions: 'Dos corchos de botella o tapones de plástico envueltos en papel aluminio pegados a cada lado del cuello con cinta de doble cara.' },
      { material: 'Chaqueta corta', instructions: 'Chaqueta de traje que te quede dos tallas pequeña para que las mangas parezcan ridículamente cortas y tus brazos enormes.' },
      { material: 'Frente cuadrada', instructions: 'Dibuja una costura con grapas horizontales en la frente y camina con las rodillas rígidas como un gigante torpe.' }
    ],
    secretMission: 'Cada vez que alguien encienda un mechero o vela, grita teatralmente: "¡FUEGO! ¡FUEGO MALO!".'
  },
  {
    id: 'novia-de-frankenstein',
    name: 'La Novia de Frankenstein',
    category: 'Cine de Terror',
    source: 'The Bride of Frankenstein (Universal Monsters)',
    quote: '¡Ssssshhhhh! (Chillido ensordecedor)',
    description: 'El icono gótico por excelencia: peinado colmena electrificado con rayos blancos laterales en zigzag y manto fúnebre blanco.',
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Peinado colmena alto con dos rayos blancos en zigzag y labios oscuros marcados.',
      clothing: 'Vestido blanco largo o sábanas drapeadas con vendas rodeando los brazos.',
      signatureProp: 'Vendajes en muñecas y cuello.',
      zeroEuroHack: 'Cardar el pelo sobre una botella vacía de plástico para sostener la colmena alta.'
    },
    diyTips: [
      { material: 'Peinado colmena', instructions: 'Carda el pelo hacia arriba sobre una botella de plástico pequeña de agua vacía en el centro, y pinta con spray blanco o tiza blanca dos rayos en zigzag en los laterales.' },
      { material: 'Vendajes de novia', instructions: 'Vestido blanco largo o vendas elásticas de botiquín rodeando brazos y cuello.' },
      { material: 'Labios oscuros', instructions: 'Pintalabios borgoña oscuro y cejas muy marcadas y arqueadas.' }
    ],
    secretMission: 'Mira con desprecio al Monstruo de Frankenstein si alguien lo lleva, o rechaza citas galantes con un bufido.'
  },
  {
    id: 'el-hombre-lobo',
    name: 'El Hombre Lobo',
    category: 'Cine de Terror',
    source: 'The Wolf Man',
    quote: 'Incluso un hombre de corazón puro se convierte en lobo bajo la luna llena...',
    description: 'El licántropo clásico atrapado en la maldición lunar. Camisa de leñador desgarrada, hocico lobuno y garras afiladas.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Punta de la nariz negra, pelitos dibujados con lápiz de cejas y cejas hirsutas.',
      clothing: 'Camisa vieja de cuadros rasgada en pecho y mangas.',
      signatureProp: 'Aullido potente y mirada hambrienta.',
      zeroEuroHack: 'Lápiz de ojos marrón y negro para trazar trazos de pelo por mejillas y mandíbula.'
    },
    diyTips: [
      { material: 'Camisa rasgada', instructions: 'Camisa vieja de cuadros a la que le haces desgarros en pecho y mangas con las tijeras.' },
      { material: 'Pelaje facial', instructions: 'Dibuja pelitos marrones y negros con lápiz de cejas en pómulos, mandíbula y cuello.' },
      { material: 'Nariz negra de lobo', instructions: 'Pinta la punta de la nariz de negro mate y sombra oscura alrededor de los ojos.' }
    ],
    secretMission: 'Suelta un aullido largo mirando a la lámpara más brillante del salón simulando la luna llena.'
  },
  {
    id: 'la-monja-valak',
    name: 'La Monja (Valak)',
    category: 'Cine de Terror',
    source: 'The Conjuring Universe / La Monja',
    quote: 'El demonio no descansa en tierra consagrada.',
    description: 'El demonio ancestral con hábito religioso, rostro blanco marmóreo agrietado, cuencas orbitales negras y cruz invertida.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Medio (30 min)',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Cara blanca con sombra negra muy profunda en ojos y labios oscuros agrietados.',
      clothing: 'Hábito negro (camiseta larga negra o túnica) con toalla blanca bajo la capucha.',
      signatureProp: 'Rosario grande con cruz de palitos.',
      zeroEuroHack: 'Una toalla de manos blanca colocada sobre la cabeza bajo una sudadera negra crea el velo de monja perfecto.'
    },
    diyTips: [
      { material: 'Hábito de monja', instructions: 'Camiseta negra larga o sábana negra y una toalla pequeña blanca cubriendo la frente bajo la capucha negra.' },
      { material: 'Ojos negros ahumados', instructions: 'Sombra negra muy densa cubriendo todos los párpados y ojeras.' },
      { material: 'Rosario diabólico', instructions: 'Collar de cuentas con cruz hecha de dos ramas de árbol o palitos atados con cordel.' }
    ],
    secretMission: 'Ponte detrás de las puertas entreabiertas en silencio esperando a que entren tus amigos.'
  },
  {
    id: 'billy-the-puppet',
    name: 'Billy el Muñeco (Saw)',
    category: 'Cine de Terror',
    source: 'SAW (Jigsaw)',
    quote: 'Quiero jugar a un juego... las reglas son sencillas.',
    description: 'El mensajero mecánico sobre su triciclo rojo. Espirales rojas en las mejillas, traje de etiqueta negro, pajarita escarlata y líneas de marioneta.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Dos espirales rojas en las mejillas, cara blanca y dos líneas de ventrílocuo en la barbilla.',
      clothing: 'Chaqueta de traje negra con camisa blanca abotonada hasta el cuello.',
      signatureProp: 'Pajarita roja escarlata y cinta de casete con la palabra "PLAY ME".',
      zeroEuroHack: 'Pintalabios rojo para dibujar las espirales perfectas en las mejillas.'
    },
    diyTips: [
      { material: 'Espirales rojas', instructions: 'Pinta dos espirales rojas perfectas en ambas mejillas con barra de labios roja y cara con base blanca.' },
      { material: 'Traje formal', instructions: 'Chaqueta de vestir negra con camisa blanca abotonada hasta arriba.' },
      { material: 'Pajarita roja', instructions: 'Lazo rojo hecho con una cinta de regalo o tira de tela roja doblada.' },
      { material: 'Líneas de marioneta', instructions: 'Dos líneas verticales negras desde las comisuras de la boca hasta la barbilla.' }
    ],
    secretMission: 'Acércate a alguien que esté jugando o comiendo y dile con voz grave: "Quiero jugar a un juego... las reglas son sencillas".'
  },
  {
    id: 'annabelle',
    name: 'Annabelle la Muñeca Poseída',
    category: 'Cine de Terror',
    source: 'The Conjuring / Annabelle',
    quote: '¿Me echabas de menos?',
    description: 'La muñeca de porcelana de aspecto angelical y aura demoníaca. Vestido blanco victoriano con lazo rojo en la cintura y trenzas infantiles.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Dos trenzas con lazos rojos en las puntas, colorete muy redondo y pecas marcadas.',
      clothing: 'Vestido blanco de verano o camisa larga con una cinta roja ancha en la cintura.',
      signatureProp: 'Etiqueta de advertencia: "No abrir bajo ninguna circunstancia".',
      zeroEuroHack: 'Una cinta de regalo roja anudada a la cintura transforma cualquier vestido blanco en Annabelle.'
    },
    diyTips: [
      { material: 'Vestido blanco con lazo', instructions: 'Vestido blanco de verano con una cinta o cinturón rojo ancho anudado a la cintura.' },
      { material: 'Trenzas con lazos', instructions: 'Dos trenzas altas sujetas con lazos rojos brillantes en las puntas.' },
      { material: 'Mejillas de muñeca', instructions: 'Colorete rosa muy marcado en círculos sobre las mejillas y pecas dibujadas.' }
    ],
    secretMission: 'Siéntate en una silla recta en un rincón con las manos sobre las rodillas sin moverte durante 5 minutos.'
  },
  {
    id: 'carrie-white',
    name: 'Carrie White',
    category: 'Cine de Terror',
    source: 'Carrie (Stephen King)',
    quote: '¡Se van a reír de ti!',
    description: 'La reina de graduación con poderes telequinéticos bañada en sangre de cerdo. Vestido de gala salpicado, tiara doblada y mirada homicida.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Medio (30 min)',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Chorros de sangre falsa cayendo desde el pelo por la frente y mejillas.',
      clothing: 'Vestido de fiesta claro o camisón empapado en manchas rojas abundantes.',
      signatureProp: 'Tiara plateada doblada o torcida en la cabeza.',
      zeroEuroHack: 'Sangre casera con agua, cacao en polvo para espesor y colorante rojo de repostería.'
    },
    diyTips: [
      { material: 'Vestido de fiesta bañado en rojo', instructions: 'Vestido de fiesta o camiseta larga clara rociada con sangre artificial (miel + cacao + colorante rojo líquido).' },
      { material: 'Tiara rota', instructions: 'Tiara o diadema plateada torcida en la cabeza.' },
      { material: 'Mirada telequinética', instructions: 'Abre los ojos desorbitados y levanta una mano como si estuvieras cerrando una puerta con la mente.' }
    ],
    secretMission: 'Apunta a una luz que parpadee o a un interruptor levantando la mano como si lo controlaras con la mente.'
  },
  {
    id: 'leatherface',
    name: 'Leatherface (Cara de Cuero)',
    category: 'Cine de Terror',
    source: 'The Texas Chain Saw Massacre',
    quote: '(Rugido salvaje de motosierra)',
    description: 'El caníbal de Texas con máscara de piel cosida, delantal amarillo manchado de grasa y una motosierra imaginaria rugiente.',
    imageUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 4€',
    costumeBreakdown: {
      faceAndHair: 'Máscara de bolsa de papel kraft arrugada con agujeros irregulares y costuras de lana.',
      clothing: 'Delantal de cocina amarillo o blanco manchado de café seco y betún.',
      signatureProp: 'Motosierra de cartón hecha con una caja de zapatos y un cartón alargado.',
      zeroEuroHack: 'Una bolsa de papel marrón arrugada imita la textura de cuero cosido a la perfección.'
    },
    diyTips: [
      { material: 'Delantal de carnicero', instructions: 'Delantal de cocina amarillo o blanco manchado con betún y pintura roja/marrón.' },
      { material: 'Máscara de cuero cosida', instructions: 'Bolsa de papel marrón kraft recortada con agujeros irregulares para ojos y boca con cordeles de lana como costuras.' },
      { material: 'Motosierra de cartón', instructions: 'Caja de zapatos y cartón alargado simulando la espada de la motosierra.' }
    ],
    secretMission: 'Gira sobre ti mismo en medio de la sala haciendo el baile de la motosierra al ritmo de la música.'
  },
  {
    id: 'the-joker',
    name: 'El Joker',
    category: 'Videojuegos & Pop',
    source: 'Batman / El Caballero Oscuro / DC',
    quote: '¿Por qué tan serio? Vamos a dibujarte una sonrisa...',
    description: 'El Príncipe Payaso del Crimen. Cabello verde grasiento peinado hacia atrás, cicatriz roja ensanchada de oreja a oreja y chaqueta púrpura.',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Medio (30 min)',
    estimatedCost: '1€ - 4€',
    costumeBreakdown: {
      faceAndHair: 'Pelo verde alborotado, ojos ahumados negros y sonrisa roja corrida por las mejillas.',
      clothing: 'Chaqueta morada o camisa verde chillón con chaleco o tirantes.',
      signatureProp: 'Baraja de cartas de póker o un lápiz para el truco de magia.',
      zeroEuroHack: 'Extiende el pintalabios rojo con los dedos hacia los pómulos para el efecto cicatriz de Glasgow.'
    },
    diyTips: [
      { material: 'Sonrisa de Glasgow', instructions: 'Pintalabios rojo extendido exageradamente hacia ambas mejillas simulando la cicatriz.' },
      { material: 'Pelo verde', instructions: 'Gomina mezclada con sombra o colorante verde peinado hacia atrás de forma desastrosa.' },
      { material: 'Traje de colores', instructions: 'Chaqueta morada, burdeos o camisa verde llamativa con corbata o tirantes.' }
    ],
    secretMission: 'Cuenta un chiste deliberadamente malo y luego ríete a carcajadas histéricas durante 10 segundos.'
  },
  {
    id: 'harley-quinn',
    name: 'Harley Quinn',
    category: 'Videojuegos & Pop',
    source: 'DC Comics / Suicide Squad',
    quote: 'Somos los malos, cariño... es lo que hacemos.',
    description: 'La reina del desorden. Dos coletas teñidas de azul y rosa pastel, corazoncito en el pómulo, bate de béisbol rotulado y sonrisa pícara.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Dos coletas altas (una con punta azul y otra roja/rosa) y corazón negro en el pómulo.',
      clothing: 'Camiseta deportiva corta o rasgada con pantalones cortos o mallas llamativas.',
      signatureProp: 'Bate de béisbol de cartón con la frase "GOOD NIGHT".',
      zeroEuroHack: 'Tiza escolar azul y roja para teñir las puntas de las coletas al instante sin manchar para siempre.'
    },
    diyTips: [
      { material: 'Dos coletas teñidas', instructions: 'Dos coletas altas con gomas. Pinta una punta con tiza o sombra azul y la otra con tiza rosa o roja.' },
      { material: 'Corazón en el pómulo', instructions: 'Dibuja un corazoncito negro diminuto en el pómulo derecho con rotulador o delineador.' },
      { material: 'Bate de cartón', instructions: 'Tubo de cartón de papel de cocina envuelto con cinta adhesiva y la palabra "GOOD NIGHT" rotulada.' }
    ],
    secretMission: 'Llama "pudín" o "pastelito" a Nico (el anfitrión) cada vez que hables con él.'
  },
  {
    id: 'pyramid-head',
    name: 'Pyramid Head',
    category: 'Videojuegos & Pop',
    source: 'Silent Hill 2',
    quote: '...',
    description: 'El ejecutor colosal de la niebla de Silent Hill. Su casco piramidal oxidado geométrico, delantal de carnicero sucio y gran espadón.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '2€ - 5€',
    costumeBreakdown: {
      faceAndHair: 'Pirámide triangular de cartón pintada de gris oscuro metálico y óxido.',
      clothing: 'Pantalón blanco o delantal de cocina largo con manchas marrones de café.',
      signatureProp: 'Espadón gigante de cartón de 1 metro forrado en papel aluminio.',
      zeroEuroHack: 'Caja de cartón doblada en triángulo con un visor oculto para ver por dónde caminas.'
    },
    diyTips: [
      { material: 'Casco piramidal', instructions: 'Caja de cartón grande recortada en forma de pirámide triangular, pintada con spray gris oscuro o manchada con betún de zapatos.' },
      { material: 'Faldón ensangrentado', instructions: 'Delantal blanco largo o toalla vieja atada a la cintura con manchas marrones de café seco.' },
      { material: 'Gran Espadón', instructions: 'Cartón alargado de 1.20m forrado en aluminio arrastrado por el suelo con lentitud pesada.' }
    ],
    secretMission: 'Arrastra tu gran espada de cartón lentamente haciendo que roce el suelo con cada paso.'
  },
  {
    id: 'slender-man',
    name: 'Slender Man',
    category: 'Videojuegos & Pop',
    source: 'Creepypasta / Videojuegos',
    quote: 'Recoge las 8 notas...',
    description: 'La silueta antropomorfa alargada de rostro blanco vacío sin facciones, traje oscuro impecable y afición por ocultarse entre las sombras.',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Media blanca o máscara completamente lisa sin ojos, nariz ni boca.',
      clothing: 'Traje de chaqueta negro clásico con camisa blanca abotonada y corbata negra o roja.',
      signatureProp: 'Folios arrugados con árboles dibujados y notas que dicen "NO NO NO".',
      zeroEuroHack: 'Un panty o media de mujer blanca estirada sobre la cabeza permite respirar y ver perfectamente mientras oculta tu rostro.'
    },
    diyTips: [
      { material: 'Cara sin rostro', instructions: 'Media o panty blanco o beige estirado sobre la cabeza (permite ver y respirar) o máscara blanca lisa sin agujeros dibujados.' },
      { material: 'Traje negro', instructions: 'Traje de vestir oscuro clásico con camisa blanca impoluta y corbata negra o roja.' },
      { material: 'Las notas del bosque', instructions: 'Lleva varios folios arrugados con dibujos infantiles de árboles y notas que digan "NO NO NO" pegados por la casa.' }
    ],
    secretMission: 'Esconde una nota con el símbolo de un círculo tachado en el bolsillo o vaso de un amigo.'
  },
  {
    id: 'freddy-fazbear',
    name: 'Freddy Fazbear',
    category: 'Videojuegos & Pop',
    source: 'Five Nights at Freddy\'s (FNAF)',
    quote: '¡Bienvenido a Freddy Fazbear\'s Pizza!',
    description: 'El oso animatrónico cantante del restaurante embrujado. Pelo castaño, pajarita negra, micrófono antiguo y sombrerito de copa.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Medio (30 min)',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Hocico de oso con nariz negra, pecas animatrónicas y orejitas redondas en diadema.',
      clothing: 'Sudadera o camiseta marrón con pajarita negra al cuello.',
      signatureProp: 'Micrófono de juguete plateado.',
      zeroEuroHack: 'Un vaso de cartón negro boca abajo pegado a una diadema hace de mini sombrero de copa.'
    },
    diyTips: [
      { material: 'Orejas de oso y sombrero', instructions: 'Diadema con dos círculos marrones de cartulina y un vasito de cartón negro en el centro como sombrerito de copa.' },
      { material: 'Ropa marrón', instructions: 'Sudadera o camiseta marrón con un óvalo beige pegado en la barriga.' },
      { material: 'Pajarita negra', instructions: 'Pajarita negra de lazo al cuello y un micrófono de juguete o rollo de papel plateado.' }
    ],
    secretMission: 'Tararea la clásica melodía de la cajita de música de Carmen Toreador de FNAF en la penumbra.'
  },
  {
    id: 'sans-undertale',
    name: 'Sans el Esqueleto',
    category: 'Videojuegos & Pop',
    source: 'Undertale',
    quote: '¿Quieres pasar un mal rato?',
    description: 'El comediante perezoso del subsuelo. Sudadera azul cielo con capucha, pantuflas, sonrisa eterna de calavera y el ojo izquierdo destellando en cian.',
    imageUrl: 'https://images.unsplash.com/photo-1508341591423-4347099e1f19?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€',
    costumeBreakdown: {
      faceAndHair: 'Sonrisa fija de esqueleto con dientes marcados y ojo izquierdo rodeado de azul celeste.',
      clothing: 'Sudadera azul con capucha puesta todo el rato y pantalón de chándal oscuro.',
      signatureProp: 'Manos metidas en los bolsillos de la sudadera y pantuflas.',
      zeroEuroHack: 'Dibuja la sonrisa de Sans en una mascarilla blanca quirúrgica y listo.'
    },
    diyTips: [
      { material: 'Sudadera azul', instructions: 'Sudadera azul con capucha (ponte la capucha todo el rato con las manos metidas en los bolsillos).' },
      { material: 'Pantalón deportivo', instructions: 'Pantalón corto negro de baloncesto o chándal con zapatillas o pantuflas.' },
      { material: 'Sonrisa fija', instructions: 'Dibuja con rotulador en una mascarilla blanca o directamente en tu cara una enorme sonrisa de dientes de calavera.' },
      { material: 'Ojo azul', instructions: 'Pinta el contorno de tu ojo izquierdo con purpurina o sombra azul eléctrico.' }
    ],
    secretMission: 'Suelta al menos dos chistes malos de huesos ("¿Qué hace un esqueleto en una fiesta? ¡Pasárselo de muerte!").'
  },
  {
    id: 'ash-williams',
    name: 'Ash Williams',
    category: 'Cine de Terror',
    source: 'Evil Dead / Terroríficamente Muertos',
    quote: 'Groovy.',
    description: 'El superviviente rudo de la cabaña maldita. Camisa azul rasgada, tirantes de cuero marrones cruzados por la espalda y el Necronomicón.',
    imageUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Mandíbula decidida, barbilla con tajo ensangrentado y pelo despeinado.',
      clothing: 'Camisa azul cielo desabotonada y rasgada con cinturones de cuero cruzados.',
      signatureProp: 'Motosierra acoplada en el brazo derecho y el libro Necronomicón.',
      zeroEuroHack: 'Un cuaderno forrado con una bolsa de papel arrugada con una cara gritando es el Necronomicón.'
    },
    diyTips: [
      { material: 'Camisa azul destrozada', instructions: 'Camisa vaquera o azul cielo desabotonada con tajos y manchas de sangre falsa en el pecho.' },
      { material: 'Arnés de tirantes', instructions: 'Cinturones cruzados por la espalda imitando la cartuchera.' },
      { material: 'El Necronomicón', instructions: 'Un cuaderno viejo forrado en papel marrón arrugado con una cara gritando dibujada en la portada.' }
    ],
    secretMission: 'Di la palabra "Groovy" cada vez que pruebes un aperitivo o trago rico en la fiesta.'
  },
  {
    id: 'el-exorcista-regan',
    name: 'Regan MacNeil (El Exorcista)',
    category: 'Cine de Terror',
    source: 'The Exorcist (1973)',
    quote: '¡Tu madre cose calcetines en el infierno!',
    description: 'La niña poseída por el demonio Pazuzu. Camisón azulado infantil con vómito de puré verde en cuello y pecho, ojeras profundas y arañazos.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Ojeras moradas hundidas, arañazos rojos en frente y barbilla y pelo despeinado.',
      clothing: 'Camisón o pijama viejo claro o con estampado vintage.',
      signatureProp: 'Manchas de puré de guisantes verde en el cuello del camisón.',
      zeroEuroHack: 'Puré de patatas o guisantes con un poco de agua crea el icónico efecto de posesión.'
    },
    diyTips: [
      { material: 'Camisón de dormir', instructions: 'Camisón o pijama viejo azul claro o floreado.' },
      { material: 'Vómito de puré verde', instructions: 'Puré de guisantes o aguacate machacado con un toque de agua aplicado generosamente sobre el pecho del camisón y la barbilla.' },
      { material: 'Ojeras y arañazos', instructions: 'Ojeras moradas marcadas y rasguños rojos con pintalabios en mejillas y frente.' }
    ],
    secretMission: 'Gira lentamente la cabeza de lado a lado cuando alguien te pregunte si te encuentras bien.'
  },
  {
    id: 'jack-torrance',
    name: 'Jack Torrance',
    category: 'Cine de Terror',
    source: 'The Shining (El Resplandor)',
    quote: '¡Aquí está Jacky!',
    description: 'El cuidador del Hotel Overlook consumido por el aislamiento. Chaqueta de pana burdeos, camisa de leñador, hacha en mano y mirada de locura helada.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Pelo alborotado con toques de nieve (harina/talco) y sonrisa desquiciada.',
      clothing: 'Chaqueta roja o burdeos sobre camisa de cuadros de franela.',
      signatureProp: 'Hacha de leñador recortada en cartón plateado.',
      zeroEuroHack: 'Harina espolvoreada en hombros y cabello para recrear el laberinto nevado.'
    },
    diyTips: [
      { material: 'Chaqueta de pana burdeos', instructions: 'Chaqueta o cazadora roja/burdeos con camisa de franela a cuadros por debajo.' },
      { material: 'Hacha de atrezzo', instructions: 'Hacha de leñador recortada en cartón forrado con papel aluminio.' },
      { material: 'Rostro helado', instructions: 'Pelo despeinado con toques de harina simulando nieve y una sonrisa maniática asomando por una rendija.' }
    ],
    secretMission: 'Asoma tu cara por entre el marco de una puerta abierta y grita la frase de la película.'
  },
  {
    id: 'morticia-addams',
    name: 'Morticia Addams',
    category: 'Series & TV',
    source: 'La Familia Addams',
    quote: 'Negro es un color tan alegre...',
    description: 'La matriarca aristócrata del gótico. Vestido negro ceñido con falda de sirena, melena azabache impecable, labios rojo rubí y rosas sin flor.',
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Melena lisa negra con raya en medio, ojos ahumados y labios carmesí brillante.',
      clothing: 'Vestido negro largo ceñido con mangas acampanadas o chal oscuro drapeado.',
      signatureProp: 'Tallo de rosa con espinas al que le has cortado la flor.',
      zeroEuroHack: 'Corta la flor de una rosa de plástico con tijeras y quédate solo con el tallo.'
    },
    diyTips: [
      { material: 'Vestido negro largo', instructions: 'Vestido negro ceñido con mangas acampanadas o tela negra drapeada.' },
      { material: 'Melena lisa azabache', instructions: 'Pelo liso planchado con raya en medio.' },
      { material: 'Rosas sin flor', instructions: 'Coge una rosa falsa y córtale la cabeza de flor con unas tijeras, guardando solo el tallo espinoso en la mano.' },
      { material: 'Maquillaje de femme fatale', instructions: 'Ojos ahumados marcados y labios rojo rubí intenso.' }
    ],
    secretMission: 'Córtale la flor a una rosa o flor decorativa de plástico con total tranquilidad delante de los invitados.'
  },
  {
    id: 'gomez-addams',
    name: 'Gomez Addams',
    category: 'Series & TV',
    source: 'La Familia Addams',
    quote: '¡Cara mía! ¡Eso es francés!',
    description: 'El apasionado dandy multimillonario. Traje de raya diplomática, bigotito fino afilado con gomina, puro humeante y pasión desmedida.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Pelo engominado partido y bigote lápiz muy fino arqueado.',
      clothing: 'Traje oscuro formal con pañuelo rojo en el bolsillo superior.',
      signatureProp: 'Puro de papel marrón con punta roja o espada de juguete.',
      zeroEuroHack: 'Un cilindro de papel kraft enrollado con la punta roja imita un habano encendido.'
    },
    diyTips: [
      { material: 'Bigote afilado', instructions: 'Pinta con delineador negro un bigotito fino y arqueado al estilo dandy.' },
      { material: 'Traje a rayas', instructions: 'Traje de vestir oscuro con pañuelo rojo en el bolsillo superior.' },
      { material: 'Puro de cartón', instructions: 'Un cilindro de papel marrón con la punta pintada de rojo simulando ceniza encendida.' }
    ],
    secretMission: 'Besa el dorso de la mano de cada persona a la que saludes con pasión desmedida diciendo "¡Magnifique!".'
  },
  {
    id: 'heisenberg',
    name: 'Walter White (Heisenberg)',
    category: 'Series & TV',
    source: 'Breaking Bad',
    quote: 'Yo soy el que llama a la puerta.',
    description: 'El capo químico de Albuquerque. Mono amarillo de protección con máscara o sombrero Pork Pie negro, gafas finas y caramelo azul de 99.1% pureza.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Perilla castaña recortada, gafas de montura delgada y mirada penetrante.',
      clothing: 'Chubasquero o mono amarillo de pintura (o camisa verde oscura con sombrero pork pie).',
      signatureProp: 'Bolsita zip transparente con caramelos picados de menta azul translúcida.',
      zeroEuroHack: 'Caramelos azules machacados en una bolsita transparente simulan su producto estrella.'
    },
    diyTips: [
      { material: 'Mono amarillo', instructions: 'Chubasquero o mono amarillo de pintura (o camisa verde oscura con gafas de montura fina).' },
      { material: 'Perilla Heisenberg', instructions: 'Perilla recortada en cartulina o pintada con lápiz de cejas marrón.' },
      { material: 'Caramelos azules', instructions: 'Bolsita zip pequeña con caramelos picados de menta azul translúcidos en el bolsillo.' }
    ],
    secretMission: 'Saca tu bolsita de caramelos azules con aire de secreto y pregunta: "99.1% de pureza, ¿te apetece?".'
  },
  {
    id: 'jugador-456',
    name: 'Jugador 456 / Squid Game',
    category: 'Series & TV',
    source: 'El Juego del Calamar (Netflix)',
    quote: '¿Jugamos a Luz Verde, Luz Roja?',
    description: 'El concursante del chándal verde agua con el número 456 impreso en el pecho, galleta dalgona con aguja y zapatillas slip-on blancas.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Pelo despeinado con expresión de estrés o cansancio.',
      clothing: 'Chándal verde esmeralda o sudadera y pantalón del mismo tono verde.',
      signatureProp: 'Número 456 en papel blanco pegado al pecho y una galleta redonda.',
      zeroEuroHack: 'Folio con el número "456" con rotulador negro sujeto con 4 imperdibles.'
    },
    diyTips: [
      { material: 'Chándal verde', instructions: 'Chándal verde (o sudadera y pantalón verde azulado).' },
      { material: 'Número 456', instructions: 'Escribe en un folio blanco "456" con rotulador negro grueso y pégalo con imperdibles o cinta al pecho.' },
      { material: 'Galleta dalgona', instructions: 'Una galleta María redonda con un paraguas o círculo marcado con la punta de un clip.' }
    ],
    secretMission: 'Grita de improviso "¡LUZ VERDE, LUZ ROJA!" para que todos los que estén cerca se queden congelados.'
  },
  {
    id: 'demogorgon',
    name: 'Demogorgon',
    category: 'Series & TV',
    source: 'Stranger Things',
    quote: '(Rugido abisal de pétalos carnosos)',
    description: 'El depredador del Mundo del Revés cuya cabeza se abre como una orquídea carnívora de cinco pétalos forrados de dientes afilados como agujas.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 4€',
    costumeBreakdown: {
      faceAndHair: 'Cinco pétalos de cartón rojizo con dientecitos de papel alrededor de la cabeza.',
      clothing: 'Mallas y sudadera grisácea o marrón ajustada.',
      signatureProp: 'Garras alargadas en las puntas de los dedos.',
      zeroEuroHack: 'Cinco pétalos de cartulina roja con triangulitos de papel blanco pegados a una capucha.'
    },
    diyTips: [
      { material: 'Pétalos bucales', instructions: 'Recorta cinco pétalos grandes de cartón, fórralos por dentro de cartulina roja con dientecitos de papel blanco pegados y sujétalos a una capucha con grapas.' },
      { material: 'Ropa gris/marrón', instructions: 'Pantalón y sudadera grisácea o marrón ajustada.' },
      { material: 'Zarpas', instructions: 'Guantes viejos con tubos de papel pegados en las puntas para alargar las uñas.' }
    ],
    secretMission: 'Abre tus manos delante de tu cara imitando los pétalos que se abren cada vez que alguien grite.'
  },
  {
    id: 'cruella-de-vil',
    name: 'Cruella de Vil',
    category: 'Animación & Fantasía',
    source: '101 Dálmatas / Disney',
    quote: '¡Querida, el arte requiere sufrimiento!',
    description: 'La diva excéntrica de la alta costura con cabello partido mitad blanco y mitad negro, abrigo de piel voluminoso y boquilla de cigarro infinita.',
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Cabello dividido exactamente mitad blanco y mitad negro, labios rojos y cejas arqueadas.',
      clothing: 'Vestido negro ceñido con abrigo blanco o bufanda voluminosa y guantes rojos.',
      signatureProp: 'Boquilla de cigarrillo larguísima.',
      zeroEuroHack: 'Talco o harina en una mitad del pelo dejando la otra mitad oscura natural.'
    },
    diyTips: [
      { material: 'Pelo bicolor', instructions: 'Raya al medio: pon polvos de talco o tiza blanca en una mitad del pelo dejando la otra mitad negra natural.' },
      { material: 'Boquilla de cigarrillo', instructions: 'Pajita larga de plástico negra o roja con papel de aluminio en un extremo.' },
      { material: 'Abrigo suntuoso', instructions: 'Abrigo blanco, chaqueta esponjosa o bufanda gruesa combinada con vestido negro ajustado y guantes rojos.' }
    ],
    secretMission: 'Pregunta si hay perritos cerca y exclama: "¡Qué piel más suave para un buen cuello de abrigo!".'
  },
  {
    id: 'malefica',
    name: 'Maléfica el Hada Oscura',
    category: 'Animación & Fantasía',
    source: 'La Bella Durmiente / Maléfica (Disney)',
    quote: '¡Escuchad bien todos vosotros: ni reyes ni plebeyos me desprecian!',
    description: 'La reina del mal con dos imponentes cuernos negros curvados, túnica morada y negra con cuello alzado y pómulos esculpidos con sombras.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Medio (30 min)',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Dos cuernos negros retorcidos en la cabeza y pómulos muy contorneados.',
      clothing: 'Vestido negro largo con cuello alzado y toques de tela violeta.',
      signatureProp: 'Cetro o bastón largo coronado con una esfera verde o cuervo.',
      zeroEuroHack: 'Periódico enrollado en conos curvados forrado de cinta aislante negra para los cuernos.'
    },
    diyTips: [
      { material: 'Cuernos de Maléfica', instructions: 'Enrolla dos conos de papel de periódico, cúbrelos de cinta aislante negra y pégalos a una diadema.' },
      { material: 'Capa negra y morada', instructions: 'Vestido negro largo con cuello alzado y toques de tela violeta.' },
      { material: 'Pómulos afilados', instructions: 'Contorno muy marcado con sombra gris oscura justo bajo el hueso del pómulo.' }
    ],
    secretMission: 'Entra a la fiesta lamentándote con sarcasmo de no haber recibido la invitación real por correo.'
  },
  {
    id: 'ursula',
    name: 'Úrsula la Bruja del Mar',
    category: 'Animación & Fantasía',
    source: 'La Sirenita (Disney)',
    quote: '¡Pobres almas en desgracia!',
    description: 'La hechicera del abismo marino con piel lavanda, pelo blanco corto hacia arriba, collar con colgante de caracol dorado y tentáculos negros.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Sombra azul brillante en todo el párpado superior, labios rojos y pelo blanco alborotado.',
      clothing: 'Vestido negro ajustado con tiras de tela ondulantes o toalla morada.',
      signatureProp: 'Collar con colgante de caracola dorada.',
      zeroEuroHack: 'Una pasta de sopa tipo caracola gigante pintada de amarillo dorado con esmalte o rotulador.'
    },
    diyTips: [
      { material: 'Collar de caracol dorado', instructions: 'Pasta de sopa tipo caracola gigante pintada con esmalte de uñas dorado o rotulador amarillo colgada de una cinta negra.' },
      { material: 'Pelo blanco en punta', instructions: 'Carda el pelo hacia arriba con polvos de talco o laca.' },
      { material: 'Maquillaje azul/morado', instructions: 'Sombra de ojos azul brillante por todo el párpado superior hasta las cejas y labios rojo carmín.' }
    ],
    secretMission: 'Pídele a alguien que te cante una nota musical y haz el gesto de atrapar su voz dentro de tu collar.'
  },
  {
    id: 'hades-disney',
    name: 'Hades Dios del Inframundo',
    category: 'Animación & Fantasía',
    source: 'Hércules (Disney)',
    quote: 'Me llamo Hades, señor de los muertos. Hola, ¿qué tal?',
    description: 'El señor del inframundo griego con pelo de llama azulada que se enciende en furia roja, toga drapeada gris con broche de calavera y sarcasmo puro.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Pelo azul peinado en forma de llama y tez azulada pálida con sombra de ojos.',
      clothing: 'Sábana gris o negra anudada a un hombro estilo túnica griega.',
      signatureProp: 'Broche de calavera plateada sujetando la toga.',
      zeroEuroHack: 'Cinta o tela azul atada hacia arriba en la cabeza imitando la llama del dios del Tártaro.'
    },
    diyTips: [
      { material: 'Toga oscura', instructions: 'Sábana gris oscuro o negra anudada sobre un hombro con un broche de calavera de cartón.' },
      { material: 'Pelo de fuego azul', instructions: 'Spray temporal azul o cinta azul atada en la cabeza apuntando hacia arriba.' },
      { material: 'Tono azulado', instructions: 'Toques de sombra azul pálido en frente y mejillas.' }
    ],
    secretMission: 'Finge enfadarte de golpe poniéndote rojo durante 3 segundos para luego suspirar relajado y decir: "Tranquilos, era broma".'
  },
  {
    id: 'puro-hueso',
    name: 'Grim (Puro Hueso)',
    category: 'Animación & Fantasía',
    source: 'Las macabras aventuras de Billy y Mandy',
    quote: '¡Malditos mocosos! ¡Yo soy la Muerte!',
    description: 'La Muerte condenada a ser la mejor amiga de dos niños traviesos. Capucha negra holgada, calavera con expresión cómica de resignación y guadaña.',
    imageUrl: 'https://images.unsplash.com/photo-1508341591423-4347099e1f19?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Cara de calavera pintada con expresión cansada y resignada.',
      clothing: 'Túnica o sudadera negra muy holgada con capucha que cubra la frente.',
      signatureProp: 'Guadaña de juguete o palo de escoba con cuchilla de cartón plateada.',
      zeroEuroHack: 'Un palo de escoba con una cuchilla curva de cartón forrada de papel plata.'
    },
    diyTips: [
      { material: 'Guadaña de juguete', instructions: 'Palo de escoba o recogedor con una cuchilla de cartón curvada forrada en papel de aluminio.' },
      { material: 'Capucha negra', instructions: 'Sudadera negra ancha con capucha tapando la frente.' },
      { material: 'Calavera simpática', instructions: 'Dibuja la calavera en tu cara pero con expresión de cansancio y resignación.' }
    ],
    secretMission: 'Menciona a menudo que preferirías estar en el limbo antes que aguantar a Billy y Mandy.'
  },
  {
    id: 'pinhead',
    name: 'Pinhead (Cenobita Supremo)',
    category: 'Cine de Terror',
    source: 'Hellraiser (Clive Barker)',
    quote: 'Tenemos una eternidad para conocer el dolor y el placer.',
    description: 'El sumo sacerdote del dolor con la cabeza cuadriculada repleta de clavos clavados con precisión geométrica y la caja rompecabezas.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Rejilla cuadriculada dibujada en cabeza con bastoncillos de algodón plateados simulando clavos.',
      clothing: 'Traje o sotana negra ceñida con cuello alto.',
      signatureProp: 'Caja dorada y negra cúbica (La Configuración del Lamento).',
      zeroEuroHack: 'Bastoncillos de algodón cortados por la mitad y pintados de plateado pegados con vaselina o adhesivo soluble.'
    },
    diyTips: [
      { material: 'Clavos inofensivos', instructions: 'Corta bastoncillos de algodón por la mitad, pinta los extremos de plateado y pégalos a una calva de látex o directamente con adhesivo facial soluble.' },
      { material: 'Rejilla en la cara', instructions: 'Dibuja con delineador negro una cuadrícula regular de líneas en toda la cabeza y rostro.' },
      { material: 'La Configuración del Lamento', instructions: 'Una cajita cuadrada de cartón pintada con diseños dorados y negros que sostienes con ambas manos.' }
    ],
    secretMission: 'Sostén tu cajita de cartón en alto y pregunta quién se atreve a resolver el acertijo.'
  },
  {
    id: 'el-hombre-invisible',
    name: 'El Hombre Invisible',
    category: 'Cine de Terror',
    source: 'The Invisible Man (H.G. Wells)',
    quote: '¡Un hombre invisible puede reinar sobre el mundo entero!',
    description: 'El científico que descubrió el elixir de la invisibilidad. Toda la cabeza vendada, gafas de sol redondas muy oscuras y bata elegante de seda.',
    imageUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '1€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Toda la cabeza y cara envuelta en vendas blancas dejando solo boca y ojos con gafas oscuras.',
      clothing: 'Gabardina o bata de seda con cuello alzado y guantes de lana oscuros.',
      signatureProp: 'Gafas de sol negras circulares y tubo de ensayo de laboratorio.',
      zeroEuroHack: 'Un rollo de venda elástica del botiquín envuelta en la cabeza con gafas de sol.'
    },
    diyTips: [
      { material: 'Vendaje facial', instructions: 'Rollo de vendas de gasa de farmacia enrollado por toda la cabeza dejando solo descubiertos la boca y ojos.' },
      { material: 'Gafas de sol negras', instructions: 'Gafas de sol redondas muy oscuras puestas por encima de las vendas.' },
      { material: 'Bata de laboratorio o gabardina', instructions: 'Gabardina elegante o albornoz con cuello alzado y guantes de lana.' }
    ],
    secretMission: 'Pregunta de repente: "¿Me veis? Decidme la verdad, ¿me estáis viendo ahora mismo?".'
  },
  {
    id: 'sweeney-todd',
    name: 'Sweeney Todd el Barbero Diabólico',
    category: 'Cine de Terror',
    source: 'Sweeney Todd (Tim Burton)',
    quote: 'Por fin mi brazo vuelve a estar completo...',
    description: 'El barbero de Fleet Street en busca de venganza. Mechón blanco plateado en el pelo oscuro desaliñado, navaja barbera de plata y chaleco victoriano.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Mechón blanco frontal prominente en pelo moreno despeinado y ojeras oscuras.',
      clothing: 'Camisa blanca arremangada con chaleco gris o marrón y pañuelo al cuello.',
      signatureProp: 'Navaja clásica de barbero recortada en cartón plateado.',
      zeroEuroHack: 'Polvos de talco o tiza blanca en un mechón frontal del flequillo.'
    },
    diyTips: [
      { material: 'Mechón blanco', instructions: 'Mechón frontal del pelo empolvado con polvos de talco o tiza blanca.' },
      { material: 'Navaja barbera', instructions: 'Navaja clásica recortada en cartón plateado que abres y cierras con solemnidad.' },
      { material: 'Chaleco de época', instructions: 'Chaleco sobre camisa blanca arremangada y pañuelo flojo al cuello.' }
    ],
    secretMission: 'Ofrécete a hacerle un afeitado gratis a cualquier amigo asegurando que tienes unas empanadas deliciosas que rellenar.'
  },
  {
    id: 'hannibal-lecter',
    name: 'Hannibal Lecter',
    category: 'Cine de Terror',
    source: 'El Silencio de los Corderos',
    quote: 'Me comí su hígado con unas habas y un buen Chianti...',
    description: 'El psiquiatra caníbal más temido. Bozal de contención de barras metálicas, mirada analítica gélida y mono naranja de máxima seguridad.',
    imageUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Medio (30 min)',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Bozal marrón con barrotes en la mitad inferior de la cara y mirada fija sin parpadeo.',
      clothing: 'Camiseta o chándal naranja (o bata blanca de camisa de fuerza).',
      signatureProp: 'Chasquido de labios "Ffff-ffff-ffff" con una copa de Chianti.',
      zeroEuroHack: 'Una máscara de cartulina marrón con ranuras horizontales sujeta con dos gomas elásticas.'
    },
    diyTips: [
      { material: 'Bozal de contención', instructions: 'Recorta una máscara de cartulina marrón con aberturas horizontales simulando barras metálicas sujeta con gomas.' },
      { material: 'Mono naranja de preso', instructions: 'Camiseta o chándal naranja (o blanco impoluto de camisa de fuerza).' },
      { material: 'El chasquido', instructions: 'Haz el icónico sonido de succión con los labios: "Fff-fff-fff-fff-fff".' }
    ],
    secretMission: 'Analiza psicológicamente los defectos de tus amigos con calma aterradora mientras tomas un sorbo de vino.'
  },
  {
    id: 'la-llorona',
    name: 'La Llorona',
    category: 'Cine de Terror',
    source: 'Leyenda del Folclore / Cine',
    quote: '¡¡Ay mis hijoooooos!!',
    description: 'El alma en pena condenada a vagar por la eternidad. Velo blanco translúcido, vestido de novia envejecido y lágrimas negras cayendo por las mejillas.',
    imageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e60b?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Fácil (15 min)',
    estimatedCost: '0€ - 2€',
    costumeBreakdown: {
      faceAndHair: 'Lágrimas negras espesas chorreando desde los ojos y velo de encaje blanco.',
      clothing: 'Vestido blanco largo vaporoso o camisón antiguo.',
      signatureProp: 'Velo translúcido cubriendo el rostro y llanto desgarrador.',
      zeroEuroHack: 'Una cortina de encaje blanco o tela de tul de casa colocada sobre la cabeza.'
    },
    diyTips: [
      { material: 'Velo translúcido', instructions: 'Cortina vieja de encaje blanco o tela de tul cubriendo la cabeza cayendo sobre el vestido.' },
      { material: 'Lágrimas negras', instructions: 'Pinta chorretones negros que caen desde los ojos por toda la mejilla simulando rímel corrido por llorar siglos.' },
      { material: 'Vestido blanco antiguo', instructions: 'Vestido blanco vaporoso o camisa blanca larga.' }
    ],
    secretMission: 'Ponte a sollozar teatralmente cada vez que veas un vaso vacío o comida que se acabe en la mesa.'
  },
  {
    id: 'el-babadook',
    name: 'The Babadook',
    category: 'Cine de Terror',
    source: 'The Babadook (Jennifer Kent)',
    quote: 'Si está en una palabra o en un libro, no puedes deshacerte del Babadook.',
    description: 'La silueta sombría salida de los cuentos pop-up infantiles. Sombrero de copa negro alto, abrigo largo flotante y dedos afilados como sombras.',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=900&q=80',
    difficulty: 'Creativo Low-Cost',
    estimatedCost: '1€ - 3€',
    costumeBreakdown: {
      faceAndHair: 'Cara blanca fantasmal con boca negra muy ancha abierta en sonrisa grotesca.',
      clothing: 'Abrigo largo negro abotonado o capa negra voluminosa.',
      signatureProp: 'Sombrero de copa negro de cartón y libro de cuentos con dibujos oscuros.',
      zeroEuroHack: 'Un cilindro de cartulina negra con un círculo pegado en la base crea el sombrero de copa.'
    },
    diyTips: [
      { material: 'Sombrero de copa negro', instructions: 'Cilindro de cartulina negra con ala circular pegado a la cabeza.' },
      { material: 'Abrigo negro largo', instructions: 'Abrigo largo o manta negra sobre los hombros abrochada al cuello.' },
      { material: 'Dedos largos de sombra', instructions: 'Alarga los dedos con conos de papel negro puntiagudos.' }
    ],
    secretMission: 'Pronuncia en tres tonos distintos: "Ba-ba-ba... DOOK... DOOK... DOOK".'
  }
];

export const HALLOWEEN_CHARACTERS: Character[] = BASE_HALLOWEEN_CHARACTERS.map(c => ({
  ...c,
  imageUrl: CHARACTER_IMAGES[c.id] || c.imageUrl
}));

