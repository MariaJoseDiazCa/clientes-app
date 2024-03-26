import { Injectable } from '@angular/core';
import { Cliente } from './cliente';
import { Region } from './region';
import { AuthService } from '../usuarios/auth.service';
import { Observable, of, throwError } from 'rxjs';
import {
  HttpClient,
  HttpEvent,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private urlEndPoint: string = 'http://localhost:8080/api/clientes';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  private isNoAutorizado(e): boolean {
    if (e.status === 401) {
      if (this.authService.isAuthenticated()) {
        this.authService.logout();
      }
      this.router.navigate(['login']);
      return true;
    }
    if (e.status === 403) {
      swal(
        'Acceso Denegado',
        `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`,
        'warning'
      );
      this.router.navigate(['/clientes']);
      return true;
    }
    return false;
  }

  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones').pipe(
      catchError((e) => {
        this.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getClientes(page: number): Observable<any> {
    return this.http.get<Cliente[]>(this.urlEndPoint + '/page/' + page).pipe(
      tap((response: any) => {
        (response.content as Cliente[]).forEach((cliente) => {});
      }),
      map((response: any) => {
        (response.content as Cliente[]).map((cliente) => {
          cliente.nombre = cliente.nombre.toUpperCase();
          return cliente;
        });
        return response;
      }),
      tap((response) => {
        (response.content as Cliente[]).forEach((cliente) => {});
      })
    );
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post(this.urlEndPoint, cliente).pipe(
      map((response: any) => response.cliente as Cliente),
      catchError((e) => {
        console.info(e);
        if (this.isNoAutorizado(e)) {
          return throwError(() => e);
        }
        if (e.status == 400) {
          return throwError(() => e);
        }
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(() => e);
      })
    );
  }

  getCliente(id): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError((e) => {
        if (this.isNoAutorizado(e)) {
          return throwError(() => e);
        }

        this.router.navigate(['/clientes']);
        swal('Error al editar', e.error.mensaje, 'error');
        return throwError(() => e);
      })
    );
  }

  update(cliente: Cliente): Observable<any> {
    return this.http
      .put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente)
      .pipe(
        catchError((e) => {
          if (this.isNoAutorizado(e)) {
            return throwError(() => e);
          }

          if (e.status == 400) {
            return throwError(() => e);
          }

          swal(e.error.mensaje, e.error.error, 'error');
          return throwError(() => e);
        })
      );
  }

  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError((e) => {
        if (this.isNoAutorizado(e)) {
          return throwError(() => e);
        }

        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(() => e);
      })
    );
  }

  subirFoto(archivo: File, id): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('id', id);

    let httpHeaders = new HttpHeaders();
    let token = this.authService.token;
    if (token != null) {
      httpHeaders = httpHeaders.append('Authorization', 'Berer ' + token);
    }

    const req = new HttpRequest(
      'POST',
      `${this.urlEndPoint}/upload`,
      formData,
      {
        reportProgress: true,
        headers: httpHeaders,
      }
    );

    return this.http.request(req).pipe(
      catchError((e) => {
        this.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
}
