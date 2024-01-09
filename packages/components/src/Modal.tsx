import { Modal as ModalClass } from 'flowbite';
import type { ModalOptions, ModalInterface } from 'flowbite';
import type { InstanceOptions } from 'flowbite';
import { useState } from 'react';

const get = (id: string) => {
  const $modalElement = document.querySelector(`#${id}`) as HTMLElement
  const modalOptions: ModalOptions = {}
  const instanceOptions: InstanceOptions = { id, override: true }
  return new ModalClass($modalElement, modalOptions, instanceOptions)
}

const ShowButton = ({ id, text }: any) => (
  <button data-modal-target={id} data-modal-show={id} type="button">
    {text}
  </button>
);

const HideButton = ({ id, text }: any) => (
  <button data-modal-target={id} data-modal-hide={id} type="button">
    {text}
  </button>
);

const ToggleButton = ({ id, text }: any) => (
  <button data-modal-target={id} data-modal-toggle={id} type="button">
    {text}
  </button>
);

const Component = ({ title, content, id }: any) => (
  <div
    id={id}
    tabIndex={-1}
    aria-hidden="true"
    className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div className="relative p-4 w-full max-w-2xl max-h-full">
      <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            data-modal-hide={id}
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        {content()}
      </div>
    </div>
  </div>
);

export const Modal = {
  get,
  ShowButton,
  HideButton,
  ToggleButton,
  Component, 
}
