/* TRAINING vende tu prenda (beta) · Training Bazar
 * Toda la página se arma a partir de window.TB_CONFIG (config.js).
 * Los textos se insertan siempre con textContent, nunca como HTML.
 */
(function () {
  "use strict";

  /* ================= Ajustes por defecto y validación ================= */

  var TIPOS = ["texto", "telefono", "parrafo", "lista-categorias", "lista-estados"];

  var DEFAULTS = {
    activo: true,
    titulo: "TRAINING vende tu prenda (beta)",
    subtitulo: "Publica tu prenda en nuestro catálogo y recibe tu pago cuando se venda.",
    whatsapp: "526442114830",
    comision: 10,
    minFotos: 4,
    maxFotos: 5,
    catalogoUrl: "https://claude.ai/artifact/FUBNSerUdyaAb6T41nSezq",
    reglas: [
      "La prenda debe estar limpia, sin manchas, roturas ni malos olores.",
      "Sube de 4 a 5 fotos con buena luz y fondo liso: frente, espalda, etiqueta de marca, etiqueta de talla y detalles.",
      "Training Bazar revisa tu prenda y decide si la publica en el catálogo.",
      "Training Bazar cobra al cliente y te paga el precio acordado menos su comisión cuando se concreta la venta.",
      "Si vendes la prenda por tu cuenta, avísanos de inmediato para quitarla del catálogo.",
      "Si la prenda no se vende en 30 días, acordamos bajarle el precio o te la regresamos."
    ],
    categorias: ["Pantalones", "Shorts", "Abrigos", "Playeras", "Otra"],
    estados: ["Nueva con etiqueta", "Como nueva", "Usada en buen estado"],
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

  function clonar(o) { return JSON.parse(JSON.stringify(o)); }

  function texto(v, def) {
    return (typeof v === "string" && v.trim()) ? v.trim() : def;
  }

  function listaTextos(v, def) {
    if (!Array.isArray(v)) return def.slice();
    var r = v.filter(function (x) { return typeof x === "string" && x.trim(); })
             .map(function (x) { return x.trim(); });
    return r.length ? r : def.slice();
  }

  function entero(v, def, min, max) {
    var n = Number(v);
    if (!isFinite(n)) return def;
    n = Math.round(n);
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
  }

  function normalizarConfig(raw) {
    var c = (raw && typeof raw === "object") ? raw : {};
    var d = DEFAULTS;
    var cfg = {};

    cfg.activo = typeof c.activo === "boolean" ? c.activo : d.activo;
    cfg.titulo = texto(c.titulo, d.titulo);
    cfg.subtitulo = typeof c.subtitulo === "string" ? c.subtitulo.trim() : d.subtitulo;

    var wa = String(c.whatsapp == null ? "" : c.whatsapp).replace(/\D/g, "");
    cfg.whatsapp = wa.length >= 10 ? wa : d.whatsapp;

    var com = Number(c.comision);
    cfg.comision = (isFinite(com) && com >= 0 && com <= 100) ? com : d.comision;

    cfg.minFotos = entero(c.minFotos, d.minFotos, 1, 10);
    cfg.maxFotos = entero(c.maxFotos, d.maxFotos, 1, 10);
    if (cfg.maxFotos < cfg.minFotos) cfg.maxFotos = cfg.minFotos;

    cfg.catalogoUrl = (typeof c.catalogoUrl === "string" && /^https?:\/\//i.test(c.catalogoUrl.trim()))
      ? c.catalogoUrl.trim() : d.catalogoUrl;

    cfg.reglas = listaTextos(c.reglas, d.reglas);
    cfg.categorias = listaTextos(c.categorias, d.categorias);
    cfg.estados = listaTextos(c.estados, d.estados);

    var campos = [];
    var vistos = {};
    if (Array.isArray(c.campos)) {
      c.campos.forEach(function (f) {
        if (!f || typeof f !== "object") return;
        var id = texto(f.id, "").replace(/[^A-Za-z0-9_-]/g, "");
        if (!id || vistos[id]) return;
        vistos[id] = true;
        campos.push({
          id: id,
          etiqueta: texto(f.etiqueta, id),
          tipo: TIPOS.indexOf(f.tipo) >= 0 ? f.tipo : "texto",
          mostrar: f.mostrar !== false,
          obligatorio: f.obligatorio === true
        });
      });
    }
    cfg.campos = campos.length ? campos : clonar(d.campos);
    return cfg;
  }

  // Disponible para ajustes.js
  window.TB_DEFAULTS = DEFAULTS;
  window.TB_TIPOS = TIPOS;
  window.TB_normalizarConfig = normalizarConfig;

  var raiz = document.getElementById("app");
  if (!raiz) return; // Estamos en ajustes.html: solo exportamos las funciones.

  var CFG = normalizarConfig(window.TB_CONFIG);

  /* ================= Utilidades ================= */

  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === "text") n.textContent = v;
        else if (k === "class") n.className = v;
        else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? "" : v);
      });
    }
    (hijos || []).forEach(function (h) {
      if (h == null || h === false) return;
      n.appendChild(typeof h === "string" ? document.createTextNode(h) : h);
    });
    return n;
  }

  var fmtMoneda = new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", minimumFractionDigits: 0, maximumFractionDigits: 0
  });
  function moneda(n) { return fmtMoneda.format(n).replace("MX", ""); }

  function dos(n) { return String(n).padStart(2, "0"); }
  function fechaHora(d) {
    return dos(d.getDate()) + "/" + dos(d.getMonth() + 1) + "/" + d.getFullYear() + ", " +
           dos(d.getHours()) + ":" + dos(d.getMinutes());
  }

  function generarFolio() {
    var abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var out = "";
    var nums = new Uint32Array(6);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(nums);
    else for (var j = 0; j < 6; j++) nums[j] = Math.floor(Math.random() * 1e9);
    for (var i = 0; i < 6; i++) out += abc[nums[i] % abc.length];
    return "VT-" + out;
  }

  function soloDigitos(v) { return String(v || "").replace(/\D/g, ""); }

  // Normaliza el WhatsApp de la persona a 10 dígitos (acepta +52 / 521 adelante).
  function telefono10(v) {
    var d = soloDigitos(v);
    if (d.length === 13 && d.indexOf("521") === 0) d = d.slice(3);
    else if (d.length === 12 && d.indexOf("52") === 0) d = d.slice(2);
    return d;
  }

  function etiquetaCorta(etq) {
    var t = etq.replace(/\s*\([^)]*\)/g, "").replace(/^tu\s+/i, "").trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function calcular(precio) {
    var p = Math.max(0, Math.round(Number(precio) || 0));
    var z = Math.round(p * CFG.comision / 100);
    return { precio: p, comision: z, recibes: p - z };
  }

  /* ================= Estado y borrador ================= */

  var CLAVE = "tb-vende-borrador";
  var NOMBRES_PASO = ["Reglas", "Tu prenda", "Fotos", "Precio", "Revisión"];

  var estado = {
    paso: 1,
    aceptado: false,
    aceptadoEn: null,
    datos: {},
    precio: "",
    fotos: [],      // [{ blob, url }]
    folio: null,
    archivos: null, // File[] listos para compartir
    enviado: false,
    guiaFotos: false
  };

  function leerBorrador() {
    try {
      var raw = window.localStorage.getItem(CLAVE);
      if (!raw) return;
      var b = JSON.parse(raw);
      if (b && typeof b === "object") {
        if (b.datos && typeof b.datos === "object") {
          Object.keys(b.datos).forEach(function (k) {
            if (typeof b.datos[k] === "string") estado.datos[k] = b.datos[k];
          });
        }
        if (typeof b.precio === "string") estado.precio = b.precio;
      }
    } catch (e) { /* sin almacenamiento: seguimos sin borrador */ }
  }

  function guardarBorrador() {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify({ datos: estado.datos, precio: estado.precio }));
    } catch (e) { /* ignorar */ }
  }

  function borrarDatos() {
    if (!window.confirm("¿Borrar tus datos y empezar de nuevo?")) return;
    try { window.localStorage.removeItem(CLAVE); } catch (e) { /* ignorar */ }
    estado.fotos.forEach(function (f) { URL.revokeObjectURL(f.url); });
    estado.paso = 1;
    estado.aceptado = false;
    estado.aceptadoEn = null;
    estado.datos = {};
    estado.precio = "";
    estado.fotos = [];
    estado.folio = null;
    estado.archivos = null;
    estado.enviado = false;
    estado.guiaFotos = false;
    render(true);
  }

  function camposVisibles() {
    return CFG.campos.filter(function (f) { return f.mostrar; });
  }

  /* ================= Navegador dentro de apps ================= */

  function avisoNavegadorApp() {
    var ua = navigator.userAgent || "";
    if (!/Instagram|FBAN|FBAV|FB_IAB|BytedanceWebview|musical_ly/i.test(ua)) return;
    var caja = document.getElementById("aviso-app");
    if (!caja) return;
    caja.appendChild(el("p", { text: "Para poder enviar tus fotos, abre esta página en Chrome o Safari: toca ⋯ y elige 'Abrir en el navegador'" }));
    if (/Android/i.test(ua)) {
      var url = "intent://" + location.host + location.pathname + location.search +
                "#Intent;scheme=https;package=com.android.chrome;end";
      caja.appendChild(el("a", { class: "boton boton--oscuro", href: url, text: "Abrir en Chrome" }));
    }
    caja.hidden = false;
  }

  /* ================= Render general ================= */

  function render(enfocar) {
    raiz.textContent = "";

    if (!CFG.activo) { renderApagado(); return; }

    var cuerpo = el("div", { class: "tarjeta__cuerpo" });
    var tarjeta = el("section", { class: "tarjeta" }, [cabecera(), cuerpo]);
    raiz.appendChild(tarjeta);

    var pasos = [paso1, paso2, paso3, paso4, paso5];
    pasos[estado.paso - 1](cuerpo);

    raiz.appendChild(navegacion());
    raiz.appendChild(el("p", { class: "borrar" }, [
      el("button", { type: "button", text: "Borrar mis datos", onclick: borrarDatos })
    ]));

    if (enfocar) {
      window.scrollTo(0, 0);
      var h = cuerpo.querySelector("h2");
      if (h) h.focus({ preventScroll: true });
    }
  }

  function cabecera() {
    var segs = [];
    for (var i = 1; i <= 5; i++) {
      segs.push(el("span", { class: "progreso__seg" + (i <= estado.paso ? " is-hecho" : "") }));
    }
    return el("div", { class: "tarjeta__cabeza" }, [
      el("h1", { class: "titulo", text: CFG.titulo }),
      CFG.subtitulo ? el("p", { class: "subtitulo", text: CFG.subtitulo }) : null,
      el("div", { class: "progreso" }, [
        el("div", {
          class: "progreso__barra", role: "progressbar",
          "aria-valuemin": "1", "aria-valuemax": "5", "aria-valuenow": String(estado.paso),
          "aria-label": "Progreso"
        }, segs),
        el("p", { class: "progreso__texto" }, [
          el("span", { class: "progreso__num", text: "Paso " + estado.paso + " de 5" }),
          " ",
          el("span", { "aria-hidden": "true", text: "·" }),
          " ",
          el("span", { class: "progreso__nombre", text: NOMBRES_PASO[estado.paso - 1] })
        ])
      ])
    ]);
  }

  function renderApagado() {
    raiz.appendChild(el("section", { class: "tarjeta apagado" }, [
      el("div", { class: "tarjeta__cabeza" }, [el("h1", { class: "titulo", text: CFG.titulo })]),
      el("div", { class: "tarjeta__cuerpo" }, [
        el("p", { text: "Por ahora no estamos recibiendo prendas. Vuelve pronto." }),
        el("a", { class: "boton boton--oscuro boton--bloque", href: CFG.catalogoUrl, text: "Ir al catálogo" })
      ])
    ]));
  }

  function navegacion() {
    var nav = el("nav", { class: "navegacion", "aria-label": "Navegación de pasos" });
    if (estado.paso > 1) {
      nav.appendChild(el("button", {
        type: "button", class: "boton boton--borde-claro", text: "Atrás",
        onclick: function () { irA(estado.paso - 1); }
      }));
    }
    if (estado.paso < 5) {
      nav.appendChild(el("button", {
        type: "button", class: "boton boton--primario",
        text: estado.paso === 4 ? "Revisar" : "Siguiente",
        onclick: siguiente
      }));
    }
    return nav;
  }

  function irA(n) {
    estado.paso = n;
    render(true);
  }

  function siguiente() {
    var validar = [validarPaso1, validarPaso2, validarPaso3, validarPaso4][estado.paso - 1];
    if (validar && !validar()) return;
    if (estado.paso === 4) prepararRevision();
    irA(estado.paso + 1);
  }

  function mostrarAlerta(contenedor, tipo, msg) {
    var previa = contenedor.querySelector(".alerta[data-paso]");
    if (previa) previa.remove();
    if (!msg) return null;
    var a = el("div", { class: "alerta alerta--" + tipo, role: "alert", "data-paso": "1", text: msg });
    contenedor.appendChild(a);
    if (a.scrollIntoView) a.scrollIntoView({ block: "nearest" });
    return a;
  }

  function cuerpoActual() { return raiz.querySelector(".tarjeta__cuerpo"); }

  /* ================= Paso 1 · Reglas ================= */

  function paso1(c) {
    var lista = el("ol", { class: "reglas" });
    CFG.reglas.forEach(function (r) { lista.appendChild(el("li", { text: r })); });

    var check = el("input", { type: "checkbox", id: "acepto" });
    check.checked = estado.aceptado;
    check.addEventListener("change", function () {
      estado.aceptado = check.checked;
      estado.aceptadoEn = check.checked ? new Date().toISOString() : null;
      if (check.checked) mostrarAlerta(cuerpoActual(), "", null);
    });

    c.appendChild(el("div", { class: "paso" }, [
      el("h2", { tabindex: "-1", text: "Antes de empezar, lee las reglas" }),
      lista,
      el("p", { class: "nota-comision", text: "Comisión de Training Bazar: " + CFG.comision + "% del precio de venta de tu prenda" }),
      el("label", { class: "casilla", for: "acepto" }, [
        check,
        el("span", { text: "Leí y acepto las reglas de " + CFG.titulo })
      ])
    ]));
  }

  function validarPaso1() {
    if (estado.aceptado) return true;
    mostrarAlerta(cuerpoActual(), "error", "Para continuar, marca la casilla de que aceptas las reglas.");
    var ch = document.getElementById("acepto");
    if (ch) ch.focus();
    return false;
  }

  /* ================= Paso 2 · Tu prenda ================= */

  function paso2(c) {
    var form = el("div", { class: "paso" }, [
      el("h2", { tabindex: "-1", text: "Cuéntanos de tu prenda" }),
      el("p", { class: "paso__intro" }, [
        "Los campos con ",
        el("span", { class: "obligatorio", "aria-hidden": "true", text: "*" }),
        " son obligatorios."
      ])
    ]);

    camposVisibles().forEach(function (f) {
      var id = "campo-" + f.id;
      var valor = estado.datos[f.id] || "";
      var control;

      if (f.tipo === "lista-categorias" || f.tipo === "lista-estados") {
        var opciones = f.tipo === "lista-categorias" ? CFG.categorias : CFG.estados;
        control = el("select", { id: id, name: f.id });
        control.appendChild(el("option", { value: "", text: "Elige una opción" }));
        opciones.forEach(function (o) { control.appendChild(el("option", { value: o, text: o })); });
        control.value = opciones.indexOf(valor) >= 0 ? valor : "";
      } else if (f.tipo === "parrafo") {
        control = el("textarea", { id: id, name: f.id, rows: "4", maxlength: "800" });
        control.value = valor;
      } else if (f.tipo === "telefono") {
        control = el("input", {
          id: id, name: f.id, type: "tel", inputmode: "numeric",
          autocomplete: "tel-national", placeholder: "10 dígitos", maxlength: "20"
        });
        control.value = valor;
      } else {
        var auto = f.id === "nombre" ? "name" : (f.id === "ciudad" ? "address-level2" : "off");
        control = el("input", { id: id, name: f.id, type: "text", autocomplete: auto, maxlength: "120" });
        control.value = valor;
      }
      if (f.obligatorio) control.setAttribute("aria-required", "true");

      var evento = control.tagName === "SELECT" ? "change" : "input";
      control.addEventListener(evento, function () {
        estado.datos[f.id] = control.value;
        guardarBorrador();
        if (control.getAttribute("aria-invalid") === "true") limpiarError(control);
      });

      var label = el("label", { for: id }, [
        f.etiqueta,
        f.obligatorio ? el("span", { class: "obligatorio", "aria-hidden": "true", text: "*" }) : null,
        f.obligatorio ? el("span", { class: "solo-lector", text: " (obligatorio)" }) : null
      ]);

      form.appendChild(el("div", { class: "campo" }, [label, control]));
    });

    c.appendChild(form);
  }

  function ponerError(control, msg) {
    limpiarError(control);
    var errId = control.id + "-error";
    control.setAttribute("aria-invalid", "true");
    control.setAttribute("aria-describedby", errId);
    control.parentNode.appendChild(el("p", { class: "campo__error", id: errId, text: msg }));
  }

  function limpiarError(control) {
    control.removeAttribute("aria-invalid");
    control.removeAttribute("aria-describedby");
    var e = document.getElementById(control.id + "-error");
    if (e) e.remove();
  }

  function validarPaso2() {
    var primero = null;
    camposVisibles().forEach(function (f) {
      var control = document.getElementById("campo-" + f.id);
      if (!control) return;
      var v = (control.value || "").trim();
      var msg = null;
      if (f.obligatorio && !v) {
        msg = control.tagName === "SELECT" ? "Elige una opción." : "Este campo es obligatorio.";
      } else if (f.tipo === "telefono" && v && telefono10(v).length !== 10) {
        msg = "Escribe tu WhatsApp a 10 dígitos, sin espacios ni lada internacional.";
      }
      if (msg) {
        ponerError(control, msg);
        if (!primero) primero = control;
      } else {
        limpiarError(control);
      }
    });
    if (primero) {
      primero.focus();
      return false;
    }
    return true;
  }

  /* ================= Paso 3 · Fotos ================= */

  function rangoFotos() {
    return CFG.minFotos === CFG.maxFotos
      ? CFG.minFotos + " fotos"
      : "de " + CFG.minFotos + " a " + CFG.maxFotos + " fotos";
  }

  function paso3(c) {
    var lleno = estado.fotos.length >= CFG.maxFotos;
    var input = el("input", {
      type: "file", id: "fotos", accept: "image/*", multiple: true, class: "solo-lector",
      disabled: lleno
    });
    input.addEventListener("change", function () {
      var archivos = Array.prototype.slice.call(input.files || []);
      input.value = "";
      agregarFotos(archivos);
    });

    var contador = el("p", {
      class: "contador " + (estado.fotos.length >= CFG.minFotos ? "is-ok" : "is-falta"),
      "aria-live": "polite",
      text: estado.fotos.length + " de " + CFG.maxFotos + " fotos"
    });

    var grid = el("ul", { class: "miniaturas", "aria-label": "Fotos elegidas" });
    estado.fotos.forEach(function (f, i) {
      grid.appendChild(el("li", { class: "miniatura" }, [
        el("img", { src: f.url, alt: "Foto " + (i + 1) }),
        el("span", { class: "miniatura__num", "aria-hidden": "true", text: String(i + 1) }),
        el("button", {
          type: "button", class: "miniatura__quitar", "aria-label": "Quitar foto " + (i + 1),
          onclick: function () { quitarFoto(i); }
        }, [el("span", { "aria-hidden": "true", text: "×" })])
      ]));
    });

    c.appendChild(el("div", { class: "paso" }, [
      el("h2", { tabindex: "-1", text: "Elige " + rangoFotos() }),
      el("ul", { class: "consejos" }, [
        el("li", { text: "Frente y espalda de la prenda completa." }),
        el("li", { text: "Etiqueta de marca y etiqueta de talla." }),
        el("li", { text: "Detalles o defectos, si los tiene." }),
        el("li", { text: "Buena luz y fondo liso." })
      ]),
      el("p", { class: "alerta alerta--aviso", text: "Elígelas de tu galería; al final las mandarás por WhatsApp." }),
      input,
      el("label", { for: "fotos", class: "boton-fotos", "aria-disabled": lleno ? "true" : null }, [
        el("span", { "aria-hidden": "true", text: "📷" }),
        el("span", { text: lleno ? "Ya tienes el máximo de fotos" : (estado.fotos.length ? "Agregar más fotos" : "Elegir fotos") })
      ]),
      contador,
      estado.fotos.length ? grid : null,
      el("div", { id: "fotos-estado" })
    ]));
  }

  function comprimir(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var max = 1280;
        var w = img.naturalWidth, h = img.naturalHeight;
        var escala = Math.min(1, max / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * escala));
        var ch = Math.max(1, Math.round(h * escala));
        var canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob); else reject(new Error("toBlob"));
        }, "image/jpeg", 0.85);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("decode"));
      };
      img.src = url;
    });
  }

  function agregarFotos(archivos) {
    var imagenes = archivos.filter(function (f) { return !f.type || f.type.indexOf("image/") === 0; });
    var espacio = CFG.maxFotos - estado.fotos.length;
    var tomar = imagenes.slice(0, Math.max(0, espacio));
    var sobrantes = imagenes.length - tomar.length;
    var estadoBox = document.getElementById("fotos-estado");
    if (estadoBox) {
      estadoBox.textContent = "";
      estadoBox.appendChild(el("p", { class: "campo__ayuda", role: "status", text: "Preparando tus fotos…" }));
    }

    var fallidas = 0;
    var cadena = Promise.resolve();
    tomar.forEach(function (f) {
      cadena = cadena.then(function () {
        return comprimir(f).then(function (blob) {
          estado.fotos.push({ blob: blob, url: URL.createObjectURL(blob) });
        }, function () { fallidas++; });
      });
    });

    cadena.then(function () {
      estado.archivos = null;
      render(false);
      var c = cuerpoActual();
      var msgs = [];
      if (sobrantes > 0) msgs.push("Solo puedes elegir hasta " + CFG.maxFotos + " fotos; no se agregaron " + sobrantes + ".");
      if (fallidas > 0) msgs.push(fallidas === 1
        ? "Una foto no se pudo abrir. Prueba con otra o con una captura de pantalla."
        : fallidas + " fotos no se pudieron abrir. Prueba con otras o con capturas de pantalla.");
      if (msgs.length) mostrarAlerta(c, "aviso", msgs.join(" "));
    });
  }

  function quitarFoto(i) {
    var f = estado.fotos.splice(i, 1)[0];
    if (f) URL.revokeObjectURL(f.url);
    estado.archivos = null;
    render(false);
    var btns = raiz.querySelectorAll(".miniatura__quitar");
    var foco = btns[Math.min(i, btns.length - 1)] || raiz.querySelector(".boton-fotos");
    if (foco) foco.focus();
  }

  function validarPaso3() {
    var n = estado.fotos.length;
    if (n >= CFG.minFotos && n <= CFG.maxFotos) return true;
    var faltan = CFG.minFotos - n;
    mostrarAlerta(cuerpoActual(), "error",
      "Te " + (faltan === 1 ? "falta 1 foto" : "faltan " + faltan + " fotos") + ". Necesitas " + rangoFotos() + ".");
    var b = raiz.querySelector(".boton-fotos");
    if (b) b.focus();
    return false;
  }

  /* ================= Paso 4 · Precio ================= */

  function tarjetaComision(precio) {
    var r = calcular(precio);
    var vPrecio = el("strong", { "data-k": "precio", text: moneda(r.precio) });
    var vCom = el("strong", { "data-k": "comision", text: "−" + moneda(r.comision) });
    var vRec = el("strong", { "data-k": "recibes", text: moneda(r.recibes) });
    return el("div", { class: "comision", "aria-live": "polite" }, [
      el("div", { class: "comision__fila" }, [el("span", { text: "Precio de venta" }), vPrecio]),
      el("div", { class: "comision__fila" }, [el("span", { text: "Comisión Training Bazar (" + CFG.comision + "%)" }), vCom]),
      el("div", { class: "comision__fila comision__total" }, [el("span", { text: "Tú recibes" }), vRec])
    ]);
  }

  function actualizarComision(caja, precio) {
    var r = calcular(precio);
    caja.querySelector('[data-k="precio"]').textContent = moneda(r.precio);
    caja.querySelector('[data-k="comision"]').textContent = "−" + moneda(r.comision);
    caja.querySelector('[data-k="recibes"]').textContent = moneda(r.recibes);
  }

  function paso4(c) {
    var input = el("input", {
      id: "precio", type: "number", inputmode: "numeric", min: "1", step: "1",
      placeholder: "0", "aria-describedby": "precio-ayuda"
    });
    input.value = estado.precio;
    var caja = tarjetaComision(estado.precio);
    input.addEventListener("input", function () {
      estado.precio = input.value;
      guardarBorrador();
      actualizarComision(caja, input.value);
      if (input.getAttribute("aria-invalid") === "true") {
        limpiarError(input);
        input.setAttribute("aria-describedby", "precio-ayuda");
      }
    });

    c.appendChild(el("div", { class: "paso" }, [
      el("h2", { tabindex: "-1", text: "Pon tu precio" }),
      el("div", { class: "campo" }, [
        el("label", { for: "precio" }, [
          "Precio de venta que propones ($)",
          el("span", { class: "obligatorio", "aria-hidden": "true", text: "*" })
        ]),
        el("div", { class: "precio-input" }, [el("span", { "aria-hidden": "true", text: "$" }), input]),
        el("p", { class: "campo__ayuda", id: "precio-ayuda", text: "Es el precio que verá el cliente en el catálogo. Training Bazar puede sugerirte un ajuste." })
      ]),
      caja
    ]));
  }

  function validarPaso4() {
    var p = calcular(estado.precio).precio;
    if (p >= 1) return true;
    var input = document.getElementById("precio");
    if (input) {
      ponerError(input, "Escribe un precio mayor a $0.");
      input.focus();
    }
    return false;
  }

  /* ================= Paso 5 · Revisión y envío ================= */

  function prepararRevision() {
    if (!estado.folio) estado.folio = generarFolio();
    if (!estado.aceptadoEn) estado.aceptadoEn = new Date().toISOString();
    // Los archivos se crean antes del clic para poder llamar a navigator.share sin esperar nada.
    estado.archivos = estado.fotos.map(function (f, i) {
      var nombre = estado.folio + "-" + (i + 1) + ".jpg";
      try { return new File([f.blob], nombre, { type: "image/jpeg", lastModified: Date.now() }); }
      catch (e) { var b = f.blob; b.name = nombre; return b; }
    });
    estado.enviado = false;
    estado.guiaFotos = false;
  }

  function valorCampo(f) {
    var v = (estado.datos[f.id] || "").trim();
    if (f.tipo === "telefono" && v) return telefono10(v);
    return v;
  }

  function armarMensaje() {
    var r = calcular(estado.precio);
    var lineas = [];
    lineas.push("Hola Training Bazar 👋 Quiero vender una prenda con " + CFG.titulo + ".");
    lineas.push("Folio: " + estado.folio);
    lineas.push("");
    camposVisibles().forEach(function (f) {
      var v = valorCampo(f);
      if (!v) return;
      lineas.push("• " + etiquetaCorta(f.etiqueta) + ": " + v.replace(/\s*\n\s*/g, " / "));
    });
    lineas.push("");
    lineas.push("💰 Precio de venta que propongo: " + moneda(r.precio));
    lineas.push("➖ Comisión Training Bazar (" + CFG.comision + "%): " + moneda(r.comision));
    lineas.push("✅ Recibiría: " + moneda(r.recibes));
    lineas.push("");
    lineas.push("📸 Fotos: " + estado.fotos.length + " (te las mando enseguida en este chat 👇)");
    lineas.push("✔️ Leí y acepto las reglas (" + fechaHora(new Date(estado.aceptadoEn)) + ").");
    return lineas.join("\n");
  }

  function miniaturasChicas() {
    var g = el("ul", { class: "miniaturas miniaturas--chicas", "aria-label": "Tus fotos" });
    estado.fotos.forEach(function (f, i) {
      g.appendChild(el("li", { class: "miniatura" }, [
        el("img", { src: f.url, alt: "Foto " + (i + 1) }),
        el("span", { class: "miniatura__num", "aria-hidden": "true", text: String(i + 1) })
      ]));
    });
    return g;
  }

  function paso5(c) {
    if (!estado.archivos) prepararRevision();

    var resumen = el("dl", { class: "resumen" });
    camposVisibles().forEach(function (f) {
      var v = valorCampo(f);
      if (!v) return;
      resumen.appendChild(el("div", {}, [el("dt", { text: f.etiqueta }), el("dd", { text: v })]));
    });

    var waUrl = "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(armarMensaje());
    var bloqueDatos = el("section", { class: "bloque-envio", "aria-labelledby": "envio-1" }, [
      el("h3", { id: "envio-1" }, [el("span", { class: "bloque-envio__num", "aria-hidden": "true", text: "1" }), "Envía tus datos"]),
      el("a", {
        class: "boton boton--whatsapp boton--bloque", href: waUrl, target: "_blank", rel: "noopener",
        onclick: marcarEnviado
      }, [el("span", { "aria-hidden": "true", text: "💬" }), "Enviar por WhatsApp"])
    ]);

    var bloqueFotos = el("section", { class: "bloque-envio", id: "bloque-fotos", "aria-labelledby": "envio-2" });
    llenarBloqueFotos(bloqueFotos);

    c.appendChild(el("div", { class: "paso" }, [
      el("h2", { tabindex: "-1", text: "Revisa y envía" }),
      miniaturasChicas(),
      el("p", { class: "folio", text: "Folio " + estado.folio }),
      resumen,
      tarjetaComision(estado.precio),
      el("p", { class: "aceptado", text: "✓ Aceptaste las reglas el " + fechaHora(new Date(estado.aceptadoEn)) }),
      bloqueDatos,
      bloqueFotos,
      el("div", { id: "listo" })
    ]));

    if (estado.enviado) mostrarListo();
  }

  function llenarBloqueFotos(b) {
    var n = estado.fotos.length;
    b.textContent = "";
    b.appendChild(el("h3", { id: "envio-2" }, [
      el("span", { class: "bloque-envio__num", "aria-hidden": "true", text: "2" }), "Envía tus fotos"
    ]));

    if (estado.guiaFotos) {
      var guia = el("ol", { class: "guia" }, [
        el("li", { text: "En el chat que se abrió, toca 📎 (Android) o + (iPhone)." }),
        el("li", { text: "Elige Galería o Fotos." }),
        el("li", { text: "Selecciona estas " + n + " fotos y toca Enviar." })
      ]);
      b.appendChild(guia);
      b.appendChild(miniaturasChicas());
      return;
    }

    b.appendChild(el("button", {
      type: "button", class: "boton boton--whatsapp boton--bloque", onclick: compartirFotos
    }, [el("span", { "aria-hidden": "true", text: "📸" }), "Enviar mis " + n + " fotos"]));
    b.appendChild(el("p", { class: "bloque-envio__nota", text: "Elige WhatsApp y el chat de Training Bazar" }));
  }

  function mostrarGuia() {
    estado.guiaFotos = true;
    var b = document.getElementById("bloque-fotos");
    if (b) {
      llenarBloqueFotos(b);
      var h = b.querySelector("h3");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus(); }
    }
  }

  function compartirFotos() {
    var files = estado.archivos || [];
    var puede = false;
    try {
      puede = !!(navigator.canShare && navigator.share && files.length && navigator.canShare({ files: files }));
    } catch (e) { puede = false; }

    marcarEnviado();

    if (!puede) { mostrarGuia(); return; }

    // Se llama directamente dentro del clic, sin await previo.
    navigator.share({ files: files }).catch(function (err) {
      if (err && err.name === "AbortError") return;
      mostrarGuia();
    });
  }

  function marcarEnviado() {
    estado.enviado = true;
    mostrarListo();
  }

  function mostrarListo() {
    var caja = document.getElementById("listo");
    if (!caja || caja.childNodes.length) return;
    caja.appendChild(el("div", { class: "listo", role: "status" }, [
      el("p", { text: "¡Listo! Te contestaremos por WhatsApp cuando revisemos tu prenda." }),
      el("a", { class: "boton boton--secundario boton--bloque", href: CFG.catalogoUrl, text: "Volver al catálogo" })
    ]));
  }

  /* ================= Inicio ================= */

  if (CFG.titulo) document.title = CFG.titulo;
  avisoNavegadorApp();
  leerBorrador();
  render(false);
})();
