import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SnackbarComponent } from './snackbar.component';

@NgModule({
    declarations: [
        SnackbarComponent
    ],
    imports: [
        CommonModule,
    ],
    providers: [],
    exports: [
        SnackbarComponent,
    ]
})
export class SnackbarModule { }
