import { Button, Card, Checkbox, Flex, List, Steps, Input } from "antd";

import { FC, useCallback, useState } from "react";

import { registerOnMessage } from "@/hooks/useWs";
import { api } from "@/lib/axios";

import { NotFound } from "../not-found";

interface StateProps {
  val: any;
  setVal: (v: any) => void;
}
interface StateProps2 {
  val: any;
  setVal: (v: any) => void;
  val2: any;
  setVal2: (v: any) => void;
}

interface CardComponentProps extends StateProps {
  options: any[];
}
interface SummarizeBackend {
  host: string;
  accessToken: string;
}
interface Template {
  name: string;
  prompt: string;
}

interface Model {
  name: string;
  lang: string;
  size: string;
  quant: string;
}

const convert = (l: string[], s: string[], q: string[]) => {
  const valid = [
    "tiny",
    "tiny-q5_1",
    "tiny-q8_0",
    "tiny.en",
    "tiny.en-q5_1",
    "tiny.en-q8_0",
    "base",
    "base-q5_1",
    "base-q8_0",
    "base.en",
    "base.en-q5_1",
    "base.en-q8_0",
    "small",
    "small-q5_1",
    "small-q8_0",
    "small.en",
    "small.en-q5_1",
    "small.en-q8_0",
    "small.en-tdrz",
    "medium",
    "medium-q5_0",
    "medium-q8_0",
    "medium.en",
    "medium.en-q5_0",
    "medium.en-q8_0",
    "large-v1",
    "large-v2",
    "large-v2-q5_0",
    "large-v2-q8_0",
    "large-v3",
    "large-v3-q5_0",
    "large-v3-turbo",
    "large-v3-turbo-q5_0",
    "large-v3-turbo-q8_0",
  ];

  const models: Model[] = [];

  l.forEach((lang) => {
    s.forEach((size) => {
      q.forEach((quant) => {
        const name = `${size}${lang === "en" ? `.${lang}` : ""}${quant ? `-${quant}` : ""}`;
        const m: Model = { name, lang, size, quant };
        if (valid.includes(name) && !models.includes(m)) {
          models.push(m);
        }
      });
    });
  });
  return models;
};

const CardComponent = ({ options, val, setVal }: CardComponentProps) => (
  <Checkbox.Group
    options={options}
    value={val}
    onChange={setVal}
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      userSelect: "none",
    }}
  />
);

const RemovableList = ({ val, setVal, val2, setVal2 }: StateProps2) => (
  <List
    dataSource={val}
    renderItem={(item: any) => (
      <List.Item
        actions={[
          <Button
            key="list-del"
            color="primary"
            variant="link"
            onClick={() => setVal2(item)}
            disabled={val2 === item}
          >
            default
          </Button>,
          <Button
            key="list-del"
            color="danger"
            variant="link"
            onClick={() => setVal(val.filter((v: any) => v !== item))}
          >
            delete
          </Button>,
        ]}
      >
        {typeof item === "string" ? (
          item
        ) : (
          <span>
            <strong>{item.name}</strong>: {item.prompt}
          </span>
        )}
      </List.Item>
    )}
  />
);

const SummarizeModel = ({ val, setVal }: StateProps) => (
  <Flex gap={8} align="start" vertical>
    <h1>Supports OpenAI API</h1>
    <Input
      placeholder="Host"
      value={val.host || ""}
      onChange={(e: any) => setVal({ ...val, host: e.target.value })}
    />
    <Input
      placeholder="Access Token"
      value={val.accessToken || ""}
      onChange={(e: any) => setVal({ ...val, accessToken: e.target.value })}
    />
  </Flex>
);

const Templates = ({ val, setVal, val2, setVal2 }: StateProps2) => {
  const [template, setTemplate] = useState<Template>({
    name: "",
    prompt: "",
  });
  return (
    <Flex gap={16} align="start" vertical={false}>
      <Flex gap={8} align="start" vertical style={{ width: "50%" }}>
        <h1>Templates</h1>
        <Input
          placeholder="Name"
          value={template.name || ""}
          onChange={(e: any) =>
            setTemplate({ ...template, name: e.target.value })
          }
        />
        <Input
          placeholder="Prompt"
          value={template.prompt || ""}
          onChange={(e: any) =>
            setTemplate({ ...template, prompt: e.target.value })
          }
        />
        <Button
          onClick={() => {
            setVal([...val, template]);
            setTemplate({ name: "", prompt: "" } as Template);
          }}
        >
          Add
        </Button>
      </Flex>

      <div
        style={{
          overflowY: "scroll",
          width: "50%",
          minHeight: 350,
          maxHeight: 350,
          overflowWrap: "anywhere",
          textAlign: "left",
        }}
      >
        <RemovableList
          val={val}
          setVal={setVal}
          val2={val2}
          setVal2={setVal2}
        />
      </div>
    </Flex>
  );
};

const FinishScreen = ({ val, setVal: _setVal }: StateProps) => {
  return (
    <>
      <Card
        styles={{
          body: {
            height: "100%",
            minHeight: 350,
            maxHeight: 350,
            overflowY: "auto",
            textAlign: "left",
          },
        }}
      >
        <List
          dataSource={val}
          renderItem={(item: any) => (
            <List.Item>
              <span style={{ whiteSpace: "pre-wrap" }}>{item}</span>
            </List.Item>
          )}
        />
      </Card>
    </>
  );
};

