# TRAINING vende tu prenda (beta)

Página web de **Training Bazar** (Hermosillo/Obregón, Sonora) para que cualquier persona ofrezca una prenda deportiva en consignación.

La persona:
1. Lee y acepta las reglas.
2. Llena los datos de su prenda.
3. Elige de 4 a 5 fotos de su galería.
4. Pone su precio y ve cuánto recibe después de la comisión.
5. Revisa todo y lo manda por WhatsApp a la tienda: primero los datos y luego las fotos.

No hay servidor ni base de datos: **nada se sube a internet**. Las fotos se quedan en el celular de la persona hasta que las manda por WhatsApp. Los datos escritos se guardan solo en su navegador, como borrador, y se borran con el enlace «Borrar mis datos».

## Archivos

| Archivo | Para qué sirve |
| --- | --- |
| `config.js` | **Los ajustes**: reglas, comisión, WhatsApp, fotos, campos. Es el único archivo que necesitas editar. |
| `ajustes.html` | Editor visual que genera un `config.js` nuevo. |
| `index.html`, `styles.css`, `app.js` | La página. No necesitas tocarlos. |
| `assets/logo-horizontal.jpg` | Logo de Training Bazar. |

## Cómo cambiar los ajustes

Cada cambio que guardes en GitHub se publica solo en 1 o 2 minutos.

### Opción A: editar `config.js` directo en GitHub
1. Abre el repositorio `training-vende` en github.com.
2. Entra a `config.js` y toca el lápiz ✏️.
3. Cambia lo que necesites, por ejemplo `comision: 10` o una regla. Respeta las comillas y las comas.
4. Toca **Commit changes**.

Algunos ejemplos:
- **Apagar la página:** `activo: false`. La página mostrará «Por ahora no estamos recibiendo prendas».
- **Ocultar un campo:** en `campos`, cambia `mostrar: true` por `mostrar: false`.
- **Hacer obligatorio un campo:** `obligatorio: true`.

Si algo queda mal escrito, la página usa valores por defecto en lugar de romperse.

### Opción B: con el editor visual
1. Abre `https://TU-DIRECCION.pages.dev/ajustes.html`. Esta página no tiene enlace desde la principal.
2. Ajusta los valores y toca **Generar config.js**.
3. Toca **Copiar**. Luego, en GitHub, abre `config.js`, toca el lápiz ✏️, borra todo, pega y toca **Commit changes**.

## Cómo se publica (Cloudflare Pages)

1. En dash.cloudflare.com abre **Workers & Pages → Create → Pages → Connect to Git**.
2. Elige el repositorio `training-vende`.
3. Configura:
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** vacío
   - **Build output directory:** `/`
4. Toca **Save and Deploy**. La página queda en `https://training-vende.pages.dev`.

## Probar en tu computadora

```bash
python -m http.server 8080
# o bien
npx serve .
```

Luego abre `http://localhost:8080`.

> El botón «Enviar mis fotos» usa el menú de compartir del celular. Funciona en Chrome (Android) y Safari (iPhone). En la computadora o dentro de Instagram, Facebook o TikTok, la página muestra una guía para mandar las fotos a mano.
