import { useRef, useEffect } from "react"
import { useFileStore } from './App';
import { useNavigate } from 'react-router-dom';

function Home() {
    const { setFileData, setFileUint8Data } = useFileStore();
    const navigate = useNavigate();

    let dropArea = null;
    let fileInput = useRef();
    let file = null;
    let fileUint8Data = null;

    useEffect(() => {
        dropArea = document;

        // Prevent the default drag-and-drop behavior
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        // Handle file drag-and-drop
        dropArea.addEventListener('drop', handleDrop, false);
    }, [])

    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const handleBtnClick = (e) => {
        e.preventDefault();
        fileInput.current.click();
    }

    const handleDrop = async (e) => {
        if (e.target && e.target.files)
            file = e.target.files[0]
        else if (e.dataTransfer && e.dataTransfer.files)
            file = e.dataTransfer.files[0];
        
        if (!file) return;

        fileUint8Data = await handleFile(file);
        setFileData(file);
        setFileUint8Data(fileUint8Data);
        openDocument();
    }

    const handleFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const arrayBuffer = reader.result;
                const uint8Array = new Uint8Array(arrayBuffer);
                resolve(uint8Array);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    }

    const openDocument = () => {
        navigate('/editor')
    }

    return (
        <div>
            <div>
                <h2>Upload Your File</h2>
                <div>
                    <p>Drag your file to the browser</p>
                     <p style={{ marginLeft: '20px' }}>or</p> 
                    <button ref={fileInput} onClick={handleBtnClick}>Choose Your File</button>
                    <input 
                        type="file" 
                        id="fileInput" 
                        ref={fileInput} 
                        onChange={handleDrop} 
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
        </div>
    )
}

export default Home

