import { Component, OnInit, ElementRef, AfterViewInit, Renderer2} from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { UsersService } from '../../users/users.service';
import { Publicacion } from "../../classes/publicacion";
import { Usuario } from "../../classes/usuario";
import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { HttpClient , HttpHeaders} from  '@angular/common/http';
import { NgxImageCompressService } from 'ngx-image-compress';
import $ from 'jquery';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  
  public propertyForm: FormGroup;
  public closeResult: string;
  public modalReference: any;
  public username : any;
  public role : any;
  public descriptionPut : any;
  public idPut : any;
  public imagePut : any;
  public publicaciones : Publicacion[] = [];
  public usuarios : Usuario[] = []
  public archivo : any = [];
  public part : any = 5;
  public urlPreview : any = '';

  constructor(private modalService: NgbModal, private _formBuilder: FormBuilder, 
  			  private service: UsersService, private router: Router, private  httpClient:  HttpClient,
  			  private imageCompress: NgxImageCompressService) {
	}

	ngOnInit() {

		this.username = localStorage.getItem('username');
		this.role = localStorage.getItem('role');
			
		this.createForm();
	  this.getPublicacion();

	  const onScroll = () => {

	   if(this.part <= this.publicaciones.length){
			 if (document.body.scrollHeight - window.innerHeight - 500 <= window.scrollY) {
			   // hacer fetch
			   console.log('estoy en el final del scroll')
			   this.masPublicaciones();
			 }
		 }

		}

		window.addEventListener('scroll', onScroll)
	}

	open(content, id : any, description : any, imagen : any) {
	  this.idPut = id;
	  this.descriptionPut = description;

	  if(imagen !== undefined && imagen !== ''){
	  	this.urlPreview = imagen;
	  }

	  this.modalReference = this.modalService.open(content, { size: 'lg', centered: true});

	  this.modalReference.result.then((result) => {
		  this.closeResult = `Closed with: ${result}`;
	  }, (reason) => {
	  	this.clickEliminarImagen();
	  	this.limpiarInputDescription();
		  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
	  });
	}

	openImage(content, id : any, image : any, description : any){
		this.idPut = id;
		this.imagePut = image;
	  this.descriptionPut = description;

	  this.modalReference = this.modalService.open(content, { size: 'lg', centered: true });

	  this.modalReference.result.then((result) => {
		  this.closeResult = `Closed with: ${result}`;
	  }, (reason) => {
	  	this.clickEliminarImagen();
		  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
	  });
	}

	public getHeightImagePost(id): any{
			return $('#imagen-post-'+id).height();
	}

	public getWidthImagePost(id): any{
			return $('#imagen-post-'+id).width();
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

  public capturarImagen(event){
    var  fileName : any;
    const archivoEncontrado = event.target.files[0];
    this.archivo = archivoEncontrado;

    fileName = this.archivo['name'];

    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = (event: ProgressEvent) => {
        this.urlPreview = (<FileReader>event.target).result;
        this.compressFile(this.urlPreview, fileName)
      }

      reader.readAsDataURL(event.target.files[0]);
    }
  }

  public compressFile(image, fileName) {
        var orientation = -1;

        console.warn('Size in bytes is now:',  this.imageCompress.byteCount(image)/(1024*1024));
        
        this.imageCompress.compressFile(image, orientation, 50, 50).then(
        result => {
            this.urlPreview = result;
            
            console.warn('Size in bytes after compression:',  this.imageCompress.byteCount(result)/(1024*1024));
            // create file from byte
            const imageName = fileName;
            
            // call method that creates a blob from dataUri
            // const imageBlob = this.dataURItoBlob(this.urlPreview.split(',')[1]);

            //imageFile created below is the new compressed file which can be send to API in form data
            this.archivo = new File([result], imageName, { type: 'image/jpeg' });
        });

  }

  public clickInsertarImagen(){
    $('#imagen').click();
  }

  public clickInsertarImagenPut(){
    $('#imagenPut').click();
  }

  public clickEliminarImagen(){

  	var inputImage = <HTMLInputElement> document.getElementById('imagen');
  	var inputImagePut = <HTMLInputElement> document.getElementById('imagenPut');

  	if(inputImage !== null){
  		 inputImage.value = '';
  	}	

  	if(inputImagePut !== null){
  		 inputImagePut.value = '';
  	}

  	this.archivo = [];
  	this.urlPreview = '';
  }

  public limpiarInputDescription(){
  	this.propertyForm.get('Descripcion').setValue("");
  }

	private getDateToday(): string{

		var hoy = new Date();
		var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear();

		if(hoy.getMinutes() < 10){
			var hora = hoy.getHours() + ':0' + hoy.getMinutes() + ':' + hoy.getSeconds();
		}else{
			var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
		}

		var now = fecha + ' ' + hora;

		console.log(now);

		return now;
	}

	public getPublicacion(){

		$('#spinner').show();

		this.service.getUrl('publicaciones/part/{cont}', [this.part])
	    .then(data => { 
	    	
	    	this.service.getUrl('users')
	    	.then(data2 => { 
	    		$('#spinner').hide();
					
					this.publicaciones = data;
					this.usuarios = data2;

					for(var i=0; i < this.usuarios.length; i++){
						for(var j=0; j < this.publicaciones.length; j++){
							if(this.usuarios[i].username == this.publicaciones[j].idUser){
								this.publicaciones[j].avatar = this.usuarios[i].avatar;
							}
						}
					}

					//this.publicaciones.sort().reverse();
					
				})
				.catch(data =>{});
	    
	    })
	    .catch(data =>{});
	}

	public setPublicaciones(){

		let time = this.getDateToday();

		if(this.urlPreview !== '' && !this.empty(this.archivo)){
			const formularioImagen = new FormData();
	    formularioImagen.append('file', this.archivo);
	    formularioImagen.append('upload_preset', 'imagen');

	    $('#publicar_button').html("<li class='fa fa-spinner fa-spin fa-1x'> </li>");
	    this.httpClient.post(`https://api.cloudinary.com/v1_1/inversiones-jr/image/upload`, formularioImagen).subscribe( 
	    (response: any) => {

	    			console.log(response)

						let data = {
							"descripcion": this.propertyForm.get('Descripcion').value,
							"idUser": localStorage.getItem('username'),
							"time" : time,
							"imagen" : response.secure_url,
							"imagen_public_id" : response.public_id
						};

						$('#publicar_button').html("Publicar");

						this.service.postUrl('publicaciones', data)
						.then(response => {
							console.log(response._id)
									if(response._id !== undefined){
										this.messageSuccessfully("Se ha creado una publicación.");
										this.modalReference.close();
										this.getPublicacion();
										this.clickEliminarImagen();
	  									this.limpiarInputDescription();
									}
					    })
					    .catch(data =>{
					        console.log(data.error)
					    });
			});
		}else{

			let data = {
							"descripcion": this.propertyForm.get('Descripcion').value,
							"idUser": localStorage.getItem('username'),
							"time" : time,
							"imagen" : '',
							"imagen_public_id" : ''
						};

			this.service.postUrl('publicaciones', data)
			.then(response => {
				console.log(response._id)
						if(response._id !== undefined){
							this.messageSuccessfully("Se ha creado una publicación.");
							this.modalReference.close();
							this.getPublicacion();
							this.limpiarInputDescription();
						}
		    })
		    .catch(data =>{
		        console.log(data.error)
		    });
		}
	}

	public deletePublicacion(id){

		this.service.deleteUrl('publicaciones/{id}', [id])
		.then(data => { 
			this.messageSuccessfully("Publicación eliminada.");
	    	this.getPublicacion(); 
	    })
	  .catch(data =>{});
	}

	public putPublicacion(id){

		let time = this.getDateToday();

		$('#cambiar_img_button').html("<li class='fa fa-spinner fa-spin fa-1x'> </li>");

		if(this.urlPreview !== ''){

			if(!this.empty(this.archivo)){
					const formularioImagen = new FormData();
			    formularioImagen.append('file', this.archivo);
			    formularioImagen.append('upload_preset', 'imagen');

			    this.httpClient.post(`https://api.cloudinary.com/v1_1/inversiones-jr/image/upload`, formularioImagen).subscribe( 
			    (response: any) => {

				let data = {
						"descripcion": this.descriptionPut,
						"time" : time,
						"imagen" : response.secure_url,
						"imagen_public_id" : response.public_id
					};

					$('#cambiar_img_button').html("Cambiar");

					this.service.putUrl('publicaciones/{id}', data, [id])
					.then(response => {
							console.log(response._id)
							if(response._id !== undefined){
								this.modalReference.close();
								this.getPublicacion();
								this.clickEliminarImagen();
								this.limpiarInputDescription();
								this.messageSuccessfully("Se ha actualizado esta publicación.");
							}
					})
					.catch(data =>{
							$('#cambiar_img_button').html("Cambiar");
						console.log(data.error)
					});

			  	});
			}else{

				let data = {
					"descripcion": this.descriptionPut,
					"time" : time
				};

				this.service.putUrl('publicaciones/withoutimage/{id}', data, [id])
				.then(response => {
						$('#cambiar_img_button').html("Cambiar");
						console.log(response._id)
						if(response._id !== undefined){
							this.modalReference.close();
							this.getPublicacion();
							this.clickEliminarImagen();
							this.limpiarInputDescription();
							this.messageSuccessfully("Se ha actualizado esta publicación.");
						}
				})
				.catch(data =>{
						$('#cambiar_img_button').html("Cambiar");
					console.log(data.error)
				});
			}
	  }else{

		let data = {
				"descripcion": this.descriptionPut,
				"time" : time,
				"imagen" : '',
				"imagen_public_id" : ''
			};

			this.service.putUrl('publicaciones/{id}', data, [id])
			.then(response => {
					$('#cambiar_img_button').html("Cambiar");
					console.log(response._id)
					if(response._id !== undefined){
						this.modalReference.close();
						this.getPublicacion();
						this.limpiarInputDescription();
						this.messageSuccessfully("Se ha actualizado esta publicación.");
					}
			})
			.catch(data =>{
					$('#cambiar_img_button').html("Cambiar");
				console.log(data.error)
			});

	  }
	}

	public createForm() {
	    this.propertyForm = this._formBuilder.group({
	    	Descripcion: ['', Validators.required]
	    });
	}

	public Gotopost(id, bol: boolean){

		if(bol){
			localStorage.setItem('commentAut', 'true');
			var URL = '/home/post/'+id;
			this.router.navigateByUrl(URL);
		}else{
			localStorage.setItem('commentAut', 'false');
			var URL = '/home/post/'+id;
			this.router.navigateByUrl(URL);
		}
	}

	public masPublicaciones(){
		this.part = this.part + 5;
		this.getPublicacion();
	}

	public empty(str){
		if(str == null || str == '' || str == undefined || str == "[]" || str.length == 0){
			return true;
		}

		return false;
	}

	private messageSuccessfully($message) {
		let config: SweetAlertOptions = {
		  title: $message,
		  type: 'success',
		  showConfirmButton: false,
		  timer: 2500
		};
	
		Swal.fire(config).then(result => {
		});
	  }
	
	  private errorOcurred(message) {
		let config: SweetAlertOptions = {
		  title: message,
		  type: 'error',
		  showConfirmButton: true
		};
	
		Swal.fire(config).then(result => {
		});
	  }

}
