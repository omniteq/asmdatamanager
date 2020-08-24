import React from 'react';
import { Typography, Space, Divider } from 'antd';
import { RcFile } from 'antd/lib/upload/interface';
import { getErrorDesc } from '../services/files';

const { Text, Link: LinkAnt } = Typography;

export type FileWithError = {
  file: RcFile | string;
  validationErrors: string[];
};

export type FileWithDataValidation = {
  result: any;
  file: RcFile;
};

export default function ValidationError(props: {
  // eslint-disable-next-line react/require-default-props
  wrongFiles?: FileWithError[];
  // eslint-disable-next-line react/require-default-props
  wrongData?: FileWithDataValidation[];
  // eslint-disable-next-line react/require-default-props
  mscError?: any;
  // eslint-disable-next-line react/require-default-props
  showFileFormatMsg?: boolean;
}) {
  const { wrongFiles, wrongData, mscError, showFileFormatMsg } = props;

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <Space direction="vertical">
          {showFileFormatMsg && (
            <Text>
              Pliki muszą być zgodne z formatem{' '}
              <LinkAnt href="https://support.apple.com/pl-pl/HT207029#fillout">
                School Manager
              </LinkAnt>{' '}
              lub{' '}
              <LinkAnt href="https://docs.microsoft.com/en-us/schooldatasync/school-data-sync-format-csv-files-for-sds">
                Microsoft School Data Sync
              </LinkAnt>
              .
            </Text>
          )}
          <Text>
            <LinkAnt href="https://omniteq.pl/docs/asmdatamanager">
              Dokumentacja i wsparcie
            </LinkAnt>
          </Text>
        </Space>
      </div>

      {mscError}
      {wrongFiles &&
        wrongFiles.map((item) => {
          return (
            <div
              key={typeof item.file === 'string' ? item.file : item.file.uid}
            >
              <Divider />
              <Space direction="vertical" size="small">
                <Text strong>
                  {typeof item.file === 'string' ? item.file : item.file.name}
                </Text>
                <Text>
                  {typeof item.file === 'string' ? '' : item.file.path}
                </Text>
                <ul>
                  {item.validationErrors.map((error: string) => {
                    const errorDesc = getErrorDesc(error);
                    return (
                      <li key={error}>
                        <Text>{errorDesc}</Text>
                      </li>
                    );
                  })}
                </ul>
              </Space>
            </div>
          );
        })}
      {wrongData &&
        wrongData.map((item) => {
          return (
            <div key={item.file.uid}>
              <Divider />
              <Space direction="vertical" size="small">
                <Text strong>{item.file.name}</Text>
                <Text>{item.file.path}</Text>
                <ul>
                  {item.result.inValidMessages.map((error: string) => {
                    return (
                      <li key={error}>
                        <Text>{error}</Text>
                      </li>
                    );
                  })}
                </ul>
              </Space>
            </div>
          );
        })}
    </>
  );
}
