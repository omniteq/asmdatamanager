import React from 'react';
import { Steps } from 'antd';
import { useHistory } from 'react-router';

const { Step } = Steps;

export default function Progress(props: { current: number; onChange: any }) {
  const history = useHistory();
  const { current, onChange } = props;

  return (
    <Steps current={current} onChange={onChange}>
      <Step title="Wybór organizacji" onClick={(event) => history.push('/')} />
      <Step
        title="Wybór plików"
        disabled={current < 1 && true}
        onClick={(event) => current > 2 && history.push('/wybor-plikow')}
      />
      <Step
        title="Podgląd"
        disabled={current < 2 && true}
        onClick={(event) => current > 3 && history.push('/wybor-plikow')}
      />
      <Step
        title="Wysylka"
        disabled={current < 3 && true}
        onClick={(event) => current > 4 && history.push('/wybor-plikow')}
      />
      <Step title="Podsumowanie" disabled />
    </Steps>
  );
}
