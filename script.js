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

formTransaccion.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = Date.now();
    const tipo = selectTipo.value;
    const descripcion = inputDescripcion.value;
    const monto = Number(inputMonto.value);
    const categoria = selectCategoria.value;
    const fecha = inputFecha.value;

    const transaccion = new Transaccion(id, tipo, descripcion, monto, categoria, fecha);
    
    Transaccion.historial.push(transaccion);

    formTransaccion.reset();
    inputDescripcion.focus();
});