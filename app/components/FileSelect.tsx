import React, { useState } from 'react';
import path from 'path';
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
import { FilesData } from 'files';
import Progress from './Progress';
import {
  validateFile,
  validateFileData,
  areArraysEqualSets,
  importToDb,
} from '../services/files';
import ValidationError, {
  FileWithDataValidation,
  FileWithError,
} from './ValidationError';
import {
  allowedFileNamesASMNoExt,
  allowedFileNamesMSLowerNoExt,
} from '../services/const';

const { Option } = Select;

const { Title, Text, Link: LinkAnt } = Typography;
const { Dragger } = Upload;

type NewFiles = UploadFile<any> & { path: string };

export default function FileSelect() {
  const history = useHistory();
  const [hidden, setHidden] = useState(true);
  const organization = JSON.parse(localStorage!.getItem('organization')!);
  const [newFilesOk, setNewFilesOk] = useState<boolean>(
    JSON.parse(localStorage!.getItem('newFilesOk')!)
  );

  const [newFilesStandard, setNewFilesStandard] = useState<
    'APPLE' | 'MS' | undefined
  >(JSON.parse(localStorage!.getItem('newFilesStandard')!));

  const [newFiles, setNewFiles] = useState<NewFiles[] | undefined>(
    JSON.parse(localStorage!.getItem('newFiles')!)
  );

  const [newFilesData, setNewFilesData] = useState<FilesData>(
    localStorage.getItem('newFilesData') !== null
      ? JSON.parse(localStorage!.getItem('newFilesData')!)
      : []
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
    if (wrongFilesDis.length > 0 || wrongFilesDataDis.length > 0) {
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
    }
  };

  const checkIfOk = () => {
    const files = newFilesData.map((data) => Object.keys(data)[0]);
    const filesStandard = areArraysEqualSets(files, allowedFileNamesASMNoExt)
      ? 'APPLE'
      : areArraysEqualSets(files, allowedFileNamesMSLowerNoExt) && 'MS';
    // TODO: convert if needed, clear db, import
    if (filesStandard === 'APPLE' || filesStandard === 'MS') {
      console.log(newFilesData);
      console.log('OK');
      setNewFilesOk(true);
      localStorage.setItem('newFilesOk', JSON.stringify(true));
      setNewFilesStandard(filesStandard);
      localStorage.setItem('newFilesStandard', JSON.stringify(filesStandard));
    } else {
      setNewFilesOk(false);
      localStorage.setItem('newFilesOk', JSON.stringify(false));
    }
  };

  const importData = () => {
    if (newFilesStandard === 'MS' || newFilesStandard === 'APPLE') {
      importToDb(newFilesData, newFilesStandard);
    }
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
      } else {
        setNewFilesData((data) =>
          [
            ...data,
            { [path.parse(file.name).name]: validFileData.result },
          ].slice(-6)
        );
      }
    } else {
      wrongFiles.push({ file, validationErrors: validFile });
      reject = true;
    }

    if (fileList[fileList.length - 1].uid === file.uid) {
      checkIfOk();
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
      localStorage.setItem('newFilesData', JSON.stringify(newFilesData));

      // TODO: import to database if all six files loaded
      if (info.fileList[info.fileList.length - 1].uid === info.file.uid) {
        if (newFilesData.length === 6) {
          checkIfOk();
        }
      }
    }
  };

  const deleteNewFile = (index: number) => {
    const newFilesFiltered = newFiles!.filter(
      (value, arrIndex) => arrIndex !== index
    );
    // const fileName = path.parse(newFiles![index].name).name;
    const newFilesDataFiltered = newFilesData!.filter(
      (value, arrIndex) => arrIndex !== index
    );
    setNewFilesData(newFilesDataFiltered);
    setNewFiles(newFilesFiltered);
    localStorage.setItem('newFiles', JSON.stringify(newFilesFiltered));
    localStorage.setItem('newFilesData', JSON.stringify(newFilesDataFiltered));
    localStorage.setItem('newFilesOk', JSON.stringify(false));
    setNewFilesOk(false);
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
              Apple School Manager
            </LinkAnt>{' '}
            oraz{' '}
            <LinkAnt href="https://docs.microsoft.com/en-us/schooldatasync/school-data-sync-format-csv-files-for-sds">
              Microsoft School Data Sync v1
            </LinkAnt>
            .
          </Text>
        </Row>
        <Row align="top" gutter={48} style={{ padding: '18px 0px' }}>
          <Col span={16}>
            <Dragger
              accept="text/csv"
              beforeUpload={onBeforeUpload}
              fileList={newFiles}
              style={{
                padding: '12px',
                marginTop: '12px',
                // minWidth: '600px',im
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
            <Button onClick={importData}>Importuj</Button>
            {newFilesOk && (
              <Row style={{ padding: '24px 0px' }}>
                <Alert
                  message="Pliki zostały pomyślnie zweryfikowane i skonwertowane do formatu zgodnego z ASM. Pobierz je jeśli chcesz je edytować lub wysłać niezależnie."
                  type="success"
                  showIcon
                />
              </Row>
            )}
          </Col>
          <Col span={8}>
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
        {/* {newFilesOk && (
          <Row style={{ padding: '24px 0px' }}>
            <Alert
              message="Pliki zostały pomyślnie zweryfikowane i skonwertowane do formatu zgodnego z ASM. Pobierz je jeśli chcesz je edytować lub wysłać niezależnie."
              type="success"
              showIcon
            />
          </Row>
        )} */}

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
                disabled={!newFilesOk}
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
