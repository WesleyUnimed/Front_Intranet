import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ListagemVirtualComponent } from 'src/app/components/listagem-virtual/listagem-virtual.component';
import { SearchBarComponent } from 'src/app/components/search-bar/searchbar.component';
import { Documento } from 'src/app/models/documento/documento.model';
import { DocumentosParams } from 'src/app/models/documento/documento.params';
import { CamposListagem } from 'src/app/models/listagem/campos-listagem.model';
import { To_Capitalize } from 'src/app/utils/utils';
import { environment } from 'src/environments/environment';
import { DocumentosService } from './documentos.service';

@Component({
    selector: 'app-documentos',
    templateUrl: './documentos.component.html',
    styleUrls: ['./documentos.component.scss'],
})
export class DocumentosComponent implements OnInit {

    objArrayDocumentos = []
    objArrayGrupoCEQ = []
    objArrayRetorno = []
    objArrayCampos: CamposListagem[] = [
        { nm_Exibicao: "Nome", nm_Classe: "w-5/12 my-auto lg:pl-14 overflow-hidden overflow-ellipsis whitespace-nowrap", nm_Atibruto: "nm_Documento" },
        { nm_Exibicao: "Código", nm_Classe: "w-2/12 my-auto lg:text-center overflow-hidden overflow-ellipsis whitespace-nowrap", nm_Atibruto: "cd_Qualidade" },
        { nm_Exibicao: "Processos", nm_Classe: "w-2/12 my-auto lg:text-center overflow-hidden overflow-ellipsis whitespace-nowrap", nm_Atibruto: "nm_Processo" },
        { nm_Exibicao: "Revisão", nm_Classe: "w-1/12 lg:pl-6 my-auto lg:text-center", nm_Atibruto: "nr_Revisao" },
        { nm_Exibicao: "Data", nm_Classe: "w-2/12 my-auto lg:text-center", nm_Atibruto: "dt_Documento" },
    ]
    objArrayCamposDesktop: CamposListagem[] = [
        { nm_Exibicao: "Nome", nm_Classe: "w-5/12 my-auto pl-14 overflow-hidden overflow-ellipsis whitespace-nowrap", nm_Atibruto: "nm_Documento" },
        { nm_Exibicao: "Código", nm_Classe: "w-2/12 my-auto text-center overflow-hidden overflow-ellipsis whitespace-nowrap", nm_Atibruto: "cd_Qualidade" },
        { nm_Exibicao: "Processos", nm_Classe: "w-2/12 my-auto text-center overflow-hidden overflow-ellipsis whitespace-nowrap", nm_Atibruto: "nm_Processo" },
        { nm_Exibicao: "Revisão", nm_Classe: "lg:pl-6 w-1/12 my-auto text-center", nm_Atibruto: "nr_Revisao" },
        { nm_Exibicao: "Data", nm_Classe: "w-2/12 my-auto text-center", nm_Atibruto: "dt_Documento" },
    ]

    @ViewChild(ListagemVirtualComponent) listagemVirtual: ListagemVirtualComponent
    @ViewChild(SearchBarComponent) searchFocus: SearchBarComponent

    nr_Input_Page_Length = new FormControl()
    modelChanged = new FormControl()

    appVersion: string

    nr_Registros: number = 0
    nr_Page_Length: number = 10
    nr_Page: number = 1
    cd_Setor_CEQ: number
    nr_Width: number = window.innerWidth
    nr_Heigth: number = window.innerHeight
    nr_Width_Screen: number
    nr_Heigth_Screen: number

    b_Exibir_Listagem: boolean = false
    b_Exibir_Computador: boolean = false
    b_Mostrar_Modal: boolean = false
    b_Search_Focus: boolean = false
    b_Requisicao: boolean
    b_Mudar_Listagem: boolean

    inputcontrol: number = 2
    nm_Search: string = ""

    @HostListener('window:resize')
    onResize() {
        this.nr_Width = window.innerWidth;
        this.nr_Heigth = window.innerHeight;

        if (this.nr_Width >= 1024) {

            this.b_Exibir_Computador = true
            this.b_Mudar_Listagem = true
            let valor = window.innerHeight * this.nr_Page_Length
            let resultado = Math.floor((valor / 625))
            this.nr_Page_Length = resultado
            setTimeout(() => {
                this.searchFocus.searchElement.nativeElement.focus()
            }, 0);
        }
        else {
            this.b_Exibir_Computador = false
        }

    }

    constructor(private documentosService: DocumentosService) { }

    async ngOnInit() {

        this.onResize()
        this.Buscar_GrupoCEQ()
        this.Buscar_Documentos()
        this.modelChanged.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(async (input) => {
            this.nr_Page = 1
            this.nm_Search = input
            this.nr_Page_Length = 10
            if (this.nm_Search != null && this.nm_Search.length > 1) {

                this.objArrayDocumentos = []
            }
            this.Buscar_Documentos()
        })

        if (!this.b_Exibir_Computador) {
            this.objArrayCampos[0].nm_Classe = "font-semibold"
        }

    }

    /** @description Avança uma pagina */
    Mudar_Pagina(nr_Page: number) {
        this.nr_Page = nr_Page
        this.Buscar_Documentos()
    }

