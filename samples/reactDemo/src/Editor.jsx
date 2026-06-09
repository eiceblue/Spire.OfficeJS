import { useRef, useEffect } from "react"
import { useFileStore } from './App';
import { useNavigate } from 'react-router-dom';

function Editor() {
    const { file, fileUint8Data } = useFileStore();
    const navigate = useNavigate();

    const config = useRef({});
    let Editor = useRef(null);
    let Api = useRef(null);
    let originUrl = window.location.origin;

    useEffect(() => {
        if (!file) {
            navigate('/')
            return;
        }
        // Dynamically load Spire.OfficeJS
        loadScript();
    }, [])

    const loadScript = () => {
        var script = document.createElement('script');
        // Adjust according to your product package path
        script.setAttribute('src', '/spire.cloud/web/editors/spireapi/SpireCloudEditor.js');
        script.onload = () => initEditor()
        document.head.appendChild(script);
    }

    const initEditor = () => {
        let iframeId = 'iframeEditor';
        initConfig();
        Editor = new SpireCloudEditor.OpenApi(iframeId, config.value);
        window.Api = Api = Editor.GetOpenApi();
        OnWindowReSize();
    }

    const initConfig = () => {
        config.value = {
            "fileAttrs": {
                "fileInfo": {
                    "name": file.name,
                    "ext": getFileExtension(),
                    "primary": String(new Date().getTime()),
                    "creator": "User",
                    "createTime": new Date().toLocaleString()
                },
                "sourceUrl": originUrl + "/files/" + file.name,
                "createUrl": originUrl + "/open",
                "mergeFolderUrl": "",
                "fileChoiceUrl": "",
                "templates": {}
            },
            "user": {
                "id": "uid-1",
                "name": "User",
                "canSave": true,
            },
            "editorAttrs": {
                "editorMode": "edit",
                "editorWidth": "100%",
                "editorHeight": "100%",
                "editorType": "document",  // document/spreadsheet/presentation
                "platform": "desktop",
                "viewLanguage": "en",  // en/zh
                "isReadOnly": false,
                "canChat": true,
                "canComment": true,
                "canReview": true,
                "canDownload": true,
                "canEdit": true,
                "canForcesave": true,
                "embedded": {
                    "saveUrl": "",
                    "embedUrl": "",
                    "shareUrl": "",
                    "toolbarDocked": "top"
                },
                // Enable WebAssembly to improve performance
                "useWebAssemblyDoc": true,
                "useWebAssemblyExcel": true,
                "useWebAssemblyPpt": true,
                "spireDocJsLicense": "",
                "spireXlsJsLicense": "",
                "spirePresentationJsLicense": "",
                "spirePdfJsLicense": "",
                // Serverless mode: process files directly in memory without a backend
                "serverless": {
                    "useServerless": true,
                    "baseUrl": originUrl,
                    "fileData": fileUint8Data,  // The file’s Uint8Array data
                },
                "events": {
                    "onSave": onFileSave
                },
                "plugins": {
                    "pluginsData": []
                }
            }
        };
    }

    const OnWindowReSize = () => {
        let wrapEl = document.getElementById("editor-container");
        if (wrapEl) {
            wrapEl.style.height = screen.availHeight + "px";
            window.scrollTo(0, -1);
            wrapEl.style.height = window.innerHeight + "px";
        }
    }

    const getFileExtension = () => {
        const filename = file.name.split(/[\\/]/).pop();
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase() || '';
    }

    const onFileSave = (data) => {
        console.log('saved data:', data)
        // Implement the save logic here
        // For example, send the file to a server or download it
    }

    return (
        <div id="editor-container">
            <div id="iframeEditor"></div>
        </div>
    )
}

export default Editor

