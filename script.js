import Transaccion from "./classes/Transaccion.js"

const ingresosTotales = document.getElementById("ingresos-totales");
const gastosTotales = document.getElementById("gastos-totales");
const balanceNeto = document.getElementById("balance-neto");

const formTransaccion = document.getElementById("form-transaccion");
const inputDescripcion = document.getElementById("descripcion");
const inputMonto = document.getElementById("monto");
const selectTipo = document.getElementById("tipo");
const selectCategoria = document.getElementById("categoria");
const inputFecha = document.getElementById("fecha");
const inputNuevaCategoria = document.getElementById("nueva-categoria");
const btnCategoria = document.getElementById("btn-categoria");
const btnCancelar = document.getElementById("btn-cancelar");
const textoBtnAgregar = document.getElementById("texto-btn-agregar");
const modalEliminar = document.getElementById("modal-eliminar");
const modalDescripcion = document.getElementById("modal-descripcion");
const btnModalConfirmar = document.getElementById("modal-confirmar");
const btnModalCancelar = document.getElementById("modal-cancelar");
const etiquetaTipoCategoria = document.getElementById("tipo-categoria");

const tbody = document.getElementById("tbody");
const canvasCategorias = document.getElementById("grafico-categorias");
const canvasEvolucion = document.getElementById("grafico-evolucion");

const CLAVE_STORAGE = "historial-finanzas";
const CLAVE_CATEGORIAS = "categorias-finanzas";

// Categorías por tipo (valores iniciales; el usuario puede agregar más)
const CATEGORIAS_INICIALES = {
    ingreso: ["sueldo", "otros"],
    gasto: ["comida", "transporte", "ocio", "otros"]
};
let categorias = structuredClone(CATEGORIAS_INICIALES);

// Formateos
const formatearMonto = (n) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const formatearFecha = (f) =>
    f.split("-").reverse().join("/");

// Renderizado de la tabla
const renderizarTabla = () => {
    tbody.innerHTML = Transaccion.historial.map((t) => {
        const esIngreso = t.tipo === "ingreso";
        const color = esIngreso ? "text-emerald-600" : "text-rose-600";
        const signo = esIngreso ? "+" : "-";

        return `
            <tr class="hover:bg-slate-50 transition">
                <td class="px-6 py-3 font-medium text-slate-700">${t.descripcion}</td>
                <td class="px-3 py-3 capitalize text-slate-500">${t.categoria}</td>
                <td class="px-3 py-3 text-slate-500">${formatearFecha(t.fecha)}</td>
                <td class="px-3 py-3 text-right font-semibold whitespace-nowrap ${color}">${signo} ${formatearMonto(t.monto)}</td>
                <td class="px-6 py-3 text-center">
                    <button data-editar="${t.id}" class="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-2 transition" aria-label="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button data-id="${t.id}" class="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-2 transition" aria-label="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
    }).join("");
};

// Calcular balance
const calcularBalance = () => {
    const sumar = (tipo) => Transaccion.historial
        .filter((t) => t.tipo === tipo)
        .reduce((acc, t) => acc + t.monto, 0);

    const ingresos = sumar("ingreso");
    const gastos = sumar("gasto");
    const neto = ingresos - gastos;

    ingresosTotales.textContent = formatearMonto(ingresos);
    gastosTotales.textContent = formatearMonto(gastos);
    balanceNeto.textContent = formatearMonto(neto);
    balanceNeto.className = `text-2xl font-bold truncate ${neto >= 0 ? "text-slate-800" : "text-rose-600"}`;
};

// Gráficos (Chart.js)
const COLOR_INGRESO = "#059669"; // emerald-600
const COLOR_GASTO = "#e11d48";   // rose-600
const COLOR_BALANCE = "#4f46e5"; // indigo-600

const opcionesMonto = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatearMonto(ctx.parsed.y)}` } }
    },
    scales: { y: { ticks: { callback: (v) => formatearMonto(v) } } }
};

const graficoCategorias = new Chart(canvasCategorias, {
    type: "bar",
    data: { labels: [], datasets: [{ label: "Total por categoría", data: [], backgroundColor: [], borderRadius: 6 }] },
    options: { ...opcionesMonto, plugins: { ...opcionesMonto.plugins, legend: { display: false } } }
});

const graficoEvolucion = new Chart(canvasEvolucion, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            { label: "Ingresos", data: [], borderColor: COLOR_INGRESO, backgroundColor: COLOR_INGRESO, tension: 0.25 },
            { label: "Egresos", data: [], borderColor: COLOR_GASTO, backgroundColor: COLOR_GASTO, tension: 0.25 },
            { label: "Balance neto", data: [], borderColor: COLOR_BALANCE, backgroundColor: COLOR_BALANCE, borderDash: [6, 4], tension: 0.25 }
        ]
    },
    options: { ...opcionesMonto, interaction: { mode: "index", intersect: false } }
});

const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const renderizarGraficoCategorias = () => {
    const porCategoria = {};
    Transaccion.historial.forEach((t) => {
        const signado = t.tipo === "ingreso" ? t.monto : -t.monto;
        porCategoria[t.categoria] = (porCategoria[t.categoria] ?? 0) + signado;
    });

    const entradas = Object.entries(porCategoria);
    graficoCategorias.data.labels = entradas.map(([c]) => capitalizar(c));
    graficoCategorias.data.datasets[0].data = entradas.map(([, m]) => m);
    graficoCategorias.data.datasets[0].backgroundColor = entradas.map(([, m]) => m >= 0 ? COLOR_INGRESO : COLOR_GASTO);
    graficoCategorias.update();
};

