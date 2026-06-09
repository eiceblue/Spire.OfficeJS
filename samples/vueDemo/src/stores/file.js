import { ref } from 'vue'
// Import defineStore from Pinia to define a state management store
import { defineStore } from 'pinia'

// Define a file state management store
export const useFileStore = defineStore('file', () => {
  // Store the uploaded file object (File type)
  let file = ref(null)
  // Store the file binary data (Uint8Array format) for editor loading
  let fileUint8Data = ref(null);

  // Set the file object
  function setFileData(data) {
    file.value = data;
  }
  // Set the file binary data
  function setFileUint8Data(data) {
    fileUint8Data.value = data;
  }
  // Export state and methods for component usage
  return { file, fileUint8Data, setFileData, setFileUint8Data }
})
