import React from "react";
import { ContainerScroll } from "./container-scroll-animation";

export function ScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Track your nutrition with <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                AI-Powered Analysis
              </span>
            </h1>
          </>
        }
      >
        <div className="h-full w-full bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg flex items-center justify-center">
          <img
            src="/app-icon.png"
            alt="App demonstration"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </ContainerScroll>
    </div>
  );
}