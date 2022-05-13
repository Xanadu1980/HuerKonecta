import { Component, OnInit, ElementRef, AfterViewInit, Renderer2} from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UsersService } from '../users/users.service';
import { Usuario } from "../classes/usuario";
import $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	public httpOption : any;
	public username : any;
	public search : any;
	public bLogger = false;
	public myControl = new FormControl();
	public userFilter: Usuario[] = [];
	public usuarios : Usuario[] = []
	public filteredUsers: Observable<Usuario[]>;
	public Usernofound : any;
	public setInterval : any;

	constructor(private router: Router, private service: UsersService) {}

	ngOnInit() {
	    
	    var rol = localStorage.getItem('role');
	    var email = localStorage.getItem('email');
	    
	    if (!isNullOrUndefined(rol) && !isNullOrUndefined(email)) {
	      	this.bLogger = true;
	      	this.username = localStorage.getItem('username');
	      	this.getUser();	
	    }else{
	    	this.router.navigate(['/'], { replaceUrl: true });
	    }

	    this.setInterval = setInterval(() => {
		    	if(this.isWindowDesktop() && this.isWindowMobile()){
		    		this.displaySearch();
		    	}
		  }, 500);

	}

	public capturaChange(event){

		console.log(event)

		this.userFilter = [new Usuario('','','','No hay resultados.','','','','','','')];
		this.Usernofound = 0;

		if(event == 'No hay resultados.'){
			$('#search').val('');
		}

		var u = 0;
		for(var i=0; i < this.usuarios.length; i++){

			if(this.usuarios[i].username.indexOf(event) !== -1 && event !== ''){
					this.Usernofound = 1;
					this.userFilter[u] = this.usuarios[i];
					u = u + 1;
			}
		}

		this.filteredUsers = this.myControl.valueChanges.pipe(
			startWith(''),
			map(user => user ? this._filter(user) : this.userFilter.slice())
		);

	}

	public getUser(){

		this.service.getUrl('users')
	  .then(data => { 
					this.usuarios = data;
		})
		.catch(data =>{});

	}

	private _filter(user: string): Usuario[] {
		const filterUser = user.toLowerCase();

		return this.userFilter.filter(user => user.username.toLowerCase().includes(filterUser));
	}

	public logout(){
		localStorage.removeItem('token');
  	localStorage.removeItem('email');
  	localStorage.removeItem('role');
  	localStorage.removeItem('username');
  	localStorage.removeItem('avatar');
  	localStorage.setItem('isLoggedIn', "false");  

    this.router.navigateByUrl('/login');
	}

	public Gotouser(){
		console.log(this.userFilter.length);
			if(this.search !== 'No hay resultados.' && this.Usernofound == 1){
				this.router.routeReuseStrategy.shouldReuseRoute = () => false;
				this.router.onSameUrlNavigation = 'reload';
				var URL = '/home/profile/'+this.search;
				
				this.router.navigate([URL], { replaceUrl: true });
				this.search = '';
			}else{
				this.search = '';
			}
	}

	public Gotoprofile(){

		var URL = '/home/myprofile/'+localStorage.getItem('username');

		$('#navbarNav').removeClass('show');
		this.router.navigateByUrl(URL);
	}

	public collapseHide(){
			$('#navbarNav').removeClass('show');
	}

	public displaySearch(){
			
			if($('#form-search-mobile').css('display') == 'none'){
					$('#form-search-mobile').css('display', 'block');
			}else{
					$('#form-search-mobile').css('display', 'none');
			}

	}

	public isWindowDesktop(){
			if($('#li-search-desktop').css('display') !== 'none'){
				return true;
			}
				
			return false;
	}

	public isWindowMobile(){
			if($('#form-search-mobile').css('display') !== 'none'){
				return true;
			}
				
			return false;
	}

	ngOnDestroy() {
	  if (this.setInterval) {
	    clearInterval(this.setInterval);
	  }
	}

}