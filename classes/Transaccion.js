
class Transaccion {
    id;
    tipo;
    descripcion;
    monto;
    categoria;

    static info = [];

    constructor(id, tipo, descripcion, monto, categoria) {
        this.id = id;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.monto;
        this.categoria = categoria;
    }
}

export default Transaccion;