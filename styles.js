// styles.js — definición de los estilos y sus prompts.
//
// Cada estilo elige uno de los dos backends realtime de fal:
//
//  - "lucy"  → Decart Lucy 2.5, video a video por WebRTC. Está enganchado a tu
//    movimiento (motion-locked): parpadeas y la ventana parpadea. Los prompts
//    siguen las plantillas de Decart: "Change the style of the video to ..."
//    con detalles visuales concretos.
//  - "klein" → FLUX.2 [klein] realtime, edición de imagen cuadro por cuadro.
//    La geometría es más libre y soñadora. Los prompts se escriben como una
//    instrucción de edición de imagen: "Turn this into ...".
//
// Los prompts van en inglés porque es el idioma con el que estos modelos
// responden mejor; la interfaz que ve la usuaria está en español.
//
// `filter` es el filtro CSS del modo local (sin clave de fal): cada estilo
// tiene su propio color para poder probar tracking y compositing gratis.

// Lo que más pesa, en todos los filtros sin excepción: la persona se respeta.
// Sin esta coletilla el modelo se inventa a quien le da la gana. Va al final
// de la frase y en mayúsculas porque es la orden que no se puede perder.
const IDENTIDAD_KLEIN =
  " Keep THIS EXACT PERSON: same face, same facial features, same expression, " +
  "same hair, same clothes, same pose. Only the art style changes, never the person.";
const IDENTIDAD_LUCY =
  " Keep the person's face, facial features, expression, hair and clothes " +
  "exactly as they are. Only the art style changes, never the person.";

export const STYLES = [
  {
    id: "anime",
    label: "Anime",
    backend: "lucy",
    prompt:
      "Change the style of the video to hand-drawn anime: clean black line " +
      "art, flat cel shading, vibrant saturated colors, large expressive " +
      "eyes, soft painted anime background." + IDENTIDAD_LUCY,
    filter: "saturate(1.8) contrast(1.25) brightness(1.05)",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    backend: "lucy",
    prompt:
      "Change the style of the video to neon cyberpunk: glowing magenta and " +
      "cyan neon light on the person and the walls, rain-slick reflective " +
      "surfaces, holographic signs in the background, deep night tones." + IDENTIDAD_LUCY,
    filter: "hue-rotate(195deg) saturate(2) contrast(1.2)",
  },
  {
    id: "personaje3d",
    label: "Personaje 3D",
    backend: "lucy",
    prompt:
      "Change the style of the video to a 3D animated movie: stylized CGI " +
      "animation, the person as an animated character with expressive big " +
      "eyes and smooth skin, soft cinematic lighting, shallow depth of field." + IDENTIDAD_LUCY,
    filter: "saturate(1.35) contrast(1.15) brightness(1.08)",
  },
  {
    id: "oleo",
    label: "Óleo vivo",
    backend: "klein",
    prompt:
      "Turn this into a living oil painting: thick visible brushstrokes, " +
      "melting gold and sapphire pigments, impasto texture, museum canvas." + IDENTIDAD_KLEIN,
    filter: "sepia(0.35) saturate(1.7) contrast(1.15)",
  },
  {
    id: "dreamworld",
    label: "Dreamworld",
    backend: "klein",
    prompt:
      "Turn this into a surreal ethereal dreamworld: floating islands, " +
      "bioluminescent plants, an aurora sky, soft glowing mist, weightless " +
      "particles of light." + IDENTIDAD_KLEIN,
    filter: "hue-rotate(230deg) saturate(1.6) brightness(1.12)",
  },
  {
    id: "tinta",
    label: "Boceto a tinta",
    backend: "klein",
    prompt:
      "Turn this into a loose ink and watercolor sketch on textured paper, " +
      "expressive black linework, visible pen hatching, splashes of vivid " +
      "color bleeding outside the lines." + IDENTIDAD_KLEIN,
    filter: "grayscale(0.85) contrast(1.7) brightness(1.12)",
  },
  {
    // Estilo libre: prompt y backend se eligen en el panel de la clave.
    id: "custom",
    label: "Personalizado",
    backend: null,
    prompt: null,
    filter: "hue-rotate(140deg) saturate(1.6) contrast(1.1)",
  },
];

export const DEFAULT_STYLE_ID = "anime";

export function findStyle(id) {
  return STYLES.find((s) => s.id === id) || STYLES[0];
}

/** Backend efectivo de un estilo (el personalizado hereda el elegido en el panel). */
export function backendFor(style, customBackend = "klein") {
  return style.backend ?? customBackend;
}

/**
 * Prompt efectivo de un estilo.
 *
 * Manda siempre lo que se haya escrito a mano para ese estilo (`overrides`),
 * porque quien está delante de la cámara ve el resultado y el código no. Si
 * no se ha tocado nada, va el prompt de fábrica.
 */
export function promptFor(style, { customPrompt = "", customBackend = "klein", overrides = {} } = {}) {
  const propio = overrides[style.id];
  if (propio && propio.trim()) return propio.trim();
  if (style.prompt) return style.prompt;
  if (customPrompt.trim()) return customPrompt.trim();
  return customBackend === "lucy"
    ? "Change the style of the video to a 3D animated movie."
    : "Turn this into a living oil painting.";
}

/** Etiqueta corta del backend para la interfaz. */
export function backendLabel(backend) {
  return backend === "lucy" ? "LUCY" : "KLEIN";
}
