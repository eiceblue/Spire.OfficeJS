import { createContext, useContext, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Home';
import Editor from './Editor';

// File state context
const FileContext = createContext();

export const useFileStore = () => useContext(FileContext);

function FileProvider({ children }) {
  const [file, setFile] = useState(null);
  const [fileUint8Data, setFileUint8Data] = useState(null);
  
  return (
    <FileContext.Provider value={{ 
      file, 
      fileUint8Data, 
      setFileData: setFile, 
      setFileUint8Data 
    }}>
      {children}
    </FileContext.Provider>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/editor', element: <Editor /> },
]);

function App() {
  return (
    <FileProvider>
      <RouterProvider router={router} />
    </FileProvider>
  );
}

export default App;
