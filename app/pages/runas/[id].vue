<!-- pages/runas/[id].vue -->
<script setup>
definePageMeta({
  middleware: 'auth'
})

/*
  Tabla requerida en Supabase (SQL):

  create table rune_reflections (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    rune_id text not null,
    morning_response text,
    evening_response text,
    created_at timestamptz not null default now()
  );
  alter table rune_reflections enable row level security;
  create policy "own reflections" on rune_reflections
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
*/

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Diccionario centralizado con las 24 runas
// NOTA DE FIABILIDAD: los nombres y significados base (protogermánico reconstruido,
// poemas rúnicos anglosajón/noruego/islandés, Hávamál, Edda) son de fuentes medievales.
// los nombres de los aettir y las lecturas "psicológicas" son convenciones
// modernas o editoriales, sin base histórica.
const runesData = {
  // AETT DE FREYR
  fehu: {
    id: 'fehu',
    name: 'Fehu',
    symbol: 'f',
    aett: 'Aett de Freyr',
    summary: 'Riqueza, abundancia, energía vital',
    description: 'Fehu representa el fuego primario de la creación, la riqueza móvil y la fuerza vital en constante movimiento.',
    keywords: ['Abundancia', 'Prosperidad', 'Fuego creador', 'Generosidad'],
    historicalMeaning: 'Fehu (protogermánico *fehu) significa "ganado" y, por extensión, riqueza móvil: lo que se podía mover, intercambiar y heredar. Como lectura psicológica moderna, invita a observar nuestra relación con lo que poseemos: retenerlo todo puede generar estancamiento y ansiedad, mientras que compartir con criterio fortalece vínculos. En la cultura nórdica, la generosidad de un jefe era además fuente de prestigio (Hávamál).',
    mindfulnessExercise: 'Si te apetece, hoy puedes observar con curiosidad cómo te relacionas con lo que tienes y con lo que das: tiempo, atención, dinero, ayuda. Sin juzgarte, quizá notes cuándo algo fluye y cuándo se queda retenido. Por la noche, si quieres, puedes anotar qué descubriste. No hace falta creer en nada: es una forma de atender a tu relación con los recursos.',
    esotericContext: 'Los poemas rúnicos medievales asocian Fehu con la riqueza y con sus riesgos: el noruego dice que "causa discordia entre parientes", y el islandés dice lo mismo. En la mitología nórdica, el oro maldito del dragón Fafnir (Edda poética, Saga de los Volsungos) ilustra cómo el tesoro acaparado corrompe. Su relación con Freyr y con el fuego creador, y su uso en monedas o velas doradas para "atraer prosperidad", son prácticas esotéricas modernas, no tradiciones documentadas de la época.',
    prompts: {
      morningQuestion: '¿Qué recurso tengo hoy (tiempo, energía, dinero, talento) y cómo puedo ponerlo en movimiento de forma consciente?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  uruz: {
    id: 'uruz',
    name: 'Uruz',
    symbol: 'u',
    aett: 'Aett de Freyr',
    summary: 'Fuerza salvaje, salud, perseverancia',
    description: 'La fuerza indomable del uro salvaje.',
    keywords: ['Vitalidad', 'Fuerza bruta', 'Superación', 'Resistencia'],
    historicalMeaning: 'Uruz (*ūruz) es el uro, un bovino salvaje enorme, hoy extinto (el último ejemplar murió en 1627, en Polonia). Julio César (Guerra de las Galias, VI) cuenta que los jóvenes germanos lo cazaban por prestigio y exhibían sus cuernos como trofeo. El poema anglosajón lo describe como una bestia orgullosa y feroz. Lectura psicológica moderna: resiliencia, energía y salud del cuerpo.',
    mindfulnessExercise: 'Puedes regalarte unos minutos para recorrer el cuerpo con la atención, de los pies a la cabeza, notando dónde hay tensión y dónde hay vigor, sin intentar cambiar nada. Si te resulta agradable, elige un movimiento suave (caminar, estirarte) y acompáñalo con atención a las sensaciones. Es un escaneo corporal, inspirado en programas como MBSR, que puedes adaptar a cómo estés hoy.',
    esotericContext: 'En los poemas rúnicos el nombre se lee de formas distintas: el anglosajón habla del uro ("ur"), pero el noruego y el islandés, ya en el futhark joven, lo interpretan como "escoria de hierro" y "llovizna" (úr). Es decir, "fuerza salvaje" es sólido en la tradición anglosajona, pero la nórdica lo entiende distinto. Las ideas de "energía telúrica" y de sanación mediante esta runa pertenecen al esoterismo moderno.',
    prompts: {
      morningQuestion: '¿Cómo está mi cuerpo hoy y qué necesita para sostenerme?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  thurisaz: {
    id: 'thurisaz',
    name: 'Thurisaz',
    symbol: 'x',
    aett: 'Aett de Freyr',
    summary: 'Fuerza reactiva, protección, caos',
    description: 'El espino protector y el martillo de Thor.',
    keywords: ['Protección', 'Límite', 'Fuerza reactiva', 'Defensa'],
    historicalMeaning: 'Thurisaz (*þurisaz) significa "gigante" (þurs); en el poema anglosajón la runa se llama "thorn" (espina). Los gigantes eran en la mitología nórdica fuerzas caóticas y hostiles, y Thor su principal enemigo. Lectura psicológica moderna: la reactividad (respuesta automática ante una amenaza) y la diferencia entre poner un límite y atacar.',
    mindfulnessExercise: 'Si hoy aparece la irritación, quizá puedas darte una pausa de unas respiraciones antes de responder. Con curiosidad, prueba a ponerle nombre ("esto es enfado") y a notar dónde lo sientes en el cuerpo. Desde ahí, puedes preguntarte con amabilidad si hay un límite que quieras poner y cómo te gustaría hacerlo. Es una técnica básica de regulación emocional.',
    esotericContext: 'Los poemas medievales son sombríos con esta runa: el noruego dice que el gigante "causa enfermedad a las mujeres", el islandés habla de tormento, y el anglosajón describe la espina como "muy afilada, mala para todo guerrero que la toma". Su uso como runa de protección y su relación con el martillo de Thor son interpretaciones esotéricas modernas. El espino como planta protectora de umbrales pertenece al folclore europeo en general (sobre todo británico y celta), no específicamente nórdico.',
    prompts: {
      morningQuestion: '¿Qué límite necesito sostener hoy y cómo puedo hacerlo sin agresividad?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  ansuz: {
    id: 'ansuz',
    name: 'Ansuz',
    symbol: 'a',
    aett: 'Aett de Freyr',
    summary: 'Sabiduría, comunicación, aliento divino',
    description: 'La voz de Odín y la palabra sagrada.',
    keywords: ['Sabiduría', 'Comunicación', 'Inspiración', 'Señales'],
    historicalMeaning: 'Ansuz (*ansuz) significa "dios" (de la familia de los ases, áss). El poema noruego lo identifica con Odín, y el anglosajón (donde la runa se llama "os") lo relaciona con la boca y con el origen del lenguaje. En una cultura oral la palabra tenía peso: un juramento vinculaba y un poema preservaba la memoria. Lectura psicológica moderna: cómo hablamos, a otros y a nosotros mismos, y cómo escuchamos.',
    mindfulnessExercise: 'Hoy podrías experimentar con escuchar de verdad en una conversación, notando cuándo la mente se adelanta a preparar la respuesta y regresando con suavidad al otro. También puedes prestar atención al tono con que te hablas a ti mismo, sin corregirlo, solo observándolo.',
    esotericContext: 'Según el Hávamál (estrofas 138-139), Odín se colgó nueve noches de un "árbol azotado por el viento", herido por su propia lanza, y recogió las runas gritando; la tradición posterior identifica ese árbol con Yggdrasil. Esa historia vincula a Odín con las runas, la poesía y la sabiduría. Los usos actuales de Ansuz para inspirar la palabra o la adivinación son esotéricos modernos.',
    prompts: {
      morningQuestion: '¿Qué mensaje necesito escuchar hoy, de otros o de mí mismo?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  raido: {
    id: 'raido',
    name: 'Raido',
    symbol: 'r',
    aett: 'Aett de Freyr',
    summary: 'Viaje, ritmo, evolución personal',
    description: 'El carro y el viaje.',
    keywords: ['Viaje', 'Dirección', 'Ritmo', 'Evolución'],
    historicalMeaning: 'Raido (*raidō) significa "cabalgar" o "viaje a caballo". El poema anglosajón dice que es fácil para quien está bajo techo y muy penoso para quien cabalga largas distancias; el noruego la considera "la peor para los caballos". No hay una lectura documentada como "carro". Lectura psicológica moderna: avanzar con dirección y a un ritmo sostenible.',
    mindfulnessExercise: 'Si te apetece, sal a caminar unos minutos sin auriculares, dejando que la respiración acompañe los pasos. Puedes preguntarte, sin presión, hacia dónde te gustaría ir esta semana, y notar si aparece alguna pequeña decisión que te acerque. Es una práctica de atención en movimiento.',
    esotericContext: 'Las lecturas sobre viajes chamánicos, ritmo cósmico o amuletos de viaje son esotéricas modernas; las fuentes medievales solo hablan del viaje a caballo, con sus fatigas. Puedes leer la runa simplemente como una invitación a pensar en tu camino y en tu ritmo.',
    prompts: {
      morningQuestion: '¿Hacia dónde quiero avanzar hoy y cuál es el primer paso concreto?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  kenaz: {
    id: 'kenaz',
    name: 'Kenaz',
    symbol: 'k',
    aett: 'Aett de Freyr',
    summary: 'Fuego interior, claridad, inspiración',
    description: 'La antorcha del artesano.',
    keywords: ['Claridad', 'Antorcha', 'Creatividad', 'Revelación'],
    historicalMeaning: 'Kenaz (*kēnaz) se lee como "antorcha" sobre todo por el poema anglosajón (cen), que la vincula con el fuego y la luz. Ojo: en los poemas noruego e islandés la runa correspondiente (kaun) significa "úlcera" o "llaga", un sentido casi opuesto. Lectura psicológica moderna: claridad, iluminar un problema y chispa creativa.',
    mindfulnessExercise: 'Si hay algo que te ronda la cabeza, puedes escribir durante unos minutos todo lo que sabes de ello, sin filtrar. Después, si quieres, intenta distinguir con calma lo que son hechos de lo que son interpretaciones. Separar ambas cosas es una técnica habitual de la terapia cognitiva, y no hace falta llegar a ninguna conclusión.',
    esotericContext: 'La asociación de Kenaz con la creatividad, el conocimiento y la forja es esotérica moderna; las fuentes medievales no la conectan con la artesanía. Que su nombre pueda significar "antorcha" o "llaga" muestra que su interpretación depende de la tradición que se consulte.',
    prompts: {
      morningQuestion: '¿Qué necesito ver con más claridad hoy?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  gebo: {
    id: 'gebo',
    name: 'Gebo',
    symbol: 'g',
    aett: 'Aett de Freyr',
    summary: 'Regalo, intercambio, equilibrio',
    description: 'El intercambio sagrado entre seres.',
    keywords: ['Intercambio', 'Regalo', 'Unión', 'Equilibrio'],
    historicalMeaning: 'Gebo (*gebō) significa "regalo". El poema anglosajón (gyfu) lo describe como adorno, honor y sustento. La reciprocidad del don era central en la sociedad nórdica: el Hávamál (estrofas 41-46) insiste en que un regalo espera otro y en que los amigos se conservan intercambiando dones. Lectura psicológica moderna: cómo damos, cómo recibimos y si nuestras relaciones están equilibradas.',
    mindfulnessExercise: 'Puedes observar hoy, sin exigirte nada, cómo te sientes al dar y al recibir. Quizá haya un pequeño gesto que te apetezca ofrecer, y quizá un momento en que puedas aceptar algo (un cumplido, una ayuda) sin quitarle valor. Fíjate, con curiosidad, qué te resulta más fácil o más difícil.',
    esotericContext: 'Esta runa no sobrevivió en el futhark joven, así que no hay poemas nórdicos sobre ella. Su uso en rituales de pactos o matrimonio y la lectura de la X como "cruce de fuerzas en equilibrio" son interpretaciones esotéricas modernas. La idea de que un regalo crea un vínculo sí tiene base en la ética del don descrita en el Hávamál.',
    prompts: {
      morningQuestion: '¿Qué puedo ofrecer hoy y qué estoy dispuesto a recibir?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  wunjo: {
    id: 'wunjo',
    name: 'Wunjo',
    symbol: 'w',
    aett: 'Aett de Freyr',
    summary: 'Gozo, armonía, realización',
    description: 'La bandera del clan unido.',
    keywords: ['Gozo', 'Paz', 'Sintonía', 'Realización'],
    historicalMeaning: 'Wunjo (*wunjō) significa "alegría, placer". El poema anglosajón (wynn) la describe como el gozo de quien tiene pocas penas, prosperidad y una casa suficiente. Tampoco sobrevivió en el futhark joven. Lectura psicológica moderna: notar lo que ya funciona en lugar de perseguir siempre lo que falta.',
    mindfulnessExercise: 'Puedes elegir tres momentos del día (el café, un paseo, una charla) y permitirte saborearlos con atención durante un minuto. Por la noche, si te apetece, anota qué cosas estuvieron bien. Se inspira en el "saboreo" (savoring), estudiado en psicología positiva.',
    esotericContext: 'La relación de Wunjo con Freyja, el hogar o la armonía comunitaria, y su uso para atraer paz, son lecturas esotéricas modernas. Lo que sostienen las fuentes anglosajonas es más sencillo: la alegría acompaña a quien vive sin grandes penas y con lo suficiente.',
    prompts: {
      morningQuestion: '¿Qué pequeña alegría puedo buscar o cultivar hoy?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },

  // AETT DE HEIMDALL
  hagalaz: {
    id: 'hagalaz',
    name: 'Hagalaz',
    symbol: 'h',
    aett: 'Aett de Heimdall',
    summary: 'Granizo, ruptura necesaria, prueba',
    description: 'La tormenta incontrolable.',
    keywords: ['Ruptura', 'Transformación', 'Tormenta', 'Despertar'],
    historicalMeaning: 'Hagalaz (*haglaz) significa "granizo". Los poemas rúnicos lo describen como el más frío de los granos (noruego) y como grano blanco que cae del cielo y se convierte en agua (anglosajón). Era una amenaza real para las cosechas. Lectura psicológica moderna: las crisis y los cambios que no elegimos, y lo que pueden dejar despejado.',
    mindfulnessExercise: 'Si hoy hay algo fuera de tu control, puedes escribir dos columnas, "Lo que puedo influir" y "Lo que no", y dejar que tu atención descanse en la primera. Respirar de modo que la exhalación sea algo más larga que la inhalación puede ayudarte a calmarte. Es una versión sencilla de la distinción estoica entre lo que depende de nosotros y lo que no, también usada en terapia cognitiva.',
    esotericContext: 'La idea de Hagalaz como "madre de todas las runas" viene del esoterismo alemán de principios del siglo XX (Guido von List y su runario Armanen), no de fuentes medievales. Su asociación con las tormentas de Thor y con rituales para romper patrones también es moderna. Las fuentes antiguas solo hablan del granizo como fenómeno meteorológico destructivo.',
    prompts: {
      morningQuestion: '¿Qué situación fuera de mi control necesito aceptar hoy?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  nauthiz: {
    id: 'nauthiz',
    name: 'Nauthiz',
    symbol: 'n',
    aett: 'Aett de Heimdall',
    summary: 'Necesidad, restricción, resistencia',
    description: 'El fuego producido por la fricción del esfuerzo.',
    keywords: ['Necesidad', 'Fricción', 'Templanza', 'Resistencia'],
    historicalMeaning: 'Nauthiz (*nauþiz) significa "necesidad, aprieto". El poema anglosajón (nyd) dice que aprieta el corazón pero suele traer ayuda si se atiende a tiempo; el noruego habla de una elección limitada y de pasar frío. Lectura psicológica moderna: la escasez puede agudizar el ingenio y revelar lo esencial, aunque también genera ansiedad.',
    mindfulnessExercise: 'Puedes observar hoy, con curiosidad, la diferencia entre lo que necesitas y lo que quieres, sin juzgar ninguna de las dos. Si te apetece, prueba una incomodidad pequeña y voluntaria (esperar antes de comprar, una ducha algo más fresca) y mira cómo la vive tu cuerpo, sin luchar contra ella.',
    esotericContext: 'El "fuego de la necesidad" (nödeld, Notfeuer) fue una costumbre folclórica real en el norte de Europa: se encendía por fricción de maderas para proteger al ganado de plagas. Sin embargo, ninguna fuente medieval lo relaciona con la runa; esa conexión y su uso para forjar la voluntad son interpretaciones modernas.',
    prompts: {
      morningQuestion: '¿Cuál es mi necesidad real hoy, distinta de mis deseos?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  isa: {
    id: 'isa',
    name: 'Isa',
    symbol: 'i',
    aett: 'Aett de Heimdall',
    summary: 'Hielo, quietud, concentración',
    description: 'El bloque de hielo.',
    keywords: ['Quietud', 'Pausa', 'Paciencia', 'Enfoque'],
    historicalMeaning: 'Isa (*īsaz) significa "hielo" y está bien atestiguado en los poemas rúnicos. El noruego lo llama "el ancho puente" (el hielo de los ríos) y el anglosajón lo describe como muy frío, resbaladizo y brillante como el cristal. En el norte el hielo detenía los viajes y la vida. Lectura psicológica moderna: pausa, concentración y riesgo de estancamiento.',
    mindfulnessExercise: 'Si te resulta agradable, siéntate unos minutos en silencio, sin móvil. Cuando aparezcan pensamientos, puedes imaginarlos como copos de nieve que caen y se posan, sin seguirlos. Después, si quieres, pregúntate si hay algo que hoy podrías permitirte postergar o soltar.',
    esotericContext: 'En la cosmología nórdica (Gylfaginning), el hielo de Niflheim y el fuego de Muspelheim se encuentran en el vacío primordial y originan el mundo, una imagen poderosa para esta runa, aunque las fuentes no la relacionan directamente con ella. Usarla para "congelar" situaciones o calmar la mente es una práctica esotérica moderna.',
    prompts: {
      morningQuestion: '¿Dónde necesito detenerme hoy antes de actuar?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  jera: {
    id: 'jera',
    name: 'Jera',
    symbol: 'j',
    aett: 'Aett de Heimdall',
    summary: 'Cosecha, ciclo natural, paciencia',
    description: 'El giro de las estaciones.',
    keywords: ['Cosecha', 'Ciclos', 'Recompensa', 'Tiempo'],
    historicalMeaning: 'Jera (*jērą) significa "año" y "buena cosecha". El poema anglosajón (gear) habla de la esperanza de los hombres cuando la tierra da frutos; el noruego y el islandés la asocian con la abundancia del año. Los pueblos agrícolas sabían que los resultados llegan tras un ciclo completo. Lectura psicológica moderna: la constancia da frutos a largo plazo y forzar los tiempos suele ser contraproducente.',
    mindfulnessExercise: 'Puedes pensar en algo que llevas tiempo cultivando (un hábito, un estudio, un proyecto) y recordar qué cambios sutiles ya has notado. Hoy podrías dedicarle un rato con calma, sin medir el resultado, apreciando el proceso además de la meta.',
    esotericContext: 'La relación de Jera con la "rueda del año" y con festividades como Ostara o Mabon es moderna: Mabon, en concreto, es un nombre popularizado en los años 70 del siglo XX por el neopaganismo, sin base histórica. Del calendario germánico solo está bien documentado el Yule (solsticio de invierno). Léela como una imagen del ciclo agrícola y de la paciencia.',
    prompts: {
      morningQuestion: '¿Qué estoy sembrando actualmente y cuánta paciencia le estoy dando?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  eihwaz: {
    id: 'eihwaz',
    name: 'Eihwaz',
    symbol: 'y',
    aett: 'Aett de Heimdall',
    summary: 'Tejo, transformación, eje del mundo',
    description: 'El árbol sagrado de la vida y la muerte.',
    keywords: ['Tejo', 'Protección', 'Eje', 'Inmortalidad'],
    historicalMeaning: 'Eihwaz (*eihwaz) es el tejo, un árbol longevo, de madera dura y muy venenoso, usado para hacer arcos. El poema anglosajón (eoh) lo describe como árbol áspero, firme en la tierra, guardián del fuego y alegría de la propiedad. Su nombre en el futhark antiguo es una reconstrucción y su uso exacto es incierto. Lectura psicológica moderna: enraizarse y atravesar pérdidas aceptando los finales como parte del ciclo.',
    mindfulnessExercise: 'Puedes sentarte con la espalda cómoda e imaginar un eje que va del suelo al cielo, respirando en él unos minutos. Si te sientes con ánimo, deja que aparezca algo que haya terminado en tu vida y lo que te dejó, sin forzar ninguna conclusión. Es un ejercicio de aceptación y de sentirte centrado.',
    esotericContext: 'Las fuentes nórdicas describen Yggdrasil como un fresno ("askr"); identificarlo con un tejo es una hipótesis de algunos autores, no un hecho. Sí es cierto que el Hávamál cuenta que Odín se colgó de un árbol azotado por el viento, y de ahí la asociación del árbol con la muerte y el renacer. Los usos de Eihwaz como eje del mundo o para trabajos de duelo son esotéricos modernos.',
    prompts: {
      morningQuestion: '¿Qué me mantiene firme y enraizado cuando todo cambia?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  perthro: {
    id: 'perthro',
    name: 'Perthro',
    symbol: 'p',
    aett: 'Aett de Heimdall',
    summary: 'Misterio, destino, lo oculto',
    description: 'El cubilete del destino o el útero creador.',
    keywords: ['Misterio', 'Destino', 'Sincronía', 'Revelación'],
    historicalMeaning: 'El nombre original de Perthro (*perþō) no está documentado y su significado es incierto. El poema anglosajón (peorð) la describe como fuente de diversión y risa donde los guerreros se sientan en el salón; algunos estudiosos proponen un cubilete de dados, un peral o un instrumento musical. La lectura como "útero" o "destino" es moderna. Lectura psicológica: tolerancia a la incertidumbre.',
    mindfulnessExercise: 'Si hay algo que hoy no controlas (una respuesta pendiente, el resultado de una reunión), puedes probar a decirte con suavidad: "Todavía no lo sé, y puedo esperar". Fíjate en cómo se siente el cuerpo al soltar un poco la necesidad de certeza, y termina con una respiración larga.',
    esotericContext: 'Como el significado es desconocido, casi todo lo que se dice de Perthro (misterio, destino, adivinación) es interpretación moderna. Las Nornas, que tejen el destino, existen en la mitología nórdica (Völuspá), pero ninguna fuente las liga a esta runa. Puedes tomarla como una invitación a aceptar lo que no se sabe.',
    prompts: {
      morningQuestion: '¿Qué incertidumbre estoy dispuesto a tolerar hoy sin forzar una respuesta?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  algiz: {
    id: 'algiz',
    name: 'Algiz',
    symbol: 'z',
    aett: 'Aett de Heimdall',
    summary: 'Protección divina, conexión espiritual',
    description: 'Los cuernos del alce o las alas de la valquiria.',
    keywords: ['Protección', 'Escudo', 'Espiritualidad', 'Guía'],
    historicalMeaning: 'Algiz (*algiz) tiene un nombre incierto: puede referirse al alce o a "protección". El poema anglosajón (eolh) habla de una hierba de pantano (junco) que hiere; en el futhark joven la runa cambió de sonido y de nombre (ýr, "tejo"). El sentido de "protección" es una interpretación moderna. Lectura psicológica moderna: seguridad interior y saber pedir ayuda.',
    mindfulnessExercise: 'Puedes levantar los brazos en forma de Y un minuto, respirando hondo, y sentir el espacio que ocupas. Después, con curiosidad, pregúntate qué te hace sentir seguro hoy y qué te hace sentir expuesto, y si hay algo pequeño que te gustaría hacer para cuidarte.',
    esotericContext: 'Su fama como runa de protección, el vínculo con Heimdall (guardián del puente Bifröst) y las valquirias, y el gesto de los brazos alzados proceden del esoterismo moderno (Guido von List y autores posteriores), no de fuentes medievales. Es una de las runas cuyo significado tradicional está peor documentado.',
    prompts: {
      morningQuestion: '¿Qué necesito para sentirme protegido y en calma hoy?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  sowilo: {
    id: 'sowilo',
    name: 'Sowilo',
    symbol: 's',
    aett: 'Aett de Heimdall',
    summary: 'Sol, victoria, energía sanadora',
    description: 'La luz solar fulgurante.',
    keywords: ['Sol', 'Éxito', 'Vitalidad', 'Claridad'],
    historicalMeaning: 'Sowilo (*sōwilō) significa "sol". El poema anglosajón (sigel) la vincula con la esperanza de los marineros al cruzar el mar; el noruego llama al sol "escudo de las nubes" y "destructor del hielo". Lectura psicológica moderna: energía, optimismo realista y confianza.',
    mindfulnessExercise: 'Si puedes, sal a la luz natural unos diez minutos, sin pantallas, sintiendo el calor y respirando despacio. Quizá te apetezca recordar un logro reciente, por pequeño que sea, y reconocértelo. La luz matinal, además, ayuda a regular el ritmo circadiano.',
    esotericContext: 'En la mitología nórdica el sol (Sól) es perseguido por el lobo Sköll (Grímnismál 39). Su relación con la sanación, el triunfo y la victoria sobre la oscuridad es esotérica moderna. Ten en cuenta que la forma de "rayo" de esta runa fue usada por las SS nazis como "Sig-rune", un contexto que conviene conocer.',
    prompts: {
      morningQuestion: '¿Qué me da energía y claridad hoy, y cómo puedo aprovecharlo?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },

  // AETT DE TYR
  tiwaz: {
    id: 'tiwaz',
    name: 'Tiwaz',
    symbol: 't',
    aett: 'Aett de Tyr',
    summary: 'Justicia, honor, sacrificio del ego',
    description: 'La lanza del dios Tyr.',
    keywords: ['Justicia', 'Honor', 'Liderazgo', 'Sacrificio'],
    historicalMeaning: 'Tiwaz (*tīwaz) es el nombre del dios Tyr. Según la Edda en prosa (Gylfaginning), Tyr puso su mano en la boca del lobo Fenrir como garantía para atarlo, y la perdió. Se le asociaba con la justicia y las asambleas (thing). Lectura psicológica moderna: el conflicto entre el interés inmediato y los valores.',
    mindfulnessExercise: 'Puedes escribir tres valores que te importen esta semana. Cuando hoy te toque decidir algo, quizá puedas preguntarte cuál de ellos está en juego, sin exigirte ser perfecto. Si te apetece, piensa en un pequeño acto de honestidad o responsabilidad que llevas tiempo aplazando y en cómo abordarlo con amabilidad hacia ti.',
    esotericContext: 'El Sigrdrífumál (estrofa 6) aconseja grabar "runas de victoria" en la empuñadura de la espada e invocar a Tyr dos veces; es una de las pocas referencias antiguas a un uso práctico de esta runa. La lectura como lanza ascendente y como "sacrificio del ego" es moderna.',
    prompts: {
      morningQuestion: '¿Qué acción coherente con mis valores debo realizar hoy, aunque me cueste?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  berkano: {
    id: 'berkano',
    name: 'Berkano',
    symbol: 'b',
    aett: 'Aett de Tyr',
    summary: 'Nacimiento, crecimiento, nutrición',
    description: 'El abedul y la Gran Madre.',
    keywords: ['Nacimiento', 'Nutrición', 'Sanación', 'Crecimiento'],
    historicalMeaning: 'Berkano (*berkanan) significa "abedul" (o rama de abedul). El poema anglosajón (beorc) dice que no da fruto, pero produce brotes sin semilla y sube hacia el cielo cargado de hojas. Lectura psicológica moderna: cuidado y nacimiento de lo que empieza (proyectos, vínculos, hábitos).',
    mindfulnessExercise: 'Piensa en algo que estás empezando y, si quieres, dedícale hoy un cuidado concreto (tiempo, orden, descanso). Antes, puedes poner la mano en el pecho y respirar tres veces, diciéndote algo amable. Es una práctica sencilla de autocompasión.',
    esotericContext: 'El abedul como árbol de mayo y de primavera está presente en el folclore germánico y escandinavo, y las escobas de abedul se usaban para limpiar. Las asociaciones con Frigg, con la Gran Madre y con la fertilidad son interpretaciones esotéricas modernas, no fuentes medievales.',
    prompts: {
      morningQuestion: '¿Qué necesita mi cuidado hoy para crecer?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  ehwaz: {
    id: 'ehwaz',
    name: 'Ehwaz',
    symbol: 'e',
    aett: 'Aett de Tyr',
    summary: 'Caballo, lealtad, trabajo en equipo',
    description: 'El vínculo sagrado entre el jinete y el caballo.',
    keywords: ['Lealtad', 'Equipo', 'Movimiento', 'Confianza'],
    historicalMeaning: 'Ehwaz (*ehwaz) significa "caballo". El poema anglosajón (eh) lo describe como orgullo de los nobles, sobre el que los guerreros conversan, y alivio para los inquietos. Lectura psicológica moderna: cooperación, confianza y sincronía.',
    mindfulnessExercise: 'Puedes pensar en una relación en la que colaboráis (pareja, equipo, amistad) y notar cómo te sientes en ella. Si te apetece, hoy podrías hacer algo pequeño que refuerce la confianza: agradecer, cumplir una promesa, pedir una opinión. Fíjate en cómo responde tu cuerpo a la cooperación.',
    esotericContext: 'Sleipnir, el caballo de ocho patas de Odín (Gylfaginning), lo lleva incluso hasta el reino de Hel (Baldrs draumar), lo que da al caballo un carácter de mediador entre mundos. Sin embargo, la relación de la runa con las alianzas o los tránsitos importantes es esotérica moderna.',
    prompts: {
      morningQuestion: '¿Con quién colaboro hoy y cómo puedo reforzar esa confianza?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  mannaz: {
    id: 'mannaz',
    name: 'Mannaz',
    symbol: 'm',
    aett: 'Aett de Tyr',
    summary: 'Humanidad, la mente, la comunidad',
    description: 'El espejo de la condición humana.',
    keywords: ['Humanidad', 'Mente', 'Autoconocimiento', 'Comunidad'],
    historicalMeaning: 'Mannaz (*mannaz) significa "hombre, persona". El poema anglosajón (man) habla de la alegría del hombre con sus parientes y de que todos partirán, pues Dios entrega el cuerpo a la tierra. Lectura psicológica moderna: metacognición y reconocimiento de que nuestras vivencias son compartidas.',
    mindfulnessExercise: 'Durante unos minutos puedes observar tus pensamientos como si fueras un espectador ("ahora estoy pensando en..."), sin engancharte. Después, si quieres, imagina la perspectiva de alguien con quien hayas tenido tensión, recordando que su mente es tan compleja como la tuya.',
    esotericContext: 'En la Völuspá (estrofas 17-18), Odín, Hœnir y Lóðurr encuentran dos troncos, Ask y Embla, y les dan aliento, razón y calor vital, creando a los primeros humanos. La lectura de Mannaz como conexión con lo divino y con el bien común es moderna.',
    prompts: {
      morningQuestion: '¿Qué aspecto de mí mismo quiero observar con honestidad hoy?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  laguz: {
    id: 'laguz',
    name: 'Laguz',
    symbol: 'l',
    aett: 'Aett de Tyr',
    summary: 'Agua, intuición, flujo emocional',
    description: 'Las corrientes de agua primigenias.',
    keywords: ['Agua', 'Intuición', 'Fluidez', 'Sueños'],
    historicalMeaning: 'Laguz (*laguz) significa "agua" o "mar" (en el poema anglosajón, lagu es el océano; en los nórdicos, lögr es el agua); algunos lo leen también como "puerro" (laukaz). Los poemas hablan del agua como algo vasto y peligroso, no como símbolo emocional; esa lectura, asociada a la intuición y lo inconsciente, es moderna.',
    mindfulnessExercise: 'Puedes poner una mano en el abdomen y preguntarte con calma: "¿Qué siento ahora?", intentando nombrar la emoción con precisión ("cansancio" o "decepción" en vez de solo "mal"). Poner nombre a las emociones ("etiquetado afectivo") ha mostrado en estudios reducir algo su intensidad, aunque los efectos son modestos. Puedes cerrar bebiendo un vaso de agua con atención.',
    esotericContext: 'En la mitología nórdica, Odín entregó un ojo al pozo de Mímir a cambio de sabiduría (Völuspá 28), pero las fuentes no vinculan ese pozo con la runa. Sus asociaciones con la Luna, las mareas, los sueños y la intuición son esotéricas modernas.',
    prompts: {
      morningQuestion: '¿Qué emoción está presente en mí ahora y qué me está diciendo?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  ingwaz: {
    id: 'ingwaz',
    name: 'Ingwaz',
    symbol: 'q',
    aett: 'Aett de Tyr',
    summary: 'Semilla, gestación, potencial interno',
    description: 'La crisálida protectora.',
    keywords: ['Gestación', 'Semilla', 'Potencial', 'Transformación'],
    historicalMeaning: 'Ingwaz (*ingwaz) es el nombre de Ing, dios de la fertilidad que la tradición identifica con Yngvi-Freyr (Saga de los Ynglingos). El poema anglosajón (ing) cuenta que fue visto primero entre los daneses del este y que se marchó hacia el este por las olas, con su carro tras él. Solo aparece en el futhark antiguo y en el anglosajón. Lectura psicológica moderna: procesos internos silenciosos e incubación de ideas.',
    mindfulnessExercise: 'Si hay una idea o proyecto que estés gestando, puedes darle unos minutos de reflexión tranquila y anotar solo lo que surja, sin forzarlo. Después, permítete descansar sin exigir resultados: la incubación también es parte del proceso creativo.',
    esotericContext: 'La forma de rombo como semilla o "vientre cerrado" y su uso en rituales de gestación o retiro son interpretaciones modernas. Lo que sí está en las fuentes es su vínculo con Freyr/Yngvi, dios asociado a la fertilidad y a la cosecha.',
    prompts: {
      morningQuestion: '¿Qué proceso interno necesita silencio y tiempo hoy?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  dagaz: {
    id: 'dagaz',
    name: 'Dagaz',
    symbol: 'd',
    aett: 'Aett de Tyr',
    summary: 'Amanecer, despertar, transformación',
    description: 'El destello de la aurora.',
    keywords: ['Amanecer', 'Despertar', 'Transformación', 'Iluminación'],
    historicalMeaning: 'Dagaz (*dagaz) significa "día". El poema anglosajón (dæg) lo llama mensajero del Señor, querido por los hombres, luz y esperanza para ricos y pobres. Lectura psicológica moderna: el "clic" de una comprensión repentina y la integración de opuestos.',
    mindfulnessExercise: 'Puedes recordar un momento en que algo "hizo clic" en tu vida y qué había cambiado dentro de ti. Si te apetece, elige una creencia que hoy te limite e invítala a una versión más flexible ("siempre fallo" → "esta vez estoy aprendiendo"). Termina con tres respiraciones observando la luz del día.',
    esotericContext: 'La forma que recuerda al símbolo del infinito, su lectura como umbral entre noche y día o como "runa de bendición" son interpretaciones modernas. Las fuentes solo dicen que el día es un don bienvenido. Sus usos en rituales de amanecer son prácticas contemporáneas.',
    prompts: {
      morningQuestion: '¿Qué creencia mía estoy listo para revisar hoy?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  },
  othala: {
    id: 'othala',
    name: 'Othala',
    symbol: 'o',
    aett: 'Aett de Tyr',
    summary: 'Hogar, ancestros, herencia espiritual',
    description: 'El recinto sagrado del clan.',
    keywords: ['Hogar', 'Ancestros', 'Raíces', 'Herencia'],
    historicalMeaning: 'Othala (*ōþalan) significa "herencia, propiedad ancestral, patria". El poema anglosajón (eðel) dice que es muy querida por todo hombre que puede disfrutar en su casa de lo justo en constante prosperidad. Lectura psicológica moderna: qué valores y patrones hemos heredado y cuáles queremos conservar o transformar. Nota: la runa (llamada "Odal") fue apropiada por el nazismo y hoy la usan grupos de extrema derecha; su significado original no tiene relación con ello.',
    mindfulnessExercise: 'Puedes recordar a alguien de tu linaje al que admires y anotar una cualidad suya que te gustaría honrar, y otra que quizá prefieras no repetir. Sin presión, quizá haya un pequeño gesto de hoy que ponga en práctica la primera. Es un ejercicio de reconocimiento de patrones heredados.',
    esotericContext: 'En el folclore nórdico existían las dísir, espíritus femeninos vinculados a la familia y a los ancestros, honrados en el dísablót (Saga de los Ynglingos, Saga de Egil). La conexión de esta runa con ellas y su uso actual para bendecir el hogar son modernos. En el orden moderno del futhark antiguo Othala cierra la serie, aunque en la piedra de Kylver aparece antes que Dagaz.',
    prompts: {
      morningQuestion: '¿Qué herencia (material, emocional o de valores) quiero honrar hoy?',
      eveningQuestion: 'Dedica un momento a recorrer el tiempo que has pasado con esta runa. ¿Qué has notado en ti, qué ha aparecido, qué se ha movido? Escribe con libertad, sin buscar una respuesta correcta.'
    }
  }
}

const runeId = computed(() => String(route.params.id || 'fehu').toLowerCase())
const rune = computed(() => runesData[runeId.value] || runesData.fehu)

const goBack = () => {
  router.push('/')
}

// --- Diario de reflexiones (Supabase) ---
const userId = computed(() => user.value?.id || user.value?.sub || null)

const morningResponse = ref('')
const eveningResponse = ref('')
const reflections = ref([])
const loading = ref(false)
const submitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const canSubmit = computed(() =>
  !submitting.value &&
  !!userId.value &&
  (morningResponse.value.trim() || eveningResponse.value.trim())
)

const fetchReflections = async () => {
  if (!userId.value) return
  loading.value = true
  errorMsg.value = ''
  const { data, error } = await supabase
    .from('rune_reflections')
    .select('id, rune_id, morning_response, evening_response, created_at')
    .eq('rune_id', rune.value.id)
    .eq('user_id', userId.value)
    .order('created_at', { ascending: false })
  if (error) {
    errorMsg.value = 'No se pudieron cargar tus reflexiones.'
  } else {
    reflections.value = data || []
  }
  loading.value = false
}

const submitReflection = async () => {
  if (!canSubmit.value) return
  submitting.value = true
  errorMsg.value = ''
  successMsg.value = ''
  const { error } = await supabase.from('rune_reflections').insert({
    user_id: userId.value,
    rune_id: rune.value.id,
    morning_response: morningResponse.value.trim() || null,
    evening_response: eveningResponse.value.trim() || null,
    created_at: new Date().toISOString()
  })
  if (error) {
    errorMsg.value = 'No se pudo guardar tu reflexión. Inténtalo de nuevo.'
  } else {
    morningResponse.value = ''
    eveningResponse.value = ''
    successMsg.value = 'Reflexión guardada en tu grimorio.'
    await fetchReflections()
  }
  submitting.value = false
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

// --- Cronómetro de mindfulness (cuenta atrás de 2 minutos) ---
const TIMER_SECONDS = 120
const timerOpen = ref(false)
const timerRunning = ref(false)
const timerLeft = ref(TIMER_SECONDS)
const timerDone = ref(false)
let timerId = null
let timerEnd = 0

const timerDisplay = computed(() => {
  const m = Math.floor(timerLeft.value / 60)
  const sec = timerLeft.value % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
})

const clearTimer = () => {
  if (timerId) clearInterval(timerId)
  timerId = null
}

const tick = () => {
  timerLeft.value = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000))
  if (timerLeft.value === 0) {
    clearTimer()
    timerRunning.value = false
    timerDone.value = true
  }
}

const startTimer = () => {
  clearTimer()
  timerEnd = Date.now() + timerLeft.value * 1000
  timerRunning.value = true
  timerId = setInterval(tick, 250)
}

const openTimer = () => {
  timerLeft.value = TIMER_SECONDS
  timerDone.value = false
  timerOpen.value = true
  startTimer()
}

const toggleTimer = () => {
  if (timerRunning.value) {
    clearTimer()
    timerRunning.value = false
  } else {
    startTimer()
  }
}

const closeTimer = () => {
  clearTimer()
  timerRunning.value = false
  timerOpen.value = false
}

const onKeydown = (e) => {
  if (e.key === 'Escape' && timerOpen.value) closeTimer()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  clearTimer()
  window.removeEventListener('keydown', onKeydown)
})

onMounted(fetchReflections)
watch([() => rune.value.id, userId], () => {
  reflections.value = []
  successMsg.value = ''
  fetchReflections()
})
</script>

<template>
  <div class="min-h-screen w-full pb-28 text-[#e6e1da]">

    <!-- CABECERA -->
    <header class="sticky top-0 z-50 w-full bg-black backdrop-blur-md py-6 sm:py-8">
      <div class="max-w-5xl mx-auto px-6 sm:px-10 flex items-center justify-between">
        <button
          @click="goBack"
          class="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#b3ac9f] hover:text-[#d4a359] transition-colors duration-300 font-title"
        >
          <span class="text-base group-hover:-translate-x-1 transition-transform duration-300">←</span>
          <span>Grimorio</span>
        </button>

        <span class="text-xs uppercase tracking-[0.25em] text-[#d4a359]/80 font-title">
          {{ rune.aett }}
        </span>
      </div>
    </header>

    <!-- HERO -->
    <section class="max-w-3xl mx-auto px-6 sm:px-10 pt-10 sm:pt-16 pb-12 sm:pb-16 flex flex-col items-center text-center">
      <div class="relative flex items-center justify-center my-4 select-none">
        <div class="absolute w-32 h-32 bg-[#d4a359]/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="rune-glyph text-9xl sm:text-[11rem] text-[#d4a359] leading-none drop-shadow-[0_4px_25px_rgba(212,163,89,0.25)]">
          {{ rune.symbol }}
        </div>
      </div>

      <h1 class="font-title text-4xl sm:text-6xl text-[#e6e1da] uppercase tracking-[0.2em] mt-2">
        {{ rune.name }}
      </h1>

      <p class="text-base sm:text-lg text-[#b3ac9f] mt-4 font-light max-w-md leading-relaxed">
        {{ rune.summary }}
      </p>

      <div class="flex flex-wrap items-center justify-center gap-4 mt-8 text-xs tracking-widest uppercase text-[#d4a359]/80 font-light">
        <span v-for="kw in rune.keywords" :key="kw">✦ {{ kw }}</span>
      </div>
    </section>

    <main class="w-full space-y-12">

      <!-- MINDFULNESS Y ENTRENAMIENTO MENTAL -->
      <section class="w-full bg-black/20 backdrop-blur-[2px] py-10">
        <div class="max-w-3xl mx-auto px-6 sm:px-10 space-y-8">
          <h2 class="font-title text-xl text-[#d4a359] uppercase tracking-[0.15em]">
            Mindfulness y Entrenamiento Mental
          </h2>

          <div>
            <h3 class="font-title text-sm text-[#b3ac9f] uppercase tracking-[0.2em] mb-2">Contexto Histórico</h3>
            <p class="text-[#e6e1da] font-light leading-relaxed text-base">
              {{ rune.historicalMeaning }}
            </p>
          </div>

          <div>
            <h3 class="font-title text-sm text-[#b3ac9f] uppercase tracking-[0.2em] mb-2">Enfoque para Hoy</h3>
            <p class="text-[#e6e1da] font-light leading-relaxed text-base border-l-2 border-[#d4a359]/50 pl-4">
              {{ rune.mindfulnessExercise }}
            </p>
            <button
              type="button"
              @click="openTimer"
              class="mt-5 inline-flex items-center gap-2 font-title text-xs uppercase tracking-[0.2em] px-5 py-2.5 border border-[#d4a359]/60 text-[#d4a359] hover:bg-[#d4a359]/10 transition-colors duration-300"
            >
              <span aria-hidden="true">◷</span>
              <span>Cronómetro · 2 min</span>
            </button>
          </div>
        </div>
      </section>

      <!-- ESOTERISMO Y TRADICIÓN -->
      <section class="w-full bg-black/20 backdrop-blur-[2px] py-10">
        <div class="max-w-3xl mx-auto px-6 sm:px-10">
          <h2 class="font-title text-xl text-[#d4a359] uppercase tracking-[0.15em] mb-4">
            Esoterismo y Tradición
          </h2>
          <p class="text-[#b3ac9f] font-light leading-relaxed text-base italic">
            {{ rune.esotericContext }}
          </p>
          <p class="text-xs text-[#b3ac9f]/70 font-light mt-4">
            Las fuentes medievales (poemas rúnicos, Edda) son la base histórica; las lecturas esotéricas son interpretaciones modernas y simbólicas.
          </p>
        </div>
      </section>

      <!-- REFLEXIÓN DIARIA -->
      <section class="w-full bg-black/20 backdrop-blur-[2px] py-10">
        <form class="max-w-3xl mx-auto px-6 sm:px-10 space-y-6" @submit.prevent="submitReflection">
          <h2 class="font-title text-xl text-[#d4a359] uppercase tracking-[0.15em]">
            Reflexión Diaria
          </h2>

          <div>
            <label for="morning" class="block font-title text-sm text-[#b3ac9f] uppercase tracking-[0.2em] mb-1">
              Pregunta de la Mañana
            </label>
            <p class="text-[#e6e1da] font-light mb-3">{{ rune.prompts.morningQuestion }}</p>
            <textarea
              id="morning"
              v-model="morningResponse"
              rows="4"
              placeholder="Escribe tu respuesta..."
              class="w-full bg-black/20 border border-[#363138]/60 focus:border-[#d4a359]/60 outline-none rounded-sm p-3 text-sm font-light text-[#e6e1da] placeholder-[#b3ac9f]/40 transition-colors"
            ></textarea>
          </div>

          <div>
            <label for="evening" class="block font-title text-sm text-[#b3ac9f] uppercase tracking-[0.2em] mb-1">
              Reflexión de la Noche
            </label>
            <p class="text-[#e6e1da] font-light mb-3">{{ rune.prompts.eveningQuestion }}</p>
            <textarea
              id="evening"
              v-model="eveningResponse"
              rows="4"
              placeholder="Escribe lo que quieras recordar de este día con la runa..."
              class="w-full bg-black/20 border border-[#363138]/60 focus:border-[#d4a359]/60 outline-none rounded-sm p-3 text-sm font-light text-[#e6e1da] placeholder-[#b3ac9f]/40 transition-colors"
            ></textarea>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              :disabled="!canSubmit"
              class="font-title text-xs uppercase tracking-[0.2em] px-6 py-3 border border-[#d4a359]/60 text-[#d4a359] hover:bg-[#d4a359]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {{ submitting ? 'Guardando...' : 'Guardar Reflexión' }}
            </button>
            <span v-if="!userId" class="text-xs text-[#b3ac9f]">Inicia sesión para guardar tus reflexiones.</span>
            <span v-if="successMsg" class="text-xs text-[#d4a359]">{{ successMsg }}</span>
            <span v-if="errorMsg" class="text-xs text-red-400">{{ errorMsg }}</span>
          </div>
        </form>
      </section>

      <!-- HISTORIAL -->
      <section class="w-full bg-black/20 backdrop-blur-[2px] py-10">
        <div class="max-w-3xl mx-auto px-6 sm:px-10">
          <h2 class="font-title text-xl text-[#d4a359] uppercase tracking-[0.15em] mb-6">
            Historial de Reflexiones
          </h2>

          <p v-if="loading" class="text-sm text-[#b3ac9f] font-light italic">Cargando tus reflexiones...</p>
          <p v-else-if="!reflections.length" class="text-sm text-[#b3ac9f] font-light italic">
            Aún no has escrito reflexiones con {{ rune.name }}.
          </p>

          <ul v-else class="space-y-6">
            <li
              v-for="entry in reflections"
              :key="entry.id"
              class="bg-black/20 border-l-2 border-[#d4a359]/50 pl-4 py-3 pr-3"
            >
              <time class="block font-title text-xs uppercase tracking-[0.2em] text-[#d4a359] mb-3">
                {{ formatDate(entry.created_at) }}
              </time>
              <div v-if="entry.morning_response" class="mb-3">
                <span class="block text-xs uppercase tracking-widest text-[#b3ac9f] mb-1">Mañana</span>
                <p class="text-sm font-light text-[#e6e1da] leading-relaxed whitespace-pre-line">{{ entry.morning_response }}</p>
              </div>
              <div v-if="entry.evening_response">
                <span class="block text-xs uppercase tracking-widest text-[#b3ac9f] mb-1">Noche</span>
                <p class="text-sm font-light text-[#e6e1da] leading-relaxed whitespace-pre-line">{{ entry.evening_response }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

    </main>
    <!-- CRONÓMETRO A PANTALLA COMPLETA -->
    <div
      v-if="timerOpen"
      class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md px-6 text-center"
      role="dialog"
      aria-modal="true"
      aria-label="Cronómetro de mindfulness"
    >
      <p class="font-title text-xs sm:text-sm uppercase tracking-[0.3em] text-[#b3ac9f] mb-8">
        {{ timerDone ? 'Tiempo completado' : rune.name }}
      </p>

      <div
        class="font-title text-[5.5rem] sm:text-[10rem] leading-none tabular-nums text-[#d4a359] drop-shadow-[0_4px_25px_rgba(212,163,89,0.25)]"
        aria-live="off"
      >
        {{ timerDisplay }}
      </div>

      <p v-if="timerDone" class="mt-8 text-[#b3ac9f] font-light max-w-sm">
        Puedes tomarte un momento antes de volver.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-4 mt-12">
        <button
          v-if="!timerDone"
          type="button"
          @click="toggleTimer"
          class="font-title text-xs uppercase tracking-[0.2em] px-6 py-3 border border-[#d4a359]/60 text-[#d4a359] hover:bg-[#d4a359]/10 transition-colors duration-300"
        >
          {{ timerRunning ? 'Pausar' : 'Reanudar' }}
        </button>
        <button
          v-else
          type="button"
          @click="openTimer"
          class="font-title text-xs uppercase tracking-[0.2em] px-6 py-3 border border-[#d4a359]/60 text-[#d4a359] hover:bg-[#d4a359]/10 transition-colors duration-300"
        >
          Repetir
        </button>
        <button
          type="button"
          @click="closeTimer"
          class="font-title text-xs uppercase tracking-[0.2em] px-6 py-3 border border-[#363138] text-[#b3ac9f] hover:text-[#e6e1da] transition-colors duration-300"
        >
          {{ timerDone ? 'Cerrar' : 'Detener' }}
        </button>
      </div>
    </div>
  </div>
</template>
