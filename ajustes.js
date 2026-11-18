/* Editor visual de config.js · Training Bazar
 * Lee window.TB_CONFIG, lo muestra en un formulario y genera el archivo completo.
 */
(function () {
  "use strict";

  var normalizar = window.TB_normalizarConfig;
  var cfg = normalizar(window.TB_CONFIG);
  var campos = cfg.campos.map(function (f) { return Object.assign({}, f); });

  var NOMBRE_TIPO = {
    "texto": "Texto corto",
    "telefono": "Teléfono",
    "parrafo": "Párrafo",
    "lista-categorias": "Lista de categorías",
    "lista-estados": "Lista de estados"
  };

  function $(id) { return document.getElementById(id); }

  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "text") n.textContent = v;
      else if (k === "class") n.className = v;
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    });
    (hijos || []).forEach(function (h) {
      if (h == null) return;
      n.appendChild(typeof h === "string" ? document.createTextNode(h) : h);
    });
    return n;
  }

  /* ---------- Cargar valores actuales ---------- */
  $("a-activo").checked = cfg.activo;
  $("a-titulo").value = cfg.titulo;
  $("a-subtitulo").value = cfg.subtitulo;
  $("a-whatsapp").value = cfg.whatsapp;
  $("a-comision").value = cfg.comision;
  $("a-min").value = cfg.minFotos;
  $("a-max").value = cfg.maxFotos;
  $("a-catalogo").value = cfg.catalogoUrl;
  $("a-reglas").value = cfg.reglas.join("\n");
  $("a-categorias").value = cfg.categorias.join("\n");
  $("a-estados").value = cfg.estados.join("\n");

  /* ---------- Lista de campos ---------- */
  function pintarCampos(enfocar) {
    var cont = $("a-campos");
    cont.textContent = "";
    campos.forEach(function (f, i) {
      var idBase = "c-" + i;
      var etiqueta = el("input", { id: idBase + "-etq", type: "text" });
      etiqueta.value = f.etiqueta;
      etiqueta.addEventListener("input", function () { f.etiqueta = etiqueta.value; });

      var mostrar = el("input", { type: "checkbox", id: idBase + "-mos" });
      mostrar.checked = f.mostrar;
      mostrar.addEventListener("change", function () { f.mostrar = mostrar.checked; });

      var oblig = el("input", { type: "checkbox", id: idBase + "-obl" });
      oblig.checked = f.obligatorio;
      oblig.addEventListener("change", function () { f.obligatorio = oblig.checked; });

      var subir = el("button", {
        type: "button", "aria-label": "Subir " + f.etiqueta, text: "↑", disabled: i === 0,
        onclick: function () { mover(i, -1); }
      });
      var bajar = el("button", {
        type: "button", "aria-label": "Bajar " + f.etiqueta, text: "↓", disabled: i === campos.length - 1,
        onclick: function () { mover(i, 1); }
      });

      cont.appendChild(el("div", { class: "campo-edit" }, [
        el("div", { class: "campo-edit__cabeza" }, [
          el("span", { class: "campo-edit__id", text: (i + 1) + ". " + f.id + " · " + (NOMBRE_TIPO[f.tipo] || f.tipo) }),
          el("div", { class: "campo-edit__mover" }, [subir, bajar])
        ]),
        el("div", { class: "campo" }, [el("label", { for: idBase + "-etq", text: "Texto que ve la persona" }), etiqueta]),
        el("div", { class: "campo-edit__opciones" }, [
          el("label", { class: "interruptor", for: idBase + "-mos" }, [mostrar, "Mostrar"]),
          el("label", { class: "interruptor", for: idBase + "-obl" }, [oblig, "Obligatorio"])
        ])
      ]));
    });
    if (enfocar) {
      var b = document.querySelector(enfocar);
      if (b && !b.disabled) b.focus();
      else if (b) {
        var otro = b.parentNode.querySelector("button:not([disabled])");
        if (otro) otro.focus();
      }
    }
  }

  function mover(i, dir) {
    var j = i + dir;
    if (j < 0 || j >= campos.length) return;
    var t = campos[i]; campos[i] = campos[j]; campos[j] = t;
    var idx = dir < 0 ? 0 : 1;
    pintarCampos("#a-campos .campo-edit:nth-child(" + (j + 1) + ") .campo-edit__mover button:nth-child(" + (idx + 1) + ")");
  }

  pintarCampos();

  /* ---------- Generar archivo ---------- */
  function lineas(id) {
    return $(id).value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function q(s) { return JSON.stringify(String(s)); }

  function listaJS(arr, sangria) {
    return "[\n" + arr.map(function (s) { return sangria + "  " + q(s); }).join(",\n") + "\n" + sangria + "]";
  }

  function generar() {
    var err = [];
    var wa = $("a-whatsapp").value.replace(/\D/g, "");
    if (wa.length < 12) err.push("El WhatsApp debe tener 52 y 10 dígitos (12 en total).");
    var com = Number($("a-comision").value);
    if (!isFinite(com) || com < 0 || com > 100 || $("a-comision").value === "") err.push("La comisión debe ser un número de 0 a 100.");
    var min = Math.round(Number($("a-min").value));
    var max = Math.round(Number($("a-max").value));
    if (!(min >= 1 && min <= 10)) err.push("El mínimo de fotos debe estar entre 1 y 10.");
    if (!(max >= 1 && max <= 10)) err.push("El máximo de fotos debe estar entre 1 y 10.");
    if (min > max) err.push("El mínimo de fotos no puede ser mayor que el máximo.");
    var url = $("a-catalogo").value.trim();
    if (!/^https?:\/\//i.test(url)) err.push("El enlace del catálogo debe empezar con https://");
    var titulo = $("a-titulo").value.trim();
    if (!titulo) err.push("Escribe un título.");
    var reglas = lineas("a-reglas"), cats = lineas("a-categorias"), ests = lineas("a-estados");
    if (!reglas.length) err.push("Agrega al menos una regla.");
    if (!cats.length) err.push("Agrega al menos una categoría.");
    if (!ests.length) err.push("Agrega al menos un estado de la prenda.");
    campos.forEach(function (f) { if (!f.etiqueta.trim()) err.push("El campo \"" + f.id + "\" necesita un texto."); });

    var caja = $("a-error");
    if (err.length) {
      caja.textContent = err.join(" ");
      caja.hidden = false;
      return null;
    }
    caja.hidden = true;

    var camposJS = campos.map(function (f) {
      return "    { id: " + q(f.id) + ", etiqueta: " + q(f.etiqueta.trim()) + ", tipo: " + q(f.tipo) +
             ", mostrar: " + (f.mostrar ? "true" : "false") + ", obligatorio: " + (f.obligatorio ? "true" : "false") + " }";
    }).join(",\n");

    return [
      "/*",
      " * AJUSTES DE \"TRAINING vende tu prenda (beta)\"",
      " * ------------------------------------------------------------",
      " * Aquí cambias todo lo que ve la gente, sin tocar el resto del código.",
      " * - Los textos van entre comillas \"así\".",
      " * - Cada elemento de una lista termina con coma.",
      " * - Si algo falta o está mal escrito, la página usa un valor por defecto.",
      " * También puedes usar el editor visual: /ajustes.html",
      " */",
      "window.TB_CONFIG = {",
      "  // true = la página recibe prendas. false = muestra \"Por ahora no estamos recibiendo prendas\".",
      "  activo: " + ($("a-activo").checked ? "true" : "false") + ",",
      "",
      "  // Título y subtítulo que aparecen arriba.",
      "  titulo: " + q(titulo) + ",",
      "  subtitulo: " + q($("a-subtitulo").value.trim()) + ",",
      "",
      "  // Número de WhatsApp de la tienda: 52 adelante, sin espacios ni signos.",
      "  whatsapp: " + q(wa) + ",",
      "",
      "  // Porcentaje que se queda Training Bazar de cada venta.",
      "  comision: " + com + ",",
      "",
      "  // Cuántas fotos debe elegir la persona (mínimo y máximo).",
      "  minFotos: " + min + ",",
      "  maxFotos: " + max + ",",
      "",
      "  // Enlace del botón \"Volver al catálogo\".",
      "  catalogoUrl: " + q(url) + ",",
      "",
      "  // Reglas que se muestran en el paso 1, en este orden.",
      "  reglas: " + listaJS(reglas, "  ") + ",",
      "",
      "  // Opciones de la lista \"Categoría\".",
      "  categorias: " + JSON.stringify(cats).replace(/","/g, "\", \"") + ",",
      "",
      "  // Opciones de la lista \"Estado de la prenda\".",
      "  estados: " + JSON.stringify(ests).replace(/","/g, "\", \"") + ",",
      "",
      "  // Campos del paso 2, en este orden.",
      "  //   id:          nombre interno (no lo cambies si no sabes para qué es)",
      "  //   etiqueta:    lo que ve la persona",
      "  //   tipo:        \"texto\", \"telefono\", \"parrafo\", \"lista-categorias\" o \"lista-estados\"",
      "  //   mostrar:     true = aparece, false = se oculta",
      "  //   obligatorio: true = no se puede avanzar sin llenarlo",
      "  campos: [",
      camposJS,
      "  ]",
      "};",
      ""
    ].join("\n");
  }

  $("form-ajustes").addEventListener("submit", function (e) {
    e.preventDefault();
    var texto = generar();
    if (texto == null) { $("a-error").focus && $("a-error").scrollIntoView({ block: "center" }); return; }
    $("a-salida").value = texto;
    $("a-copiado").textContent = "";
    $("resultado").hidden = false;
    $("resultado-titulo").focus();
  });

  $("a-copiar").addEventListener("click", function () {
    var t = $("a-salida");
    function ok() { $("a-copiado").textContent = "✓ Copiado. Ahora pégalo en config.js en GitHub."; }
    function viejo() {
      t.focus();
      t.select();
      try { document.execCommand("copy"); ok(); }
      catch (e) { $("a-copiado").textContent = "No se pudo copiar solo. Selecciona todo el texto y cópialo."; }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t.value).then(ok, viejo);
    } else {
      viejo();
    }
  });

  $("a-descargar").addEventListener("click", function () {
    var blob = new Blob([$("a-salida").value], { type: "text/javascript;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "config.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
})();