    async Buscar_Documentos() {
        const objParams: DocumentosParams = { nr_Page: this.nr_Page, nr_Page_Length: this.nr_Page_Length, nm_Search: this.nm_Search, cd_Setor_CEQ: this.cd_Setor_CEQ }
        const objRetorno = await this.documentosService.Get_Documentos(objParams)
        objRetorno.data.forEach(f => f.nm_Documento = To_Capitalize(f.nm_Documento))

        if (this.b_Exibir_Computador) {
            this.objArrayDocumentos = objRetorno.data
        } else {
            this.objArrayDocumentos = [...this.objArrayDocumentos, ...objRetorno.data]
            //reticencias retorna o conjunto de objetos do array, ele tira as colchetes do Json.

        }
        this.nr_Registros = objRetorno.nr_Registros
    }

    async Filter_Menu(obj: Documento, b_Filho: boolean) {

        this.objArrayGrupoCEQ.forEach(f => { f.subgrupos.forEach(g => g.subgrupos.forEach(h => h._open = false)) })
        //this.modelChanged.reset()
        this.nr_Page = 1
        this.cd_Setor_CEQ = obj.cd_Setor_CEQ

        if (!this.b_Exibir_Computador) {
            this.objArrayDocumentos = []
        } else {
            this.searchFocus.searchElement.nativeElement.focus()
        }

        if (obj.cd_Setor_CEQ != 0 && b_Filho == false) {
            this.Buscar_Documentos()
            obj._open = true
            if (!this.b_Exibir_Computador) {
                this.b_Mostrar_Modal = !this.b_Mostrar_Modal
            } else {
                this.b_Mostrar_Modal = this.b_Mostrar_Modal
            }

        } else if (obj.cd_Setor_CEQ != 0 && b_Filho == true && !this.b_Exibir_Computador) {
            this.cd_Setor_CEQ = obj.cd_Setor_CEQ
            this.b_Mostrar_Modal = true
            this.Buscar_Documentos()
            obj._open = true
        }
        else if (obj.subgrupos?.length == 0) {
            this.objArrayDocumentos = []
            this.b_Mostrar_Modal = !this.b_Mostrar_Modal
        }
    }

    async Buscar_Arquivo(cd_Documento: number) {

        let token = await this.documentosService.Get_Token_Arquivo(cd_Documento)
        window.open(environment.CONS_URL_APIBASE + "Documentos?token=" + token.ds_Token, '_blank')
    }

    async Buscar_GrupoCEQ() {

        const [objArrayGrupoCEQ, objArrayMenuCEQ] = await this.documentosService.Get_GrupoCEQ()

        let objArrayAux = objArrayGrupoCEQ.filter(pai => pai.cd_Grupo_Pai == 0)

        objArrayAux.forEach(pai => {

            pai.subgrupos = objArrayGrupoCEQ.filter(filho => filho.cd_Grupo_Pai == pai.cd_Grupo_CEQ)
            pai.subgrupos.forEach(neto => {

                neto.subgrupos = objArrayGrupoCEQ.filter(filho => filho.cd_Grupo_Pai == neto.cd_Grupo_CEQ)
                objArrayMenuCEQ.forEach(nomeNeto => nomeNeto.nm_Grupo_CEQ = nomeNeto.nm_Setor_CEQ)
                neto.subgrupos.push(...objArrayMenuCEQ.filter(menu => menu.cd_Grupo_CEQ == neto.cd_Grupo_CEQ))
            });
        })
        this.objArrayGrupoCEQ = objArrayAux
    }

    Mostrar_Modal() {

        this.b_Mostrar_Modal = !this.b_Mostrar_Modal
        this.objArrayGrupoCEQ.forEach(f => {
            f._open = false
            f.subgrupos.forEach(g => g._open = false)
        })
    }

    // onSubmit(form) {
    //     if (parseInt(form.value.length) == 0) {
    //         this.objArrayDocumentos = []
    //     } else {
    //         this.nr_Page_Length = parseInt(form.value.length)
    //         this.Buscar_Documentos()
    //         console.log(form)
    //     }
    // }

    Limpar_Filtros() {
        this.modelChanged.reset()
        this.nm_Search = ""
        this.objArrayDocumentos = []
        this.b_Mostrar_Modal = false
        this.nr_Page = 1
        this.cd_Setor_CEQ = null
        if (!this.b_Exibir_Computador) {
            this.listagemVirtual.scroller.scrollTo({ top: 0 })
        } else {
            this.searchFocus.searchElement.nativeElement.focus()
        }
        this.objArrayGrupoCEQ.forEach(f => {
            f._open = false
            f.subgrupos.forEach(g => {
                g._open = false
                g.subgrupos.forEach(h => h._open = false)
            })
        })
        this.Buscar_Documentos()
    }

    Fechar_Menu(item: Documento, b_Pai: boolean) {

        if (b_Pai) {
            this.objArrayGrupoCEQ.forEach(f => {

                if (f.cd_Grupo_CEQ == item.cd_Grupo_CEQ) {
                    f._open = !f._open

                } else {
                    f._open = false
                }
            })
        } else {

            this.objArrayGrupoCEQ.forEach(f => {

                f.subgrupos.forEach(g => {

                    if (g.cd_Grupo_CEQ == item.cd_Grupo_CEQ) {
                        g._open = !g._open

                    } else {
                        g._open = false
                    }
                })
            })
        }
    }
}
