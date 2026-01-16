import { Routes } from '@angular/router';
import { LivrosComponent } from './pages/livros/livros.component';
import { AssuntosComponent } from './pages/assuntos/assuntos.component';
import { AutoresComponent } from './pages/autores/autores.component';
import { FormaCompraComponent } from './pages/forma-compra/forma-compra.component';
import { RelatorioAutoresComponent } from './pages/relatorio-autores/relatorio-autores.component';

export const routes: Routes = [
  { path: '', redirectTo: 'livros', pathMatch: 'full' },
  { path: 'livros', component: LivrosComponent },
  { path: 'assuntos', component: AssuntosComponent },
  { path: 'autores', component: AutoresComponent },
  { path: 'forma-compra', component: FormaCompraComponent },
  { path: 'relatorio-autores', component: RelatorioAutoresComponent }
];
