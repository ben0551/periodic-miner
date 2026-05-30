// ============================================================
// PERIODIC MINER — Element Discovery Facts
// ============================================================
// 3+ facts per element for periods 1-5, 2 for periods 6-7.
// A random fact is picked on each discovery, so every
// playthrough shows different trivia.
// ============================================================

const ELEMENT_FACTS = {
  // ── Period 1 ──────────────────────────────────────────
  1: [
    "The most abundant element in the universe — over 75% of all normal matter.",
    "A single hydrogen atom is 99.9999999999999% empty space.",
    "Hydrogen burns with an almost invisible flame, which contributed to the Hindenburg disaster.",
    "Stars are essentially giant hydrogen fusion reactors.",
  ],
  2: [
    "Discovered in the sun via spectroscopy 27 years before it was found on Earth.",
    "So light it slowly leaks out of Earth's atmosphere into space.",
    "The only element that cannot be solidified by cooling alone — it requires added pressure.",
    "The voice-distorting effect of helium is the opposite of sulfur hexafluoride.",
  ],

  // ── Period 2 ──────────────────────────────────────────
  3: [
    "Light enough to float on water, but reacts violently with it.",
    "The lightest solid metal on the periodic table.",
    "Powers billions of smartphones and electric vehicles via lithium-ion batteries.",
    "Lithium compounds are a frontline treatment for bipolar disorder.",
  ],
  4: [
    "Beryllium is nearly transparent to X-rays — used as windows in X-ray tubes.",
    "One of the few materials stiffer than steel at a fraction of the weight.",
    "Highly toxic — beryllium dust causes a permanent, incurable lung disease called berylliosis.",
    "Emeralds are beryl crystals — beryllium aluminium silicate coloured by chromium.",
  ],
  5: [
    "The only metalloid in Period 2, sitting at the boundary between metals and non-metals.",
    "Used in nuclear reactors as a neutron absorber — control rods often contain boron.",
    "Boron is critical to plant growth; deficiency causes stunted, deformed leaves.",
    "Borax, a boron compound, has been used as a cleaning agent for over a century.",
  ],
  6: [
    "Carbon forms more compounds than all other elements combined.",
    "Diamond and graphite are both pure carbon — differing only in atomic arrangement.",
    "Every living thing on Earth is carbon-based.",
    "Graphene, a single layer of carbon atoms, is the strongest material ever measured.",
  ],
  7: [
    "Makes up 78% of Earth's atmosphere, yet most organisms can't use it directly.",
    "Lightning 'fixes' atmospheric nitrogen into a form plants can absorb.",
    "Liquid nitrogen boils at −196°C and is used to freeze biological samples for storage.",
    "The ammonia fertiliser made from nitrogen feeds roughly half the world's population.",
  ],
  8: [
    "Makes up about 65% of the human body by mass.",
    "Liquid oxygen is pale blue and strongly magnetic.",
    "Almost all of Earth's atmospheric oxygen was produced by photosynthesis over billions of years.",
    "Oxygen was independently discovered by Scheele and Priestley — both in the same year, 1774.",
  ],
  9: [
    "The most electronegative element — it attracts electrons more strongly than anything else.",
    "Fluorine corrodes glass and must be stored in special polymer containers.",
    "Added to toothpaste as fluoride to harden tooth enamel against acid.",
    "Teflon (PTFE) owes its non-stick properties to extremely strong carbon-fluorine bonds.",
  ],
  10: [
    "Neon signs don't all contain neon — most coloured signs use argon or other gases.",
    "One of the rarest elements in Earth's atmosphere despite being a product of radioactive decay.",
    "Completely unreactive — no stable compounds of neon have ever been made.",
    "Neon was discovered just weeks after krypton, by the same two scientists.",
  ],

  // ── Period 3 ──────────────────────────────────────────
  11: [
    "Sodium explodes on contact with water, producing hydrogen gas.",
    "Your nervous system runs on sodium — nerve impulses are sodium ions crossing cell membranes.",
    "The orange glow of old sodium-vapour streetlights comes from just two spectral lines.",
    "The ocean contains roughly 1.4 × 10²¹ grams of dissolved sodium.",
  ],
  12: [
    "Magnesium burns with a brilliant white flame hot enough to ignite underwater.",
    "The central atom in chlorophyll — magnesium is what makes plants green.",
    "The fourth most abundant element in the Earth as a whole, by mass.",
    "Magnesium alloys are used in laptop cases and car wheels for lightness and strength.",
  ],
  13: [
    "More abundant in the crust than iron, yet was historically rarer and more prized than gold.",
    "The Washington Monument's apex was capped in aluminium in 1884 — a luxury material at the time.",
    "Aluminium cans can be recycled and back on a shelf within 60 days.",
    "The reflective layer inside potato chip bags is typically thin aluminium foil.",
  ],
  14: [
    "Silicon is the foundation of modern computing — 'Silicon Valley' is named after it.",
    "The second most abundant element in Earth's crust, after oxygen.",
    "Sand, glass, and most rocks are primarily silicon compounds.",
    "A silicon chip the size of a fingernail can hold billions of transistors.",
  ],
  15: [
    "White phosphorus glows in the dark due to slow oxidation — the origin of the word 'phosphorescence'.",
    "Essential for DNA and ATP — life as we know it is impossible without phosphorus.",
    "Phosphorus was first isolated from human urine in 1669 by an alchemist searching for gold.",
    "Global phosphorus reserves are finite — some scientists call it the next resource crisis.",
  ],
  16: [
    "Known to ancient civilisations — mentioned in the Bible as 'brimstone'.",
    "The smell of rotten eggs is hydrogen sulfide gas, not pure sulfur itself.",
    "Sulfur is essential for proteins; it's why hair and nails smell when burned.",
    "Sulfuric acid is the most produced industrial chemical in the world by volume.",
  ],
  17: [
    "Added to drinking water and pools to kill bacteria.",
    "Chlorine gas was used as a chemical weapon in World War I.",
    "Common table salt (NaCl) forms when sodium and chlorine react violently together.",
    "The ozone layer was thinned largely by chlorine atoms from refrigerant gases.",
  ],
  18: [
    "The third most abundant gas in Earth's atmosphere at 0.93% — more than CO₂.",
    "Used to fill incandescent light bulbs to prevent the tungsten filament from oxidising.",
    "Argon lasers produce the blue-green beams used in laser light shows.",
    "Completely inert — no confirmed stable argon compounds exist under normal conditions.",
  ],

  // ── Period 4 ──────────────────────────────────────────
  19: [
    "Symbol K comes from the Latin Kalium — from 'kali', meaning alkali.",
    "Potassium is essential for heart rhythm — dangerously low levels can be fatal.",
    "Bananas are measurably radioactive due to naturally occurring potassium-40.",
    "The human body is maintained at a precise potassium concentration by the kidneys.",
  ],
  20: [
    "The fifth most abundant element in Earth's crust.",
    "The human body contains about 1 kg of calcium, nearly all in bones and teeth.",
    "Limestone, chalk, marble, and seashells are all calcium carbonate.",
    "Calcium ions trigger muscle contractions — including every heartbeat.",
  ],
  21: [
    "So rare that it wasn't used industrially until the 1970s despite being known since 1879.",
    "Adding a tiny amount of scandium to aluminium alloys dramatically improves weld strength.",
    "Predicted by Mendeleev as 'eka-boron' before its discovery — a vindication of the periodic table.",
    "The main commercial source of scandium is a byproduct of uranium extraction.",
  ],
  22: [
    "As strong as steel but 45% lighter.",
    "The material of choice for spacecraft, deep-sea submarines, and medical implants.",
    "Titanium is completely biocompatible — the body accepts it as though it were bone.",
    "The SR-71 Blackbird aircraft was largely built from titanium to withstand friction heating.",
  ],
  23: [
    "Named after Vanadis, the Norse goddess of beauty — for the stunning colours of its compounds.",
    "Vanadium redox flow batteries are used for large-scale grid energy storage.",
    "Found in the blood of sea cucumbers, which use vanadium instead of iron.",
    "Adding vanadium to steel makes it far more shock-resistant — used in crankshafts and axles.",
  ],
  24: [
    "Chrome plating uses chromium for its mirror finish and corrosion resistance.",
    "Chromium gives rubies their red colour and emeralds their green.",
    "Stainless steel is typically 10–30% chromium — the chrome prevents rust.",
    "Chromium was named for the Greek word for colour because its compounds span the spectrum.",
  ],
  25: [
    "The deep ocean floor is littered with manganese nodules that accumulate over millions of years.",
    "Added to steel to improve hardness and impact resistance.",
    "Essential trace element for brain and nerve function in animals.",
    "Manganese dioxide is the black material inside standard dry-cell batteries.",
  ],
  26: [
    "The most abundant element on Earth by mass — the entire core is mostly iron.",
    "Haemoglobin uses an iron atom to carry oxygen in red blood cells.",
    "Iron is the endpoint of nuclear fusion in most stars — heavier elements require a supernova.",
    "The ancient Egyptians called iron 'metal from heaven' because their first samples were meteoritic.",
  ],
  27: [
    "The name 'cobalt' comes from German 'Kobold' (goblin) — miners blamed goblins when the ore released toxic arsenic fumes.",
    "Cobalt-60 is a powerful gamma emitter used in cancer radiotherapy.",
    "The brilliant blue in medieval stained glass and centuries-old pottery is cobalt.",
    "Cobalt is a critical material for lithium-ion battery cathodes.",
  ],
  28: [
    "The US 5-cent coin is called a 'nickel' but is 75% copper and only 25% nickel.",
    "Earth's core contains large amounts of nickel — similar to the composition of meteorites.",
    "Nickel is naturally ferromagnetic — one of only three ferromagnetic elements.",
    "First isolated in 1751, the name comes from the German Nickel — another word for the devil.",
  ],
  29: [
    "Copper was the first metal smelted by humans, over 10,000 years ago.",
    "The Statue of Liberty is clad in 80 tonnes of copper, which oxidised to its green patina.",
    "Copper is naturally antimicrobial — bacteria die on copper surfaces within hours.",
    "The Bronze Age is named after copper's alloy with tin — bronze.",
  ],
  30: [
    "Zinc is applied to steel to prevent rust — this is called galvanisation.",
    "Brass is an alloy of copper and zinc, used for millennia in tools and instruments.",
    "The human body contains about 2–3 grams of zinc, essential for immune function and wound healing.",
    "Zinc oxide is the active ingredient in many sunscreens and nappy rash creams.",
  ],
  31: [
    "Gallium melts at just 29.76°C — it turns liquid in your hand.",
    "Used in gallium arsenide semiconductors that power LEDs, laser diodes, and solar cells.",
    "Gallium gradually dissolves aluminium by disrupting its protective oxide layer.",
    "Gallium is a byproduct of aluminium and zinc smelting — no gallium mines exist.",
  ],
  32: [
    "Predicted by Mendeleev as 'eka-silicon' before its 1886 discovery — a perfect vindication.",
    "Was the semiconductor in the first practical transistors in the 1940s.",
    "Germanium fibre optics transmit infrared, used in night-vision systems and thermal cameras.",
    "A pure germanium crystal is a near-perfect detector of gamma radiation.",
  ],
  33: [
    "Napoleon Bonaparte may have been slowly poisoned by arsenic in his wallpaper's green dye.",
    "Arsenic compounds were used medicinally for centuries — including early syphilis treatments.",
    "Some bacteria can substitute arsenate for phosphate in their metabolism.",
    "Arsenic was historically called 'inheritance powder' because poisonings were hard to detect.",
  ],
  34: [
    "Essential in tiny amounts — too little causes heart disease, too much is toxic.",
    "Selenium's electrical resistance drops sharply when exposed to light, making it useful in photodetectors.",
    "Early Xerox photocopiers used a drum coated in amorphous selenium.",
    "Selenium gives glass a ruby-red colour and is used in stained glass.",
  ],
  35: [
    "One of only two elements that are liquid at room temperature.",
    "The deep red colour of bromine vapour gave rise to its name — from Greek 'bromos' meaning stench.",
    "Bromine compounds were used as flame retardants in electronics for decades.",
    "Sea water contains about 65 parts per million of bromine — the oceans are the main source.",
  ],
  36: [
    "Krypton gas was used to define the official length of one metre from 1960 to 1983.",
    "Krypton fluoride lasers etch patterns onto semiconductor chips with extreme precision.",
    "Unlike the lighter noble gases, krypton can form stable compounds — krypton difluoride was made in 1963.",
    "Krypton is produced by nuclear fission and monitoring atmospheric krypton-85 detects clandestine reactors.",
  ],

  // ── Period 5 ──────────────────────────────────────────
  37: [
    "Rubidium ignites spontaneously in air and reacts explosively with water.",
    "Rubidium atomic clocks are accurate to within 1 second in 300 years.",
    "Used in quantum computing research to create Bose-Einstein condensates near absolute zero.",
  ],
  38: [
    "Strontium-90 is a dangerous radioactive fallout product — it mimics calcium and accumulates in bone.",
    "Strontium compounds produce the brilliant red colour in fireworks and flares.",
    "The body can incorporate strontium into bones in place of calcium.",
  ],
  39: [
    "Yttrium was one of four elements discovered in the same rare-earth ore from a single mine in Sweden.",
    "Used in the red phosphors of old CRT televisions.",
    "Yttrium barium copper oxide was the first material to superconduct above liquid nitrogen temperature.",
  ],
  40: [
    "Zirconium is so corrosion-resistant it is used to clad uranium fuel rods in nuclear reactors.",
    "Cubic zirconia, a synthetic form, is the most common diamond simulant.",
    "Zirconium is nearly transparent to neutrons — critical for nuclear applications.",
  ],
  41: [
    "Named after Niobe, daughter of Tantalus in Greek mythology — because it was so hard to separate from tantalum.",
    "Added in small amounts to stainless steel to prevent corrosion in welded joints.",
    "Niobium-titanium alloys are superconducting and used in MRI machine magnets.",
  ],
  42: [
    "Molybdenum has the sixth highest melting point of any element.",
    "A critical trace element for nitrogen-fixing bacteria in soil.",
    "Added to steel to increase strength at high temperatures — used in jet engine parts.",
  ],
  43: [
    "The first element to be produced artificially — synthesised in a particle accelerator in 1937.",
    "All technetium is radioactive and does not occur naturally on Earth in significant quantities.",
    "Technetium-99m is the most widely used medical radioisotope, used in millions of diagnostic scans.",
  ],
  44: [
    "Ruthenium is one of the rarest elements in Earth's crust.",
    "Used as a catalyst for making ammonia and in some hard disk coatings.",
    "Ruthenium compounds are being studied as anti-cancer drugs.",
  ],
  45: [
    "Rhodium is the rarest and most expensive of the platinum-group metals.",
    "A thin layer of rhodium plating gives white gold jewellery its bright finish.",
    "Used in catalytic converters to break down nitrogen oxides from exhaust.",
  ],
  46: [
    "The only element that does not need an inert atmosphere for storage — it passivates in air.",
    "Palladium can absorb up to 900 times its own volume of hydrogen gas.",
    "Essential in catalytic converters; a shortage of palladium can disrupt global car production.",
  ],
  47: [
    "Silver has the highest electrical conductivity of any element.",
    "Silver nanoparticles are antimicrobial and are embedded in some wound dressings and fabrics.",
    "Photography relied on silver halide crystals for over 150 years.",
  ],
  48: [
    "Cadmium is highly toxic and was behind the Itai-itai disease in Japan from contaminated rice.",
    "Cadmium yellow was a favourite pigment of Van Gogh and other post-Impressionist painters.",
    "NiCd (nickel-cadmium) rechargeable batteries contain cadmium.",
  ],
  49: [
    "Indium is so soft and malleable it squeaks when bent — a phenomenon called 'tin cry' applies here too.",
    "The transparent conductor indium tin oxide (ITO) coats nearly every touchscreen in the world.",
    "Indium is primarily recovered as a byproduct of zinc smelting.",
  ],
  50: [
    "Tin 'cries' when bent — the sound of tin crystals breaking is audible.",
    "The Bronze Age began when humans discovered tin could harden copper into bronze.",
    "Tin cans are actually steel coated in a thin layer of tin to prevent corrosion.",
  ],
  51: [
    "Antimony was used in ancient Egypt as black eye makeup (kohl).",
    "Antimony compounds are used as flame retardants in plastics and textiles.",
    "The symbol Sb comes from the Latin Stibium.",
  ],
  52: [
    "Tellurium gives garlic breath to anyone who handles it, even through skin contact.",
    "Used in solar cells and in rewritable DVD media.",
    "Tellurium is one of the rarest stable elements in Earth's crust — rarer than gold.",
  ],
  53: [
    "Iodine vapour is purple — one of the most visually distinctive elements.",
    "Essential for thyroid hormone production — iodine deficiency causes goitre.",
    "Iodine solution (Lugol's iodine) turns deep blue-black in the presence of starch.",
  ],
  54: [
    "Xenon was used in the first practical ion thrusters for spacecraft propulsion.",
    "Xenon flash lamps power the strobe lights in cameras and nightclubs.",
    "Unlike the lighter noble gases, xenon can be anaesthetised — it's a general anaesthetic.",
  ],

  // ── Period 6 ──────────────────────────────────────────
  55: [
    "Caesium is so reactive it ignites spontaneously in air at room temperature.",
    "Caesium atomic clocks define the second — accurate to 1 second in 300 million years.",
  ],
  56: [
    "Barium sulfate is swallowed before X-rays to make the digestive tract visible — it's insoluble and harmless.",
    "Barium compounds produce the green colour in fireworks.",
  ],
  57: [
    "Lanthanum is used in high-quality camera and telescope lenses.",
    "The lanthanide series is named after lanthanum, the first in the group.",
  ],
  58: [
    "Cerium is the most abundant of the rare-earth elements, despite the misleading name.",
    "Lighter flints are made from ferrocerium — an alloy that sparks when struck.",
  ],
  59: [
    "Praseodymium compounds produce the yellow-green colour in protective welder's goggles.",
    "Powerful neodymium magnets contain praseodymium as a partial substitute.",
  ],
  60: [
    "Neodymium magnets are the strongest permanent magnets — used in headphones, hard drives, and wind turbines.",
    "Neodymium glass lasers deliver the most powerful laser pulses ever produced.",
  ],
  61: [
    "Promethium is the only lanthanide with no stable isotopes — all are radioactive.",
    "Named after Prometheus, who stole fire from the gods — fitting for a radioactive element.",
  ],
  62: [
    "Samarium-cobalt magnets work at temperatures where neodymium magnets fail.",
    "Samarium-153 is used in palliative treatment to reduce bone cancer pain.",
  ],
  63: [
    "Europium's red and blue phosphorescence is what makes euro banknotes fluoresce under UV.",
    "Europium compounds give old CRT televisions their red colour.",
  ],
  64: [
    "Gadolinium contrast agents are injected before MRI scans to improve image clarity.",
    "Has the highest neutron absorption cross-section of any stable element.",
  ],
  65: [
    "Terbium is used in solid-state devices and fuel cells.",
    "Green phosphors in old CRT monitors used terbium compounds.",
  ],
  66: [
    "Dysprosium is added to neodymium magnets to make them work at higher temperatures.",
    "The name means 'hard to get to' in Greek — it took many attempts to isolate.",
  ],
  67: [
    "Holmium has the highest magnetic moment of any naturally occurring element.",
    "Used in the most powerful artificial magnetic fields and in some lasers.",
  ],
  68: [
    "Erbium-doped fibre amplifiers boost signals along undersea fibre optic cables.",
    "Erbium lasers are used in dermatology for skin resurfacing.",
  ],
  69: [
    "Thulium is the rarest and most expensive of the stable lanthanides.",
    "Thulium-170 is used in portable X-ray machines that require no power source.",
  ],
  70: [
    "Ytterbium-doped fibre lasers are among the most efficient laser systems.",
    "Ytterbium atomic clocks may one day redefine the second.",
  ],
  71: [
    "Lutetium is the densest and hardest of the lanthanides.",
    "Used in PET scanner detectors and some catalysts.",
  ],
  72: [
    "Hafnium is used in nuclear reactor control rods because it absorbs neutrons well.",
    "Hafnium is always found mixed with zirconium and is extremely difficult to separate.",
  ],
  73: [
    "Tantalum is completely bio-inert and is used for surgical implants and sutures.",
    "Named after Tantalus of Greek mythology — because it refuses to absorb acid.",
  ],
  74: [
    "Tungsten has the highest melting point of any element — 3,422°C.",
    "The filaments of incandescent light bulbs are made of tungsten.",
  ],
  75: [
    "Rhenium has the second highest melting point and is one of the densest elements.",
    "Used in jet engine turbine blades and catalysts for unleaded petrol production.",
  ],
  76: [
    "Osmium is the densest naturally occurring element — denser than lead.",
    "Osmium tetroxide is extremely toxic but is used as a staining agent in electron microscopy.",
  ],
  77: [
    "Iridium is the most corrosion-resistant metal known.",
    "The mass extinction 66 million years ago left an iridium layer in rock worldwide — from an asteroid impact.",
  ],
  78: [
    "Platinum is used in catalytic converters to oxidise carbon monoxide to CO₂.",
    "The international prototype kilogram was made of a platinum-iridium alloy.",
  ],
  79: [
    "Gold is so unreactive it has been found in recognisable form in tombs thousands of years old.",
    "All the gold ever mined in human history would fit in a cube about 21 metres on each side.",
  ],
  80: [
    "Mercury is the only metal that is liquid at room temperature.",
    "Thermometers, barometers, and fluorescent lights all historically relied on mercury.",
  ],
  81: [
    "Thallium sulfate was used as a tasteless, odourless rat poison — and in several famous murders.",
    "Thallium is so toxic that even skin contact can be dangerous.",
  ],
  82: [
    "Lead pipes installed by the Romans are still functioning in some places today.",
    "Leaded petrol was used for decades before the link to childhood cognitive damage was established.",
  ],
  83: [
    "Bismuth is the heaviest stable element — all elements heavier are radioactive.",
    "Bismuth expands when it solidifies, making it useful in casting fine details.",
  ],
  84: [
    "Polonium was discovered by Marie Curie, who named it after her homeland Poland.",
    "So intensely radioactive that a microgram generates perceptible heat.",
  ],
  85: [
    "Astatine is the rarest naturally occurring element — there may be less than 30 grams on Earth at any time.",
    "Virtually nothing is known about astatine's physical properties due to its extreme scarcity.",
  ],
  86: [
    "Radon is a colourless, odourless radioactive gas that seeps from granite and is the second leading cause of lung cancer.",
    "Radon was once used to treat cancer — patients would bathe in radioactive spring water.",
  ],

  // ── Period 7 ──────────────────────────────────────────
  87: [
    "Francium is the second rarest naturally occurring element — only a few hundred atoms exist on Earth at any time.",
    "So radioactive it has never been seen with the naked eye; it exists only as tiny atomic clusters.",
  ],
  88: [
    "Radium glows faintly blue-green in the dark due to its intense radioactivity.",
    "Marie Curie's notebooks are so radioactive they are kept in lead-lined boxes and require protective gear to handle.",
  ],
  89: [
    "Actinium gives its name to the actinide series.",
    "So radioactive it glows blue in the dark from ionisation of surrounding air.",
  ],
  90: [
    "Thorium was once proposed as a safer alternative to uranium for nuclear power.",
    "More energy is available from thorium reserves than from all known uranium and fossil fuel reserves combined.",
  ],
  91: [
    "Protactinium is one of the rarest and most expensive naturally occurring elements.",
    "It decays into actinium — hence the name 'proto-actinium' (before actinium).",
  ],
  92: [
    "Uranium was first used as a yellow colourant in glass before its radioactivity was known.",
    "The only naturally occurring fissile isotope (U-235) fuels nuclear reactors worldwide.",
  ],
  93: [
    "Neptunium was the first synthetic transuranium element, made in 1940.",
    "Named after Neptune — the planet beyond Uranus, just as neptunium lies beyond uranium.",
  ],
  94: [
    "Plutonium-239 is the fissile material in most modern nuclear weapons.",
    "A sphere of plutonium the size of a grapefruit contains enough energy to level a city.",
  ],
  95: [
    "Americium is the synthetic element most familiar to the public — it's in smoke detectors.",
    "A tiny amount of Am-241 in smoke detectors ionises air to detect smoke particles.",
  ],
  96: [
    "Named after Marie and Pierre Curie — the only element named after a married couple.",
    "Curium is intensely radioactive and glows faintly red from its own heat.",
  ],
  97: [
    "Named after Berkeley, California, where it was first synthesised.",
    "Only microgram quantities have ever been produced.",
  ],
  98: [
    "Named after California and the University of California system.",
    "Californium-252 is a neutron emitter used to start up nuclear reactors.",
  ],
  99: [
    "Named after Albert Einstein.",
    "First identified in the fallout from the first hydrogen bomb test in 1952.",
  ],
  100: [
    "Named after Enrico Fermi, architect of the first nuclear reactor.",
    "Only detectable quantities have ever been produced.",
  ],
  101: [
    "Named after Dmitri Mendeleev, creator of the periodic table.",
    "First element synthesised one atom at a time — only 17 atoms were made in the initial experiment.",
  ],
  102: [
    "Named after Alfred Nobel, inventor of dynamite and founder of the Nobel Prize.",
    "All isotopes have half-lives of under an hour.",
  ],
  103: [
    "Named after Ernest Lawrence, inventor of the cyclotron particle accelerator.",
    "The last of the actinide series.",
  ],
  104: [
    "The naming of rutherfordium was disputed for years between American and Soviet scientists.",
    "The heaviest element with a measured density.",
  ],
  105: [
    "Named after Dubna, Russia — the site of the Joint Institute for Nuclear Research.",
    "Has a half-life of only about 28 hours in its most stable form.",
  ],
  106: [
    "Named after Glenn Seaborg, the only person to have an element named after them during their lifetime.",
    "First synthesised in 1974 using a californium target.",
  ],
  107: [
    "Named after Niels Bohr, pioneering quantum physicist.",
    "So short-lived that only individual atoms have ever been studied.",
  ],
  108: [
    "Named after the state of Hesse, Germany, where it was first made.",
    "The most stable isotope has a half-life of about 9 seconds.",
  ],
  109: [
    "Named after Lise Meitner, physicist who co-discovered nuclear fission.",
    "First synthesised in 1982 by bombarding bismuth with iron nuclei.",
  ],
  110: [
    "Named after Darmstadt, Germany — location of GSI Helmholtz Centre.",
    "Only a handful of atoms have ever been created.",
  ],
  111: [
    "Named after Wilhelm Röntgen, discoverer of X-rays.",
    "First created in 1994 by colliding nickel with bismuth.",
  ],
  112: [
    "Named after Nicolaus Copernicus.",
    "Predicted to be a gas at room temperature despite being a metal.",
  ],
  113: [
    "First element discovered in Asia — synthesised at RIKEN in Japan.",
    "Named Nihonium after Japan (Nihon in Japanese).",
  ],
  114: [
    "Named after Ernest Flerov, Soviet nuclear physicist.",
    "Predicted to be relatively stable compared to neighbouring superheavy elements.",
  ],
  115: [
    "Named after Moscow Oblast, Russia.",
    "Decays so quickly that only individual atoms have been observed.",
  ],
  116: [
    "Named after Livermore, California — home of Lawrence Livermore National Laboratory.",
    "One of the heaviest elements ever synthesised.",
  ],
  117: [
    "Named after Tennessee.",
    "The second-heaviest halogen, yet nothing is known about its chemistry.",
  ],
  118: [
    "The heaviest element yet confirmed and the last element in the periodic table.",
    "Named after Yuri Oganessian, pioneering superheavy-element physicist — one of only two living people to have an element named after them.",
    "Predicted to be a solid noble gas at room temperature — a chemical oxymoron.",
  ],
};

// Return a random fact for an element, or a fallback string.
function getElementFact(atomicNumber) {
  const facts = ELEMENT_FACTS[atomicNumber];
  if (!facts || facts.length === 0) return 'A newly discovered element — little is known about it yet.';
  return facts[Math.floor(Math.random() * facts.length)];
}
