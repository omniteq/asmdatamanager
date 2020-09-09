import React, { useState, useEffect } from 'react';
import { Radio, Input, Typography, Row, Select, Col, Checkbox } from 'antd';
import { FilesData, MsFile, MsSection } from 'files';
import { RadioChangeEvent } from 'antd/lib/radio';
import { LabeledValue } from 'antd/lib/select';
import SelectionHighlighter from 'react-highlight-selection';
import { SectionColumns, Options } from '../converter';
import parse, { removeSubstrings } from '../services/parser';
import { calculateParserFuncOptions } from '../services/utils';
import HighLighter from '../services/highlighter';

const { Text, Link: LinkAnt, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

type Selection = {
  selection: string;
  selectionStart: number;
  selectionEnd: number;
  first: string;
  middle: string;
  last: string;
};

export default function ImportConf(props: {
  newFilesData: FilesData;
  onConfigChange: (config: Options) => any;
  onSubjectParsReqChange: (e: boolean) => any;
  onClassNumberParsReqChange: (e: boolean) => any;
}) {
  const {
    newFilesData,
    onConfigChange,
    onSubjectParsReqChange,
    onClassNumberParsReqChange,
  } = props;
  const [model, setModel] = useState(
    localStorage.getItem('model') !== null
      ? JSON.parse(localStorage!.getItem('model')!)
      : 1
  );
  const [subject, setSubject] = useState<LabeledValue>(
    localStorage.getItem('subject') !== null &&
      JSON.parse(localStorage!.getItem('subject')!)
  );
  const [subjectColumnName, setSubjectColumnName] = useState<SectionColumns>(
    'Section Name'
  );
  const [subjectParsReq, setSubjectParsReq] = useState(
    localStorage.getItem('subjectParsReq') !== null
      ? JSON.parse(localStorage!.getItem('subjectParsReq')!)
      : false
  );
  const [classNumberParsReq, setClassNumberParsReq] = useState(
    localStorage.getItem('classNumberParsReq') !== null
      ? JSON.parse(localStorage!.getItem('classNumberParsReq')!)
      : false
  );
  const [classNumberColumnName, setClassNumberColumnName] = useState<
    SectionColumns
  >('Section Name');
  const [
    selectionClassNumber,
    setSelectionClassNumber,
  ] = useState<Selection | null>(
    localStorage.getItem('selectionClassNumber') !== null &&
      JSON.parse(localStorage!.getItem('selectionClassNumber')!)
  );
  const [
    selectionSubjectName,
    setSelectionSubjectName,
  ] = useState<Selection | null>(
    localStorage.getItem('selectionSubjectName') !== null &&
      JSON.parse(localStorage!.getItem('selectionSubjectName')!)
  );
  const sectionFileIndex = newFilesData.findIndex((element) =>
    Object.prototype.hasOwnProperty.call(element, 'section')
  );

  const [classNumberPreview, setClassNumberPreview] = useState<string | null>(
    (newFilesData[sectionFileIndex]?.section?.data as MsSection[])?.[1]?.[
      classNumberColumnName
    ]
  );
  const [subjectNamePreview, setSubjectNamePreview] = useState<string | null>(
    (newFilesData[sectionFileIndex]?.section?.data as MsSection[])?.[1]?.[
      subjectColumnName
    ]
  );
  const [year, setYear] = useState(
    localStorage.getItem('year') !== null
      ? JSON.parse(localStorage!.getItem('year')!)
      : new Date().getFullYear()
  );
  const [classNumberStrToRemove, setClassNumberStrToRemove] = useState<
    string[]
  >(
    localStorage.getItem('classNumberStrToRemove') !== null &&
      JSON.parse(localStorage!.getItem('classNumberStrToRemove')!).split('\n')
  );
  const [subjectNameStrToRemove, setSubjectNameStrToRemove] = useState<
    string[]
  >(
    localStorage.getItem('subjectNameStrToRemove') !== null &&
      JSON.parse(localStorage!.getItem('subjectNameStrToRemove')!).split('\n')
  );

  const onChange = (e: RadioChangeEvent) => {
    setModel(e.target.value);
    localStorage.setItem('model', e.target.value);
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
    setSelectionClassNumber(null);
    localStorage.removeItem('selectionClassNumber');
    setClassNumberStrToRemove(valueToRemove.target.value.split('\n'));
    localStorage.setItem(
      'classNumberStrToRemove',
      JSON.stringify(valueToRemove.target.value)
    );
  };

  const onChangeSubjectNameStrToRemove = (
    valueToRemove: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSelectionSubjectName(null);
    localStorage.removeItem('selectionSubjectName');
    setSubjectNameStrToRemove(valueToRemove.target.value.split('\n'));
    localStorage.setItem(
      'subjectNameStrToRemove',
      JSON.stringify(valueToRemove.target.value)
    );
  };

  useEffect(() => {
    let text = (newFilesData[sectionFileIndex]?.section
      ?.data as MsSection[])?.[1]?.[classNumberColumnName];
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
    let text: string | null | undefined = (newFilesData[sectionFileIndex]
      ?.section?.data as MsSection[])?.[1]?.[subjectColumnName];
    if (
      subjectNameStrToRemove &&
      subjectNameStrToRemove?.length > 0 &&
      text !== null
    ) {
      subjectNameStrToRemove.forEach((pattern) => {
        text = text?.replaceAll(pattern, '').trim();
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
    localStorage.setItem('selectionClassNumber', JSON.stringify(selection));
  };

  const selectionHandlerSubjectName = (selection: Selection) => {
    setSelectionSubjectName(selection);
    localStorage.setItem('selectionSubjectName', JSON.stringify(selection));
  };

  const subjectSelectionInTheMiddle =
    selectionSubjectName &&
    selectionSubjectName.selectionEnd <= subjectNamePreview!.length - 1 &&
    selectionSubjectName.selectionStart !== 0;

  const classNumberSelectionInTheMiddle =
    selectionClassNumber &&
    selectionClassNumber.selectionEnd <= classNumberPreview!.length - 1 &&
    selectionClassNumber.selectionStart !== 0;

  // ! we can restore from localStorage, so only highlight is missing
  // clear slection state couse we cant restore after rerender
  // useEffect(() => {
  //   setSelectionClassNumber(undefined);
  // }, [model, classNumberParsReq]);
  // useEffect(() => {
  //   setSelectionSubjectName(undefined);
  // }, [model, subjectParsReq]);

  useEffect(() => {
    const config: Options = {
      mergeClasses: model === 2,
      classNumberColumnName,
      classYear: year,
      singleCourse: model === 2,
      singleCourseName: 'Klasa',
      mergeCourses: model === 3,
      subjectColumnName,
      subjectDestColumnName:
        subject &&
        (subject.value.toString() as
          | 'course_name'
          | 'class_number'
          | undefined),
    };

    if (classNumberParsReq || subjectParsReq) {
      config.parsers = [];
      if (
        classNumberParsReq &&
        selectionClassNumber &&
        !classNumberSelectionInTheMiddle
      ) {
        const { separator, firstWord, position } = calculateParserFuncOptions(
          selectionClassNumber,
          classNumberPreview,
          classNumberStrToRemove,
          classNumberColumnName,
          newFilesData[sectionFileIndex].section?.data as MsSection[]
        );
        config.parsers.push({
          columnName: classNumberColumnName,
          fileName: 'section',
          parserFunc: (value) =>
            parse(value, {
              separator: separator!,
              firstWord,
              howManyWords: 1,
              fromRight: position === 'right',
              strToRemove: classNumberStrToRemove,
            }),
        });
      }
      if (
        subjectParsReq &&
        selectionSubjectName &&
        !subjectSelectionInTheMiddle
      ) {
        const { separator, firstWord, position } = calculateParserFuncOptions(
          selectionSubjectName,
          subjectNamePreview,
          subjectNameStrToRemove,
          subjectColumnName,
          newFilesData[sectionFileIndex].section?.data as MsSection[],
          true
        );
        config.parsers.push({
          isSubject: true,
          parserFunc: (value) =>
            parse(value, {
              separator,
              firstWord,
              howManyWords: 10,
              fromRight: position !== 'right',
              strToRemove: subjectNameStrToRemove,
            }),
        });
      }
    }

    onConfigChange(config);
  }, [
    model,
    selectionSubjectName,
    selectionClassNumber,
    subjectNamePreview,
    subjectNameStrToRemove,
    subjectColumnName,
    classNumberColumnName,
    classNumberParsReq,
    subjectParsReq,
    classNumberStrToRemove,
    classNumberPreview,
    newFilesData,
    sectionFileIndex,
    year,
    subject,
  ]);

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
                Którego roku rozpoczyna się rok szkolny, którego dotyczy import?
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
                  onClassNumberParsReqChange(e.target.checked);
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
                <TextArea
                  value={classNumberStrToRemove}
                  onChange={onChangeClassNumberStrToRemove}
                />
              </Row>
              <Row style={{ padding: '18px 0px 0px' }}>
                <Text>
                  W poniższym ciągu znaków, zaznacz numer klasy np. 4a:
                </Text>
              </Row>
              <Row align="middle">
                <Text code style={{ fontSize: '18px' }}>
                  {/* <SelectionHighlighter
                    key={classNumberPreview}
                    text={classNumberPreview}
                    selectionHandler={selectionHandlerClassNumber}
                    customClass="selection-highlighter"
                  /> */}
                  <HighLighter
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    value={
                      selectionClassNumber !== null && selectionClassNumber
                    }
                    key={classNumberPreview!}
                    text={classNumberPreview}
                    selectionHandler={selectionHandlerClassNumber}
                    customClass="selection-highlighter"
                  />
                </Text>
                {classNumberSelectionInTheMiddle && (
                  <Text type="danger" style={{ marginLeft: '12px' }}>
                    Numer klasu nie może być w środku ciągu. Usuń stałe ciągi
                    znaków.
                  </Text>
                )}
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
                      onSubjectParsReqChange(e.target.checked);
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
                    <TextArea
                      value={subjectNameStrToRemove}
                      onChange={onChangeSubjectNameStrToRemove}
                    />
                  </Row>
                  <Row style={{ padding: '18px 0px 0px' }}>
                    <Text>
                      W poniższym ciągu znaków, zaznacz nazwę przedmiotu np.
                      wychowanie fizyczne:
                    </Text>
                  </Row>
                  <Row align="middle">
                    <Text code style={{ fontSize: '18px' }}>
                      {/* <SelectionHighlighter
                        key={subjectNamePreview}
                        text={subjectNamePreview}
                        selectionHandler={selectionHandlerSubjectName}
                        customClass="selection-highlighter"
                      /> */}
                      <HighLighter
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        value={
                          selectionSubjectName !== null && selectionSubjectName
                        }
                        key={subjectNamePreview!}
                        text={subjectNamePreview}
                        selectionHandler={selectionHandlerSubjectName}
                        customClass="selection-highlighter"
                      />
                    </Text>
                    {subjectSelectionInTheMiddle && (
                      <Text type="danger" style={{ marginLeft: '12px' }}>
                        Nazwa przedmiotu nie może być w środku ciągu. Usuń stałe
                        ciągi znaków.
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
