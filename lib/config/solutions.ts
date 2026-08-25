export interface SolutionStep {
  step: number;
  title: string;
  description: string;
}

export interface ChemicalSolutionItem {
  name: string;
  type: string;
  formulation: string;
  coverage: string;
  dryingTime: string;
  surface: string;
  benefits: string[];
}

export interface SolutionFAQ {
  question: string;
  answer: string;
}

export interface SolutionGuide {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  category: string;
  blufAnswer: string;
  keyTakeaway: string;
  targetQueries: string[];
  causes: string[];
  chemicalSolutions: ChemicalSolutionItem[];
  applicationSteps: SolutionStep[];
  faqs: SolutionFAQ[];
  relatedDivision: 'chemicals';
}

export const SOLUTIONS_DATA: Record<string, SolutionGuide> = {
  'roof-waterproofing-ghana': {
    slug: 'roof-waterproofing-ghana',
    title: 'Roof Waterproofing & Leak Repair Solutions in Ghana',
    metaTitle: 'Roof Waterproofing & Leak Repair in Ghana',
    metaDescription: 'Best roof waterproofing chemicals and leak repair coatings in Ghana. Certified solutions for concrete flat roofs and metal sheets in Accra.',
    headline: 'Stop Roof Leaks with Industrial-Grade Waterproofing Membranes',
    category: 'Roof & Structural Protection',
    blufAnswer: 'To stop roof leaks and waterproof concrete flat roofs or metal sheets in Ghana, use a high-build elastomeric polyurethane liquid waterproofing membrane reinforced with polyester scrim. Prodeal Industries Ltd in Accra supplies industrial-grade, UV-resistant waterproofing chemicals with same-day dispatch and technical support across Ghana.',
    keyTakeaway: 'Liquid polyurethane-modified elastomeric membranes provide a seamless, monolithic seal that withstands tropical UV radiation and expands over settling micro-cracks without cracking.',
    targetQueries: [
      'What is the best product for waterproofing a roof?',
      'What can I use to stop my roof from leaking?',
      'What is the best roof waterproofing product in Ghana?',
      'Where can I buy roof waterproofing materials in Ghana?',
      'Where can I buy waterproofing chemicals in Ghana?',
      'What chemical can I use to waterproof my roof?',
      'Best waterproof coating for a concrete roof',
      'What can I use to waterproof a flat roof?',
      'What is the best waterproofing paint for roofs?',
      'Where can I buy roof leak repair products in Accra?',
    ],
    causes: [
      'Ponding water on flat concrete slabs due to poor slope gradients.',
      'Hairline shrinkage cracks on concrete roofs expanding under intense tropical solar heat.',
      'Corrosion and fastener screw-hole leaks on corrugated metal sheets.',
      'Degradation of traditional bituminous felt from high UV exposure.',
    ],
    chemicalSolutions: [
      {
        name: 'Pro-Elastoseal Liquid Membrane',
        type: 'Polyurethane Elastomeric Coating',
        formulation: 'High-solids elastomeric liquid polymer with UV stabilizers',
        coverage: '1.5 kg - 2.0 kg / m² (2-3 coats)',
        dryingTime: '4-6 hours recoat, 24 hours full cure',
        surface: 'Concrete flat roofs, parapet walls, screed slabs',
        benefits: ['400% elongation bridges micro-cracks', 'UV and ponding water resistant', 'Monolithic seamless application'],
      },
      {
        name: 'Pro-RoofGuard Acrylic Waterproofing',
        type: 'Reinforced Solar-Reflective Coating',
        formulation: 'Cross-linking pure acrylic with thermal reflective pigments',
        coverage: '1.2 kg - 1.5 kg / m²',
        dryingTime: '2-4 hours per coat',
        surface: 'Corrugated metal sheets, asbestos tiles, zinc roofs',
        benefits: ['Reduces indoor building temperature', 'Prevents rust and fastener leakage', 'Water-based and non-toxic'],
      },
    ],
    applicationSteps: [
      {
        step: 1,
        title: 'Surface Cleaning & Preparation',
        description: 'Remove all moss, algae, dirt, and loose debris using a wire brush or pressure washer. Ensure the substrate is dry, stable, and dust-free.',
      },
      {
        step: 2,
        title: 'Crack Repair & Primer Application',
        description: 'V-groove and seal existing cracks greater than 1mm with polyurethane mastic sealant. Apply a deep-penetrating primer coat diluted 10% with clean water.',
      },
      {
        step: 3,
        title: 'Apply Base Coat & Reinforcing Mesh',
        description: 'Apply the first liberal coat of liquid membrane and embed non-woven polyester reinforcing geotextile scrim over joints, corners, and parapets while wet.',
      },
      {
        step: 4,
        title: 'Apply Cross-Directional Top Coats',
        description: 'Apply the second and third coats perpendicular to the previous coat after 4 hours drying time, ensuring full encapsulation of the membrane.',
      },
    ],
    faqs: [
      {
        question: 'What is the best chemical to stop concrete roof leaks in Ghana?',
        answer: 'The most durable solution for concrete roof slabs in Ghana is a liquid elastomeric polyurethane waterproofing membrane reinforced with geotextile fabric. It creates a seamless rubber barrier resistant to torrential rainfall and intense tropical UV.',
      },
      {
        question: 'Can I apply waterproofing paint directly over a leaking metal roof?',
        answer: 'Yes, but you must first treat rusted areas with a rust converter, seal all loose screw fasteners and overlaps with polyurethane sealant, and apply a solar-reflective acrylic elastomeric waterproof coating.',
      },
      {
        question: 'Where can I buy roof waterproofing chemicals in Accra, Ghana?',
        answer: 'Prodeal Industries Ltd supplies wholesale and contractor-grade roof waterproofing chemicals directly from Accra with rapid dispatch across Greater Accra, Tema, Kumasi, and nationwide.',
      },
    ],
    relatedDivision: 'chemicals',
  },

  'damp-wall-water-seepage-repair': {
    slug: 'damp-wall-water-seepage-repair',
    title: 'Damp Wall Treatment & Water Seepage Repair in Ghana',
    metaTitle: 'Stop Water Seepage & Damp Walls in Ghana',
    metaDescription: 'Stop water seepage through walls and treat rising damp in Ghana. Industrial-grade damp-proofing chemicals in Accra with rapid delivery.',
    headline: 'Eliminate Damp Walls, Peeling Paint & Water Seepage Permanently',
    category: 'Moisture & Damp Proofing',
    blufAnswer: 'To stop water seepage through walls and treat rising damp in Ghana, apply a deep-penetrating silane-siloxane hydrophobic sealer or a crystalline waterproofing slurry. Prodeal Industries Ltd in Accra supplies specialized damp-proofing chemicals that penetrate deep into sandcrete blocks and plaster, blocking moisture penetration permanently.',
    keyTakeaway: 'Crystalline and deep-penetrating silane sealants chemically react with the minerals inside concrete and sandcrete blocks, creating an insoluble waterproof barrier that prevents efflorescence and peeling paint.',
    targetQueries: [
      'What can I use to stop water from entering my house?',
      'Best product to stop water seepage through walls',
      'What chemical prevents water from penetrating concrete?',
      'How do I stop water from coming through my walls?',
      'What is the best damp proofing product in Ghana?',
      'Where can I buy damp proofing materials in Ghana?',
      'Best waterproofing chemical for walls',
      'What can I use to stop rising damp in my house?',
      'How do I waterproof my house from rainwater?',
      'What product can I use for water seepage in my building?',
    ],
    causes: [
      'Porous sandcrete blocks absorbing wind-driven tropical rainwater.',
      'Missing or compromised Damp Proof Course (DPC) membranes at the foundation level causing rising damp.',
      'Capillary suction pulling subterranean moisture up through plaster.',
      'Micro-cracks in exterior wall rendering allowing rainwater penetration.',
    ],
    chemicalSolutions: [
      {
        name: 'Pro-DampStop Crystalline Slurry',
        type: 'Active Crystalline Waterproof Coating',
        formulation: 'Inorganic cementitious slurry with catalytic waterproofing crystals',
        coverage: '1.2 kg - 1.8 kg / m² (2 coats)',
        dryingTime: '6-8 hours between coats, moist cured for 48 hours',
        surface: 'Interior and exterior masonry walls, retaining walls, basements',
        benefits: ['Penetrates up to 100mm into block pores', 'Resists both positive and negative water pressure', 'Self-heals hairline moisture cracks'],
      },
      {
        name: 'Pro-HydroShield Silane Penetrant',
        type: 'Deep-Penetrating Hydrophobic Liquid',
        formulation: 'Silane-siloxane solventless emulsion',
        coverage: '4 - 6 m² per liter',
        dryingTime: '2 hours dry to touch',
        surface: 'Unpainted exterior masonry, face brick, stone cladding',
        benefits: ['Invisible water-beading finish', '100% vapor permeable (allows walls to breathe)', 'Prevents mold, algae, and salt efflorescence'],
      },
    ],
    applicationSteps: [
      {
        step: 1,
        title: 'Strip Damaged Plaster & Paint',
        description: 'Scrape off all peeling paint, efflorescence (white salt deposits), and crumbly plaster at least 30cm above the visible damp line.',
      },
      {
        step: 2,
        title: 'Pre-Wet Substrate',
        description: 'Dampen the bare sandcrete block surface with clean water to saturation without leaving standing water.',
      },
      {
        step: 3,
        title: 'Apply Crystalline Waterproof Slurry',
        description: 'Mix Pro-DampStop with clean water to a creamy slurry consistency. Apply with a masonry brush in 2 uniform coats.',
      },
      {
        step: 4,
        title: 'Moist Cure & Finish with Waterproof Plaster',
        description: 'Mist with water for 48 hours to activate crystalline penetration. Replaster using sand/cement mortar dosed with waterproof admixture.',
      },
    ],
    faqs: [
      {
        question: 'Why does paint keep peeling off my exterior walls after it rains?',
        answer: 'Paint peels because moisture penetrates porous sandcrete blocks from the outside and pushes outward as vapor pressure. Applying a deep-penetrating damp-proofing crystalline barrier before repainting stops moisture transport permanently.',
      },
      {
        question: 'How do I stop water coming through my walls from the ground (rising damp)?',
        answer: 'Rising damp requires stripping the infected plaster, treating the bare masonry with a crystalline barrier coating like Pro-DampStop, and replastering using cement mortar modified with waterproof admixtures.',
      },
      {
        question: 'Where can I buy damp-proofing chemicals in Ghana?',
        answer: 'Prodeal Industries Ltd stocks industrial damp-proofing products in Accra with fast wholesale delivery nationwide.',
      },
    ],
    relatedDivision: 'chemicals',
  },

  'concrete-waterproofing-admixtures': {
    slug: 'concrete-waterproofing-admixtures',
    title: 'Concrete Waterproofing Admixtures & Repair Chemicals in Ghana',
    metaTitle: 'Concrete Waterproofing Admixtures Ghana',
    metaDescription: 'High-performance concrete waterproofing admixtures and repair chemicals in Ghana. Certified for foundations, slabs, and water tanks in Accra.',
    headline: 'Make Concrete 100% Waterproof & Structural Grade from the Mix',
    category: 'Concrete & Masonry Additives',
    blufAnswer: 'To make concrete waterproof in Ghana, blend an integral crystalline waterproofing admixture directly into the concrete mix during batching. Prodeal Industries Ltd in Accra supplies commercial-grade liquid and powder admixtures that permanently seal microscopic pores within the concrete matrix, preventing moisture seepage and rebar corrosion.',
    keyTakeaway: 'Integral admixtures turn the entire thickness of concrete into a permanent waterproof barrier that does not wear out or require re-application over the lifetime of the structure.',
    targetQueries: [
      'What chemical can I add to concrete to make it waterproof?',
      'Best waterproofing chemical for concrete',
      'Where can I buy concrete waterproofing chemicals in Ghana?',
      'What can I use to repair cracked concrete?',
      'Best concrete repair products in Ghana',
      'What chemical can strengthen and protect concrete?',
      'Where can I buy construction chemicals in Ghana?',
      'Best construction chemicals supplier in Accra',
    ],
    causes: [
      'High water-cement ratios leaving interconnected capillary networks as water evaporates.',
      'Honeycombing and voids due to inadequate compaction during concrete pours.',
      'Sulfate and chloride attack from groundwater corroding internal steel reinforcement.',
      'Settlement and thermal shrinkage cracking in foundations, retaining walls, and water reservoirs.',
    ],
    chemicalSolutions: [
      {
        name: 'Pro-Mix Integral Waterproofing Admixture',
        type: 'Pore-Blocking Liquid Admixture',
        formulation: 'Advanced hydrophobic active compound with water-reducing plasticizers',
        coverage: '500ml - 1000ml per 50kg bag of cement (1% - 2% wt)',
        dryingTime: 'Follows standard concrete cure cycle',
        surface: 'Foundations, basement slabs, swimming pools, concrete water tanks',
        benefits: ['Reduces concrete permeability by up to 90%', 'Increases compressive strength and workability', 'Prevents steel rebar corrosion'],
      },
      {
        name: 'Pro-Mortar Non-Shrink Repair Compound',
        type: 'Polymer-Modified Structural Repair Mortar',
        formulation: 'High-strength cementitious polymer with silica fume',
        coverage: '18 kg / m² at 10mm thickness',
        dryingTime: 'Initial set: 45 minutes, Full load: 7 days',
        surface: 'Spalled concrete slabs, exposed rebar patches, honeycombed walls',
        benefits: ['Zero shrinkage bonding', 'High compressive strength (>45 MPa)', 'Resistant to freeze-thaw and chemical attack'],
      },
    ],
    applicationSteps: [
      {
        step: 1,
        title: 'Calculate Batch Dosage',
        description: 'Measure 500ml to 1000ml of Pro-Mix Admixture for every 50kg bag of cement used in your design mix.',
      },
      {
        step: 2,
        title: 'Add to Mixing Water',
        description: 'Premix the liquid admixture into 70% of the batching water before dispensing into the aggregate and cement mix.',
      },
      {
        step: 3,
        title: 'Thorough Mixing & Placement',
        description: 'Mix for at least 3 minutes in a mechanical concrete mixer to ensure uniform dispersion. Vibrate thoroughly during casting.',
      },
      {
        step: 4,
        title: 'Standard Water Curing',
        description: 'Maintain continuous water ponding or wet hessian curing for at least 7 to 14 days to maximize hydration and crystalline density.',
      },
    ],
    faqs: [
      {
        question: 'What chemical do I add to concrete to waterproof a foundation or water tank in Ghana?',
        answer: 'Add an integral waterproofing admixture such as Pro-Mix at a rate of 1% to 2% by cement weight during concrete mixing. It blocks capillary pores and creates a watertight monolithic structure.',
      },
      {
        question: 'How do I repair cracked concrete slabs or honeycombed walls?',
        answer: 'Chisel away loose aggregate around cracks, apply a bonding agent, and pack with a non-shrink polymer-modified structural repair mortar.',
      },
      {
        question: 'Where can contractors buy bulk concrete chemicals in Accra?',
        answer: 'Prodeal Industries Ltd supplies commercial construction chemicals in 20L jerrycans, 200L drums, and 1000L IBC totes with direct delivery to construction sites across Ghana.',
      },
    ],
    relatedDivision: 'chemicals',
  },

  'waterproof-exterior-wall-coatings': {
    slug: 'waterproof-exterior-wall-coatings',
    title: 'Waterproof Exterior Wall Coatings & Weatherproof Paints in Ghana',
    metaTitle: 'Waterproof Exterior Wall Paint in Ghana',
    metaDescription: 'Industrial-grade waterproof exterior wall coatings in Ghana. Anti-fungal, UV-resistant, and weatherproof paints available in Accra and nationwide.',
    headline: 'High-Performance Weatherproof Architectural Wall Protection',
    category: 'Paints & Architectural Coatings',
    blufAnswer: 'The best waterproof paint for exterior walls in Ghana is a 100% pure acrylic elastomeric coating containing anti-fungal biocides and UV stabilizers. Prodeal Industries Ltd in Accra manufactures and supplies heavy-duty weatherproof wall coatings that bridge hairline cracks, repel torrential rain, and resist tropical algae growth.',
    keyTakeaway: 'Standard decorative paints fail rapidly under Ghana’s high humidity and monsoon rainfall; elastomeric architectural coatings provide flexible waterproofing that expands over building movement.',
    targetQueries: [
      'What is the best waterproof paint for a house?',
      'Where can I buy waterproof paint in Ghana?',
      'Best exterior wall coating in Ghana',
      'What paint can protect my walls from rain?',
      'What is the best protective coating for concrete walls?',
      'Where can I buy industrial coatings in Ghana?',
      'Best coating for protecting a building from moisture',
      'What type of paint should I use on an exterior wall in Ghana?',
    ],
    causes: [
      'High relative humidity promoting rapid fungal and algae blooms on exterior facades.',
      'Monsoon wind-driven rains soaking through standard non-waterproof decorative emulsion paints.',
      'Intense UV radiation causing paint chalking, fading, and micro-fissures.',
      'Foundation settling creating structural hairline cracks that admit moisture.',
    ],
    chemicalSolutions: [
      {
        name: 'Pro-Shield Weatherproof Elastomeric Paint',
        type: 'Pure Acrylic Elastomeric Wall Coating',
        formulation: '100% acrylic resin with active fungicides and UV blockers',
        coverage: '8 - 10 m² / liter (per coat)',
        dryingTime: '1-2 hours dry to touch, 4 hours recoat',
        surface: 'Exterior sandcrete block walls, plastered masonry, concrete facades',
        benefits: ['Bridges settling cracks up to 1.5mm', 'Anti-fungal and anti-algae guarantee', 'Dirt pickup resistant & washable'],
      },
      {
        name: 'Pro-Prime Alkali-Resistant Masonry Primer',
        type: 'Deep-Penetrating Acrylic Sealer',
        formulation: 'Micro-emulsion alkali-resistant polymer',
        coverage: '10 - 12 m² / liter',
        dryingTime: '1 hour dry to touch',
        surface: 'Freshly plastered exterior and interior walls',
        benefits: ['Neutralizes high alkaline plaster', 'Locks down chalky surfaces', 'Maximizes topcoat adhesion & coverage'],
      },
    ],
    applicationSteps: [
      {
        step: 1,
        title: 'Surface Washing & Mold Treatment',
        description: 'Wash down walls to eliminate dirt, chalking, and fungal growth with a biocide wash. Allow to dry thoroughly.',
      },
      {
        step: 2,
        title: 'Crack Filling',
        description: 'Fill all exterior cracks with flexible acrylic sealant. Sand smooth when cured.',
      },
      {
        step: 3,
        title: 'Apply Alkali-Resistant Primer',
        description: 'Roll on one continuous coat of Pro-Prime Masonry Sealer to bind the substrate and stop efflorescence.',
      },
      {
        step: 4,
        title: 'Apply 2 Coats of Elastomeric Waterproof Paint',
        description: 'Apply two full coats of Pro-Shield Elastomeric coating with a roller or airless sprayer, allowing 4 hours drying between coats.',
      },
    ],
    faqs: [
      {
        question: 'What is the best exterior paint for coastal and humid areas in Ghana?',
        answer: 'An elastomeric pure acrylic waterproof paint with built-in anti-fungal inhibitors is the best choice. It repels salt air, prevents black mold streaks, and flexes with seasonal temperature changes.',
      },
      {
        question: 'How many coats of waterproof paint should I apply on exterior walls?',
        answer: 'We recommend 1 coat of alkali-resistant penetrating primer followed by 2 full cross-directional coats of elastomeric waterproof paint.',
      },
      {
        question: 'Where can I buy wholesale waterproof paint in Accra, Ghana?',
        answer: 'Prodeal Industries Ltd supplies commercial quantities of weatherproof coatings and primers with customized tinting and direct site delivery across Ghana.',
      },
    ],
    relatedDivision: 'chemicals',
  },

  'construction-chemicals-contractors-ghana': {
    slug: 'construction-chemicals-contractors-ghana',
    title: 'Construction Chemicals for Contractors & Builders in Ghana',
    metaTitle: 'Bulk Construction Chemicals in Ghana',
    metaDescription: 'Wholesale construction chemicals in Ghana for contractors and developers. Waterproofing, admixtures, and bonding agents in Accra with fast dispatch.',
    headline: 'Commercial-Scale Supply of Certified Construction Chemicals',
    category: 'Contractor & B2B Supply',
    blufAnswer: 'For contractors and real estate developers in Ghana seeking bulk construction chemicals, Prodeal Industries Ltd in Accra is the premier B2B supplier. We provide certified waterproofing chemicals, concrete admixtures, non-shrink grouts, and protective coatings in 20L jerrycans, 200L drums, and 1000L IBC totes with batch testing and technical data sheets.',
    keyTakeaway: 'Prodeal Industries provides contractor-level pricing, certified Safety Data Sheets (SDS), technical site advisory, and rapid logistical dispatch across Ghanaian construction sites.',
    targetQueries: [
      'Where can I buy building protection products in Ghana?',
      'Where can I buy construction finishing materials in Ghana?',
      'Best products for protecting a newly built house',
      'What products do I need to protect my building from water damage?',
      'Where can contractors buy construction chemicals in Ghana?',
      'Best construction chemicals supplier in Accra',
      'Wholesale chemical suppliers Ghana',
      'Bulk waterproofing products Ghana',
    ],
    causes: [
      'Material wastage and inconsistent quality from uncertified retail vendors.',
      'Project delays caused by long import lead times for specialized construction chemicals.',
      'Premature building failures caused by using incorrect chemical grades on commercial structures.',
      'Lack of technical data sheets and site advisory support during critical project phases.',
    ],
    chemicalSolutions: [
      {
        name: 'Pro-Bond SBR Latex Bonding Agent',
        type: 'Styrene-Butadiene Rubber Emulsion',
        formulation: 'High-solids synthetic latex bonding and waterproofing polymer',
        coverage: '6 - 8 m² / liter as slurry primer',
        dryingTime: 'Apply wet-on-wet with fresh mortar/concrete',
        surface: 'Concrete joints, rendering, floor screeds, repair patches',
        benefits: ['Superior adhesion to old concrete', 'Improves mortar flexural & tensile strength', 'Reduces water absorption in floor screeds'],
      },
      {
        name: 'Pro-Grout High-Strength Non-Shrink Grout',
        type: 'Precision Cementitious Grout',
        formulation: 'Ready-to-use expanding cementitious compound',
        coverage: '25kg bag yields ~13.5 liters of fluid grout',
        dryingTime: 'Initial set: 2 hours, Compressive strength >60 MPa at 28 days',
        surface: 'Machine base plates, structural column foundations, precast joints',
        benefits: ['Dual shrinkage compensation', 'High early and ultimate strength', 'Chloride-free and non-corrosive'],
      },
    ],
    applicationSteps: [
      {
        step: 1,
        title: 'Technical Consultation & Project Sizing',
        description: 'Share your architectural drawings or bill of quantities with Prodeal’s technical desk to compute exact chemical volumes.',
      },
      {
        step: 2,
        title: 'Direct Wholesale Quotation',
        description: 'Receive an instant B2B proforma invoice with tiered volume discounts and delivery schedules via RFQ or WhatsApp.',
      },
      {
        step: 3,
        title: 'Batch Quality & Compliance Verification',
        description: 'All shipments arrive accompanied by Technical Data Sheets (TDS), Safety Data Sheets (SDS), and batch compliance certificates.',
      },
      {
        step: 4,
        title: 'Site Delivery & Application Advisory',
        description: 'Our logistics team delivers directly to your site in Accra, Tema, Kumasi, or regional project locations with on-call applicator support.',
      },
    ],
    faqs: [
      {
        question: 'Do you offer bulk discounts for commercial construction contractors in Ghana?',
        answer: 'Yes, Prodeal Industries Ltd provides tiered B2B pricing for contractors, civil engineering firms, and real estate developers with volume discounts on drum and IBC quantities.',
      },
      {
        question: 'Are Technical Data Sheets (TDS) and Safety Data Sheets (SDS) provided?',
        answer: 'Yes, every batch is certified and supplied with official TDS and SDS documentation in compliance with Environmental Protection Agency (EPA) standards.',
      },
      {
        question: 'How quickly can bulk chemicals be delivered to a construction site in Accra or Tema?',
        answer: 'We provide same-day or 24-hour delivery for in-stock formulations across Greater Accra and Tema, and 48-hour delivery across other regions.',
      },
    ],
    relatedDivision: 'chemicals',
  },
};

export const SOLUTIONS_LIST = Object.values(SOLUTIONS_DATA);
