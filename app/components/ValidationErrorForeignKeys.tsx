import { Alert, Typography } from 'antd';
import React from 'react';
import { FkValidationRule } from '../services/fkValidator';

const { Title, Text, Paragraph } = Typography;

export default function ValidationErrorForeignKeys(props: any) {
  const { validateFkResult, allowToContinue } = props;
  const fileNames = Object.keys(validateFkResult);
  const list = fileNames.map((fileName) => {
    return (
      <>
        <Paragraph>
          {!allowToContinue ? (
            <Alert
              message="Klucze obce czyli wartości w kolumnach typu _id lub SIS ID
                  muszą istnieć w powiązanych plikach."
              type="error"
            />
          ) : (
            <Alert
              message="Klucze obce czyli wartości w kolumnach typu _id lub SIS ID
                  nie istnieją w powiązanych plikach. Możesz zignorować ten błąd."
              type="warning"
            />
          )}
        </Paragraph>
        <div>
          Błąd kluczy obcych w pliku: <Text strong>{fileName}</Text>
        </div>
        {validateFkResult[fileName].map(
          (
            configErrors: {
              rowNumber: number;
              config: FkValidationRule;
              row: any;
            }[],
            index: number
          ) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <ul key={`${fileName}_${index}`}>
                {configErrors.map(
                  (error: {
                    rowNumber: number;
                    config: FkValidationRule;
                    row: any;
                  }) => {
                    return (
                      <li key={error.rowNumber}>
                        Rząd: {error.rowNumber}. Wartość klucza obcego:{' '}
                        {error.row[error.config.fk]} w polu {error.config.fk},
                        nie występuje w pliku {error.config.fileName}, w
                        kolumnie {error.config.pk}
                      </li>
                    );
                  }
                )}
              </ul>
            );
          }
        )}
      </>
    );
  });
  return <>{list}</>;
}
