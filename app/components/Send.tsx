import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import {
  Row,
  Typography,
  Button,
  Col,
  Form,
  Input,
  Checkbox,
  Modal,
  Alert,
} from 'antd';
import validator from 'validator';
import {
  AsmLocation,
  AsmStudent,
  AsmStaff,
  AsmCourse,
  AsmClass,
  AsmRoster,
  FilesDataASM,
} from 'files';
import path from 'path';
import Progress from './Progress';
import db from '../services/db';
import {
  removeHistoricalProperty,
  getOrganizationMetadata,
  preparePackage,
  uploadToSftp,
  archiveSendFiles,
  setOrganizationMetadata,
} from '../services/files';
import { TEMP_FOLDER_PATH } from '../services/const';
import ValidationError from './ValidationError';

const { Text, Title, Link: LinkAnt, Paragraph } = Typography;

export default function Send() {
  const history = useHistory();
  const [organization, setOrganization] = useState(
    JSON.parse(localStorage!.getItem('organization')!)
  );
  const [data, setData] = useState<FilesDataASM>();
  const [metadata, setMetadata] = useState(
    getOrganizationMetadata(organization.folderName)
  );
  const [form, setForm] = useState(
    localStorage.getItem('sftpForm') !== null
      ? JSON.parse(localStorage!.getItem('sftpForm')!)
      : {
          login: metadata.username,
          url: metadata.hostname,
          checkbox: false,
        }
  );
  const [formOk, setFormOk] = useState(false);
  const [sendInProgress, setSendInProgress] = useState(false);

  const onClickBack = () => {
    history.push('/podglad');
  };
  const onClickNext = () => {
    if (data && formOk) {
      setSendInProgress(true);
      preparePackage(data)
        .then(() => {
          return uploadToSftp(path.join(TEMP_FOLDER_PATH, 'archiwum.zip'), {
            host: form.url,
            port: 22,
            username: form.login,
            password: form.password,
          });
        })
        .then(() => {
          setSendInProgress(false);
          setOrganizationMetadata(organization.folderName, {
            hostname: form.url,
            username: form.login,
          });
          const archiveFolderPath = archiveSendFiles(organization.folderName);
          localStorage.setItem(
            'archiveFolderPath',
            JSON.stringify(archiveFolderPath)
          );
          return archiveFolderPath;
        })
        .catch((err: any) => {
          const errMsg = (
            <>
              <Paragraph>
                <Alert message={`${err.code}: ${err.message}`} type="error" />
              </Paragraph>
            </>
          );
          Modal.error({
            width: '700px',
            title: 'Błąd podczas próby przesłania plików na serwer SFTP',
            content: (
              <ValidationError mscError={errMsg} showFileFormatMsg={false} />
            ),
          });
          setSendInProgress(false);
        });
    }
    history.push('/podsumowanie');
  };

  useEffect(() => {
    if (
      validator.isEmail(form.login) &&
      validator.isFQDN(form.url) &&
      form.password &&
      form.password.length > 5 &&
      form.checkbox === true
    ) {
      setFormOk(true);
    }
  }, [form]);

  useEffect(() => {
    const template = [
      { locations: { data: [] as AsmLocation[] } },
      { students: { data: [] as AsmStudent[] } },
      { staff: { data: [] as AsmStaff[] } },
      { courses: { data: [] as AsmCourse[] } },
      { classes: { data: [] as AsmClass[] } },
      { rosters: { data: [] as AsmRoster[] } },
    ];

    db('locations')
      .select()
      .where({ historical: 0 })
      .orWhereNull('historical')
      .then((result) => {
        template[0].locations = removeHistoricalProperty(result);
        return db('students')
          .select()
          .where({ historical: 0 })
          .orWhereNull('historical');
      })
      .then((result) => {
        template[1].students = removeHistoricalProperty(result);
        return db('staff')
          .select()
          .where({ historical: 0 })
          .orWhereNull('historical');
      })
      .then((result) => {
        template[2].staff = removeHistoricalProperty(result);
        return db('courses')
          .select()
          .where({ historical: 0 })
          .orWhereNull('historical');
      })
      .then((result) => {
        template[3].courses = removeHistoricalProperty(result);
        return db('classes')
          .select()
          .where({ historical: 0 })
          .orWhereNull('historical');
      })
      .then((result) => {
        template[4].classes = removeHistoricalProperty(result);
        return db('rosters')
          .select()
          .where({ historical: 0 })
          .orWhereNull('historical');
      })
      .then((result) => {
        template[5].rosters = removeHistoricalProperty(result);
        setData(template as FilesDataASM);
        return true;
      })
      .catch((err: any) => console.error(err));
  }, []);

  return (
    <>
      <div className="main">
        <Row>
          <Title level={3}>
            Wysyłka plików w imieniu
            <span style={{ color: '#1890ff' }}> {organization?.name}</span>
          </Title>
        </Row>
        <Row style={{ marginTop: '24px' }}>
          <Text>
            Nie znasz danych dostępowych?{' '}
            <LinkAnt href="https://support.apple.com/pl-pl/HT207029#setup">
              Dowiedz się jak je uzyskać.
            </LinkAnt>
          </Text>
        </Row>
        <Row style={{ marginTop: '24px' }}>
          <Form
            layout="vertical"
            initialValues={{
              login: form.login,
              password: form.password,
              url: form.url,
              checkbox: form.checkbox,
            }}
          >
            <Form.Item
              name="login"
              required
              label="Nazwa użytkownika"
              rules={[
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (validator.isEmail(value)) {
                      return Promise.resolve();
                    }
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return Promise.reject('Login musi być adresem e-mail.');
                  },
                }),
              ]}
            >
              <Input
                // defaultValue={form.login}
                size="large"
                placeholder="*@sftp.apple.com"
                onChange={(e) => {
                  setForm({ ...form, login: e.target.value });
                  localStorage.setItem(
                    'sftpForm',
                    JSON.stringify({ ...form, login: e.target.value })
                  );
                }}
              />
            </Form.Item>
            <Form.Item name="password" required label="Hasło">
              <Input
                type="password"
                // defaultValue={form.password}
                size="large"
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  localStorage.setItem(
                    'sftpForm',
                    JSON.stringify({ ...form, password: e.target.value })
                  );
                }}
              />
            </Form.Item>
            <Form.Item
              name="url"
              required
              label="SFTP URL"
              rules={[
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (validator.isFQDN(value)) {
                      return Promise.resolve();
                    }
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return Promise.reject(
                      'Pola musi zawierać poprawną domenę.'
                    );
                  },
                }),
              ]}
            >
              <Input
                // defaultValue={form.url}
                size="large"
                placeholder="upload.appleschoolcontent.com"
                onChange={(e) => {
                  setForm({ ...form, url: e.target.value });
                  localStorage.setItem(
                    'sftpForm',
                    JSON.stringify({ ...form, url: e.target.value })
                  );
                }}
              />
            </Form.Item>
            <Form.Item>
              <Checkbox
                checked={form.checkbox}
                onChange={(e) => {
                  setForm({ ...form, checkbox: e.target.checked });
                  localStorage.setItem(
                    'sftpForm',
                    JSON.stringify({ ...form, checkbox: e.target.checked })
                  );
                }}
              />
              <span style={{ marginLeft: 8 }}>
                <Text>Rozumiem, że dane w ASM, zostaną </Text>{' '}
                <Text type="danger" strong>
                  nieodwracalnie zastąpione
                </Text>{' '}
                <Text>danymi widocznymi na widoku poglądu.</Text>
              </span>
            </Form.Item>
          </Form>
        </Row>

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
                Wróć do podglądu
              </Button>
            </Col>
            <Col>
              <Button
                size="large"
                type="primary"
                loading={sendInProgress}
                style={{ padding: '0 24px' }}
                onClick={onClickNext}
                disabled={!formOk}
              >
                Wyślij dane do Apple School Manager
              </Button>
            </Col>
          </Row>
          <Progress current={3} onChange={() => 1} />
        </Row>
      </div>
    </>
  );
}
