import React, { useState } from 'react';
import { Row, Typography, Result, Button, Modal } from 'antd';
import { useHistory } from 'react-router';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { getCurrentWindow, globalShortcut } = require('electron').remote;

const { confirm } = Modal;

const { Text, Title, Link: LinkAnt, Paragraph } = Typography;

export default function Summary() {
  const [organization, setOrganization] = useState(
    JSON.parse(localStorage!.getItem('organization')!)
  );
  const history = useHistory();
  const restart = () => {
    localStorage.clear();
    history.push('/');
    getCurrentWindow().reload();
  };

  function showConfirm() {
    confirm({
      title: 'Wyczyścić ustawienia i rozpocząć od nowa?',
      icon: <ExclamationCircleOutlined />,
      content:
        'Aktualne ustawienia kreatora wysyłki zostaną wyczyszczone. Żande pliki nie zostaną usunięte z Twojego dysku.',
      onOk() {
        restart();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }
  return (
    <>
      <div className="main">
        <Row>
          <Title level={3}>
            Wysyłka plików w imieniu
            <span style={{ color: '#1890ff' }}> {organization?.name}</span>
          </Title>
        </Row>
        <Result
          style={{ marginTop: '48px' }}
          status="success"
          title="Pliki zostały poprawnie przesłane na serwer SFTP"
          subTitle={
            <>
              Na e-mail otrzymasz potwierdzenie przetworzenia plików przez Apple
              School Manager. Wysłane pliki zostały zarchiwizowane w folderze{' '}
              <Text strong>{localStorage.getItem('archiveFolderPath')}</Text>
            </>
          }
          extra={[
            <Button
              onClick={() => getCurrentWindow().close()}
              type="primary"
              key="console"
            >
              Zakończ
            </Button>,
            <Button onClick={showConfirm} key="restart">
              Zacznij od nowa
            </Button>,
          ]}
        />
      </div>
    </>
  );
}
