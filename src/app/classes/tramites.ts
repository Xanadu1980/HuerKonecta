export class Tramites {
    _id: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    fecha: string;
    startTime: string;
    endTime: string;
    status: string;
    idUser: any;

    constructor(_id: string, nombre: string, descripcion: string, tipo: string,
    			fecha: string, startTime: string, endTime: string, status: string) {
      this._id = _id;
      this.nombre = nombre;
      this.descripcion = descripcion;
      this.tipo = tipo;
      this.fecha = fecha;
      this.startTime = startTime;
      this.endTime = endTime;
      this.status = status;
    }
} 