export const Setup: FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedLang, setSelectedLang] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  const [selectedQuant, setSelectedQuant] = useState<string[]>([]);
  const [selectedBackend, setSelectedBackend] = useState<SummarizeBackend>({
    host: "",
    accessToken: "",
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [backendLogs, setBackendLogs] = useState<string[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [defaultTemplate, setDefaultTemplate] = useState<Template>(
    {} as Template
  );

  const handleMessage = useCallback(
    (message: any) => {
      // console.log("handleMessage:", message);
      setBackendLogs((prev) => [message, ...prev]);
    },
    [setBackendLogs]
  );

  const options = {
    lang: [
      { label: "English", value: "en" },
      { label: "Multilingual", value: "multilingual" },
    ],
    sizes: [
      { label: "Tiny", value: "tiny" },
      { label: "Base", value: "base" },
      { label: "Small", value: "small" },
      { label: "Medium", value: "medium" },
      { label: "Large v1", value: "large-v1" },
      { label: "Large v2", value: "large-v2" },
      { label: "Large v3", value: "large-v3" },
      { label: "Large v3 Turbo", value: "large-v3-turbo" },
    ],
    quant: [
      { label: "Non-quantized", value: "" },
      { label: "5-bit", value: "q5_0" },
      { label: "5-bit (1 bit for activations)", value: "q5_1" },
      { label: "8-bit", value: "q8_0" },
      { label: "tdrz", value: "tdrz" },
    ],
  };

  const getCurrentStepComponent = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        return (
          <CardComponent
            options={options.lang}
            val={selectedLang}
            setVal={setSelectedLang}
          />
        );
      case 1:
        return (
          <CardComponent
            options={options.sizes}
            val={selectedSize}
            setVal={setSelectedSize}
          />
        );
      case 2:
        return (
          <CardComponent
            options={options.quant}
            val={selectedQuant}
            setVal={setSelectedQuant}
          />
        );
      case 3:
        return (
          <RemovableList
            val={models}
            setVal={setModels}
            val2={defaultModel}
            setVal2={setDefaultModel}
          />
        );
      case 4:
        return (
          <SummarizeModel val={selectedBackend} setVal={setSelectedBackend} />
        );
      case 5:
        return (
          <Templates
            val={templates}
            setVal={setTemplates}
            val2={defaultTemplate}
            setVal2={setDefaultTemplate}
          />
        );
      case 6:
        return <FinishScreen val={backendLogs} setVal={setBackendLogs} />;
      default:
        return <NotFound />;
    }
  };

  const finishHandler = (
    models: Model[],
    defaultModel: string,
    summarizeBackend: SummarizeBackend,
    templates: Template[],
    defaultTemplate: Template
  ) => {
    console.log("FINISHING Models:", models);
    console.log("FINISHING API:", api);
    console.log("FINISHING Templates:", templates);
    try {
      registerOnMessage(handleMessage);
      const res = api.post("/api/setup", {
        models,
        defaultModel,
        summarizeBackend,
        templates,
        defaultTemplate,
      });
      console.log("FINISHING RESPONSE:", res);
    } catch (e) {
      console.log("FINISHING ERROR:", e);
    }
  };

  return (
    <Flex gap={2} align="start" vertical>
      <Card styles={{ body: { minWidth: 1000, maxWidth: 1000 } }}>
        <Steps
          size="small"
          current={currentStep}
          items={[
            {
              title: "Language",
            },
            {
              title: "Model size",
            },
            {
              title: "Quantization",
            },
            {
              title: "Preview Models",
            },
            {
              title: "Summarizer",
            },
            {
              title: "Templates",
            },
            {
              title: "Finish",
            },
          ]}
        />
      </Card>

      <Card
        styles={{
          body: {
            height: "100%",
            minHeight: 400,
            maxHeight: 400,
            minWidth: 1000,
            maxWidth: 1000,
            overflowY: "auto",
          },
        }}
      >
        {getCurrentStepComponent(currentStep)}
      </Card>

      <Card
        styles={{
          body: {
            minWidth: 1000,
            maxWidth: 1000,
            display: "flex",
            flexDirection: "row",
            justifyContent: "end",
            gap: "1rem",
          },
        }}
      >
        <Button
          onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button
          disabled={
            (selectedLang.length === 0 && currentStep === 0) ||
            (selectedSize.length === 0 && currentStep === 1) ||
            (selectedQuant.length === 0 && currentStep === 2)
          }
          onClick={() => {
            if (currentStep === 0 && selectedLang.length === 0) {
              console.log("Please select a language");
              return;
            }

            if (currentStep === 2) {
              setModels(convert(selectedLang, selectedSize, selectedQuant));
            }

            if (currentStep === 5) {
              finishHandler(
                models,
                defaultModel,
                selectedBackend,
                templates,
                defaultTemplate
              );
            }
            setCurrentStep(Math.min(currentStep + 1, 6));
          }}
        >
          {currentStep >= 6 ? "Finish" : "Next"}
        </Button>
      </Card>
    </Flex>
  );
};
