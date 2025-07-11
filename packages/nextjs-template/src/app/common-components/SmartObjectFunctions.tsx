import { SmartObjectFunction } from './SmartObjectFunction'

export const SmartObjectFunctions = ({
  smartObject,
  functionsExist,
  options,
  setFunctionResult,
  setShow,
  setModalTitle,
}: {
  smartObject: any
  functionsExist: boolean
  options: string[]
  setFunctionResult: React.Dispatch<any>
  setShow: any
  setModalTitle: React.Dispatch<React.SetStateAction<string>>
}) => {
  if (!functionsExist) return <></>
  return (
    <>
      {Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject))
        .filter(
          (key) =>
            key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function',
        )
        .map((key, fnIndex) => (
            <div key={fnIndex}>
              <SmartObjectFunction
                funcName={key}
                smartObject={smartObject}
                functionsExist={functionsExist}
                options={options}
                setFunctionResult={setFunctionResult}
                setShow={setShow}
                setModalTitle={setModalTitle}
              ></SmartObjectFunction>
            </div>
          ))}
    </>
  )
}
