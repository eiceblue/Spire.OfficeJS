import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

// 定义文件状态接口
interface FileState {
  file: File | null;          // 上传的文件对象
  fileUint8Data: Uint8Array | null; // 文件二进制数据
}

// 初始状态
const initialState: FileState = {
  file: null,
  fileUint8Data: null,
};

// 创建全局 Store
export const fileStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    // 更新文件对象
    setFileData(data: File | null): void {
      patchState(store, { file: data });
    },
    // 更新文件二进制数据
    setFileUint8Data(uint8Data: Uint8Array | null): void {
      patchState(store, { fileUint8Data: uint8Data });
    }
  }))
);
