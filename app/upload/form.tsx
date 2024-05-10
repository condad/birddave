"use client";

import AsyncSelect from "react-select/async";

async function promiseOptions(inputValue: string): Promise<any> {
  const response = await fetch(
    `https://vl3oj3lqpf.execute-api.us-east-1.amazonaws.com/live/api/getautocomplete/${inputValue}`
  );

  const data = await response.json();

  return data.map((species: Record<string, string>) => ({ value: species.common_name, label: species.common_name }));
}

export function Form({ uploadPicture }) {
  return (
    <form
      action={uploadPicture}
      className="mx-24 bg-teal-300 shadow-md rounded pt-6 pb-8 mb-4 px-8 max-w-screen-md mx-auto">
      <label htmlFor="file" className="block text-gray-700 text-sm font-bold mb-2">
        JPG
      </label>

      <input
        name="file"
        type="file"
        accept="image/jpeg, image/jpg"
        required
        className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />

      <br />
      <label htmlFor="species" className="block text-gray-700 text-sm font-bold mb-2">
        Species
      </label>
      <AsyncSelect
        className="shadow appearance-none rounded w-full text-gray-700  focus:outline-none focus:shadow-outline"
        name="species"
        cacheOptions
        defaultOptions
        loadOptions={promiseOptions}
      />

      <br />
      <input
        type="submit"
        className="mt-5 shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
        value="Submit"
      />
    </form>
  );
}