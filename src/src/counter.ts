import { add2Things } from "../components/util512/util512.ts";

export function setupCounter(element: HTMLButtonElement) {
  let counter = 0;
  const setCounter = (count: number) => {
    counter = count;
    element.innerHTML = `count is ${counter}`;
  };
  element.addEventListener("click", () => {
    setCounter(counter + add2Things(1, 1));
  });
  setCounter(0);
}
