import React, { ReactNode } from 'react';
import { Layout, Typography, ConfigProvider, Empty } from 'antd';

const { Header, Footer, Content } = Layout;

const { Text } = Typography;

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;

  const customizeRenderEmpty = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="Nie znaleziono folderów organizacji"
    />
  );

  return (
    <ConfigProvider renderEmpty={customizeRenderEmpty}>
      <Layout className="layout">
        <Header className="header" />
        <Content className="content">{children}</Content>
        <Footer className="footer">
          <Text type="secondary">Jacek Pietsch ©2020</Text>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
