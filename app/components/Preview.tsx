import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import diffArrays from 'diff-arrays-of-objects';
import { Row, Typography, Button, Col, Tabs, Radio, Table } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import Progress from './Progress';
import {
  getPreviewNewStudents,
  getPreviewHistoricalStudents,
  getPreviewNewClasses,
  getPreviewHistoricalClasses,
  getPreviewNewStaff,
  getPreviewHistoricalStaff,
  removeHistoricalProperty,
} from '../services/files';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const columns = [
  [
    {
      title: 'Imię',
      dataIndex: 'first_name',
    },
    {
      title: 'Nazwisko',
      dataIndex: 'last_name',
    },
    {
      title: 'Adres e-mail',
      dataIndex: 'email_address',
    },
  ],
  [
    {
      title: 'Imię',
      dataIndex: 'first_name',
    },
    {
      title: 'Nazwisko',
      dataIndex: 'last_name',
    },
    {
      title: 'Adres e-mail',
      dataIndex: 'email_address',
    },
  ],
  [
    {
      title: 'Nazwa kursu',
      dataIndex: 'course_name',
    },
    {
      title: 'Numer klasy',
      dataIndex: 'class_number',
    },
    {
      title: 'Nauczyciel',
      dataIndex: 'last_name',
      render: (text: any, record: any) =>
        `${record.first_name} ${record.last_name}`,
    },
  ],
];

function debounce(fn: { (): void; apply?: any }, ms: number) {
  let timer: NodeJS.Timeout | null;
  return (_: any) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    clearTimeout(timer !== null ? timer : undefined);
    // eslint-disable-next-line no-shadow
    timer = setTimeout((_) => {
      timer = null;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line prefer-rest-params
      fn.apply(this, arguments);
    }, ms);
  };
}

