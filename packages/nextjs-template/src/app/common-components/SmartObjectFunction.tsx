import { useContext, useMemo, useState } from "react";
import { TypeSelectionDropdown } from "./common/TypeSelectionDropdown";
import { isValidRev, sleep } from "./common/utils";
import { useUtilsComponents } from "./UtilsContext";
import { ComputerContext } from "./ComputerContext";

export const getErrorMessage = (error: any): string => {
  if (
    error?.response?.data?.error ===
    "mandatory-script-verify-flag-failed (Operation not valid with the current stack size)"
  )
    return "You are not authorized to make changes to this smart object";
  if (error?.response?.data?.error) return error?.response?.data?.error;
  return error.message ? error.message : "Error occurred";
};

const getValueForType = (type: string, stringValue: string) => {
  switch (type) {
    case "number":
      return Number(stringValue);
    case "string":
      return stringValue;
    case "boolean":
      return stringValue === "true";
    case "undefined":
      return undefined;
    case "null":
      return null;
    case "object":
      return stringValue;
    default:
      return Number(stringValue);
  }
};

export const getParameterNames = (fn: string) => {
  const match = fn.toString().match(/\(.*?\)/);
  return match
    ? match[0].replace(/[()]/gi, "").replace(/\s/gi, "").split(",")
    : [];
};

const getParameters = (params: string[], fnName: string, formState: any) =>
  params.map((param) => {
    const key = `${fnName}-${param}`;
    const paramValue = getValueForType(
      formState[`${key}--types`],
      formState[key]
    );

    if (isValidRev(paramValue)) return param;
    if (typeof paramValue === "string") return `'${paramValue}'`;
    return paramValue;
  });

export const SmartObjectFunction = ({
  smartObject,
  functionsExist,
  options,
  setFunctionResult,
  setShow,
  setModalTitle,
  funcName,
}: {
  smartObject: any;
  functionsExist: boolean;
  options: string[];
  setFunctionResult: React.Dispatch<any>;
  setShow: any;
  setModalTitle: React.Dispatch<React.SetStateAction<string>>;
  funcName: string;
}) => {
  const parameterList = getParameterNames(
    Object.getPrototypeOf(smartObject)[funcName]
  ).filter((val) => val);
  const [formState, setFormState] = useState<any>(
    Object.fromEntries(
      parameterList.flatMap((key) => [
        [`${funcName}-${key}`, ""],
        [`${funcName}-${key}--types`, ""],
      ])
    )
  );
  const { showLoader } = useUtilsComponents();
  const computer = useContext(ComputerContext);

  const handleMethodCall = async (
    event: any,
    smartObj: any,
    fnName: string,
    params: string[]
  ) => {
    event.preventDefault();
    showLoader(true);
    try {
      if (!computer) {
        return;
      }
      const revMap: any = {};

      // Create Rev Map to pass smart objects as params
      params.forEach((param) => {
        const key = `${fnName}-${param}`;
        const paramValue = getValueForType(
          formState[`${key}--types`],
          formState[key]
        );
        if (isValidRev(paramValue)) {
          revMap[param] = paramValue;
        }
      });

      const { tx } = await computer.encode({
        exp: `smartObject.${fnName}(${getParameters(params, fnName, formState)})`,
        env: { smartObject: smartObj._rev, ...revMap },
      });

      await computer.broadcast(tx!);
      await sleep(1000);
      const [rev] = await computer.query({ ids: [smartObject._id] });
      setFunctionResult({ _rev: rev });
      setModalTitle("Success");
      setShow(true);
    } catch (error: any) {
      setFunctionResult(getErrorMessage(error));
      setModalTitle("Error!");
      setShow(true);
    } finally {
      showLoader(false);
    }
  };

  const updateForm = (e: any, key: string) => {
    e.preventDefault();
    const value = { ...formState };
    value[key] = e.target.value;
    setFormState(value);
  };

  const updateTypes = (option: string, key: string) => {
    const value = { ...formState };
    value[`${key}--types`] = option;
    setFormState(value);
  };

  const capitalizeFirstLetter = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1);

  const isDisabled = useMemo(
    () =>
      Object.keys(formState).length > 0 &&
      Object.values(formState).some((value) => value === ""),
    [formState]
  );

  if (!functionsExist) return <></>;
  return (
    <>
      <div className="mt-6 mb-6" id={`function-${funcName}`}>
        <h3 className="my-2 text-xl font-bold dark:text-white">
          {capitalizeFirstLetter(funcName)}
        </h3>
        <form>
          {parameterList.map((paramName, paramIndex) => (
            <div key={paramIndex} className="mb-4">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  id={`${funcName}-${paramName}`}
                  value={formState[`${funcName}-${paramName}`] || ""}
                  onChange={(e) => updateForm(e, `${funcName}-${paramName}`)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder={paramName}
                  required
                />
                <TypeSelectionDropdown
                  id={`${funcName}${paramName}`}
                  dropdownList={options}
                  onSelectMethod={(option: string) =>
                    updateTypes(option, `${funcName}-${paramName}`)
                  }
                />
              </div>
            </div>
          ))}
          <button
            id={`${funcName}-call-function-button`}
            disabled={isDisabled}
            className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:ring-4 focus:outline-none
              ${isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"}
            `}
            onClick={(evt) =>
              handleMethodCall(evt, smartObject, funcName, parameterList)
            }
          >
            Call Function
          </button>
        </form>
      </div>
    </>
  );
};
