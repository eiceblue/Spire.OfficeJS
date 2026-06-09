<template>
    <div class="form">
        <div id="iframeEditor">
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useFileStore } from '../stores/file.js'
import { useRouter } from 'vue-router';

const fileStore = useFileStore()
// Data stored in Pinia
const { file, fileUint8Data } = storeToRefs(fileStore) 
const router = useRouter() 
const config = ref({});
const isOpened = ref(false);
const editorInstance = ref(null);
const apiInstance = ref(null);
const originUrl = window.location.origin

onMounted(() => {
    // Redirect back to upload page if no file exists
    if (!file.value) {
        router.replace('/');
        return;
    }
    // Load editor script dynamically
    loadScript();
    window.addEventListener('resize', OnWindowReSize);
})

onUnmounted(() => {
    window.removeEventListener('resize', OnWindowReSize);
})

// Initialize the configuration object required by the editor
function initConfig() {
    if (!file.value) {
        throw new Error('File not found, please upload again');
    }

    if (!fileUint8Data.value) {
        throw new Error('File data not found, please upload again');
    }

    config.value = {
        "fileAttrs": {
            "fileInfo": {
                "name": file.value.name,
                "ext": getFileExtension(),
                "primary": String(new Date().getTime()),
                "creator": "Jonn",
                "createTime": "2022-04-18 11:30:43"
            },
            "sourceUrl": originUrl + "/files/__ffff_192.168.2.134/" + file.value.name,
            "createUrl": originUrl + "/open",
            "mergeFolderUrl": "",
            "fileChoiceUrl": "",
            "templates": {}

        },
        "user": {
            "id": "uid-1",
            "name": "Jonn",
            "canSave": true,
        },
        "editorAttrs": {
            "editorMode": "edit",
            "editorWidth": "100%",
            "editorHeight": "100%",
            "editorType": "document",
            "platform": "desktop", // desktop / mobile / embedded
            "viewLanguage": "en", // en / zh
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
            "useWebAssemblyDoc": true,
            "useWebAssemblyExcel": true,
            "useWebAssemblyPpt": true,
            "spireDocJsLicense": "",
            "spireXlsJsLicense": "",
            "spirePresentationJsLicense": "",
            "spirePdfJsLicense": "",
            "serverless": {
                "useServerless": true,
                "baseUrl": originUrl,
                "fileData": fileUint8Data.value,
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

// Create and render the SpireCloudEditor instance
function initEditor() {
    let iframeId = 'iframeEditor';

    initConfig();
    isOpened.value = true;
    editorInstance.value = new SpireCloudEditor.OpenApi(iframeId, config.value); // Create editor instance
    window.Api = apiInstance.value = editorInstance.value.GetOpenApi(); // Expose OpenApi for debugging/saving
    OnWindowReSize();
}

// Get the uploaded file extension for fileInfo.ext
function getFileExtension() {
    const filename = file.value.name.split(/[\\/]/).pop();
    // Get the substring after the last dot
    return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase() || '';
}

// Adjust editor container size to fit the window
function OnWindowReSize() {
    let wrapEl = document.getElementsByClassName("form");
    if (wrapEl.length) {
        wrapEl[0].style.height = screen.availHeight + "px";
        window.scrollTo(0, -1);
        wrapEl[0].style.height = window.innerHeight + "px";
    }
}

// Dynamically load the SpireCloudEditor script to avoid duplicate injection
function loadScript() {
    if (window.SpireCloudEditor) {
        initEditor()
        return
    }
    const script = document.createElement('script');
    script.setAttribute('src', '/spire.cloud/web/editors/spireapi/SpireCloudEditor.js');
    script.onload = () => initEditor()
    document.head.appendChild(script);
}

// Save callback for the Spire editor, can be connected to custom save logic
function onFileSave(data) {
    console.log('save data', data)
}

</script>

<style>
.form,
iframe,
body {
    min-height: 100vh !important;
    min-width: 100vh !important;
}
</style>
