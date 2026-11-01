class Transaccion {
    id;
    tipo;
    descripcion;
    monto;
    categoria;
    fecha;

    static historial = [];

    constructor(id, tipo, descripcion, monto, categoria, fecha) {
        this.id = id;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.monto = monto;
        this.categoria = categoria;
        this.fecha = fecha;
    }
}

export default Transaccion;