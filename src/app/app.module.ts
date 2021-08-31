import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './page/home/home.component';
import { ShellComponent } from './components/shell/shell.component';
import { HomeModule } from './page/home/home.module';
import { ShellModule } from './components/shell/shell.module';
import { ListaModule } from './components/lista/lista.module';
import { DocumentosComponent } from './page/documentos/documentos.component';
import { DocumentosModule } from './page/documentos/documentos.module';

@NgModule({
  declarations: [
    AppComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HomeModule,
    ShellModule,
    DocumentosModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
