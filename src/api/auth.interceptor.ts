import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, map, of, switchMap } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private auth: AuthService,
    ) { }

    private token$ = this.auth.isAuthenticated$.pipe(
        switchMap(isAuthenticated => {
            if (isAuthenticated)
                return this.auth.getAccessTokenSilently()
            return of(undefined)
        }),
    );

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.token$.pipe(
            map(token => {
                if (!token)
                    return req;
                return req.clone({
                    headers: req.headers.set('Authorization', `Bearer ${ token }`)
                });
            }),
            switchMap(req => next.handle(req)),
        )
    }
}