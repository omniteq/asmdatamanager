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
import { FilesData, MsSection } from 'files';
import { RadioChangeEvent } from 'antd/lib/radio';
import { LabeledValue } from 'antd/lib/select';
import { SectionColumns, Options } from '../converter';
import parse, { removeSubstrings } from '../services/parser';
import {
  calculateParserFuncOptions,
  splitString,
  sectionDataExists,
  getLocalStorage,
} from '../services/utils';
import HighLighter, { Selection } from '../services/highlighter';
import useEffectExceptOnMount from '../hooks/useEffectExceptOnMount';
import {
  saveImportConfig,
  Organization,
  getOrganizationMetadata,
} from '../services/files';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function ImportConf(props: {
  newFilesData: FilesData;
  onConfigChange: (config: Options) => any;
  onSubjectParsReqChange: (e: boolean) => any;
  onClassNumberParsReqChange: (e: boolean) => any;
  organization: Organization;
}) {
  const {
    newFilesData,
    onConfigChange,
    onSubjectParsReqChange,
    onClassNumberParsReqChange,
    organization,
  } = props;
  const [model, setModel] = useState<number>(
    localStorage.getItem('model') !== null
      ? JSON.parse(localStorage!.getItem('model')!)
      : 1
  );
  const [subject, setSubject] = useState<LabeledValue | undefined>(
    getLocalStorage('subject')
  );
  const [subjectColumnName, setSubjectColumnName] = useState<SectionColumns>(
    'Section Name'
  );
  const [subjectParsReq, setSubjectParsReq] = useState<boolean>(
    localStorage.getItem('subjectParsReq') !== null
      ? JSON.parse(localStorage!.getItem('subjectParsReq')!)
      : false
  );
  const [classNumberParsReq, setClassNumberParsReq] = useState<boolean>(
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
  };

  const onChangeYear = (yearValue: number) => {
    setYear(yearValue);
  };

  const onChangeSubject = (subjectValue: LabeledValue) => {
    setSubject(subjectValue);
  };

  const onChangeSubjectColumnName = (
    subjectColumnNameValue: SectionColumns
  ) => {
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
    setClassNumberColumnName(classNumberColumnNameValue);
  };

  const onChangeClassNumberStrToRemove = (
    valueToRemove: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSelectionClassNumber(null);
    setClassNumberStrToRemove(valueToRemove.target.value);
  };

  const onChangeSubjectNameStrToRemove = (
    valueToRemove: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSelectionSubjectName(null);
    setSubjectNameStrToRemove(valueToRemove.target.value);
  };

  // update local storage
  useEffectExceptOnMount(() => {
    localStorage.setItem('model', JSON.stringify(model));
    localStorage.setItem('subject', JSON.stringify(subject));
    localStorage.setItem(
      'subjectColumnName',
      JSON.stringify(subjectColumnName)
    );
    localStorage.setItem('subjectParsReq', JSON.stringify(subjectParsReq));
    localStorage.setItem(
      'classNumberParsReq',
      JSON.stringify(classNumberParsReq)
    );
    localStorage.setItem(
      'selectionClassNumber',
      JSON.stringify(selectionClassNumber)
    );
    localStorage.setItem(
      'selectionSubjectName',
      JSON.stringify(selectionSubjectName)
    );
    localStorage.setItem('year', JSON.stringify(year));
    localStorage.setItem(
      'classNumberStrToRemove',
      JSON.stringify(classNumberStrToRemove)
    );
    localStorage.setItem(
      'subjectNameStrToRemove',
      JSON.stringify(subjectNameStrToRemove)
    );

    saveImportConfig(organization.folderName, {
      model,
      subject,
      subjectColumnName,
      subjectParsReq,
      classNumberParsReq,
      selectionClassNumber,
      selectionSubjectName,
      classNumberStrToRemove,
      subjectNameStrToRemove,
    });
  }, [
    model,
    subject,
    subjectColumnName,
    subjectParsReq,
    classNumberParsReq,
    selectionClassNumber,
    selectionSubjectName,
    classNumberStrToRemove,
    subjectNameStrToRemove,
    organization,
    year,
  ]);

  // restore from metadata
  useEffect(() => {
    const { importConfig } = getOrganizationMetadata(organization.folderName);

    if (importConfig) {
      const {
        model: jsonModel,
        subject: jsonSubject,
        subjectColumnName: jsonSubjectColumnName,
        subjectParsReq: jsonSubjectParsReq,
        classNumberParsReq: jsonClassNumberParsReq,
        selectionClassNumber: jsonSelectionClassNumber,
        selectionSubjectName: jsonSelectionSubjectName,
        classNumberStrToRemove: jsonClassNumberStrToRemove,
        subjectNameStrToRemove: jsonSubjectNameStrToRemove,
      } = importConfig;
      setModel(jsonModel);
      setSubject(jsonSubject);
      setSubjectColumnName(jsonSubjectColumnName);
      setSubjectParsReq(jsonSubjectParsReq);
      setClassNumberParsReq(jsonClassNumberParsReq);
      setSelectionClassNumber(jsonSelectionClassNumber);
      setSelectionSubjectName(jsonSelectionSubjectName);
      setClassNumberStrToRemove(jsonClassNumberStrToRemove);
      setSubjectNameStrToRemove(jsonSubjectNameStrToRemove);
    }
  }, []);

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
  };

  const selectionHandlerSubjectName = (selection: Selection) => {
    setSelectionSubjectName(selection);
  };

  const subjectSelectionInTheMiddle =
    selectionSubjectName &&
    selectionSubjectName.selectionEnd <= subjectNamePreview!.length - 1 &&
    selectionSubjectName.selectionStart !== 0;

  const classNumberSelectionInTheMiddle =
    selectionClassNumber &&
    selectionClassNumber.selectionEnd <= classNumberPreview!.length - 1 &&
    selectionClassNumber.selectionStart !== 0;

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
      {(model === 2 || model === 3) && sectionDataExists(newFilesData) && (
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
                  {classNumberPreview && (
                    <HighLighter
                      value={selectionClassNumber}
                      key={classNumberPreview}
                      text={classNumberPreview}
                      selectionHandler={selectionHandlerClassNumber}
                      customClass="selection-highlighter"
                    />
                  )}
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
                defaultValue={subject !== null ? subject : undefined}
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
                      {subjectNamePreview && (
                        <HighLighter
                          value={selectionSubjectName}
                          key={subjectNamePreview}
                          text={subjectNamePreview}
                          selectionHandler={selectionHandlerSubjectName}
                          customClass="selection-highlighter"
                        />
                      )}
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
