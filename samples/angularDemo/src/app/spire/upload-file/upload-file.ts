import { ViewChild, ElementRef, Component, AfterViewInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { fileStore } from '../../store/index';

@Component({
  selector: 'app-upload-file',
  imports: [],
  templateUrl: './upload-file.html',
  styleUrl: './upload-file.css',
})
export class UploadFile implements AfterViewInit {
  constructor(private router: Router) { }
  // Inject state management store
  store = inject(fileStore);

  // Bind HTML elements
  @ViewChild('browseBtn') browseBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  file: File | null = null; // Uploaded file object
  fileUint8Data: Uint8Array | null = null; // File binary data

  // Execute after component view initialization is complete
  ngAfterViewInit() {
    this.init();
  }

  // Initialize drag-and-drop event listening
  init() {
    // Prevent default browser behavior for drag-and-drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, this.preventDefaults, false);
    });

    // Listen for file drop events
    document.addEventListener('drop', (e) => {
      this.handleDrop.call(this, e);
    }, false);
  }

  // Prevent default events
  preventDefaults(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Trigger native file input when select file is clicked
  handleButtonClick(e: Event) {
    e.preventDefault();
    this.fileInput.nativeElement.click();
  }

  // Handle file selection (drag-and-drop or click)
  async handleDrop(e: any) {
    // Retrieve file object
    if (e.target && e.target.files) {
      this.file = e.target.files[0];
    } else if (e.dataTransfer && e.dataTransfer.files) {
      this.file = e.dataTransfer.files[0];
    }

    // Convert file to Uint8Array binary format
    this.fileUint8Data = await this.handleFile(this.file) as Uint8Array;

    // Update global state
    this.store.setFileData(this.file);
    this.store.setFileUint8Data(this.fileUint8Data);

    // Navigate to editor
    this.openDocument();
  }

  // Convert file to Uint8Array binary data
  handleFile(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file); // Read file in ArrayBuffer format
    });
  }

  // Navigate to the editor page (route navigation)
  openDocument() {
    this.router.navigate(['spire']);
  }
}

