/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Typography, Button, Input, Divider, Row, Select, message } from 'antd';
import { RightOutlined, PlusOutlined } from '@ant-design/icons';
import { LabeledValue } from 'antd/lib/select';
import routes from '../constants/routes.json';
import styles from './Home.css';
import Progress from './Progress';
import initMainFolder, {
  getOrganizations,
  addOrganization,
  Organization,
} from '../services/files';

const { Option } = Select;

const { Title, Link: LinkAnt } = Typography;

const index = 0;

export default function Home(): JSX.Element {
  const [organizations, setOrganizations] = useState<Organization[]>(
    getOrganizations()
  );
  const [name, setName] = useState<string>();
  const [currentOrganization, setCurrentOrganization] = useState(
    JSON.parse(localStorage!.getItem('organization')!)
  );
  const history = useHistory();
  // const currentOrganization = JSON.parse(
  //   localStorage!.getItem('organization')!
  // );

  initMainFolder();

  const onSelect = (event: LabeledValue) => {
    const organization = {
      name: event.label,
      folderName: event.value,
    };
    setCurrentOrganization(organization);
    localStorage.setItem('organization', JSON.stringify(organization));
  };

  const onNameChange = (event: any) => {
    setName(event.target.value);
  };

  const addItem = () => {
    if (name) {
      try {
        const organization = addOrganization(name);
        setName('');
        setOrganizations([
          ...organizations,
          organization || `Organizacja ${index + 1}`,
        ]);
      } catch (error) {
        message.warning('Istnieje juz organizacja o tej samej nazwie');
      }
    }
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
          <LinkAnt href="https://omniteq.pl/docs/asmdatamanager">
            Dokumentacja i wsparcie
            <RightOutlined />
          </LinkAnt>
        </Row>
        <Row justify="center" style={{ padding: '48px 0px' }}>
          <Select
            labelInValue
            defaultValue={
              (currentOrganization && {
                label: currentOrganization.name,
                value: currentOrganization.foldername,
              }) ||
              ''
            }
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
                  <Button
                    type="primary"
                    onClick={addItem}
                    disabled={(!name || name.length < 4) && true}
                  >
                    <PlusOutlined />
                    Dodaj
                  </Button>
                </div>
              </div>
            )}
            size="large"
            style={{ width: '50%', minWidth: '400px' }}
            placeholder="Wybierz organizację"
          >
            {organizations.map((item: Organization) => (
              <Option
                label={item.name}
                value={item.folderName}
                key={item.folderName}
              >
                {item.name}
              </Option>
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
            disabled={!currentOrganization && true}
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
