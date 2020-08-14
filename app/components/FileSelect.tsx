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
  Modal,
  notification,
} from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile, RcFile, UploadProps } from 'antd/lib/upload/interface';
import { LabeledValue } from 'antd/lib/select';
import Progress from './Progress';
import {
  validateFile,
  validateFileData,
  // validateFileList,
  // validateFileListData,
} from '../services/files';
import ValidationError, {
  FileWithDataValidation,
  FileWithError,
} from './ValidationError';

const { Option } = Select;

const { Title, Text, Link: LinkAnt } = Typography;
const { Dragger } = Upload;

type NewFiles = UploadFile<any> & { path: string };

export default function FileSelect() {
  const history = useHistory();
  const [hidden, setHidden] = useState(true);
  const organization = JSON.parse(localStorage!.getItem('organization')!);
  const [newFilesOk, setNewFilesOk] = useState<boolean>();

  const [newFiles, setNewFiles] = useState<NewFiles[] | undefined>(
    JSON.parse(localStorage!.getItem('newFiles')!)
  );

  const [oldFiles, setOldFiles] = useState<
    string | number | LabeledValue | null
  >(localStorage.getItem('oldFiles'));

  let wrongFiles: FileWithError[] = [];
  let wrongFilesData: FileWithDataValidation[] = [];

  const displayErros = (
    wrongFilesDis: FileWithError[],
    wrongFilesDataDis: FileWithDataValidation[]
  ) => {
    Modal.error({
      width: '700px',
      title: 'Niepoprawne pliki',
      content: (
        <ValidationError
          wrongFiles={wrongFilesDis as FileWithError[]}
          wrongData={wrongFilesDataDis as FileWithDataValidation[]}
        />
      ),
    });
  };

  const onBeforeUpload = async (file: RcFile, fileList: RcFile[]) => {
    // TODO: przechowywać zaimportowane dane w stanie
    // TODO: walidacja relacji fk pk po ostatnim pliku kiedy jest komplet przez js lub sql
    // TODO: blokada mieszania typów ms apple
    // TODO: import danych do bazy
    const validFile = validateFile(file);
    let reject = false;

    if (validFile === true) {
      const validFileData = await validateFileData(file);
      if (validFileData.result.inValidMessages.length > 0) {
        wrongFilesData.push(validFileData);
        reject = true;
      }
    } else {
      wrongFiles.push({ file, validationErrors: validFile });
      reject = true;
    }

    if (fileList[fileList.length - 1].uid === file.uid) {
      displayErros(wrongFiles, wrongFilesData);
      wrongFilesData = [];
      wrongFiles = [];
    }

    if (reject) return Promise.reject(new Error('Nieperawidłowy plik'));
    return Promise.resolve();
  };

  const onFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status) {
      const { status } = info.file;
      const filePath = (info!.file!.originFileObj as File).path;
      const fileListWithPaths = info.fileList.map((file) => {
        const fileWithPath: UploadFile<any> & { path: string } = {
          ...file,
          path: filePath,
        };
        return fileWithPath;
      });

      if (status === 'done') {
        notification.success({
          placement: 'bottomRight',
          message: info.file.name,
          style: { width: '100%' },
        });
      } else if (status === 'error') {
        message.error(`${info.file.name} plik nie może być załadowany.`);
      }
      localStorage.setItem(
        'newFiles',
        JSON.stringify(fileListWithPaths.slice(-6))
      );
      setNewFiles(fileListWithPaths.slice(-6));
    }
  };

  const deleteNewFile = (index: number) => {
    const newFilesFiltered = newFiles!.filter(
      (value, arrIndex) => arrIndex !== index
    );

    setNewFiles(newFilesFiltered);
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
        <Row align="top" gutter={48} style={{ padding: '18px 0px' }}>
          <Col>
            <Dragger
              accept="text/csv"
              beforeUpload={onBeforeUpload}
              fileList={newFiles}
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
              {/* {newFiles?.length === 6 ? (
                <p className="ant-upload-text">
                  Sześć wymaganych plików zostało załadowanych. Usuń pliki jeśli
                  chcesz je zmienić.
                </p>
              ) : ( */}
              <p className="ant-upload-text">
                Kliknij lub upuść pliki w tym miejscu pliki{' '}
                <Text strong>CSV</Text>
              </p>
              {/* )} */}
            </Dragger>
          </Col>
          <Col>
            {newFiles && (
              <List
                className="newFilesList"
                header={
                  <div>
                    <Text strong>Pliki do wysłania (.csv)</Text>
                    <DownloadOutlined style={{ padding: '0 12px' }} />
                  </div>
                }
                dataSource={newFiles}
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
                    {item.name}
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
