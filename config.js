/*
 * AJUSTES DE "TRAINING vende tu prenda (beta)"
 * ------------------------------------------------------------
 * Aquí cambias todo lo que ve la gente, sin tocar el resto del código.
 * - Los textos van entre comillas "así".
 * - Cada elemento de una lista termina con coma.
 * - Si algo falta o está mal escrito, la página usa un valor por defecto.
 * También puedes usar el editor visual: /ajustes.html
 */
window.TB_CONFIG = {
  // true = la página recibe prendas. false = muestra "Por ahora no estamos recibiendo prendas".
  activo: true,

  // Título y subtítulo que aparecen arriba.
  titulo: "TRAINING vende tu prenda (beta)",
  subtitulo: "Publica tu prenda en nuestro catálogo y recibe tu pago cuando se venda.",

  // Número de WhatsApp de la tienda: 52 adelante, sin espacios ni signos.
  whatsapp: "526442114830",

  // Porcentaje que se queda Training Bazar de cada venta.
  comision: 10,

  // Cuántas fotos debe elegir la persona (mínimo y máximo).
  minFotos: 4,
  maxFotos: 5,

  // Enlace del botón "Volver al catálogo".
  catalogoUrl: "https://claude.ai/artifact/FUBNSerUdyaAb6T41nSezq",

  // Reglas que se muestran en el paso 1, en este orden.
  reglas: [
    "La prenda debe estar limpia, sin manchas, roturas ni malos olores.",
    "Sube de 4 a 5 fotos con buena luz y fondo liso: frente, espalda, etiqueta de marca, etiqueta de talla y detalles.",
    "Training Bazar revisa tu prenda y decide si la publica en el catálogo.",
    "Training Bazar cobra al cliente y te paga el precio acordado menos su comisión cuando se concreta la venta.",
    "Si vendes la prenda por tu cuenta, avísanos de inmediato para quitarla del catálogo.",
    "Si la prenda no se vende en 30 días, acordamos bajarle el precio o te la regresamos.",
    "En pedidos con envío gratis (desde $1,000), el costo del envío se reparte entre las prendas del pedido y tu parte se descuenta de tu pago. Ej.: envío por Correos de México de $70 con 4 prendas = $17.50 menos."
  ],

  // Opciones de la lista "Categoría".
  categorias: ["Pantalones", "Shorts", "Abrigos", "Playeras", "Otra"],

  // Opciones de la lista "Estado de la prenda".
  estados: ["Nueva con etiqueta", "Como nueva", "Usada en buen estado"],

  // Campos del paso 2, en este orden.
  //   id:          nombre interno (no lo cambies si no sabes para qué es)
  //   etiqueta:    lo que ve la persona
  //   tipo:        "texto", "telefono", "parrafo", "lista-categorias" o "lista-estados"
  //   mostrar:     true = aparece, false = se oculta
  //   obligatorio: true = no se puede avanzar sin llenarlo
  campos: [
    { id: "nombre", etiqueta: "Tu nombre", tipo: "texto", mostrar: true, obligatorio: true },
    { id: "whatsapp", etiqueta: "Tu WhatsApp", tipo: "telefono", mostrar: true, obligatorio: true },
    { id: "ciudad", etiqueta: "Ciudad", tipo: "texto", mostrar: true, obligatorio: false },
    { id: "categoria", etiqueta: "Categoría", tipo: "lista-categorias", mostrar: true, obligatorio: true },
    { id: "marca", etiqueta: "Marca", tipo: "texto", mostrar: true, obligatorio: true },
    { id: "talla", etiqueta: "Talla", tipo: "texto", mostrar: true, obligatorio: true },
    { id: "estado", etiqueta: "Estado de la prenda", tipo: "lista-estados", mostrar: true, obligatorio: true },
    { id: "caracteristicas", etiqueta: "Características (material, color, medidas, detalles o defectos)", tipo: "parrafo", mostrar: true, obligatorio: true }
  ]
};
