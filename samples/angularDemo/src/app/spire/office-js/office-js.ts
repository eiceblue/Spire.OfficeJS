import { Component, AfterViewInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { fileStore } from '../../store/index';

// Declare global SpireCloudEditor (from Spire.OfficeJS script)
declare const SpireCloudEditor: any;

@Component({
  selector: 'app-office-js',
  imports: [],
  templateUrl: './office-js.html',
  styleUrl: './office-js.css',
})
export class OfficeJS implements AfterViewInit {
  constructor(private router: Router) { };
  // Inject state management store
  store = inject(fileStore);

  // Get file data from store
  file = this.store.file() as File;
  fileUint8Data = this.store.fileUint8Data() as Uint8Array;
  originUrl = window.location.origin; // Current project domain name
  Editor: any; // Editor instance
  config: any; // Editor configuration
  Api: any;    // Editor API

  // Execute after component view initialization is complete
  ngAfterViewInit() {
    this.init();
  }

  // Initialize editor (redirect to upload if no file exists)
  init() {
    if (!this.file) {
      this.router.navigate(['']); 
      return;
    }
    this.loadSrcipt(); // Load editor script
  }

  // Dynamically load SpireCloudEditor.js
  loadSrcipt() {
    const script = document.createElement('script');
    // Match static resource path
    script.setAttribute('src', '/spire.cloud/web/editors/spireapi/SpireCloudEditor.js'); 
    script.onload = () => this.initEditor(); // Initialize editor after script loading is complete
    document.head.appendChild(script);
  }

  // Initialize editor configuration and instance
  initEditor() {
    const iframeId = 'iframeEditor'; // Match container ID in the template file
    this.initConfig(); 
    this.Editor = new SpireCloudEditor.OpenApi(iframeId, this.config);
    this.Api = this.Editor.GetOpenApi(); // Get editor API
    this.OnWindowReSize(); // Adapt to window size
  }

  // Configure editor settings (file information + user permissions + editor behavior)
  initConfig() {
    this.config = {
      "fileAttrs": {
        "fileInfo": {
          "name": this.file.name, // File name
          "ext": this.getFileExtension(), // File suffix
          "primary": String(new Date().getTime()), // Unique ID (timestamp)
          "creator": "",
          "createTime": ""
        },
        "sourceUrl": `${this.originUrl}/files/__ffff_192.168.3.121/${this.file.name}`,
        "createUrl": `${this.originUrl}/open`,
        "mergeFolderUrl": "",
        "fileChoiceUrl": "",
        "templates": {}
      },
      "user": {
        "id": "uid-1",
        "name": "Jonn",
        "canSave": true, // Allow file saving
      },
      "editorAttrs": {
        "editorMode": this.file.name.endsWith('.pdf') ? 'view' : "edit", // PDF = preview only
        "editorWidth": "100%", 
        "editorHeight": "100%", 
        "editorType": "document", 
        "platform": "desktop", 
        "viewLanguage": "en", // English interface
        "isReadOnly": false, 
        "canChat": true,
        "canComment": true, 
        "canReview": true, 
        "canDownload": true, // Allow file downloads
        "canEdit": this.file.name.endsWith('.pdf') ? false : true, // Disable editing for PDFs
        "canForcesave": true, 
        "embedded": {
          "saveUrl": "",
          "embedUrl": "",
          "shareUrl": "",
          "toolbarDocked": "top" // Toolbar aligned to top
        },
        // Enable WebAssembly for faster performance（Supports Word/Excel/PPT/PDF）
        "useWebAssemblyDoc": true,
        "useWebAssemblyExcel": true,
        "useWebAssemblyPpt": true,
        "useWebAssemblyPdf": true,
        // License keys (add if available)
        "spireDocJsLicense": "",
        "spireXlsJsLicense": "",
        "spirePresentationJsLicense": "",
        "spirePdfJsLicense": "",
        "serverless": {
          "useServerless": true,
          "baseUrl": this.originUrl,
          "fileData": this.fileUint8Data, // Pass binary file data
        },
        "events": {
          "onSave": this.onFileSave // Save callback event
        },
        "plugins": {
          "pluginsData": []
        }
      }
    };
  }

  // Adjust editor size to fit window
  OnWindowReSize() {
    const wrapEl = document.getElementsByClassName("form") as any;
    if (wrapEl.length) {
      wrapEl[0].style.height = window.innerHeight + "px";
      window.scrollTo(0, -1);
    }
  }

  // Extract file extension
  getFileExtension() {
    const filename = this.file.name.split(/[\\/]/).pop() as String;
    return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase() || '';
  }

  // Custom save logic (can be extended according to requirements)
  onFileSave = (data: any) => {
    console.log('Saved data：', data);
  }
}
