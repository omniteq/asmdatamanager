import React from 'react';
import { Row, Typography, Modal } from 'antd';
import { useHistory } from 'react-router';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { getCurrentWindow, globalShortcut } = require('electron').remote;

const { Title, Link: LinkAnt } = Typography;

const { confirm } = Modal;

export default function Header() {
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
        'Aktualne ustawienia kreatora wysyłki zostaną wyczyszczone. Żande pliki nie zostaną usunięte.',
      onOk() {
        restart();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  return (
    <div>
      <Row justify="end">
        <ul style={{ listStyle: 'none' }}>
          <li className="topmenu__li">
            <LinkAnt onClick={showConfirm}>Zacznij od nowa</LinkAnt>
          </li>
          <li className="topmenu__li">
            <LinkAnt href="https://omniteq.pl/docs/asmdatamanager">
              Dokumentacja i wsparcie
            </LinkAnt>
          </li>
        </ul>
      </Row>
    </div>
  );
}
