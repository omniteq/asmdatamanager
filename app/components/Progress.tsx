import React from 'react';
import { Steps } from 'antd';

const { Step } = Steps;

export default function Progress(props: { current: number; onChange: any }) {
  const { current, onChange } = props;
  return (
    <Steps current={current} onChange={onChange}>
      <Step title="Wybór organizacji" />
      <Step title="Wybór plików" />
      <Step title="Podgląd" />
      <Step title="Wysylka" />
      <Step title="Podsumowanie" />
    </Steps>
  );
}
