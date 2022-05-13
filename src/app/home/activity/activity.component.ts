import { Component, OnInit, ElementRef, AfterViewInit, Renderer2} from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { UsersService } from '../../users/users.service';
import { Actividad } from "../../classes/actividad";
import { isNullOrUndefined } from 'util';
import { Router, ActivatedRoute } from '@angular/router';
import $ from 'jquery';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {

	public propertyForm: FormGroup;
	public closeResult: string;
	public modalReference: any;
	public modalReference2: any;
	public username : any;
	public role : any;
	public activity : any;
	public actividades : Actividad[] = []
	public part : any = 5;

	public nombrePut : any;
	public descripcionPut : any;
	public tipoPut : any;
	public fechaPut : any;
	public startTimePut : any;
	public endTimePut : any;
	public idPut : any;
	public status : any = [{'nombre' : 'En Progreso'}, {'nombre' : 'Hecho'}, {'nombre' : 'Archivado'}]
	public estado: any;
	public getStatusGlobal : any = '';

	public cantidadTodos : number;
	public cantidadHechos : number;
	public cantidadEnProgreso : number;
	public cantidadArchivado : number;


	constructor(private modalService: NgbModal, private modalService2: NgbModal, private _formBuilder: FormBuilder, 
				  private service: UsersService, private service2: UsersService, private router: Router) {}

	ngOnInit() {

		this.username = localStorage.getItem('username');
		this.role = localStorage.getItem('role');
		this.createForm();
		this.getActividad();
	}

	open(content, id : any, description : any) {
		this.idPut = id;
		this.descripcionPut = description;

		this.modalReference = this.modalService.open(content, { size: 'lg', centered: true});

		this.modalReference.result.then((result) => {
		  this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
		  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});
	}

	editActivity(content, id : any, nombre : any, descripcion : any, 
				tipo : any, fecha : any, startTime : any, endTime : any, status: any){

		this.modalReference2.close();

		this.idPut = id;
		this.nombrePut = nombre;
		this.descripcionPut = descripcion;
		this.tipoPut = tipo;
		this.fechaPut = fecha;
		this.startTimePut = startTime;
		this.endTimePut = endTime;
		this.estado = status;

		this.modalReference = this.modalService.open(content, { size: 'lg', centered: true});

		this.modalReference.result.then((result) => {
		  this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
			this.limpiarInputDescription();
		  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});

	}

	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
		  return 'by pressing ESC';
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
		  return 'by clicking on a backdrop';
		} else {
		  return  `with: ${reason}`;
		}
	}

	public getDateToday(): string{

		var hoy = new Date();
		var fecha = hoy.getFullYear() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getDate();

		if(hoy.getMinutes() < 10){
			var hora = hoy.getHours() + ':0' + hoy.getMinutes() + ':' + hoy.getSeconds();
		}else{
			var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
		}

		var now = fecha + ' ' + hora;

		console.log(now);

		return now;
	}

	getActividad(status: string = ''){

		this.getStatusGlobal = status;

		let data = {
			"status": status
		};

		this.service.postUrl('actividades/part/{cont}', data, [this.part])
		.then(data => { 

			console.log(data);
			this.actividades = data;

			for (var i = 0; i < this.actividades.length; ++i) {
				this.actividades[i].fecha = this.actividades[i].fecha.split("T")[0];
			}

			this.getCantidadPorActividades();
		})
		.catch(data =>{});
	}

	public getCantidadPorActividades(){
			this.service.getUrl('actividades/cantidadPorStatus')
	    .then(data => { 
	    	console.log(data);

	    	this.cantidadTodos = data.todos;
	    	this.cantidadHechos = data.cantidadHechos;
	    	this.cantidadEnProgreso = data.cantidadEnProgreso;
	    	this.cantidadArchivado = data.cantidadArchived;

	    })
	    .catch(data =>{});
	}

	public limpiarInputDescription(){
		this.propertyForm.get('Nombre').setValue("");
		this.propertyForm.get('Descripcion').setValue("");
		this.propertyForm.get('Tipo').setValue("");
		this.propertyForm.get('Fecha').setValue("");
		this.propertyForm.get('StartTime').setValue("");
		this.propertyForm.get('EndTime').setValue("");
	}

	public getCookie(cname) {
		let name = cname + "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');
		for(let i = 0; i <ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

	setActividad(){

		let time = this.getDateToday();

		let data = {
			"nombre": this.propertyForm.get('Nombre').value,
			"descripcion": this.propertyForm.get('Descripcion').value,
			"tipo": this.propertyForm.get('Tipo').value,
			"fecha": this.propertyForm.get('Fecha').value,
			"startTime": this.propertyForm.get('StartTime').value,
			"endTime": this.propertyForm.get('EndTime').value,
			"createBy": this.username,
			"time": time,
			"status": "En progreso"
		};

		$('#button_agendar').html("<li class='fa fa-spinner fa-spin fa-1x'> </li>");

		this.service.postUrl('actividades', data)
		.then(response => {

				$('#button_agendar').html("Agendar");

				if(response._id !== undefined){
					this.modalReference.close();
					this.getActividad(this.getStatusGlobal);
					this.limpiarInputDescription();
				}

	    })
	    .catch(data =>{
	    		$('#button_agendar').html("Agendar");
	        console.log(data.error)
	    });
	}

	putActividad(id){

		let time = this.getDateToday();

		let data = {
			"nombre": this.nombrePut,
			"descripcion": this.descripcionPut,
			"tipo": this.tipoPut,
			"fecha": this.fechaPut,
			"startTime": this.startTimePut,
			"endTime": this.endTimePut,
			"time": time,
			"status": this.estado
		};

		$('#button_cambiar').html("<li class='fa fa-spinner fa-spin fa-1x'> </li>");

		this.service.putUrl('actividades/{id}', data, [id])
		.then(response => {
				$('#button_cambiar').html("Cambiar");
				if(response._id !== undefined){
					this.modalReference.close();
					this.getActividad(this.getStatusGlobal);
					this.limpiarInputDescription();
				}
	    })
	    .catch(data =>{

	    		$('#button_cambiar').html("Cambiar");
	        console.log(data.error)
	    });
	}

	changeActividad(id, status){

		let data = {
			"status": status
		};

		this.service.putUrl('actividades/status/{id}', data, [id])
		.then(data => { 
	    	this.getActividad(this.getStatusGlobal); 
	    	this.modalReference2.close();
	    })
	    .catch(data =>{});
	}

	deleteActividad(id){

		this.service.deleteUrl('actividades/{id}', [id])
		.then(data => { 
	    	this.getActividad(this.getStatusGlobal); 
	    	this.modalReference2.close();
	    })
	    .catch(data =>{});
	}

	createForm() {
	    this.propertyForm = this._formBuilder.group({
	    	Nombre: ['', Validators.required],
	    	Descripcion: ['', Validators.required],
	    	Tipo: ['', Validators.required],
	    	Fecha: ['', Validators.required],
	    	StartTime: ['', Validators.required],
	    	EndTime: ['', Validators.required]
	    });
	}

	verActividad(content, data : any){
		this.activity = data;

		this.modalReference2 = this.modalService2.open(content, { size: 'lg', centered: true });

		this.modalReference2.result.then((result) => {
		  this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
		  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});
	}

	public moverTipoActividad(status: string = ''){
		this.part = 5;
		this.getActividad(status);
	}

	public masActividades(){
		this.part = this.part + 5;
		this.getActividad(this.getStatusGlobal);
	}

}
