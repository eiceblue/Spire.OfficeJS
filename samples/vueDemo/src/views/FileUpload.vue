<template>
    <main>
        <button @click="btnClick">Choose Your File</button>
        <label>
            <input id="input" type="file" @change="handleFileChange" style="display: none;" />
        </label>
    </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useFileStore } from '../stores/file'

// Router instance: redirect to /document after successful upload
const router = useRouter()
// Pinia Store: store the user-uploaded file and binary data
const fileStore = useFileStore()

// Handle file upload
async function handleFileChange(event) {
    // Get the file selected by the user through the input change event
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
        return
    }

    // Save the original File object and binary data for the editor to read
    fileStore.setFileData(selectedFile)
    const buffer = await selectedFile.arrayBuffer()
    fileStore.setFileUint8Data(new Uint8Array(buffer))

    // Redirect to the document editing page after successful upload
    router.push('/document')
}
function btnClick() {
    var btn = document.querySelector('#input');
    btn.click()
}
</script>