export default function Preview() {
  const history = useHistory();
  const [organization, setOrganization] = useState(
    JSON.parse(localStorage!.getItem('organization')!)
  );
  const [view, setView] = useState(localStorage!.getItem('view'));
  const [data, setData] = useState<any>();
  const [changesView, setChangesView] = useState('updated');
  const [currentTab, setCurrentTab] = useState('diffStudents');
  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const oldFilesString = localStorage.getItem('oldFiles');
  let label;
  if (oldFilesString) {
    label = JSON.parse(localStorage.getItem('oldFiles')!).label;
  }
  const onClickBack = () => {
    history.push('/wybor-plikow');
  };
  const onClickNext = () => {
    history.push('/dane-sftp');
  };

  const onViewChange = (e: RadioChangeEvent) => {
    localStorage.setItem('view', e.target.value);
    setView(e.target.value);
  };

  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
      console.log(window.innerHeight);
    }, 500);

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  });

  useEffect(() => {
    const newData: any[] = [];
    const historicalData: any[] = [];
    getPreviewNewStudents()
      .then((result) => {
        // console.log('new students', result);
        newData.push(removeHistoricalProperty(result));
        return getPreviewHistoricalStudents();
      })
      .then((result) => {
        // console.log('hist students', result);
        historicalData.push(removeHistoricalProperty(result));
        return getPreviewNewClasses();
      })
      .then((result) => {
        // console.log('new classes', result);
        newData.push(removeHistoricalProperty(result));
        return getPreviewHistoricalClasses();
      })
      .then((result) => {
        // console.log('hist classes', result);
        historicalData.push(removeHistoricalProperty(result));
        return getPreviewNewStaff();
      })
      .then((result) => {
        // console.log('new staff', result);
        newData.push(removeHistoricalProperty(result));
        return getPreviewHistoricalStaff();
      })
      .then((result) => {
        // console.log('hist staff', result);
        historicalData.push(removeHistoricalProperty(result));
        const diffStudents = diffArrays(
          historicalData[0],
          newData[0],
          'person_id'
        );
        const diffClasses = diffArrays(
          historicalData[1],
          newData[1],
          'class_id'
        );
        const diffStaff = diffArrays(
          historicalData[2],
          newData[2],
          'person_id'
        );
        setData({ diffStudents, diffClasses, diffStaff });
        return 'done';
      })
      .catch((err: any) => console.error(err));
  }, []);

  const onChangeChangesView = (e: RadioChangeEvent) => {
    setChangesView(e.target.value);
  };

  const getTables = (
    objectName: string,
    columnsIndex: number,
    type: string
  ) => {
    // const types = ['updated', 'removed', 'added', 'same'];
    // const components = types.map((type) => {
    return (
      <Table
        scroll={{ y: dimensions.height - 550 }}
        key={type}
        columns={columns[columnsIndex]}
        size="small"
        dataSource={data[objectName][type]}
        rowKey={(row) => {
          if (objectName === 'diffStudents' || objectName === 'diffStaff') {
            return row.person_id;
          }
          if (objectName === 'diffClasses') {
            return row.class_id;
          }
          return 'unknown';
        }}
      />
    );
    // });
    // return components;
  };

  const viewChangesRadio = () => {
    return (
      <Radio.Group
        onChange={onChangeChangesView}
        defaultValue={changesView || 'updated'}
        style={{ marginBottom: 12 }}
      >
        <Radio.Button value="updated">
          Do zmiany ({data[currentTab].updated.length})
        </Radio.Button>
        <Radio.Button value="added">
          Do dodania ({data[currentTab].added.length})
        </Radio.Button>
        <Radio.Button value="removed">
          Do usunięcia ({data[currentTab].removed.length})
        </Radio.Button>
        <Radio.Button value="same">
          Niezmienione ({data[currentTab].same.length})
        </Radio.Button>
      </Radio.Group>
    );
  };

  const onTabClick = (key: string) => {
    setCurrentTab(key);
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
        <Tabs defaultActiveKey="1" onTabClick={onTabClick}>
          <TabPane tab="Uczniowie" key="diffStudents">
            {data && (
              <>
                {viewChangesRadio()}
                {changesView === 'updated' &&
                  getTables('diffStudents', 0, 'updated')}
                {changesView === 'added' &&
                  getTables('diffStudents', 0, 'added')}
                {changesView === 'removed' &&
                  getTables('diffStudents', 0, 'removed')}
                {changesView === 'same' && getTables('diffStudents', 0, 'same')}
              </>
            )}
          </TabPane>
          <TabPane tab="Nauczyciele" key="diffStaff">
            {data && (
              <>
                {viewChangesRadio()}
                {changesView === 'updated' &&
                  getTables('diffStaff', 1, 'updated')}
                {changesView === 'added' && getTables('diffStaff', 1, 'added')}
                {changesView === 'removed' &&
                  getTables('diffStaff', 1, 'removed')}
                {changesView === 'same' && getTables('diffStaff', 1, 'same')}
              </>
            )}
          </TabPane>
          <TabPane tab="Klasy" key="diffClasses">
            {data && (
              <>
                {viewChangesRadio()}
                {changesView === 'updated' &&
                  getTables('diffClasses', 2, 'updated')}
                {changesView === 'added' &&
                  getTables('diffClasses', 2, 'added')}
                {changesView === 'removed' &&
                  getTables('diffClasses', 2, 'removed')}
                {changesView === 'same' && getTables('diffClasses', 2, 'same')}
              </>
            )}
          </TabPane>
        </Tabs>
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
                Wróć do wyboru plików
              </Button>
            </Col>
            <Col>
              <Button
                size="large"
                type="primary"
                // href="/wybor-plikow"
                style={{ padding: '0 24px' }}
                onClick={onClickNext}
                disabled={false}
              >
                Przejdź do wysyłki
              </Button>
            </Col>
          </Row>
          <Progress current={2} onChange={() => 1} />
        </Row>
      </div>
    </>
  );
}
