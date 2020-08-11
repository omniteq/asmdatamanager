import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  Row,
  Typography,
  Upload,
  message,
  List,
  Col,
  Alert,
  Select,
  Button,
} from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { LabeledValue } from 'antd/lib/select';
import Progress from './Progress';
import { validateFile } from '../services/files';

const { Option } = Select;

const path = require('path');

const { Title, Text, Link: LinkAnt } = Typography;
const { Dragger } = Upload;

// type FileList = {
//   fileList: [{ uid: string; name: string; status: string; url: string }];
// };

export default function FileSelect() {
  // console.log(process.arch);
  const history = useHistory();
  const [hidden, setHidden] = useState(true);
  const organization = JSON.parse(localStorage!.getItem('organization')!);
  const [newFilesOk, setNewFilesOk] = useState<boolean>();
  // TODO: replace with reducer
  const [newFiles, setNewFiles] = useState<Array<string>>(
    JSON.parse(localStorage.getItem('newFiles')!)
  );
  const [newFileNames, setNewFileNames] = useState<string[] | null>(
    newFiles?.length > 0
      ? newFiles.map((file) => {
          return path.basename(file);
        })
      : null
  );
  const [fileList, setFileList] = useState<UploadFile<any>[]>(
    JSON.parse(localStorage.getItem('newFileList')!)
  );
  const [oldFiles, setOldFiles] = useState<
    string | number | LabeledValue | null
  >(localStorage.getItem('oldFiles'));

  const onFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
    validateFile((info?.file?.originFileObj as File).path);

    const { status } = info.file;
    const filePaths = info.fileList.map((item) => {
      const file = item.originFileObj as File;
      return file.path;
    });
    if (status !== 'uploading') {
      setNewFiles(filePaths);
      setNewFileNames(
        filePaths.map((file) => {
          return path.basename(file);
        })
      );
    }
    if (status === 'done') {
      message.success(`${info.file.name} plik załadowany pomyślnie.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} plik nie może być załadowany.`);
    }
    setFileList(info.fileList.slice(-6));
    localStorage.setItem('newFiles', JSON.stringify(filePaths));
    localStorage.setItem(
      'newFileList',
      JSON.stringify(info.fileList.slice(-6))
    );
  };

  const deleteNewFile = (index: number) => {
    const newFilesFiltered = newFiles!.filter(
      (value, arrIndex) => arrIndex !== index
    );

    const newFileNamesFiltered = newFileNames!.filter(
      (value, arrIndex) => arrIndex !== index
    );

    const fileListFiltered = fileList!.filter(
      (value, arrIndex) => arrIndex !== index
    );

    setNewFileNames(newFileNamesFiltered);
    setNewFiles(newFilesFiltered);
    setFileList(fileListFiltered);
    localStorage.setItem('newFiles', JSON.stringify(newFilesFiltered));
  };

  const onSelectOldFiles = (value: string | number | LabeledValue) => {
    if (typeof value === 'string') {
      localStorage.setItem('oldFiles', value);
    }
  };

  const onClickNext = () => {
    history.push('/podglad');
  };

  const onClickBack = () => {
    history.push('/');
  };

  return (
    <>
      <div className="main">
        <Row>
          <Title level={3}>
            Wysyłka plików w imieniu
            <span style={{ color: '#1890ff' }}> {organization?.name}</span>
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
        <Row
          align="top"
          gutter={48}
          // justify="center"
          style={{ padding: '18px 0px' }}
        >
          <Col>
            <Dragger
              fileList={fileList}
              style={{
                padding: '12px',
                minWidth: '600px',
                background: 'white',
              }}
              multiple
              name="file"
              onChange={onFileChange}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              {newFiles?.length === 6 ? (
                <p className="ant-upload-text">
                  Sześć wymaganych plików zostało załadowanych. Usuń pliki jeśli
                  chcesz je zmienić.
                </p>
              ) : (
                <p className="ant-upload-text">
                  Kliknij lub upuść pliki w tym miejscu
                </p>
              )}
            </Dragger>
          </Col>
          <Col>
            {newFileNames && (
              <List
                className="newFilesList"
                header={
                  <div>
                    <Text strong>Pliki do wysłania (.csv)</Text>
                    <DownloadOutlined style={{ padding: '0 12px' }} />
                  </div>
                }
                dataSource={newFileNames}
                renderItem={(item, index) => (
                  <List.Item
                    onMouseOver={() => setHidden(false)}
                    onMouseOut={() => setHidden(true)}
                    actions={[
                      <DeleteOutlined
                        key="delete"
                        className={hidden ? 'hidden' : ''}
                        onClick={() => deleteNewFile(index)}
                      />,
                    ]}
                  >
                    {item}
                  </List.Item>
                )}
              />
            )}
          </Col>
        </Row>
        {newFilesOk && (
          <Row>
            <Alert
              message="Pliki zostały pomyślnie zweryfikowane i skonwertowane do formatu zgodnego z ASM. Pobierz je jeśli chcesz je edytować lub wysłać niezalenie."
              type="success"
              showIcon
            />
          </Row>
        )}

        {newFilesOk && (
          <>
            <Row>
              <Text>
                2. Wybierz historyczną wysyłkę, z którą chcesz porównać
                załadowany powyżej zestaw plików. To pozwoli na przegląd różnic
                przed wysyłką.
              </Text>
            </Row>
            <Row style={{ padding: '18px 0px' }}>
              <Select
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(oldFiles && { defaultValue: oldFiles })}
                size="large"
                style={{ width: '50%', minWidth: '400px' }}
                placeholder="Wybierz wysyłkę"
                onSelect={onSelectOldFiles}
              >
                <Option key="Wysyłka 1">Wysyłka 1</Option>
              </Select>
            </Row>
          </>
        )}
        <Row
          align="bottom"
          style={{
            marginTop: 'auto',
            padding: '24px 0px',
          }}
        >
          <Row
            justify="space-between"
            style={{ margin: '0px 0px 48px', width: '100%' }}
          >
            <Col>
              <Button
                size="large"
                type="default"
                href="/wybor-plikow"
                style={{ padding: '0 24px' }}
                onClick={onClickBack}
              >
                Wróć do wyboru organizacji
              </Button>
            </Col>
            <Col>
              <Button
                size="large"
                type="primary"
                href="/wybor-plikow"
                style={{ padding: '0 24px' }}
                onClick={onClickNext}
              >
                Przejdź do podglądu
              </Button>
            </Col>
          </Row>
          <Progress current={1} onChange={() => 1} />
        </Row>
      </div>
    </>
  );
}
