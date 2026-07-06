import { BrandTemplate } from './types';

export const SYSTEM_TEMPLATES: BrandTemplate[] = [
  {
    id: 'temp-academia',
    category: 'Educativo y Académico',
    name: 'Universidad del Bicentenario',
    institutionName: 'Universidad del Bicentenario',
    slogan: 'Scientia, Veritas et Progressus',
    vibe: 'Solemne / Académico',
    colors: ['#1E3A8A', '#3B82F6', '#F59E0B', '#111827'], // Navy, Light Blue, Gold, Slate
    font: 'classic',
    symbol: 'book',
    layout: 'horizontal',
    pdfHeaderStyle: 'traditional',
    pdfTitle: 'RESOLUCIÓN DE CONSEJO ACADÉMICO SUPERIOR',
    pdfBody: 'Se certifica que la propuesta de investigación interdisciplinaria ha sido evaluada y aprobada de conformidad con las ordenanzas vigentes de la Facultad de Ciencias Exactas y Sociales. Este aval ratifica el compromiso de nuestra institución con la investigación científica rigurosa y la transferencia activa de conocimiento hacia la comunidad.',
    description: 'Estilo clásico y formal ideal para instituciones de educación superior, colegios tradicionales o academias de investigación con escudo o libro heráldico.'
  },
  {
    id: 'temp-salud',
    category: 'Salud y Bienestar',
    name: 'Sanatorio de la Sagrada Familia',
    institutionName: 'Sanatorio de la Sagrada Familia',
    slogan: 'Ciencia al Servicio de la Vida y la Salud',
    vibe: 'Mínimal Orgánico',
    colors: ['#064E3B', '#10B981', '#34D399', '#1F2937'], // Deep Sage, Emerald, Mint, Dark Slate
    font: 'modern',
    symbol: 'heart',
    layout: 'horizontal',
    pdfHeaderStyle: 'clean',
    pdfTitle: 'INFORME DE CERTIFICACIÓN MÉDICA GENERAL',
    pdfBody: 'Por la presente se hace constar que las instalaciones de la Unidad de Cuidados Cardiovasculares han completado satisfactoriamente la auditoría de bioseguridad y optimización de equipamiento médico. Se extiende esta constancia para acreditar el estándar de excelencia en la atención y cuidado integral del paciente.',
    description: 'Paleta verde esmeralda y menta que transmite serenidad, confianza, cuidado clínico e higiene institucional, orientada a la salud y bienestar.'
  },
  {
    id: 'temp-legal',
    category: 'Legal y Jurídico',
    name: 'García, Montero & Asociados',
    institutionName: 'García, Montero & Asociados',
    slogan: 'Justicia, Integridad y Defensa Corporativa',
    vibe: 'Clásica Corporativa',
    colors: ['#451A03', '#B45309', '#FBBF24', '#1A0C03'], // Brown, Amber, Light Amber, Dark Brown
    font: 'classic',
    symbol: 'scale',
    layout: 'badge',
    pdfHeaderStyle: 'traditional',
    pdfTitle: 'DICTAMEN JURÍDICO OFICIAL Y DICTAMEN DE CONFORMIDAD',
    pdfBody: 'Habiéndose analizado los antecedentes contractuales provistos por las partes, este bufete de abogados dictamina que la estructura de fideicomiso cumple plenamente con las normativas comerciales de la jurisdicción nacional. Se recomienda proceder con la protocolización ante escribano público para resguardar los activos societarios.',
    description: 'Combinación tradicional en tonos tabaco, bronce y oro con el símbolo de la balanza de la justicia. Ideal para estudios contables, notariales o legales.'
  },
  {
    id: 'temp-tech',
    category: 'Tecnología y Laboratorios',
    name: 'Apex Cybernetic Labs',
    institutionName: 'Apex Cybernetic Labs',
    slogan: 'Infraestructura de Datos & Inteligencia Distribuida',
    vibe: 'Moderna / Tecnológica',
    colors: ['#0F172A', '#06B6D4', '#22D3EE', '#020617'], // Cyber Navy, Cyan, Aqua, Deep Black
    font: 'tech',
    symbol: 'hexagon',
    layout: 'vertical',
    pdfHeaderStyle: 'banner',
    pdfTitle: 'PROTOCOLO DE SEGURIDAD Y AUDITORÍA DE RED',
    pdfBody: 'El análisis de penetración de infraestructura externa concluyó de manera exitosa sin registrar brechas de criticidad alta. Todos los nodos de almacenamiento en la nube han sido actualizados bajo algoritmos criptográficos cuánticos de fase dos. El sistema de firewall se mantiene en estado óptimo y altamente monitoreado.',
    description: 'Estilo ciberpunk tecnológico con fuentes monoespaciadas y polígonos geométricos. Excelente para empresas de software, laboratorios químicos o startups.'
  },
  {
    id: 'temp-creative',
    category: 'Arte y Creatividad',
    name: 'Estudio Prisma Creativo',
    institutionName: 'Estudio Prisma Creativo',
    slogan: 'Diseño Sensorial e Identidad de Vanguardia',
    vibe: 'Vibrante / Creativa',
    colors: ['#4C1D95', '#EC4899', '#F43F5E', '#1E1B4B'], // Royal Purple, Fuchsia, Coral Rose, Deep Indigo
    font: 'modern',
    symbol: 'sparkles',
    layout: 'horizontal',
    pdfHeaderStyle: 'banner',
    pdfTitle: 'MANIFIESTO DE CAMPAÑA COMUNICACIONAL',
    pdfBody: 'Nuestra propuesta visual explora las fronteras cromáticas utilizando gradientes fluidos y tipografías expresivas que conectan orgánicamente con las emociones del consumidor. Este documento plasma el esquema conceptual del relanzamiento de marca para el periodo estival, priorizando la audacia estética y la claridad de mensaje.',
    description: 'Gradiente fucsia y violeta con destellos brillantes. Perfecto para agencias de publicidad, estudios cinematográficos, colectivos artísticos o fundaciones modernas.'
  },
  {
    id: 'temp-corporate',
    category: 'Corporativo y Finanzas',
    name: 'Valores Globales Sociedad de Bolsa',
    institutionName: 'Valores Globales Sociedad de Bolsa',
    slogan: 'Patrimonio Sólido, Decisiones Inteligentes',
    vibe: 'Clásica Corporativa',
    colors: ['#0F172A', '#F59E0B', '#334155', '#0F172A'], // Slate, Amber, Muted Blue, Deep Slate
    font: 'modern',
    symbol: 'building',
    layout: 'horizontal',
    pdfHeaderStyle: 'clean',
    pdfTitle: 'REPORTE TRIMESTRAL DE RENDIMIENTO DE CARTERA',
    pdfBody: 'Durante el último trimestre, las carteras de inversión administradas registraron un crecimiento promedio del 8.4% anualizado, superando el índice de referencia del mercado. Este rendimiento se atribuye a nuestra estrategia de diversificación activa en bonos soberanos y acciones de infraestructura de alta resiliencia.',
    description: 'Estilo corporativo elegante en gris pizarra y oro pulido, ideal para consultoras de inversión, brokers, bancos, oficinas de real estate o negocios consolidados.'
  },
  {
    id: 'temp-agro',
    category: 'Agro e Industrial',
    name: 'Campos del Sur Agropecuaria',
    institutionName: 'Campos del Sur Agropecuaria',
    slogan: 'Nutriendo la Tierra, Cosechando Futuro',
    vibe: 'Mínimal Orgánico',
    colors: ['#451A03', '#84CC16', '#A3E635', '#1F1206'], // Coffee Brown, Lime Green, Pale Lime, Dark Soil
    font: 'modern',
    symbol: 'wheat',
    layout: 'horizontal',
    pdfHeaderStyle: 'clean',
    pdfTitle: 'CERTIFICADO DE TRAZABILIDAD Y CALIDAD ORGÁNICA',
    pdfBody: 'Se certifica que la partida de cereales y granos cosechados en el establecimiento "La Postrera" ha superado los controles sanitarios agrícolas. Las prácticas de cultivo empleadas respetan íntegramente los estándares de sustentabilidad y rotación de suelos, garantizando un alimento de máxima pureza para consumo.',
    description: 'Colores terrosos marrones combinados con un verde lima enérgico que representan la tierra y los brotes agrícolas. Diseñado para agroindustrias y agronegocios.'
  },
  {
    id: 'temp-gov',
    category: 'Gubernamental u Oficial',
    name: 'Dirección Nacional de Puertos',
    institutionName: 'Dirección Nacional de Puertos',
    slogan: 'Soberanía, Control y Conectividad Marítima',
    vibe: 'Solemne / Académico',
    colors: ['#1E293B', '#475569', '#94A3B8', '#0F172A'], // Charcoal, Medium Slate, Light Slate, Deep Navy
    font: 'classic',
    symbol: 'anchor',
    layout: 'badge',
    pdfHeaderStyle: 'traditional',
    pdfTitle: 'ORDENANZA DE REGULACIÓN DE ANCLAJES Y AMARRES',
    pdfBody: 'Visto la necesidad de reordenar las prioridades operativas de los buques portacontenedores en la zona del estuario exterior, esta autoridad portuaria dispone nuevos horarios de maniobras de amarre obligatorios para optimizar los tiempos de descarga de insumos estratégicos industriales.',
    description: 'Un diseño extremadamente formal y solemne en tonos pizarra y grises, con el símbolo del ancla marina. Ideal para entidades públicas, registros oficiales o puertos.'
  }
];
