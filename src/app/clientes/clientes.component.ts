import { Component, OnInit } from '@angular/core';
import { Cliente} from './cliente';
import { ClienteService } from './cliente.service';
import  swal from 'sweetalert2';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {

  clientes: Cliente[];

  constructor(private clienteService: ClienteService) { }

  ngOnInit() {
     this.clienteService.getClientes().pipe(
      tap(clientes =>{
        console.log('ClientesComponent: tap 3');
        clientes.forEach(cliente => {
          console.log(cliente.nombre);
        });
      })
     ).subscribe(
       clientes => this.clientes = clientes
     );
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
