import { readFile } from "fs/promises";
import { Computer } from "@bitcoin-computer/lib";
import pkg from "typescript";

const { transpileModule, ScriptTarget, ModuleKind } = pkg;

export const deployCounter = async (computer: Computer, path: string) => {
  const counterTS = await readFile(`${path}/../counter.ts`, "utf-8");
  const compilerOptions = {
    module: ModuleKind.ESNext,
    target: ScriptTarget.ES2015,
    useDefineForClassFields: false,
  };
  const { outputText: counterJS } = transpileModule(counterTS, {
    compilerOptions,
  });

  return computer.deploy(`
  ${counterJS}
  `);
};
