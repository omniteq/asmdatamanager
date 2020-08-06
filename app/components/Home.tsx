import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Typography, Button, Input, Divider, Row, Select } from 'antd';
import { RightOutlined, PlusOutlined } from '@ant-design/icons';
import routes from '../constants/routes.json';
import styles from './Home.css';
import Progress from './Progress';

const { Option } = Select;

const { Title, Link: LinkAnt } = Typography;

const index = 0;

export default function Home(): JSX.Element {
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [name, setName] = useState<string>();
  const history = useHistory();

  const currentOrganization = localStorage.getItem('organization');

  const onSelect = (event: any) => {
    localStorage.setItem('organization', event);
  };

  const onNameChange = (event: any) => {
    setName(event.target.value);
  };

  const addItem = () => {
    console.log('addItem');

    setOrganizations([...organizations, name || `Organizacja ${index + 1}`]);
  };

  const onClick = () => {
    history.push('/wybor-plikow');
  };

  return (
    <>
      <div className="main">
        <Row justify="center">
          <Title style={{ padding: '48px 0px 0px' }}>
            Witaj. W imieniu jakiej organizacji przesyłasz pliki?
          </Title>
        </Row>
        <Row justify="center">
          <LinkAnt href="https://omniteq.pl">
            Dokumentacja i wsparcie
            <RightOutlined />
          </LinkAnt>
        </Row>
        <Row justify="center" style={{ padding: '48px 0px' }}>
          <Select
            defaultValue={currentOrganization || ''}
            onSelect={onSelect}
            dropdownRender={(menu) => (
              <div>
                {menu}
                <Divider style={{ margin: '4px 0' }} />
                <div
                  style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}
                >
                  <Input
                    style={{ flex: 'auto' }}
                    value={name}
                    onChange={onNameChange}
                  />
                  <button
                    type="button"
                    style={{
                      flex: 'none',
                      padding: '8px',
                      display: 'block',
                      cursor: 'pointer',
                    }}
                    onClick={addItem}
                  >
                    <PlusOutlined />
                    Dodaj
                  </button>
                </div>
              </div>
            )}
            size="large"
            style={{ width: '50%', minWidth: '400px' }}
            placeholder="Wybierz organizację"
          >
            {organizations.map((item) => (
              <Option key={item}>{item}</Option>
            ))}
          </Select>
        </Row>
        <Row justify="center">
          <Button
            size="large"
            type="primary"
            href="/wybor-plikow"
            style={{ padding: '0 24px' }}
            onClick={onClick}
          >
            Przejdź do wyboru plików
          </Button>
        </Row>

        <Row
          align="bottom"
          style={{
            marginTop: 'auto',
            padding: '24px 0px',
          }}
        >
          <Progress current={0} onChange={() => 1} />
        </Row>
      </div>
    </>
  );
}
