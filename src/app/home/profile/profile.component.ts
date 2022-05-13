import { Component, OnInit, ElementRef, AfterViewInit, Renderer2} from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { UsersService } from '../../users/users.service';
import { Usuario } from "../../classes/usuario";
import { Tarea } from "../../classes/tarea";
import { isNullOrUndefined } from 'util';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient , HttpHeaders} from  '@angular/common/http';
import { SweetAlertOptions } from 'sweetalert2';
import { NgxImageCompressService } from 'ngx-image-compress';
import Swal from 'sweetalert2';
import $ from 'jquery';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public propertyForm : FormGroup;
  public username : any; //Del perfil del usuario
  public roleCurrent : any;
  public usernameCurrent : any; //Del usuario en linea
  public usuario : Usuario = new Usuario('','','','','','','','','','');
  public tareas : Tarea[] = [];
  public archivo : any = [];
  public urlPreview: any = '';


  // Variables para edicion
  public nombre: any;
  public apellido: any;
  public email: any;
  public telefono: any;
  public puesto: any;
  public avatar: any;
  public avatar_public_id: any;
  public usernameOld : any;
  public role : any;
  public modalReference: any;
  public closeResult: string;

  constructor(private modalService: NgbModal, private _formBuilder: FormBuilder, 
          private service: UsersService, private router: ActivatedRoute, private Redirect: Router, 
          private  httpClient:  HttpClient,
          private imageCompress: NgxImageCompressService) { }

  ngOnInit() {

    this.archivo.name = '';
    this.username = this.router.snapshot.paramMap.get('username');
    this.roleCurrent = localStorage.getItem('role');
    this.usernameCurrent = localStorage.getItem('username');

    this.getUser();
    this.createFormChangePassword();

  }

  open(content) {

    this.modalReference = this.modalService.open(content, { size: 'lg', centered: true });

    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
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

  public capturarImagen(event){
    var  fileName : any;
    const archivoEncontrado = event.target.files[0];

    if(this.archivo.name !== archivoEncontrado.name){
      
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
  }

  public compressFile(image, fileName) {
        var orientation = -1;

        console.warn('Size in bytes is now:',  this.imageCompress.byteCount(image)/(1024*1024));
        
        this.imageCompress.compressFile(image, orientation, 50, 50).then(
        result => {
            this.urlPreview = result;
            
            // Compress the image and change the file archivo
            console.warn('Size in bytes after compression:',  this.imageCompress.byteCount(result)/(1024*1024));
            const imageName = fileName;
            this.archivo = new File([result], imageName, { type: 'image/jpeg' });


            //Asign form for send to cloundinary
            const formularioImagen = new FormData();
            formularioImagen.append('file', this.archivo);
            formularioImagen.append('upload_preset', 'avatars');

            $('#boton_editar').html("<li class='fa fa-spinner fa-spin fa-1x'> </li>");

            this.httpClient.post(`https://api.cloudinary.com/v1_1/inversiones-jr/image/upload`, formularioImagen).subscribe( 
            (response: any) => {

                let data = {
                  "avatar" : response.secure_url,
                  "avatar_public_id" : response.public_id
                }

                $('#boton_editar').html("Editar");

                this.service
                  .putUrl('users/imagen/{username}', data, [this.username])
                  .then(response => {
                          this.usuario = response;
                          this.avatar = this.usuario.avatar;
                          this.avatar_public_id = this.usuario.avatar_public_id;
                  })
                  .catch(data =>{
                     console.log(data.error)
                  });

            }, 
            (err : any) => {
              this.errorOcurred('No hay conexión');
            });
        });

  }

  public changeImage(){
    $('#archivo').click();
  }

  public deleteImage(){

    if(this.avatar_public_id !== ''){

        let data = {
          avatar : 'https://res.cloudinary.com/ucab/image/upload/v1623484253/foto-perfil-defecto_pfsou3.jpg',
          avatar_public_id : ''
        }
              
        this.service
        .putUrl('users/imagen/{username}', data, [this.username])
        .then(response => {
          this.usuario = response;
          this.avatar = this.usuario.avatar;
          this.avatar_public_id = this.usuario.avatar_public_id;
        })
        .catch(data =>{
           console.log(data.error)
        });

    }
  }

  public getUser(){

      this.service.getUrl('users/username/{username}', [this.username])
        .then(data => { 
          this.usuario = data;

          this.nombre = this.usuario.nombre;
          this.apellido = this.usuario.apellido;
          this.email = this.usuario.email;
          this.telefono = this.usuario.telefono;
          this.puesto = this.usuario.puesto;
          this.usernameOld = this.usuario.username;
          this.username = this.usuario.username;
          this.role = this.usuario.role;
          this.avatar = this.usuario.avatar;
          this.avatar_public_id = this.usuario.avatar_public_id;

          this.getTarea();
        })
        .catch(data =>{});
  }

  public getTarea(){
    this.service.getUrl('tareas')
      .then(data => { 

        var cont = 0;

        for(var i = 0; i < data.length; i++){
          if(this.usuario.username == data[i].idUser){
              this.tareas[cont] = data[i];

              cont = cont + 1;
          }
        }

      })
    .catch(data =>{});
  }

  public changeUser(){

    let data = {
      "nombre": this.nombre,
      "apellido": this.apellido,
      "email": this.email,
      "telefono": this.telefono,
      "puesto": this.puesto,
      "username": this.usernameOld
    };

    this.service.putUrl('users/username/{username}', data, [this.username])
    .then(response => {
      console.log(response)
      if(response._id !== undefined){

          this.nombre = response.nombre;
          this.apellido = response.apellido;
          this.email = response.email;
          this.telefono = response.telefono;
          this.puesto = response.puesto;
          
          if(this.username == localStorage.getItem('username')) localStorage.setItem('username', response.username);
          
          this.usernameOld = response.username;
          this.username = response.username;

          this.modalReference.close();
          this.getUser();

          if(document.location.href.indexOf('myprofile') !== -1){
              var URL = '/home/myprofile/'+localStorage.getItem('username');
          }else{
              var URL = '/home/profile/'+localStorage.getItem('username');
          }

          this.editingSuccessfully();
          
          this.Redirect.navigateByUrl(URL);
      }
    })
    .catch(data =>{
        this.errorOcurred(data.error);
    });

  }

  public eliminarUsuario(){
    this.confirmDeleteUser();
  }

  public convertirAdmin(){
    var inputImagePut = <HTMLInputElement> document.getElementById('adminSwitches');

     if(inputImagePut.checked){
          let data = { 
            "role" : "ADMIN"
          };

          this.service.putUrl('users/role/{username}', data, [this.username])
            .then(response => {
              console.log(response)
              if(response._id !== undefined){
                  console.log("Peticion enviado y satisfactoria");
                  this.getUser();
              }
            })
            .catch(data =>{
                console.log(data.error)
            });
     }else{
         let data = { 
            "role" : "USER"
         };

          this.service.putUrl('users/role/{username}', data, [this.username])
            .then(response => {
              console.log(response)
              if(response._id !== undefined){
                  console.log("Peticion enviado y satisfactoria");
                  if(this.username == localStorage.getItem('username')) localStorage.setItem('role', response.role);
                  this.getUser();
              }
            })
            .catch(data =>{
                console.log(data.error)
            });
     }
  }

  public createFormChangePassword(){
      this.propertyForm = this._formBuilder.group({
        password: ['', Validators.required],
        passwordNew: ['', Validators.required]
      });
  }

  public changePassword(){

    let data = {
      "password": this.propertyForm.get('password').value,
      "passwordNew": this.propertyForm.get('passwordNew').value,
    };

    this.service.putUrl('users/password/{username}', data, [this.username])
      .then(response => {
        console.log(response)
        if(response._id !== undefined){
             this.messageSuccessfully();
             this.propertyForm.get('password').setValue("");
             this.propertyForm.get('passwordNew').setValue("");
        }
      })
      .catch(data =>{
          this.errorOcurred(data.error.err.message);
      });
  }

  private messageSuccessfully() {
    let config: SweetAlertOptions = {
      title: 'Contraseña cambiada satisfactoriamente',
      type: 'success',
      showConfirmButton: false,
      timer: 2500
    };

    Swal.fire(config).then(result => {
    });
  }

  private editingSuccessfully() {
    let config: SweetAlertOptions = {
      title: 'Los datos del usuario han sido editados satisfactoriamente',
      type: 'success',
      showConfirmButton: false,
      timer: 2500
    };

    Swal.fire(config).then(result => {
    });
  }

  private deleteSuccessfully() {
    let config: SweetAlertOptions = {
      title: 'El usuario ha sido eliminado satisfactoriamente',
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

  private confirmDeleteUser(){
    let config: SweetAlertOptions = {
      title: "Esta seguro que desea eliminar esta cuenta? Se eliminara permanentemente.",
      type: 'warning',
      showConfirmButton: true,
      showCancelButton:true,
      cancelButtonText:"No",
      confirmButtonColor:"#3085d6",
      confirmButtonText:'Si, eliminalo!',
    };

    Swal.fire(config).then(result => {

      if(result.value == true){
        this.service.deleteUrl('users/username/{username}', [this.username])
        .then(data => {  
           this.deleteSuccessfully();
           this.modalReference.close();

           if(this.usernameCurrent == this.username){

             localStorage.removeItem('token');
             localStorage.removeItem('email');
             localStorage.removeItem('role');
             localStorage.removeItem('username');
             localStorage.removeItem('avatar');
             localStorage.setItem('isLoggedIn', "false");  

             this.Redirect.navigateByUrl('/login');
           }else{
             this.Redirect.navigateByUrl('/home/post');
           }
        })
        .catch(data =>{
           this.errorOcurred(data.error.err.message);
        });
      } 

    });
  }

}
