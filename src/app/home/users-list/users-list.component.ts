import { Component, OnInit, ElementRef, AfterViewInit, Renderer2} from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UsersService } from '../../users/users.service';
import { Usuario } from "../../classes/usuario";
import $ from 'jquery';


@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {


  public usuarios : Usuario[] = []
  constructor(private router: Router, private service: UsersService) {}


  ngOnInit() {
    this.getUser();
  }


  public getUser(){

    this.service.getUrl('users')
    .then(data => { 
          this.usuarios = data;
    })
    .catch(data =>{});

  }

}
