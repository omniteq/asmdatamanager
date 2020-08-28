import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Divider,
} from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile, RcFile, UploadProps } from 'antd/lib/upload/interface';
import { LabeledValue } from 'antd/lib/select';
import {
  FilesData,
  HistoryFolder,
  FilesDataASM,
  FilesDataMS,
  AsmStudent,
} from 'files';
import { remote } from 'electron';
import Progress from './Progress';
import {
  validateFile,
  validateFileData,
  areArraysEqualSets,
  importToDb,
  getHistory,
  getFileNamesFromDir,
  validateFileList,
  getFilesFromDir,
  validateFileListData,
  clearDbHistorical,
  clearDbNew,
  generateFiles,
  convertData,
  addPassPolicy,
} from '../services/files';
import ValidationError, {
  FileWithDataValidation,
  FileWithError,
} from './ValidationError';
import {
  allowedFileNamesASMNoExt,
  allowedFileNamesMSNoExt,
} from '../services/const';
import db from '../services/db';

const { dialog } = remote;

const { Option } = Select;

const { Title, Text, Link: LinkAnt, Paragraph } = Typography;
const { Dragger } = Upload;

type NewFiles = UploadFile<any> & { path: string };

export default function FileSelect() {
  const history = useHistory();
  const [hidden, setHidden] = useState(true);
  const [organization, setOrganization] = useState(
    JSON.parse(localStorage!.getItem('organization')!)
  );
  const [newFilesOk, setNewFilesOk] = useState<boolean>(
    JSON.parse(localStorage!.getItem('newFilesOk')!)
  );

  const [newFilesStandard, setNewFilesStandard] = useState<
    'APPLE' | 'MS' | null | undefined
  >(JSON.parse(localStorage!.getItem('newFilesStandard')!));

  const [newFiles, setNewFiles] = useState<NewFiles[] | undefined>(
    JSON.parse(localStorage!.getItem('newFiles')!)
  );

  const [newFilesData, setNewFilesData] = useState<FilesData>(
    localStorage.getItem('newFilesData') !== null
      ? JSON.parse(localStorage!.getItem('newFilesData')!)
      : []
  );

  const [oldFiles, setOldFiles] = useState<LabeledValue>(
    JSON.parse(localStorage!.getItem('oldFiles')!)
  );

  const [oldFilesData, setOldFilesData] = useState<FilesDataASM | undefined>(
    localStorage.getItem('oldFilesData') !== null
      ? JSON.parse(localStorage!.getItem('oldFilesData')!)
      : []
  );

  const [showMissPassPolicy, setShowMissPassPolicy] = useState(false);
  const [passPolicy, setPassPolicy] = useState<LabeledValue>(
    localStorage.getItem('passPolicy') !== null
      ? JSON.parse(localStorage!.getItem('passPolicy')!)
      : {
          label: 'Osiom lub więcej znakowe hasło alfanumeryczne',
          value: '8',
        }
  );

  const [historyList, setHistoryList] = useState<HistoryFolder[]>(
    getHistory(organization) as HistoryFolder[]
  );
  const [nextLoading, setNextLoading] = useState(false);
  let wrongFiles: FileWithError[] = [];
  let wrongFilesData: FileWithDataValidation[] = [];

  const displayErros = (
    wrongFilesDis?: FileWithError[],
    wrongFilesDataDis?: FileWithDataValidation[],
    mscError?: any
  ) => {
    if (
      (wrongFilesDis && wrongFilesDis.length > 0) ||
      (wrongFilesDataDis && wrongFilesDataDis.length > 0) ||
      mscError
    ) {
      Modal.error({
        width: '700px',
        title: 'Niepoprawne pliki',
        content: (
          <ValidationError
            wrongFiles={wrongFilesDis as FileWithError[]}
            wrongData={wrongFilesDataDis as FileWithDataValidation[]}
            mscError={mscError}
          />
        ),
      });
    }
  };

  const importData = (
    data: FilesData,
    standard: 'APPLE' | 'MS' | undefined | null,
    historical?: true
  ) => {
    if (standard === 'MS' || standard === 'APPLE') {
      let dataToImport = data;
      if (standard === 'MS') {
        dataToImport = convertData(data as FilesDataMS);
      }
      if (showMissPassPolicy) {
        dataToImport = addPassPolicy(dataToImport, passPolicy);
      }
      return importToDb(dataToImport, standard).catch((err) => {
        console.error(err);
        let errMsg = err.message;
        if (err.message.includes('FOREIGN KEY') === true) {
          errMsg = (
            <>
              <Paragraph>
                <Alert
                  message="Klucze obce czyli wartości w kolumnach typu _id lub SIS ID
                  muszą istnieć w powiązanych plikach."
                  type="error"
                />
              </Paragraph>
              <Paragraph
                ellipsis={{ rows: 2, expandable: true, symbol: 'więcej' }}
              >
                {err.message}
              </Paragraph>
            </>
          );
        }
        if (historical) {
          errMsg = (
            <>
              <Alert
                showIcon
                type="warning"
                message="Pliki wybranej wysyłki historycznej są niepoprawne. Możesz kontynuować
      wysyłkę, ale nie mogą one zostać użyte do porównania."
              />
              <div style={{ marginTop: '18px' }}>
                <Paragraph
                  ellipsis={{ rows: 2, expandable: true, symbol: 'więcej' }}
                >
                  {errMsg}
                </Paragraph>
              </div>
            </>
          );
        }
        displayErros(undefined, undefined, errMsg);
        throw err;
      });
    }
    return Promise.reject(
      new Error(
        'Wrong files format. All files should be either MS SDS or Apple ASM standard'
      )
    );
  };

  useEffect(() => {
    if (newFilesStandard === 'MS') {
      setShowMissPassPolicy(true);
    }
    if (newFilesStandard === 'APPLE') {
      const index = newFilesData.findIndex((element) =>
        Object.prototype.hasOwnProperty.call(element, 'students')
      );
      if (index !== -1) {
        const passPolicyArray = (newFilesData as FilesDataASM)[
          index
        ].students!.data.map((item) => (item as AsmStudent).password_policy);
        passPolicyArray.shift();
        const nrOfStudentsWithPassPolicy = passPolicyArray.filter((item) => {
          return item && ['4', '6', '8', 4, 6, 8].includes(item);
        }).length;
        if (nrOfStudentsWithPassPolicy < passPolicyArray.length) {
          setShowMissPassPolicy(true);
        }
        if (nrOfStudentsWithPassPolicy === passPolicyArray.length) {
          setShowMissPassPolicy(false);
        }
        // console.log(passPolicyArray);
      } else {
        setShowMissPassPolicy(false);
      }
    }
  }, [newFilesStandard, newFiles]);

  useEffect(() => {
    setHistoryList(getHistory(organization) as HistoryFolder[]);
  }, [organization]);

  const checkIfOk = () => {
    const files = newFilesData.map((data) =>
      Object.keys(data)[0].toLowerCase()
    );
    const filesStandard = areArraysEqualSets(files, allowedFileNamesASMNoExt)
      ? 'APPLE'
      : areArraysEqualSets(files, allowedFileNamesMSNoExt) && 'MS';
    if (filesStandard === 'APPLE' || filesStandard === 'MS') {
      setNewFilesOk(true);
      localStorage.setItem('newFilesOk', JSON.stringify(true));
      setNewFilesStandard(filesStandard);
      localStorage.setItem('newFilesStandard', JSON.stringify(filesStandard));
    } else {
      setNewFilesOk(false);
      setNewFilesStandard(null);
      localStorage.setItem('newFilesOk', JSON.stringify(false));
      localStorage.setItem('newFilesStandard', JSON.stringify(false));
    }
  };

  useEffect(() => {
    checkIfOk();
    if (historyList.length > 0 && oldFiles === null) {
      const value = {
        label: historyList[0].dateString,
        value: historyList[0].folderName,
      };
      setOldFiles(value);
      localStorage.setItem('oldFiles', JSON.stringify(value));
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    if (oldFiles) {
      const relativePath = path.join(
        organization.folderName,
        oldFiles.value as string
      );
      const dir = getFileNamesFromDir(relativePath);
      if (dir.filesStandard !== 'APPLE') {
        const validationResult = validateFileList(dir.names);
        displayErros(
          validationResult.wrongFiles as FileWithError[],
          undefined,
          <Alert
            showIcon
            type="warning"
            message="Pliki wybranej wysyłki historycznej są niepoprawne. Możesz kontynuować
          wysyłkę, ale nie mogą one zostać użyte do porównania."
          />
        );
        setOldFilesData(undefined);
        localStorage.removeItem('oldFilesData');
      } else {
        clearDbHistorical()
          // .then(() => {
          //   return db('locations')
          //     .select()
          //     .then((result) => {
          //       console.log(result);
          //       return false;
          //     })
          //     .catch((err: any) => console.error(err));
          // })
          .then(() => getFilesFromDir(relativePath))
          .then((result) => validateFileListData(result))
          .then((data) => {
            const invalidFiles = data.filter((item) => {
              return item.result.inValidMessages.length > 0;
            });
            if (invalidFiles.length > 0)
              displayErros(
                undefined,
                invalidFiles,
                <Alert
                  showIcon
                  type="warning"
                  message="Pliki wybranej wysyłki historycznej są niepoprawne. Możesz kontynuować
            wysyłkę, ale nie mogą one zostać użyte do porównania."
                />
              );
            if (invalidFiles.length < 1) {
              const oldData = data.map((item) => {
                return {
                  [path.parse(item.file.name).name]: item.result,
                };
              });
              const oldDataWithHistoricalFlag = oldData.map((item) => {
                const key = Object.keys(item)[0];
                item[key].data = item[key].data.map((x: any) => {
                  x.historical = 1;
                  return x;
                });
                return item;
              });
              setOldFilesData(oldDataWithHistoricalFlag);
              localStorage.setItem(
                'oldFilesData',
                JSON.stringify(oldDataWithHistoricalFlag)
              );
              return oldDataWithHistoricalFlag;
            }
            throw new Error('Incorrect historical files');
          })
          .then((oldDataWithHistoricalFlag) => {
            if (!isCancelled)
              return importData(oldDataWithHistoricalFlag, 'APPLE', true);
            return [0];
          })
          .catch((err) => console.error(err));
      }
    }
    return () => {
      isCancelled = true;
    };
  }, [oldFiles]);

  const onBeforeUpload = async (file: RcFile, fileList: RcFile[]) => {
    // TODO: wybór polityki haseł
    // TODO: zdefiniowanie domyślnego kursu typu "Klasy"
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
            {
              [path.parse(file.name).name.toLowerCase()]: validFileData.result,
            },
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
          placement: 'topRight',
          message: info.file.name,
          style: { width: '100%' },
          duration: 1.5,
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

  const onChangeOldFiles = (value: LabeledValue) => {
    localStorage.setItem('oldFiles', JSON.stringify(value));
    setOldFiles(value);
  };

  const onChangePassPolicy = (value: LabeledValue) => {
    localStorage.setItem('passPolicy', JSON.stringify(value));
    setPassPolicy(value);
  };

  const onClickNext = () => {
    setNextLoading(true);
    clearDbNew()
      .then(() => {
        // let data = newFilesData;
        // if (newFilesStandard === 'MS') {
        //   data = convertData(newFilesData as FilesDataMS);
        // }
        return importData(newFilesData, newFilesStandard);
      })
      .then(() => {
        history.push('/podglad');
        setNextLoading(false);
        return true;
      })
      .catch((err: any) => {
        setNextLoading(false);
        console.error(err);
      });
  };

  const onClickBack = () => {
    history.push('/');
  };

  const onDownloadConvertedFiles = () => {
    const convertedData = convertData(newFilesData as FilesDataMS);
    const folder = dialog
      .showOpenDialog({
        properties: ['openDirectory'],
      })
      // eslint-disable-next-line consistent-return
      .then((selection) => {
        // eslint-disable-next-line promise/always-return
        if (!selection.canceled) {
          return generateFiles(selection.filePaths[0], convertedData);
        }
      })
      .catch((err) => {
        console.error(err);
      });
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
              <p className="ant-upload-text">
                Kliknij lub upuść pliki w tym miejscu pliki{' '}
                <Text strong>CSV</Text>
              </p>
            </Dragger>
            {newFilesOk && (
              <Row style={{ padding: '24px 0px' }}>
                <Alert
                  message={
                    <>
                      Pliki zostały pomyślnie zweryfikowane.{' '}
                      {newFilesStandard === 'MS' && (
                        <>
                          <LinkAnt onClick={onDownloadConvertedFiles}>
                            Pobierz je
                          </LinkAnt>{' '}
                          jeśli chcesz je edytować lub wysłać niezależnie.
                        </>
                      )}
                    </>
                  }
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
                    {newFilesStandard === 'MS' && (
                      <Tooltip title="Pobierz przekonwertowane pliki">
                        <DownloadOutlined
                          style={{ padding: '0 12px' }}
                          onClick={onDownloadConvertedFiles}
                        />
                      </Tooltip>
                    )}
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
        {newFilesOk && showMissPassPolicy && (
          <>
            <Divider />
            <Row>
              <Text>
                2. W pliku listy uczniów, istnieją rekordy, które nie posiadają
                zdefiniowanego pola <Text code>password_policy</Text>. Jaką
                politykę chcesz zastosować?
              </Text>
            </Row>
            <Row style={{ padding: '18px 0px' }}>
              <Select
                labelInValue
                defaultValue={
                  passPolicy || {
                    label: 'Osiom lub więcej znakowe hasło alfanumeryczne',
                    value: '8',
                  }
                }
                size="large"
                style={{ width: '50%', minWidth: '400px' }}
                placeholder="Wybierz politykę haseł"
                onChange={onChangePassPolicy}
              >
                <Option
                  label="Osiom lub więcej znakowe hasło alfanumeryczne"
                  value="8"
                  key={8}
                >
                  Osiom lub więcej znakowe hasło alfanumeryczne
                </Option>
                <Option label="Szejściocyforwy kod" value="6" key={6}>
                  Szejściocyforwy kod
                </Option>
                <Option label="Czterocyforwy kod" value="4" key={4}>
                  Czterocyforwy kod
                </Option>
              </Select>
            </Row>
          </>
        )}
        <Divider />
        {newFilesOk && historyList.length > 0 && (
          <>
            <Row>
              <Text>
                {showMissPassPolicy ? '3. ' : '2. '}Wybierz historyczną wysyłkę,
                z którą chcesz porównać załadowany powyżej zestaw plików. To
                pozwoli na przegląd różnic przed wysyłką.
              </Text>
            </Row>
            <Row style={{ padding: '18px 0px' }}>
              <Select
                labelInValue
                defaultValue={
                  oldFiles ||
                  (historyList.length > 0 && {
                    label: historyList[0].dateString,
                    value: historyList[0].folderName,
                  })
                }
                size="large"
                style={{ width: '50%', minWidth: '400px' }}
                placeholder="Wybierz wysyłkę"
                onChange={onChangeOldFiles}
              >
                {historyList &&
                  historyList.map((item) => (
                    <Option
                      label={item.dateString}
                      value={item.folderName}
                      key={item.folderName}
                    >
                      {item.dateString}
                    </Option>
                  ))}
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
                // href="/wybor-plikow"
                style={{ padding: '0 24px' }}
                onClick={onClickNext}
                disabled={!newFilesOk}
                loading={nextLoading}
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
