import { Component, OnInit } from '@angular/core';
import { Cliente} from './cliente';
import { ClienteService } from './cliente.service';
import  swal from 'sweetalert2';
import {tap} from 'rxjs/operators';
import {ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {

  clientes: Cliente[];
  paginador: any;

  constructor(private clienteService: ClienteService,
  private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe( params => {
      let page: number = +params.get('page');
      if(!page){
        page = 0;
      }
      this.clienteService.getClientes(page).pipe(
        tap(response =>{
          (response.content as Cliente[]).forEach(cliente => {
          });
        })
       ).subscribe(
         response =>{
           this.clientes = response.content as Cliente[];
           this.paginador = response;
          }
       );
    }
    )

  }

  delete(cliente: Cliente): void {
    swal({
      title: '¿Está seguro?',
      text: `¿Desea borrar al cliente ${cliente.nombre} ${cliente.apellido}?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      reverseButtons: true,
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {

        this.clienteService.delete(cliente.id).subscribe( response => {
              this.clientes = this.clientes.filter(clie => clie !== cliente);
              swal('Borrado!','Your file has been deleted.','success');
         });
      }
    });
  }

}
