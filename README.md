# Pure Front-End JavaScript Toolkit for In-Browser Office Document Viewing & Editing

[Product Page](https://www.e-iceblue.com/Introduce/spire-office-js.html) | [Download](https://www.e-iceblue.com/Download/Spire-OfficeJS.html) | [Documentation](https://www.e-iceblue.com/Tutorials/Spire.OfficeJs/Getting-Started/integrate-spire-officejs-into-vue.html) | [Forum](https://www.e-iceblue.com/forum/) | [Temporary License](https://www.e-iceblue.com/TemLicense.html) | [Customized Demo](https://www.e-iceblue.com/Misc/customized-demo.html)


[Spire.OfficeJS](https://www.e-iceblue.com/Introduce/spire-office-js.html) is a fully client-side Office component suite. It empowers web apps to create, edit and preview Word, Excel and PowerPoint files directly in browsers — with no Microsoft Office installation or backend service dependency required.

Beyond Office document processing, it also delivers streamlined PDF preview capabilities, bringing users a seamless and efficient document interaction experience for modern web applications.

## Core Advantages
- **Client-side Only:** All document rendering and processing happens locally in the browser, completely removing the need for server-based file conversion.
- **Full Editing Tools:** Support regular editing, comment adding, annotation marking, content review and one-click file saving.
- **Broad Compatibility:** Works with standard file formats from Microsoft Office (DOCX, XLSX, PPTX) and WPS.
- **Framework Friendly:** Can be quickly integrated into mainstream front-end projects including [**Vue**](https://www.e-iceblue.com/Tutorials/Spire.OfficeJs/Getting-Started/integrate-spire-officejs-into-vue.html), [**React**](https://www.e-iceblue.com/Tutorials/Spire.OfficeJs/Getting-Started/integrate-spire-officejs-into-react.html), [**Angular**](https://www.e-iceblue.com/Tutorials/Spire.OfficeJs/Getting-Started/integrate-spire-officejs-into-angular.html) and pure [**HTML**](https://www.e-iceblue.com/Tutorials/Spire.OfficeJs/Operation/embed-office-editor-in-web-page.html) projects.
- **Customizable:** Customize toolbars, set user access permissions, configure save callbacks and extend functions via plugins.


## Application Scenarios
Spire.OfficeJS is tailored for enterprise-level web business scenarios and can be widely deployed in various document-centric web systems:
- Enterprise internal management & back-office systems
- Professional Document Management Systems (DMS)
- Online collaborative office & team collaboration platforms
- Online education & learning management systems
- Web form submission and business workflow approval systems


## Supported Input Formats
The SDK is divided into multiple independent modules, each supporting different file formats. 

| Module | Compatible Formats |
| ---- | ---- |
| Spire.WordJS | DOC, DOCX, DOCM, DOTX, DOTM, WordXML, RTF, ODT, WPS, WPT |
| Spire.ExcelJS | XLS, XLSX, XLSB, XLSM, ODS, WPS (.et, .ett) |
| Spire.PresentationJS | PPT, PPTX, PPS, PPSX, DPS, DPT |

> Note: Editing and export capabilities vary by module. Please refer to each module section for detailed functionality.


## Spire.OfficeJS Modules Overview
### Spire.WordJS - Online Word Processor
A professional front-end Word editing component that supports full lifecycle processing of Word documents in the browser. It allows users to **create, open, edit and export DOCX files** directly in browsers, and fully supports text styling, images, tables, paragraphs, and page layouts.


### Spire.ExcelJS - Online Excel Editor
A browser-based spreadsheet engine for **online spreadsheet creation, editing, formula calculation and format conversion** without relying on desktop Excel software. It also includes cell styling, chart generation and data validation features.


### Spire.PresentationJS – Online PowerPoint Editor
A client-side PowerPoint editing and rendering component. It enables **slide creation and editing directly in the browser**, with full support for text, shapes, images, multimedia content, slide masters and layout configuration.


### Spire.PDFJS – Lightweight PDF Viewer
A lightweight dedicated PDF front-end preview component, focusing on **fast loading and smooth browsing of PDF documents**. It features small package size and fast rendering speed, suitable for pure PDF preview business scenarios (no editing function supported).



## Quick Integration Example: Embed into an HTML Page

**Step 1: Create the HTML structure**

Create the page layout: sidebar for document selection, main container for the office editor.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Document Editor Integration</title>
  <style>
    .app-container {
      display: flex;
      height: 100vh;
    }

    .sidebar {
      width: 250px;
      border-right: 1px solid #ddd;
      padding: 10px;
      background: #f5f5f5;
    }

    .editor-container {
      flex: 1;
      position: relative;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <div class="sidebar">
      <h3>Documents</h3>
      <ul>
        <li onclick="openDocument('http://localhost:3000/public/samples/sample.docx', 'docx')">Sample Document.docx</li>
        <li onclick="openDocument('http://localhost:3000/public/samples/sample.xlsx', 'xlsx')">Sample Spreadsheet.xlsx</li>
        <li onclick="openDocument('http://localhost:3000/public/samples/sample.pptx', 'pptx')">Sample Presentation.pptx</li>
      </ul>
    </div>

    <div class="editor-container" id="editor"></div>
  </div>
</body>
</html>
```

**Step 2: Add the Spire.OfficeJS script and initialize**

Append the script before the closing </body> tag. This part includes SDK loading, editor initialization, event handling and file download logic.

```javascript
<script src="http://localhost:8001/web/editors/spireapi/SpireCloudEditor.js"></script>

<script>
function initEditor() {
  const config = {
    user: {
      id: 'user1',
      name: 'Demo User'
    },
    fileAttrs: {
      sourceUrl: "http://localhost:3000/public/samples/sample.docx",
      fileInfo: {
        ext: "docx",
        name: "sample.docx"
      }
    },
    editorAttrs: {
      editorType: "document",
      editorMode: "edit",
      editorWidth: "100%",
      editorHeight: "100%",
      platform: "desktop",
      viewLanguage: "en",
      canEdit: true,
      canDownload: true,
      canForcesave: true,
      useWebAssemblyDoc: true,
      useWebAssemblyExcel: true,
      useWebAssemblyPpt: true,
      useWebAssemblyPdf: true,
      serverless: {
        useServerless: true,
        baseUrl: "http://localhost:8001"
      },
      embedded: {
        saveUrl: "",
        toolbarDocked: 'top'
      },
      events: {
        onDocumentReady: function() {
          console.log('Document is ready');
        },
        onError: function(event) {
          console.error('Editor error:', event);
        },
        onSave: function(data) {
          console.log('Document saved', data);
          if (data && data.data && data.data.length >= 2) {
            downloadFile(data.data[1], data.data[0]);
          }
        }
      }
    }
  };

  new SpireCloudEditor.OpenApi("editor", config);
}

function downloadFile(file, fileName) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

initEditor();
</script>
```

While this example uses plain JavaScript, the core integration logic works identically for modern front-end frameworks including React, Vue and Angular. For more details, refer to the guide: [How to Embed an Office Document Editor in an HTML Page](https://www.e-iceblue.com/Tutorials/Spire.OfficeJs/Operation/embed-office-editor-in-web-page.html).


[Product Page](https://www.e-iceblue.com/Introduce/spire-office-js.html) | [Download](https://www.e-iceblue.com/Download/Spire-OfficeJS.html) | [Documentation](https://www.e-iceblue.com/Tutorials/Spire.OfficeJs/Getting-Started/integrate-spire-officejs-into-vue.html) | [Forum](https://www.e-iceblue.com/forum/) | [Temporary License](https://www.e-iceblue.com/TemLicense.html) | [Customized Demo](https://www.e-iceblue.com/Misc/customized-demo.html)

