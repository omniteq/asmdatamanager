import React, { useState, useEffect } from 'react';
import { Radio, Input, Typography, Row, Select, Col, Checkbox } from 'antd';
import { FilesData, MsFile, MsSection } from 'files';
import { RadioChangeEvent } from 'antd/lib/radio';
import { LabeledValue } from 'antd/lib/select';
import SelectionHighlighter from 'react-highlight-selection';
import { SectionColumns, Options } from '../converter';
import parse, { removeSubstrings } from '../services/parser';

const { Text, Link: LinkAnt, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

type Selection = {
  selection: string;
  selectionStart: number;
  selectionEnd: number;
};

export default function ImportConf(props: {
  newFilesOk: boolean;
  newFilesStandard: 'APPLE' | 'MS' | null | undefined;
  newFilesData: FilesData;
}) {
  const { newFilesOk, newFilesStandard, newFilesData } = props;
  const [model, setModel] = useState(1);
  const [subject, setSubject] = useState<LabeledValue>(
    localStorage.getItem('subject') !== null &&
      JSON.parse(localStorage!.getItem('subject')!)
  );
  const [subjectColumnName, setSubjectColumnName] = useState<SectionColumns>(
    'Section Name'
  );
  const [subjectParsReq, setSubjectParsReq] = useState(false);
  const [classNumberParsReq, setClassNumberParsReq] = useState(false);
  const [classNumberColumnName, setClassNumberColumnName] = useState<
    SectionColumns
  >('Section Name');
  const [selectionClassNumber, setSelectionClassNumber] = useState<Selection>();
  const [selectionSubjectName, setSelectionSubjectName] = useState<Selection>();
  const [classNumberPreview, setClassNumberPreview] = useState<string | null>(
    null
  );
  const [subjectNamePreview, setSubjectNamePreview] = useState<string | null>(
    null
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [classNumberStrToRemove, setClassNumberStrToRemove] = useState<
    string[]
  >();
  const [subjectNameStrToRemove, setSubjectNameStrToRemove] = useState<
    string[]
  >();

  const onChange = (e: RadioChangeEvent) => {
    setModel(e.target.value);
  };

  const onChangeYear = (yearValue: number) => {
    if (yearValue === undefined) {
      localStorage.removeItem('year');
    } else {
      localStorage.setItem('year', JSON.stringify(yearValue));
    }
    setYear(yearValue);
  };

  const onChangeSubject = (subjectValue: LabeledValue) => {
    if (subjectValue === undefined) {
      localStorage.removeItem('subject');
    } else {
      localStorage.setItem('subject', JSON.stringify(subjectValue));
    }
    setSubject(subjectValue);
  };

  const sectionFileIndex = newFilesData.findIndex((element) =>
    Object.prototype.hasOwnProperty.call(element, 'section')
  );

  const onChangeSubjectColumnName = (
    subjectColumnNameValue: SectionColumns
  ) => {
    if (subjectColumnNameValue === undefined) {
      localStorage.removeItem('subjectColumnName');
    } else {
      localStorage.setItem(
        'subjectColumnName',
        JSON.stringify(subjectColumnNameValue)
      );
    }
    setSubjectColumnName(subjectColumnNameValue);
    setSubjectNamePreview(
      (newFilesData[sectionFileIndex].section!.data as MsSection[])[1][
        subjectColumnNameValue
      ]
    );
  };

  const onChangeClassNumberColumnName = (
    classNumberColumnNameValue: SectionColumns
  ) => {
    if (classNumberColumnNameValue === undefined) {
      localStorage.removeItem('subjectColumnName');
    } else {
      localStorage.setItem(
        'classNumberColumnName',
        JSON.stringify(classNumberColumnNameValue)
      );
    }
    setClassNumberColumnName(classNumberColumnNameValue);
  };

  const onChangeClassNumberStrToRemove = (
    valueToRemove: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setClassNumberStrToRemove(valueToRemove.target.value.split('\n'));
  };

  const onChangeSubjectNameStrToRemove = (
    valueToRemove: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSubjectNameStrToRemove(valueToRemove.target.value.split('\n'));
  };

  useEffect(() => {
    let text = (newFilesData[sectionFileIndex].section!.data as MsSection[])[1][
      classNumberColumnName
    ]!;
    if (
      classNumberStrToRemove &&
      classNumberStrToRemove?.length > 0 &&
      text !== null
    ) {
      text = removeSubstrings(text, classNumberStrToRemove);
    }
    setClassNumberPreview(text);
  }, [classNumberColumnName, classNumberStrToRemove]);

  useEffect(() => {
    let text = (newFilesData[sectionFileIndex].section!.data as MsSection[])[1][
      subjectColumnName
    ]!;
    if (
      subjectNameStrToRemove &&
      subjectNameStrToRemove?.length > 0 &&
      text !== null
    ) {
      subjectNameStrToRemove.forEach((pattern) => {
        text = text.replaceAll(pattern, '').trim();
      });
    }
    setSubjectNamePreview(text);
  }, [subjectColumnName, subjectNameStrToRemove]);

  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };

  const selectionHandlerClassNumber = (selection: Selection) => {
    setSelectionClassNumber(selection);
  };

  const selectionHandlerSubjectName = (selection: Selection) => {
    setSelectionSubjectName(selection);
  };

  // clear slection state caouse we cant restore after rerender
  useEffect(() => {
    setSelectionClassNumber(undefined);
    setSelectionSubjectName(undefined);
  }, [model, subjectParsReq, classNumberParsReq]);

  useEffect(() => {
    const config: Options = {
      mergeClasses: model === 2,
      classNumberColumnName,
      classYear: year,
      singleCourse: model === 2,
      singleCourseName: 'Klasa',
      mergeCourses: model === 3,
      subjectColumnName,
      subjectDestColumnName: subject.value.toString() as
        | 'course_name'
        | 'class_number'
        | undefined,
    };

    if (classNumberParsReq || subjectParsReq) {
      config.parsers = [];
      if (classNumberParsReq && selectionClassNumber) {
        const selection = selectionClassNumber;
        const preview = classNumberPreview;
        const strToRemove = classNumberStrToRemove;
        const columnName = classNumberColumnName;
        const data = newFilesData[sectionFileIndex].section
          ?.data as MsSection[];
        let separator: string | null = null;
        let firstWord = 1;
        let position: 'left' | 'right' | 'middle' | null = null;
        if (selection?.selectionStart === 0) position = 'left';
        if (selection?.selectionEnd === preview!.length - 1) position = 'right';
        if (
          selection?.selectionStart !== 0 &&
          selection?.selectionEnd === preview!.length - 1
        )
          position = 'middle';

        // find separator
        if (position !== null) {
          switch (position) {
            case 'left':
            case 'middle':
              separator = preview![selection!.selectionEnd!];
              break;
            case 'right':
              separator = preview![selection!.selectionStart!];
              break;

            default:
              break;
          }
        }
        if (separator === null || separator === undefined) {
          throw new Error('error during separator detection');
        }

        // for middle word index find
        let rightWordsEqual = false;
        let countWordsRight: number | null | undefined = null;
        const countWordsLeft = preview
          ?.substring(0, selection.selectionEnd)
          .split(separator).length;

        const leftWordsEqual = data?.every((element) => {
          let text = element[columnName];
          if (strToRemove) {
            text = removeSubstrings(element[columnName]!, strToRemove);
          }
          return (
            text?.substring(0, selection.selectionEnd).split(separator!) ===
            countWordsLeft
          );
        });

        if (!leftWordsEqual) {
          countWordsRight = preview
            ?.substring(selection.selectionEnd, preview.length)
            .split(separator).length;

          rightWordsEqual = data?.every((element) => {
            let text = element[columnName];
            if (strToRemove) {
              text = removeSubstrings(element[columnName]!, strToRemove);
            }
            return (
              text
                ?.substring(selection.selectionEnd, preview!.length)
                .split(separator!) === countWordsRight
            );
          });
        }

        // find word index
        if (position !== null) {
          switch (position) {
            case 'left':
              firstWord = 1;
              break;
            case 'middle':
              // TODO: check in section data, from which site we have a constat number of separators
              if (leftWordsEqual)
                firstWord = countWordsLeft ? countWordsLeft + 1 : 1;
              if (rightWordsEqual)
                firstWord = countWordsRight ? countWordsRight + 1 : 1;
              break;
            case 'right':
              firstWord = 1;
              break;
            default:
              break;
          }
        }

        config.parsers.push({
          columnName,
          fileName: 'section',
          parserFunc: (value) =>
            parse(value, {
              separator: separator!,
              firstWord,
              howManyWords: 1,
              fromRight: position === 'right',
              strToRemove,
            }),
        });
      }
      if (subjectParsReq && selectionSubjectName) {
        let separator: string;
        let subjectNamePosition: 'left' | 'right' | 'middle' | null = null;
        if (selectionSubjectName?.selectionStart === 0)
          subjectNamePosition = 'left';
        if (
          selectionSubjectName?.selectionEnd ===
          subjectNamePreview!.length - 1
        )
          subjectNamePosition = 'right';
        if (
          selectionSubjectName?.selectionStart !== 0 &&
          selectionSubjectName?.selectionEnd === subjectNamePreview!.length - 1
        )
          subjectNamePosition = 'middle';

        if (subjectNamePosition !== null) {
          switch (subjectNamePosition) {
            case 'left':
            case 'middle':
              separator = subjectNamePreview![
                selectionSubjectName!.selectionEnd!
              ];
              break;
            case 'right':
              separator = classNumberPreview![
                selectionSubjectName!.selectionStart!
              ];
              break;

            default:
              break;
          }
        }
        config.parsers.push({
          isSubject: true,
          parserFunc: (value) =>
            parse(value, {
              separator,
              firstWord: 1,
              howManyWords: 10,
              fromRight: subjectNamePosition === 'right',
              strToRemove: subjectNameStrToRemove,
            }),
        });
      }
    }

    // parsers: [
    //     {
    //       columnName: classNumberColumnName,
    //       fileName: 'section',
    //       parserFunc: (value) =>
    //         parse(value, {
    //           separator: ' ',
    //           firstWord: 1,
    //         }),
    //     },
    //     {
    //       isSubject: true,
    //       parserFunc: (value) =>
    //         parse(value, {
    //           separator: ' ',
    //           firstWord: 2,
    //           howManyWords: 10,
    //           strToRemove: ['(SP14) [2019/2020]'],
    //         }),
    //     },
    //   ],
  });

  return (
    <>
      <Row>
        <Col>
          <Radio.Group onChange={onChange} value={model} size="large">
            <Radio style={radioStyle} value={1}>
              <Text>Import standardowy zgodnie ze schematem importu.</Text>
            </Radio>
            <Radio style={radioStyle} value={2}>
              Utwórz unikalne klasy np. 4a, 4b, 4c itd., powiązane ze wspólnym
              kursem o nazwie Klasa. Zalecane w przypadku iPadów
              współdzielonych.
            </Radio>
            <Radio style={radioStyle} value={3}>
              Utwórz tyle klas ile w pliku Section.csv i jeden kurs dla każdej
              klasy np. 4a, 4b, 4c. Zalecane w przypadku iPadów jeden na jeden.
            </Radio>
          </Radio.Group>
        </Col>
      </Row>
      {(model === 2 || model === 3) && (
        <>
          <Row style={{ padding: '18px 0px 0px' }}>
            <Col>
              <Text>
                Którego roku rozpoczyna się rok szkolny, które dotyczy import?
              </Text>
            </Col>
          </Row>
          <Row>
            <Select
              value={year}
              defaultValue={new Date().getFullYear()}
              size="large"
              style={{ width: '50%', minWidth: '400px' }}
              placeholder="Kolumna z nazwą przedmiotu"
              onChange={onChangeYear}
            >
              {[
                2020,
                2021,
                2022,
                2023,
                2024,
                2025,
                2026,
                2027,
                2028,
                2029,
                2030,
              ].map((element) => {
                return (
                  <Option value={element} key={element}>
                    {element}
                  </Option>
                );
              })}
            </Select>
          </Row>
          <Row style={{ padding: '18px 0px 0px' }}>
            <Col>
              <Text>Gdzie zlokalizowany jest numer klasy np. 4a?</Text>
            </Col>
          </Row>
          <Row style={{ padding: '18px 0px 0px' }} align="middle">
            <Col>
              <Select
                value={classNumberColumnName}
                defaultValue={classNumberColumnName}
                size="large"
                style={{ width: '50%', minWidth: '400px' }}
                placeholder="Kolumna z nazwą przedmiotu"
                onChange={onChangeClassNumberColumnName}
              >
                {Object.keys(
                  newFilesData[sectionFileIndex].section!.data[1]!
                ).map((name) => {
                  return (
                    <Option value={name} key={name}>
                      {name}
                    </Option>
                  );
                })}
              </Select>
            </Col>
            <Col>
              <Checkbox
                style={{ marginLeft: 18 }}
                checked={classNumberParsReq}
                onChange={(e) => {
                  setClassNumberParsReq(e.target.checked);
                  localStorage.setItem(
                    'classNumberParsReq',
                    JSON.stringify(e.target.checked)
                  );
                }}
              >
                Wymaga parsowania
              </Checkbox>
            </Col>
          </Row>
          {classNumberParsReq && (
            <>
              <Row style={{ padding: '18px 0px 0px' }}>
                <Text>Fragmenty do usunięcia, oddzielone enterem:</Text>
              </Row>
              <Row>
                <TextArea onChange={onChangeClassNumberStrToRemove} />
              </Row>
              <Row style={{ padding: '18px 0px 0px' }}>
                <Text>
                  W poniższym ciągu znaków, zaznacz numer klasy np. 4a:
                </Text>
              </Row>
              <Row>
                <Text code style={{ fontSize: '18px' }}>
                  <SelectionHighlighter
                    key={classNumberPreview}
                    text={classNumberPreview}
                    selectionHandler={selectionHandlerClassNumber}
                    customClass="selection-highlighter"
                  />
                </Text>
              </Row>
            </>
          )}
        </>
      )}
      {(model === 1 || model === 3) && (
        <>
          <Row style={{ padding: '18px 0px 0px' }}>
            <Col>
              <Text>
                Możesz wskazać lokalizację nazwy przedmiotu i wykrzystać ją dla
                lepszej organizacji klas i kursów.
              </Text>
            </Col>
          </Row>
          <Row style={{ padding: '18px 0px' }}>
            <Col>
              <Select
                allowClear
                labelInValue
                defaultValue={subject}
                size="large"
                style={{ width: '50%', minWidth: '400px' }}
                placeholder="Zastosowanie nazwy przedmiotu"
                onChange={onChangeSubject}
                optionLabelProp="label"
              >
                <Option
                  label="Wykorzystaj nazwę przedmiotu jako numer klasy."
                  value="class_number"
                  key={1}
                >
                  Wykorzystaj nazwę przedmiotu jako{' '}
                  <Text strong>numer klasy</Text>.
                </Option>
                <Option
                  label="Wykorzystaj nazwę przedmiotu jako nazwę kursu"
                  value="course_name"
                  key={2}
                >
                  Wykorzystaj nazwę przedmiotu jako{' '}
                  <Text strong>nazwę kursu</Text>
                </Option>
              </Select>
            </Col>
          </Row>

          {subject && (
            <>
              <Row>
                <Col>W której kolumnie znajduje się nazwa przedmiotu?</Col>
              </Row>
              <Row style={{ padding: '18px 0px 0px' }} align="middle">
                <Col>
                  <Select
                    value={subjectColumnName}
                    defaultValue={subjectColumnName}
                    size="large"
                    style={{ width: '50%', minWidth: '400px' }}
                    placeholder="Kolumna z nazwą przedmiotu"
                    onChange={onChangeSubjectColumnName}
                  >
                    {Object.keys(
                      newFilesData[sectionFileIndex].section!.data[1]!
                    ).map((name) => {
                      return (
                        <Option value={name} key={name}>
                          {name}
                        </Option>
                      );
                    })}
                  </Select>
                </Col>
                <Col>
                  <Checkbox
                    style={{ marginLeft: 18 }}
                    checked={subjectParsReq}
                    onChange={(e) => {
                      setSubjectParsReq(e.target.checked);
                      localStorage.setItem(
                        'subjectParsReq',
                        JSON.stringify(e.target.checked)
                      );
                    }}
                  >
                    Wymaga parsowania
                  </Checkbox>
                </Col>
              </Row>
              {subjectParsReq && (
                <>
                  <Row style={{ padding: '18px 0px 0px' }}>
                    <Text>Fragmenty do usunięcia, oddzielone enterem:</Text>
                  </Row>
                  <Row>
                    <TextArea onChange={onChangeSubjectNameStrToRemove} />
                  </Row>
                  <Row style={{ padding: '18px 0px 0px' }}>
                    <Text>
                      W poniższym ciągu znaków, zaznacz nazwę przedmiotu np.
                      wychowanie fizyczne:
                    </Text>
                  </Row>
                  <Row align="middle">
                    <Text code style={{ fontSize: '18px' }}>
                      <SelectionHighlighter
                        key={subjectNamePreview}
                        text={subjectNamePreview}
                        selectionHandler={selectionHandlerSubjectName}
                        customClass="selection-highlighter"
                      />
                    </Text>
                    {selectionSubjectName &&
                      selectionSubjectName.selectionEnd <=
                        subjectNamePreview!.length - 1 &&
                      selectionSubjectName.selectionStart !== 0 && (
                        <Text type="danger" style={{ marginLeft: '12px' }}>
                          Nazwa przedmiotu nie może być w środku ciągu. Usuń
                          stałe ciągi znaków.
                        </Text>
                      )}
                  </Row>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
