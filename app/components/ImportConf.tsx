import React, { useState, useEffect } from 'react';
import {
  Radio,
  Input,
  Typography,
  Row,
  Select,
  Col,
  Checkbox,
  Divider,
} from 'antd';
import { FilesData, MsFile, MsSection } from 'files';
import { RadioChangeEvent } from 'antd/lib/radio';
import { LabeledValue } from 'antd/lib/select';
import SelectionHighlighter from 'react-highlight-selection';
import { SectionColumns, Options } from '../converter';
import parse, { removeSubstrings } from '../services/parser';
import { calculateParserFuncOptions, splitString } from '../services/utils';
import HighLighter from '../services/highlighter';
import useEffectExceptOnMount from '../hooks/useEffectExceptOnMount';

const { Text, Link: LinkAnt, Paragraph, Title } = Typography;
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
  const [classNumberStrToRemove, setClassNumberStrToRemove] = useState<string>(
    localStorage.getItem('classNumberStrToRemove') !== null &&
      JSON.parse(localStorage!.getItem('classNumberStrToRemove')!)
  );
  const [subjectNameStrToRemove, setSubjectNameStrToRemove] = useState<string>(
    localStorage.getItem('subjectNameStrToRemove') !== null &&
      JSON.parse(localStorage!.getItem('subjectNameStrToRemove')!)
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
    setClassNumberStrToRemove(valueToRemove.target.value);
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
    setSubjectNameStrToRemove(valueToRemove.target.value);
    localStorage.setItem(
      'subjectNameStrToRemove',
      JSON.stringify(valueToRemove.target.value)
    );
  };

  useEffect(() => {
    let text = (newFilesData[sectionFileIndex]?.section
      ?.data as MsSection[])?.[1]?.[classNumberColumnName];
    if (classNumberStrToRemove?.length > 0 && text !== null) {
      const arrayClassNumberStrToRemove = splitString(classNumberStrToRemove)!;
      text = removeSubstrings(text, arrayClassNumberStrToRemove);
    }
    setClassNumberPreview(text);
  }, [classNumberColumnName, classNumberStrToRemove]);

  useEffect(() => {
    let text: string | null | undefined = (newFilesData[sectionFileIndex]
      ?.section?.data as MsSection[])?.[1]?.[subjectColumnName];
    if (subjectNameStrToRemove?.length > 0 && text !== null) {
      const arraySubjectNameStrToRemove = splitString(subjectNameStrToRemove)!;
      text = removeSubstrings(text, arraySubjectNameStrToRemove);
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
        const {
          separator,
          firstWord,
          position,
          error,
        } = calculateParserFuncOptions(
          selectionClassNumber,
          classNumberPreview,
          splitString(classNumberStrToRemove),
          classNumberColumnName,
          newFilesData[sectionFileIndex].section?.data as MsSection[]
        );
        if (!error) {
          config.parsers.push({
            columnName: classNumberColumnName,
            fileName: 'section',
            parserFunc: (value) =>
              parse(value, {
                separator: separator!,
                firstWord: firstWord!,
                howManyWords: 1,
                fromRight: position === 'right',
                strToRemove: splitString(classNumberStrToRemove),
              }),
          });
        }
      }
      if (
        subjectParsReq &&
        selectionSubjectName &&
        !subjectSelectionInTheMiddle
      ) {
        const {
          separator,
          firstWord,
          position,
          error,
        } = calculateParserFuncOptions(
          selectionSubjectName,
          subjectNamePreview,
          splitString(subjectNameStrToRemove),
          subjectColumnName,
          newFilesData[sectionFileIndex].section?.data as MsSection[],
          true
        );
        if (!error) {
          config.parsers.push({
            isSubject: true,
            parserFunc: (value) =>
              parse(value, {
                separator: separator!,
                firstWord: firstWord!,
                howManyWords: 10,
                fromRight: position !== 'right',
                strToRemove: splitString(subjectNameStrToRemove),
              }),
          });
        }
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
  useEffectExceptOnMount(() => {
    setSubjectNamePreview(
      (newFilesData[sectionFileIndex]?.section?.data as MsSection[])?.[1]?.[
        subjectColumnName
      ]
    );
    setClassNumberPreview(
      (newFilesData[sectionFileIndex]?.section?.data as MsSection[])?.[1]?.[
        classNumberColumnName
      ]
    );
    setSelectionClassNumber(null);
    setSelectionSubjectName(null);
    localStorage.removeItem('selectionClassNumber');
    localStorage.removeItem('selectionSubjectName');
  }, [newFilesData]);

  return (
    <>
      <Row>
        <Col>
          <Title level={4}>Wybierz model wdrożenia</Title>
          <Radio.Group onChange={onChange} value={model} size="large">
            <Radio style={radioStyle} value={1}>
              <Text>Import standardowy - bez modyfikacji danych</Text>
            </Radio>
            <Radio style={radioStyle} value={2}>
              Konsolidacja klas - ignoruj podział na zajęcia. Zalecane w
              przypadku wdrożenia współdzielonych iPadów.
            </Radio>
            <Radio style={radioStyle} value={3}>
              Konsolidacja kursów - zalecane w przypadku wdrożenia iPadów w
              modelu 1:1.
            </Radio>
          </Radio.Group>
        </Col>
      </Row>
      {(model === 2 || model === 3) && (
        <>
          <Divider />
          <Row>
            <Col>
              <Title level={4}>
                Którego roku rozpoczyna się rok szkolny, którego dotyczy import?
              </Title>
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
          <Divider />
          <Row style={{ padding: '18px 0px 0px' }}>
            <Col>
              <Title level={4}>
                Gdzie zlokalizowany jest numer klasy np. 4a?
              </Title>
            </Col>
          </Row>
          <Row align="middle">
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
          <Divider />
          <Row style={{ padding: '18px 0px 0px' }}>
            <Col>
              <Title level={4}>Jak wykorzystać nazwę przedmiotu?</Title>
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
