import React, { ReactNode } from 'react';
import { Layout, Typography, ConfigProvider, Empty } from 'antd';
import Header from '../components/Header';

const { Header: HeaderAnt, Footer, Content } = Layout;

const { Text } = Typography;

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;

  const customizeRenderEmpty = () => (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Brak danych" />
  );

  return (
    <ConfigProvider renderEmpty={customizeRenderEmpty}>
      <Layout className="layout">
        <HeaderAnt className="header">
          <Header />
        </HeaderAnt>
        <Content className="content">{children}</Content>
        <Footer className="footer">
          <Text type="secondary">Omniteq Jacek Pietsch ©2020</Text>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
