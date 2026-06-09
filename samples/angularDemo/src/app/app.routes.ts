import { Routes } from '@angular/router';
import { UploadFile } from './spire/upload-file/upload-file';
import { OfficeJS } from './spire/office-js/office-js';

export const routes: Routes = [
  { path: '', component: UploadFile }, // Default: upload page
  { path: 'spire', component: OfficeJS } // Editor page: /spire
];

