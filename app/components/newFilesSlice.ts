import { createSlice } from '@reduxjs/toolkit';
import { UploadFile } from 'antd/lib/upload/interface';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';

const newFilesSlice = createSlice({
  name: 'newFiles',
  initialState: {},
  reducers: {
    setFiles: (state, action: { payload: UploadFile<any>[]; type: string }) =>
      action.payload,
  },
});

export const { setFiles } = newFilesSlice.actions;

export default newFilesSlice.reducer;

export const selectNewFiles = (state: RootState) => state.newFiles;