// Ingresos y egresos acumulados por fecha; el balance neto es su diferencia
const renderizarGraficoEvolucion = () => {
    const porFecha = {};
    Transaccion.historial.forEach((t) => {
        porFecha[t.fecha] ??= { ingreso: 0, gasto: 0 };
        porFecha[t.fecha][t.tipo] += t.monto;
    });

    const fechas = Object.keys(porFecha).sort();
    let ingresos = 0, gastos = 0;
    const serieIngresos = [], serieGastos = [], serieBalance = [];

    fechas.forEach((f) => {
        ingresos += porFecha[f].ingreso;
        gastos += porFecha[f].gasto;
        serieIngresos.push(ingresos);
        serieGastos.push(gastos);
        serieBalance.push(ingresos - gastos);
    });

    graficoEvolucion.data.labels = fechas.map(formatearFecha);
    graficoEvolucion.data.datasets[0].data = serieIngresos;
    graficoEvolucion.data.datasets[1].data = serieGastos;
    graficoEvolucion.data.datasets[2].data = serieBalance;
    graficoEvolucion.update();
};

// LocalStorage
const guardarHistorial = () =>
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(Transaccion.historial));

const cargarHistorial = () => {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_STORAGE)) ?? [];
    Transaccion.historial = guardado.map(
        (t) => new Transaccion(t.id, t.tipo, t.descripcion, t.monto, t.categoria, t.fecha)
    );
};

const guardarCategorias = () =>
    localStorage.setItem(CLAVE_CATEGORIAS, JSON.stringify(categorias));

const cargarCategorias = () => {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CATEGORIAS));
    if (guardado?.ingreso && guardado?.gasto) categorias = guardado;
};

// Muestra en el select solo las categorías del tipo elegido
const renderizarCategorias = () => {
    const tipo = selectTipo.value;
    selectCategoria.replaceChildren(...categorias[tipo].map((c) => {
        const opcion = new Option(capitalizar(c), c);
        return opcion;
    }));
    etiquetaTipoCategoria.textContent = `(${tipo === "ingreso" ? "ingresos" : "gastos"})`;
};

const agregarCategoria = () => {
    const nombre = inputNuevaCategoria.value.trim().toLowerCase();
    if (!nombre) return;

    const tipo = selectTipo.value;
    if (!categorias[tipo].includes(nombre)) {
        categorias[tipo].push(nombre);
        guardarCategorias();
    }
    renderizarCategorias();
    selectCategoria.value = nombre;
    inputNuevaCategoria.value = "";
};

const actualizar = () => {
    renderizarTabla();
    calcularBalance();
    renderizarGraficoCategorias();
    renderizarGraficoEvolucion();
    guardarHistorial();
};

// Id del movimiento que se está editando (null = alta de uno nuevo)
let idEditando = null;

const salirDeEdicion = () => {
    idEditando = null;
    formTransaccion.reset();
    renderizarCategorias();
    textoBtnAgregar.textContent = "Agregar movimiento";
    btnCancelar.hidden = true;
};

formTransaccion.addEventListener("submit", (e) => {
    e.preventDefault();
    const tipo = selectTipo.value;
    const descripcion = inputDescripcion.value;
    const monto = Number(inputMonto.value);
    const categoria = selectCategoria.value;
    const fecha = inputFecha.value;

    if (idEditando !== null) {
        // Reemplaza el registro en su lugar, conservando su id
        Transaccion.historial = Transaccion.historial.map((t) =>
            t.id === idEditando ? new Transaccion(t.id, tipo, descripcion, monto, categoria, fecha) : t
        );
    } else {
        Transaccion.historial.push(new Transaccion(Date.now(), tipo, descripcion, monto, categoria, fecha));
    }

    actualizar();
    salirDeEdicion();
    inputDescripcion.focus();
});

btnCancelar.addEventListener("click", salirDeEdicion);

// Editar o eliminar un registro
tbody.addEventListener("click", (e) => {
    const botonEditar = e.target.closest("button[data-editar]");
    if (botonEditar) {
        const t = Transaccion.historial.find((x) => x.id === Number(botonEditar.dataset.editar));
        if (!t) return;

        idEditando = t.id;
        selectTipo.value = t.tipo;
        renderizarCategorias();
        inputDescripcion.value = t.descripcion;
        inputMonto.value = t.monto;
        selectCategoria.value = t.categoria;
        inputFecha.value = t.fecha;
        textoBtnAgregar.textContent = "Guardar cambios";
        btnCancelar.hidden = false;
        formTransaccion.scrollIntoView({ behavior: "smooth", block: "center" });
        inputDescripcion.focus();
        return;
    }

    const boton = e.target.closest("button[data-id]");
    if (!boton) return;

    const t = Transaccion.historial.find((x) => x.id === Number(boton.dataset.id));
    if (!t) return;

    idAEliminar = t.id;
    modalDescripcion.textContent = `"${t.descripcion}"`;
    modalEliminar.showModal();
});

// Modal de confirmación
let idAEliminar = null;

btnModalConfirmar.addEventListener("click", () => {
    Transaccion.historial = Transaccion.historial.filter((t) => t.id !== idAEliminar);
    if (idAEliminar === idEditando) salirDeEdicion();
    idAEliminar = null;
    modalEliminar.close();
    actualizar();
});

btnModalCancelar.addEventListener("click", () => modalEliminar.close());

// Cierra también al hacer clic en el fondo oscuro
modalEliminar.addEventListener("click", (e) => {
    if (e.target === modalEliminar) modalEliminar.close();
});

selectTipo.addEventListener("change", renderizarCategorias);
btnCategoria.addEventListener("click", agregarCategoria);
inputNuevaCategoria.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        agregarCategoria();
    }
});

cargarCategorias();
renderizarCategorias();
cargarHistorial();
actualizar();