import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Typography, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import Progress from './Progress';
import { setFiles, selectNewFiles } from './newFilesSlice';

const { Title, Text, Link: LinkAnt } = Typography;
const { Dragger } = Upload;

export default function FileSelect() {
  const organization = localStorage.getItem('organization');
  const dispatch = useDispatch();
  const newFiles = useSelector(selectNewFiles);

  const onFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
      dispatch(setFiles(info.fileList));
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <>
      <div className="main">
        <Link to="/">back</Link>
        <Row>
          <Title level={3}>
            Wysyłka plików w imieniu
            <span style={{ color: '#1890ff' }}> {organization}</span>
          </Title>
        </Row>
        <Row>
          <Text>
            1. Upuść lub wskaż wszystkie niezbędne pliki csv. Aktualnie
            obsługiwane formaty to{' '}
            <LinkAnt href="https://support.apple.com/pl-pl/HT207029#fillout">
              School Manager
            </LinkAnt>{' '}
            oraz{' '}
            <LinkAnt href="https://docs.microsoft.com/en-us/schooldatasync/school-data-sync-format-csv-files-for-sds">
              Microsoft School Data Sync
            </LinkAnt>
            .
          </Text>
        </Row>
        <Row>
          <Dragger multiple name="file" onChange={onFileChange}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibit from
              uploading company data or other band files
            </p>
          </Dragger>
        </Row>
        <Row
          align="bottom"
          style={{
            marginTop: 'auto',
            padding: '24px 0px',
          }}
        >
          <Progress current={1} onChange={() => 1} />
        </Row>
      </div>
    </>
  );
}
