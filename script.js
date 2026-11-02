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

const tbody = document.getElementById("tbody");
const itemResumen = document.getElementById("itemResumen");

const CLAVE_STORAGE = "historial-finanzas";

// Formateos
const formatearMonto = (n) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const formatearFecha = (f) =>
    f.split("-").reverse().join("/");

// Renderizado de la tabla
const renderizarTabla = () => {
    tbody.innerHTML = Transaccion.historial.map((t) => {
        const esIngreso = t.tipo === "ingreso";
        const color = esIngreso ? "text-green-600" : "text-red-600";
        const signo = esIngreso ? "+" : "-";

        return `
            <tr class="border-b">
                <td class="py-2 px-2">${t.descripcion}</td>
                <td class="py-2 px-2 capitalize">${t.categoria}</td>
                <td class="py-2 px-2">${formatearFecha(t.fecha)}</td>
                <td class="py-2 px-2 text-right font-semibold ${color}">${signo} ${formatearMonto(t.monto)}</td>
                <td class="py-2 px-2 text-center">
                    <button data-id="${t.id}" class="text-gray-400 hover:text-red-600" aria-label="Eliminar"><i class="fa-solid fa-trash"></i></button>
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
    balanceNeto.className = neto >= 0 ? "text-2xl font-semibold text-green-600" : "text-2xl font-semibold text-red-600";
};

// Renderizar Resumen
const renderizarResumen = () => {
    const porCategoria = {};

    Transaccion.historial.forEach((t) => {
        const signado = t.tipo === "ingreso" ? t.monto : -t.monto;
        porCategoria[t.categoria] = (porCategoria[t.categoria] ?? 0) + signado;
    });

    itemResumen.innerHTML = Object.entries(porCategoria).map(([categoria, monto]) => `
        <li class="flex justify-between py-1 border-b">
            <span class="capitalize">${categoria}</span>
            <span class="font-semibold ${monto >= 0 ? "text-green-600" : "text-red-600"}">${formatearMonto(monto)}</span>
        </li>`).join("");
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

const actualizar = () => {
    renderizarTabla();
    calcularBalance();
    renderizarResumen();
    guardarHistorial();
};

formTransaccion.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = Date.now();
    const tipo = selectTipo.value;
    const descripcion = inputDescripcion.value;
    const monto = Number(inputMonto.value);
    const categoria = selectCategoria.value;
    const fecha = inputFecha.value;

    Transaccion.historial.push(new Transaccion(id, tipo, descripcion, monto, categoria, fecha));

    actualizar();
    formTransaccion.reset();
    inputDescripcion.focus();
});

// Eliminación de un registro
tbody.addEventListener("click", (e) => {
    const boton = e.target.closest("button[data-id]");
    if (!boton) return;

    const id = Number(boton.dataset.id);
    Transaccion.historial = Transaccion.historial.filter((t) => t.id !== id);
    actualizar();
});

cargarHistorial();
actualizar();